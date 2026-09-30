"""Realistic bank-traffic load test for the KBC Compass API.

Model (all configurable):
  population         1,000,000 customers (load_0000001 ... load_1000000)
  daily active       15%  -> 150,000 customers use the app on a given day
  peak-hour share    12% of a day's sessions happen in the busiest hour
  => peak-hour rate  population * 0.15 * 0.12 / 3600  ~= 5 sessions/second

Sessions ARRIVE at that rate (open model, Poisson) no matter how fast the server
answers - like real users - instead of a fixed pool of bots hammering in a loop.
Phases multiply the peak-hour rate (x1, x5, x10, x20, x40) to find the breaking point.

Session mix (a session = one customer opening the app and doing something):
  70% browse   status + state + customer                          (3 reads)
  20% signal   1-2 new banking events for that customer + status   (2-3 req)
   7% decide   policy check + state (+ confirm + journey if a hypothesis exists)
   3% full     reset -> all events -> policy -> confirm -> journey -> step -> passport -> adviser read

Customers are picked from the daily-active pool, so state accumulates like a real day.
Expected "business" answers (404 no state yet, 409 not confirmed) are NOT errors;
errors = timeouts, connection failures, 5xx, or any status the API should never return.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import math
import random
import time
from collections import Counter, defaultdict

import httpx

EXPECTED = {
    "status": {200}, "state": {200, 404}, "customer": {200}, "play": {200}, "policy": {200},
    "confirm": {200, 404}, "journey": {200, 404}, "reset": {200}, "step": {200, 404},
    "passport_create": {201, 409}, "passport_read": {200},
}


def pct(values, q):
    if not values:
        return 0.0
    ordered = sorted(values)
    return round(ordered[min(len(ordered) - 1, math.ceil(q * len(ordered)) - 1)], 1)


class Stats:
    def __init__(self):
        self.lat = []
        self.by_ep = defaultdict(list)
        self.codes = Counter()
        self.unexpected = Counter()
        self.sessions = Counter()
        self.dropped = 0

    def add(self, ep, ms, code):
        self.lat.append(ms)
        self.by_ep[ep].append(ms)
        self.codes[code] += 1
        if code not in EXPECTED[ep]:
            self.unexpected[f"{ep}:{code}"] += 1


async def call(client, stats, ep, method, path, body=None):
    t0 = time.perf_counter()
    try:
        r = await client.request(method, path, json=body)
        code, data = r.status_code, (r.json() if r.content else None)
    except Exception:
        code, data = 599, None
    stats.add(ep, (time.perf_counter() - t0) * 1000, code)
    return code, data


async def session(client, stats, rng, pool):
    cid = f"load_{rng.randint(1, pool):07d}"
    c = {"customerId": cid}
    kind = rng.choices(["browse", "signal", "decide", "full"], [70, 20, 7, 3])[0]
    stats.sessions[kind] += 1
    if kind == "browse":
        await call(client, stats, "status", "GET", f"/api/simulation/status?customerId={cid}")
        await call(client, stats, "state", "GET", f"/api/customers/{cid}/state")
        await call(client, stats, "customer", "GET", f"/api/customers/{cid}")
    elif kind == "signal":
        for _ in range(rng.choice([1, 2])):
            await call(client, stats, "play", "POST", "/api/simulation/play", {**c, "mode": "next"})
        await call(client, stats, "status", "GET", f"/api/simulation/status?customerId={cid}")
    elif kind == "decide":
        await call(client, stats, "policy", "POST", "/api/policy/evaluate", {**c, "stateId": "state_home", "action": "PRE_APPROVED_MORTGAGE_OFFER"})
        code, data = await call(client, stats, "state", "GET", f"/api/customers/{cid}/state")
        if code == 200 and data and data.get("state", {}).get("status") == "inferred":
            await call(client, stats, "confirm", "POST", "/api/states/state_home/confirm", c)
            await call(client, stats, "journey", "GET", f"/api/customers/{cid}/journey")
    else:
        await call(client, stats, "reset", "POST", "/api/simulation/reset", c)
        await call(client, stats, "play", "POST", "/api/simulation/play", {**c, "mode": "remaining"})
        await call(client, stats, "policy", "POST", "/api/policy/evaluate", {**c, "stateId": "state_home", "action": "PRE_APPROVED_MORTGAGE_OFFER"})
        await call(client, stats, "confirm", "POST", "/api/states/state_home/confirm", c)
        await call(client, stats, "journey", "GET", f"/api/customers/{cid}/journey")
        await call(client, stats, "step", "POST", "/api/journeys/journey_home/steps/budget/complete", c)
        code, data = await call(client, stats, "passport_create", "POST", "/api/context-passports",
                                {**c, "purpose": "kbc_live_home_exploration", "selectedFields": ["confirmedGoal", "journeyProgress"], "ttlHours": 24})
        if code == 201 and data:
            await call(client, stats, "passport_read", "GET", f"/api/context-passports/{data['passport']['id']}")


async def run_phase(client, name, rate, seconds, rng, pool, max_inflight):
    stats, tasks, inflight = Stats(), set(), 0
    sem_count = {"n": 0}

    async def tracked():
        sem_count["n"] += 1
        try:
            await session(client, stats, rng, pool)
        finally:
            sem_count["n"] -= 1

    started = time.perf_counter()
    next_at = started
    while True:
        now = time.perf_counter()
        if now - started >= seconds:
            break
        if now < next_at:
            await asyncio.sleep(min(next_at - now, 0.05))
            continue
        next_at += rng.expovariate(rate)
        if sem_count["n"] >= max_inflight:
            stats.dropped += 1  # server too slow: users would see the app hang
            continue
        t = asyncio.create_task(tracked())
        tasks.add(t)
        t.add_done_callback(tasks.discard)
    if tasks:
        await asyncio.wait(tasks, timeout=60)
    elapsed = time.perf_counter() - started
    total = len(stats.lat)
    bad = sum(stats.unexpected.values())
    offered = sum(stats.sessions.values()) + stats.dropped
    top = sorted(stats.by_ep.items(), key=lambda kv: -pct(kv[1], 0.95))[:3]
    return {
        "phase": name,
        "targetSessionsPerSec": round(rate, 2),
        "sessionsStarted": sum(stats.sessions.values()),
        "sessionsDropped": stats.dropped,
        "droppedPct": round(100 * stats.dropped / offered, 2) if offered else 0.0,
        "requests": total,
        "rps": round(total / elapsed, 1),
        "p50ms": pct(stats.lat, 0.50), "p95ms": pct(stats.lat, 0.95), "p99ms": pct(stats.lat, 0.99),
        "errorPct": round(100 * bad / total, 3) if total else 0.0,
        "errors": dict(stats.unexpected.most_common(5)),
        "slowestEndpointsP95": {ep: pct(v, 0.95) for ep, v in top},
        "sessionMix": dict(stats.sessions),
    }


async def main_async(a):
    rng = random.Random(a.seed)
    pool = max(1, int(a.population * a.daily_active))
    base_rate = a.population * a.daily_active * a.peak_share / 3600
    phases = []
    for spec in a.phases.split(","):
        mult, secs = spec.split(":")
        phases.append((f"peak x{mult}", base_rate * float(mult), float(secs)))
    print(json.dumps({"model": {"population": a.population, "dailyActive": pool, "peakHourSessionsPerSec": round(base_rate, 2),
                                "phases": [p[0] for p in phases]}}), flush=True)
    limits = httpx.Limits(max_connections=a.max_inflight, max_keepalive_connections=a.max_inflight)
    async with httpx.AsyncClient(base_url=a.base_url, limits=limits, timeout=a.timeout) as client:
        for name, rate, secs in phases:
            result = await run_phase(client, name, rate, secs, rng, pool, a.max_inflight)
            print(json.dumps(result), flush=True)
            if result["errorPct"] > 5 or result["droppedPct"] > 5:
                print(json.dumps({"stopped": f"server saturated at {name}"}), flush=True)
                break


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--base-url", default="http://127.0.0.1:8010")
    p.add_argument("--population", type=int, default=1_000_000)
    p.add_argument("--daily-active", type=float, default=0.15)
    p.add_argument("--peak-share", type=float, default=0.12)
    p.add_argument("--phases", default="1:60,5:45,10:45,20:45,40:45", help="multiplier:seconds,...")
    p.add_argument("--max-inflight", type=int, default=500)
    p.add_argument("--timeout", type=float, default=10.0)
    p.add_argument("--seed", type=int, default=42)
    asyncio.run(main_async(p.parse_args()))


if __name__ == "__main__":
    main()

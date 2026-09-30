#!/usr/bin/env python3
"""Dependency-light HTTP measurement fallback.

Locust is the canonical load tool. This script exists so a constrained
hackathon machine can still produce honest measurements when Locust cannot be
installed. It drives the same HTTP API and reports request-level latency.
"""
import argparse
import asyncio
import json
import math
import time
from collections import Counter

import httpx


def percentile(values, fraction):
    if not values:
        return 0
    ordered = sorted(values)
    return ordered[min(len(ordered) - 1, math.ceil(fraction * len(ordered)) - 1)]


async def request(client, method, path, payload=None):
    started = time.perf_counter()
    try:
        response = await client.request(method, path, json=payload)
        status = response.status_code
        data = response.json() if response.content else None
    except Exception:
        status = 599
        data = None
    return (time.perf_counter() - started) * 1000, status, data


async def worker(client, customer_id, scenario, semaphore):
    rows = []
    async with semaphore:
        if scenario == "read":
            latency, status, _ = await request(client, "GET", f"/api/customers/{customer_id}")
            rows.append((latency, status))
            return rows

        latency, status, _ = await request(
            client,
            "POST",
            "/api/simulation/reset",
            {"customerId": customer_id},
        )
        rows.append((latency, status))

        for event_id in ["evt_salary", "evt_mortgage", "evt_myhome", "evt_rent", "evt_property_doc"]:
            latency, status, _ = await request(
                client,
                "POST",
                f"/api/simulation/events/{event_id}",
                {"customerId": customer_id},
            )
            rows.append((latency, status))

        latency, status, _ = await request(client, "GET", f"/api/customers/{customer_id}/state")
        rows.append((latency, status))

        latency, status, _ = await request(
            client,
            "POST",
            "/api/policy/evaluate",
            {
                "customerId": customer_id,
                "stateId": "state_home",
                "action": "PRE_APPROVED_MORTGAGE_OFFER",
            },
        )
        rows.append((latency, status))

        if scenario == "full":
            latency, status, _ = await request(
                client,
                "POST",
                "/api/states/state_home/confirm",
                {"customerId": customer_id},
            )
            rows.append((latency, status))

            latency, status, _ = await request(
                client,
                "GET",
                f"/api/customers/{customer_id}/journey",
            )
            rows.append((latency, status))

            latency, status, _ = await request(
                client,
                "POST",
                "/api/journeys/journey_home/steps/budget/complete",
                {"customerId": customer_id},
            )
            rows.append((latency, status))

            latency, status, passport = await request(
                client,
                "POST",
                "/api/context-passports",
                {
                    "customerId": customer_id,
                    "purpose": "load_test",
                    "selectedFields": [
                        "confirmedGoal",
                        "journeyProgress",
                        "unresolvedQuestions",
                    ],
                    "ttlHours": 24,
                },
            )
            rows.append((latency, status))

            passport_id = passport.get("passport", {}).get("id") if isinstance(passport, dict) else None
            if passport_id:
                latency, status, _ = await request(
                    client,
                    "GET",
                    f"/api/context-passports/{passport_id}",
                )
                rows.append((latency, status))

    return rows


async def run(args):
    limits = httpx.Limits(
        max_connections=max(args.concurrency, 100),
        max_keepalive_connections=max(args.concurrency, 100),
    )
    semaphore = asyncio.Semaphore(args.concurrency)

    async with httpx.AsyncClient(base_url=args.base_url, limits=limits, timeout=30) as client:
        started = time.perf_counter()
        tasks = [
            worker(
                client,
                f"load_{(i % args.customer_count) + 1:07d}",
                args.scenario,
                semaphore,
            )
            for i in range(args.requests)
        ]
        nested = await asyncio.gather(*tasks)
        elapsed = time.perf_counter() - started

    flat = [item for row in nested for item in row]
    latencies = [item[0] for item in flat]
    statuses = Counter(item[1] for item in flat)
    errors = sum(count for code, count in statuses.items() if code >= 400)

    print(json.dumps({
        "scenario": args.scenario,
        "concurrency": args.concurrency,
        "workers": args.requests,
        "httpRequests": len(flat),
        "elapsedSec": round(elapsed, 3),
        "rps": round(len(flat) / elapsed, 2),
        "p50Ms": round(percentile(latencies, .50), 2),
        "p95Ms": round(percentile(latencies, .95), 2),
        "p99Ms": round(percentile(latencies, .99), 2),
        "errorRate": round(errors / len(flat), 5),
        "statuses": dict(statuses),
    }))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8000")
    parser.add_argument("--concurrency", type=int, required=True)
    parser.add_argument("--requests", type=int)
    parser.add_argument("--customer-count", type=int, default=2_000_000)
    parser.add_argument("--scenario", choices=["read", "business", "full"], default="business")
    args = parser.parse_args()
    args.requests = args.requests or args.concurrency
    asyncio.run(run(args))


if __name__ == "__main__":
    main()

# Stress Test — realistic 1,000,000-customer bank load

Complements [SCALABILITY.md](SCALABILITY.md). Same honest scope: one Uvicorn process, in-memory
`MockRepository`, synthetic `load_XXXXXXX` customers. It measures what this code does on one
machine; it is not a production capacity claim.

## Model

| Assumption | Value |
|---|---|
| Customer population | 1,000,000 (`load_0000001` … `load_1000000`, generated lazily) |
| Active per day | 15% → 150,000 |
| Share of daily sessions in the busiest hour | 12% → **~5 new sessions/second at peak** |
| Spikes tested on top | ×5, ×10, ×20, ×40 |
| Arrival model | open (Poisson): users keep arriving even if the server is slow; users that cannot be served are counted as **dropped** |

Session mix (one customer opening the app):

| Share | Session | Requests |
|---:|---|---|
| 70% | browse: status, state, customer | 3 |
| 20% | 1–2 new banking events + status | 2–3 |
| 7% | policy check + state (+ confirm + journey if a hypothesis exists) | 2–4 |
| 3% | full flow: reset → events → policy → confirm → journey → step → passport → adviser read | 8 |

Business answers (`404 STATE_NOT_FOUND` before the threshold, `409` before confirmation) are expected
and not counted as errors. Errors = timeouts, connection failures, 5xx, unexpected status codes.

## Results — 2026-09-30, Windows laptop, one Uvicorn process

Load generator ran on the same machine (shares the CPU), so numbers are conservative.

| Phase | Sessions/s | Requests/s | p50 | p95 | p99 | Errors | Dropped |
|---|---:|---:|---:|---:|---:|---:|---:|
| Peak hour ×1 | 5 | 14.2 | 3.7 ms | 7.2 ms | 10.2 ms | 0% | 0% |
| ×5 | 25 | 71.6 | 3.1 ms | 6.9 ms | 9.4 ms | 0% | 0% |
| ×10 | 50 | 152.0 | 2.9 ms | 7.2 ms | 11.0 ms | 0% | 0% |
| **×20** | **100** | **295.5** | **3.4 ms** | **9.0 ms** | **16.0 ms** | **0%** | **0%** |
| ×40 | 200 | 258.2 | 1141 ms | 5586 ms | 8677 ms | 0% | 52.8% |

- Healthy up to **20× the realistic peak hour** (~300 requests/s, p95 < 10 ms, zero errors).
- Saturates between ×20 and ×40 by **queueing, not failing**: no errors, users wait / are dropped.
- Elise's golden path (40 checks) passes on the loaded server afterwards.
- Server memory during traffic: 50 MB idle → 59 MB.

### Memory per customer (in-process, real `MockRepository` + state engine)

| Customers with full demo state | RAM | Per customer |
|---:|---:|---:|
| 1,000 | 6.2 MB | 6.3 KB |
| 10,000 | 60.8 MB | 6.2 KB |
| 50,000 | 303.9 MB | 6.2 KB |
| 100,000 | 607.6 MB | 6.2 KB |

Linear → **1,000,000 all active ≈ 5.9 GB**, **150,000 active on a peak day ≈ 0.9 GB**.
State engine throughput ≈ 19,300 events/s on one core.

## Defensible statement

> With a realistic 1-million-customer bank load, one laptop process serves 20× the peak hour at
> p95 < 10 ms with zero errors; beyond that it queues instead of failing. Holding state for the
> customers active on a peak day needs under 1 GB of RAM. Production scale still requires stateless
> workers with shared persistence (see SCALABILITY.md) and re-validation on production-like infrastructure.

## Run it (Windows, PowerShell)

Needs `backend\.venv` (see README). Each runner starts its **own** backend on port 8010
(`LOAD_TEST_CUSTOMERS` set), so a dev server on 8000 is unaffected, and stops it at the end.
Results are written to `performance\results\` (git-ignored).

```powershell
cd performance
powershell -ExecutionPolicy Bypass -File .\realistic_test.ps1          # memory + realistic traffic + demo check, ~6-8 min
powershell -ExecutionPolicy Bypass -File .\realistic_test.ps1 -Quick   # ~2 min
powershell -ExecutionPolicy Bypass -File .\stress_test.ps1             # closed-loop ladder on run_benchmark.py until p95 > 2 s or > 1% errors
```

Individual pieces (any OS, backend on 8010 with `LOAD_TEST_CUSTOMERS=1000000` for the traffic test):

```bash
backend/.venv/bin/python performance/population_memory.py --customers 100000 --target 1000000
backend/.venv/bin/python performance/realistic_load.py --base-url http://127.0.0.1:8010 --phases "1:60,5:45,10:45,20:45,40:45"
```

## Files

| File | Purpose |
|---|---|
| `performance/realistic_load.py` | open-model traffic generator with the session mix above |
| `performance/population_memory.py` | RAM per customer, extrapolated to the target population |
| `performance/realistic_test.ps1` | Windows one-command runner: memory + traffic + golden path |
| `performance/stress_test.ps1` | Windows ladder around `performance/run_benchmark.py` |

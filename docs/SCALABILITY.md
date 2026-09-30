# Scalability Validation

## Claim

KBC Compass is **not** claiming 2,000,000 simultaneous HTTP connections.

The target is a bank-scale **customer population of up to 2,000,000 customers**, with only a fraction active at the same instant. Current hackathon measurements validate representative deterministic engine/API paths on a local single-process setup; they do not prove production-bank capacity.

## Tooling

- `performance/locustfile.py` — mixed API load scenario.
- `performance/full_flow_locust.py` — complete reset → events → policy → confirm → journey → passport scenario.
- `performance/run_benchmark.py` — dependency-light HTTP fallback with bounded concurrency.
- `scripts/generate_load_data.py` — streaming synthetic customer-ID generator.
- `scripts/measure_customer_memory.py` — active-state memory estimator.
- `LOAD_TEST_CUSTOMERS` — opt-in synthetic population range.

Load customers such as `load_0000001` are generated lazily. The API does not pre-allocate two million customer objects.

## Run

Terminal 1:

```bash
cd backend
USE_MOCK_DATA=true LOAD_TEST_CUSTOMERS=2000000 uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Terminal 2:

```bash
cd backend
make perf-smoke
make perf-load
make perf-stress
```

For Locust:

```bash
pip install -r performance/requirements.txt
LOAD_TEST_CUSTOMERS=2000000 locust -f performance/locustfile.py --host http://127.0.0.1:8000
```

Use `performance/full_flow_locust.py` for the complete demo path.

## Local smoke reference

Measured on the audit container on 2026-09-30 with one Uvicorn process and in-memory mock storage, after fixing load-customer addressing and passport-ID handling.

| Scenario | Concurrency | Worker flows | HTTP requests | RPS | p50 | p95 | p99 | Error rate |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Read | 50 | 200 | 200 | 312.77 | 78.13 ms | 386.18 ms | 443.98 ms | 0% |
| Business | 25 | 50 | 400 | 450.92 | 27.19 ms | 152.25 ms | 259.10 ms | 0% |
| Full flow | 10 | 20 | 260 | 632.23 | 7.40 ms | 41.58 ms | 70.02 ms | 0% |

These numbers are a smoke reference, not a production capacity forecast.

## Current architectural limit

The hackathon `MockRepository` stores mutable state inside one Python process. Multiple independent Uvicorn/Gunicorn workers therefore do **not** share applied events, states, journeys, policy records, or passports.

This is acceptable for the deterministic demo. It is a production blocker for horizontal scaling.

## Production path

```text
load balancer
    ↓
stateless FastAPI workers
    ↓
shared persistence/cache
    ├─ current customer state
    ├─ applied events
    ├─ journeys
    ├─ consent/passports
    └─ policy/audit records
```

Partition/index durable data by customer ID. Keep hot current state separate from longer event history and cache frequently-read state where appropriate.

## Measured vs not measured

Measured locally:

- representative HTTP throughput;
- p50/p95/p99 latency;
- HTTP error rate;
- concurrent synthetic-customer addressing;
- full deterministic demo flow under bounded concurrency.

Not measured:

- production database throughput;
- multi-worker consistency;
- load balancer/network overhead;
- production auth;
- cross-region behavior;
- two million simultaneous active users;
- KBC infrastructure limits.

## Defensible statement

> KBC Compass uses deterministic, inexpensive per-customer state/policy logic and includes a load-test harness that can address a synthetic population of up to two million customer IDs without pre-allocating them. The current hackathon implementation is intentionally single-process/in-memory; production bank scale requires stateless API workers backed by shared persistence and must be validated again on production-like infrastructure.

Do not shorten this to “the current backend supports two million concurrent users.”

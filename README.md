# KBC Compass

**KBC Compass is a consent-first customer context engine that turns fragmented banking signals into temporary, explainable customer situations — then uses deterministic policy rules to decide what the bank may safely do next.**

> **Understand context first. Decide what is appropriate second. Communicate only after that.**

## Overview

Traditional digital banking is good at reacting to products and transactions. The harder problem is understanding when several weak signals together may indicate a changing customer situation — without treating that inference as fact or automatically turning it into a high-impact financial decision.

KBC Compass adds a context, consent and policy layer between raw signals and customer-facing actions.

The current hackathon MVP demonstrates one complete journey for a synthetic customer, **Elise Vermeer**, exploring a possible home purchase.

## The problem

A customer may:

- use a mortgage simulator;
- revisit a home-buying journey;
- change housing payment patterns;
- save a property-related document.

Individually, none of these signals proves intent.

A product-first system can easily react too aggressively. KBC Compass instead creates a **temporary hypothesis**, shows the evidence behind it, asks the customer to confirm or reject it, and blocks actions that should never be triggered automatically from behavioral inference.

## How it works

```text
Synthetic customer events
        ↓
Deterministic State Engine
        ↓
Temporary customer state + confidence + evidence
        ↓
Deterministic Policy / Consent Gate
        ↓
Allowed / blocked / confirmation-required action
        ↓
Customer confirmation
        ↓
Personalized Home Journey
        ↓
Scoped Context Passport
        ↓
KBC Live adviser view
```

The core separation is:

1. **Observed event** — what happened.
2. **Evidence** — what signal contributes to a possible state.
3. **Hypothesis** — a temporary state such as `possible_home_purchase`.
4. **Customer confirmation** — the customer confirms or rejects the hypothesis.
5. **Policy decision** — the system decides which actions are allowed.
6. **Scoped sharing** — only customer-approved context is passed to the adviser.

## Demo scenario

The canonical demo customer is:

```text
Elise Vermeer
customerId: elise
persona: home_purchase
```

The backend replays five synthetic events in order:

| Step | Event | Confidence |
|---|---|---:|
| 1 | Salary received | 0 |
| 2 | Mortgage simulation completed | 30 |
| 3 | Repeated MyHome visits | 45 |
| 4 | Rent pattern changed | 63 |
| 5 | Property document saved | 83 |

At **60+**, the state engine exposes a customer-facing `possible_home_purchase` hypothesis.

The intended demo flow is:

```text
Reset
→ Play next through all five events (or Play all)
→ Open “Why am I seeing this?”
→ Evaluate a pre-approved mortgage action
→ See the policy engine BLOCK it
→ Elise confirms the home-purchase goal
→ Home Journey appears
→ Complete a journey step
→ Share selected context with KBC Live
→ Open Adviser View
```

The adviser receives only the fields Elise explicitly selected. Raw transactions and the full event history are excluded.

## Safety / policy moment

The canonical risky action is:

```text
PRE_APPROVED_MORTGAGE_OFFER
```

The policy engine returns:

```json
{
  "allowed": false,
  "decision": "BLOCK",
  "policyCode": "HIGH_IMPACT_CREDIT_DECISION",
  "reason": "High-impact credit-related action cannot be derived automatically from behavioral inference."
}
```

This is intentional. Behavioral context may help decide what question to ask or what educational journey to show, but it must not automatically become a credit decision.

## Architecture

```text
┌─────────────────────────────────────────────┐
│                 Next.js UI                  │
│  Customer View · Event Simulation · Adviser │
└──────────────────────┬──────────────────────┘
                       │ /api/* via Next.js rewrite
                       ▼
┌─────────────────────────────────────────────┐
│                FastAPI Backend              │
├─────────────────────────────────────────────┤
│ API layer                                   │
│ Deterministic state engine                  │
│ Deterministic policy engine                 │
│ Journey orchestration                       │
│ Context Passport logic                      │
│ Repository abstraction                      │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│          MockRepository (hackathon)         │
│  JSON seed + mutable in-memory demo state   │
└─────────────────────────────────────────────┘
```

The frontend does **not** maintain a separate fake API implementation. It talks to the same `/api` contract used by the backend.

## Tech stack

### Frontend

- Next.js 15
- React 19
- JavaScript
- Tailwind CSS 4
- Next.js rewrites for backend proxying

### Backend

- Python
- FastAPI
- Pydantic
- Uvicorn
- in-memory repository for mutable hackathon state
- JSON seed data

### Testing / performance

- pytest
- httpx
- Locust
- custom bounded-concurrency benchmark runner

## Repository structure

```text
hackathon/
├── README.md
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── seed/
│   │       └── elise.json
│   ├── tests/
│   ├── Makefile
│   └── requirements.txt
├── frontend/
│   ├── app/
│   ├── lib/
│   ├── next.config.mjs
│   ├── package.json
│   └── pnpm-lock.yaml
├── docs/
├── performance/
└── scripts/
```

## API

Base path:

```text
/api
```

Important endpoints implemented by the current backend:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Backend health + mock mode |
| GET | `/api/customers` | List demo customers |
| GET | `/api/customers/{id}` | Fetch customer |
| POST | `/api/simulation/reset` | Reset demo state |
| POST | `/api/simulation/events/{eventId}` | Inject one predefined event |
| POST | `/api/simulation/play` | Apply remaining events |
| GET | `/api/customers/{id}/state` | Get current inferred/confirmed state |
| POST | `/api/states/{id}/confirm` | Confirm a state |
| POST | `/api/states/{id}/reject` | Reject a state |
| GET | `/api/customers/{id}/journey` | Get Home Journey |
| POST | `/api/journeys/{id}/steps/{stepId}/complete` | Complete a journey step |
| POST | `/api/policy/evaluate` | Evaluate a proposed action |
| POST | `/api/context-passports` | Create scoped adviser context |
| GET | `/api/context-passports/{id}` | Read an active passport |

Full contract: [docs/API_CONTRACT.md](docs/API_CONTRACT.md)

## Mock / demo data

The project is designed to run without:

- real KBC customer data;
- production KBC APIs;
- CRM integration;
- adviser integration;
- external AI services.

The canonical seed is:

```text
backend/app/seed/elise.json
```

It contains:

- Elise;
- five synthetic events;
- Home Journey step templates;
- unresolved questions used in the Context Passport.

Mutable demo state is stored in memory:

- applied events;
- inferred state;
- journey state;
- policy decisions;
- Context Passports.

Resetting the demo restores deterministic behavior.

## Local development

### Requirements

Recommended:

- Python 3.10+
- Node.js 20+
- pnpm

Clone the repository:

```bash
git clone https://github.com/gogolumo/hackathon.git
cd hackathon
```

If pnpm is unavailable:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

### Terminal 1 — backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
export USE_MOCK_DATA=true
python -m app.seed.validate
pytest -q
python -m uvicorn app.main:app --reload --port 8000
```

Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
$env:USE_MOCK_DATA="true"
python -m app.seed.validate
pytest -q
python -m uvicorn app.main:app --reload --port 8000
```

Backend:

```text
http://127.0.0.1:8000
```

Health check:

```text
http://127.0.0.1:8000/api/health
```

FastAPI docs:

```text
http://127.0.0.1:8000/docs
```

### Terminal 2 — frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Open:

```text
http://localhost:3000
```

## Environment variables

### Backend

`backend/.env.example` currently documents:

```text
USE_MOCK_DATA=true
```

For the demo, start the backend with `USE_MOCK_DATA=true`.

Additional optional backend environment variables supported by the code:

```text
CORS_ORIGINS
LOAD_TEST_CUSTOMERS
```

### Frontend

By default, the frontend proxies `/api/*` to:

```text
http://127.0.0.1:8000
```

Override it with:

```bash
BACKEND_URL=http://127.0.0.1:8001 pnpm dev
```

## Frontend ↔ backend integration

Browser code calls relative routes such as:

```text
/api/customers
/api/simulation/events/...
/api/policy/evaluate
/api/context-passports
```

Next.js rewrites those requests server-side to FastAPI:

```text
Browser
  ↓
http://localhost:3000/api/*
  ↓
Next.js rewrite
  ↓
http://127.0.0.1:8000/api/*
```

Default local setup:

```text
Frontend:  http://localhost:3000
Backend:   http://127.0.0.1:8000
Proxy:     /api/* → http://127.0.0.1:8000/api/*
```

This keeps the browser on one origin during normal development.

## Testing

### Backend tests

```bash
cd backend
USE_MOCK_DATA=true pytest -q
```

or:

```bash
cd backend
make test
```

Backend tests cover the demo flow, guardrails and load-support behavior.

### Frontend

Available package scripts:

```bash
cd frontend
pnpm test
pnpm build
```

## Deterministic decisioning

The critical state and policy logic is deterministic.

For the same ordered event inputs:

```text
same events
→ same evidence
→ same confidence
→ same state
→ same policy result
```

The current confidence score is a rule score, **not a probability**.

The state engine uses explicit event weights:

```text
mortgage_simulation_completed  +30
myhome_repeated_visits         +15
rent_pattern_changed           +18
property_document_saved        +20
                              ----
                               83
```

The customer-facing hypothesis activates at 60.

The policy engine uses explicit allow/block rules and defaults unknown actions to blocked.

No LLM participates in state inference, credit decisions or policy enforcement in the current implementation. The product documentation only reserves optional AI usage for wording or summaries.

## Scalability

The scalability target is a **bank-scale customer population of up to approximately 2,000,000 customers**.

That does **not** mean two million simultaneous HTTP connections.

The repository includes:

- `performance/locustfile.py`
- `performance/full_flow_locust.py`
- `performance/run_benchmark.py`
- `scripts/generate_load_data.py`
- `scripts/measure_customer_memory.py`

Synthetic load IDs are generated/addressed lazily rather than pre-allocating two million customer objects.

### Run local load support

Backend:

```bash
cd backend
USE_MOCK_DATA=true LOAD_TEST_CUSTOMERS=2000000 \
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Benchmark commands:

```bash
cd backend
make perf-smoke
make perf-load
make perf-stress
```

Locust:

```bash
pip install -r performance/requirements.txt
LOAD_TEST_CUSTOMERS=2000000 \
locust -f performance/locustfile.py --host http://127.0.0.1:8000
```

### Recorded local smoke reference

The repository documents measurements from **2026-09-30** on a single Uvicorn process with in-memory mock storage:

| Scenario | Concurrency | HTTP requests | RPS | p50 | p95 | p99 | Error rate |
|---|---:|---:|---:|---:|---:|---:|---:|
| Read | 50 | 200 | 312.77 | 78.13 ms | 386.18 ms | 443.98 ms | 0% |
| Business | 25 | 400 | 450.92 | 27.19 ms | 152.25 ms | 259.10 ms | 0% |
| Full flow | 10 | 260 | 632.23 | 7.40 ms | 41.58 ms | 70.02 ms | 0% |

These are hackathon smoke measurements, **not a production capacity forecast**.

### Current scalability limit

The current `MockRepository` stores mutable state inside one Python process.

Multiple independent API workers therefore do not share:

- applied events;
- states;
- journeys;
- policy records;
- Context Passports.

That is acceptable for the hackathon demo, but it prevents real horizontal scaling.

A production path would require stateless API workers backed by shared persistence/cache.

See [docs/SCALABILITY.md](docs/SCALABILITY.md).

## Hackathon scope

This repository is a prototype, not a production banking system.

Current boundaries:

- synthetic customer data only;
- one canonical product scenario;
- deterministic rule-based state inference;
- prototype policy rules;
- in-memory mutable state;
- no production authentication/authorization layer;
- no real KBC infrastructure integration;
- no credit approval or underwriting;
- no production-grade persistence;
- no claim of two million simultaneous users;
- no dependency on an external LLM for the demo.

## Documentation

- [Product](docs/PRODUCT.md)
- [MVP Scope](docs/MVP.md)
- [90-second Demo Story](docs/DEMO_STORY.md)
- [Architecture](docs/ARCHITECTURE.md)
- [State Engine](docs/STATE_ENGINE.md)
- [Policy Engine](docs/POLICY_ENGINE.md)
- [Data Model](docs/DATA_MODEL.md)
- [API Contract](docs/API_CONTRACT.md)
- [Frontend Spec](docs/FRONTEND_SPEC.md)
- [Backend Spec](docs/BACKEND_SPEC.md)
- [Mock Data](docs/MOCK_DATA.md)
- [AI Usage](docs/AI_USAGE.md)
- [Privacy & Safety](docs/PRIVACY_AND_SAFETY.md)
- [Scalability](docs/SCALABILITY.md)
- [Development Plan](docs/DEVELOPMENT_PLAN.md)
- [Decision Log](docs/DECISIONS.md)

Legacy concept documents such as `KBC_MOMENTOS.md` and `PROJECT_CONTEXT.md` remain in the repository for history. The working code, this README and the current `docs/` directory define the active MVP.

## Team

- **Bogdan — Product Lead / Orchestrator**  
  MVP scope, product decisions, testing, demo flow, pitch and integration coordination.

- **Benjamin — Tech Lead / Backend**  
  FastAPI, architecture, state engine, policy engine, API, mock repository, performance work and backend deployment.

- **Vlad — Frontend / UX**  
  Customer/adviser experience, UI/UX, event visualization, journey flow and backend integration.

## Future development

The next production-oriented steps are:

- replace in-memory mutable state with shared persistence;
- make API workers stateless and horizontally scalable;
- connect approved production data/event sources;
- introduce configurable policy rules and audit tooling;
- add production authentication, authorization and observability;
- validate performance on production-like infrastructure.

---

**Demo thesis:** KBC Compass turns weak signals into an explainable hypothesis, blocks unsafe automation, asks the customer to confirm the goal, and only then turns that context into useful action.

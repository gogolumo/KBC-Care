# KBC Compass

**KBC Compass is a consent-first Customer State Engine that turns fragmented signals into temporary, explainable customer situations and orchestrates helpful next steps after customer confirmation.**

> Product thesis: **KBC Compass helps KBC understand situations, not just transactions.**

## Problem

KBC already has strong digital channels, Kate, proactive personalization and domain journeys such as MyHome. The opportunity is not another assistant. The opportunity is a proposed layer that can connect signals distributed across products and channels into a shared, temporary, customer-visible state.

We do **not** claim KBC currently lacks internal customer understanding. Public research does not establish that. Compass is positioned as an additive state, consent and explainability layer.

## Solution

```text
Mortgage simulator
        +
MyHome activity
        +
Rent pattern change
        +
Property document
        ↓
KBC Compass
        ↓
Possible Home Purchase
Confidence: 83%
        ↓
Customer confirmation
        ↓
Personalized Home Journey
        ↓
Context Passport
        ↓
KBC Live Adviser
```

The core loop is:

**Customer State + Evidence + Consent + Policy + Journey Orchestration**

## Core value proposition

Compass separates five things that should never be conflated:

1. **Observed event** — what happened.
2. **Derived evidence** — what the event may indicate.
3. **Hypothesis** — a temporary state such as `Possible Home Purchase`.
4. **Customer confirmation** — the customer becomes the authority on their goal.
5. **Permitted action** — policy decides what the system may do next.

## MVP scope

One end-to-end scenario: **Elise — Home Purchase Journey**.

Must work:
- synthetic event playback;
- deterministic multi-signal confidence;
- visible evidence and freshness;
- policy engine visibly blocking an unsafe mortgage action;
- confirm / reject controls;
- dynamic Home Journey after confirmation;
- customer-approved Context Passport;
- adviser view that receives selected context, not raw transactions.

See [docs/MVP.md](docs/MVP.md).

## Deliberately not building

- real KBC APIs or customer data;
- universal life-event detection;
- production ML;
- credit approval, scoring or underwriting;
- another Kate/chatbot;
- a mortgage calculator;
- a generic recommendation engine;
- a full CRM/adviser integration.

## Architecture

```text
Synthetic Events
      ↓
State Engine (deterministic)
      ↓
Customer State + Evidence + Expiry
      ↓
Policy / Consent Gate (deterministic)
      ↓
Journey Orchestrator
      ↓
Customer UI ── Context Passport ── Adviser UI
      └──────── optional LLM wording/summaries only
```

Full diagram: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Tech stack

- **Frontend:** Next.js + React + Tailwind.
- **Backend:** FastAPI, one monolithic app.
- **Persistence:** start in-memory/JSON for deterministic demo replay; add SQLite/Postgres only if persistence becomes necessary.
- **AI:** optional hosted LLM for explanations/summaries only.
- **Data:** synthetic only.

## Documentation

- [Product](docs/PRODUCT.md)
- [MVP Scope](docs/MVP.md)
- [User Flow](docs/USER_FLOW.md)
- [90s Demo](docs/DEMO_STORY.md)
- [Architecture](docs/ARCHITECTURE.md)
- [State Engine](docs/STATE_ENGINE.md)
- [Policy Engine](docs/POLICY_ENGINE.md)
- [Data Model](docs/DATA_MODEL.md)
- [API Contract](docs/API_CONTRACT.md)
- [Frontend Spec](docs/FRONTEND_SPEC.md)
- [Backend Spec](docs/BACKEND_SPEC.md)
- [AI Usage](docs/AI_USAGE.md)
- [Privacy & Safety](docs/PRIVACY_AND_SAFETY.md)
- [Development Plan](docs/DEVELOPMENT_PLAN.md)
- [Decision Log](docs/DECISIONS.md)
- [Mock Data](docs/MOCK_DATA.md)
- [Scalability](docs/SCALABILITY.md)
- Source research: [preplexity research.md](preplexity%20research.md)

Legacy concept docs (`KBC_MOMENTOS.md`, `PROJECT_CONTEXT.md`) remain for history, but this README + `docs/` define the current product scope.

## Repository structure

```text
/
├── README.md
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── seed/elise.json
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
└── performance/
```

## Running locally

### Requirements

- Python 3.10+ recommended
- Node.js 20+ recommended
- pnpm

If pnpm is not installed:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

### Terminal 1 — Backend

From the repository root:

```bash
cd backend
python -m venv .venv
```

macOS / Linux:

```bash
source .venv/bin/activate
```

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies, validate demo data, run tests, then start FastAPI:

```bash
python -m pip install -r requirements.txt
export USE_MOCK_DATA=true
python -m app.seed.validate
pytest -q
python -m uvicorn app.main:app --reload --port 8000
```

On Windows PowerShell use:

```powershell
$env:USE_MOCK_DATA="true"
python -m app.seed.validate
pytest -q
python -m uvicorn app.main:app --reload --port 8000
```

Backend health check:

```text
http://127.0.0.1:8000/api/health
```

FastAPI docs:

```text
http://127.0.0.1:8000/docs
```

### Terminal 2 — Frontend

From the repository root:

```bash
cd frontend
pnpm install
pnpm dev
```

Open:

```text
http://localhost:3000
```

The frontend calls relative `/api` URLs. Next.js rewrites those requests to FastAPI. By default:

```text
Frontend:    http://localhost:3000
Backend:     http://127.0.0.1:8000
API proxy:   /api/* → http://127.0.0.1:8000/api/*
```

If the backend runs somewhere else, set `BACKEND_URL` before starting Next.js:

macOS / Linux:

```bash
BACKEND_URL=http://127.0.0.1:8001 pnpm dev
```

Windows PowerShell:

```powershell
$env:BACKEND_URL="http://127.0.0.1:8001"
pnpm dev
```

### Demo flow

Use this order for the canonical Elise demo:

```text
Reset
→ Play next through all five events (or Play all)
→ Why am I seeing this?
→ Evaluate proposed action
→ Yes, help me explore
→ Complete the budget step
→ Share with KBC Live
→ Adviser view
```

Expected confidence progression:

```text
0 → 30 → 45 → 63 → 83
```

The customer-facing state appears after the 60-point activation threshold.

### Troubleshooting

**Port 8000 already in use**

Run FastAPI on another port:

```bash
python -m uvicorn app.main:app --reload --port 8001
```

Then start the frontend with:

```bash
BACKEND_URL=http://127.0.0.1:8001 pnpm dev
```

**Port 3000 already in use**

Stop the existing process using port 3000 before starting the demo. The repository's frontend script intentionally uses port 3000.

**Frontend shows API errors**

Verify FastAPI first:

```bash
curl http://127.0.0.1:8000/api/health
```

Expected shape:

```json
{"ok":true,"mockMode":true}
```

Then verify that `BACKEND_URL` has no incorrect host or port.

**CORS**

Normal local development uses the Next.js rewrite, so browser requests stay on `localhost:3000` and are proxied server-side to FastAPI. FastAPI also permits `http://localhost:3000` and `http://127.0.0.1:3000` by default.

## Team

- **Bogdan — Product Lead / Orchestrator:** scope, synthetic scenario, testing, demo, pitch, integration coordination.
- **Benjamin — Tech Lead / Backend:** architecture, FastAPI, simulator, state engine, policy engine, API, persistence, deployment.
- **Vlad — Frontend / UX:** customer/adviser UI, event visualization, state/journey UX, integration, polish.

## Demo concept

The demo proves one thing visually: weak signals become an explainable hypothesis, unsafe automation is blocked, the customer confirms the goal, and only then does KBC Compass orchestrate a useful journey and scoped human handoff.

**Priority:** working demo > wow effect > clear value > polish > technical completeness.

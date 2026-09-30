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

- **Frontend:** Next.js + TypeScript + Tailwind; Framer Motion only where stable.
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
- [Mock Data](docs/MOCK_DATA.md)\n- [Scalability](docs/SCALABILITY.md)
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
├── docs/
│   ├── MOCK_DATA.md
│   └── ...
└── legacy/research context files
```

## Local development

The first executable backend slice is the deterministic mock/demo API.

```bash
cd backend
pip install -r requirements.txt
export USE_MOCK_DATA=true
make seed
make test
make dev
```

The frontend can integrate against the documented `/api` contract without knowing whether the repository is mocked or real.

## Team

- **Bogdan — Product Lead / Orchestrator:** scope, synthetic scenario, testing, demo, pitch, integration coordination.
- **Benjamin — Tech Lead / Backend:** architecture, FastAPI, simulator, state engine, policy engine, API, persistence, deployment.
- **Vlad — Frontend / UX:** customer/adviser UI, event visualization, state/journey UX, integration, polish.

## Demo concept

The demo proves one thing visually: weak signals become an explainable hypothesis, unsafe automation is blocked, the customer confirms the goal, and only then does KBC Compass orchestrate a useful journey and scoped human handoff.

**Priority:** working demo > wow effect > clear value > polish > technical completeness.

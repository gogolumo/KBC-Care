# KBC Compass

**KBC Compass turns fragmented customer signals into an explainable customer situation, asks the customer to confirm it, and only then turns that context into safe, relevant next steps.**

> **Signals → Context → Consent → Policy → Experience**

KBC Compass is a hackathon proof of concept for a shared context and orchestration layer that could sit underneath KBC Mobile, Kate and human adviser channels.

The demo uses **synthetic data only**.

## The problem

Banks already observe many useful signals: transactions, simulator usage, product journeys, documents and service interactions.

The difficult part is understanding when several weak signals together may indicate a changing customer situation — without treating that inference as fact or immediately converting it into a commercial action.

A simple targeting system can become:

```text
Mortgage simulator used
→ show mortgage offer
```

KBC Compass separates the steps:

```text
Multiple weak signals
→ temporary customer context
→ explanation + confidence
→ policy check
→ customer confirmation
→ personalized journey
```

## The demo

The canonical customer is **Elise**, who may be exploring a home purchase.

Five synthetic events arrive:

1. Salary received
2. Mortgage simulation completed
3. MyHome visited several times
4. Housing payment pattern changed
5. Property document saved

Compass combines the evidence. The deterministic rule score progresses:

```text
0 → 30 → 45 → 63 → 83
```

At the activation threshold, Compass surfaces:

> **We think you may be exploring a home purchase**

Elise can see why the context appeared and choose:

- **Yes, help me explore**
- **Not relevant**

Before confirmation, Compass demonstrates an important boundary: a **pre-approved mortgage offer is blocked** by the policy engine. Understanding a situation does not mean the bank has permission to turn an inferred context into a high-impact credit action.

After Elise confirms, a personalized Home Journey becomes available. If she later speaks with KBC Live, she chooses which context to share through a temporary Context Passport.

## Why this is not just a recommendation engine

A recommendation engine mainly answers:

> What should we show?

Compass first answers:

> What situation is supported by the evidence?

Then:

> Is this action appropriate?

And finally:

> Does the customer want this context to shape their experience?

That separation between **inference, consent and action** is the core concept.

## Run locally

### Fastest path — one command

Requirements:

- macOS or Linux
- Python 3.10+
- Node.js 20+
- Git

Clone and start:

```bash
git clone https://github.com/gogolumo/hackathon.git
cd hackathon
make dev
```

If `make` is unavailable:

```bash
bash start.sh
```

The launcher automatically:

- creates `backend/.venv` when needed;
- installs Python dependencies when needed;
- validates the Elise synthetic seed;
- installs frontend dependencies;
- uses local `pnpm`, Corepack or an `npx pnpm` fallback;
- starts FastAPI on port 8000;
- starts Next.js on port 3000;
- verifies backend and frontend health;
- opens the app automatically on macOS;
- stops both processes when you press `Ctrl+C`.

Open:

- App: http://localhost:3000
- API: http://127.0.0.1:8000
- Health: http://127.0.0.1:8000/api/health
- FastAPI docs: http://127.0.0.1:8000/docs

Expected health response:

```json
{"ok":true,"mockMode":true}
```

### Manual fallback

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
export USE_MOCK_DATA=true
python -m app.seed.validate
python -m pytest -q
python -m uvicorn app.main:app --port 8000
```

Frontend, in a second terminal:

```bash
cd frontend
pnpm install
pnpm dev
```

If `pnpm` is not installed, you can use:

```bash
npx --yes pnpm@12.8.1 install
npx --yes pnpm@12.8.1 dev
```

## Demo flow

A presenter should be able to tell the whole story in a few actions:

```text
Reset
→ Run demo
→ Watch signals accumulate
→ Open “Why am I seeing this?”
→ Show policy decision: BLOCK
→ “Yes, help me explore”
→ Complete a Home Journey step
→ Share with KBC Live
→ Adviser View
```

The strongest demo moment is the transition:

```text
5 weak signals
→ Possible Home Purchase
→ policy blocks unsafe automation
→ Elise confirms
→ Home Journey activates
```

## Architecture

```text
Browser
   ↓
Next.js frontend
   ↓ /api/*
FastAPI backend
   ↓
Deterministic State Engine
   ↓
Temporary customer context
   ↓
Deterministic Policy / Consent Gate
   ↓
Personalized Journey
   ↓
Customer-approved Context Passport
   ↓
KBC Live adviser view
```

The frontend uses relative `/api/*` routes. Next.js rewrites them to FastAPI at `http://127.0.0.1:8000` by default.

## Trust by design

The MVP deliberately demonstrates:

- synthetic customer data only;
- multi-signal inference rather than single-event targeting;
- visible evidence;
- a temporary state with expiry;
- deterministic rule scoring;
- customer confirmation or rejection;
- a separate policy gate;
- blocked high-impact credit automation;
- scoped, time-limited adviser sharing;
- exclusion of raw transactions from the adviser Context Passport.

The confidence value is a **rule score, not a probability and not a credit score**.

## Scalability

The target is a bank-scale **customer population of up to approximately two million customers**, not two million simultaneous HTTP connections.

The repository includes load-test tooling and lazy synthetic load-customer addressing. Local smoke measurements cover representative read, business and complete-flow paths.

The current hackathon repository intentionally uses one FastAPI process with in-memory mutable state. Real horizontal production scaling would require stateless API workers backed by shared persistence/cache.

See [docs/SCALABILITY.md](docs/SCALABILITY.md) for measured results, limits and the production path.

## Tech stack

**Frontend**

- Next.js 15
- React 19
- Tailwind CSS 4
- pnpm

**Backend**

- FastAPI
- Pydantic
- Uvicorn
- deterministic state engine
- deterministic policy engine
- in-memory mock repository

**Testing / performance**

- pytest
- Node test runner / Next.js build
- Locust
- bounded-concurrency benchmark runner

## Validate the project

Backend:

```bash
cd backend
USE_MOCK_DATA=true python -m pytest -q
```

Frontend:

```bash
cd frontend
pnpm test
pnpm build
```

Integration, while the app is running:

```bash
curl http://127.0.0.1:8000/api/health
curl http://localhost:3000/api/health
curl http://localhost:3000/api/customers
```

## Submission / pitch material

- [Plain-language product explainer](docs/PRODUCT_EXPLAINER.md)
- [Pitch cheatsheet](docs/PITCH_CHEATSHEET.md)
- [Submission copy + <3 minute video script](docs/SUBMISSION.md)
- [90-second demo story](docs/DEMO_STORY.md)
- [API contract](docs/API_CONTRACT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Privacy & safety](docs/PRIVACY_AND_SAFETY.md)
- [Scalability validation](docs/SCALABILITY.md)

## Repository structure

```text
hackathon/
├── start.sh
├── Makefile
├── README.md
├── backend/
│   ├── app/
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── app/
│   ├── lib/
│   └── package.json
├── docs/
├── performance/
└── scripts/
```

## Hackathon boundaries

This is a prototype, not a production banking system.

It does **not** claim:

- access to real KBC customer data;
- production KBC API integration;
- credit approval or underwriting;
- production authentication/authorization;
- production-grade persistence;
- two million simultaneous active users;
- that KBC currently lacks personalization.

The critical state and policy logic in this MVP is deterministic and auditable. No LLM participates in state inference, policy enforcement or credit decisions.

---

**Demo thesis:** KBC Compass combines weak signals into an explainable temporary situation, blocks inappropriate automation, asks the customer to confirm the context, and only then adapts the banking journey.

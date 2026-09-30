# KBC Care

**KBC Care turns fragmented customer signals into timely, explainable banking guidance while keeping the customer in control.**

KBC Care is a hackathon proof of concept for a context-aware banking experience that combines multiple weak signals into a temporary customer situation, applies a deterministic policy gate, asks the customer to confirm the context, and only then adapts the experience across digital and adviser channels.

> **Signals → Context → Consent → Policy → Experience**

The demo uses **synthetic data only**.

## 🚀 Live Demo

KBC Care is deployed on Google Cloud Run.

- **Application:** https://kbc-compass-kvd5257laq-ew.a.run.app
- **Backend API:** https://kbc-compass-api-kvd5257laq-ew.a.run.app
- **Swagger / API docs:** https://kbc-compass-api-kvd5257laq-ew.a.run.app/docs
- **Health check:** https://kbc-compass-api-kvd5257laq-ew.a.run.app/api/health

Deployment:
- Google Cloud Run
- Region: `europe-west1`
- Demo mode: synthetic / mock data
- Frontend: Next.js
- Backend: FastAPI

The public deployment is a hackathon demo environment using synthetic/mock customer data. No real banking customer data is used.

> The public hackathon deployment runs in a temporary Google Cloud/Qwiklabs environment and may expire after the event.

## How to run everything

There are three demo surfaces:

```text
KBC Care Web (Next.js)
        │
        ├── /api/*
        ▼
KBC Care Backend (FastAPI)
        ▲
        │
KBC Care Mobile (Expo / React Native)
```

The web app and the mobile app use the same backend and the same synthetic Elise demo state.

### 1. Run web + backend locally

From the `main` branch:

```bash
git clone https://github.com/gogolumo/KBC-Care.git
cd KBC-Care
git checkout main
make dev
```

If `make` is unavailable:

```bash
bash start.sh
```

Open:

- Web app: http://localhost:3000
- Backend API: http://127.0.0.1:8000
- Health check: http://127.0.0.1:8000/api/health
- Swagger: http://127.0.0.1:8000/docs

### 2. Run the mobile app on a phone

The mobile client currently lives in branch `benjamin/mobile` under `mobile/`.

Use Node.js 20.19+ or Node.js 22+.

```bash
git clone https://github.com/gogolumo/KBC-Care.git
cd KBC-Care
git checkout benjamin/mobile
cd mobile
npm ci
```

For the easiest hackathon demo, connect the mobile client to the already deployed HTTPS backend:

```bash
EXPO_PUBLIC_API_URL="https://kbc-compass-api-kvd5257laq-ew.a.run.app" npx expo start
```

Then scan the QR code with Expo Go on Android, or with the Camera app on iPhone.

If the phone cannot reach the local Expo server, use:

```bash
EXPO_PUBLIC_API_URL="https://kbc-compass-api-kvd5257laq-ew.a.run.app" npx expo start --tunnel
```

You can also preview the mobile UI in a browser:

```bash
EXPO_PUBLIC_API_URL="https://kbc-compass-api-kvd5257laq-ew.a.run.app" npx expo start --web
```

### 3. Deploy web + backend to Google Cloud Run

Run this from Google Cloud Shell:

```bash
git clone https://github.com/gogolumo/KBC-Care.git
cd KBC-Care
git checkout main

PROJECT_ID="$(gcloud config get-value project)"
gcloud config set project "$PROJECT_ID"

bash scripts/deploy_gcp.sh "$PROJECT_ID"
```

This deploys:

- `kbc-compass-api` — FastAPI backend
- `kbc-compass` — Next.js web application

Current hackathon deployment:

- Web: https://kbc-compass-kvd5257laq-ew.a.run.app
- Backend: https://kbc-compass-api-kvd5257laq-ew.a.run.app
- Swagger: https://kbc-compass-api-kvd5257laq-ew.a.run.app/docs

### 4. Recommended demo setup

For the final hackathon demo, the simplest reliable setup is:

```text
Laptop / judges
→ Cloud Run web app

Phone
→ Expo mobile app
→ same Cloud Run backend
```

Before presenting, verify:

```bash
curl https://kbc-compass-api-kvd5257laq-ew.a.run.app/api/health
curl https://kbc-compass-kvd5257laq-ew.a.run.app/api/health
```

Expected backend response:

```json
{"ok":true,"mockMode":true}
```

No passwords, tokens, service-account keys or other credentials should be committed to the repository.

## The problem

Banks already observe many useful signals: transactions, simulator usage, product journeys, documents and service interactions.

The difficult part is understanding when several weak signals together may indicate a changing customer situation — without treating that inference as fact or immediately converting it into a commercial action.

A simple targeting system can become:

```text
Mortgage simulator used
→ show mortgage offer
```

KBC Care's underlying **Compass** decision concept separates the steps:

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

KBC Care combines the evidence. The deterministic rule score progresses:

```text
0 → 30 → 45 → 63 → 83
```

At the activation threshold, KBC Care surfaces:

> **We think you may be exploring a home purchase**

Elise can see why the context appeared and choose:

- **Yes, help me explore**
- **Not relevant**

Before confirmation, KBC Care demonstrates an important boundary: a **pre-approved mortgage offer is blocked** by the policy engine. Understanding a situation does not mean the bank has permission to turn an inferred context into a high-impact credit action.

After Elise confirms, a personalized Home Journey becomes available. If she later speaks with KBC Live, she chooses which context to share through a temporary Context Passport.

## Why this is not just a recommendation engine

A recommendation engine mainly answers:

> What should we show?

KBC Care first answers:

> What situation is supported by the evidence?

Then:

> Is this action appropriate?

And finally:

> Does the customer want this context to shape their experience?

That separation between **inference, consent and action** is the core concept.

## Local Development

### Fastest path — one command

Requirements:

- macOS or Linux
- Python 3.10+
- Node.js 20+
- Git

Clone and start:

```bash
git clone https://github.com/gogolumo/KBC-Care.git
cd KBC-Care
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

## Google Cloud Deployment

Google Cloud is **not required for local development or the core demo**. For a judge-friendly public URL, KBC Care is deployed as two Cloud Run services:

```text
Browser
  ↓
kbc-compass (Next.js frontend)
  ↓ /api/*
kbc-compass-api (FastAPI backend)
  ↓
synthetic demo data + deterministic state/policy engine
```

Current hackathon deployment:

- Project: `qwiklabs-gcp-04-b5a99cc66fcf`
- Region: `europe-west1`
- Frontend service: `kbc-compass`
- Backend service: `kbc-compass-api`
- App: https://kbc-compass-kvd5257laq-ew.a.run.app
- Backend: https://kbc-compass-api-kvd5257laq-ew.a.run.app
- Swagger: https://kbc-compass-api-kvd5257laq-ew.a.run.app/docs
- Backend health: https://kbc-compass-api-kvd5257laq-ew.a.run.app/api/health
- Frontend proxy health: https://kbc-compass-kvd5257laq-ew.a.run.app/api/health
- Verified response: `{"ok":true,"mockMode":true}`
- Traffic: 100% routed to the latest deployed revision

Deploy from the repository root:

```bash
bash scripts/deploy_gcp.sh <PROJECT_ID>
```

One-command Cloud Shell deployment, assuming the Cloud Shell session is already authenticated to an authorized Google Cloud/Qwiklabs account:

```bash
PROJECT_ID="$(gcloud projects list --format='value(projectId)' --limit=1)" && \
gcloud config set project "$PROJECT_ID" && \
bash scripts/deploy_gcp.sh "$PROJECT_ID"
```

No passwords, tokens, service-account keys or other credentials belong in this repository.

Full guide: [docs/CLOUD_RUN.md](docs/CLOUD_RUN.md)

> The public hackathon deployment uses a temporary Qwiklabs project, so the URLs may expire after the event.

## Hackathon Demo

Recommended URL for judges:

https://kbc-compass-kvd5257laq-ew.a.run.app

Suggested demo scenario:

1. Open KBC Care.
2. Run Elise's demo story.
3. Observe contextual home-purchase guidance.
4. Confirm the journey.
5. Share selected context.
6. Open Adviser View.
7. Show decision confidence and the Kate assistant.

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

- Next.js 16
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
- [Cloud Run deployment guide](docs/CLOUD_RUN.md)

## Repository structure

```text
KBC-Care/
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

## What is unfinished

KBC Care is a demo-ready hackathon MVP, not a production banking system. The core customer flow, deterministic context engine, policy/consent flow, Home Journey, Context Passport, Adviser View and local demo are implemented. Production authentication, persistent shared storage, real KBC customer/API integrations and production-grade horizontal scaling are intentionally out of scope for this prototype.

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

**Demo thesis:** KBC Care combines weak signals into an explainable temporary situation, blocks inappropriate automation, asks the customer to confirm the context, and only then adapts the banking journey.

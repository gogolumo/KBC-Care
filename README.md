# KBC Care

**KBC Care turns fragmented customer signals into timely, explainable banking guidance while keeping the customer in control.**

KBC Care is a hackathon proof of concept for a context-aware banking experience that combines multiple weak signals into a temporary customer situation, applies a deterministic policy gate, asks the customer to confirm the context, and only then adapts the experience across digital and adviser channels.

> **Signals → Context → Consent → Policy → Experience**

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

Google Cloud is **not required for local development or the core demo**. The repository can be demonstrated entirely on a laptop with `make dev` / `bash start.sh`.

For a judge-friendly public URL, the simplest hackathon deployment is a **single Cloud Run service** built from the root `Dockerfile`. The container keeps the same logical architecture:

```text
Browser
   ↓
Next.js frontend (public Cloud Run port)
   ↓ /api/*
FastAPI backend (internal port 8000)
   ↓
Mock / deterministic state & policy engine
```

This single-service layout is deliberate for the hackathon: it avoids CORS and cross-service configuration, preserves the existing relative `/api/*` contract, and keeps deployment to one public HTTPS URL. It is not presented as the target production architecture.

### Prerequisites

Use the temporary Google Cloud project supplied by the hackathon organizers. Sign in interactively; **never copy the temporary password, access tokens, service-account keys, or other credentials into this repository**.

Install the Google Cloud CLI if it is not already available, then:

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud config set run/region us-central1
```

If the hackathon account already opens an authenticated Cloud Shell, you can run the deployment commands there and skip `gcloud auth login`.

### Deploy

From the repository root:

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

gcloud run deploy kbc-care \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars USE_MOCK_DATA=true \
  --max-instances=1
```

Cloud Run returns a public HTTPS URL when deployment succeeds.

Verify it:

```bash
SERVICE_URL="$(gcloud run services describe kbc-care --region us-central1 --format='value(status.url)')"

curl "$SERVICE_URL/api/health"
curl "$SERVICE_URL/api/customers"
```

Expected health response:

```json
{"ok":true,"mockMode":true}
```

Then open `$SERVICE_URL` in a browser and run the same demo flow as locally.

### Why `--max-instances=1` for the hackathon demo?

The MVP intentionally stores mutable demo state in memory. Multiple Cloud Run instances would each have separate state, so requests could observe different demo progress. Limiting the service to one instance keeps the public demo deterministic.

A production deployment should instead use stateless API workers with shared persistence/cache, after which horizontal autoscaling can be enabled safely.

### Cloud deployment boundaries

- The Cloud Run deployment uses synthetic data only.
- No Google Cloud credentials belong in `.env`, source files, Docker build arguments or Git history.
- The service may reset demo state after a restart/cold replacement because the MVP state is in memory.
- The public demo has no production authentication and must not be treated as a real banking system.
- If the temporary Qwiklabs project blocks Cloud Run, service enablement or public IAM, keep the local demo as the source of truth rather than redesigning the application around lab restrictions.

## Deploy to Google Cloud Run

For a public hackathon URL, use Google Cloud Shell:

```bash
gcloud config set project qwiklabs-gcp-04-b5a99cc66fcf
git clone https://github.com/gogolumo/KBC-Care.git
cd KBC-Care
bash scripts/deploy_gcp.sh qwiklabs-gcp-04-b5a99cc66fcf
```

This deploys the FastAPI backend and Next.js frontend as separate Cloud Run services, wires the frontend to the generated backend URL, verifies the integration, and prints the public App URL.

Full guide: [docs/CLOUD_RUN.md](docs/CLOUD_RUN.md)

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

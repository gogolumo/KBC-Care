# TEAM PLAYBOOK

# CURRENT HACKATHON STATUS — 2026-09-30

> This section is the shared operational source of truth for Bogdan, Benjamin and Vlad. If an older Issue or legacy document conflicts with this section, follow this section plus the current README/docs/backend implementation.

## Current product source of truth

The active MVP is **KBC Compass**, not the older MomentOS/Emma/Lina concept.

Canonical P0 persona and flow:

```text
Elise
↓
salary_received                    +0
mortgage_simulation_completed     +30
myhome_repeated_visits            +15
rent_pattern_changed              +18
property_document_saved           +20
↓
Compass confidence:
30 → 45 → 63 → 83
↓
Possible Home Purchase
↓
Why am I seeing this? / Evidence
↓
PRE_APPROVED_MORTGAGE_OFFER
→ BLOCKED by policy
↓
Customer confirms
↓
Home Purchase Journey
↓
Complete at least one step
↓
Share Context
↓
Context Passport
↓
Adviser View
```

Final deterministic confidence is **83**.

Do not build Emma/Lina or a second persona until this flow is fully integrated and frozen.

## Git status observed

- Mock/backend PR #5 has been merged to `main`.
- FastAPI backend and deterministic mock data are in `main`.
- `benjamin/backend` and `vlad/frontend` currently have no commits ahead of `main` and are behind the current main branch.
- A frontend directory is not currently visible in remote `main`.

If Vlad already has a working frontend locally, **pushing it is the first integration blocker**. Do not rebuild it from scratch just because it is not yet visible remotely.

## Integration audit update — 2026-09-30

| Frontend expectation | Backend reality | Mismatch | Fix |
|---|---|---|---|
| Use customer `elise` | `elise` is canonical | none | keep |
| Show 30 → 45 → 63 → 83 from backend | backend previously returned `state: null` before 60 | frontend could not show 30/45 without duplicating scoring | event/reset/play responses now expose backend-computed `confidence` |
| State card appears only after threshold | GET state is 404 before 60 | none | keep |
| Call backend from localhost frontend | no CORS middleware | browser requests could fail | allow localhost:3000 / 127.0.0.1:3000 by default; override with `CORS_ORIGINS` |
| Integrate current frontend | no remote frontend code exists in `main` or `vlad/frontend` | hard blocker | Vlad must push the working frontend; do not rebuild it blindly |

Current integration status: **backend contract hardened; full frontend ↔ backend E2E still BLOCKED by missing remote frontend source**.

Canonical frontend rule once pushed:

```text
POST event
→ render response.confidence
→ render response.state only when non-null
→ never calculate confidence locally
```

## Immediate team objective

Stop adding new features.

The next milestone is one stable, repeatable end-to-end demo using the real frontend ↔ backend API connection.

Priority:

```text
working integrated demo
>
repeatable reset
>
correct API integration
>
clear visual story
>
demo reliability
>
polish
>
new features
```

## P0 action plan

### 1. Freeze one source of truth

Use:

- `README.md`
- `docs/MVP.md`
- `docs/API_CONTRACT.md`
- `docs/DEMO_STORY.md`
- `docs/MOCK_DATA.md`
- current backend implementation

as the active product definition.

Old Issues mentioning MomentOS, Emma, Lina or conflicting scoring are historical unless explicitly rewritten.

Known doc mismatch to fix: any remaining `78%`/old scoring references should match the deterministic **83** flow.

### 2. Vlad — push and stabilize frontend

Immediate tasks:

- push the working frontend to GitHub;
- place it in the agreed project structure, preferably `frontend/`;
- open a PR or coordinate a safe merge;
- keep existing working UI — do not rewrite it unnecessarily;
- identify all local hardcoded mocks;
- route UI through a single API/service layer;
- add the correct environment variable for backend base URL;
- keep loading/error/empty states stable.

Frontend must not independently calculate confidence or duplicate backend business logic.

Target architecture:

```text
component
↓
api/service client
↓
FastAPI /api
↓
repository/services
```

### 3. Benjamin — integration/backend gaps

Immediate tasks:

- confirm all P0 endpoints against the real frontend;
- add CORS or dev proxy support if required;
- keep API response shapes stable;
- fix only P0 contract gaps used in the demo;
- verify reset/replay is deterministic;
- verify reject behavior;
- verify journey step updates;
- verify Context Passport behavior;
- add/fix `pause` only if it is part of the final visible demo;
- check passport expiry/revocation only to the level required by the final demo.

Do not add a database, microservices, production auth or new integrations unless the demo actually requires them.

### 4. Bogdan — integration QA and demo ownership

Immediate tasks:

- treat the product as a hostile QA tester;
- test every frontend/backend integration after merge;
- cut anything not used in the 90-second flow;
- ensure the demo is understandable from 2–3 metres away;
- lock the exact click order;
- lock the spoken narration;
- prepare fallback screenshots/video only after the live path works.

## Required end-to-end acceptance test

### Reset

Expected:

- no applied events;
- no inferred state card;
- no journey;
- no passport.

### Playback

Run events in order:

1. `salary_received`
2. `mortgage_simulation_completed`
3. `myhome_repeated_visits`
4. `rent_pattern_changed`
5. `property_document_saved`

Visible confidence progression:

```text
30 → 45 → 63 → 83
```

The proactive state card should appear only after the configured threshold is crossed.

### Explainability

Open **Why am I seeing this?**

Show:

- evidence;
- evidence labels;
- contribution weights;
- freshness/expiry;
- observed vs inferred distinction.

### Policy moment

Evaluate:

```text
PRE_APPROVED_MORTGAGE_OFFER
```

Expected:

```text
BLOCK
HIGH_IMPACT_CREDIT_DECISION
```

The UI must visibly communicate why the action is blocked.

### Confirmation

Customer confirms the hypothesis.

Expected:

- state becomes `confirmed`;
- Home Purchase Journey appears.

### Journey

- show all 5 steps;
- complete at least 1 step using backend API;
- UI updates from backend response.

### Context Passport

Share only:

- confirmed goal;
- journey progress;
- unresolved questions;
- purpose;
- expiry.

Do **not** expose raw transaction/event history to adviser view.

### Adviser View

Adviser sees only the customer-approved Context Passport.

### Negative path

After reset and replay:

- click `Not relevant`;
- backend state becomes rejected;
- state UI visibly changes/disappears;
- journey is not created.

## Reliability gate

Before visual polish, the team must successfully run:

```text
reset
→ full flow
→ reset
→ full flow
```

two times in a row without:

- manual database edits;
- editing JSON;
- DevTools fixes;
- restarting to repair state;
- changing code between runs.

When this passes, freeze that commit as the fallback demo.

## One-command startup target

Aim for one top-level command such as:

```bash
make demo
```

or an equally simple command appropriate to the final frontend stack.

It should start:

- backend with mock mode enabled;
- frontend with the correct API base URL.

Do not add Docker purely for appearance if it reduces reliability.

## Final demo checklist

```text
[ ] Frontend pushed to GitHub
[ ] Frontend and backend both start from fresh clone
[ ] Reset works
[ ] Event playback works
[ ] Confidence 30 → 45 → 63 → 83
[ ] State appears at threshold
[ ] Evidence panel works
[ ] Policy BLOCK is visible
[ ] Confirm works
[ ] Journey appears
[ ] Journey step completion works
[ ] Context Passport works
[ ] Adviser View works
[ ] Reject flow works
[ ] Second clean replay works
[ ] One-command/demo startup documented
[ ] Stable commit tagged mentally/operationally as fallback
```

## Hard cut list until freeze

Do not spend hackathon time on:

- new personas;
- Emma/Lina expansion;
- production authentication;
- real KBC APIs;
- database platform work;
- microservices;
- autonomous agents;
- complex LLM orchestration;
- large refactors;
- secondary screens;
- design-system work;
- animations that risk stability.

The rule is simple:

**Do not expand the MVP. Turn what already exists into a stable, integrated, impressive demo.**

---

## Mission

Three people, one goal: get to a working, impressive end-to-end demo as fast as possible.

Do not optimize for production completeness.

---

## 1. Bogdan — Product Lead / Orchestrator

### Main responsibility

Protect the team from building the wrong thing.

### Tasks

- define the problem and target user
- select the smallest valuable MVP
- write feature specs and acceptance criteria
- maintain priorities
- test the product as a user
- run 30–60 minute syncs
- cut scope aggressively
- prepare the live demo
- prepare the pitch and judge Q&A
- keep PROJECT_CONTEXT.md current at decision level

### Bogdan should NOT

- micromanage backend implementation
- rewrite Vlad's UI while the core flow is incomplete
- introduce features without acceptance criteria
- run research that does not change a product decision
- delay the team waiting for perfect certainty

### Bogdan's default AI workflow

```
idea/problem
→ ChatGPT: define decision/spec
→ if external fact matters: Perplexity/Gemini
→ Bogdan decides
→ spec handed to Benjamin/Vlad
```

---

## 2. Benjamin — Tech Lead / Backend

### Main responsibility

Make the system actually work.

### Tasks

- choose the simplest architecture
- build backend
- define API contracts
- integrate AI/model APIs
- integrate third-party APIs
- create database schema
- manage env vars and secrets
- create seed/demo data when needed
- deploy backend
- make failure modes visible and recoverable
- verify critical endpoints independently

### Benjamin should NOT

- add microservices for theoretical scale
- redesign the frontend
- change API response shapes silently
- refactor unrelated working code
- block Vlad waiting for 'final backend'

### Definition of done for a backend task

A task is done when:
- endpoint runs
- happy path works
- expected error is handled
- example request/response exists
- Vlad can integrate it without asking what fields mean

### Backend handoff template

```
ENDPOINT:
METHOD:

REQUEST:
{}

SUCCESS:
{}

ERROR:
{}

NOTES:
- auth:
- env:
- known limitation:
```

---

## 3. Vlad — Frontend / UX

### Main responsibility

Make the value obvious on screen.

### Tasks

- implement user flow
- build core screens
- make primary CTA obvious
- implement loading / success / error / empty states
- work against mock JSON first
- connect frontend to real API
- make the wow moment visually strong
- prepare assets and demo visuals
- optimize UX for the actual demo path
- test on the device/browser used for judging

### Vlad should NOT

- wait for backend before building screens
- build an entire design system
- polish screens that are not in the demo
- hide backend integration problems behind fake behavior once integration starts
- add animations that risk stability

### Definition of done for a frontend task

A task is done when:
- user can complete the intended action
- all visible states make sense
- it works with expected backend response
- the next step is obvious
- Bogdan can demo it without explanation

---

## 4. Parallel Work Model

### Bogdan lane

```
product decision
→ feature spec
→ acceptance criteria
→ test current build
→ demo script
```

### Benjamin lane

```
backend scaffold
→ API
→ AI/integration
→ DB
→ deploy
→ reliability
```

### Vlad lane

```
mock data
→ core screens
→ states
→ integration
→ polish
```

Nobody should wait unless there is a hard technical dependency.

---

## 5. Priority System

### P0 — Demo blocker

Examples:
- app does not start
- core API fails
- core flow cannot finish
- deployment broken
- secrets missing
- frontend/backend incompatible

Drop everything and fix.

### P1 — Judge comprehension

Examples:
- CTA unclear
- result confusing
- demo requires too much explanation
- loading looks broken
- wow moment is weak

Fix after P0.

### P2 — Nice to have

Examples:
- settings
- extra filters
- secondary flows
- perfect responsiveness
- refactors
- extra animations

Ignore until core demo is stable.

---

## 6. Feature Workflow

```
Bogdan
→ writes user story + acceptance criteria
→ Benjamin and/or Vlad
→ implementation with Cursor/Codex
→ owner tests locally
→ integration
→ Bogdan tests complete user flow
→ if it improves demo: keep
→ otherwise: cut
```

---

## 7. Bug Workflow

### First attempt

Owner uses Cursor/Codex with:
- expected behavior
- actual behavior
- error
- relevant files

### If still broken after 2 attempts

Stop random patching.

Use ChatGPT/Claude to:
1. identify likely root cause
2. rank hypotheses
3. define evidence
4. propose smallest fix

Then send the chosen fix back to Cursor/Codex.

---

## 8. Integration Rule

Frontend and backend should integrate through a written contract, not memory.

Example:

```json
POST /api/analyze

REQUEST
{
  "text": "hello"
}

SUCCESS
{
  "result": "example",
  "score": 0.92
}

ERROR
{
  "error": "message"
}
```

If a contract changes, say it immediately in team chat/sync.

---

## 9. Git Rules

### main

Always demoable.

### benjamin/backend

Backend ownership.

### vlad/frontend

Frontend ownership.

### Commit examples

```
feat: add analysis endpoint
feat: connect result screen to API
fix: handle empty AI response
fix: unblock demo upload flow
```

Avoid meaningless commits like:
```
update
stuff
changes
test2
```

---

## 10. Freeze Rule

When the first end-to-end demo works:

1. commit it
2. push it
3. treat it as the fallback demo
4. only then improve

During the last phase of the hackathon:

```
NO NEW FEATURES
unless the current demo is already stable
```

---

## 11. Team Sync

Every 30–60 minutes, 5–7 minutes max.

### Bogdan
- what is the current demo?
- what should we cut?

### Benjamin
- what endpoint/integration works?
- what blocks frontend?
- any contract changes?

### Vlad
- what can already be clicked through?
- what blocks integration?
- what is visually confusing?

### Final question

**What will be visibly better in the demo one hour from now?**

If nobody has a concrete answer, priorities are wrong.

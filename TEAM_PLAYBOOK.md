# TEAM PLAYBOOK

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

# Hackathon

Private repository for our 3-person hackathon team.

## Goal

Build the smallest working MVP that demonstrates the core value clearly and impressively.

**Priority:** working demo > wow effect > clear value > polish.

## Team & Ownership

### Bogdan — Product Lead / Orchestrator

Owns:
- problem definition
- target user
- MVP scope
- feature priority
- acceptance criteria
- testing of the full user flow
- demo script
- pitch
- final go / no-go decisions

Bogdan does **not** become the bottleneck for implementation. He defines *what must work* and lets Benjamin and Vlad decide the fastest implementation details inside their areas.

### Benjamin — Tech Lead / Backend

Owns:
- overall technical architecture
- backend
- APIs
- database
- AI/model integrations
- third-party integrations
- environment variables
- deployment
- backend reliability during the demo
- API contracts consumed by frontend

Primary branch: `benjamin/backend`.

Benjamin's output should always be testable independently with curl/Postman or a small script before frontend integration.

### Vlad — Frontend / UX

Owns:
- frontend
- UI/UX
- user flow implementation
- loading / empty / error / success states
- frontend integration with backend
- demo polish
- responsive behavior on the demo device
- visual assets and Figma handoff

Primary branch: `vlad/frontend`.

Vlad should build against mock JSON immediately instead of waiting for backend.

## Decision Rights

- **Product decision:** Bogdan
- **Backend / architecture decision:** Benjamin
- **Frontend / UX implementation decision:** Vlad
- **Cross-stack decision affecting demo:** discuss for max 5 minutes; Bogdan decides if no agreement
- **Scope cut:** Bogdan can cut any nonessential feature at any time

## Handoff Contract

Bogdan gives:
- user story
- expected behavior
- acceptance criteria
- priority: P0 / P1 / P2

Benjamin gives Vlad:
- endpoint
- method
- request body
- response body
- error shape
- example JSON

Vlad gives Benjamin:
- exact frontend payload requirements
- integration bugs with reproduction steps
- required response fields only

## Branches

- `main` — must stay demoable.
- `benjamin/backend` — backend / APIs / AI / database.
- `vlad/frontend` — frontend / UX / integration.

Use short-lived feature branches only when they clearly reduce conflict.

## Development Loop

```
DECIDE
→ SPEC
→ BUILD
→ TEST
→ DEMO
→ FIX
```

## Sync Every 30–60 Minutes

Each person answers:

1. What works right now?
2. What will work in the next hour?
3. What is blocking me?
4. Did any API/interface change?
5. What can we remove from scope?

Sync should take **5–7 minutes max**.

## Merge Rules

1. Do not merge broken code into `main`.
2. Keep changes small and demo-focused.
3. Do not refactor working code unless it blocks the demo.
4. Frontend develops against mock JSON before backend is ready.
5. Backend endpoints are tested independently before frontend integration.
6. Before risky changes, make sure the current demoable state is committed.
7. Last hours: P0 demo blockers first; no speculative improvements.

## AI Usage

### Bogdan
ChatGPT → product decisions, specs, testing, pitch  
Perplexity/Gemini → research only when external facts can change a decision

### Benjamin
Cursor/Codex → implementation  
ChatGPT/Claude → architecture, root-cause debugging, code review only when needed

### Vlad
Figma/ChatGPT → UX direction  
Cursor/Codex → frontend implementation  
ChatGPT → UX critique and demo-flow review

## Shared Context

Keep `PROJECT_CONTEXT.md` updated. It is the shared state for humans and AI tools.

Detailed execution rules live in `TEAM_PLAYBOOK.md`.

## Demo Rule

Before adding any feature, ask:

> Will this make the demo noticeably better in the next 1–2 hours?

If not, cut it.

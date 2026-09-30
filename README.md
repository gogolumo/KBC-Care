# Hackathon

Private repository for our 3-person hackathon team.

## Team

- **Bogdan** — Product Lead / Orchestrator  
  Idea, MVP, prioritization, testing, pitch, demo.

- **Benjamin** — Tech Lead / Backend  
  Architecture, backend, APIs, database, AI integrations, deployment.

- **Vlad** — Frontend / UX  
  Frontend, UI/UX, user flow, backend integration.

## Goal

Build the smallest working MVP that demonstrates the core value clearly and impressively.

**Priority:** working demo > wow effect > clear value > polish.

## Branches

- `main` — must stay demoable.
- `benjamin/backend` — backend / APIs / AI / database.
- `vlad/frontend` — frontend / UX / integration.

Use short-lived feature branches only when needed.

## Development loop

```
DECIDE
→ SPEC
→ BUILD
→ TEST
→ DEMO
→ FIX
```

## Rules

1. Do not merge broken code into `main`.
2. Keep changes small and demo-focused.
3. Do not refactor working code unless it blocks the demo.
4. Frontend can develop against mock JSON before backend is ready.
5. Every 30–60 minutes, sync:
   - what works now;
   - what will work next;
   - current blocker;
   - API contract changes;
   - what can be cut from scope.

## Shared context

Keep `PROJECT_CONTEXT.md` updated. It is the handoff document for humans and AI tools.

## Demo rule

Before adding any feature, ask:

> Will this make the demo noticeably better in the next 1–2 hours?

If not, cut it.

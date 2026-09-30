# PROJECT CONTEXT

## Team

### Bogdan — Product Lead / Orchestrator
Owns product decisions, MVP scope, priorities, acceptance criteria, testing, demo, pitch and judge Q&A.

### Benjamin — Tech Lead / Backend
Owns architecture, backend, APIs, database, AI integrations, inference logic and deployment.

Primary branch: `benjamin/backend`.

### Vlad — Frontend / UX
Owns frontend, UI/UX, event-stream visualization, adaptive customer experience, integration and demo polish.

Primary branch: `vlad/frontend`.

## Problem
KBC already has Kate, proactive personalization and ecosystem services. The hackathon opportunity is not another assistant or isolated feature, but a scalable intelligence/orchestration layer that turns fragmented customer signals into an evolving, explainable understanding of the customer's current situation and intent.

## User
Primary demo user: a KBC customer whose needs evolve over time.

Secondary users:
- KBC Live / adviser consuming the same customer context
- KBC product/channel systems consuming a common customer-state API

## Value Proposition
**KBC MomentOS turns fragmented signals into a live, explainable Customer State and chooses the right behaviour at the right moment — including asking, waiting, escalating or suppressing instead of always selling.**

## MVP
1. Synthetic event stream for 3 core customers.
2. Context/intent inference with confidence and evidence.
3. Trust-aware decision engine returning RECOMMEND / ASK / EDUCATE / WAIT / ESCALATE / SUPPRESS.
4. Adaptive customer UI driven by the same customer state.
5. "Why am I seeing this?" explanation and correction flow.
6. Financial Guardian case where commercial recommendations are suppressed during income disruption.

## Demo Flow
1. Emma starts with a normal banking view.
2. Synthetic events arrive: salary increase, savings growth, mortgage simulation, MyHome activity.
3. HOME_PURCHASE confidence visibly rises.
4. KBC experience adapts automatically.
5. Customer opens "Why am I seeing this?" and confirms/rejects the hypothesis.
6. Switch to Lina: salary stops, benefit appears, balance declines.
7. MomentOS detects INCOME_DISRUPTION and suppresses sales content.
8. Show overview of multiple customers to prove the same engine scales beyond one hardcoded journey.

## WOW moment
The strongest moment is not a recommendation. It is the engine deciding **not to sell** to a financially stressed customer, while another customer gets a completely different adaptive experience from the same underlying system.

## Architecture
- Frontend: Next.js / React / Tailwind
- Backend: FastAPI
- AI: deterministic scoring + optional LLM interpretation/explanation
- Database: Supabase/Postgres
- Data: synthetic only
- Core abstraction: Customer State JSON consumed by all channels

## Stack
- Frontend: Next.js / React / Tailwind
- Backend: FastAPI
- Database: Supabase / Postgres
- Hosting: fastest stable option available to team
- AI model/API: existing hosted LLM if needed; no model training

## API Contracts

### POST /api/events
Create demo event.

### GET /api/customers/:id/state
Returns inferred state, confidence and evidence.

### GET /api/customers/:id/action
Returns next best behaviour and channel.

### POST /api/customers/:id/feedback
Confirm/reject inference and recompute state.

## Database
Minimum entities:
- customers
- events
- signals
- customer_states
- inferences
- actions
- feedback
- consents

## P0 Acceptance Criteria
- three demo customers exist
- events can be injected live
- inference changes after events
- confidence/evidence is visible
- Emma's UI adapts
- Lina's sales content is suppressed
- explanation panel works
- rejection/confirmation changes state
- happy path runs end-to-end without manual database edits

## Execution Rules
- Product decisions: Bogdan
- Backend/architecture decisions: Benjamin
- Frontend/UX implementation decisions: Vlad
- `main` must remain demoable
- Vlad starts against mock JSON immediately
- Benjamin freezes response shapes early and documents changes
- sync every 30–60 minutes
- P0 demo blockers beat all other work
- anything that does not improve the 90-second demo is cut

## Current Status

### Working
- Repository and team workflow
- KBC research direction
- Selected concept: KBC MomentOS

### In Progress
- MVP implementation
- synthetic data design
- API contract
- visual demo flow

### Not Started
- full end-to-end integration
- demo rehearsal
- judge Q&A rehearsal

## Current Blockers
- none that should stop parallel implementation

## Decisions
- Build KBC MomentOS, not a generic chatbot.
- Combine MomentOS + Mirror Me trust layer.
- Use Financial Guardian as the strongest third customer case.
- Do not train ML.
- Do not connect to real KBC infrastructure.
- Keep intelligence deterministic enough for a reliable live demo.
- Use an LLM only where it visibly improves inference/explanation.

## Next 60 Minutes

### Bogdan
- lock the 90-second story
- define exact event sequence for Emma and Lina
- write acceptance criteria for every visible screen
- prepare 5 judge questions/answers
- continuously cut scope

### Benjamin
- scaffold FastAPI
- create synthetic customer/event schema
- implement state scoring
- implement /events, /state, /action, /feedback
- provide stable mock response JSON to Vlad

### Vlad
- build event stream screen with mock events
- build customer app before/after states
- build confidence visualization
- build "Why am I seeing this?" panel
- build Lina suppression state
- integrate once Benjamin freezes API shape

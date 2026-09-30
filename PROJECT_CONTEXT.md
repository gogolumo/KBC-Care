# PROJECT CONTEXT

## Team

### Bogdan — Product Lead / Orchestrator
Owns product decisions, MVP scope, priorities, acceptance criteria, testing, demo and pitch.

### Benjamin — Tech Lead / Backend
Owns architecture, backend, APIs, database, AI integrations, third-party integrations and deployment.

Primary branch: `benjamin/backend`.

### Vlad — Frontend / UX
Owns frontend, UI/UX, user flow, frontend/backend integration and demo polish.

Primary branch: `vlad/frontend`.

## Problem
TBD

## User
TBD

## Value Proposition
TBD

## MVP
1. TBD
2. TBD
3. TBD

## Demo Flow
1. User: TBD
2. System: TBD
3. Result: TBD
4. WOW moment: TBD

## Architecture
- Frontend: TBD
- Backend: TBD
- AI: TBD
- Database: TBD
- External APIs: TBD

## Stack
- Frontend: TBD
- Backend: TBD
- Database: TBD
- Hosting: TBD
- AI model/API: TBD

## API Contracts
TBD

## Database
TBD

## Execution Rules
- Product decisions: Bogdan
- Backend/architecture decisions: Benjamin
- Frontend/UX implementation decisions: Vlad
- `main` must remain demoable
- Frontend starts with mock data instead of waiting for backend
- Backend exposes explicit request/response contracts
- Sync every 30–60 minutes
- P0 demo blockers beat all other work
- Features that do not improve the demo in the next 1–2 hours are cut

## Current Status

### Working
- Repository created
- Team collaborators added
- Backend branch created
- Frontend branch created
- Team roles and ownership defined

### In Progress
- Idea / MVP definition

### Not Started
- Core implementation
- Integration
- Demo rehearsal

## Current Blockers
- Final product idea / MVP not yet recorded here

## Decisions
- Scope is optimized for hackathon speed, not production completeness.
- Benjamin owns backend.
- Vlad owns frontend/UX.
- Bogdan owns product decisions, testing, pitch and demo.
- Detailed collaboration rules are in `TEAM_PLAYBOOK.md`.

## Demo Risks
1. Core happy path not working end-to-end
2. Frontend/backend contract mismatch
3. Too many features before first working demo

## Next 60 Minutes

### Bogdan
- Define problem, user, MVP, acceptance criteria and demo flow.
- Cut everything outside the main happy path.

### Benjamin
- Scaffold backend.
- Validate critical APIs.
- Define the first API contract.

### Vlad
- Scaffold frontend.
- Build the main screen using mock data.
- Implement loading/success/error states for the core action.

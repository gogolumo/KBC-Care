# Development Plan

## Objective

**working demo > wow effect > clear value > polish > technical completeness**

## Parallel workstreams

| Priority | Task | Owner | Dependency | Expected output |
|---|---|---|---|---|
| P0 | Freeze Elise event fixture + acceptance checks | Bogdan | docs | one canonical JSON/event sequence |
| P0 | Scaffold FastAPI + response models | Benjamin | API contract | runnable API + OpenAPI |
| P0 | Implement reset/play event simulator | Benjamin | fixture | deterministic replay |
| P0 | Implement state engine | Benjamin | simulator | confidence/evidence/expiry |
| P0 | Implement policy engine | Benjamin | state model | blocked + allowed results |
| P0 | Build Customer shell + event stream from mocks | Vlad | API contract | clickable customer demo |
| P0 | Build Compass card + Why modal | Vlad | state fixture | confidence/evidence UI |
| P0 | Build confirmation → Home Journey UI | Vlad | journey fixture | adaptive experience |
| P0 | Implement confirm/reject/journey APIs | Benjamin | state engine | working state transition |
| P0 | Implement Context Passport APIs | Benjamin | consent + journey | scoped handoff object |
| P0 | Build share modal + Adviser view | Vlad | passport fixture | end-to-end handoff |
| P0 | Integrate frontend/backend | Benjamin + Vlad | core APIs/UI | real computed flow |
| P0 | Full-path acceptance test | Bogdan | integration | reproducible demo |
| P1 | Confidence/event animations | Vlad | P0 stable | wow polish |
| P1 | Audit decision viewer | Benjamin/Vlad | core stable | technical credibility |
| P1 | LLM wording behind fallback | Benjamin | P0 stable | optional language polish |
| P1 | Demo rehearsal + narration | Bogdan | integrated demo | <=90s reliable run |
| P2 | Persist state | Benjamin | only if needed | restart resilience |
| P2 | Additional persona | Team | Elise stable | generalization proof |
| P3 | Extra settings / visual polish | Vlad | everything else | optional |

## Owners

### Bogdan — Product Lead / Orchestrator
- product decisions;
- scope;
- synthetic events;
- acceptance tests;
- demo;
- pitch;
- integration coordination.

### Benjamin — Tech Lead / Backend
- FastAPI;
- event simulator;
- state engine;
- policy engine;
- API;
- persistence if needed;
- deployment.

### Vlad — Frontend / UX
- customer/adviser views;
- KBC-style UI;
- event visualization;
- state/journey UX;
- integration;
- animation/polish.

## First integration checkpoint

Frontend should integrate in this order:
1. reset;
2. play single event;
3. get state;
4. policy evaluate;
5. confirm;
6. get journey;
7. create/get passport.

Do not wait for the full backend before connecting the first three.

## P0 acceptance gate

No P1 work until:
- reset works;
- score actually changes from events;
- threshold creates visible state;
- policy block is real;
- confirmation creates journey;
- passport reaches adviser view.

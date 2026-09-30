# Backend Spec

One FastAPI application. No microservices.

## Modules

### events
- validate/normalize events;
- append to event store;
- expose applied events.

### simulation
- seed Elise;
- deterministic event order;
- reset;
- play one/all;
- idempotency.

### state_engine
- map events to evidence;
- compute score;
- expiry/contradictions;
- state lifecycle.

### policy_engine
- evaluate candidate action;
- safe / confirmation-required / blocked;
- policy codes.

### journeys
- create Home Journey only after confirmation;
- update step progress;
- return current journey.

### consent
- record confirm/reject/pause/share permissions;
- validate passport scope.

### context_passport
- build minimal scoped object;
- expiry/revocation;
- adviser retrieval.

### audit
- append decisions and important mutations;
- no complex analytics needed.

## Suggested package layout

```text
backend/
  app/
    main.py
    api/
    models/
    services/
      simulation.py
      state_engine.py
      policy_engine.py
      journeys.py
      consent.py
      context_passport.py
      audit.py
    repositories/
    seed/
      elise.json
    tests/
```

## Service boundaries

`state_engine` must not know UI copy or credit policy.

`policy_engine` must not calculate confidence.

`journeys` must require confirmed state.

`context_passport` must accept an allowlist of fields, never serialize the full customer object.

## P0 tests

1. reset returns no state;
2. mortgage event creates score 30;
3. repeated MyHome increases score;
4. threshold crossing exposes state;
5. evidence weights sum correctly;
6. blocked mortgage action always blocks;
7. confirmation creates journey;
8. rejection prevents journey;
9. passport requires confirmed state + consent;
10. passport excludes raw events;
11. expiry returns 410;
12. replay is deterministic.

## Deployment priority

Choose the fastest stable deployment available. A locally running backend is acceptable until the full integrated demo works. Do not spend P0 time on infrastructure polish.

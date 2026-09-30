# Mock Data

## Why mock mode exists

KBC Compass must be demoable without production banking data, KBC APIs, CRM, identity, adviser systems or external AI. Mock mode provides one deterministic, fully synthetic end-to-end scenario through the same backend API contract the frontend will use later.

The mock layer is intentionally small. It is not a production fixture platform.

## Source of truth

The canonical demo dataset is:

`backend/app/seed/elise.json`

It contains only fields already required by the current data model, state engine and API contract:

- Customer
- synthetic Event records
- Home Journey step template
- unresolved questions used by the Context Passport

Mutable demo state (applied events, inferred state, journey progress, policy decisions and passports) lives in the in-memory repository and resets deterministically.

## Enable mock mode

```bash
cd backend
export USE_MOCK_DATA=true
uvicorn app.main:app --reload
```

`backend/.env.example` documents the same flag.

The application chooses the repository through `app/repositories/factory.py`:

```text
UI
 ↓
/api contract
 ↓
FastAPI services
 ↓
DemoRepository
 ├─ MockRepository       USE_MOCK_DATA=true
 └─ Real implementation USE_MOCK_DATA=false (future)
```

There is no separate frontend-only mock implementation.

## Seed / validation

The current MVP uses an in-memory repository, so the canonical JSON is the seed itself. Validate it with:

```bash
cd backend
make seed
# or: python -m app.seed.validate
```

This operation is repeatable and does not append or duplicate records.

## Demo persona and scenarios

### Elise Vermeer — home purchase exploration

All details are fictional and synthetic.

Ordered playback:

1. `salary_received` — baseline context, score +0.
2. `mortgage_simulation_completed` — +30.
3. `myhome_repeated_visits` — +15.
4. `rent_pattern_changed` — +18; confidence crosses the 60-point display threshold to 63.
5. `property_document_saved` — +20; final confidence 83.

This creates the happy-path inferred state and provides a visible confidence pattern: 30 → 45 → 63 → 83.

### Attention / blocked action

Evaluating `PRE_APPROVED_MORTGAGE_OFFER` always returns `BLOCK` with `HIGH_IMPACT_CREDIT_DECISION`. This is the canonical warning/risky demo moment.

### Negative scenario

`POST /api/states/state_home/reject` moves the state to `rejected` and no journey is created.

### Empty / initial state

`POST /api/simulation/reset` removes applied events, current state, journey and customer passports. Before the threshold is crossed, `GET /api/customers/elise/state` returns `404 STATE_NOT_FOUND` and `GET /api/customers/elise/journey` returns `404 JOURNEY_NOT_AVAILABLE`.

### Historical/timeline data

The five synthetic events span September 2026 and are ordered by timestamp. They fill the event timeline while keeping all score changes logically derived from the same records.

## Consistency rules

- Confidence is computed from event evidence, never stored as an unrelated mock number.
- `salary_received` contributes zero to home-purchase confidence.
- The final score is 30 + 15 + 18 + 20 = 83.
- Home Journey is created only after explicit confirmation.
- Context Passport fields are allowlisted and exclude raw transaction/event history.
- IDs and timestamps are fixed so refreshes/replays are deterministic.

## Replacing mock data with a real API/repository

Implement `DemoRepository` in `backend/app/repositories/base.py`, then update `get_repository()` in `factory.py` to return that implementation when `USE_MOCK_DATA=false`.

Keep the `/api` request and response shapes stable. The frontend should not need to know which repository is active.

## Useful commands

```bash
cd backend
pip install -r requirements.txt
make seed
make test
make dev
```

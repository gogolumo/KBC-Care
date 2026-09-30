# Backend Integration (for Vlad)

One file to wire the frontend to the KBC Compass backend. Every JSON below is a
**real response** captured from the golden-path script (`backend/scripts/golden_path.py`),
not hand-written. Field names match `docs/API_CONTRACT.md`; additions are marked **(new)**.

## 1. Run it

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate    macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload          # http://127.0.0.1:8000  (docs: /docs)
pytest                                 # all tests
python -m scripts.golden_path --base-url http://127.0.0.1:8000 --quiet   # reliability gate: full flow x2
```

- **Base URL:** `http://127.0.0.1:8000/api`
- **CORS:** `localhost:3000` and `127.0.0.1:3000` are allowed. Other origin (e.g. Vite `5173`) → set
  `CORS_ORIGINS=http://localhost:3000,http://localhost:5173` before starting uvicorn.
- **State is in memory.** Restarting uvicorn = clean state. `POST /simulation/reset` does the same without restart.
- **Deterministic:** same calls → same JSON, except Context Passport `id` (unique `pass_<hex>`) and its `createdAt`/`expiresAt` (real clock). Never hardcode a passport id — use the one returned by `POST /context-passports`.

## 2. Golden demo: customer `elise`

Call order (matches `docs/USER_FLOW.md`):

| # | UI moment | Call | Expect |
|---:|---|---|---|
| 1 | Load persona | `GET /customers/elise` | 200 |
| 2 | Reset | `POST /simulation/reset` | 200, `state: null` |
| 3 | Play events one by one | `POST /simulation/events/:id` ×5 (or `POST /simulation/play` `{"mode":"next"}`) | top-level `confidence` `0 → 30 → 45 → 63 → 83`; `state` non-null from 63 |
| 4 | Compass card | `GET /customers/elise/state` | 404 until 63, then 200 |
| 5 | Card copy / Why modal | `GET /customers/elise/state/explanation` **(new)** | 200 |
| 6 | Policy panel (WOW) | `POST /policy/evaluate` `PRE_APPROVED_MORTGAGE_OFFER` | `BLOCK` |
| 7 | "Yes, help me explore" | `POST /states/state_home/confirm` | `status: confirmed`, `journeyId` |
| 8 | Home Journey | `GET /customers/elise/journey` → `POST /journeys/journey_home/steps/budget/complete` | 5 steps |
| 9 | Share modal | `POST /context-passports` | 201 |
| 10 | Adviser view | `GET /context-passports/{passport.id from step 9}` | 200 |

Rejection path: step 7 → `POST /states/state_home/reject` → journey stays 404, proactive policy returns `STATE_NOT_ACTIVE`.

Event IDs in order: `evt_salary` (+0), `evt_mortgage` (+30), `evt_myhome` (+15), `evt_rent` (+18 → 63, card appears), `evt_property_doc` (+20 → 83).

**Rule (TEAM_PLAYBOOK):** render `response.confidence` from the backend; render `response.state` only when non-null; never calculate confidence in the frontend.

## 3. Errors (all endpoints)

```json
{"error": {"code": "STATE_NOT_FOUND", "message": "State not found", "details": {}}}
```

| HTTP | code | When |
|---:|---|---|
| 404 | `CUSTOMER_NOT_FOUND` | unknown customer |
| 404 | `EVENT_NOT_FOUND` | unknown event id |
| 409 | `EVENT_ALREADY_APPLIED` | same event twice (use reset) |
| 404 | `STATE_NOT_FOUND` | below threshold (<60) or after reset — **normal, show generic home** |
| 404 | `JOURNEY_NOT_AVAILABLE` | before confirmation — **normal** |
| 404 | `JOURNEY_STEP_NOT_FOUND` | bad step id |
| 409 | `STATE_NOT_CONFIRMED` | passport before confirm |
| 422 | `INVALID_SCOPE` | passport field outside allowlist |
| 404 | `PASSPORT_NOT_FOUND` | unknown passport |
| 410 | `PASSPORT_EXPIRED` | expired/revoked passport |
| 422 | `VALIDATION_ERROR` | bad body; `details.errors` lists fields |

## 4. Endpoints with real examples

### `GET /health`
```json
{"ok": true, "mockMode": true}
```

### `GET /customers` / `GET /customers/elise`
```json
{"customers": [{"id": "elise", "name": "Elise Vermeer", "personaKey": "home_purchase"}]}
```
```json
{"id": "elise", "name": "Elise Vermeer", "personaKey": "home_purchase"}
```

### `POST /simulation/reset`
Request `{"customerId": "elise"}` →
```json
{"ok": true, "customerId": "elise", "confidence": 0, "state": null, "events": []}
```

### `POST /simulation/events/:eventId`
Request `{"customerId": "elise"}`. Below threshold `state` is `null` but `confidence` is always there:
```json
{"event": {"id": "evt_myhome", "type": "myhome_repeated_visits"}, "confidence": 45, "state": null}
```
At/above threshold `state` is the full state object (same shape as `GET /state` below).

### `POST /simulation/play`
Request `{"customerId": "elise", "mode": "remaining"}` → all remaining events.
Request `{"customerId": "elise", "mode": "next"}` **(new)** → exactly one event; `events: []` when finished.
```json
{
  "events": [
    {"id": "evt_rent", "customerId": "elise", "type": "rent_pattern_changed", "timestamp": "2026-09-27T06:55:00Z",
     "source": "core_banking", "metadata": {"previousMonthlyAmount": 1125, "currentMonthlyAmount": 1185, "currency": "EUR", "changePercent": 5.33}}
  ],
  "confidence": 63,
  "state": {"id": "state_home", "confidence": 63, "status": "inferred", "...": "full state object"}
}
```
`source` is one of `core_banking | myhome | documents | simulation` (use it for the event icon).

### `GET /customers/elise/state`
```json
{
  "state": {
    "id": "state_home",
    "customerId": "elise",
    "type": "possible_home_purchase",
    "confidence": 83,
    "status": "inferred",
    "evidence": [
      {"eventId": "evt_mortgage", "code": "mortgage_simulation", "label": "Used mortgage affordability simulator", "weight": 30, "observedAt": "2026-09-18T19:42:00Z", "expiresAt": "2026-10-18T19:42:00Z", "active": true},
      {"eventId": "evt_myhome", "code": "myhome_visits", "label": "Visited MyHome multiple times", "weight": 15, "observedAt": "2026-09-23T20:10:00Z", "expiresAt": "2026-10-07T20:10:00Z", "active": true},
      {"eventId": "evt_rent", "code": "rent_pattern_changed", "label": "Regular housing payment pattern changed", "weight": 18, "observedAt": "2026-09-27T06:55:00Z", "expiresAt": "2026-10-27T06:55:00Z", "active": true},
      {"eventId": "evt_property_doc", "code": "property_document", "label": "Saved a property-related document", "weight": 20, "observedAt": "2026-09-30T12:05:00Z", "expiresAt": "2026-10-30T12:05:00Z", "active": true}
    ],
    "createdAt": "2026-09-18T19:42:00Z",
    "updatedAt": "2026-09-30T12:05:00Z",
    "expiresAt": "2026-10-30T12:05:00Z"
  }
}
```
- `confidence` is an integer 0–100 = sum of evidence `weight`s. Label it **"Compass confidence"**, not probability.
- Show the card only when this returns 200 (threshold 60 is enforced by the backend).
- `status`: `inferred | confirmed | rejected | expired`.

### `GET /customers/elise/state/explanation` **(new)**
```json
{
  "explanation": {
    "headline": "Planning a move or home purchase?",
    "body": "We noticed a few signals (used mortgage affordability simulator; visited MyHome multiple times; regular housing payment pattern changed; saved a property-related document) that may indicate you're exploring a home purchase. We may be wrong - you can confirm, dismiss or pause this kind of help.",
    "source": "template"
  }
}
```
Copy changes with `status` (confirmed → "Your home purchase journey"). `source` is `template` (or `llm` if ever enabled). Optional to use.

### `POST /policy/evaluate`
Request:
```json
{"customerId": "elise", "stateId": "state_home", "action": "PRE_APPROVED_MORTGAGE_OFFER"}
```
Response:
```json
{
  "allowed": false,
  "decision": "BLOCK",
  "policyCode": "HIGH_IMPACT_CREDIT_DECISION",
  "reason": "High-impact credit-related action cannot be derived automatically from behavioral inference.",
  "safeAlternative": "ASK_STATE_CONFIRMATION"
}
```
`safeAlternative` **(new)** = what to show instead (FRONTEND_SPEC "safe alternative"); `null` when not applicable.

Safe action example (`"action": "ASK_STATE_CONFIRMATION"`):
```json
{"allowed": true, "decision": "ALLOW", "policyCode": "CUSTOMER_CONFIRMATION_ALLOWED",
 "reason": "Asking the customer to confirm a temporary hypothesis is reversible and does not make a financial decision.", "safeAlternative": null}
```

Actions and outcomes:

| action | decision | policyCode |
|---|---|---|
| `PRE_APPROVED_MORTGAGE_OFFER`, `AUTOMATIC_MORTGAGE_APPROVAL`, `BEHAVIORAL_CREDIT_SCORING`, `PERSONALIZED_CREDIT_PRICING`, `AUTOMATIC_UNDERWRITING`, `INVESTMENT_SUITABILITY_DECISION`, `INSURANCE_PRICING_DECISION` | `BLOCK` always | `HIGH_IMPACT_CREDIT_DECISION` |
| `CREATE_CONTEXT_PASSPORT`, `SHARE_CONTEXT_WITH_ADVISER` | `REQUIRE_CONFIRMATION` | `CONFIRMED_STATE_REQUIRED` (not confirmed) / `EXPLICIT_SHARE_CONSENT_REQUIRED` |
| `ASK_STATE_CONFIRMATION` | `ALLOW` / `BLOCK` | `CUSTOMER_CONFIRMATION_ALLOWED` / `NO_ACTIVE_STATE` / `STATE_NOT_ACTIVE` |
| `SHOW_HOME_EDUCATION`, `BOOK_KBC_LIVE` | `ALLOW` / `BLOCK` if rejected | `LOW_RISK_ACTION_ALLOWED` / `STATE_NOT_ACTIVE` |
| `SHOW_EVIDENCE`, `SHOW_EXPLANATION` | `ALLOW` | `LOW_RISK_ACTION_ALLOWED` |
| anything else | `BLOCK` | `UNKNOWN_ACTION` |

`decision` enum: `ALLOW | REQUIRE_CONFIRMATION | BLOCK`.

### `POST /states/state_home/confirm`
Request `{"customerId": "elise"}` →
```json
{"state": {"id": "state_home", "status": "confirmed", "confidence": 83, "...": "full state object"}, "journeyId": "journey_home"}
```
Idempotent: a double click does not reset journey progress.

### `POST /states/state_home/reject`
Request `{"customerId": "elise", "reason": "not_relevant"}` →
```json
{"state": {"id": "state_home", "status": "rejected", "...": "full state object"}, "cooldownUntil": "2026-10-30T12:00:00Z"}
```

### `GET /customers/elise/journey`
```json
{
  "journey": {
    "id": "journey_home", "customerId": "elise", "stateId": "state_home", "type": "home_purchase", "status": "active",
    "steps": [
      {"id": "budget", "key": "understand_budget", "title": "Understand budget", "status": "active", "order": 1},
      {"id": "property", "key": "explore_property", "title": "Explore property", "status": "todo", "order": 2},
      {"id": "documents", "key": "prepare_documents", "title": "Prepare documents", "status": "todo", "order": 3},
      {"id": "insurance", "key": "review_insurance", "title": "Review relevant insurance", "status": "todo", "order": 4},
      {"id": "live", "key": "book_kbc_live", "title": "Book KBC Live conversation", "status": "todo", "order": 5}
    ]
  }
}
```
Step `status`: `todo | active | done`. Journey `status`: `active | completed` (completed after the last step).

### `POST /journeys/journey_home/steps/:stepId/complete`
Request `{"customerId": "elise"}` → updated `{"journey": {...}}`. After `budget`: budget `done`, property `active`.

### `POST /context-passports`
Request:
```json
{"customerId": "elise", "purpose": "kbc_live_home_exploration",
 "selectedFields": ["confirmedGoal", "journeyProgress", "unresolvedQuestions"], "ttlHours": 24}
```
Response **201**:
```json
{
  "passport": {
    "id": "pass_3f9c2a7e5b1d4c8e9a0b6d2f1e4c7a95",
    "customerId": "elise",
    "purpose": "kbc_live_home_exploration",
    "fields": {
      "confirmedGoal": "Explore a home purchase",
      "journeyProgress": ["understand_budget"],
      "unresolvedQuestions": ["Which documents should I prepare before speaking to an adviser?", "How much buffer should I keep after purchase costs?"]
    },
    "createdAt": "2026-09-30T20:15:42.118431Z",
    "expiresAt": "2026-10-01T20:15:42.118431Z",
    "revokedAt": null
  }
}
```
- Allowed `selectedFields`: `confirmedGoal`, `journeyProgress`, `unresolvedQuestions`. Only selected ones are returned.
- `ttlHours` 1–168 (outside → 422 `VALIDATION_ERROR`). `id`, `createdAt`, `expiresAt` differ on every call (example values above).

### `GET /context-passports/{id}` (Adviser view)
200 → same `{"passport": {...}}` as above. Expired → 410 `PASSPORT_EXPIRED`.

## 5. TypeScript types (copy into the frontend)

```ts
export type Evidence = { eventId: string; code: string; label: string; weight: number; observedAt: string; expiresAt: string; active: boolean }
export type CustomerState = {
  id: string; customerId: string; type: "possible_home_purchase"; confidence: number
  status: "inferred" | "confirmed" | "rejected" | "expired"
  evidence: Evidence[]; createdAt: string; updatedAt: string; expiresAt: string
}
export type CustomerEvent = { id: string; customerId: string; type: string; timestamp: string; source: "core_banking" | "myhome" | "documents" | "simulation"; metadata: Record<string, unknown> }
export type PolicyResult = { allowed: boolean; decision: "ALLOW" | "REQUIRE_CONFIRMATION" | "BLOCK"; policyCode: string; reason: string; safeAlternative: string | null }
export type JourneyStep = { id: string; key: string; title: string; status: "todo" | "active" | "done"; order: number }
export type Journey = { id: string; customerId: string; stateId: string; type: "home_purchase"; status: "active" | "completed"; steps: JourneyStep[] }
export type ContextPassport = { id: string; customerId: string; purpose: string; fields: Partial<{ confirmedGoal: string; journeyProgress: string[]; unresolvedQuestions: string[] }>; createdAt: string; expiresAt: string; revokedAt: string | null }
export type ApiError = { error: { code: string; message: string; details: Record<string, unknown> } }
```

## 6. Known limits (MVP)

- One customer (`elise`). Emma/Lucas/Lina from issue #2 are **not** implemented (legacy MomentOS, see `docs/DECISIONS.md` D002/D014).
- No "Pause" endpoint yet — it is in `USER_FLOW.md` but not in `API_CONTRACT.md` (pending decision).
- `cooldownUntil` is a fixed demo date; evidence expiry is not re-evaluated against a live clock (demo determinism).
- No auth. Local only.

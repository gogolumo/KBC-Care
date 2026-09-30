# API Contract

Base path: `/api`. JSON only.

## Error shape

```json
{
  "error": {
    "code": "STATE_NOT_FOUND",
    "message": "State not found",
    "details": {}
  }
}
```

## Customers

### GET /customers
Response `200`:
```json
{"customers":[{"id":"elise","name":"Elise","personaKey":"home_purchase"}]}
```

### GET /customers/:id
`200` customer object. `404 CUSTOMER_NOT_FOUND`.

## Simulation

### POST /simulation/reset
Request:
```json
{"customerId":"elise"}
```
Response:
```json
{"ok":true,"customerId":"elise","confidence":0,"state":null,"events":[]}
```

### GET /simulation/status?customerId=elise
Read the current deterministic demo progress without mutating it.

Response:
```json
{
  "customerId": "elise",
  "confidence": 30,
  "state": null,
  "events": [
    {"id": "evt_salary", "type": "salary_received"},
    {"id": "evt_mortgage", "type": "mortgage_simulation_completed"}
  ]
}
```

The frontend uses this endpoint on load/refresh so partial event playback is restored instead of resetting the backend.

### POST /simulation/events/:eventId
Inject one predefined event.

Response:
```json
{
  "event":{"id":"evt_mortgage","type":"mortgage_simulation_completed"},
  "confidence":30,
  "state":null
}
```

The `confidence` field is always computed by the backend and is the frontend source of truth for the visible 0 → 30 → 45 → 63 → 83 progression. `state` remains `null` until the 60-point activation threshold is crossed.

Errors: `404 EVENT_NOT_FOUND`, `409 EVENT_ALREADY_APPLIED`.

### POST /simulation/play
Request:
```json
{"customerId":"elise","mode":"remaining"}
```
Response: ordered applied events + backend-computed `confidence` + final state.

## State

### GET /customers/:id/state
Response:
```json
{
  "state":{
    "id":"state_home",
    "type":"possible_home_purchase",
    "confidence":83,
    "status":"inferred",
    "expiresAt":"2026-10-30T12:00:00Z",
    "evidence":[
      {"code":"mortgage_simulation","label":"Used mortgage affordability simulator","weight":30},
      {"code":"myhome_visits","label":"Visited MyHome multiple times","weight":15}
    ]
  }
}
```

### POST /states/:id/confirm
Request:
```json
{"customerId":"elise"}
```
Response:
```json
{"state":{"id":"state_home","status":"confirmed"},"journeyId":"journey_home"}
```

### POST /states/:id/reject
Request:
```json
{"customerId":"elise","reason":"not_relevant"}
```
Response: rejected state + cooldownUntil.

## Journey

### GET /customers/:id/journey
Response:
```json
{
  "journey":{
    "id":"journey_home",
    "type":"home_purchase",
    "steps":[
      {"id":"budget","title":"Understand budget","status":"active"},
      {"id":"property","title":"Explore property","status":"todo"},
      {"id":"documents","title":"Prepare documents","status":"todo"},
      {"id":"insurance","title":"Review relevant insurance","status":"todo"},
      {"id":"live","title":"Book KBC Live conversation","status":"todo"}
    ]
  }
}
```
Before confirmation: `404 JOURNEY_NOT_AVAILABLE`.

### POST /journeys/:id/steps/:stepId/complete
Response: updated journey.

## Policy

### POST /policy/evaluate
Request:
```json
{"customerId":"elise","stateId":"state_home","action":"PRE_APPROVED_MORTGAGE_OFFER"}
```
Response:
```json
{
  "allowed":false,
  "decision":"BLOCK",
  "policyCode":"HIGH_IMPACT_CREDIT_DECISION",
  "reason":"High-impact credit-related action cannot be derived automatically from behavioral inference."
}
```

## Context Passport

### POST /context-passports
Request:
```json
{
  "customerId":"elise",
  "purpose":"kbc_live_home_exploration",
  "selectedFields":["confirmedGoal","journeyProgress","unresolvedQuestions"],
  "ttlHours":24
}
```

Response `201`:
```json
{
  "passport":{
    "id":"pass_001",
    "expiresAt":"2026-10-01T18:00:00Z",
    "fields":{
      "confirmedGoal":"Explore a home purchase",
      "journeyProgress":["understand_budget"],
      "unresolvedQuestions":["What documents should I prepare?"]
    }
  }
}
```

Errors:
- `409 STATE_NOT_CONFIRMED`
- `403 CONSENT_REQUIRED`
- `422 INVALID_SCOPE`

### GET /context-passports/:id
Returns passport if not expired/revoked; otherwise `410 PASSPORT_EXPIRED`.

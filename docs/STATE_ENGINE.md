# State Engine

## Event model

```ts
type CustomerEvent = {
  id: string
  customerId: string
  type: string
  timestamp: string
  source: "core_banking" | "myhome" | "documents" | "simulation"
  metadata: Record<string, unknown>
}
```

## State model

```ts
type CustomerState = {
  id: string
  customerId: string
  type: "possible_home_purchase"
  confidence: number
  status: "inferred" | "confirmed" | "rejected" | "expired"
  evidence: Evidence[]
  createdAt: string
  updatedAt: string
  expiresAt: string
}
```

## Evidence model

```ts
type Evidence = {
  eventId: string
  code: string
  label: string
  weight: number
  observedAt: string
  expiresAt: string
  active: boolean
}
```

## Scoring

Use integer points, capped at 100.

| Signal | Weight | Evidence label |
|---|---:|---|
| `mortgage_simulation_completed` | +30 | Used mortgage affordability simulator |
| `myhome_repeated_visits` | +15 | Visited MyHome multiple times |
| `property_document_saved` | +20 | Saved a property-related document |
| `rent_pattern_changed` | +18 | Regular housing payment pattern changed |
| `explicit_home_goal` | +40 | Explicitly stated home-purchase goal |

`salary_received` contributes **0** to home-purchase confidence. It appears in the event stream as baseline context but must not be used as fake evidence.

### Formula

```text
confidence = clamp(
  sum(active positive evidence weights)
  - sum(active contradiction penalties),
  0,
  100
)
```

No opaque ML probability is implied. UI should label this as **Compass confidence**, not “78% probability you are buying a home.”

## Thresholds

- 0–39: no proactive state card.
- 40–59: internal/passive hypothesis only; no proactive claim.
- 60–100: show `Possible Home Purchase` with uncertainty wording and confirmation controls.
- Customer confirmation: status becomes `confirmed` regardless of numeric score; score remains visible as inference history if useful.
- Rejection: status becomes `rejected`; suppress reactivation for 30 simulated days.

## Freshness

Default state lifetime: **30 days from latest active evidence**.

Evidence TTL:
- simulator: 30d;
- MyHome repeated visits: 14d;
- property document: 30d;
- rent pattern change: 30d;
- explicit confirmed goal: customer-controlled, not inferred TTL.

On every event/read, recompute active evidence. If score drops below 60 due to expiry, state becomes `expired`.

## Contradictions

MVP contradiction example:
- `home_interest_dismissed`: -50 and sets rejection cooldown.
- `rent_resumed_normal_pattern`: -15 if state still inferred.

Contradictions are evidence, not proof that the opposite is true.

## Confirmation

`POST /states/:id/confirm`:
- sets status = confirmed;
- records consent/confirmation timestamp;
- creates Home Journey;
- prevents automatic score decay from deleting the declared goal.

## Rejection

`POST /states/:id/reject`:
- sets status = rejected;
- records reason if supplied;
- no journey;
- cooldown suppresses equivalent proactive inference.

## Invariants

1. Every score contribution must map to evidence.
2. Every evidence item must map to one or more event IDs.
3. No LLM can mutate confidence.
4. No policy decision can be encoded inside the state engine.
5. Confirmation and rejection are explicit user actions, never inferred.

# User Flow

## Canonical demo flow

```text
Select Elise
↓
Generic KBC dashboard
↓
Start simulation
↓
Events enter system
↓
Compass confidence increases
↓
Possible Home Purchase appears
↓
Open "Why am I seeing this?"
↓
Evidence shown
↓
Unsafe credit action is BLOCKED
↓
Safe confirmation action proposed
↓
Elise clicks "Yes, help me explore"
↓
UI adapts
↓
Home Journey appears
↓
Journey progress
↓
"Share with KBC Live"
↓
Consent preview
↓
Context Passport generated
↓
Adviser View
↓
Approved context only
```

## Step-by-step contract

| Step | Screen | User action | Backend event/API | State change | UI response |
|---:|---|---|---|---|---|
| 1 | Persona selector | Select Elise | `GET /customers/elise` | none | Elise loaded |
| 2 | KBC Home | Start simulation | `POST /simulation/reset`, then play | clean state | generic dashboard |
| 3 | Event stream | Play next/all | `POST /simulation/events/:eventId` | evidence accumulates | event appears |
| 4 | Compass card | none | `GET /customers/elise/state` | score crosses 60 | hypothesis card appears |
| 5 | Why modal | Open details | state response | none | evidence + freshness shown |
| 6 | Policy panel | Trigger evaluate | `POST /policy/evaluate` | policy decision logged | mortgage offer = BLOCKED |
| 7 | Compass card | Yes, help me explore | `POST /states/:id/confirm` | inferred → confirmed | card changes to confirmed goal |
| 8 | Home Journey | Progress one task | `POST /journeys/:id/steps/:stepId/complete` | journey progress | checklist updates |
| 9 | Share modal | Share with KBC Live | preview then `POST /context-passports` | consent record + passport | scoped preview + success |
| 10 | Adviser view | Switch role | `GET /context-passports/:id` | none | approved context displayed |

## Rejection path

If Elise selects **Not relevant**:
- state becomes `rejected`;
- journey is not created;
- inferred card disappears or becomes a dismissed audit item;
- future demo events do not immediately reactivate the same state during the cooldown.

Cooldown for MVP: 30 days (simulated).

## Pause path

**Pause this kind of help** creates a consent/preferences flag that suppresses the state card and related proactive action. Events may still exist in the demo log, but no proactive journey is shown.

## Context Passport preview

Before sharing, show exactly:
- Confirmed goal: Exploring a home purchase.
- Journey progress.
- Unresolved question(s).
- Sharing purpose: KBC Live home exploration conversation.
- Expiry: 24 hours.
- Excluded: raw transaction history, full event log, unrelated products.

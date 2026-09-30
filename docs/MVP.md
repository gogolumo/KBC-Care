# MVP Scope

## Scenario

**Elise — Possible Home Purchase → confirmed Home Journey → Context Passport**

This is the only P0 end-to-end journey.

## Must work (P0)

1. Synthetic customer event stream.
2. Events influence an actual computed state.
3. Multiple signals contribute to confidence.
4. `possible_home_purchase` appears dynamically at threshold.
5. Evidence is visible.
6. Confidence is visible.
7. State has expiry/freshness.
8. Policy engine blocks unsafe credit action.
9. Customer can confirm, reject or pause.
10. Confirmation changes state to `confirmed`.
11. Home Purchase Journey appears dynamically.
12. Customer can select/share context.
13. Adviser view receives a Context Passport.
14. Reset produces a deterministic clean demo.

## Synthetic event order

| # | Event | Score effect | Demo purpose |
|---:|---|---:|---|
| 1 | `salary_received` | 0 | baseline event, no home inference |
| 2 | `mortgage_simulation_completed` | +30 | strong explicit digital intent |
| 3 | `myhome_repeated_visits` | +15 | supporting intent |
| 4 | `rent_pattern_changed` | +18 | ambiguous but relevant behavior |
| 5 | `property_document_saved` | +20 | strong supporting evidence |

After events 2–5 score reaches **83**. UI may display 30 → 45 → 63 → 83.

Activation threshold: **60**.

## Mocked

- KBC APIs;
- core banking;
- real payments;
- mortgage application/approval;
- credit scoring;
- CRM;
- adviser calendar;
- real push;
- open banking;
- customer identity/auth;
- real customer data.

## Explicitly out of scope

- universal life-event detection;
- production ML;
- real underwriting;
- actual credit decisioning;
- production security infrastructure;
- every KBC journey;
- Kate clone;
- autonomous agents;
- multi-persona demo before Elise works end-to-end.

## P1

- smooth event animation;
- visible state decay timer;
- journey progress animation;
- Context Passport expiry countdown;
- replay controls;
- one additional persona only after P0 is stable.

## P2

- persistence beyond a browser/demo session;
- richer audit viewer;
- LLM-generated copy toggle;
- extra journey branches.

## Definition of done

A fresh reset can be demoed from start to adviser handoff without manual database edits, hidden state changes or fake frontend-only transitions.

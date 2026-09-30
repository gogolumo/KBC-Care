# KBC MomentOS — Hackathon Concept

## One-line idea
KBC MomentOS is a customer-context intelligence layer underneath KBC channels. It continuously turns fragmented customer signals into an explainable, confidence-scored customer state, then decides whether KBC should recommend, ask, educate, wait, escalate, or suppress.

## Why this is not "another Kate"
KBC already has Kate, proactive situations, Kate Brain, personalised offers, ecosystem services and GenAI capabilities. Our MVP therefore does **not** build another chatbot.

The conceptual leap is:

```
predefined proactive situations
→ continuously evolving customer state
→ trust-aware next best behaviour
→ adaptive experience across channels
```

MomentOS should be presented as a possible next abstraction underneath Kate, KBC Mobile, KBC Live and adviser experiences.

## Core loop

```
customer events
→ signal detection
→ context / intent inference
→ customer state
→ confidence + trust policy
→ next best behaviour
→ personalised channel experience
→ feedback
→ updated state
```

## Allowed next-best behaviours

The engine does not only recommend products.

```
RECOMMEND
ASK
EDUCATE
WAIT
ESCALATE
SUPPRESS
```

The ability to choose WAIT or SUPPRESS is a key part of the value proposition.

## MVP users

### Emma — home-purchase intent
Synthetic events:
- salary increases
- savings increase
- mortgage calculator visited repeatedly
- MyHome visited repeatedly

Expected state:
- intent: HOME_PURCHASE
- confidence progresses visually, e.g. 34% → 51% → 69% → 86%
- best behaviour: ASK / RECOMMEND
- UI adapts around affordability and home journey

### Lucas — vehicle replacement
Synthetic events:
- car repair payment
- increased savings
- MyMobility visits
- vehicle-related browsing signal

Expected state:
- intent: VEHICLE_REPLACEMENT
- confidence rises as signals accumulate
- UI adapts to mobility journey

### Lina — income disruption
Synthetic events:
- salary stops
- benefits payment appears
- balance declines
- savings withdrawal

Expected state:
- state: INCOME_DISRUPTION
- high confidence
- commercial recommendations suppressed
- support/cash-flow help replaces sales content

This is the trust moment: personalization is not only about selling more.

## Trust layer — "Mirror Me"

Every inferred state must be inspectable.

Customer can see:
- what KBC thinks is happening
- confidence
- evidence/signals used
- "Why am I seeing this?"
- confirm inference
- reject inference
- manage allowed signal categories

Example:

```
Exploring buying a home
Confidence: 82%

Why?
- mortgage calculator ×3
- MyHome visits ×5
- savings growth

[Yes, that's right]
[Not relevant]
[Manage signals]
```

Rejecting the inference should immediately change the state and experience.

## Architecture

```
Synthetic Event Stream
        ↓
Signal Processor
        ↓
Customer Feature Store
        ↓
Intent / Context Inference
        ↓
Customer State JSON
        ↓
Trust + Policy Engine
        ↓
Next Best Behaviour
        ↓
Channel Renderer
   ↙       ↓        ↘
Mobile    Kate    Adviser
```

## Hackathon stack

### Frontend
- Next.js / React
- Tailwind
- mock JSON first

### Backend
- FastAPI
- simple REST endpoints

### Database
- Supabase / Postgres

Suggested tables:
- customers
- events
- signals
- customer_states
- inferences
- actions
- feedback
- consents

### AI
Use a hybrid approach:
- deterministic feature scoring for predictable demo behaviour
- LLM for state interpretation / explanation where useful
- deterministic policy guardrails after LLM output

Do **not** train a model during the hackathon.

## Minimal API contract

### POST /api/events
Add a synthetic customer event.

### GET /api/customers/:id/state
Return current state and hypotheses.

Example:
```json
{
  "customer_id": "emma",
  "states": [
    {
      "type": "HOME_PURCHASE",
      "confidence": 0.86,
      "evidence": [
        "salary_increase",
        "savings_growth",
        "mortgage_simulation",
        "myhome_activity"
      ]
    }
  ]
}
```

### GET /api/customers/:id/action
Return trust-aware next best behaviour.

```json
{
  "behaviour": "ASK",
  "channel": "MOBILE",
  "reason": "High-confidence home-purchase intent should be confirmed before deeper personalization."
}
```

### POST /api/customers/:id/feedback
Customer confirms or rejects an inference.

## P0 scope

Must work:
1. Three synthetic customers.
2. Events can be triggered during demo.
3. Confidence/state visibly changes.
4. State endpoint returns explanation/evidence.
5. Frontend adapts for Emma.
6. Commercial content is suppressed for Lina.
7. "Why am I seeing this?" works.
8. Rejecting an inference updates the UI.

## P1
- dashboard of 20 synthetic customers
- adviser/KBC Live view consuming the same customer state
- polished transitions
- clear trust/consent panel

## P2 / cut first
- real bank APIs
- full authentication
- trained ML model
- multiple agent framework
- production-grade event infrastructure
- more than 3 detailed journeys
- complex permissions system

## 90-second demo

### 0–10 sec
Show a normal banking experience.

Message:
"Transactions tell a bank what happened. MomentOS tries to understand what is happening."

### 10–25 sec
Trigger Emma events in the event stream.

### 25–35 sec
Show confidence rising:
34% → 51% → 69% → 86%.

### 35–50 sec
Customer experience adapts around the home-purchase journey.

### 50–60 sec
Open "Why am I seeing this?" and show evidence + confidence.
Confirm the inference.

### 60–75 sec
Switch to Lina. Trigger income-disruption events.
Commercial content disappears and support replaces it.

### 75–90 sec
Show overview of multiple synthetic customers.

Closing line:
"We did not build 20 customer journeys. We built one engine that understands 20 customer contexts."

## Product principles
- customer state is a hypothesis, not a fact
- uncertainty is visible
- explicit confirmation beats silent profiling
- the best action can be no action
- sensitive/high-impact actions require confirmation or human handoff
- synthetic data only for MVP
- demo clarity beats production completeness

# KBC Compass — Product Explainer

## What KBC Compass is

KBC Compass is a context and orchestration layer between customer signals and bank actions.

It does not start with “which product should we sell?”. It starts with a safer question: **what situation might this customer be in right now, how strong is the evidence, and what is appropriate to do next?**

Compass combines multiple weak signals into a temporary, explainable customer context. The customer can confirm or reject that context. A deterministic policy layer then controls which actions are allowed, blocked, or require confirmation.

## The problem it solves

Banks already observe many useful signals: transactions, simulator usage, product journeys, documents and service interactions. The difficult part is not collecting another signal. The difficult part is connecting several weak signals into a coherent situation without treating an inference as fact.

A traditional recommendation flow can become:

```text
Customer used mortgage simulator
→ show mortgage offer
```

Compass separates the reasoning:

```text
Several independent signals
→ temporary context hypothesis
→ explanation + confidence
→ policy check
→ customer confirmation
→ useful journey
```

## What happens to Elise

Elise is the synthetic demo customer.

Five events arrive:

1. salary received;
2. mortgage simulation completed;
3. repeated MyHome visits;
4. housing payment pattern changed;
5. property document saved.

The first event does not contribute to the home-purchase score. The next four contribute deterministic weights. The score progresses:

```text
0 → 30 → 45 → 63 → 83
```

At 60, Compass can surface a temporary **Possible Home Purchase** context. It does not claim Elise is definitely buying a home.

Elise sees why the context appeared and can choose:

- **Yes, help me explore**
- **Not relevant**

If she confirms, the experience changes into a Home Journey. Later she can explicitly choose which context to share with KBC Live.

## What the State Engine does

The State Engine turns ordered synthetic events into evidence and a temporary customer state.

For this MVP it is deterministic:

```text
same events
→ same evidence
→ same score
→ same state
```

The score is a rule score, not a probability and not a credit score.

The State Engine answers:

> “What customer situation is currently supported by the available evidence?”

It does **not** decide whether KBC is allowed to take a particular commercial or financial action.

## What the Policy Engine does

The Policy Engine answers a different question:

> “Given this context, what may KBC safely do next?”

The demo deliberately evaluates a pre-approved mortgage offer. The engine blocks it because a high-impact credit-related action must not be derived automatically from behavioral inference.

That distinction is the core of the product:

```text
understanding context ≠ permission to act
```

A safe alternative is to ask Elise to confirm the context and then offer educational, customer-controlled next steps.

## Why customer confirmation matters

Compass treats inferred context as temporary and contestable.

Customer confirmation:

- prevents a weak inference from silently becoming a “fact”;
- gives the customer control over personalization;
- unlocks a more relevant journey only when the context is useful;
- creates a clean boundary between observed behavior and declared intent.

Rejection is equally important. If Elise says the suggestion is not relevant, the experience backs off.

## Why this is not just a recommendation engine

A recommendation engine usually optimizes **what to show**.

Compass first determines **what the bank believes is happening**, shows the evidence, makes that belief temporary, checks policy, and asks the customer to confirm it before adapting the journey.

The product is therefore an intelligence/orchestration layer:

```text
signals
→ context
→ consent
→ policy
→ experience
```

not simply:

```text
signal
→ product recommendation
```

## Why this is different from Kate

Kate is a customer-facing assistant and an established part of KBC's digital ecosystem. Compass is not intended to replace or recreate Kate.

Compass sits underneath channels. A channel such as KBC Mobile, Kate or KBC Live could consume the same confirmed customer context and policy decision.

The demo's claim is therefore not “KBC has no personalization today.” The claim is that a shared, explainable and customer-controlled context layer could make personalization more coherent across channels.

## Why this can scale

The state and policy logic in the MVP is deterministic and inexpensive per customer. The repository includes load-test tooling that addresses a synthetic population of up to two million customer IDs without pre-allocating all of them.

The current hackathon implementation is intentionally one FastAPI process with in-memory mutable state. That is **not** the production architecture.

A production path is:

```text
events
→ stateless state/policy workers
→ shared state store / event history
→ channel APIs
```

with customer-partitioned storage, caching and horizontally scalable workers.

The defensible statement is: **the design has a clear path to bank-scale populations; the hackathon laptop is not claimed to serve two million simultaneous users.**

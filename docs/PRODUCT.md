# Product — KBC Compass

## Problem

KBC can observe many customer interactions across banking, insurance, digital journeys and service channels. Public research shows strong proactive personalization already exists. The product opportunity is therefore not “more recommendations.”

The proposed gap is a shared, temporary state contract that can connect multiple weak signals, expose uncertainty, let the customer correct the interpretation, and coordinate the next helpful step across channels.

## Target customer

Primary MVP persona: **Elise**, a customer who may be exploring a home purchase.

Secondary user: a KBC Live adviser who receives only customer-approved context.

## KBC context

Research indicates KBC already has Kate, proactive situations, MyHome/MyMobility ecosystems and personalized digital experiences. Compass must be complementary:

- **Kate:** interaction channel.
- **MyHome:** domain journey.
- **Compass:** proposed cross-channel state/evidence/consent/policy layer.

Do not claim internal KBC architecture lacks such a capability; public sources cannot prove that.

## Product thesis

> **KBC Compass helps KBC understand situations, not just transactions.**

More precisely: Compass proposes a way to convert fragmented observed signals into a **temporary hypothesis**, not a fact.

## Why another chatbot is not the solution

A chatbot can explain or converse, but it does not solve the core product problem:
- fragmented signals;
- uncertainty;
- cross-channel state;
- explainability;
- consent;
- action policy;
- state expiry;
- customer correction.

Compass may use Kate as a channel, but is not Kate.

## Value proposition

For customers:
- less repetition;
- context-aware help;
- explicit uncertainty;
- visible evidence;
- ability to confirm, reject or pause;
- scoped sharing to a human.

For KBC:
- a reusable state abstraction across journeys;
- clearer separation between inference and high-impact decisions;
- auditable policy decisions;
- a consistent handoff contract between channels.

## Differentiators

1. Multi-signal state, not one trigger.
2. Temporary confidence + expiry, not permanent labels.
3. Customer-visible evidence.
4. Confirmation converts hypothesis into declared goal.
5. Deterministic policy guardrail.
6. Journey orchestration, not product recommendation.
7. Context Passport for minimal, scoped human handoff.

## Core concepts

| Concept | Meaning |
|---|---|
| Event | Observed synthetic occurrence |
| Evidence | Human-readable contribution from an event |
| Customer State | Temporary inferred hypothesis |
| Confidence | Deterministic score from active evidence |
| Freshness | Time relevance of evidence/state |
| Consent | Permission for specific action/data use |
| Policy Decision | Allowed / confirmation-required / blocked |
| Journey | Helpful task sequence after confirmation |
| Context Passport | Customer-approved handoff summary |

## Product principles

- Say what you noticed, not what you assume.
- Hypothesis ≠ fact.
- Customer confirmation outranks inference.
- High-impact financial decisions never come from behavioral inference.
- Prefer reversible help.
- Minimize shared context.
- Expire inferred context automatically.
- LLM language is presentation, not truth.
- One complete journey beats ten partial journeys.

## Success criteria

The MVP succeeds if a judge can see, without explanation-heavy slides:
1. events actually change a computed state;
2. multiple signals contribute to confidence;
3. evidence is inspectable;
4. unsafe credit action is blocked;
5. customer confirmation materially changes the UI;
6. adviser receives only customer-approved context.

Non-goal: proving production-scale model accuracy.

# KBC Compass — Pitch Cheatsheet

## 30-second explanation

KBC already sees many customer signals, but a single signal rarely explains what is actually happening in someone's life. KBC Compass combines several weak signals into a temporary, explainable customer context. It shows the evidence, asks the customer to confirm or reject it, and uses a policy layer to block inappropriate automation. Only then does the banking experience adapt.

## 60-second explanation

Imagine Elise is considering buying a home. KBC sees separate pieces: she uses a mortgage simulator, revisits MyHome, her housing payment pattern changes and she saves a property document. None of those proves intent by itself.

Compass combines the signals and forms a temporary “Possible Home Purchase” context with an explainable rule score. Before Elise confirms anything, the policy engine blocks a pre-approved mortgage action: understanding context does not equal permission to make a credit decision.

Elise can see why the suggestion appeared and confirm or reject it. If she confirms, a personalized Home Journey activates. If she later talks to KBC Live, she explicitly chooses which context to share. The same context layer could sit underneath KBC Mobile, Kate and adviser channels.

## Three key differentiators

1. **Multi-signal context, not single-event targeting.** Compass waits for a pattern instead of reacting aggressively to one click or transaction.
2. **Inference is visible and contestable.** The customer sees why the context exists and can confirm or reject it.
3. **Policy is separate from inference.** The system can understand a situation while still blocking an inappropriate action.

## Three things not to claim

1. Do not claim KBC currently lacks personalization or customer understanding.
2. Do not call the 83 score an 83% probability that Elise is buying a home. It is a deterministic rule score.
3. Do not claim the current laptop/backend supports two million concurrent users. The project demonstrates a scalable architecture path and load tooling for a bank-scale customer population.

## Five judge questions

### 1. Isn't this just another recommendation engine?

No. A recommendation engine focuses on what to show. Compass first creates a temporary context from multiple signals, exposes the evidence, applies policy, and gives the customer control before adapting the journey.

### 2. Isn't this just Kate?

No. Kate is a customer-facing channel/assistant. Compass is designed as a context and policy layer underneath channels. Kate could be one consumer of Compass context, alongside KBC Mobile and KBC Live.

### 3. What is the AI here if the demo is deterministic?

The important design decision is that high-impact inference and policy behavior are deterministic and auditable in the MVP. In a production system, models could help extract or rank signals and generate explanations, but policy boundaries should remain explicit. The hackathon demo prioritizes a trustworthy decision loop over hiding critical logic inside an LLM.

### 4. What if Compass is wrong?

The state is temporary, evidence is visible, and Elise can reject it. The product deliberately distinguishes inferred context from confirmed intent.

### 5. How does this scale?

Per-customer state/policy computation is lightweight and the repository includes bounded load tests and synthetic addressing for up to two million customer IDs. The current in-memory demo is single-process; production scale requires stateless workers with shared persistence.

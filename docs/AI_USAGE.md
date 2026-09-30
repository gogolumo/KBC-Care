# AI Usage

## Principle

Do not build fake AI. The product intelligence is primarily **deterministic** because the important decisions must be inspectable and demo-reliable.

## Deterministic intelligence

- event → evidence mapping;
- confidence;
- expiry;
- contradiction;
- confirmation/rejection;
- consent;
- policy;
- journey activation.

## Generative AI

Optional uses:
1. convert structured evidence into plain-language explanation;
2. summarize approved Context Passport for adviser;
3. rewrite journey copy in a concise tone.

## Never delegated to LLM

- state truth;
- confidence;
- customer consent;
- credit eligibility;
- approval;
- pricing;
- underwriting;
- investment suitability;
- policy decision.

## Structured explanation prompt

Input:
```json
{
  "task":"explain_state",
  "state":{
    "label":"Possible Home Purchase",
    "status":"inferred",
    "confidence":83,
    "expiresInDays":30
  },
  "evidence":[
    {"label":"Used mortgage affordability simulator"},
    {"label":"Visited MyHome multiple times"},
    {"label":"Housing payment pattern changed"},
    {"label":"Saved a property-related document"}
  ],
  "rules":{
    "mustExpressUncertainty":true,
    "mustNotClaimIntentAsFact":true,
    "maxSentences":2
  }
}
```

Expected output schema:
```json
{
  "headline":"Planning a move or home purchase?",
  "body":"We noticed a few signals that may indicate you're exploring a home purchase. We may be wrong — you can confirm, dismiss or pause this kind of help."
}
```

## Adviser summary prompt

The LLM receives **only passport fields**, never the full customer/event object.

Output schema:
```json
{
  "summary":"Elise confirmed she is exploring a home purchase and has started the budget step. Her unresolved question is which documents to prepare."
}
```

## Fallback

All P0 copy must have deterministic templates. If the LLM call fails, the demo behaves identically except wording.

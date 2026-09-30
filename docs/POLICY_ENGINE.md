# Policy Engine

## Purpose

The Policy Engine answers: **given the state, action and consent, is this action allowed?**

It is deterministic and separate from state scoring.

## Action classes

### SAFE
- show explanation;
- show evidence;
- budgeting/home-buying education;
- ask for confirmation;
- journey navigation;
- suggest booking a KBC Live conversation.

### REQUIRE_CONFIRMATION
- create/share Context Passport;
- share confirmed goal with adviser;
- combine additional optional signal categories;
- any action that expands data scope.

### BLOCKED
- automatic mortgage approval;
- behavioral credit scoring;
- personalized credit pricing;
- automatic underwriting;
- investment suitability;
- insurance coverage/pricing decision;
- any high-impact financial decision derived from inferred behavior.

## Interface

```ts
type PolicyResult = {
  allowed: boolean
  decision: "ALLOW" | "REQUIRE_CONFIRMATION" | "BLOCK"
  reason: string
  policyCode: string
}

evaluateAction(state, action, consent): PolicyResult
```

## Canonical blocked example

Request:
```json
{
  "action": "PRE_APPROVED_MORTGAGE_OFFER",
  "stateStatus": "inferred",
  "stateType": "possible_home_purchase"
}
```

Response:
```json
{
  "allowed": false,
  "decision": "BLOCK",
  "reason": "High-impact credit-related action cannot be derived automatically from behavioral inference.",
  "policyCode": "HIGH_IMPACT_CREDIT_DECISION"
}
```

## Canonical safe example

```json
{
  "allowed": true,
  "decision": "ALLOW",
  "reason": "Asking the customer to confirm a temporary hypothesis is reversible and does not make a financial decision.",
  "policyCode": "CUSTOMER_CONFIRMATION_ALLOWED"
}
```

## Context sharing

Sharing requires:
- state status = confirmed;
- explicit share action;
- visible preview;
- purpose;
- expiry;
- selected fields.

Without all five: `REQUIRE_CONFIRMATION` or `BLOCK`.

## Evaluation order

1. Is action categorically prohibited? → BLOCK.
2. Does action share/expand data scope? → REQUIRE_CONFIRMATION unless valid consent present.
3. Is state rejected/expired? → BLOCK proactive journey action.
4. Is action low-risk/reversible? → ALLOW.
5. Unknown action → BLOCK by default.

Unknown-by-default is safer and easier to demo than permissive fallthrough.

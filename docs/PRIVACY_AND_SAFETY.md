# Privacy and Safety

This is a product guardrail document, not a legal opinion.

## Core principles

1. **Temporary inference** — inferred states expire.
2. **Customer-visible inference** — show state, evidence and uncertainty.
3. **Correction** — customer can reject.
4. **Pause** — customer can suppress this kind of proactive help.
5. **Data minimization** — share derived context, not raw history.
6. **Confirmation** — declared goal is stronger than behavioral inference.
7. **Scoped sharing** — purpose + fields + expiry.
8. **Human handoff** — important financial decisions go to established process/human.
9. **No high-impact automated financial decisions** from behavioral inference.

> **Say what you noticed, not what you assume.**

## UX wording

Avoid:
- “You are buying a house.”
- “You qualify for a mortgage.”
- “We know you are moving.”

Use:
- “We noticed a few signals that may indicate you're exploring a home purchase.”
- “We may be wrong.”
- “Is this relevant?”

## Sensitive inference exclusions

Do not infer or demo:
- health;
- religion;
- political views;
- ethnicity;
- sexual orientation;
- continuous precise location;
- emotion detection.

## Context Passport minimization

Allowed in MVP:
- confirmed goal;
- journey progress;
- unresolved questions;
- sharing purpose/expiry.

Not allowed:
- raw transaction history;
- full browsing log;
- unrelated balances/products;
- hidden inferred attributes.

## Safety boundary

The “BLOCKED mortgage offer” is not a theatrical warning. It demonstrates an architectural rule: customer-state inference is not a credit decisioning system.

## What is real in MVP

Real:
- deterministic rules;
- policy block;
- consent interaction;
- passport field selection/expiry.

Mocked:
- production identity/security;
- KBC internal authorization;
- actual adviser CRM;
- real legal consent rails.

Do not present mocked controls as production-ready compliance.

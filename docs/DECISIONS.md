# Decision Log

Lightweight ADRs only.

## D001 — One scenario first
**Decision:** Build Elise/Home Purchase end-to-end before any other persona.  
**Why:** reduces integration and storytelling risk.

## D002 — Product name: KBC Compass
**Decision:** Current product/docs use KBC Compass.  
**Why:** matches research recommendation and consent-first state-engine framing.  
**Note:** `KBC_MOMENTOS.md` is legacy context, not current scope.

## D003 — Synthetic data
**Decision:** MVP uses synthetic events/customers only.  
**Why:** no KBC integration dependency; safer and deterministic.

## D004 — Deterministic state engine
**Decision:** Rules + weighted evidence, no LLM/ML confidence.  
**Why:** explainable, testable, reliable in demo.

## D005 — Deterministic policy engine
**Decision:** Policy outcomes are explicit code rules.  
**Why:** high-impact boundaries must not depend on generative output.

## D006 — LLM only for language
**Decision:** optional explanation/summarization.  
**Why:** adds value without becoming source of truth.

## D007 — No credit decisioning
**Decision:** inferred state can never approve, score or price credit.  
**Why:** product safety boundary and clearer architecture.

## D008 — Context Passport
**Decision:** adviser receives customer-approved minimal context.  
**Why:** proves cross-channel continuity without raw surveillance.

## D009 — Monolithic backend
**Decision:** one FastAPI app.  
**Why:** 3-person hackathon; microservices add failure modes.

## D010 — Lightweight persistence first
**Decision:** in-memory + seed JSON until persistence is proven necessary.  
**Why:** demo reliability > infrastructure completeness.

## D011 — Activation threshold
**Decision:** home state appears at score >=60.  
**Why:** requires several signals; avoids one-trigger demo.

## D012 — Current weights
**Decision:** mortgage +30, MyHome +15, rent-pattern +18, property document +20, explicit goal +40; salary +0.  
**Why:** demo-friendly and avoids pretending ordinary salary receipt is evidence of home intent.

## D013 — State expiry
**Decision:** inferred state expires 30 days after latest active evidence.  
**Why:** temporary context is a core trust feature.

## D014 — Multi-persona later
**Decision:** Karim/Sofia or other personas are P2 until Elise is stable.  
**Why:** prior MomentOS docs over-scoped the first build.

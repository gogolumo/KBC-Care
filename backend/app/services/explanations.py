"""Wording layer (docs/AI_USAGE.md).

deterministic data -> state engine -> policy engine -> (optional) wording

This module only turns *already decided* facts into customer-facing text.
It never changes state, confidence, consent or policy. Templates are the
default and the demo works fully without any LLM.

LLM hook: set EXPLANATION_PROVIDER to a provider name and implement
`_llm_rewrite`. Whatever it returns is validated and, if invalid or if the
call fails, the deterministic template is used instead.
"""
from __future__ import annotations

import os
from typing import Callable

from app.models.domain import CustomerState

MAX_HEADLINE = 80
MAX_BODY = 320


def _template(state: CustomerState) -> dict[str, str]:
    labels = [item.label[:1].lower() + item.label[1:] for item in state.evidence if item.active]
    signals = "; ".join(labels) if labels else "a few recent signals"
    if state.status == "confirmed":
        return {
            "headline": "Your home purchase journey",
            "body": "You told us you're exploring a home purchase, so we've prepared a step-by-step journey. You stay in control of what is shared with an adviser.",
        }
    if state.status == "paused":
        return {
            "headline": "Home-purchase help is paused",
            "body": "You paused this kind of help. Nothing is suggested until you turn it back on, and no decision is made about you.",
        }
    if state.status in {"rejected", "expired"}:
        return {
            "headline": "We won't suggest this for now",
            "body": "This situation is no longer shown. Nothing was shared and no decision was made about you.",
        }
    return {
        "headline": "Planning a move or home purchase?",
        "body": f"We noticed a few signals ({signals}) that may indicate you're exploring a home purchase. We may be wrong - you can confirm, dismiss or pause this kind of help.",
    }


def _llm_rewrite(facts: dict) -> dict | None:  # pragma: no cover - not wired for the hackathon demo
    """Plug an LLM call in here. It receives only the structured facts below."""
    return None


def _valid(candidate: object) -> bool:
    if not isinstance(candidate, dict) or set(candidate) != {"headline", "body"}:
        return False
    headline, body = candidate["headline"], candidate["body"]
    return isinstance(headline, str) and isinstance(body, str) and 0 < len(headline) <= MAX_HEADLINE and 0 < len(body) <= MAX_BODY


def explain_state(state: CustomerState, rewrite: Callable[[dict], dict | None] | None = None) -> dict[str, str]:
    template = _template(state)
    use_llm = rewrite is not None or bool(os.getenv("EXPLANATION_PROVIDER"))
    if use_llm:
        facts = {
            "task": "explain_state",
            "state": {"type": state.type, "status": state.status, "confidence": state.confidence},
            "evidence": [{"label": item.label} for item in state.evidence if item.active],
            "rules": {"mustExpressUncertainty": state.status == "inferred", "mustNotClaimIntentAsFact": True, "maxSentences": 2},
            "fallback": template,
        }
        try:
            candidate = (rewrite or _llm_rewrite)(facts)
        except Exception:
            candidate = None
        if _valid(candidate):
            return {**candidate, "source": "llm"}
    return {**template, "source": "template"}

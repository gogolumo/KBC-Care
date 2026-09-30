"""Deterministic policy engine: "what is the bank allowed to do?"

Evaluation order (docs/POLICY_ENGINE.md):
1. categorically prohibited action          -> BLOCK
2. action shares / expands data scope        -> REQUIRE_CONFIRMATION
3. customer paused this help (proactive)    -> BLOCK
   state rejected / expired (proactive only) -> BLOCK
4. low-risk, reversible action               -> ALLOW
5. unknown action                            -> BLOCK (deny by default)

This module never computes confidence and never calls an LLM.
"""
from __future__ import annotations

from app.models.domain import CustomerState

BLOCKED_ACTIONS = {
    "PRE_APPROVED_MORTGAGE_OFFER",
    "AUTOMATIC_MORTGAGE_APPROVAL",
    "BEHAVIORAL_CREDIT_SCORING",
    "PERSONALIZED_CREDIT_PRICING",
    "AUTOMATIC_UNDERWRITING",
    "INVESTMENT_SUITABILITY_DECISION",
    "INSURANCE_PRICING_DECISION",
}
SCOPE_EXPANDING_ACTIONS = {"CREATE_CONTEXT_PASSPORT", "SHARE_CONTEXT_WITH_ADVISER"}
# Proactive = the bank reaches out based on the inferred state.
PROACTIVE_ACTIONS = {"ASK_STATE_CONFIRMATION", "SHOW_HOME_EDUCATION", "BOOK_KBC_LIVE"}
# Passive = the customer asks to see something about their own data.
PASSIVE_ACTIONS = {"SHOW_EVIDENCE", "SHOW_EXPLANATION"}
KNOWN_ACTIONS = BLOCKED_ACTIONS | SCOPE_EXPANDING_ACTIONS | PROACTIVE_ACTIONS | PASSIVE_ACTIONS

# What the UI can offer instead of a blocked/deferred action.
SAFE_ALTERNATIVES = {action: "ASK_STATE_CONFIRMATION" for action in BLOCKED_ACTIONS}


def evaluate_action(state: CustomerState | None, action: str) -> tuple[bool, str, str, str]:
    if action in BLOCKED_ACTIONS:
        return False, "BLOCK", "HIGH_IMPACT_CREDIT_DECISION", "High-impact credit-related action cannot be derived automatically from behavioral inference."
    if action in SCOPE_EXPANDING_ACTIONS:
        if not state or state.status != "confirmed":
            return False, "REQUIRE_CONFIRMATION", "CONFIRMED_STATE_REQUIRED", "Context sharing requires a confirmed customer goal and explicit sharing consent."
        return False, "REQUIRE_CONFIRMATION", "EXPLICIT_SHARE_CONSENT_REQUIRED", "Customer must explicitly confirm the scoped context share."
    if action in PROACTIVE_ACTIONS:
        if state and state.status == "paused":
            return False, "BLOCK", "CUSTOMER_PAUSED_HELP", "The customer paused this kind of help; proactive suggestions stay off until they resume it."
        if state and state.status in {"rejected", "expired"}:
            return False, "BLOCK", "STATE_NOT_ACTIVE", "The customer dismissed this situation or it expired, so proactive help is suppressed."
        if action == "ASK_STATE_CONFIRMATION":
            if not state:
                return False, "BLOCK", "NO_ACTIVE_STATE", "There is no inferred situation above the display threshold to ask about."
            return True, "ALLOW", "CUSTOMER_CONFIRMATION_ALLOWED", "Asking the customer to confirm a temporary hypothesis is reversible and does not make a financial decision."
        return True, "ALLOW", "LOW_RISK_ACTION_ALLOWED", "This action is reversible and does not make a financial decision."
    if action in PASSIVE_ACTIONS:
        return True, "ALLOW", "LOW_RISK_ACTION_ALLOWED", "This action is reversible and does not make a financial decision."
    return False, "BLOCK", "UNKNOWN_ACTION", "Unknown actions are blocked by default."


def safe_alternative(action: str) -> str | None:
    return SAFE_ALTERNATIVES.get(action)

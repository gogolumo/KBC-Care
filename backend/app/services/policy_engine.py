from __future__ import annotations

from app.models.domain import CustomerState

BLOCKED_ACTIONS = {"PRE_APPROVED_MORTGAGE_OFFER", "AUTOMATIC_MORTGAGE_APPROVAL", "BEHAVIORAL_CREDIT_SCORING"}


def evaluate_action(state: CustomerState | None, action: str) -> tuple[bool, str, str, str]:
    if action in BLOCKED_ACTIONS:
        return False, "BLOCK", "HIGH_IMPACT_CREDIT_DECISION", "High-impact credit-related action cannot be derived automatically from behavioral inference."
    if action in {"CREATE_CONTEXT_PASSPORT", "SHARE_CONTEXT_WITH_ADVISER"}:
        if not state or state.status != "confirmed":
            return False, "REQUIRE_CONFIRMATION", "CONFIRMED_STATE_REQUIRED", "Context sharing requires a confirmed customer goal and explicit sharing consent."
        return False, "REQUIRE_CONFIRMATION", "EXPLICIT_SHARE_CONSENT_REQUIRED", "Customer must explicitly confirm the scoped context share."
    if action in {"ASK_STATE_CONFIRMATION", "SHOW_EVIDENCE", "SHOW_HOME_EDUCATION", "BOOK_KBC_LIVE"}:
        return True, "ALLOW", "LOW_RISK_ACTION_ALLOWED", "This action is reversible and does not make a financial decision."
    return False, "BLOCK", "UNKNOWN_ACTION", "Unknown actions are blocked by default."

"""Pure unit tests: the policy engine is deterministic and independent of the API layer."""
import pytest

from app.models.domain import CustomerState
from app.services.policy_engine import evaluate_action, safe_alternative


def make_state(status: str) -> CustomerState:
    return CustomerState(
        id="state_home", customerId="elise", type="possible_home_purchase", confidence=83, status=status,
        evidence=[], createdAt="2026-09-18T19:42:00Z", updatedAt="2026-09-30T12:05:00Z", expiresAt="2026-10-30T12:05:00Z",
    )


@pytest.mark.parametrize("status", [None, "inferred", "confirmed", "rejected", "expired"])
def test_pre_approved_mortgage_is_always_blocked(status):
    state = make_state(status) if status else None
    allowed, decision, code, _ = evaluate_action(state, "PRE_APPROVED_MORTGAGE_OFFER")
    assert (allowed, decision, code) == (False, "BLOCK", "HIGH_IMPACT_CREDIT_DECISION")
    assert safe_alternative("PRE_APPROVED_MORTGAGE_OFFER") == "ASK_STATE_CONFIRMATION"


def test_asking_for_confirmation_is_allowed_for_inferred_state():
    assert evaluate_action(make_state("inferred"), "ASK_STATE_CONFIRMATION")[:3] == (True, "ALLOW", "CUSTOMER_CONFIRMATION_ALLOWED")


def test_asking_without_state_is_blocked():
    assert evaluate_action(None, "ASK_STATE_CONFIRMATION")[:3] == (False, "BLOCK", "NO_ACTIVE_STATE")


@pytest.mark.parametrize("action", ["ASK_STATE_CONFIRMATION", "SHOW_HOME_EDUCATION", "BOOK_KBC_LIVE"])
def test_rejected_state_suppresses_proactive_help(action):
    assert evaluate_action(make_state("rejected"), action)[:3] == (False, "BLOCK", "STATE_NOT_ACTIVE")


def test_context_sharing_requires_confirmation():
    assert evaluate_action(make_state("inferred"), "CREATE_CONTEXT_PASSPORT")[2] == "CONFIRMED_STATE_REQUIRED"
    assert evaluate_action(make_state("confirmed"), "CREATE_CONTEXT_PASSPORT")[2] == "EXPLICIT_SHARE_CONSENT_REQUIRED"


def test_unknown_action_is_denied_by_default():
    assert evaluate_action(make_state("confirmed"), "SEND_SPAM")[:3] == (False, "BLOCK", "UNKNOWN_ACTION")
    assert safe_alternative("SEND_SPAM") is None

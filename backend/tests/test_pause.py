"""Pause this kind of help (USER_FLOW.md 'Pause path')."""
from fastapi.testclient import TestClient

from app.main import app
from app.repositories.factory import get_repository
from app.services.explanations import explain_state
from app.services.policy_engine import evaluate_action

client = TestClient(app)
ELISE = {"customerId": "elise"}


def to_threshold():
    get_repository.cache_clear()
    client.post("/api/simulation/reset", json=ELISE)
    for event_id in ["evt_salary", "evt_mortgage", "evt_myhome", "evt_rent"]:  # 63 -> inferred
        client.post(f"/api/simulation/events/{event_id}", json=ELISE)


def policy(action):
    return client.post("/api/policy/evaluate", json={**ELISE, "stateId": "state_home", "action": action}).json()


def test_pause_hides_state_and_blocks_proactive_help():
    to_threshold()
    paused = client.post("/api/states/state_home/pause", json=ELISE)
    assert paused.status_code == 200
    assert paused.json()["state"]["status"] == "paused"
    assert client.get("/api/customers/elise/state").json()["state"]["status"] == "paused"
    assert client.get("/api/simulation/status", params=ELISE).json()["state"]["status"] == "paused"
    for action in ["ASK_STATE_CONFIRMATION", "SHOW_HOME_EDUCATION", "BOOK_KBC_LIVE"]:
        assert policy(action)["policyCode"] == "CUSTOMER_PAUSED_HELP"
    assert policy("PRE_APPROVED_MORTGAGE_OFFER")["policyCode"] == "HIGH_IMPACT_CREDIT_DECISION"
    assert policy("SHOW_EVIDENCE")["decision"] == "ALLOW"  # the customer can still see why


def test_new_events_keep_state_paused():
    to_threshold()
    client.post("/api/states/state_home/pause", json=ELISE)
    after = client.post("/api/simulation/events/evt_property_doc", json=ELISE).json()
    assert after["confidence"] == 83
    assert after["state"]["status"] == "paused"


def test_resume_restores_inferred_state():
    to_threshold()
    client.post("/api/states/state_home/pause", json=ELISE)
    resumed = client.post("/api/states/state_home/resume", json=ELISE)
    assert resumed.status_code == 200
    assert resumed.json()["state"]["status"] == "inferred"
    assert policy("ASK_STATE_CONFIRMATION")["decision"] == "ALLOW"


def test_customer_can_still_confirm_or_reject_while_paused():
    to_threshold()
    client.post("/api/states/state_home/pause", json=ELISE)
    assert client.post("/api/states/state_home/confirm", json=ELISE).json()["state"]["status"] == "confirmed"
    assert client.get("/api/customers/elise/journey").status_code == 200
    to_threshold()
    client.post("/api/states/state_home/pause", json=ELISE)
    assert client.post("/api/states/state_home/reject", json=ELISE).json()["state"]["status"] == "rejected"


def test_pause_errors():
    get_repository.cache_clear()
    client.post("/api/simulation/reset", json=ELISE)
    assert client.post("/api/states/state_home/pause", json=ELISE).json()["error"]["code"] == "STATE_NOT_FOUND"
    to_threshold()
    assert client.post("/api/states/state_home/resume", json=ELISE).json()["error"]["code"] == "STATE_NOT_PAUSED"
    client.post("/api/states/state_home/confirm", json=ELISE)
    response = client.post("/api/states/state_home/pause", json=ELISE)
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "STATE_NOT_PAUSABLE"


def test_pause_is_idempotent_and_reset_clears_it():
    to_threshold()
    client.post("/api/states/state_home/pause", json=ELISE)
    assert client.post("/api/states/state_home/pause", json=ELISE).status_code == 200
    client.post("/api/simulation/reset", json=ELISE)
    assert client.get("/api/customers/elise/state").status_code == 404


def test_paused_explanation_copy():
    to_threshold()
    client.post("/api/states/state_home/pause", json=ELISE)
    state = get_repository().get_state("elise")
    assert explain_state(state)["headline"] == "Home-purchase help is paused"
    assert evaluate_action(state, "ASK_STATE_CONFIRMATION")[2] == "CUSTOMER_PAUSED_HELP"

"""API edge cases from docs/API_CONTRACT.md, docs/USER_FLOW.md and docs/BACKEND_SPEC.md."""
from fastapi.testclient import TestClient

from app.main import app
from app.repositories.factory import get_repository

client = TestClient(app)
ELISE = {"customerId": "elise"}


def fresh():
    get_repository.cache_clear()
    assert client.post("/api/simulation/reset", json=ELISE).status_code == 200


def play_all():
    return client.post("/api/simulation/play", json={**ELISE, "mode": "remaining"})


def test_reset_returns_clean_state():
    fresh()
    assert client.get("/api/customers/elise/state").status_code == 404
    assert client.get("/api/customers/elise/journey").json()["error"]["code"] == "JOURNEY_NOT_AVAILABLE"


def test_play_next_applies_one_event_at_a_time():
    fresh()
    seen = []
    for _ in range(5):
        body = client.post("/api/simulation/play", json={**ELISE, "mode": "next"}).json()
        seen.append((body["events"][0]["id"], body["confidence"], body["state"] is not None))
    assert seen == [("evt_salary", 0, False), ("evt_mortgage", 30, False), ("evt_myhome", 45, False), ("evt_rent", 63, True), ("evt_property_doc", 83, True)]
    assert client.post("/api/simulation/play", json={**ELISE, "mode": "next"}).json()["events"] == []


def test_play_unknown_customer_is_404():
    assert client.post("/api/simulation/play", json={"customerId": "nobody"}).status_code == 404


def test_unknown_event_is_404():
    fresh()
    response = client.post("/api/simulation/events/evt_nope", json=ELISE)
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "EVENT_NOT_FOUND"


def test_policy_block_includes_safe_alternative():
    fresh()
    play_all()
    body = client.post("/api/policy/evaluate", json={**ELISE, "stateId": "state_home", "action": "PRE_APPROVED_MORTGAGE_OFFER"}).json()
    assert body == {
        "allowed": False,
        "decision": "BLOCK",
        "policyCode": "HIGH_IMPACT_CREDIT_DECISION",
        "reason": "High-impact credit-related action cannot be derived automatically from behavioral inference.",
        "safeAlternative": "ASK_STATE_CONFIRMATION",
    }


def test_rejection_prevents_journey_and_suppresses_help():
    fresh()
    play_all()
    rejected = client.post("/api/states/state_home/reject", json={**ELISE, "reason": "not_relevant"})
    assert rejected.status_code == 200
    assert rejected.json()["state"]["status"] == "rejected"
    assert client.get("/api/customers/elise/journey").status_code == 404
    policy = client.post("/api/policy/evaluate", json={**ELISE, "stateId": "state_home", "action": "ASK_STATE_CONFIRMATION"}).json()
    assert policy["policyCode"] == "STATE_NOT_ACTIVE"


def test_confirm_is_idempotent_and_keeps_progress():
    fresh()
    play_all()
    client.post("/api/states/state_home/confirm", json=ELISE)
    client.post("/api/journeys/journey_home/steps/budget/complete", json=ELISE)
    client.post("/api/states/state_home/confirm", json=ELISE)
    steps = client.get("/api/customers/elise/journey").json()["journey"]["steps"]
    assert [s["status"] for s in steps] == ["done", "active", "todo", "todo", "todo"]


def test_journey_completes_after_last_step():
    fresh()
    play_all()
    client.post("/api/states/state_home/confirm", json=ELISE)
    for step in ["budget", "property", "documents", "insurance", "live"]:
        journey = client.post(f"/api/journeys/journey_home/steps/{step}/complete", json=ELISE).json()["journey"]
    assert journey["status"] == "completed"


def test_passport_requires_confirmed_state():
    fresh()
    play_all()
    response = client.post("/api/context-passports", json={**ELISE, "purpose": "kbc_live_home_exploration", "selectedFields": ["confirmedGoal"]})
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "STATE_NOT_CONFIRMED"


def test_passport_rejects_fields_outside_allowlist():
    fresh()
    play_all()
    client.post("/api/states/state_home/confirm", json=ELISE)
    response = client.post("/api/context-passports", json={**ELISE, "purpose": "x", "selectedFields": ["rawTransactions"]})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "INVALID_SCOPE"


def test_passport_excludes_raw_events_and_expires():
    fresh()
    play_all()
    client.post("/api/states/state_home/confirm", json=ELISE)
    client.post("/api/journeys/journey_home/steps/budget/complete", json=ELISE)
    created = client.post("/api/context-passports", json={
        **ELISE, "purpose": "kbc_live_home_exploration",
        "selectedFields": ["confirmedGoal", "journeyProgress", "unresolvedQuestions"], "ttlHours": 24,
    }).json()["passport"]
    assert created["fields"]["journeyProgress"] == ["understand_budget"]
    assert "evt_" not in str(created)  # no raw event ids / transactions leak into the passport
    assert client.get(f"/api/context-passports/{created['id']}").status_code == 200

    expired = client.post("/api/context-passports", json={**ELISE, "purpose": "x", "selectedFields": ["confirmedGoal"], "ttlHours": 0}).json()["passport"]
    response = client.get(f"/api/context-passports/{expired['id']}")
    assert response.status_code == 410
    assert response.json()["error"]["code"] == "PASSPORT_EXPIRED"


def test_replay_is_byte_identical():
    def run():
        fresh()
        out = [play_all().json()]
        out.append(client.post("/api/policy/evaluate", json={**ELISE, "stateId": "state_home", "action": "PRE_APPROVED_MORTGAGE_OFFER"}).json())
        out.append(client.post("/api/states/state_home/confirm", json=ELISE).json())
        out.append(client.post("/api/context-passports", json={**ELISE, "purpose": "kbc_live_home_exploration", "selectedFields": ["confirmedGoal"]}).json())
        return out
    assert run() == run()

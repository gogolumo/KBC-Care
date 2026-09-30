from fastapi.testclient import TestClient

from app.main import app
from app.repositories.factory import get_repository

client = TestClient(app)


def reset_repo():
    get_repository.cache_clear()
    client.post("/api/simulation/reset", json={"customerId": "elise"})


def test_full_demo_flow_is_deterministic(monkeypatch):
    monkeypatch.setenv("USE_MOCK_DATA", "true")
    reset_repo()

    response = client.post("/api/simulation/play", json={"customerId": "elise", "mode": "remaining"})
    assert response.status_code == 200
    assert response.json()["confidence"] == 83
    assert response.json()["state"]["confidence"] == 83
    assert [e["id"] for e in response.json()["events"]] == ["evt_salary", "evt_mortgage", "evt_myhome", "evt_rent", "evt_property_doc"]

    blocked = client.post("/api/policy/evaluate", json={"customerId": "elise", "stateId": "state_home", "action": "PRE_APPROVED_MORTGAGE_OFFER"})
    assert blocked.json()["decision"] == "BLOCK"

    confirmed = client.post("/api/states/state_home/confirm", json={"customerId": "elise"})
    assert confirmed.status_code == 200
    assert confirmed.json()["state"]["status"] == "confirmed"

    journey = client.get("/api/customers/elise/journey").json()["journey"]
    assert len(journey["steps"]) == 5

    passport = client.post("/api/context-passports", json={
        "customerId": "elise",
        "purpose": "kbc_live_home_exploration",
        "selectedFields": ["confirmedGoal", "journeyProgress", "unresolvedQuestions"],
        "ttlHours": 24
    })
    assert passport.status_code == 201
    assert set(passport.json()["passport"]["fields"]) == {"confirmedGoal", "journeyProgress", "unresolvedQuestions"}


def test_threshold_behavior(monkeypatch):
    monkeypatch.setenv("USE_MOCK_DATA", "true")
    reset_repo()
    for event_id in ["evt_salary", "evt_mortgage", "evt_myhome"]:
        client.post(f"/api/simulation/events/{event_id}", json={"customerId": "elise"})
    assert client.get("/api/customers/elise/state").status_code == 404
    client.post("/api/simulation/events/evt_rent", json={"customerId": "elise"})
    assert client.get("/api/customers/elise/state").json()["state"]["confidence"] == 63


def test_replay_rejects_duplicate_event(monkeypatch):
    monkeypatch.setenv("USE_MOCK_DATA", "true")
    reset_repo()
    assert client.post("/api/simulation/events/evt_salary", json={"customerId": "elise"}).status_code == 200
    assert client.post("/api/simulation/events/evt_salary", json={"customerId": "elise"}).status_code == 409


def test_error_shape_matches_contract(monkeypatch):
    monkeypatch.setenv("USE_MOCK_DATA", "true")
    reset_repo()
    response = client.get("/api/customers/elise/state")
    assert response.status_code == 404
    assert response.json() == {"error": {"code": "STATE_NOT_FOUND", "message": "State not found", "details": {}}}


def test_event_confidence_is_backend_source_of_truth(monkeypatch):
    monkeypatch.setenv("USE_MOCK_DATA", "true")
    reset_repo()

    expected = [
        ("evt_salary", 0, False),
        ("evt_mortgage", 30, False),
        ("evt_myhome", 45, False),
        ("evt_rent", 63, True),
        ("evt_property_doc", 83, True),
    ]
    for event_id, confidence, state_visible in expected:
        response = client.post(f"/api/simulation/events/{event_id}", json={"customerId": "elise"})
        assert response.status_code == 200
        assert response.json()["confidence"] == confidence
        assert (response.json()["state"] is not None) is state_visible


def test_full_flow_can_run_twice_with_step_completion(monkeypatch):
    monkeypatch.setenv("USE_MOCK_DATA", "true")
    for _ in range(2):
        reset = client.post("/api/simulation/reset", json={"customerId": "elise"})
        assert reset.status_code == 200
        assert reset.json()["confidence"] == 0

        for event_id in ["evt_salary", "evt_mortgage", "evt_myhome", "evt_rent", "evt_property_doc"]:
            event = client.post(f"/api/simulation/events/{event_id}", json={"customerId": "elise"})
            assert event.status_code == 200
        assert event.json()["confidence"] == 83

        blocked = client.post("/api/policy/evaluate", json={
            "customerId": "elise",
            "stateId": "state_home",
            "action": "PRE_APPROVED_MORTGAGE_OFFER",
        })
        assert blocked.status_code == 200
        assert blocked.json()["decision"] == "BLOCK"
        assert blocked.json()["policyCode"] == "HIGH_IMPACT_CREDIT_DECISION"

        confirmed = client.post("/api/states/state_home/confirm", json={"customerId": "elise"})
        assert confirmed.status_code == 200

        journey = client.get("/api/customers/elise/journey").json()["journey"]
        first_step = journey["steps"][0]["id"]
        completed = client.post(
            f'/api/journeys/{journey["id"]}/steps/{first_step}/complete',
            json={"customerId": "elise"},
        )
        assert completed.status_code == 200
        assert completed.json()["journey"]["steps"][0]["status"] == "done"

        passport = client.post("/api/context-passports", json={
            "customerId": "elise",
            "purpose": "kbc_live_home_exploration",
            "selectedFields": ["confirmedGoal", "journeyProgress", "unresolvedQuestions"],
            "ttlHours": 24,
        })
        assert passport.status_code == 201
        passport_id = passport.json()["passport"]["id"]
        fetched = client.get(f"/api/context-passports/{passport_id}")
        assert fetched.status_code == 200


def test_simulation_status_restores_progress_before_threshold(monkeypatch):
    monkeypatch.setenv("USE_MOCK_DATA", "true")
    reset_repo()

    client.post("/api/simulation/events/evt_salary", json={"customerId": "elise"})
    client.post("/api/simulation/events/evt_mortgage", json={"customerId": "elise"})

    status = client.get("/api/simulation/status", params={"customerId": "elise"})
    assert status.status_code == 200
    assert status.json()["confidence"] == 30
    assert status.json()["state"] is None
    assert [event["id"] for event in status.json()["events"]] == ["evt_salary", "evt_mortgage"]

    next_event = client.post("/api/simulation/events/evt_myhome", json={"customerId": "elise"})
    assert next_event.status_code == 200
    assert next_event.json()["confidence"] == 45

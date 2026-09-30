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

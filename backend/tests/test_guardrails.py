from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from app.main import app
from app.models.domain import ContextPassport
from app.repositories.factory import get_repository

client = TestClient(app)


def reset_repo():
    get_repository.cache_clear()
    client.post("/api/simulation/reset", json={"customerId": "elise"})


def test_policy_decision_ids_are_unique(monkeypatch):
    monkeypatch.setenv("USE_MOCK_DATA", "true")
    reset_repo()
    for _ in range(2):
        response = client.post("/api/policy/evaluate", json={
            "customerId": "elise",
            "stateId": "state_home",
            "action": "PRE_APPROVED_MORTGAGE_OFFER",
        })
        assert response.status_code == 200
    repo = get_repository()
    ids = [decision.id for decision in repo._policy[-2:]]
    assert len(set(ids)) == 2
    assert all(item.startswith("policy_") for item in ids)


def test_context_passport_ids_are_unique(monkeypatch):
    monkeypatch.setenv("USE_MOCK_DATA", "true")
    reset_repo()
    client.post("/api/simulation/play", json={"customerId": "elise", "mode": "remaining"})
    client.post("/api/states/state_home/confirm", json={"customerId": "elise"})

    payload = {
        "customerId": "elise",
        "purpose": "kbc_live_home_exploration",
        "selectedFields": ["confirmedGoal"],
        "ttlHours": 24,
    }
    first = client.post("/api/context-passports", json=payload)
    second = client.post("/api/context-passports", json=payload)
    assert first.status_code == 201
    assert second.status_code == 201
    assert first.json()["passport"]["id"] != second.json()["passport"]["id"]


def test_context_passport_expiry_returns_410(monkeypatch):
    monkeypatch.setenv("USE_MOCK_DATA", "true")
    reset_repo()
    now = datetime.now(timezone.utc)
    expired = ContextPassport(
        id="pass_expired",
        customerId="elise",
        purpose="kbc_live_home_exploration",
        fields={"confirmedGoal": "Explore a home purchase"},
        createdAt=(now - timedelta(hours=2)).isoformat().replace("+00:00", "Z"),
        expiresAt=(now - timedelta(hours=1)).isoformat().replace("+00:00", "Z"),
    )
    get_repository().save_passport(expired)

    response = client.get("/api/context-passports/pass_expired")
    assert response.status_code == 410
    assert response.json() == {
        "error": {
            "code": "PASSPORT_EXPIRED",
            "message": "Context Passport expired or revoked",
            "details": {},
        }
    }


def test_context_passport_ttl_is_bounded(monkeypatch):
    monkeypatch.setenv("USE_MOCK_DATA", "true")
    reset_repo()
    client.post("/api/simulation/play", json={"customerId": "elise", "mode": "remaining"})
    client.post("/api/states/state_home/confirm", json={"customerId": "elise"})
    response = client.post("/api/context-passports", json={
        "customerId": "elise",
        "purpose": "kbc_live_home_exploration",
        "selectedFields": ["confirmedGoal"],
        "ttlHours": 0,
    })
    assert response.status_code == 422


def test_policy_endpoint_rejects_oversized_fields(monkeypatch):
    """Prevent resource exhaustion by rejecting requests with excessively large string fields."""
    monkeypatch.setenv("USE_MOCK_DATA", "true")
    reset_repo()
    
    # Test oversized customerId
    response = client.post("/api/policy/evaluate", json={
        "customerId": "x" * 257,
        "action": "PRE_APPROVED_MORTGAGE_OFFER",
    })
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"
    
    # Test oversized stateId
    response = client.post("/api/policy/evaluate", json={
        "customerId": "elise",
        "stateId": "x" * 257,
        "action": "PRE_APPROVED_MORTGAGE_OFFER",
    })
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"
    
    # Test oversized action
    response = client.post("/api/policy/evaluate", json={
        "customerId": "elise",
        "stateId": "state_home",
        "action": "x" * 257,
    })
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"
    
    # Test valid request still works
    response = client.post("/api/policy/evaluate", json={
        "customerId": "elise",
        "stateId": "state_home",
        "action": "PRE_APPROVED_MORTGAGE_OFFER",
    })
    assert response.status_code == 200


def test_passport_endpoint_rejects_oversized_fields(monkeypatch):
    """Prevent resource exhaustion by rejecting requests with excessively large string fields."""
    monkeypatch.setenv("USE_MOCK_DATA", "true")
    reset_repo()
    client.post("/api/simulation/play", json={"customerId": "elise", "mode": "remaining"})
    client.post("/api/states/state_home/confirm", json={"customerId": "elise"})
    
    # Test oversized purpose
    response = client.post("/api/context-passports", json={
        "customerId": "elise",
        "purpose": "x" * 257,
        "selectedFields": ["confirmedGoal"],
        "ttlHours": 24,
    })
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"
    
    # Test oversized field name in selectedFields
    response = client.post("/api/context-passports", json={
        "customerId": "elise",
        "purpose": "kbc_live_home_exploration",
        "selectedFields": ["x" * 257],
        "ttlHours": 24,
    })
    assert response.status_code == 422
    
    # Test too many selectedFields
    response = client.post("/api/context-passports", json={
        "customerId": "elise",
        "purpose": "kbc_live_home_exploration",
        "selectedFields": [f"field_{i}" for i in range(101)],
        "ttlHours": 24,
    })
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"
    
    # Test valid request still works
    response = client.post("/api/context-passports", json={
        "customerId": "elise",
        "purpose": "kbc_live_home_exploration",
        "selectedFields": ["confirmedGoal"],
        "ttlHours": 24,
    })
    assert response.status_code == 201

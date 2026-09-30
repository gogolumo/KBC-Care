"""Mock repository must stay cheap under the PR #7/#11 load harness."""
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.domain import PolicyDecision
from app.repositories.factory import get_repository
from app.repositories.mock import POLICY_HISTORY_LIMIT, MockRepository

client = TestClient(app)


@pytest.fixture
def load_customers(monkeypatch):
    monkeypatch.setenv("USE_MOCK_DATA", "true")
    monkeypatch.setenv("LOAD_TEST_CUSTOMERS", "10")
    get_repository.cache_clear()
    yield
    get_repository.cache_clear()


def test_reset_only_removes_own_passports(load_customers):
    ids = {}
    for cid in ["elise", "load_0000002"]:
        client.post("/api/simulation/reset", json={"customerId": cid})
        client.post("/api/simulation/play", json={"customerId": cid})
        client.post("/api/states/state_home/confirm", json={"customerId": cid})
        created = client.post("/api/context-passports", json={"customerId": cid, "purpose": "x", "selectedFields": ["confirmedGoal"]})
        ids[cid] = created.json()["passport"]["id"]
    client.post("/api/simulation/reset", json={"customerId": "load_0000002"})
    assert client.get(f"/api/context-passports/{ids['load_0000002']}").status_code == 404
    assert client.get(f"/api/context-passports/{ids['elise']}").status_code == 200  # Elise untouched


def test_policy_history_is_bounded():
    repo = MockRepository()
    decision = PolicyDecision(
        id="p", customerId="elise", action="X", allowed=False, decision="BLOCK", policyCode="C", reason="r", timestamp="t",
    )
    for _ in range(POLICY_HISTORY_LIMIT + 50):
        repo.save_policy_decision(decision)
    assert len(repo._policy) == POLICY_HISTORY_LIMIT

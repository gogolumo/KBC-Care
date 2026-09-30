from fastapi.testclient import TestClient

from app.main import app
from app.repositories.factory import get_repository

client = TestClient(app)


def test_synthetic_load_customer_is_addressable(monkeypatch):
    monkeypatch.setenv("USE_MOCK_DATA", "true")
    monkeypatch.setenv("LOAD_TEST_CUSTOMERS", "10")
    get_repository.cache_clear()

    customer = client.get("/api/customers/load_0000001")
    assert customer.status_code == 200
    assert customer.json()["id"] == "load_0000001"

    reset = client.post("/api/simulation/reset", json={"customerId": "load_0000001"})
    assert reset.status_code == 200


def test_synthetic_load_customer_respects_configured_range(monkeypatch):
    monkeypatch.setenv("USE_MOCK_DATA", "true")
    monkeypatch.setenv("LOAD_TEST_CUSTOMERS", "10")
    get_repository.cache_clear()

    response = client.get("/api/customers/load_0000011")
    assert response.status_code == 404

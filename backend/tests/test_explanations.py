"""The wording layer can never change decisions and always has a deterministic fallback."""
from fastapi.testclient import TestClient

from app.main import app
from app.repositories.factory import get_repository
from app.services.explanations import explain_state

client = TestClient(app)
ELISE = {"customerId": "elise"}


def inferred_state():
    get_repository.cache_clear()
    client.post("/api/simulation/reset", json=ELISE)
    client.post("/api/simulation/play", json=ELISE)
    return get_repository().get_state("elise")


def test_inferred_explanation_expresses_uncertainty():
    inferred_state()
    body = client.get("/api/customers/elise/state/explanation").json()["explanation"]
    assert body["source"] == "template"
    assert body["headline"] == "Planning a move or home purchase?"
    assert "may be wrong" in body["body"]
    assert "used mortgage affordability simulator" in body["body"]


def test_explanation_is_404_without_state():
    get_repository.cache_clear()
    client.post("/api/simulation/reset", json=ELISE)
    assert client.get("/api/customers/elise/state/explanation").status_code == 404


def test_valid_llm_output_only_changes_wording():
    state = inferred_state()
    before = state.model_dump()
    out = explain_state(state, rewrite=lambda facts: {"headline": "Thinking about a home?", "body": "Maybe. You decide."})
    assert out == {"headline": "Thinking about a home?", "body": "Maybe. You decide.", "source": "llm"}
    assert state.model_dump() == before  # facts untouched


def test_invalid_or_failing_llm_falls_back_to_template():
    state = inferred_state()
    extra_field = explain_state(state, rewrite=lambda facts: {"headline": "x", "body": "y", "confidence": 99})
    assert extra_field["source"] == "template"

    def boom(facts):
        raise TimeoutError("provider down")

    assert explain_state(state, rewrite=boom)["source"] == "template"

"""Pure unit tests: confidence is derived only from evidence weights (docs/STATE_ENGINE.md)."""
import json
from pathlib import Path

from app.models.domain import DemoSeed
from app.services.state_engine import build_state

SEED = DemoSeed.model_validate(json.loads((Path(__file__).resolve().parents[1] / "app" / "seed" / "elise.json").read_text(encoding="utf-8")))


def events(*ids):
    return [e for e in SEED.events if e.id in ids]


def test_salary_alone_creates_no_state():
    assert build_state("elise", events("evt_salary")) is None


def test_below_threshold_creates_no_state():
    assert build_state("elise", events("evt_salary", "evt_mortgage", "evt_myhome")) is None  # 45 < 60


def test_confidence_progression_matches_demo_script():
    order = ["evt_salary", "evt_mortgage", "evt_myhome", "evt_rent", "evt_property_doc"]
    scores = []
    for n in range(1, len(order) + 1):
        state = build_state("elise", events(*order[:n]))
        scores.append(state.confidence if state else None)
    assert scores == [None, None, None, 63, 83]


def test_every_point_maps_to_evidence():
    state = build_state("elise", [e for e in SEED.events])
    assert state.confidence == sum(item.weight for item in state.evidence) == 83
    assert {item.eventId for item in state.evidence} == {"evt_mortgage", "evt_myhome", "evt_rent", "evt_property_doc"}
    assert "evt_salary" not in {item.eventId for item in state.evidence}


def test_same_input_same_output():
    a = build_state("elise", list(SEED.events)).model_dump()
    b = build_state("elise", list(SEED.events)).model_dump()
    assert a == b

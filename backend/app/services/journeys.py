from __future__ import annotations

from copy import deepcopy
from app.models.domain import CustomerState, Journey, JourneyStep


def create_home_journey(customer_id: str, state: CustomerState, template: list[JourneyStep]) -> Journey:
    if state.status != "confirmed":
        raise ValueError("confirmed state required")
    steps = deepcopy(template)
    return Journey(id="journey_home", customerId=customer_id, stateId=state.id, type="home_purchase", status="active", steps=steps)

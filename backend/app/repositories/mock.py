from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

from app.models.domain import ContextPassport, Customer, CustomerEvent, CustomerState, DemoSeed, Journey, PolicyDecision
from app.repositories.base import DemoRepository
from app.services.state_engine import build_state


class MockRepository(DemoRepository):
    def __init__(self, seed_path: Path | None = None):
        self.seed_path = seed_path or Path(__file__).resolve().parents[1] / "seed" / "elise.json"
        self.seed = DemoSeed.model_validate(json.loads(self.seed_path.read_text(encoding="utf-8")))
        self._states: dict[str, CustomerState] = {}
        self._applied: dict[str, list[str]] = {}
        self._journeys: dict[str, Journey] = {}
        self._policy: list[PolicyDecision] = []
        self._passports: dict[str, ContextPassport] = {}
        self.reset(self.seed.customer.id)

    def customers(self) -> list[Customer]:
        return [deepcopy(self.seed.customer)]

    def customer(self, customer_id: str) -> Customer | None:
        return deepcopy(self.seed.customer) if customer_id == self.seed.customer.id else None

    def reset(self, customer_id: str) -> None:
        if not self.customer(customer_id):
            raise KeyError("CUSTOMER_NOT_FOUND")
        self._applied[customer_id] = []
        self._states.pop(customer_id, None)
        self._journeys.pop(customer_id, None)
        self._passports = {k: v for k, v in self._passports.items() if v.customerId != customer_id}

    def available_events(self, customer_id: str) -> list[CustomerEvent]:
        if not self.customer(customer_id):
            return []
        return deepcopy(self.seed.events)

    def applied_events(self, customer_id: str) -> list[CustomerEvent]:
        ids = set(self._applied.get(customer_id, []))
        return [deepcopy(e) for e in self.seed.events if e.id in ids]

    def apply_event(self, customer_id: str, event_id: str) -> CustomerEvent:
        if not self.customer(customer_id):
            raise KeyError("CUSTOMER_NOT_FOUND")
        event = next((e for e in self.seed.events if e.id == event_id and e.customerId == customer_id), None)
        if event is None:
            raise KeyError("EVENT_NOT_FOUND")
        if event_id in self._applied[customer_id]:
            raise ValueError("EVENT_ALREADY_APPLIED")
        self._applied[customer_id].append(event_id)
        previous = self._states.get(customer_id)
        state = build_state(customer_id, self.applied_events(customer_id), previous.status if previous else None)
        if state:
            self._states[customer_id] = state
        return deepcopy(event)

    def get_state(self, customer_id: str) -> CustomerState | None:
        return deepcopy(self._states.get(customer_id))

    def save_state(self, state: CustomerState) -> None:
        self._states[state.customerId] = deepcopy(state)

    def get_journey(self, customer_id: str) -> Journey | None:
        return deepcopy(self._journeys.get(customer_id))

    def save_journey(self, journey: Journey) -> None:
        self._journeys[journey.customerId] = deepcopy(journey)

    def save_policy_decision(self, decision: PolicyDecision) -> None:
        self._policy.append(deepcopy(decision))

    def save_passport(self, passport: ContextPassport) -> None:
        self._passports[passport.id] = deepcopy(passport)

    def get_passport(self, passport_id: str) -> ContextPassport | None:
        return deepcopy(self._passports.get(passport_id))

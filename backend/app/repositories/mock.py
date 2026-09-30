from __future__ import annotations

import json
import os
import re
from copy import deepcopy
from pathlib import Path

from app.models.domain import ContextPassport, Customer, CustomerEvent, CustomerState, DemoSeed, Journey, PolicyDecision
from app.repositories.base import DemoRepository
from app.services.state_engine import build_state

LOAD_CUSTOMER_RE = re.compile(r"^load_(\d+)$")
# Audit trail is demo-only; keep it bounded so load tests cannot grow memory forever.
POLICY_HISTORY_LIMIT = 1000


class MockRepository(DemoRepository):
    def __init__(self, seed_path: Path | None = None):
        self.seed_path = seed_path or Path(__file__).resolve().parents[1] / "seed" / "elise.json"
        self.seed = DemoSeed.model_validate(json.loads(self.seed_path.read_text(encoding="utf-8")))
        self.load_test_customers = max(0, int(os.getenv("LOAD_TEST_CUSTOMERS", "0")))
        self._states: dict[str, CustomerState] = {}
        self._applied: dict[str, list[str]] = {}
        self._journeys: dict[str, Journey] = {}
        self._policy: list[PolicyDecision] = []
        self._passports: dict[str, ContextPassport] = {}
        self._passport_ids: dict[str, set[str]] = {}
        self.reset(self.seed.customer.id)

    def _is_load_customer(self, customer_id: str) -> bool:
        match = LOAD_CUSTOMER_RE.fullmatch(customer_id)
        return bool(match and 1 <= int(match.group(1)) <= self.load_test_customers)

    def _customer_exists(self, customer_id: str) -> bool:
        return customer_id == self.seed.customer.id or self._is_load_customer(customer_id)

    def _events_for(self, customer_id: str) -> list[CustomerEvent]:
        if customer_id == self.seed.customer.id:
            return self.seed.events
        if not self._is_load_customer(customer_id):
            return []
        return [event.model_copy(update={"customerId": customer_id}) for event in self.seed.events]

    def customers(self) -> list[Customer]:
        # Keep the demo endpoint small. Synthetic load IDs are addressable directly
        # and are intentionally not expanded into a 2M-item response.
        return [deepcopy(self.seed.customer)]

    def customer(self, customer_id: str) -> Customer | None:
        if customer_id == self.seed.customer.id:
            return deepcopy(self.seed.customer)
        if self._is_load_customer(customer_id):
            suffix = customer_id.removeprefix("load_")
            return Customer(id=customer_id, name=f"Load Customer {suffix}", personaKey="home_purchase")
        return None

    def reset(self, customer_id: str) -> None:
        if not self._customer_exists(customer_id):
            raise KeyError("CUSTOMER_NOT_FOUND")
        self._applied[customer_id] = []
        self._states.pop(customer_id, None)
        self._journeys.pop(customer_id, None)
        # O(1) per reset instead of rebuilding the whole passport map (was O(all passports)).
        for passport_id in self._passport_ids.pop(customer_id, set()):
            self._passports.pop(passport_id, None)

    def available_events(self, customer_id: str) -> list[CustomerEvent]:
        return deepcopy(self._events_for(customer_id))

    def applied_events(self, customer_id: str) -> list[CustomerEvent]:
        ids = set(self._applied.get(customer_id, []))
        return [deepcopy(e) for e in self._events_for(customer_id) if e.id in ids]

    def apply_event(self, customer_id: str, event_id: str) -> CustomerEvent:
        if not self._customer_exists(customer_id):
            raise KeyError("CUSTOMER_NOT_FOUND")
        if customer_id not in self._applied:
            self._applied[customer_id] = []
        event = next((e for e in self._events_for(customer_id) if e.id == event_id), None)
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
        if len(self._policy) > POLICY_HISTORY_LIMIT:
            del self._policy[0]

    def save_passport(self, passport: ContextPassport) -> None:
        # Preserve canonical Elise ID while avoiding cross-customer collisions in
        # opt-in load tests. The API response observes this mutation too.
        if passport.customerId != self.seed.customer.id and passport.id == "pass_001":
            passport.id = f"pass_{passport.customerId}"
        self._passports[passport.id] = deepcopy(passport)
        self._passport_ids.setdefault(passport.customerId, set()).add(passport.id)

    def get_passport(self, passport_id: str) -> ContextPassport | None:
        return deepcopy(self._passports.get(passport_id))

from __future__ import annotations

from abc import ABC, abstractmethod
from app.models.domain import ContextPassport, Customer, CustomerEvent, CustomerState, Journey, PolicyDecision


class DemoRepository(ABC):
    @abstractmethod
    def customers(self) -> list[Customer]: ...

    @abstractmethod
    def customer(self, customer_id: str) -> Customer | None: ...

    @abstractmethod
    def reset(self, customer_id: str) -> None: ...

    @abstractmethod
    def available_events(self, customer_id: str) -> list[CustomerEvent]: ...

    @abstractmethod
    def applied_events(self, customer_id: str) -> list[CustomerEvent]: ...

    @abstractmethod
    def apply_event(self, customer_id: str, event_id: str) -> CustomerEvent: ...

    @abstractmethod
    def get_state(self, customer_id: str) -> CustomerState | None: ...

    @abstractmethod
    def save_state(self, state: CustomerState) -> None: ...

    @abstractmethod
    def get_journey(self, customer_id: str) -> Journey | None: ...

    @abstractmethod
    def save_journey(self, journey: Journey) -> None: ...

    @abstractmethod
    def save_policy_decision(self, decision: PolicyDecision) -> None: ...

    @abstractmethod
    def save_passport(self, passport: ContextPassport) -> None: ...

    @abstractmethod
    def get_passport(self, passport_id: str) -> ContextPassport | None: ...

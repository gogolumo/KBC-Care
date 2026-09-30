from __future__ import annotations

from typing import Any, Literal
from pydantic import BaseModel, Field


class Customer(BaseModel):
    id: str
    name: str
    personaKey: str


class CustomerEvent(BaseModel):
    id: str
    customerId: str
    type: str
    timestamp: str
    source: Literal["core_banking", "myhome", "documents", "simulation"]
    metadata: dict[str, Any] = Field(default_factory=dict)


class Evidence(BaseModel):
    eventId: str
    code: str
    label: str
    weight: int
    observedAt: str
    expiresAt: str
    active: bool = True


class CustomerState(BaseModel):
    id: str
    customerId: str
    type: Literal["possible_home_purchase"]
    confidence: int
    status: Literal["inferred", "confirmed", "rejected", "expired", "paused"]
    evidence: list[Evidence] = Field(default_factory=list)
    createdAt: str
    updatedAt: str
    expiresAt: str


class JourneyStep(BaseModel):
    id: str
    key: str
    title: str
    status: Literal["todo", "active", "done"]
    order: int


class Journey(BaseModel):
    id: str
    customerId: str
    stateId: str
    type: Literal["home_purchase"]
    status: Literal["active", "completed"]
    steps: list[JourneyStep]


class PolicyDecision(BaseModel):
    id: str
    customerId: str
    stateId: str | None = None
    action: str
    allowed: bool
    decision: Literal["ALLOW", "REQUIRE_CONFIRMATION", "BLOCK"]
    policyCode: str
    reason: str
    timestamp: str


class ContextPassport(BaseModel):
    id: str
    customerId: str
    purpose: str
    fields: dict[str, Any]
    createdAt: str
    expiresAt: str
    revokedAt: str | None = None


class DemoSeed(BaseModel):
    customer: Customer
    events: list[CustomerEvent]
    journeyTemplate: list[JourneyStep]
    unresolvedQuestions: list[str]

from __future__ import annotations

from datetime import datetime, timedelta, timezone
import os
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.models.domain import ContextPassport, PolicyDecision
from app.repositories.factory import get_repository, mock_enabled
from app.repositories.mock import MockRepository
from app.services.journeys import create_home_journey
from app.services.policy_engine import evaluate_action
from app.services.state_engine import calculate_confidence

app = FastAPI(title="KBC Compass Demo API", version="0.1.0")

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
def http_error_handler(request: Request, exc: HTTPException):
    if isinstance(exc.detail, dict) and "error" in exc.detail:
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"error": {"code": "HTTP_ERROR", "message": str(exc.detail), "details": {}}})


def error(status_code: int, code: str, message: str):
    raise HTTPException(status_code=status_code, detail={"error": {"code": code, "message": message, "details": {}}})


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class CustomerBody(BaseModel):
    customerId: str = "elise"


class PlayBody(CustomerBody):
    mode: str = "remaining"


class RejectBody(CustomerBody):
    reason: str = "not_relevant"


class PolicyBody(CustomerBody):
    stateId: str | None = None
    action: str


class PassportBody(CustomerBody):
    purpose: str
    selectedFields: list[str] = Field(default_factory=list)
    ttlHours: int = Field(default=24, ge=1, le=168)


@app.get("/api/health")
def health():
    return {"ok": True, "mockMode": mock_enabled()}


@app.get("/api/customers")
def customers():
    repo = get_repository()
    return {"customers": [c.model_dump() for c in repo.customers()]}


@app.get("/api/customers/{customer_id}")
def customer(customer_id: str):
    item = get_repository().customer(customer_id)
    if not item:
        error(404, "CUSTOMER_NOT_FOUND", "Customer not found")
    return item


@app.post("/api/simulation/reset")
def reset(body: CustomerBody):
    repo = get_repository()
    try:
        repo.reset(body.customerId)
    except KeyError:
        error(404, "CUSTOMER_NOT_FOUND", "Customer not found")
    return {"ok": True, "customerId": body.customerId, "confidence": 0, "state": None, "events": []}


@app.post("/api/simulation/events/{event_id}")
def inject_event(event_id: str, body: CustomerBody = CustomerBody()):
    repo = get_repository()
    try:
        event = repo.apply_event(body.customerId, event_id)
    except KeyError as exc:
        code = str(exc).strip("'")
        error(404, code, "Event not found" if code == "EVENT_NOT_FOUND" else "Customer not found")
    except ValueError:
        error(409, "EVENT_ALREADY_APPLIED", "Event already applied")
    state_obj = repo.get_state(body.customerId)
    confidence = calculate_confidence(repo.applied_events(body.customerId))
    return {
        "event": {"id": event.id, "type": event.type},
        "confidence": confidence,
        "state": state_obj.model_dump() if state_obj else None,
    }


@app.post("/api/simulation/play")
def play(body: PlayBody):
    repo = get_repository()
    applied_ids = {e.id for e in repo.applied_events(body.customerId)}
    applied = []
    for event in repo.available_events(body.customerId):
        if event.id not in applied_ids:
            repo.apply_event(body.customerId, event.id)
            applied.append(event.model_dump())
    state_obj = repo.get_state(body.customerId)
    confidence = calculate_confidence(repo.applied_events(body.customerId))
    return {"events": applied, "confidence": confidence, "state": state_obj.model_dump() if state_obj else None}


@app.get("/api/customers/{customer_id}/state")
def state(customer_id: str):
    item = get_repository().get_state(customer_id)
    if not item:
        error(404, "STATE_NOT_FOUND", "State not found")
    return {"state": item.model_dump()}


@app.post("/api/states/{state_id}/confirm")
def confirm(state_id: str, body: CustomerBody):
    repo = get_repository()
    item = repo.get_state(body.customerId)
    if not item or item.id != state_id:
        error(404, "STATE_NOT_FOUND", "State not found")
    item.status = "confirmed"
    repo.save_state(item)
    template = repo.seed.journeyTemplate if isinstance(repo, MockRepository) else []
    journey = create_home_journey(body.customerId, item, template)
    repo.save_journey(journey)
    return {"state": item.model_dump(), "journeyId": journey.id}


@app.post("/api/states/{state_id}/reject")
def reject(state_id: str, body: RejectBody):
    repo = get_repository()
    item = repo.get_state(body.customerId)
    if not item or item.id != state_id:
        error(404, "STATE_NOT_FOUND", "State not found")
    item.status = "rejected"
    repo.save_state(item)
    return {"state": item.model_dump(), "cooldownUntil": "2026-10-30T12:00:00Z"}


@app.get("/api/customers/{customer_id}/journey")
def journey(customer_id: str):
    item = get_repository().get_journey(customer_id)
    if not item:
        error(404, "JOURNEY_NOT_AVAILABLE", "Journey not available before confirmation")
    return {"journey": item.model_dump()}


@app.post("/api/journeys/{journey_id}/steps/{step_id}/complete")
def complete_step(journey_id: str, step_id: str, body: CustomerBody = CustomerBody()):
    repo = get_repository()
    item = repo.get_journey(body.customerId)
    if not item or item.id != journey_id:
        error(404, "JOURNEY_NOT_AVAILABLE", "Journey not found")
    found = False
    for step in item.steps:
        if step.id == step_id:
            step.status = "done"
            found = True
        elif found and step.status == "todo":
            step.status = "active"
            break
    if not found:
        error(404, "JOURNEY_STEP_NOT_FOUND", "Journey step not found")
    repo.save_journey(item)
    return {"journey": item.model_dump()}


@app.post("/api/policy/evaluate")
def policy(body: PolicyBody):
    repo = get_repository()
    state_obj = repo.get_state(body.customerId)
    allowed, decision, code, reason = evaluate_action(state_obj, body.action)
    record = PolicyDecision(
        id=f"policy_{uuid4().hex}",
        customerId=body.customerId,
        stateId=body.stateId,
        action=body.action,
        allowed=allowed,
        decision=decision,
        policyCode=code,
        reason=reason,
        timestamp="2026-09-30T18:00:00Z",
    )
    repo.save_policy_decision(record)
    return {"allowed": allowed, "decision": decision, "policyCode": code, "reason": reason}


@app.post("/api/context-passports", status_code=status.HTTP_201_CREATED)
def create_passport(body: PassportBody):
    repo = get_repository()
    state_obj = repo.get_state(body.customerId)
    if not state_obj or state_obj.status != "confirmed":
        error(409, "STATE_NOT_CONFIRMED", "State must be confirmed before sharing context")
    allowed_fields = {"confirmedGoal", "journeyProgress", "unresolvedQuestions"}
    if not body.selectedFields or not set(body.selectedFields).issubset(allowed_fields):
        error(422, "INVALID_SCOPE", "Selected fields exceed the Context Passport allowlist")
    journey_obj = repo.get_journey(body.customerId)
    values = {
        "confirmedGoal": "Explore a home purchase",
        "journeyProgress": [s.key for s in journey_obj.steps if s.status == "done"] if journey_obj else [],
        "unresolvedQuestions": repo.seed.unresolvedQuestions if isinstance(repo, MockRepository) else [],
    }
    created = utc_now()
    passport = ContextPassport(
        id=f"pass_{uuid4().hex}",
        customerId=body.customerId,
        purpose=body.purpose,
        fields={k: values[k] for k in body.selectedFields},
        createdAt=created.isoformat().replace("+00:00", "Z"),
        expiresAt=(created + timedelta(hours=body.ttlHours)).isoformat().replace("+00:00", "Z"),
    )
    repo.save_passport(passport)
    return {"passport": passport.model_dump()}


@app.get("/api/context-passports/{passport_id}")
def get_passport(passport_id: str):
    item = get_repository().get_passport(passport_id)
    if not item:
        error(404, "PASSPORT_NOT_FOUND", "Context Passport not found")
    expires_at = datetime.fromisoformat(item.expiresAt.replace("Z", "+00:00"))
    if item.revokedAt is not None or expires_at <= utc_now():
        error(410, "PASSPORT_EXPIRED", "Context Passport expired or revoked")
    return {"passport": item.model_dump()}

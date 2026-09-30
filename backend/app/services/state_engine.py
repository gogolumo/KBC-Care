from __future__ import annotations

from datetime import datetime, timedelta, timezone
from app.models.domain import CustomerEvent, CustomerState, Evidence

WEIGHTS = {
    "mortgage_simulation_completed": (30, "mortgage_simulation", "Used mortgage affordability simulator", 30),
    "myhome_repeated_visits": (15, "myhome_visits", "Visited MyHome multiple times", 14),
    "rent_pattern_changed": (18, "rent_pattern_changed", "Regular housing payment pattern changed", 30),
    "property_document_saved": (20, "property_document", "Saved a property-related document", 30),
}


def _parse(ts: str) -> datetime:
    return datetime.fromisoformat(ts.replace("Z", "+00:00"))


def calculate_confidence(events: list[CustomerEvent]) -> int:
    return min(100, sum(WEIGHTS[event.type][0] for event in events if event.type in WEIGHTS))


def build_state(customer_id: str, events: list[CustomerEvent], previous_status: str | None = None) -> CustomerState | None:
    evidence: list[Evidence] = []
    for event in events:
        spec = WEIGHTS.get(event.type)
        if not spec:
            continue
        weight, code, label, ttl_days = spec
        observed = _parse(event.timestamp)
        expires = observed + timedelta(days=ttl_days)
        evidence.append(Evidence(
            eventId=event.id,
            code=code,
            label=label,
            weight=weight,
            observedAt=event.timestamp,
            expiresAt=expires.astimezone(timezone.utc).isoformat().replace("+00:00", "Z"),
            active=True,
        ))

    if not evidence:
        return None

    confidence = calculate_confidence(events)
    if confidence < 60 and previous_status not in {"confirmed", "rejected", "paused"}:
        return None

    latest = max(_parse(item.observedAt) for item in evidence)
    created = min(_parse(item.observedAt) for item in evidence)
    expires = latest + timedelta(days=30)
    status = previous_status if previous_status in {"confirmed", "rejected", "paused"} else "inferred"
    return CustomerState(
        id="state_home",
        customerId=customer_id,
        type="possible_home_purchase",
        confidence=confidence,
        status=status,
        evidence=evidence,
        createdAt=created.astimezone(timezone.utc).isoformat().replace("+00:00", "Z"),
        updatedAt=latest.astimezone(timezone.utc).isoformat().replace("+00:00", "Z"),
        expiresAt=expires.astimezone(timezone.utc).isoformat().replace("+00:00", "Z"),
    )

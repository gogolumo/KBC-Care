"""Walk the golden demo path and print every request/response.

In-process (no server needed):   python -m scripts.golden_path
Against a running server:        python -m scripts.golden_path --base-url http://127.0.0.1:8000

Runs the flow twice (TEAM_PLAYBOOK reliability gate: reset -> full flow -> reset -> full flow)
and checks the visible confidence progression 0 -> 30 -> 45 -> 63 -> 83.
Exits non-zero on any unexpected status code, confidence or non-identical replay.
"""
from __future__ import annotations

import argparse
import json
import sys

import httpx

EXPECTED_CONFIDENCE = {"evt_salary": 0, "evt_mortgage": 30, "evt_myhome": 45, "evt_rent": 63, "evt_property_doc": 83}

STEPS = [
    ("POST", "/api/simulation/reset", {"customerId": "elise"}, 200),
    ("GET", "/api/customers/elise", None, 200),
    ("POST", "/api/simulation/events/evt_salary", {"customerId": "elise"}, 200),
    ("POST", "/api/simulation/events/evt_mortgage", {"customerId": "elise"}, 200),
    ("POST", "/api/simulation/events/evt_myhome", {"customerId": "elise"}, 200),
    ("GET", "/api/customers/elise/state", None, 404),
    ("POST", "/api/simulation/events/evt_rent", {"customerId": "elise"}, 200),
    ("POST", "/api/simulation/events/evt_property_doc", {"customerId": "elise"}, 200),
    ("GET", "/api/customers/elise/state", None, 200),
    ("GET", "/api/customers/elise/state/explanation", None, 200),
    ("POST", "/api/policy/evaluate", {"customerId": "elise", "stateId": "state_home", "action": "PRE_APPROVED_MORTGAGE_OFFER"}, 200),
    ("POST", "/api/policy/evaluate", {"customerId": "elise", "stateId": "state_home", "action": "ASK_STATE_CONFIRMATION"}, 200),
    ("GET", "/api/customers/elise/journey", None, 404),
    ("POST", "/api/states/state_home/confirm", {"customerId": "elise"}, 200),
    ("GET", "/api/customers/elise/journey", None, 200),
    ("POST", "/api/journeys/journey_home/steps/budget/complete", {"customerId": "elise"}, 200),
    ("POST", "/api/policy/evaluate", {"customerId": "elise", "stateId": "state_home", "action": "CREATE_CONTEXT_PASSPORT"}, 200),
    ("POST", "/api/context-passports", {
        "customerId": "elise",
        "purpose": "kbc_live_home_exploration",
        "selectedFields": ["confirmedGoal", "journeyProgress", "unresolvedQuestions"],
        "ttlHours": 24,
    }, 201),
    ("GET", "/api/context-passports/{passportId}", None, 200),
]


def make_client(base_url: str | None):
    if base_url:
        return httpx.Client(base_url=base_url, timeout=10)
    from fastapi.testclient import TestClient

    from app.main import app

    return TestClient(app)


# Unique per passport / real clock (PR #8) -> excluded from the replay comparison.
VOLATILE_PASSPORT_FIELDS = {"id", "createdAt", "expiresAt"}


def _stable(data):
    if isinstance(data, dict) and isinstance(data.get("passport"), dict):
        return {**data, "passport": {k: v for k, v in data["passport"].items() if k not in VOLATILE_PASSPORT_FIELDS}}
    return data


def run_once(client, quiet: bool) -> tuple[int, list]:
    failures, transcript, passport_id = 0, [], None
    for method, path, body, expected in STEPS:
        path = path.replace("{passportId}", passport_id or "missing")
        response = client.request(method, path, json=body) if body is not None else client.request(method, path)
        data = response.json()
        if path == "/api/context-passports" and response.status_code == 201:
            passport_id = data["passport"]["id"]
        ok = response.status_code == expected
        event_id = path.rsplit("/", 1)[-1]
        if ok and event_id in EXPECTED_CONFIDENCE:
            ok = data.get("confidence") == EXPECTED_CONFIDENCE[event_id]
        failures += 0 if ok else 1
        transcript.append((path if "context-passports/" not in path else "passport-read", response.status_code, _stable(data)))
        print(f"{'OK ' if ok else 'BAD'} {method} {path} -> {response.status_code} (expected {expected})")
        if not quiet:
            if body is not None:
                print("  request: " + json.dumps(body))
            print("  response: " + json.dumps(data, indent=2).replace("\n", "\n  "))
    return failures, transcript


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default=None)
    parser.add_argument("--quiet", action="store_true")
    parser.add_argument("--runs", type=int, default=2)
    args = parser.parse_args()
    client = make_client(args.base_url)
    failures, transcripts = 0, []
    for run in range(1, args.runs + 1):
        print(f"--- run {run}/{args.runs} ---")
        run_failures, transcript = run_once(client, quiet=args.quiet or run > 1)
        failures += run_failures
        transcripts.append(transcript)
    identical = all(t == transcripts[0] for t in transcripts)
    if not identical:
        failures += 1
    total = len(STEPS) * args.runs
    print(f"\n{total - failures}/{total} checks OK; replays identical: {identical}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())

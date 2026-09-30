from __future__ import annotations

import json
from pathlib import Path
from app.models.domain import DemoSeed


def main() -> None:
    path = Path(__file__).with_name("elise.json")
    seed = DemoSeed.model_validate(json.loads(path.read_text(encoding="utf-8")))
    ids = [event.id for event in seed.events]
    if len(ids) != len(set(ids)):
        raise SystemExit("duplicate event ids")
    print(f"Validated deterministic demo seed: {seed.customer.id}, {len(seed.events)} events")


if __name__ == "__main__":
    main()

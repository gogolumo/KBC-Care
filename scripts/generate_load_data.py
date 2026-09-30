#!/usr/bin/env python3
"""Stream minimal synthetic customers as JSONL; never commit the generated file."""
import argparse
import json
from pathlib import Path

ALLOWED = {1_000, 10_000, 100_000, 1_000_000, 2_000_000}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("count", type=int, choices=sorted(ALLOWED))
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    output = args.output or Path(f"/tmp/kbc-customers-{args.count}.jsonl")

    with output.open("w", encoding="utf-8") as handle:
        for number in range(1, args.count + 1):
            record = {"id": f"load_{number:07d}", "personaKey": "home_purchase"}
            handle.write(json.dumps(record, separators=(",", ":")) + "\n")

    size = output.stat().st_size
    print(json.dumps({
        "count": args.count,
        "path": str(output),
        "bytes": size,
        "bytesPerCustomer": round(size / args.count, 2),
    }))


if __name__ == "__main__":
    main()

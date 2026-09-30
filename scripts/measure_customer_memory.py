#!/usr/bin/env python3
"""Measure process-local memory for a compact active-customer state shape.

This does NOT claim that the current backend can persist 2M registered
customers. It isolates the cost of the mutable per-active-customer maps used by
the in-memory architecture.
"""
import argparse
import gc
import json
import resource


def rss_bytes():
    return resource.getrusage(resource.RUSAGE_SELF).ru_maxrss * 1024


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("count", type=int)
    args = parser.parse_args()

    gc.collect()
    before = rss_bytes()
    applied = {}
    states = {}

    for number in range(1, args.count + 1):
        customer_id = f"load_{number:07d}"
        applied[customer_id] = [
            "evt_salary",
            "evt_mortgage",
            "evt_myhome",
            "evt_rent",
            "evt_property_doc",
        ]
        states[customer_id] = {"confidence": 83, "status": "inferred"}

    after = rss_bytes()
    delta = max(0, after - before)
    print(json.dumps({
        "count": args.count,
        "rssBefore": before,
        "rssAfter": after,
        "deltaBytes": delta,
        "bytesPerActiveCustomer": round(delta / args.count, 2) if args.count else 0,
    }))


if __name__ == "__main__":
    main()

"""How much RAM does the in-memory backend need for N customers with live state?

Runs in-process (no HTTP), using the real MockRepository + state engine, so it
measures the actual data structures the API keeps per customer.

Each simulated customer gets the 5 demo events applied (the heaviest per-customer
state: applied events + inferred state with 4 evidence items). Measures process
memory at checkpoints and extrapolates linearly to the target population.

    backend\\.venv\\Scripts\\python performance\\population_memory.py --customers 100000 --target 1000000
"""
from __future__ import annotations

import argparse
import gc
import json
import os
import sys
import time

from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))  # works from any directory


def rss_mb() -> float:
    try:
        import psutil  # type: ignore

        return psutil.Process().memory_info().rss / 2**20
    except ImportError:
        pass
    if os.name == "nt":
        import ctypes
        from ctypes import wintypes

        class PMC(ctypes.Structure):
            _fields_ = [("cb", wintypes.DWORD), ("PageFaultCount", wintypes.DWORD),
                        ("PeakWorkingSetSize", ctypes.c_size_t), ("WorkingSetSize", ctypes.c_size_t),
                        ("QuotaPeakPagedPoolUsage", ctypes.c_size_t), ("QuotaPagedPoolUsage", ctypes.c_size_t),
                        ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t), ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
                        ("PagefileUsage", ctypes.c_size_t), ("PeakPagefileUsage", ctypes.c_size_t)]

        kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
        # Declare types: without this, the 64-bit pseudo-handle (-1) is truncated to 32 bits
        # and the call silently fails, returning all-zero counters.
        kernel32.GetCurrentProcess.restype = wintypes.HANDLE
        get_info = kernel32.K32GetProcessMemoryInfo
        get_info.argtypes = [wintypes.HANDLE, ctypes.POINTER(PMC), wintypes.DWORD]
        get_info.restype = wintypes.BOOL
        counters = PMC()
        counters.cb = ctypes.sizeof(PMC)
        if not get_info(kernel32.GetCurrentProcess(), ctypes.byref(counters), counters.cb):
            raise OSError(ctypes.get_last_error(), "K32GetProcessMemoryInfo failed")
        return counters.WorkingSetSize / 2**20
    with open("/proc/self/status") as fh:  # Linux
        for line in fh:
            if line.startswith("VmRSS:"):
                return int(line.split()[1]) / 1024
    return 0.0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--customers", type=int, default=100_000, help="customers to actually build (default 100k)")
    parser.add_argument("--target", type=int, default=1_000_000, help="population to extrapolate to")
    args = parser.parse_args()

    os.environ["USE_MOCK_DATA"] = "true"
    os.environ["LOAD_TEST_CUSTOMERS"] = str(max(args.customers, args.target))
    from app.repositories.mock import MockRepository

    events = ["evt_salary", "evt_mortgage", "evt_myhome", "evt_rent", "evt_property_doc"]
    repo = MockRepository()
    gc.collect()
    base = rss_mb()
    checkpoints = sorted({c for c in (1_000, 10_000, 50_000, args.customers) if c <= args.customers})
    rows, started, done = [], time.perf_counter(), 0

    for target in checkpoints:
        while done < target:
            done += 1
            cid = f"load_{done:07d}"
            for event_id in events:
                repo.apply_event(cid, event_id)
        gc.collect()
        used = rss_mb() - base
        elapsed = time.perf_counter() - started
        rows.append({
            "customers": done,
            "memoryMB": round(used, 1),
            "kbPerCustomer": round(used * 1024 / done, 2),
            "secondsSoFar": round(elapsed, 1),
            "eventsPerSec": round(done * len(events) / elapsed),
        })
        print(json.dumps(rows[-1]), flush=True)

    per_customer_kb = rows[-1]["kbPerCustomer"]
    if per_customer_kb <= 0:
        print("ERROR memory measurement returned 0 - measurement is broken, not the backend", flush=True)
        return 2
    projected_gb = per_customer_kb * args.target / 2**20
    state = repo.get_state(f"load_{done:07d}")
    summary = {
        "measuredCustomers": done,
        "kbPerCustomer": per_customer_kb,
        "targetPopulation": args.target,
        "projectedMemoryGB_allActive": round(projected_gb, 2),
        "projectedMemoryGB_15pctActive": round(projected_gb * 0.15, 2),
        "stateEngineEventsPerSec": rows[-1]["eventsPerSec"],
        "sanityCheckConfidence": state.confidence if state else None,
    }
    print("SUMMARY " + json.dumps(summary), flush=True)
    return 0 if summary["sanityCheckConfidence"] == 83 else 1


if __name__ == "__main__":
    sys.exit(main())

from __future__ import annotations

import os
from functools import lru_cache
from app.repositories.base import DemoRepository
from app.repositories.mock import MockRepository


def mock_enabled() -> bool:
    return os.getenv("USE_MOCK_DATA", "true").strip().lower() in {"1", "true", "yes", "on"}


@lru_cache(maxsize=1)
def get_repository() -> DemoRepository:
    if mock_enabled():
        return MockRepository()
    raise RuntimeError("Real repository is not implemented yet. Set USE_MOCK_DATA=true for the hackathon demo.")

#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-8080}"
BACKEND_PORT="${BACKEND_PORT:-8000}"

cleanup() {
  trap - EXIT INT TERM
  if [ -n "${FRONTEND_PID:-}" ]; then kill "$FRONTEND_PID" >/dev/null 2>&1 || true; fi
  if [ -n "${BACKEND_PID:-}" ]; then kill "$BACKEND_PID" >/dev/null 2>&1 || true; fi
  wait >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

cd /app/backend
USE_MOCK_DATA="${USE_MOCK_DATA:-true}" /opt/venv/bin/python -m uvicorn app.main:app \
  --host 127.0.0.1 --port "$BACKEND_PORT" &
BACKEND_PID=$!

for _ in $(seq 1 40); do
  if curl -fsS "http://127.0.0.1:$BACKEND_PORT/api/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done
curl -fsS "http://127.0.0.1:$BACKEND_PORT/api/health" >/dev/null

cd /app/frontend
BACKEND_URL="http://127.0.0.1:$BACKEND_PORT" pnpm exec next start \
  --hostname 0.0.0.0 --port "$PORT" &
FRONTEND_PID=$!

wait -n "$BACKEND_PID" "$FRONTEND_PID"
exit 1

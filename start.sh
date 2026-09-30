#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
RUNTIME_DIR="$ROOT_DIR/.runtime"
BACKEND_URL="http://127.0.0.1:8000"
FRONTEND_URL="http://localhost:3000"

mkdir -p "$RUNTIME_DIR"

fail() {
  printf "\n❌ %s\n" "$1" >&2
  exit 1
}

command -v python3 >/dev/null 2>&1 || fail "Python 3 is required. Install Python 3.10+ and run this command again."
command -v node >/dev/null 2>&1 || fail "Node.js is required. Install Node.js 20+ and run this command again."
command -v npm >/dev/null 2>&1 || fail "npm is required with Node.js."

PYTHON_MAJOR_MINOR="$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
python3 - <<'PY' || fail "Python 3.10+ is required."
import sys
raise SystemExit(0 if sys.version_info >= (3, 10) else 1)
PY

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 20 ]; then
  fail "Node.js 20+ is required. Current version: $(node --version)"
fi

run_pnpm() {
  if command -v pnpm >/dev/null 2>&1; then
    pnpm "$@"
  elif command -v corepack >/dev/null 2>&1; then
    corepack pnpm "$@"
  else
    npx --yes pnpm@12.8.1 "$@"
  fi
}

port_in_use() {
  if command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$1" -sTCP:LISTEN -t >/dev/null 2>&1
    return $?
  fi
  return 1
}

port_in_use 8000 && fail "Port 8000 is already in use. Stop the existing process and run again."
port_in_use 3000 && fail "Port 3000 is already in use. Stop the existing process and run again."

printf "🧭 Preparing KBC Compass...\n"
printf "   Python: %s\n" "$PYTHON_MAJOR_MINOR"
printf "   Node:   %s\n" "$(node --version)"

if [ ! -d "$BACKEND_DIR/.venv" ]; then
  printf "→ Creating backend virtual environment...\n"
  python3 -m venv "$BACKEND_DIR/.venv"
fi

REQ_STAMP="$BACKEND_DIR/.venv/.requirements.snapshot"
if [ ! -f "$REQ_STAMP" ] || ! cmp -s "$BACKEND_DIR/requirements.txt" "$REQ_STAMP"; then
  printf "→ Installing backend dependencies...\n"
  "$BACKEND_DIR/.venv/bin/python" -m pip install --upgrade pip >/dev/null
  "$BACKEND_DIR/.venv/bin/python" -m pip install -r "$BACKEND_DIR/requirements.txt"
  cp "$BACKEND_DIR/requirements.txt" "$REQ_STAMP"
fi

printf "→ Validating synthetic Elise demo data...\n"
(
  cd "$BACKEND_DIR"
  USE_MOCK_DATA=true .venv/bin/python -m app.seed.validate
)

printf "→ Installing frontend dependencies...\n"
(
  cd "$FRONTEND_DIR"
  run_pnpm install --frozen-lockfile
)

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  trap - EXIT INT TERM
  printf "\n→ Stopping KBC Compass...\n"
  if [ -n "$FRONTEND_PID" ]; then kill "$FRONTEND_PID" >/dev/null 2>&1 || true; fi
  if [ -n "$BACKEND_PID" ]; then kill "$BACKEND_PID" >/dev/null 2>&1 || true; fi
  wait >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

printf "→ Starting FastAPI...\n"
(
  cd "$BACKEND_DIR"
  USE_MOCK_DATA=true .venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
) >"$RUNTIME_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

printf "→ Starting Next.js...\n"
(
  cd "$FRONTEND_DIR"
  BACKEND_URL="$BACKEND_URL" run_pnpm dev
) >"$RUNTIME_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

wait_for_url() {
  local url="$1"
  local label="$2"
  local attempts=40
  while [ "$attempts" -gt 0 ]; do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    attempts=$((attempts - 1))
    sleep 0.5
  done
  printf "\n❌ %s did not become ready.\n" "$label" >&2
  return 1
}

if ! wait_for_url "$BACKEND_URL/api/health" "FastAPI"; then
  tail -n 40 "$RUNTIME_DIR/backend.log" >&2 || true
  exit 1
fi

if ! wait_for_url "$FRONTEND_URL/api/health" "Next.js"; then
  tail -n 40 "$RUNTIME_DIR/frontend.log" >&2 || true
  exit 1
fi

printf "\n✅ KBC Compass is running\n\n"
printf "App:      %s\n" "$FRONTEND_URL"
printf "API:      %s\n" "$BACKEND_URL"
printf "Health:   %s/api/health\n" "$BACKEND_URL"
printf "API docs: %s/docs\n" "$BACKEND_URL"
printf "\nPress Ctrl+C to stop both servers.\n"

if [ "$(uname -s)" = "Darwin" ] && command -v open >/dev/null 2>&1; then
  open "$FRONTEND_URL" >/dev/null 2>&1 || true
fi

while true; do
  if ! kill -0 "$BACKEND_PID" >/dev/null 2>&1; then
    printf "\n❌ Backend stopped unexpectedly. Last log lines:\n" >&2
    tail -n 40 "$RUNTIME_DIR/backend.log" >&2 || true
    exit 1
  fi
  if ! kill -0 "$FRONTEND_PID" >/dev/null 2>&1; then
    printf "\n❌ Frontend stopped unexpectedly. Last log lines:\n" >&2
    tail -n 40 "$RUNTIME_DIR/frontend.log" >&2 || true
    exit 1
  fi
  sleep 2
done

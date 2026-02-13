#!/usr/bin/env bash
# Run Backend_API + Frontend_React with env wired so they connect to each other and to Storage.
# Run from workspace root: ./scripts/run-dev.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

# Defaults
export STORAGE_ROOT="${STORAGE_ROOT:-$ROOT/Storage}"
export PORT="${PORT:-3001}"
export VITE_API_URL="${VITE_API_URL:-http://localhost:3001}"
export VITE_PIXEL_STREAM_URL="${VITE_PIXEL_STREAM_URL:-http://localhost:80}"

# Load .env if present (values in .env override; empty vars do not override defaults)
if [ -f "$ROOT/.env" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$ROOT/.env"
  set +a
  [ -z "$STORAGE_ROOT" ] && export STORAGE_ROOT="$ROOT/Storage"
  [ -z "$PORT" ] && export PORT="3001"
  [ -z "$VITE_API_URL" ] && export VITE_API_URL="http://localhost:3001"
  [ -z "$VITE_PIXEL_STREAM_URL" ] && export VITE_PIXEL_STREAM_URL="http://localhost:80"
fi

echo "Storage:    $STORAGE_ROOT"
echo "Backend:    $VITE_API_URL"
echo "Stream URL: $VITE_PIXEL_STREAM_URL (Option A: UE embedded server on port 80)"
echo ""

# Ensure Storage exists
mkdir -p "$STORAGE_ROOT/raw" "$STORAGE_ROOT/processed"

BACKEND_PID=""
cleanup() {
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# Start Backend_API
echo "Starting Backend_API on port $PORT..."
(cd "$ROOT/Backend_API" && node src/app.js) &
BACKEND_PID=$!
sleep 2
if ! kill -0 $BACKEND_PID 2>/dev/null; then
  echo "Backend failed to start. Run: cd Backend_API && npm install && npm start"
  exit 1
fi

# Start Frontend_React (blocking)
echo "Starting Frontend_React (Vite)..."
cd "$ROOT/Frontend_React"
exec npm run dev

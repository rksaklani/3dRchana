#!/usr/bin/env bash
# Run Backend_API + SignallingWebServer (PixelStreamingInfrastructure) + Frontend_React
# so the full stack is up. Run from workspace root: ./scripts/run-all.sh
# Exit with Ctrl+C; backend and signalling are stopped automatically.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

# Defaults
export STORAGE_ROOT="${STORAGE_ROOT:-$ROOT/Storage}"
export PORT="${PORT:-3001}"
export VITE_API_URL="${VITE_API_URL:-http://localhost:3001}"
export VITE_PIXEL_STREAM_URL="${VITE_PIXEL_STREAM_URL:-http://localhost:80}"

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

# Free ports if in use (e.g. from a previous run) — use SIGKILL so ports are released before we start
# (lsof exits 1 when no process uses the port; avoid set -e exiting by using || true in the substitution)
for p in 1025 3001 5173 5174 8888 8889 18888 18889; do
  PIDS=$(lsof -ti:"$p" 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    echo "Freeing port $p (PIDs: $PIDS)..."
    echo "$PIDS" | xargs -r kill -9 2>/dev/null || true
  fi
done
sleep 3

# Use player 1025, streamer 18888, SFU 18889 to avoid conflicts with 80/8888/8889
export SIGNALLING_PLAYER_PORT="${SIGNALLING_PLAYER_PORT:-1025}"
export STREAMER_PORT="${STREAMER_PORT:-18888}"
export SIGNALLING_SFU_PORT="${SIGNALLING_SFU_PORT:-18889}"
export VITE_PIXEL_STREAM_URL="http://localhost:$SIGNALLING_PLAYER_PORT"

echo "=============================================="
echo "  UE 3D Viewer – Full stack"
echo "=============================================="
echo "  Storage:     $STORAGE_ROOT"
echo "  Backend:     $VITE_API_URL"
echo "  Stream URL:  $VITE_PIXEL_STREAM_URL"
echo "=============================================="
echo ""

mkdir -p "$STORAGE_ROOT/raw" "$STORAGE_ROOT/processed"

# PIDs for cleanup on Ctrl+C (Frontend runs in foreground, so not tracked)
BACKEND_PID=""
SIGNALLING_PID=""
STREAMER_PID=""
cleanup() {
  echo ""
  echo "Stopping services..."
  [ -n "$BACKEND_PID" ]     && kill "$BACKEND_PID" 2>/dev/null || true
  [ -n "$SIGNALLING_PID" ]  && kill "$SIGNALLING_PID" 2>/dev/null || true
  [ -n "$STREAMER_PID" ]    && kill "$STREAMER_PID" 2>/dev/null || true
  exit 0
}
trap cleanup EXIT INT TERM

echo "[1/3] Starting Backend_API on port $PORT..."
(cd "$ROOT/Backend_API" && node src/app.js) &
BACKEND_PID=$!
sleep 1
if ! kill -0 $BACKEND_PID 2>/dev/null; then
  echo "Backend failed. Run: cd Backend_API && npm install && npm start"
  exit 1
fi
echo "       Backend_API OK"

echo "[2/3] Starting SignallingWebServer (PixelStreamingInfrastructure) on player $SIGNALLING_PLAYER_PORT, streamer $STREAMER_PORT..."
(cd "$ROOT/PixelStreamingInfrastructure/SignallingWebServer/platform_scripts/bash" && ./start.sh -- --player_port "$SIGNALLING_PLAYER_PORT" --streamer_port "$STREAMER_PORT" --sfu_port "$SIGNALLING_SFU_PORT") &
SIGNALLING_PID=$!
sleep 3
if ! kill -0 $SIGNALLING_PID 2>/dev/null; then
  echo "SignallingWebServer may have failed. Check PixelStreamingInfrastructure."
fi
echo "       SignallingWebServer started (PID $SIGNALLING_PID)"

"$SCRIPT_DIR/print-streamer-commands.sh"

# Optional: start UE streamer if UE_LINUX_NO_EDITOR is set and runner exists
UE_LINUX_NO_EDITOR="${UE_LINUX_NO_EDITOR:-$ROOT/UE_3DViewer_Project/LinuxNoEditor}"
STREAMER_RUNNER="$UE_LINUX_NO_EDITOR/UE_3DViewer_Project.sh"
STREAMER_IP="${STREAMER_IP:-127.0.0.1}"
RESOLUTION_X="${RESOLUTION_X:-1920}"
RESOLUTION_Y="${RESOLUTION_Y:-1080}"
if [ -x "$STREAMER_RUNNER" ]; then
  echo "[2b] Starting UE streamer (packaged build)..."
  (cd "$UE_LINUX_NO_EDITOR" && ./UE_3DViewer_Project.sh -vulkan -PixelStreamingIP="$STREAMER_IP" -PixelStreamingPort="$STREAMER_PORT" -RenderOffscreen -ForceRes -ResX="$RESOLUTION_X" -ResY="$RESOLUTION_Y") &
  STREAMER_PID=$!
  sleep 2
  echo "       UE streamer started (PID $STREAMER_PID)"
else
  echo "       UE streamer not started (set UE_LINUX_NO_EDITOR in .env to packaged LinuxNoEditor path to auto-start)"
fi

echo "[3/3] Starting Frontend_React (Vite)..."
echo "  App: $VITE_API_URL (API) · Frontend URL will appear below (Local + Network when using --host)"
echo ""
cd "$ROOT/Frontend_React"
npm run dev:host

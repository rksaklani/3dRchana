#!/usr/bin/env bash
# Run the packaged UE_3DViewer_Project as Pixel Streaming streamer (GPU, Vulkan).
# Signalling server must be running first (e.g. ./scripts/run-all.sh).
# Run from workspace root: ./scripts/run-ue-streamer.sh
# Set UE_LINUX_NO_EDITOR in .env to the path of your LinuxNoEditor folder (e.g. .../UE_3DViewer_Project/LinuxNoEditor).

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

[ -f "$ROOT/.env" ] && set -a && source "$ROOT/.env" && set +a

STREAMER_IP="${STREAMER_IP:-127.0.0.1}"
STREAMER_PORT="${STREAMER_PORT:-8888}"
RESOLUTION_X="${RESOLUTION_X:-1920}"
RESOLUTION_Y="${RESOLUTION_Y:-1080}"

# Path to packaged Linux build (folder containing UE_3DViewer_Project.sh)
UE_LINUX_NO_EDITOR="${UE_LINUX_NO_EDITOR:-$ROOT/UE_3DViewer_Project/LinuxNoEditor}"
RUNNER="$UE_LINUX_NO_EDITOR/UE_3DViewer_Project.sh"

if [ ! -x "$RUNNER" ]; then
  echo "Packaged streamer not found: $RUNNER"
  echo "Set UE_LINUX_NO_EDITOR in .env to your LinuxNoEditor path, or run commands from print-streamer-commands.sh manually."
  echo ""
  "$SCRIPT_DIR/print-streamer-commands.sh"
  exit 1
fi

echo "Starting UE streamer (GPU/Vulkan) → $STREAMER_IP:$STREAMER_PORT"
echo "  Runner: $RUNNER"
echo ""
cd "$UE_LINUX_NO_EDITOR"
exec ./UE_3DViewer_Project.sh -vulkan -PixelStreamingIP="$STREAMER_IP" -PixelStreamingPort="$STREAMER_PORT" -RenderOffscreen -ForceRes -ResX="$RESOLUTION_X" -ResY="$RESOLUTION_Y"

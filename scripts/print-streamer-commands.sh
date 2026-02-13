#!/usr/bin/env bash
# Print the exact commands to run UE_3DViewer_Project as Pixel Streaming streamer.
# Run from workspace root: ./scripts/print-streamer-commands.sh
# Signalling server must be running (e.g. via ./scripts/run-all.sh). Options: STREAMER_IP, STREAMER_PORT, PLAYER_PORT, RESOLUTION_X, RESOLUTION_Y (or set in .env).

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

# Optional: use public IP for remote UE (e.g. UE on another machine). Source .env if present.
[ -f "$ROOT/.env" ] && set -a && source "$ROOT/.env" && set +a
STREAMER_IP="${STREAMER_IP:-127.0.0.1}"
STREAMER_PORT="${STREAMER_PORT:-8888}"
PLAYER_PORT="${PLAYER_PORT:-80}"
RESOLUTION_X="${RESOLUTION_X:-1920}"
RESOLUTION_Y="${RESOLUTION_Y:-1080}"

echo ""
echo "=============================================="
echo "  Connect UE streamer (port $STREAMER_PORT)"
echo "=============================================="
echo "  Signalling URL (browser):  http://localhost  (or http://$(hostname -I 2>/dev/null | awk '{print $1}' || echo 'YOUR_IP'))"
echo "  Streamer connects to:     $STREAMER_IP:$STREAMER_PORT"
echo "=============================================="
echo ""
echo "Option A — Unreal Editor"
echo "  1. Open UE_3DViewer_Project.uproject"
echo "  2. Plugins → enable Pixel Streaming, restart"
echo "  3. Launch with Pixel Streaming → Signalling URL: http://$STREAMER_IP"
echo ""
echo "Option B — Packaged Linux build (from LinuxNoEditor folder)"
echo "  ./UE_3DViewer_Project.sh -PixelStreamingIP=$STREAMER_IP -PixelStreamingPort=$STREAMER_PORT -RenderOffscreen -ForceRes -ResX=$RESOLUTION_X -ResY=$RESOLUTION_Y"
echo ""
echo "  If your build uses player port instead:"
echo "  ./UE_3DViewer_Project.sh -PixelStreamingIP=$STREAMER_IP -PixelStreamingPort=$PLAYER_PORT -RenderOffscreen -ForceRes -ResX=$RESOLUTION_X -ResY=$RESOLUTION_Y"
echo ""
echo "Option C — Packaged Windows build"
echo "  UE_3DViewer_Project.exe -PixelStreamingIP=$STREAMER_IP -PixelStreamingPort=$STREAMER_PORT -RenderOffscreen -ForceRes -ResX=$RESOLUTION_X -ResY=$RESOLUTION_Y"
echo ""
echo "  Or with WebSocket URL:"
echo "  UE_3DViewer_Project.exe -PixelStreamingURL=ws://$STREAMER_IP:$STREAMER_PORT -RenderOffscreen -ForceRes -ResX=$RESOLUTION_X -ResY=$RESOLUTION_Y"
echo ""
echo "When connected, signalling logs will show: Registered streamer / ids: [\"Streamer0\"]"
echo ""

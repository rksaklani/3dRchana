#!/usr/bin/env bash
# Start PixelStreamingInfrastructure SignallingWebServer (player + signalling).
# Run from workspace root: ./scripts/run-signalling.sh
# Then set VITE_PIXEL_STREAM_URL to the player URL (e.g. http://localhost:80) in .env.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT/PixelStreamingInfrastructure/SignallingWebServer/platform_scripts/bash"
exec ./start.sh "$@"

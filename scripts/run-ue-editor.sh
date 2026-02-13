#!/usr/bin/env bash
# Run Unreal Editor with UE_3DViewer_Project, using GPU (Vulkan on Linux).
# Run from workspace root: ./scripts/run-ue-editor.sh
# Set UE_EDITOR_BIN or UE_ROOT in .env if Engine is elsewhere.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

if [ -f "$ROOT/.env" ]; then
  set -a
  source "$ROOT/.env"
  set +a
fi

PROJECT="$ROOT/UE_3DViewer_Project/UE_3DViewer_Project.uproject"
if [ ! -f "$PROJECT" ]; then
  echo "Project not found: $PROJECT"
  exit 1
fi

UE_ROOT="${UE_ROOT:-$ROOT/UnrealEngine}"
UE_EDITOR_BIN="${UE_EDITOR_BIN:-$UE_ROOT/Engine/Binaries/Linux/UnrealEditor}"

if [ ! -x "$UE_EDITOR_BIN" ]; then
  echo "Unreal Editor not found: $UE_EDITOR_BIN"
  echo "Build the Engine or set UE_EDITOR_BIN or UE_ROOT in .env"
  exit 1
fi

exec "$UE_EDITOR_BIN" "$PROJECT" -vulkan

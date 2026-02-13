#!/usr/bin/env bash
# Kill processes on all ports used by this project (Backend, Frontend, Signalling, UE).
# Run from workspace root: ./scripts/kill-ports.sh
# Use sudo if you see "Operation not permitted" for some PIDs.

set -e
for p in 80 1025 3001 5173 5174 8888 8889 18888 18889; do
  PIDS=$(lsof -ti:"$p" 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    echo "Killing port $p (PIDs: $PIDS)"
    echo "$PIDS" | xargs -r kill -9 2>/dev/null || echo "$PIDS" | xargs -r sudo kill -9 2>/dev/null || true
  fi
done
echo "Done."

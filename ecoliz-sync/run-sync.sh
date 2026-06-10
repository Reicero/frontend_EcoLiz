#!/bin/bash
set -euo pipefail

PROJECT_DIR="/home/clarisse/frontend_EcoLiz/ecoliz-sync"
LOG_DIR="$PROJECT_DIR/logs"
LOCK_FILE="/tmp/ecoliz-sync.lock"

mkdir -p "$LOG_DIR"
cd "$PROJECT_DIR"

{
  echo ""
  echo "===== $(date -Is) - Début synchronisation EcoLiz ====="

  flock -n "$LOCK_FILE" env NODE_TLS_REJECT_UNAUTHORIZED=0 node sync-flexit.js

  echo "===== $(date -Is) - Fin synchronisation EcoLiz ====="
} >> "$LOG_DIR/cron-sync.log" 2>&1

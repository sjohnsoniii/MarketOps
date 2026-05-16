#!/usr/bin/env bash
set -euo pipefail

# MarketOps Refresh Runner
# Runs the full paper simulation loop.
# Paper-only. No live trading. No deploy. No post. No email. No SMS.
# Logs to MARKETOPS_CORE/../logs/

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CORE_DIR="$PROJECT_ROOT/Source/marketops-core"
LOG_DIR="$PROJECT_ROOT/logs"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$LOG_DIR/marketops-refresh-$TIMESTAMP.log"

mkdir -p "$LOG_DIR"
cd "$CORE_DIR"

echo "================================================" >> "$LOG_FILE"
echo "MarketOps Refresh: $TIMESTAMP" >> "$LOG_FILE"
echo "Mode: paper_simulation" >> "$LOG_FILE"
echo "Live trading: disabled" >> "$LOG_FILE"
echo "Broker orders: disabled" >> "$LOG_FILE"
echo "External posts: disabled" >> "$LOG_FILE"
echo "================================================" >> "$LOG_FILE"

# Run the full refresh
npm run marketops:refresh >> "$LOG_FILE" 2>&1

EXIT_CODE=$?

echo "" >> "$LOG_FILE"
echo "Exit code: $EXIT_CODE" >> "$LOG_FILE"
echo "Completed: $(date +%Y-%m-%dT%H:%M:%S%z)" >> "$LOG_FILE"

# Keep only last 30 logs
ls -t "$LOG_DIR"/marketops-refresh-*.log 2>/dev/null | tail -n +31 | xargs rm -f 2>/dev/null || true

exit $EXIT_CODE

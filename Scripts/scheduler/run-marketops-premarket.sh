#!/usr/bin/env bash
set -uo pipefail

# MarketOps Pre-Market data refresh: marketdata refresh + backfill + rolling.
# Hardened via the shared step library. No publish (prep only). Each step is
# DEGRADABLE — one failing data step must NOT skip the rest (the old `&&` chain
# aborted backfill+rolling if refresh hiccupped). Missing/stale data is then
# handled downstream by the refresh runner's CONTROLLED_DEGRADED path.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CORE_DIR="$PROJECT_ROOT/Source/marketops-core"

# Use the nvm-managed Node 24 toolchain so native modules (better-sqlite3)
# match the ABI they were built against; systemd's default PATH resolves
# `node` to the older /usr/bin/node otherwise.
export PATH="$HOME/.nvm/versions/node/v24.15.0/bin:$PATH"
LOG_DIR="$PROJECT_ROOT/logs"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$LOG_DIR/marketops-premarket-$TIMESTAMP.log"

mkdir -p "$LOG_DIR"
cd "$CORE_DIR"
source "$PROJECT_ROOT/Scripts/lib/marketops-steplib.sh"

{
    echo "================================================"
    echo "MarketOps Pre-Market Data Refresh: $TIMESTAMP"
    echo "================================================"
} >> "$LOG_FILE"

run_step "marketdata:refresh"  DEGRADABLE npm run marketdata:refresh
run_step "marketdata:backfill" DEGRADABLE npm run marketdata:backfill
run_step "marketdata:rolling"  DEGRADABLE npm run marketdata:rolling

log_step_summary

if [ "${#DEGRADED_STEPS[@]}" -gt 0 ]; then
    STATUS="DEGRADED"
    REASON="Degraded step(s): ${DEGRADED_STEPS[*]}; continued. Downstream refresh handles stale data."
else
    STATUS="PASS"
    REASON="All pre-market data steps completed."
fi
{
    echo ""
    echo "Final status: $STATUS"
    echo "Reason: $REASON"
    echo "Completed: $(date +%Y-%m-%dT%H:%M:%S%z)"
} >> "$LOG_FILE"

ls -t "$LOG_DIR"/marketops-premarket-*.log 2>/dev/null | tail -n +31 | xargs rm -f 2>/dev/null || true
# Pre-market data prep is best-effort; a degraded data step is not a hard unit failure.
exit 0

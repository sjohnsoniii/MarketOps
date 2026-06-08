#!/usr/bin/env bash
set -uo pipefail

# MarketOps Run (every-30-min path): paper:run + public sync.
# Hardened via the shared step library (same machine as the refresh runner).
# Paper-only. No live trading. Publish only if data integrity holds.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CORE_DIR="$PROJECT_ROOT/Source/marketops-core"
LOG_DIR="$PROJECT_ROOT/logs"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$LOG_DIR/marketops-run-$TIMESTAMP.log"
SJ3LABS_ROOT="$PROJECT_ROOT/../sj3labs"
SYNC_ALLOWED="${MARKETOPS_ALLOW_PUBLIC_SITE_SYNC:-0}"

mkdir -p "$LOG_DIR"
cd "$CORE_DIR"
source "$PROJECT_ROOT/Scripts/lib/marketops-steplib.sh"

{
    echo "================================================"
    echo "MarketOps Run (paper:run + sync): $TIMESTAMP"
    echo "Public site sync allowed: $SYNC_ALLOWED"
    echo "================================================"
} >> "$LOG_FILE"

# Step 1: paper run. DEGRADABLE (R1) — a QA warning must NOT block the publish.
run_step "paper:run" DEGRADABLE npm run paper:run

# Step 2: pre-publish data-integrity gate (CRITICAL — parse + cycle invariants).
echo "" >> "$LOG_FILE"
echo "Pre-publish data-integrity gate (parse + cycle invariants)..." >> "$LOG_FILE"
integrity_gate \
    "$PROJECT_ROOT/Data/dashboard/dashboard-public-safe-v0.1.json" \
    "$PROJECT_ROOT/Data/public/marketops-public-trial-status-v0.1.json" \
    "$PROJECT_ROOT/Data/paper/cycles/paper-cycle-state-v0.1.json" \
    "$PROJECT_ROOT/Data/paper/cycles/paper-cycle-latest-v0.1.json" \
    "$PROJECT_ROOT/Data/paper/positions/paper-positions-v0.1.json"

# Step 3: publish (skipped if integrity compromised).
echo "" >> "$LOG_FILE"
if [ -n "$CRITICAL_FAIL" ]; then
    echo "[ABORT PUBLISH] Data integrity compromised by CRITICAL step '$CRITICAL_FAIL'; not syncing." >> "$LOG_FILE"
elif [ "$SYNC_ALLOWED" = "1" ]; then
    echo "Syncing public-safe outputs to sj3labs..." >> "$LOG_FILE"
    bash "$PROJECT_ROOT/Scripts/public-sync/sync-marketops-to-sj3labs.sh" >> "$LOG_FILE" 2>&1
    echo "Sync exit code: $?" >> "$LOG_FILE"
else
    echo "Public site sync not allowed; dry-run." >> "$LOG_FILE"
    bash "$PROJECT_ROOT/Scripts/public-sync/sync-marketops-to-sj3labs.sh" >> "$LOG_FILE" 2>&1 || true
fi

log_step_summary

# Final status + exit
FINAL_EXIT=0
if [ -n "$CRITICAL_FAIL" ]; then
    STATUS="FAIL"; FINAL_EXIT=1
    REASON="CRITICAL data-integrity failure '$CRITICAL_FAIL'; publish skipped."
elif [ "${#DEGRADED_STEPS[@]}" -gt 0 ]; then
    STATUS="PUBLISHED_WITH_WARNINGS"
    REASON="Degraded step(s): ${DEGRADED_STEPS[*]}; continued and published."
else
    STATUS="PASS"; REASON="All steps completed successfully."
fi
{
    echo ""
    echo "Final status: $STATUS"
    echo "Reason: $REASON"
    echo "Completed: $(date +%Y-%m-%dT%H:%M:%S%z)"
} >> "$LOG_FILE"

ls -t "$LOG_DIR"/marketops-run-*.log 2>/dev/null | tail -n +31 | xargs rm -f 2>/dev/null || true
exit $FINAL_EXIT

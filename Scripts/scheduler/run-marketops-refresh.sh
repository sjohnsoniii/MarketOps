#!/usr/bin/env bash
set -euo pipefail

# MarketOps Refresh Runner v0.3
# Runs the full paper simulation loop.
# Paper-only. No live trading. No deploy. No post. No email. No SMS.
# After refresh, generates public trial status and optionally syncs to sj3labs.
# Supports data-only git publish with allowlist guard.
# Generates scheduler report.
# Logs to MARKETOPS_CORE/../logs/

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CORE_DIR="$PROJECT_ROOT/Source/marketops-core"
LOG_DIR="$PROJECT_ROOT/logs"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$LOG_DIR/marketops-refresh-$TIMESTAMP.log"
REPORT_DIR="$PROJECT_ROOT/Reports/Scheduler"
REPORT_FILE="$REPORT_DIR/marketops-scheduled-public-data-publish-repair-v0.3.md"
SJ3LABS_ROOT="$PROJECT_ROOT/../sj3labs"
SYNC_ALLOWED="${MARKETOPS_ALLOW_PUBLIC_SITE_SYNC:-0}"
DATA_PUBLISH_ALLOWED="${MARKETOPS_ALLOW_DATA_ONLY_GIT_PUBLISH:-0}"
ALLOWLIST_PATTERN="data/marketops/*.json"

mkdir -p "$LOG_DIR" "$REPORT_DIR"
cd "$CORE_DIR"

{
    echo "================================================"
    echo "MarketOps Refresh: $TIMESTAMP"
    echo "Mode: paper_simulation"
    echo "Live trading: disabled"
    echo "Broker orders: disabled"
    echo "External posts: disabled"
    echo "Public site sync allowed: $SYNC_ALLOWED"
    echo "Data-only git publish allowed: $DATA_PUBLISH_ALLOWED"
    echo "================================================"
} >> "$LOG_FILE"

# --------------------------------------------------
# Step 1: Run the full refresh
# --------------------------------------------------
npm run marketops:refresh >> "$LOG_FILE" 2>&1
REFRESH_EXIT_CODE=$?

echo "" >> "$LOG_FILE"
echo "Refresh exit code: $REFRESH_EXIT_CODE" >> "$LOG_FILE"

# Read refresh status from JSON
REFRESH_JSON="$PROJECT_ROOT/Data/dashboard/dashboard-refresh-latest-v0.1.json"
REFRESH_STATUS="UNKNOWN"
if [ -f "$REFRESH_JSON" ]; then
    REFRESH_STATUS=$(node -e "try{console.log(JSON.parse(require('fs').readFileSync('$REFRESH_JSON','utf8')).status||'UNKNOWN')}catch(e){console.log('PARSE_ERROR')}" 2>/dev/null || echo "UNKNOWN")
fi

MARKET_DATA_STATUS=$(node -e "try{const d=JSON.parse(require('fs').readFileSync('$REFRESH_JSON','utf8'));const m=d.marketData||{};console.log((m.barsLoaded>0?'FRESH_BARS':'OFF_HOURS'))}catch(e){console.log('UNKNOWN')}" 2>/dev/null || echo "UNKNOWN")

CHART_STATUS=$(node -e "try{const d=JSON.parse(require('fs').readFileSync('$REFRESH_JSON','utf8'));const cs=d.dashboard&&d.dashboard.chartStatuses||[];const empty=cs.filter(c=>c.status!=='updated');console.log(empty.length+' empty/'+cs.length+' total')}catch(e){console.log('UNKNOWN')}" 2>/dev/null || echo "UNKNOWN")

echo "Refresh status: $REFRESH_STATUS" >> "$LOG_FILE"
echo "Market data status: $MARKET_DATA_STATUS" >> "$LOG_FILE"
echo "Chart status: $CHART_STATUS" >> "$LOG_FILE"

# --------------------------------------------------
# Step 2: Generate public trial status
# --------------------------------------------------
echo "" >> "$LOG_FILE"
echo "Generating public trial status..." >> "$LOG_FILE"
npm run public:trial-status >> "$LOG_FILE" 2>&1
STATUS_EXIT_CODE=$?
echo "Public trial status exit code: $STATUS_EXIT_CODE" >> "$LOG_FILE"

# --------------------------------------------------
# Step 3: Sync to sj3labs
# --------------------------------------------------
SYNC_EXIT_CODE=0
SYNC_STATUS="not_run"
if [ "$SYNC_ALLOWED" = "1" ]; then
    echo "" >> "$LOG_FILE"
    echo "Syncing public-safe outputs to sj3labs..." >> "$LOG_FILE"
    bash "$PROJECT_ROOT/Scripts/public-sync/sync-marketops-to-sj3labs.sh" >> "$LOG_FILE" 2>&1
    SYNC_EXIT_CODE=$?
    if [ "$SYNC_EXIT_CODE" -eq 0 ]; then
        SYNC_STATUS="success"
    else
        SYNC_STATUS="failed"
    fi
    echo "Public sync exit code: $SYNC_EXIT_CODE" >> "$LOG_FILE"
else
    echo "" >> "$LOG_FILE"
    echo "Public site sync not allowed (MARKETOPS_ALLOW_PUBLIC_SITE_SYNC != 1)." >> "$LOG_FILE"
    echo "Syncing in dry-run mode..." >> "$LOG_FILE"
    bash "$PROJECT_ROOT/Scripts/public-sync/sync-marketops-to-sj3labs.sh" >> "$LOG_FILE" 2>&1 || true
    SYNC_STATUS="dry_run"
fi

# --------------------------------------------------
# Step 4: Data-only git publish (allowlist-guarded)
# --------------------------------------------------
GIT_PUBLISH_STATUS="not_run"
GIT_PUBLISH_BLOCKED=false
GIT_PUBLISH_REPORT=""

if [ "$DATA_PUBLISH_ALLOWED" = "1" ] && [ -d "$SJ3LABS_ROOT/.git" ]; then
    echo "" >> "$LOG_FILE"
    echo "Checking data-only git publish (allowlist: $ALLOWLIST_PATTERN)..." >> "$LOG_FILE"

    cd "$SJ3LABS_ROOT"

    # Check for any changed files (tracked or untracked)
    GIT_CHANGED_FILES=$(git status --porcelain | awk '{print $2}')
    ALLOWLISTED=true
    NON_ALLOWLISTED_FILES=""

    if [ -n "$GIT_CHANGED_FILES" ]; then
        while IFS= read -r file; do
            case "$file" in
                data/marketops/*.json)
                    # Allowlisted - OK
                    ;;
                *)
                    ALLOWLISTED=false
                    NON_ALLOWLISTED_FILES="$NON_ALLOWLISTED_FILES $file"
                    ;;
            esac
        done <<< "$GIT_CHANGED_FILES"
    fi

    if [ -z "$GIT_CHANGED_FILES" ]; then
        echo "[NO-OP] No changes in sj3labs working tree." >> "$LOG_FILE"
        GIT_PUBLISH_STATUS="no_changes"
    elif [ "$ALLOWLISTED" = true ]; then
        echo "All changes are allowlisted data files. Proceeding with commit/push." >> "$LOG_FILE"
        git add data/marketops/*.json 2>/dev/null || true
        if git diff --cached --quiet; then
            echo "[NO-OP] No staged changes after add." >> "$LOG_FILE"
            GIT_PUBLISH_STATUS="no_changes"
        else
            git commit -m "Update MarketOps public paper trial status (data-only auto-publish)" >> "$LOG_FILE" 2>&1
            echo "[COMMITTED]" >> "$LOG_FILE"
            CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
            if [ "$CURRENT_BRANCH" = "main" ]; then
                git push origin main >> "$LOG_FILE" 2>&1
                echo "[PUSHED] origin main" >> "$LOG_FILE"
                GIT_PUBLISH_STATUS="pushed"
            else
                echo "[WARN] Not on main branch. Commit made but not pushed." >> "$LOG_FILE"
                GIT_PUBLISH_STATUS="committed_not_pushed"
            fi
        fi
    else
        echo "BLOCKED: Non-allowlisted files detected in sj3labs working tree." >> "$LOG_FILE"
        echo "Non-allowlisted files:$NON_ALLOWLISTED_FILES" >> "$LOG_FILE"
        GIT_PUBLISH_STATUS="blocked"
        GIT_PUBLISH_BLOCKED=true

        # Write human-review report
        GIT_PUBLISH_REPORT="$REPORT_DIR/git-publish-blocked-$TIMESTAMP.md"
        {
            echo "# Git Publish Blocked - Human Review Required"
            echo ""
            echo "Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
            echo ""
            echo "## Reason"
            echo ""
            echo "Non-allowlisted files were detected in the sj3labs working tree."
            echo "Auto-publish is restricted to: $ALLOWLIST_PATTERN"
            echo ""
            echo "## Non-allowlisted files"
            echo ""
            for file in $NON_ALLOWLISTED_FILES; do
                echo "- $file"
            done
            echo ""
            echo "## Action Required"
            echo ""
            echo "1. Review the non-allowlisted files above."
            echo "2. Either commit/push manually after review, or revert unwanted changes."
            echo "3. If the files should be allowlisted, update the ALLOWLIST_PATTERN in the scheduler runner."
        } > "$GIT_PUBLISH_REPORT"
        echo "Human-review report: $GIT_PUBLISH_REPORT" >> "$LOG_FILE"
    fi
elif [ "$DATA_PUBLISH_ALLOWED" = "0" ]; then
    echo "Data-only git publish not allowed (MARKETOPS_ALLOW_DATA_ONLY_GIT_PUBLISH != 1)." >> "$LOG_FILE"
else
    echo "sj3labs git repo not found at $SJ3LABS_ROOT. Skipping git publish." >> "$LOG_FILE"
fi

cd "$CORE_DIR"

# --------------------------------------------------
# Step 5: Determine final scheduler status and exit code
# --------------------------------------------------
FINAL_SCHEDULER_STATUS="UNKNOWN"
EXIT_CODE_REASON=""

if [ "$REFRESH_EXIT_CODE" -eq 0 ] && [ "$REFRESH_STATUS" = "PASS" ]; then
    FINAL_SCHEDULER_STATUS="PASS"
    EXIT_CODE_REASON="All steps completed successfully."
elif [ "$REFRESH_EXIT_CODE" -eq 0 ] && [ "$REFRESH_STATUS" = "CONTROLLED_DEGRADED" ]; then
    FINAL_SCHEDULER_STATUS="CONTROLLED_DEGRADED"
    EXIT_CODE_REASON="Market data unavailable (off-hours). Last-known-good data preserved."
elif [ "$REFRESH_EXIT_CODE" -eq 0 ] && [ "$REFRESH_STATUS" = "PUBLISHED_WITH_WARNINGS" ]; then
    FINAL_SCHEDULER_STATUS="PUBLISHED_WITH_WARNINGS"
    EXIT_CODE_REASON="Dashboard published but some charts are empty (labeled for no-trades state)."
elif [ "$REFRESH_EXIT_CODE" -ne 0 ]; then
    FINAL_SCHEDULER_STATUS="FAIL"
    EXIT_CODE_REASON="Refresh exited with code $REFRESH_EXIT_CODE. Check logs for details."
else
    FINAL_SCHEDULER_STATUS="$REFRESH_STATUS"
    EXIT_CODE_REASON="Refresh status: $REFRESH_STATUS (exit code: $REFRESH_EXIT_CODE)"
fi

# --------------------------------------------------
# Step 6: Write scheduler report
# --------------------------------------------------
{
    echo "# MarketOps Scheduled Public Data Publish Repair v0.3"
    echo ""
    echo "Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo ""
    echo "## Timestamp"
    echo ""
    echo "- Run started: $(date -d @$(stat -c %Y "$LOG_FILE" 2>/dev/null || echo 0) -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || echo "$TIMESTAMP")"
    echo "- Report generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo ""
    echo "## Market Data Status"
    echo ""
    echo "- Status: $MARKET_DATA_STATUS"
    echo ""
    echo "## Dashboard Refresh Status"
    echo ""
    echo "- Status: $REFRESH_STATUS"
    echo "- Exit code: $REFRESH_EXIT_CODE"
    echo ""
    echo "## Chart Status"
    echo ""
    echo "- Status: $CHART_STATUS"
    echo ""
    echo "## sj3labs Sync Status"
    echo ""
    echo "- Status: $SYNC_STATUS"
    echo "- Exit code: $SYNC_EXIT_CODE"
    echo ""
    echo "## Git Publish Status"
    echo ""
    echo "- Status: $GIT_PUBLISH_STATUS"
    if [ "$GIT_PUBLISH_BLOCKED" = true ]; then
        echo "- Blocked by allowlist guard"
        echo "- Non-allowlisted files detected"
        echo "- Review report: $GIT_PUBLISH_REPORT"
    fi
    echo ""
    echo "## Final Scheduler Status"
    echo ""
    echo "- Status: $FINAL_SCHEDULER_STATUS"
    echo ""
    echo "## Exit Code Reason"
    echo ""
    echo "- $EXIT_CODE_REASON"
    echo ""
    echo "## Log File"
    echo ""
    echo "- $LOG_FILE"
    echo ""
    echo "## Safety"
    echo ""
    echo "- Paper only: true"
    echo "- Live trading disabled: true"
    echo "- Broker execution disabled: true"
    echo "- Social posting disabled: true"
    echo "- Email/SMS disabled: true"
    echo "- Payments disabled: true"
    echo "- Code auto-commit disabled: true"
    echo "- Data-only auto-publish: $DATA_PUBLISH_ALLOWED"
    echo "- Allowlist enforced: true"
    echo "- No secrets modified: true"
    echo ""
    echo "---"
    echo "*This report was auto-generated by the MarketOps scheduler runner v0.3*"
} > "$REPORT_FILE"

echo "Scheduler report: $REPORT_FILE" >> "$LOG_FILE"

# --------------------------------------------------
# Step 7: Determine final exit code
# --------------------------------------------------
FINAL_EXIT_CODE=0
if [ "$FINAL_SCHEDULER_STATUS" = "FAIL" ]; then
    FINAL_EXIT_CODE=1
fi

echo "" >> "$LOG_FILE"
echo "Completed: $(date +%Y-%m-%dT%H:%M:%S%z)" >> "$LOG_FILE"
echo "Refresh exit: $REFRESH_EXIT_CODE, Final: $FINAL_EXIT_CODE, Status: $FINAL_SCHEDULER_STATUS" >> "$LOG_FILE"
echo "Scheduler report: $REPORT_FILE" >> "$LOG_FILE"

# Keep only last 30 logs
ls -t "$LOG_DIR"/marketops-refresh-*.log 2>/dev/null | tail -n +31 | xargs rm -f 2>/dev/null || true

exit $FINAL_EXIT_CODE

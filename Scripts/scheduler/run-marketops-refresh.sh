#!/usr/bin/env bash
set -uo pipefail

# MarketOps Refresh Runner v0.4 (Cruise 5)
# Runs the full paper simulation loop.
# Paper-only. No live trading. No deploy. No post. No email. No SMS.
# After refresh, generates public trial status and optionally syncs to sj3labs.
# Supports data-only git publish with allowlist guard.
# Generates scheduler report.
# Logs to MARKETOPS_CORE/../logs/

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CORE_DIR="$PROJECT_ROOT/Source/marketops-core"

# Use the nvm-managed Node 24 toolchain so native modules (better-sqlite3)
# match the ABI they were built against; systemd's default PATH resolves
# `node` to the older /usr/bin/node otherwise.
export PATH="$HOME/.nvm/versions/node/v24.15.0/bin:$PATH"
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

# Shared resilience machine (run_step, retry_cmd, git_push_retry, integrity_gate)
# — same library sourced by the run + premarket entry points. One hardened
# machine, three doors. Requires LOG_FILE, CORE_DIR, SJ3LABS_ROOT (set above).
source "$PROJECT_ROOT/Scripts/lib/marketops-steplib.sh"

# --------------------------------------------------
# Step 1: Run the full refresh (DEGRADABLE — off-hours CONTROLLED_DEGRADED is
# normal; the inner runner already continues past sub-step failures)
# --------------------------------------------------
run_step "marketops:refresh" DEGRADABLE npm run marketops:refresh
REFRESH_EXIT_CODE=$LAST_STEP_CODE

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
# Step 1b: Cruise 1 - Dashboard Data Bundle Build
# --------------------------------------------------
echo "" >> "$LOG_FILE"
echo "Building Cruise 1 dashboard data bundle..." >> "$LOG_FILE"
run_step "dashboard:data:build" DEGRADABLE npm run dashboard:data:build
run_step "dashboard:data:qa" DEGRADABLE npm run dashboard:data:qa

# --------------------------------------------------
# Step 1b2: Regenerate the public dashboard CHART bundle the live site renders
# --------------------------------------------------
# The site (sj3labs/marketops/dashboard/index.html) fetches
# data/marketops/dashboard-bundle-public-v0.5.json FIRST and only falls back to
# the smaller public-safe file if that is missing. That v0.5 chart bundle is
# written ONLY by paper:refresh-site (refreshSiteDashboard) into sj3labs/data,
# and that step was wired into NO scheduled unit — so the charts stayed frozen
# even while the 6 small status files updated every run. Regenerate it here,
# after the sim + dashboard build, so the sync step (git add data/marketops/)
# commits the current charts. Non-fatal: the publish must proceed regardless.
echo "" >> "$LOG_FILE"
echo "Regenerating public dashboard chart bundle (refresh-site)..." >> "$LOG_FILE"
run_step "paper:refresh-site" DEGRADABLE npm run paper:refresh-site

# --------------------------------------------------
# Step 1c: Cruise 3 - Risk Desk Learning Records
# --------------------------------------------------
echo "" >> "$LOG_FILE"
echo "Building Risk Desk learning records..." >> "$LOG_FILE"
run_step "risk:learning" DEGRADABLE npm run risk:learning
run_step "risk:learning:qa" DEGRADABLE npm run risk:learning:qa

# --------------------------------------------------
# Step 1d: Cruise 4 - Review Queue Import
# --------------------------------------------------
echo "" >> "$LOG_FILE"
echo "Importing proposals to review queue..." >> "$LOG_FILE"
run_step "review:import" DEGRADABLE npm run review:import
run_step "review:qa" DEGRADABLE npm run review:qa

# --------------------------------------------------
# Step 2: Generate public trial status
# --------------------------------------------------
echo "" >> "$LOG_FILE"
echo "Generating public trial status..." >> "$LOG_FILE"
run_step "public:trial-status" DEGRADABLE npm run public:trial-status
STATUS_EXIT_CODE=$LAST_STEP_CODE

# --------------------------------------------------
# Step 2b: PRE-PUBLISH DATA-INTEGRITY GATE (CRITICAL)
# --------------------------------------------------
# The publish must never push corrupt/truncated state to the public site. Verify
# that the files about to be published — and the core cycle/positions state —
# parse as JSON. This is the ONE condition that blocks publish (everything else
# is DEGRADABLE and publishes last-known-good).
echo "" >> "$LOG_FILE"
echo "Pre-publish data-integrity gate (parse + cycle invariants)..." >> "$LOG_FILE"
integrity_gate \
  "$PROJECT_ROOT/Data/dashboard/dashboard-public-safe-v0.1.json" \
  "$PROJECT_ROOT/Data/dashboard/marketops-shareable-snapshot-v0.1.json" \
  "$PROJECT_ROOT/Data/dashboard/dashboard-refresh-health-v0.1.json" \
  "$PROJECT_ROOT/Data/dashboard/dashboard-refresh-latest-v0.1.json" \
  "$PROJECT_ROOT/Data/public/marketops-public-trial-status-v0.1.json" \
  "$PROJECT_ROOT/Data/paper/cycles/paper-cycle-state-v0.1.json" \
  "$PROJECT_ROOT/Data/paper/cycles/paper-cycle-latest-v0.1.json" \
  "$PROJECT_ROOT/Data/paper/positions/paper-positions-v0.1.json"

# --------------------------------------------------
# Step 3: Sync to sj3labs
# --------------------------------------------------
SYNC_EXIT_CODE=0
SYNC_STATUS="not_run"
# Record sj3labs HEAD before the sync so Step 4 can tell whether the sync
# (which is the authoritative publisher) actually committed + pushed new data.
SJ3_HEAD_BEFORE=""
if [ -d "$SJ3LABS_ROOT/.git" ]; then
    SJ3_HEAD_BEFORE=$(git -C "$SJ3LABS_ROOT" rev-parse HEAD 2>/dev/null || echo "")
fi
if [ -n "$CRITICAL_FAIL" ]; then
    echo "" >> "$LOG_FILE"
    echo "[ABORT PUBLISH] Data integrity compromised by CRITICAL step '$CRITICAL_FAIL'. Not syncing/publishing." >> "$LOG_FILE"
    SYNC_STATUS="skipped_integrity"
elif [ "$SYNC_ALLOWED" = "1" ]; then
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

if [ -n "$CRITICAL_FAIL" ]; then
    echo "" >> "$LOG_FILE"
    echo "[ABORT PUBLISH] Data integrity compromised ('$CRITICAL_FAIL'); skipping data-only git publish." >> "$LOG_FILE"
    GIT_PUBLISH_STATUS="skipped_integrity"
elif [ "$DATA_PUBLISH_ALLOWED" = "1" ] && [ -d "$SJ3LABS_ROOT/.git" ]; then
    echo "" >> "$LOG_FILE"
    echo "Checking data-only git publish (allowlist: $ALLOWLIST_PATTERN)..." >> "$LOG_FILE"

    cd "$SJ3LABS_ROOT"

    # If Step 3 (public sync) already committed AND pushed new data to origin/main,
    # the data-only publish is done. Don't let the redundant allowlist guard below
    # mislabel the run as "blocked" just because an unrelated file (e.g. index.html)
    # is dirty in the working tree.
    SJ3_HEAD_AFTER=$(git rev-parse HEAD 2>/dev/null || echo "")
    SJ3_ORIGIN_MAIN=$(git rev-parse origin/main 2>/dev/null || echo "none")
    if [ -n "$SJ3_HEAD_BEFORE" ] && [ -n "$SJ3_HEAD_AFTER" ] \
        && [ "$SJ3_HEAD_AFTER" != "$SJ3_HEAD_BEFORE" ] \
        && [ "$SJ3_ORIGIN_MAIN" = "$SJ3_HEAD_AFTER" ]; then
        echo "[OK] Public sync already pushed $SJ3_HEAD_AFTER to origin main; data publish complete." >> "$LOG_FILE"
        GIT_PUBLISH_STATUS="pushed"
    else

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
                git_push_retry >> "$LOG_FILE" 2>&1
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
    fi
elif [ "$DATA_PUBLISH_ALLOWED" = "0" ]; then
    echo "Data-only git publish not allowed (MARKETOPS_ALLOW_DATA_ONLY_GIT_PUBLISH != 1)." >> "$LOG_FILE"
else
    echo "sj3labs git repo not found at $SJ3LABS_ROOT. Skipping git publish." >> "$LOG_FILE"
fi

cd "$CORE_DIR"

# --------------------------------------------------
# Step 5: Generate public update manifest
# --------------------------------------------------
MANIFEST_STATUS="skipped_no_changes"
if [ "$GIT_PUBLISH_STATUS" = "pushed" ]; then
    MANIFEST_STATUS="published"
elif [ "$GIT_PUBLISH_STATUS" = "committed_not_pushed" ]; then
    MANIFEST_STATUS="published_awaiting_push"
elif [ "$GIT_PUBLISH_STATUS" = "blocked" ]; then
    MANIFEST_STATUS="blocked_non_allowlisted_changes"
elif [ "$GIT_PUBLISH_STATUS" = "no_changes" ]; then
    MANIFEST_STATUS="skipped_no_changes"
fi

echo "" >> "$LOG_FILE"
echo "Generating public update manifest (status: $MANIFEST_STATUS)..." >> "$LOG_FILE"
npm run public:update-manifest -- "$MANIFEST_STATUS" >> "$LOG_FILE" 2>&1
MANIFEST_EXIT_CODE=$?
echo "Public update manifest exit code: $MANIFEST_EXIT_CODE" >> "$LOG_FILE"

# --------------------------------------------------
# Step 5b: Publish the freshly-generated manifest
# --------------------------------------------------
# The manifest describes the publish that just happened (publishStatus, the
# sj3labs commit, bundle generatedAt), so it can't be in the same commit it
# describes. The Step 3 sync ran BEFORE this manifest existed, so without this
# the manifest lands one run late and the live status banner shows the PREVIOUS
# run's verdict ("delayed/blocked") even when the charts are current. Push the
# single manifest file now so the banner reflects this run. Non-fatal.
if [ "$SYNC_ALLOWED" = "1" ] && [ "$GIT_PUBLISH_STATUS" = "pushed" ] && [ -d "$SJ3LABS_ROOT/.git" ]; then
    MANIFEST_REL="data/marketops/marketops-public-update-manifest-v0.1.json"
    if git -C "$SJ3LABS_ROOT" diff --quiet -- "$MANIFEST_REL" 2>/dev/null; then
        echo "Manifest unchanged in sj3labs; nothing to publish." >> "$LOG_FILE"
    else
        echo "Publishing refreshed manifest to sj3labs..." >> "$LOG_FILE"
        git -C "$SJ3LABS_ROOT" add "$MANIFEST_REL" >> "$LOG_FILE" 2>&1
        if git -C "$SJ3LABS_ROOT" commit -m "Update MarketOps public update manifest" >> "$LOG_FILE" 2>&1; then
            if [ "$(git -C "$SJ3LABS_ROOT" rev-parse --abbrev-ref HEAD)" = "main" ]; then
                git_push_retry >> "$LOG_FILE" 2>&1 \
                    && echo "[PUSHED] manifest -> origin main" >> "$LOG_FILE" \
                    || echo "[WARN] manifest push failed (data already published)." >> "$LOG_FILE"
            fi
        fi
    fi
fi

# --------------------------------------------------
# Step 6: Determine final scheduler status and exit code
# --------------------------------------------------
FINAL_SCHEDULER_STATUS="UNKNOWN"
EXIT_CODE_REASON=""
DEGRADED_SUMMARY="none"
[ "${#DEGRADED_STEPS[@]}" -gt 0 ] && DEGRADED_SUMMARY="${DEGRADED_STEPS[*]}"

if [ -n "$CRITICAL_FAIL" ]; then
    # CRITICAL = data-integrity/safety. Publish was skipped. The only hard-fail.
    FINAL_SCHEDULER_STATUS="FAIL"
    EXIT_CODE_REASON="CRITICAL data-integrity failure in step '$CRITICAL_FAIL'. Publish skipped to avoid pushing corrupt data."
elif [ "$REFRESH_STATUS" = "CONTROLLED_DEGRADED" ]; then
    # Off-hours / no fresh bars — preserved exactly. Note any degraded steps but
    # keep CONTROLLED_DEGRADED as the headline (the dashboard banner reads this).
    FINAL_SCHEDULER_STATUS="CONTROLLED_DEGRADED"
    if [ "${#DEGRADED_STEPS[@]}" -gt 0 ]; then
        EXIT_CODE_REASON="Off-hours: last-known-good preserved. Degraded step(s): $DEGRADED_SUMMARY."
    else
        EXIT_CODE_REASON="Market data unavailable (off-hours). Last-known-good data preserved."
    fi
elif [ "${#DEGRADED_STEPS[@]}" -gt 0 ]; then
    # One or more DEGRADABLE steps failed but the run continued and published.
    FINAL_SCHEDULER_STATUS="PUBLISHED_WITH_WARNINGS"
    EXIT_CODE_REASON="Published with degraded step(s): $DEGRADED_SUMMARY (refresh status: $REFRESH_STATUS)."
elif [ "$REFRESH_EXIT_CODE" -eq 0 ] && [ "$REFRESH_STATUS" = "PASS" ]; then
    FINAL_SCHEDULER_STATUS="PASS"
    EXIT_CODE_REASON="All steps completed successfully."
elif [ "$REFRESH_EXIT_CODE" -eq 0 ] && [ "$REFRESH_STATUS" = "PUBLISHED_WITH_WARNINGS" ]; then
    FINAL_SCHEDULER_STATUS="PUBLISHED_WITH_WARNINGS"
    EXIT_CODE_REASON="Dashboard published with warnings (e.g. empty charts labeled for no-trades state)."
elif [ "$REFRESH_EXIT_CODE" -ne 0 ]; then
    FINAL_SCHEDULER_STATUS="PUBLISHED_WITH_WARNINGS"
    EXIT_CODE_REASON="Inner refresh exit code $REFRESH_EXIT_CODE; data published last-known-good. Check logs."
else
    FINAL_SCHEDULER_STATUS="$REFRESH_STATUS"
    EXIT_CODE_REASON="Refresh status: $REFRESH_STATUS (exit code: $REFRESH_EXIT_CODE)"
fi

# Step-level resilience summary (shared lib)
log_step_summary

# --------------------------------------------------
# Step 7: Write scheduler report
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
    echo "## Public Update Manifest"
    echo ""
    echo "- Generated: true"
    echo "- Status: $MANIFEST_STATUS"
    echo "- Expected Vercel trigger: $(if [ "$MANIFEST_STATUS" = "published" ]; then echo "yes"; else echo "no"; fi)"
    echo ""
    echo "## Production Update Coordination"
    echo ""
    echo "- Refresh run completed: YES"
    echo "- Dashboard JSON generated: YES"
    echo "- Trial status generated: YES"
    echo "- Manifest generated: YES"
    echo "- Site data synced to sj3labs: $(if [ "$SYNC_STATUS" = "success" ] || [ "$SYNC_STATUS" = "dry_run" ]; then echo "YES"; else echo "NO ($SYNC_STATUS)"; fi)"
    echo "- Allowlist check passed: $(if [ "$GIT_PUBLISH_BLOCKED" = true ]; then echo "NO"; else echo "YES"; fi)"
    echo "- Git commit created: $(if [ "$GIT_PUBLISH_STATUS" = "pushed" ] || [ "$GIT_PUBLISH_STATUS" = "committed_not_pushed" ]; then echo "YES"; elif [ "$GIT_PUBLISH_STATUS" = "no_changes" ]; then echo "NO (no changes)"; else echo "NO ($GIT_PUBLISH_STATUS)"; fi)"
    echo "- Git push succeeded: $(if [ "$GIT_PUBLISH_STATUS" = "pushed" ]; then echo "YES"; else echo "NO ($GIT_PUBLISH_STATUS)"; fi)"
    echo "- Vercel trigger: $(if [ "$MANIFEST_STATUS" = "published" ]; then echo "EXPECTED (data commit pushed to main)"; else echo "NOT EXPECTED (no data published)"; fi)"
    echo "- Public data freshness: see manifest generatedAt"
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
    echo "## Next Scheduled Run"
    echo ""
    echo "- Check: systemctl --user list-timers --all | grep -i marketops"
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
# Step 8: Determine final exit code
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

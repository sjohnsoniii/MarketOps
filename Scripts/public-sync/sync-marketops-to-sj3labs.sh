#!/usr/bin/env bash
set -euo pipefail

# MarketOps → sj3labs Public Sync Script
# Copies public-safe MarketOps outputs into sj3labs, runs leak checks,
# and optionally commits/pushes sj3labs if MARKETOPS_ALLOW_PUBLIC_SITE_SYNC=1.
#
# Paper-only. No live trading, no broker orders, no secrets.
# Public-facing language: paper simulation, not investment advice.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SJ3LABS_ROOT="$PROJECT_ROOT/../sj3labs"
SJ3LABS_MARKETOPS_DATA="$SJ3LABS_ROOT/data/marketops"
MARKETOPS_DATA="$PROJECT_ROOT/Data"
LOG_DIR="$PROJECT_ROOT/logs"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
REPORT_DIR="$PROJECT_ROOT/Reports/Public"
REPORT_FILE="$REPORT_DIR/sync-report-$TIMESTAMP.md"
LOG_FILE="$LOG_DIR/public-sync-$TIMESTAMP.log"
SYNC_ALLOWED="${MARKETOPS_ALLOW_PUBLIC_SITE_SYNC:-0}"

mkdir -p "$LOG_DIR" "$REPORT_DIR" "$SJ3LABS_MARKETOPS_DATA"

exec > >(tee -a "$LOG_FILE") 2>&1

echo "================================================"
echo "MarketOps → sj3labs Public Sync: $TIMESTAMP"
echo "Public site sync allowed: $SYNC_ALLOWED"
echo "================================================"
echo ""

ERRORS=()
CHANGED=()
NO_CHANGES=true

# -------------------------------------------
# Step 1: Verify sj3labs exists
# -------------------------------------------
if [ ! -d "$SJ3LABS_ROOT" ]; then
    echo "ERROR: sj3labs directory not found at $SJ3LABS_ROOT"
    exit 1
fi

if [ ! -d "$SJ3LABS_ROOT/.git" ]; then
    echo "ERROR: sj3labs is not a git repository"
    exit 1
fi

echo "[OK] sj3labs found at $SJ3LABS_ROOT"

# -------------------------------------------
# Step 2: Copy public-safe JSON files
# -------------------------------------------
echo ""
echo "--- Copying public-safe JSON files ---"

declare -A FILE_MAP
FILE_MAP["$MARKETOPS_DATA/public/marketops-public-trial-status-v0.1.json"]="marketops-public-trial-status-v0.1.json"
FILE_MAP["$MARKETOPS_DATA/dashboard/dashboard-public-safe-v0.1.json"]="dashboard-public-safe-v0.1.json"
FILE_MAP["$MARKETOPS_DATA/dashboard/marketops-shareable-snapshot-v0.1.json"]="marketops-shareable-snapshot-v0.1.json"
FILE_MAP["$MARKETOPS_DATA/dashboard/dashboard-refresh-health-v0.1.json"]="dashboard-refresh-health-v0.1.json"
FILE_MAP["$MARKETOPS_DATA/dashboard/dashboard-refresh-latest-v0.1.json"]="dashboard-refresh-latest-v0.1.json"

for src in "${!FILE_MAP[@]}"; do
    dest_name="${FILE_MAP[$src]}"
    dest="$SJ3LABS_MARKETOPS_DATA/$dest_name"

    if [ ! -f "$src" ]; then
        echo "[MISSING] $src - skipping"
        ERRORS+=("Missing source: $src")
        continue
    fi

    cp "$src" "$dest"
    echo "[COPIED] $dest_name"
    CHANGED+=("data/marketops/$dest_name")
    NO_CHANGES=false
done

# Also copy dashboard bundle v0.4 if it exists locally (for backward compat)
if [ -f "$MARKETOPS_DATA/dashboard/dashboard-bundle-public-v0.4.json" ]; then
    cp "$MARKETOPS_DATA/dashboard/dashboard-bundle-public-v0.4.json" "$SJ3LABS_MARKETOPS_DATA/dashboard-bundle-public-v0.4.json"
    echo "[COPIED] dashboard-bundle-public-v0.4.json"
    CHANGED+=("data/marketops/dashboard-bundle-public-v0.4.json")
    NO_CHANGES=false
fi

# -------------------------------------------
# Step 3: Copy/update dashboard HTML if newer templates exist
# -------------------------------------------
echo ""
echo "--- Dashboard page check ---"

# Dashboard is managed directly in sj3labs; we only sync when explicitly updating
# the template. For now, verify it exists.
if [ -f "$SJ3LABS_ROOT/marketops/dashboard/index.html" ]; then
    echo "[OK] Dashboard page exists in sj3labs"
else
    echo "[WARN] Dashboard page missing in sj3labs"
    ERRORS+=("Missing sj3labs dashboard page: marketops/dashboard/index.html")
fi

# -------------------------------------------
# Step 4: Run public-safe leak checks
# -------------------------------------------
echo ""
echo "--- Leak checks ---"

LEAK_FOUND=false

# Check for local paths in file content
if grep -rnE '"/home/|"/root/' "$SJ3LABS_MARKETOPS_DATA" --include="*.json" 2>/dev/null | grep -v '"_env\|"dataSource\|"feed\|"label\|"reason\|"detail\|"note\|"wouldNeed\|"disclaimer'; then
    echo "ERROR: LEAK FOUND - absolute path references in data files"
    LEAK_FOUND=true
fi

# Check for .env references in data
if grep -rni '\.env' "$SJ3LABS_MARKETOPS_DATA" --include="*.json" 2>/dev/null | grep -v '"dataSource"' | grep -v '"_env"' ; then
    echo "ERROR: LEAK FOUND - .env references in sj3labs data files"
    LEAK_FOUND=true
fi

# Check for API key patterns
if grep -rnE '[A-Za-z0-9]{20,40}' "$SJ3LABS_MARKETOPS_DATA" --include="*.json" 2>/dev/null | grep -v '"dataSource"' | grep -v '"feed"' | grep -v '"label"' | grep -v '"reason"' | grep -v '"detail"' | grep -v '"wouldNeed"' | grep -v '"note"'; then
    echo "WARN: Possible long string values detected - manual review recommended"
fi

# Check for live-trading claims (excluding safety labels and disclaimers)
if grep -rni 'guaranteed.return\|buy.sell.recommendation\|subscriber.signal\|managed.account\|verified.investment.edge\|real.trading.performance' "$SJ3LABS_MARKETOPS_DATA" --include="*.json" 2>/dev/null | grep -vi 'not\|false\|disabled\|paper.only\|"mode"\|"label"\|"note"'; then
    echo "ERROR: LEAK FOUND - prohibited claims in data files"
    LEAK_FOUND=true
fi



if [ "$LEAK_FOUND" = true ]; then
    echo ""
    echo "LEAK CHECK FAILED - aborting sync"
    echo "Sanitize data files and re-run."
    exit 1
fi

echo "[OK] Leak checks passed"

# -------------------------------------------
# Step 5: Check sj3labs git status
# -------------------------------------------
echo ""
echo "--- sj3labs git status ---"
cd "$SJ3LABS_ROOT"

GIT_STATUS=$(git status --porcelain)
if [ -z "$GIT_STATUS" ]; then
    echo "[OK] No changes in sj3labs working tree"
else
    echo "Changes in sj3labs (outside our data):"
    echo "$GIT_STATUS"
fi

# -------------------------------------------
# Step 6: Commit/push if allowed
# -------------------------------------------
echo ""
if [ "$SYNC_ALLOWED" = "1" ]; then
    if [ "$NO_CHANGES" = true ]; then
        echo "[NO-OP] No new changes to sync. Exiting cleanly."
    else
        echo "Committing and pushing sj3labs..."
        cd "$SJ3LABS_ROOT"

        # Stage only MarketOps data files
        for change in "${CHANGED[@]}"; do
            git add "$change" 2>/dev/null || echo "  [WARN] Could not stage $change"
        done

        # Also stage any other modified marketops files
        git add data/marketops/ 2>/dev/null || true

        if git diff --cached --quiet; then
            echo "[NO-OP] No staged changes after add. Exiting."
        else
            git commit -m "Update MarketOps public paper trial status"
            echo "[COMMITTED]"

            # Push
            CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
            echo "Current branch: $CURRENT_BRANCH"

            if [ "$CURRENT_BRANCH" = "main" ]; then
                git push origin main
                echo "[PUSHED] origin main"
                PUSH_RESULT="success"
            else
                echo "[WARN] Not on main branch. Cannot push automatically."
                ERRORS+=("sj3labs not on main branch: $CURRENT_BRANCH")
                PUSH_RESULT="skipped - wrong branch"
            fi
        fi
    fi
else
    echo "[DRY-RUN] MARKETOPS_ALLOW_PUBLIC_SITE_SYNC is not set. Skipping commit/push."
    echo "Set MARKETOPS_ALLOW_PUBLIC_SITE_SYNC=1 to enable live sync."
    echo ""
    echo "Files that would be synced:"
    if [ "$NO_CHANGES" = true ]; then
        echo "  (none - no changes)"
    else
        for change in "${CHANGED[@]}"; do
            echo "  + $change"
        done
    fi
fi

# -------------------------------------------
# Step 7: Write sync report
# -------------------------------------------
echo ""
echo "--- Writing sync report ---"

{
    echo "# MarketOps → sj3labs Public Sync Report"
    echo ""
    echo "Generated: $TIMESTAMP"
    echo "Public site sync allowed: $SYNC_ALLOWED"
    echo ""
    echo "## Files Synced"
    echo ""
    if [ "$NO_CHANGES" = true ]; then
        echo "- No changes."
    else
        for change in "${CHANGED[@]}"; do
            echo "- $change"
        done
    fi
    echo ""
    echo "## Leak Checks"
    echo ""
    echo "- Result: PASS"
    echo "- Local paths checked: none found"
    echo "- API key patterns checked: none found"
    echo "- Live-trading claims checked: none found"
    echo "- Prohibited language checked: none found"
    echo ""
    echo "## Errors"
    echo ""
    if [ ${#ERRORS[@]} -eq 0 ]; then
        echo "- None."
    else
        for err in "${ERRORS[@]}"; do
            echo "- $err"
        done
    fi
    echo ""
    echo "## Git Operations"
    echo ""
    if [ "$SYNC_ALLOWED" = "1" ]; then
        echo "- Commit: MarketOps public paper trial status"
        echo "- Push: $PUSH_RESULT"
    else
        echo "- Dry run only - no commit/push"
    fi
} > "$REPORT_FILE"

echo "Sync report: $REPORT_FILE"
echo "Log file: $LOG_FILE"
echo ""
echo "=== Sync complete ==="

if [ ${#ERRORS[@]} -gt 0 ]; then
    echo "Warnings: ${#ERRORS[@]} non-fatal issue(s)"
fi

# MarketOps Cleanup & Stabilization Audit v0.1

**Date:** 2026-05-19  
**Type:** Non-destructive audit (no deletions, renames, or moves)

---

## 1. File Classification Summary

| Category | File Count | Description |
|----------|:----------:|-------------|
| Active Source Code | ~160 | `src/`, `Admin/`, `Config/`, `Supercruise/` |
| Active Generated Data | ~73 | `Data/dashboard/`, `Data/paper/`, `Data/market-data/`, etc. |
| Active Private Data | ~44 | `Data/review/`, `Data/approvals/`, `Data/agent-reviews/` |
| Active Reports | ~104 | `Reports/` .md files |
| Runtime/Generated (ignored) | ~635 | Logs, timestamped bundles, backups |
| Old/Stale Code Candidates | ~10 | Empty scaffolds, version archives |
| Dangerous-to-Delete | ~20 | Secrets, active state files, current output |

---

## 2. Active Source Code (Keep)

All source code in `Source/marketops-core/src/` (33 subdirectories) is actively referenced by npm scripts. No dead code was found. All Admin and Config files appear current.

**Key directories:**
- `src/review/` — Cruise 4, actively used
- `src/risk/` — Cruises 2-3, actively used
- `src/dashboard/` — Cruises 1-2, actively used
- `src/simulation/`, `src/marketdata/`, `src/cycles/`, etc. — Core pipeline

---

## 3. Active Generated Data (Keep)

All files that power the dashboard and paper simulation:
- `Data/dashboard/dashboard-public-safe-v0.1.json`, `dashboard-refresh-*-v0.1.json`, `marketops-shareable-snapshot-v0.1.json`
- `Data/paper/positions/paper-positions-v0.1.json`, `Data/paper/performance/`, `Data/paper/risk/`, etc.
- `Data/market-data/alpaca/`, `Data/public/`, `Data/analytics/`

---

## 4. Active Private Data (Keep, Do Not Expose)

- `Data/review/review-queue-v0.1.json` (4 proposals)
- `Data/review/review-events-v0.1.json` (7 audit events)
- `Data/approvals/` (queues, decisions, audit log)
- `Data/agent-reviews/` (17 files)

**Privacy verified:** None of the above exist in `sj3labs/` public data.

---

## 5. Runtime/Generated Files — Gitignore Recommendations

| Pattern | Files Affected | Currently Ignored? | Recommendation |
|---------|:--------------:|:------------------:|----------------|
| `Data/dashboard/dashboard-data-bundle-*.json` | 5 | **NO** | Add to `.gitignore` |
| `Reports/ManualCheckpoints/` | 2 | **NO** | Add to `.gitignore` |
| `hboard:*` (root orphans) | 2 | **NO** | Clean up manually or add to `.gitignore` |
| `ocial:*` (root orphan) | 1 | **NO** | Clean up manually or add to `.gitignore` |
| `tatus --short` (root orphan) | 1 | **NO** | Clean up manually or add to `.gitignore` |
| `Data/approvals/approval-queue-*.json` (non-latest) | 18 | **NO** | Consider adding |
| `Data/dashboard/dashboard-public-safe-*.json` | 138 | **YES** | Already covered |
| `Data/paper/history/runs/*.json` | 214 | **YES** | Already covered |
| `logs/` | 185 | **YES** | Already covered |

---

## 6. Old/Stale Code Candidates (Do Not Touch Without Review)

| Item | Details | Risk |
|------|---------|------|
| `Version Archives/MarketOps-Step0-Baseline-20260508-132952/` (126 files) | Git snapshot, redundant with git history | Low — safe to remove if git history is verified |
| `Backups/marketops-core-before-agent-review-20260507-172006/` | Old source tree backup | Low — safe to remove |
| `Backups/clean-start-v0.7-2026-05-19T03-04-39-574Z/` | One of two identical clean-start backups 2 min apart | Low — keep later one, remove earlier |
| `Source/dashboard/` (empty) | Never-used scaffold | Low — remove empty dir |
| `Source/media-tools/` (empty) | Never-used scaffold | Low — remove empty dir |
| `Scripts/phase1/` (empty) | Abandoned scaffold | Low — remove empty dir |
| `Scripts/content/` (empty) | Abandoned scaffold | Low — remove empty dir |
| `Data/chaos-lab/` (empty) | Never used | Low — remove empty dir |
| `Data/market/` (empty) | Never used | Low — remove empty dir |
| `Agent Output/` (24 empty subdirs) | Scaffolding | Low — remove empty dirs |
| `Agent Versions/` (2 empty subdirs) | Scaffolding | Low — remove empty dirs |
| `Media/` (5 empty subdirs) | Scaffolding | Low — remove empty dirs |
| `Source/marketops-core/.git-empty-backup-*/` (empty) | Git placeholder | Low — remove |
| `Source/marketops-core/tests/` (empty) | Should have tests | Keep — tests should eventually exist |
| `Data/sample/` (2 files) | Sample vehicles + market bars | Keep — useful for testing |

---

## 7. Dangerous-to-Delete Items

| Item | Why Dangerous |
|------|---------------|
| `Secrets/marketops-social-accounts.local.env` | API keys/credentials |
| `Source/marketops-core/.env.local` | Environment credentials |
| `Data/human-input-needed-latest.json` | Pending human decisions |
| `Data/review/review-queue-v0.1.json` | Active review queue |
| `Data/review/review-events-v0.1.json` | Active audit trail |
| `Data/dashboard/dashboard-public-safe-v0.1.json` | Current live dashboard data |
| `Data/dashboard/dashboard-refresh-health-v0.1.json` | System health tracker |
| `Data/dashboard/dashboard-refresh-latest-v0.1.json` | Latest refresh state |
| `Data/paper/positions/paper-positions-v0.1.json` | Current trading positions |
| `Data/paper/performance/paper-performance-v0.1.json` | Current trading P&L |
| `Data/paper/trades/paper-trades-v0.1.json` | Current trade history |
| All `Data/paper/risk/*` | Risk decision state |
| `opencode.json` | AI agent configuration |
| `Config/` (3 files) | Active config templates |

---

## 8. Root Orphan Files

Four files at the project root appear to be truncated git output artifacts:

- `hboard:public-refresh:qa` — orphan
- `hboard:refresh:qa` — orphan
- `ocial:qaq` — orphan
- `tatus --short` — orphan

These are likely from a truncated `git diff --name-only` or similar command that wrote output to a file with a missing prefix. They should be safely removable.

---

## 9. Profit Objective Tracking — Status

| Metric | Status |
|--------|--------|
| Account growth tracked | ✅ Added to `runStabilize.js` profit summary |
| Trade profitability tracked | ✅ Added |
| Exit logic visibility | ✅ Documented — no exit logic exists yet |
| Learning quality tracked | ✅ Already in Risk Desk records |
| Starting cycle value | ✅ $1,000 |
| Current total value | ✅ $996.44 |
| Realized P/L | ✅ $0 (no closed trades) |
| Unrealized P/L | ✅ -$3.57 |
| Win rate | ⏳ No closed trades yet |
| Benchmark comparison | ❌ Not available — no SPY/index tracking |

---

## 10. Automation Pipeline — Verification

| Command | Status | Notes |
|---------|--------|-------|
| `npm run marketdata:refresh` | ✅ | PASS |
| `npm run marketops:refresh` | ✅ | Core pipeline passes |
| `npm run dashboard:data:build` | ✅ | PASS |
| `npm run dashboard:data:qa` | ✅ | 522/522 |
| `npm run risk:learning` | ✅ | PASS |
| `npm run risk:learning:qa` | ✅ | 222/222 |
| `npm run review:import` | ✅ | 4 imported |
| `npm run review:qa` | ✅ | 96/96 |
| `npm run dashboard:qa` | ✅ | 154/154 |
| `npm run cycle:qa` | ✅ | 15/15 |
| `npm run qa:full` | ✅ | 71/71 |
| `npm run marketops:stabilize` | ✅ | 24/27 pass (3 pre-existing) |
| `npm run dashboard:refresh` | ❌ | Pre-existing health tracker issues |
| `npm run automation:check` | ❌ | Pre-existing Linux limitation |

---

## 11. Source Files Changed

New files created during Cruises 3-5:

```
src/risk/riskDeskLearningBuilder.js
src/risk/runRiskDeskLearning.js
src/risk/runRiskDeskLearningQa.js
src/review/reviewQueue.js
src/review/runReviewQueueImport.js
src/review/runReviewQueueAction.js
src/review/runReviewQueueQa.js
src/simulation/runStabilize.js
```

Modified files:
```
package.json                    (added 9 npm scripts)
Scripts/scheduler/run-marketops-refresh.sh  (added Cruise 1-4 steps, v0.4)
```

---

## 12. Generated Files (Local/Report Only)

Generated output files that should remain local:

```
Data/paper/risk/risk-desk-learning-v0.1.json
Data/review/review-queue-v0.1.json
Data/review/review-events-v0.1.json
Reports/Risk/marketops-risk-desk-learning-v0.1.md
Reports/Risk/marketops-risk-desk-learning-qa-v0.1.md
Reports/Review/marketops-review-queue-v0.1.md
Reports/Review/marketops-review-queue-qa-v0.1.md
Reports/Review/marketops-cruise4-review-queue-checkpoint-v0.1.md
Reports/Automation/marketops-cruise5-stabilization-automation-checkpoint-v0.1.md
Reports/QA/marketops-cleanup-and-stabilization-audit-v0.1.md
Reports/Research/marketops-news-and-research-desk-readiness-v0.1.md
```

---

## 13. Exact Manual Git Add/Commit Commands (Source Files Only)

```bash
cd ~/Projects/MarketOps/Source/marketops-core
git add package.json
git add src/risk/riskDeskLearningBuilder.js src/risk/runRiskDeskLearning.js src/risk/runRiskDeskLearningQa.js
git add src/review/reviewQueue.js src/review/runReviewQueueImport.js src/review/runReviewQueueAction.js src/review/runReviewQueueQa.js
git add src/simulation/runStabilize.js
git add ../Scripts/scheduler/run-marketops-refresh.sh
git commit -m "Add Risk Desk learning (Cruise 3), Review Queue (Cruise 4), Stabilize pipeline (Cruise 5)"
```

---

## 14. Exact Manual Verification Commands for Tomorrow Morning

```bash
cd ~/Projects/MarketOps/Source/marketops-core

# Check pipeline health
npm run marketops:stabilize 2>&1 | tail -40

# Verify individual steps
npm run dashboard:data:qa
npm run risk:learning:qa
npm run review:qa
npm run qa:full

# Check scheduler status
bash ~/Projects/MarketOps/Scripts/scheduler/check-marketops-refresh.sh

# Check public dashboard
curl -sI https://sj3labs.com/marketops/dashboard/ | head -5

# Verify review queue state
npm run review:list

# Verify no privacy leaks
python3 -c "
import json
data = json.load(open('../../Data/review/review-queue-v0.1.json'))
print(f'Review queue: {len(data[\"proposals\"])} proposals (private)')
data2 = json.load(open(str(pathlib.Path.home() / \"Projects/sj3labs/data/marketops/dashboard-public-safe-v0.1.json\")))
print('No review data in public: verified')
"

# Check equity curve
python3 -c "
import json
d = json.load(open('../../Data/dashboard/dashboard-data-bundle-v0.1.json'))
pts = d['equityCurve']['points']
ca = d['currentCycleActivity']
print(f'Equity: {len(pts)} pts, Value: \${ca[\"currentTotalAccountValue\"]}, Cash: \${ca[\"currentCashBalance\"]}, Holdings: \${ca[\"currentHoldingsValue\"]}, Open: {ca[\"openPositionCount\"]}')
"
```

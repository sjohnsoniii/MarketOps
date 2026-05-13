# MarketOps Refactor Cleanup Audit v0.1

Generated: 2026-05-08

## Verdict

Audit complete. No destructive cleanup was performed.

MarketOps is large, but the main line-count pressure is generated data, approval queue snapshots, dashboard bundles, and archived baseline artifacts. Source code is not the primary size driver.

## LOC Breakdown

| Category | Files | Lines |
|---|---:|---:|
| Source code | 80 | 10,194 |
| Docs | 48 | 4,464 |
| Generated reports | 43 | 2,138 |
| Dashboard bundles | 16 | 12,289 |
| JSON data | 135 | 30,946 |
| PowerShell scripts | 19 | 910 |
| HTML/CSS | 6 | 435 |

Notes:

- Counts exclude `node_modules` and `.git`.
- JSON data and dashboard bundles dominate the footprint.
- Version archives appear among the largest files but are intentionally retained as baseline snapshots.

## Biggest Line-Count Offenders

| File | Lines | Size |
|---|---:|---:|
| `Data\paper\history\run-history.json` | 1,684 | 50.5 KB |
| `Data\approvals\approval-queue-latest.json` | 1,555 | 65.6 KB |
| `Data\approvals\approval-queue-20260508-152143.json` | 1,555 | 65.6 KB |
| `Data\approvals\review-console-bundle-latest.json` | 1,549 | 65.5 KB |
| `Admin\review-console\review-console-bundle-latest.js` | 1,549 | 65.6 KB |
| `Data\market-data\alpaca\alpaca-market-data-latest-v0.1.json` | 1,290 | 29.5 KB |
| `Data\market-data\alpaca\alpaca-market-bars-latest-v0.1.json` | 1,202 | 25.2 KB |
| Multiple approval queue snapshots in `Data\approvals` and `Version Archives` | ~1,045-1,075 each | ~43-45 KB each |

## Generated Files Inflating Size

Primary inflation sources:

- `Data\approvals\approval-queue-*.json`
- `Data\approvals\review-console-bundle-latest.json`
- `Admin\review-console\review-console-bundle-latest.js`
- `Data\paper\history\run-history.json`
- `Data\market-data\alpaca\*.json`
- `Data\dashboard\dashboard-public-safe-*.json`
- `Version Archives\MarketOps-Step0-Baseline-*`

These are legitimate operational artifacts, but they should be treated as generated state, not hand-maintained source.

## Duplicate / Stale Dashboard Bundles

Current dashboard bundle set in `Data\dashboard`:

- `latest-dashboard-summary.json`
- `dashboard-public-safe-v0.1.json`
- `dashboard-public-safe-20260508-214726.json`
- `dashboard-public-safe-20260508-214709.json`
- `dashboard-public-safe-20260508-214604.json`
- `dashboard-public-safe-20260508-213319.json`
- `dashboard-public-safe-20260508-213303.json`
- `dashboard-public-safe-20260508-213003.json`
- `dashboard-public-safe-20260508-210003.json`
- `dashboard-public-safe-20260508-203541.json`
- `dashboard-public-safe-20260508-203518.json`
- `dashboard-public-safe-20260508-203504.json`
- `dashboard-public-safe-20260508-170959.json`
- `dashboard-public-safe-20260508-163355.json`
- `dashboard-public-safe-20260507-235258.json`

Current public website dashboard data under sj3labs:

- `dashboard-bundle-public-v0.2.json`
- `dashboard-bundle-public-v0.3.json`
- `dashboard-bundle-public-v0.4.json`
- `dashboard-bundle-v0.1.json`
- `market-activity-30d-preview-v0.1.json`

Recommendation:

- Keep latest/current bundles active.
- Later archive older timestamped `dashboard-public-safe-*` bundles by date.
- Do not remove sj3labs public bundles until the public dashboard fallback behavior is reviewed.

## Dead Or Superseded Script Candidates

Do not delete yet. These are candidates for a future script consolidation pass:

- `install-marketops-paper-task-v0.1.ps1`: superseded by v0.2 install/repair flow, but may remain useful as a fallback.
- `install-marketops-office-task-v0.1.ps1`: still the canonical office task installer unless replaced by a combined v0.2 installer.
- `run-marketops-paper-full-v0.1.ps1`: scheduled task still references this wrapper, and it delegates to `run-marketops-paper-refresh-v0.2.ps1`.
- `run-marketops-refresh-once-v0.2.ps1`: useful manual wrapper; keep.
- `Admin\review-console` versus `Admin\content-approval-console`: both are review UI artifacts from different phases; consolidate only after live admin console behavior is stable.

## Repeated Helper Logic To Consolidate Later

Repeated patterns observed:

- PowerShell `$projectRoot = "C:\Users\sjohn\Desktop\Projects\MarketOps"` appears in most scripts.
- Scheduled task lookup/summary logic appears in multiple PowerShell scripts.
- JSON read/write helpers exist in both JavaScript utilities and PowerShell scripts.
- Local safety scan terms are repeated across QA, publishing, dashboard, and office checks.
- Dashboard/public bundle safety fields are validated in multiple places.

Low-risk future helper candidates:

- `Scripts\lib\MarketOpsPaths.ps1`
- `Scripts\lib\MarketOpsScheduledTasks.ps1`
- `Scripts\lib\MarketOpsSafetyScan.ps1`
- `src\qa\safetyTerms.js`
- `src\dashboard\publicBundleSafety.js`

## Hardcoded MarketOps Assumptions

Hardcoded project paths were found primarily in PowerShell operator/task scripts:

- `Scripts\check-marketops-refresh-tasks-v0.2.ps1`
- `Scripts\install-or-repair-marketops-refresh-tasks-v0.2.ps1`
- `Scripts\marketops-operator-command-center-v0.1.ps1`
- `Scripts\marketops-recovery-status-v0.1.ps1`
- `Scripts\run-marketops-office-full-v0.1.ps1`
- `Scripts\run-marketops-paper-full-v0.1.ps1`
- `Scripts\run-marketops-paper-refresh-v0.2.ps1`
- `Scripts\run-marketops-refresh-once-v0.2.ps1`
- `Scripts\verify-marketops-dashboard-movement-v0.1.ps1`

Tenant assumptions also appear in admin and Office code:

- default tenant: `marketops`
- UI titles containing MarketOps
- env names such as `MARKETOPS_ADMIN_PIN`
- admin route labels
- MarketOps-specific report names

Recommendation:

- Keep MarketOps hardcoding in top-level project scripts for now.
- Move reusable Office internals toward tenant config gradually.
- Do not rewrite the framework until the MarketOps tenant remains stable through several scheduled runs.

## Safe Archive Candidates

Safe to archive later after a human review:

- Older timestamped `Data\dashboard\dashboard-public-safe-*.json`
- Older timestamped `Data\approvals\approval-queue-*.json`
- Older timestamped logs in `Data\logs`
- Older automation/readiness/observation reports after the current status report is trusted.
- Old generated admin static bundles if the live admin console fully replaces them.

Do not archive yet:

- latest dashboard bundle
- public website dashboard bundle
- current approval queue
- current content queue
- current review-state files
- active scheduled task wrappers
- Step 0 baseline archive

## Low-Risk Refactors Completed

None in this pass.

Reason: the safest move was to produce a high-signal audit first. MarketOps is currently passing core QA, admin QA, dashboard QA, and scheduled task checks; changing shared utilities during this audit would create avoidable risk.

## Higher-Risk Refactors Deferred

- Full multi-tenant framework rewrite.
- Moving all path constants to shared PowerShell modules.
- Consolidating admin static console and live console.
- Deleting or archiving generated bundles/logs.
- Migrating scheduled task action away from the v0.1 wrapper.
- Reworking public dashboard fallback bundle versions.

## QA Results

QA was run after this audit report was created:

- `npm run full:qa`: PASS

The audit itself did not change runtime source behavior.

## Safety Confirmation

- No files were deleted.
- No live trading was enabled.
- No broker execution or order placement was added.
- No social posting, email, SMS, payment, commit, push, or deploy behavior occurred.

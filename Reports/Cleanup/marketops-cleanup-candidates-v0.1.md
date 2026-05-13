# MarketOps Cleanup Candidates v0.1

Generated: 2026-05-08

## Purpose

This is a non-destructive cleanup map. Nothing listed here was deleted. The goal is to reduce operator confusion later by separating source logic, generated outputs, legacy wrappers, and archived reports.

## Likely Safe To Archive Later

- Timestamped dashboard/public-safe bundle snapshots after the latest bundle is verified.
- Older automation readiness, install, and observation reports once the current scheduled task state is stable for several days.
- Older `Data\logs` files after they are represented in a monthly archive.
- Stale generated report snapshots that duplicate newer `latest` reports.

## Keep For Now

- `Scripts\run-marketops-paper-full-v0.1.ps1`: the scheduled task may still point at this v0.1 wrapper, and it delegates to the v0.2 refresh wrapper.
- `Scripts\run-marketops-paper-refresh-v0.2.ps1`: current safe 30-minute refresh wrapper.
- `Scripts\install-or-repair-marketops-refresh-tasks-v0.2.ps1`: current repair utility.
- `Scripts\check-marketops-refresh-tasks-v0.2.ps1`: current task inspection utility.
- `Admin\review-console` and `Admin\content-approval-console`: both represent different stages of the private review workflow and should be reviewed before merging or archiving.

## Generated Artifacts To Watch

- `Data\content\queue\approved-content-v0.1.json`
- `Data\content\queue\content-review-state-v0.1.json`
- `Data\approvals\approval-audit-log.json`
- `Data\dashboard`
- `Data\paper\history`
- `Data\logs`

These are expected to grow. They should stay out of public website publishing unless a sanitized export step explicitly selects fields.

## Potential Confusion Sources

- The phrase "live data" should mean Alpaca market data feed only.
- The phrase "live trading" should remain disabled everywhere.
- Local 30-minute refresh updates local bundles and local sj3labs files only.
- Production website updates still require manual commit/push/deploy unless a future deploy workflow is explicitly approved.

## Future Cleanup Pass

1. Add a date-based archive routine for logs and generated reports.
2. Consolidate admin static and live console documentation.
3. Decide whether old dashboard bundle versions should be retained or moved to a version archive.
4. Keep wrappers referenced by Windows Scheduled Tasks until task actions are migrated and verified.

## Safety Confirmation

No files were deleted by this cleanup candidate pass.

# Supercruise Output Routing and Logging v0.1

## Purpose

Supercruise must leave breadcrumbs. Lots of them. Not because we love paperwork, but because future debugging without logs is software archaeology with fewer hats.

## Required Output Categories

### Logs

Path:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Data\logs`

Log conventions:

- timestamped filename
- subsystem in filename
- command/result summary
- no secrets

### Reports

Path:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Reports`

Subfolders:

- `Automation`
- `Overnight`
- `Step0`
- `Social`
- `Signals`
- `Analytics`
- `Backtesting`
- `Dashboard`
- `Admin`
- `QA`

### Approval Queues

Path:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Data\approvals`

### Social Previews

Path:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Data\social-previews`

### Signal Previews

Path:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Data\signal-previews`

### Admin Review Console

Path:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Admin\review-console`

## Routing Rule

Any output that needs human judgment goes to:

1. relevant data/report folder
2. approval queue
3. admin review console bundle
4. morning checklist

## Internal vs Public-Safe Labeling

Every report/output should be classified as:

- `internal_only`
- `public_safe_preview`
- `public_published`
- `approval_required`

Default to `internal_only`.

## Morning Summary

Each long Supercruise run should produce:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Reports\Overnight\marketops-supercruise-morning-summary-YYYYMMDD.md`

Minimum content:

- what completed
- what failed
- what got routed for approval
- newest logs
- newest reports
- QA status
- blockers
- next recommended pass

## Failure Reporting

When blocked, create:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Reports\Overnight\marketops-supercruise-blocked-YYYYMMDD-HHMMSS.md`

Include:

- blocked action
- reason
- whether it violated hard boundary
- safe next step
- exact command if user must run something manually

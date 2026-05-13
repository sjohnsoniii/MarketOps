# Common Supercruise Rules

Operate in MarketOps Supercruise Mode.

Approved write scope:

`C:\Users\sjohn\Desktop\Projects\MarketOps`

Approved read scope:

`C:\Users\sjohn\Desktop\Projects\MarketOps`

`C:\Users\sjohn\Desktop\Projects\sj3labs`

Do not ask permission for justified local-only work inside MarketOps.

Never:
- commit
- push
- deploy
- publish
- transmit externally
- call external APIs
- fetch live market data
- connect brokers
- live trade
- send SMS/email
- post social content
- add payments/subscriptions
- add secrets/tokens/API keys
- auto-apply review-gated agent improvements
- access unrelated folders
- scan the whole computer
- destructive cleanup

All outputs must stay local. Route human decisions to approval queue/admin review.

# Run 16 — Supercruise QA and Baseline

## Goal

Run a broad local QA pass and produce a Step 0 baseline report.

## Duration

60-90 minutes.

## Tasks

1. Inspect available npm scripts.
2. Run all safe local QA scripts.
3. Do not run heavy full cycles repeatedly.
4. Do not post, push, deploy, email, or call APIs.

## Required Commands

From:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Source\marketops-core`

Run if available:

- `npm run automation:check`
- `npm run office:qa`
- `npm run agents:qa`
- `npm run social:qa`
- `npm run approvals:qa`
- `npm run admin:qa`
- `npm run signal:qa`
- `npm run emailprep:qa`
- `npm run reports:qa`
- `npm run analytics:qa`
- `npm run backtest:qa`

## Required Report

`C:\Users\sjohn\Desktop\Projects\MarketOps\Reports\Step0\marketops-step0-qa-baseline-v0.1.md`

Include:
- scripts found
- scripts run
- pass/fail results
- missing optional scripts
- blockers
- next fixes
- readiness for final Step 0 gate

## Report Back

Return QA table, files changed, report path, blockers.

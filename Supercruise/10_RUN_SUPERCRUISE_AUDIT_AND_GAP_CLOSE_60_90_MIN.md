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

# Run 10 — Supercruise Audit and Gap Close

## Goal

Inspect the current MarketOps state and identify exactly what remains to finish Step 0.

## Duration

60-90 minutes.

## Tasks

1. Inspect project structure under MarketOps.
2. Inspect package.json scripts.
3. Inspect existing reports/logs/data folders.
4. Inspect scheduled task observation report if present.
5. Inspect social readiness outputs if present.
6. Inspect analytics/backtesting/dashboard/signal outputs if present.
7. Create a Step 0 gap report.

## Required Output

Create:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Reports\Step0\marketops-step0-gap-report-v0.1.md`

Include:

- completed items
- missing items
- partial items
- blockers
- next exact local runs
- whether admin interface exists
- whether approval queue exists
- whether signal preview queue exists
- whether social preview queue exists
- whether final promotion is possible

## Commands

From:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Source\marketops-core`

Run if available:

- `npm run automation:check`
- `npm run office:qa`
- `npm run agents:qa`
- `npm run social:qa` if exists
- `npm run admin:qa` if exists
- `npm run signal:qa` if exists

## Report Back

Return files changed, commands run, QA results, missing Step 0 items, blockers, and next recommended run.

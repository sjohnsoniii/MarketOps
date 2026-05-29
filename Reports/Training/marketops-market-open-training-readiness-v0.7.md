# MarketOps Market-Open Training Readiness v0.7

**Generated:** 2026-05-19T03:07:00.000Z
**Author:** automated training readiness agent
**Status:** READY

## Account

- Active cycle ID: cycle-20260514-0220
- Starting balance: $1,000.00
- Current balance: $1,000.00 (pre-market - no paper trades yet)
- Open positions: 0
- Fake trades: 0
- Depletion risk: normal
- Paper-only mode: YES
- Live trading: disabled
- Broker execution: disabled

## Universe / Scan Profile

- Selected profile: standard
- Target scan universe size: 32 vehicles
- Active vehicles loaded: 32
- Composition: 9 ETF, 23 EQUITY
- Data-usable symbols: 32
- Max open paper positions: 5
- Max position size: 25% of cash
- Long/up-only: YES
- Risk Desk approval required: YES

## Backfill / Prior-Day Data

- Backfill status: completed
- Symbols attempted: 32
- Symbols usable: 32 (all >= 10 bars)
- Total bars backfilled: 58,397
- Rolling history: 60,388 bars across 32 symbols
- Data source: alpaca_iex_backfill
- Data ready for market open: YES

## Safety Guardrails

- Paper-only: YES
- Live trading disabled: YES
- Broker execution disabled: YES
- Margin disabled: YES
- Options disabled: YES
- Futures disabled: YES
- Shorting disabled: YES
- All safe: YES

## Scheduler

- Cadence: Mon-Fri 10:00, 12:00, 14:00, 15:50 America/New_York
- Last refresh status: PASS
- Health status: PASS
- Scheduler timer: active (next run: 2026-05-19 12:00 EDT)
- Service exit code: 0/SUCCESS

## Data-Only Prod Publish

- MARKETOPS_ALLOW_DATA_ONLY_GIT_PUBLISH: 1 (enabled)
- Allowlist: data/marketops/*.json
- Website code auto-commit: disabled
- sj3labs git: clean, up to date with origin/main

## Result

**MarketOps paper training scenario is ready for market open.**

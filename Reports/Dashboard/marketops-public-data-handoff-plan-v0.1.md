# MarketOps Public Data Handoff Plan v0.1

Generated: 2026-05-14T02:20:20Z

## Purpose

This plan defines what MarketOps may hand to `~/Projects/sj3labs` for a public dashboard preview without exposing secrets, private logs, raw restricted market data, broker identifiers, or execution details.

## Public-Safe Files

Allowed for `~/Projects/sj3labs/data/marketops`:

- `dashboard-bundle-public-v0.4.json`
- `market-activity-30d-preview-v0.1.json`
- future public-safe dashboard bundles that are derived, delayed, summarized, or aggregated
- public-safe paper-only cycle status fields
- public-safe signal/watchlist summaries
- public-safe rejection counts and layman explanations
- public-safe stale warning and bot activity timeline fields

Current refreshed public bundle:

- path: `~/Projects/sj3labs/data/marketops/dashboard-bundle-public-v0.4.json`
- dataSource: alpaca_iex
- refreshCadenceMinutes: 120
- barsLoaded: 100
- quotesLoaded: 5
- rawMarketDataPublished: false
- paperOnly: true
- externalEffects: false
- publishAllowed: false

## Private/Internal Files

Keep inside MarketOps only:

- `Data/logs/**`
- `Data/paper/history/**`
- `Data/paper/risk/**`
- `Data/paper/signals/**`
- `Data/paper/trades/**`
- `Data/paper/cycles/paper-cycle-state-v0.1.json`
- `Reports/Admin/**`
- private QA reports with local environment details
- raw or internal agent review details
- approval queues
- local admin console state

## Never Allowed

Never copy to public site output:

- `.env` files
- `.env.local`
- `Secrets/**`
- passwords
- API keys
- tokens
- raw broker/account identifiers
- raw Alpaca or broker API payload dumps
- full legal name
- raw internal IDs
- local machine paths that expose private structure
- live order payloads
- payment data
- email/SMS recipient data

## Current Bundle Safety

The current public-safe bundle passed dashboard QA and refresh QA. It includes:

- watchlist movement summary
- up/down/flat vehicle counts
- movement buckets
- signal candidates generated
- confidence distribution
- risk rejection reason counts
- almost-approved candidates
- market data freshness labels
- stale warning panel
- bot activity timeline
- paper cycle status

It does not publish raw bid/ask fields, raw close fields, API keys, tokens, or live trading flags.

## What sj3labs Should Consume

The public site should consume:

- public dashboard bundle v0.4
- chart arrays and summary fields from that bundle
- paper-only performance fields
- public-safe cycle status
- public-safe movement and rejection summaries
- stale warnings and data freshness labels

The site should continue showing clear labels:

- paper simulation
- fake money
- in development
- not financial advice
- not real performance
- no copy-trading
- raw market data not published

## What Stays in MarketOps

MarketOps retains:

- raw market-data adapter outputs
- full paper run history
- cycle state and archive details
- risk decision internals
- signal scan internals
- private admin and approvals views
- QA reports not meant for public rendering

## Balance-Based Cycle Public Display

Public cycle status may show:

- cycle ID
- active/reset_pending/closed status
- starting balance
- current balance
- days/hours survived
- approved trade count
- rejected trade count
- depletion risk
- next cycle scheduled start if reset_pending
- paper-only and no-external-effects flags

Public cycle status must not expose:

- broker identifiers
- raw trade IDs
- raw API payloads
- private local state
- unrestricted internal logs

## Approval Boundary

This checkpoint refreshed local public-safe bundle files only. It did not push, deploy, publish, or install automation.

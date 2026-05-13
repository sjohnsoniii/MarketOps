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

# Run 14 — Signal Sandbox Review Pipeline

## Goal

Create or improve the local-only Signal Desk preview pipeline.

## Duration

60-90 minutes.

## Tasks

1. Create or inspect Signal Desk source:
`C:\Users\sjohn\Desktop\Projects\MarketOps\Source\marketops-core\src\signals`

2. Create synthetic/local signal previews only.

Allowed signal types:
- observation
- regime_shift
- elevated_risk
- momentum_watch
- volatility_warning
- trend_confirmation
- synthetic_signal_preview

3. Route all signal previews to approval queue.
4. Add signal QA.
5. Add signal report.

## Forbidden

No external signals.
No email.
No SMS.
No social posting.
No broker connection.
No live data.
No buy/sell/copy wording.

## Suggested npm Scripts

- `signal:preview`
- `signal:qa`

## Outputs

`C:\Users\sjohn\Desktop\Projects\MarketOps\Data\signal-previews`

`C:\Users\sjohn\Desktop\Projects\MarketOps\Reports\Signals\marketops-signal-sandbox-v0.1.md`

## Validation

Run:
- `npm run signal:preview`
- `npm run signal:qa`
- `npm run approvals:qa` if exists
- `npm run office:qa`
- `npm run agents:qa`
- `npm run automation:check`

## Report Back

Return files changed, commands run, signal preview count, approval item count, QA results.

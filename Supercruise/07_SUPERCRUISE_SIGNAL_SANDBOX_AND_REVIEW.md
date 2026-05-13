# Supercruise Signal Sandbox and Review v0.1

## Purpose

Create signal/research preview infrastructure without external alerts.

This is for local research review only.

## Allowed Signal Preview Types

- `observation`
- `regime_shift`
- `elevated_risk`
- `momentum_watch`
- `volatility_warning`
- `trend_confirmation`
- `synthetic_signal_preview`
- `risk_desk_note`

## Forbidden Signal Behavior

Do not:

- send alerts
- email alerts
- text alerts
- post alerts
- call webhooks
- connect to broker
- execute orders
- tell users to buy/sell/copy
- imply live signal performance

## Required Labels

Every signal preview must include:

- `paper_simulation`
- `research_only`
- `not_financial_advice`
- `no_live_execution`
- `human_review_required`
- `sandbox_only`

## Suggested Paths

Signal data:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Data\signal-previews`

Signal reports:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Reports\Signals`

Signal source:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Source\marketops-core\src\signals`

## Review Queue Integration

Each signal preview should route to approval queue.

YES means:

- approved for internal research archive
- approved for possible future public-safe summary

YES does not mean:

- send signal
- post signal
- trade signal
- notify subscriber

## Suggested npm Scripts

- `signal:preview`
- `signal:qa`

## QA Rules

Fail if signal outputs contain:

- buy now
- sell now
- copy this
- guaranteed
- real money
- live execution
- subscriber execution
- external send enabled true

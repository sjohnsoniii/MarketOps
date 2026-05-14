# MarketOps Public Dashboard Refresh Cadence v0.1

Generated: 2026-05-14T01:43:27.171Z

## Recommendation

- Local paper runner: every 30 minutes.
- Local public-ready dashboard bundle refresh: every 30 minutes when cheap and stable.
- Public website commit/push/deploy: manual approval only for now.
- Future public dashboard publishing: 2-4 times per day at first, then every 30-60 minutes only after explicit auto-publish approval and repeated safety passes.
- Social posting: manually approved IG/X drafts first, likely 1-2 per day while quality improves.

## Phase Rollout

1. Phase 1: local publish-ready bundles only.
2. Phase 2: manual commit/push/deploy after review.
3. Phase 3: scheduled public deploy only after bundle safety, copy safety, and deploy rollback paths prove stable.

## Public-Safe Fields

- latest paper equity curve
- paper P&L
- drawdown
- activity counts
- signal/risk counts
- simulated trade activity
- current paper-only status
- latest lab note
- latest lesson
- latest disappointment
- next experiment
- timestamp of latest public-safe refresh

## Must Stay Private

- admin console data
- approval queues
- raw internal IDs
- local paths
- secrets/tokens/credentials
- unreleased drafts
- agent review internals
- private reports
- any live/broker/API/social-posting details

## Safety Checks

Every public bundle must remain paper simulation, fake money, in development, not real performance, not financial advice, no guarantees, and no copy-trading.

## Manual Approval Requirements

Auto-publish is not approved. Before any future auto-deploy, a human must approve the cadence, the public copy rules, the deploy mechanism, rollback process, and safety QA gate.

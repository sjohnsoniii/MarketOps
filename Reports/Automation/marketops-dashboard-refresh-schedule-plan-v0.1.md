# MarketOps Dashboard Refresh Schedule Plan v0.1

Generated: 2026-05-14T02:20:20Z

## Decision

Do not install scheduling yet. The local command exists and passed QA:

```bash
cd ~/Projects/MarketOps/Source/marketops-core
npm run dashboard:refresh
```

Target cadence is every 2 hours during market hours. A later 15-minute cadence should wait until refreshes are stable, dashboard data updates correctly, failure detection works, and public publishing remains controlled.

## Recommended Future Scheduler

Use a systemd user timer for Linux when scheduling is approved. It is easier to inspect, stop, and journal than cron. Cron remains acceptable if the host environment cannot use systemd user timers.

No systemd timer or cron entry was installed in this checkpoint.

## Refresh Flow

The master refresh command runs:

1. `npm run marketdata:refresh`
2. `npm run marketdata:qa`
3. `npm run paper:full`
4. `npm run risk:explain`
5. `npm run cycle:build`
6. `npm run cycle:qa`
7. `npm run dashboard:build`
8. `npm run paper:refresh-site`
9. `npm run dashboard:qa`
10. `npm run dashboard:public-refresh:qa`

## Health Check After Each Run

Each run should record:

- last attempted refresh timestamp
- last successful refresh timestamp
- failure reason
- consecutive failure count
- market-data source/feed
- latest bar timestamp
- public-safe bundle timestamp
- paper-only status
- externalEffects false
- publishAllowed false
- stale warning state

Current latest successful refresh:

- generatedAt: 2026-05-14T02:20:20.164Z
- market data source/feed: alpaca_iex / iex
- bars loaded: 100
- quotes loaded: 5
- latest bar timestamp: 2026-05-13T13:45:00Z
- refresh status: PASS

## Stale Warning Rule

Dashboard output should display stale warnings when:

- market data refresh age exceeds the configured dashboard freshness window
- latest market bar age indicates market closed, delayed, or stale data
- the latest paper run is older than the expected refresh cadence
- consecutive refresh failures are greater than zero

Current stale state is expected because the latest refresh was after market hours and the latest bar was 2026-05-13T13:45:00Z.

## Balance-Based Cycle Check

Every refresh must check the active cycle:

- if active cycle balance is above the depletion threshold, continue the same cycle
- if active cycle balance is at or below the depletion threshold, mark the cycle `reset_pending`
- write the closeout report before reset
- schedule the next cycle for the next market morning
- do not silently auto-reset
- do not reset surviving or profitable cycles daily

Current cycle:

- cycleId: cycle-20260514-0220
- status: active
- startingBalance: 1000
- currentBalance: 1000
- depletionThreshold: 0
- depletionRisk: normal
- nextCycleScheduledStart: null

## Optional Future Notification Path

Notifications may be considered later for repeated failures or depleted-cycle closeouts, but none are enabled now. Future notification paths must stay disabled until specifically approved.

## Safety Confirmation

- schedule installed: false
- externalEffects: false
- publishAllowed: false
- no push
- no deploy
- no live trading
- no broker execution
- no social posting
- no email/SMS
- no payments

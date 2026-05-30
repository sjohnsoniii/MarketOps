# MarketOps Dashboard Refresh Health v0.1

Generated: 2026-05-29T19:51:09.153Z

## Status

- lastStatus: CONTROLLED_DEGRADED
- isDegraded: true
- lastAttemptAt: 2026-05-29T19:51:09.153Z
- lastSuccessfulRefreshAt: 2026-05-21T14:01:39.855Z
- lastFailureAt: 2026-05-28T19:51:55.102Z
- consecutiveFailures: 22

## Health

- staleWarning: Last successful refresh was 197.8 hours ago (target: 2 hours)
- refreshIntervalTargetHours: 2
- schedulerInstalled: false

## Next Steps

- Run `npm run dashboard:refresh` to refresh now.
- If staleWarning is set, refresh should be run manually.
- Auto-scheduling (cron, systemd timer) is not yet installed.
- Target cadence: every 2 hours during market hours.

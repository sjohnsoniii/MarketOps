# MarketOps Dashboard Refresh Health v0.1

Generated: 2026-05-18T02:25:34.524Z

## Status

- lastStatus: FAIL
- lastAttemptAt: 2026-05-18T02:25:34.524Z
- lastSuccessfulRefreshAt: 2026-05-16T02:50:18.309Z
- lastFailureAt: 2026-05-18T02:25:34.524Z
- consecutiveFailures: 1

## Health

- staleWarning: Last successful refresh was 47.6 hours ago (target: 2 hours)
- refreshIntervalTargetHours: 2
- schedulerInstalled: false

## Next Steps

- Run `npm run dashboard:refresh` to refresh now.
- If staleWarning is set, refresh should be run manually.
- Auto-scheduling (cron, systemd timer) is not yet installed.
- Target cadence: every 2 hours during market hours.

# MarketOps Scheduler — systemd User Timer

This directory contains scripts to schedule `marketops:refresh` using a systemd
user timer (Linux only). The timer fires only during regular US market hours,
Mon–Fri, to avoid off-hours runs that return zero bars from Alpaca IEX.

## Design

- **Scan cadence**: The internal paper simulation is designed for intraday scanning
  (configurable `dayTrading.scanCadenceMinutes`, default 15 min). This scheduler
  triggers the full pipeline 4 times per market day: 10:00, 12:00, 14:00, 15:50 ET.
- **Dashboard refresh**: Public dashboard refresh runs as part of `marketops:refresh`,
  separate from the internal scan cadence.
- **Paper-only**: All scripts run the paper simulation loop only. No live trading,
  broker orders, deploy, social posts, email, or SMS.
- **Off-hours safety**: If `marketops:refresh` runs outside market hours and Alpaca
  returns zero bars, the system enters a CONTROLLED_DEGRADED state. Intraday
  simulation and confidence calibration are skipped. Rolling history and
  last-known-good dashboard data are preserved. No new trades are generated from
  stale data.

## Files

| File | Purpose |
|---|---|
| `run-marketops-refresh.sh` | Runs `npm run marketops:refresh` with logging |
| `install-marketops-refresh.sh` | Installs systemd user service + timer |
| `uninstall-marketops-refresh.sh` | Removes systemd user service + timer |
| `check-marketops-refresh.sh` | Checks timer/service status and recent runs |
| `README.md` | This file |

## Install

```bash
cd ~/Projects/MarketOps
MARKETOPS_ALLOW_LOCAL_SCHEDULER_INSTALL=1 bash Scripts/scheduler/install-marketops-refresh.sh
```

## Uninstall

```bash
cd ~/Projects/MarketOps
bash Scripts/scheduler/uninstall-marketops-refresh.sh
```

## Check Status

```bash
bash Scripts/scheduler/check-marketops-refresh.sh
```

## Logs

Logs are written to `~/Projects/MarketOps/logs/` with timestamps.
Only the last 30 log files are retained.

## Safety

- User-level only (no sudo, no root)
- Runs paper-only simulation commands
- No live trading, broker connection, or real money
- No deploy, social post, email, or SMS
- No secrets printed in logs
- Reversible via uninstall script

## Timer Cadence

The timer fires Mon–Fri only, at these America/New_York times:

| Time ET | Purpose |
|---------|---------|
| 10:00   | Post-open refresh after first hour of trading |
| 12:00   | Midday refresh |
| 14:00   | Afternoon refresh |
| 15:50   | Late-afternoon refresh before market close |

The previous 2-hour cadence (08:00–20:00 daily) was replaced because Alpaca IEX
returns zero bars outside regular market hours, causing the refresh to fail.
The new schedule avoids off-hours runs entirely.

## Manual Run

To run a single refresh cycle without the scheduler:

```bash
cd ~/Projects/MarketOps/Source/marketops-core
npm run marketops:refresh
```

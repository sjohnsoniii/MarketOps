# MarketOps Scheduler — systemd User Timer

This directory contains scripts to schedule `marketops:refresh` every 2 hours
using a systemd user timer (Linux only).

## Design

- **Scan cadence**: The internal paper simulation is designed for intraday scanning
  (configurable `dayTrading.scanCadenceMinutes`, default 15 min). This scheduler
  triggers the full pipeline every 2 hours.
- **Dashboard refresh**: Public dashboard refresh runs as part of `marketops:refresh`,
  separate from the internal scan cadence.
- **Paper-only**: All scripts run the paper simulation loop only. No live trading,
  broker orders, deploy, social posts, email, or SMS.

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

## Manual Run

To run a single refresh cycle without the scheduler:

```bash
cd ~/Projects/MarketOps/Source/marketops-core
npm run marketops:refresh
```

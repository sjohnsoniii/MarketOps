# MarketOps Autonomous Paper Runner v0.1

MarketOps Autonomous Paper Runner v0.1 runs the local paper simulation engine, records public-safe run history, refreshes the SJ3 Labs MarketOps dashboard data, and runs QA without adding live trading or broker connectivity.

## Safety Boundary

MarketOps remains paper simulation only.

The runner does not add or use:

- broker connections
- exchange APIs
- API keys
- live market data
- real-money trading
- SMS or email sending
- payment or subscription logic
- subscriber brokerage account connections

If MarketOps config leaves `paper_simulation` mode or enables broker/live/SMS/subscriber flags, the Core scripts fail loudly.

## Manual Run

From MarketOps Core:

```powershell
cd C:\Users\sjohn\Desktop\Projects\MarketOps\Source\marketops-core
npm run paper:full
```

This runs:

1. paper simulation
2. equity generation
3. pre-history QA
4. run history append
5. public dashboard refresh for SJ3 Labs
6. final QA

## PowerShell Runner

Run the wrapper script:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\sjohn\Desktop\Projects\MarketOps\Scripts\run-marketops-paper-full-v0.1.ps1"
```

The wrapper writes timestamped logs under:

```text
Data\logs
```

## History Outputs

Paper run history is written under:

```text
Data\paper\history
```

Important files:

- `run-history.json`
- `latest-run-summary.json`
- timestamped run summaries under `history\runs`

History summaries contain public-safe fields only: mode, paper-only flag, sample-data flag, balances, paper P/L, drawdown, counts, QA status, and notes.

## SJ3 Labs Dashboard Refresh

The refresh step writes the public-safe dashboard bundle to:

```text
sj3labs\data\marketops\dashboard-bundle-public-v0.4.json
```

The bundle is sanitized for public preview and does not include raw internal IDs, exact position sizing, quantities, private execution logic, local paths, or strategy formulas.

## Scheduled Task Helper

The install helper creates a Windows Scheduled Task named:

```text
MarketOps Paper Runner v0.1
```

Default schedule: every 30 minutes while the user is logged in.

Create the helper task manually by running:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\sjohn\Desktop\Projects\MarketOps\Scripts\install-marketops-paper-task-v0.1.ps1"
```

If Windows blocks automatic task creation, the script prints manual Task Scheduler instructions.

## Remove Scheduled Task

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\sjohn\Desktop\Projects\MarketOps\Scripts\remove-marketops-paper-task-v0.1.ps1"
```

## QA

Run:

```powershell
npm run qa
```

QA verifies paper mode, false unsafe flags, required npm scripts, expected output files, history outputs, public dashboard v0.4 safety flags, absence of raw internal IDs in the public bundle, and public-safety phrase checks.

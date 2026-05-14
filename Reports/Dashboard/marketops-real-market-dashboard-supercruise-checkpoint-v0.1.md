# MarketOps Real Market Dashboard Supercruise Checkpoint v0.1

Generated: 2026-05-14T01:39:00Z

## Verdict

`REAL_MARKET_DASHBOARD_REFRESH_FLOW_READY_LOCAL_ONLY`

MarketOps now has a local master dashboard refresh flow that pulls Alpaca IEX market data, runs paper simulation, rebuilds local/public-safe dashboard bundles, validates chart movement fields, and generates a local HTML preview.

The public proof-of-life story is now stronger, but it should be presented carefully:

- Real market data inputs are working through Alpaca IEX.
- Public-safe derived market movement is visible.
- Bot activity timeline and freshness panels are visible.
- Paper account movement is currently flat because Risk Desk approved 0 fake paper trades in the latest run.
- Regime/backtest charts remain fallback synthetic context and are labeled as such.

## Run History Since Friday 2026-05-08

MarketOps did not run continuously every day after Friday, May 8, 2026.

Evidence from `Data/paper/history/run-history.json`:

| Date | Paper history runs | First run | Last run | Assessment |
|---|---:|---|---|---|
| 2026-05-07 | 19 | 2026-05-07T20:30:11.025Z | 2026-05-07T23:30:02.107Z | Active setup/testing |
| 2026-05-08 | 42 | 2026-05-08T00:00:01.687Z | 2026-05-08T23:00:02.265Z | Active |
| 2026-05-09 | 15 | 2026-05-09T00:29:55.415Z | 2026-05-09T03:00:02.801Z | Early UTC continuation only |
| 2026-05-10 | 0 history rows | n/a | n/a | Logs exist, but scheduled runs were failing |
| 2026-05-11 | 0 | n/a | n/a | Gap confirmed |
| 2026-05-12 | 0 | n/a | n/a | Gap confirmed |
| 2026-05-13 | 3 before final refresh | 2026-05-13T19:40:21.818Z | 2026-05-13T21:23:11.994Z | Local manual/Beast-generated recovery |
| 2026-05-14 UTC | 3 final checkpoint runs | 2026-05-14T01:37:05.413Z | 2026-05-14T01:38:40.615Z | Local Supercruise refreshes, evening 2026-05-13 Eastern |

Latest paper run:

- Run ID: `paper-20260514-013840615Z`
- Generated: `2026-05-14T01:38:40.615Z`
- Paper ending equity: `10000`
- Paper P&L: `0`
- Paper return: `0%`
- Max drawdown: `0%`
- Vehicles scanned: `8`
- Risk approved: `0`
- Risk blocked: `8`
- Fake paper trades: `0`
- QA status: `PASS`

## What Was Running On 2026-05-10

`Data/logs` contains Windows scheduled-task style output on 2026-05-10:

- 19 paper runner logs.
- 19 paper refresh wrapper logs.
- 2 office logs.
- Last observed paper wrapper log: `Data/logs/marketops-paper-refresh-v0.2-20260510-200001.log`
- Last observed paper runner log: `Data/logs/marketops-paper-full-20260510-200000.log`
- Last observed office log: `Data/logs/marketops-office-full-20260510-195930.log`

The logs use Windows paths and PowerShell wrapper names, so they appear to be scheduled-task output from the Windows setup, not Beast/Linux-generated output.

The final May 10 paper runner was firing but failing:

- It started at `2026-05-10T20:00:01-04:00`.
- It ran `npm run paper:full`.
- It failed within the refresh wrapper.

The final May 10 office run was also failing:

- It started around `2026-05-10T19:59:30-04:00`.
- It failed with: Alpaca market data returned too few bars for simulation: `0`.

## Gap Identified

Confirmed gap:

- No clear continuous daily run evidence after 2026-05-10 until fresh local outputs on 2026-05-13.
- No May 11 or May 12 paper-history rows were found.
- No May 11 or May 12 `Data/logs` run files were found.
- The May 10 scheduler appeared to keep firing, but the job was failing due market-data availability.

No scheduled task, cron, or service was repaired or installed in this checkpoint.

## Fresh, Stale, Sample, Preview, Real

Fresh:

- `Data/dashboard/dashboard-refresh-latest-v0.1.json`
- `Reports/Dashboard/marketops-dashboard-refresh-latest-v0.1.md`
- `Data/dashboard/dashboard-public-safe-v0.1.json`
- `../sj3labs/data/marketops/dashboard-bundle-public-v0.4.json`
- `Admin/dashboard-preview/marketops-dashboard-preview-v0.1.html`
- `Data/paper/history/latest-run-summary.json`
- `Data/market-data/alpaca/alpaca-market-data-latest-v0.1.json`

Real market-data-backed:

- Alpaca IEX data source: `alpaca_iex`
- Feed: `iex`
- Symbols: `SPY`, `QQQ`, `AAPL`, `MSFT`, `NVDA`
- Bars loaded: `100`
- Quotes loaded: `5`
- Latest market data refresh: `2026-05-14T01:38:40.530Z`
- Latest bar timestamp: `2026-05-13T13:45:00Z`

Stale or delayed:

- Latest market bar is old relative to the refresh time and is labeled `market_closed_or_delayed`.
- Analytics summary is older than the current paper outputs. Dashboard headline cards now use fresh paper outputs instead of stale analytics.

Sample/fallback:

- Paper trades remain fake-money paper simulation.
- Regime score bars are synthetic backtest context.
- Synthetic benchmark comparison is fallback/sample context.
- The old deterministic `market-activity-30d-preview-v0.1.json` still exists for the site, but the new primary public bundle has Alpaca-derived movement fields.

Preview:

- Local HTML preview only: `Admin/dashboard-preview/marketops-dashboard-preview-v0.1.html`
- No deploy or public site publish was performed.

## Market Data Status

Market data refresh works locally with the existing data-only adapter.

Validated:

- `npm run marketdata:refresh`: PASS.
- `npm run marketdata:qa`: PASS, 26 checks, 0 failed.
- Data endpoint is restricted to Alpaca market data.
- Feed is restricted to `iex`.
- Output is labeled paper-only.
- `liveTradingEnabled: false`.
- `orderPlacementEnabled: false`.
- No credentials are printed into reports or public bundles.

## Dashboard Movement Coverage

`npm run dashboard:refresh` now verifies and reports these chart sections:

| Chart / Panel | Status | Source |
|---|---|---|
| Paper equity curve | Updated | Paper outputs |
| Paper P&L | Updated | Paper run history |
| Drawdown | Updated | Paper outputs |
| Vehicle activity | Updated | Paper signals plus market movement |
| Signal/risk counts | Updated | Paper run history |
| Cumulative paper P&L | Updated | Paper trade outputs |
| Progress toward +30% target | Updated | Paper account targets |
| Trade outcome mix | Updated | Paper trade outputs |
| Risk decision mix | Updated | Risk outputs |
| Vehicle contribution | Updated | Paper outputs plus market movement |
| Return vs drawdown snapshot | Updated | Paper run history |
| Paper account milestone strip | Updated | Paper account targets |
| Signal funnel | Updated | Paper signal outputs |
| Market data freshness panel | Updated | Alpaca IEX metadata |
| Recent market movement panel | Updated | Alpaca IEX derived bars |
| Bot activity / latest run timeline | Updated | Paper run history |
| Stale-data warning panel | Updated | Freshness labels |
| Regime score bars | Updated, fallback-labeled | Synthetic backtest context |
| Synthetic benchmark comparison | Updated, fallback-labeled | Synthetic backtest context |

Latest public-safe top movers from the local public bundle:

- `MSFT`: `-0.97%`
- `QQQ`: `-0.55%`
- `NVDA`: `-0.27%`
- `SPY`: `-0.14%`
- `AAPL`: `-0.03%`

## Commands Added Or Changed

Added npm scripts:

- `dashboard:refresh`
- `dashboard:refresh:qa`
- `dashboard:preview`

Updated existing dashboard behavior:

- `dashboard:build` now emits expanded movement panels and safety/freshness labels.
- `dashboard:qa` now verifies movement chart arrays, public-safe flags, freshness labels, and no raw/unsafe public markers.
- `paper:refresh-site` public bundle now includes freshness panels, bot activity timeline, vehicle contribution, target progress, stale warnings, and derived real-market movement fields.

## Files Added Or Modified

Code:

- `Source/marketops-core/package.json`
- `Source/marketops-core/src/dashboard/dashboardAggregator.js`
- `Source/marketops-core/src/dashboard/runDashboardBuild.js`
- `Source/marketops-core/src/dashboard/runDashboardQa.js`
- `Source/marketops-core/src/dashboard/runDashboardRefresh.js`
- `Source/marketops-core/src/dashboard/runDashboardRefreshQa.js`
- `Source/marketops-core/src/dashboard/runDashboardPreview.js`
- `Source/marketops-core/src/site/publicDashboardBundle.js`

Generated local outputs:

- `Data/dashboard/dashboard-refresh-latest-v0.1.json`
- `Reports/Dashboard/marketops-dashboard-refresh-latest-v0.1.md`
- `Reports/Dashboard/marketops-dashboard-refresh-qa-v0.1.md`
- `Reports/Dashboard/marketops-dashboard-preview-v0.1.md`
- `Reports/Dashboard/marketops-real-market-dashboard-supercruise-checkpoint-v0.1.md`
- `Admin/dashboard-preview/marketops-dashboard-preview-v0.1.html`
- `Data/dashboard/dashboard-public-safe-v0.1.json`
- `Data/dashboard/latest-dashboard-summary.json`
- `Reports/Dashboard/marketops-dashboard-public-safe-v0.1.md`
- `../sj3labs/data/marketops/dashboard-bundle-public-v0.4.json`

## QA Results

All required QA passed:

- `npm run qa`: PASS, 37 checks, 0 failed.
- `npm run marketdata:qa`: PASS, 26 checks, 0 failed.
- `npm run paper:full`: PASS.
- `npm run dashboard:build`: PASS.
- `npm run dashboard:qa`: PASS, 119 checks, 0 failed.
- `npm run dashboard:public-refresh:qa`: PASS, 18 checks, 0 failed.
- `npm run office:qa`: PASS, 47 checks, 0 failed.
- `npm run agents:qa`: PASS, 62 checks, 0 failed.
- `npm run admin:qa`: PASS, 71 checks, 0 failed.
- `npm run approvals:qa`: PASS, 1540 checks, 0 failed.
- `npm run dashboard:refresh`: PASS.
- `npm run dashboard:refresh:qa`: PASS, 50 checks, 0 failed.
- `npm run dashboard:preview`: PASS.

QA now verifies:

- No secrets in public bundles.
- No raw API keys/tokens in checked outputs.
- Paper-only flags.
- `externalEffects: false`.
- `publishAllowed: false`.
- No live trading.
- No broker execution.
- No social posting.
- No email/SMS.
- Linux path compatibility for generated public/dashboard outputs.
- Dashboard chart arrays exist and are non-empty.
- Timestamps/source labels/freshness labels exist.
- Stale/sample/fallback sections are clearly labeled.

## How Sam Refreshes Locally

Run:

```bash
cd ~/Projects/MarketOps/Source/marketops-core
npm run dashboard:refresh
npm run dashboard:refresh:qa
```

Primary refresh report:

```text
~/Projects/MarketOps/Reports/Dashboard/marketops-dashboard-refresh-latest-v0.1.md
```

## How Sam Previews Locally

Run:

```bash
cd ~/Projects/MarketOps/Source/marketops-core
npm run dashboard:preview
xdg-open ~/Projects/MarketOps/Admin/dashboard-preview/marketops-dashboard-preview-v0.1.html
```

Preview file:

```text
~/Projects/MarketOps/Admin/dashboard-preview/marketops-dashboard-preview-v0.1.html
```

## Blocked Or Needs Human Approval

Needs approval before public deploy:

- Any commit/push/deploy to `sj3labs`.
- Any scheduled task, cron, service, daemon, or auto-refresh installation.
- Any automatic public publishing cadence.
- Any social posting.
- Any email/SMS sending.
- Any broker, order placement, live-money, or live-trading behavior.

Needs future product decision:

- Whether to repair/install the scheduler that stopped after 2026-05-10.
- Whether to adjust signal/risk thresholds so fake paper trades can occur when appropriate.
- Whether the latest Alpaca IEX bar age is acceptable for public proof-of-life, or whether Step 1 should define stricter market-hours/freshness behavior.
- Whether synthetic regime/backtest panels should stay visible on the public page or move to internal-only.

## Explicit Boundary Confirmation

No push was performed.

No deploy was performed.

No scheduled task, cron, service, or daemon was installed.

No live trading was enabled.

No broker execution was enabled.

No real-money execution was performed.

No real social posting was performed.

No email or SMS was sent.

No payments were added.

No secrets were exposed.

No global package install was performed.

No raw restricted market data was published. Public bundle fields are derived/sanitized and labeled paper-only.

## Next Exact Commands

Recommended next local refresh:

```bash
cd ~/Projects/MarketOps/Source/marketops-core
npm run dashboard:refresh
npm run dashboard:refresh:qa
npm run dashboard:preview
xdg-open ~/Projects/MarketOps/Admin/dashboard-preview/marketops-dashboard-preview-v0.1.html
```

Recommended human review before any public step:

```text
Review Reports/Dashboard/marketops-dashboard-refresh-latest-v0.1.md and Admin/dashboard-preview/marketops-dashboard-preview-v0.1.html. Confirm whether to repair scheduled automation, tune fake-paper signal/risk behavior, or manually deploy the public-safe dashboard bundle.
```

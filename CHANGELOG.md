# MarketOps Changelog

## v0.19.1 — 2026-05-30
- Fixed equity reporting bug: totalEquity now = cash + holdings (was cash only)
- Fixed equityBuilder.js: endingEquity uses paperResults.totalEquity
- Cycle reset from reset_pending to active
- Connected repo to github.com/sjohnsoniii/MarketOps
- Public dashboard synced to sj3labs site
- Large market data files added to gitignore

## v0.1 - Alpaca Paper Market Data Adapter

Created: 2026-05-08

### Added

- Data-only Alpaca IEX market data adapter for local paper simulation inputs.
- Sanitized local market-data cache under `Data\market-data\alpaca\`.
- `marketdata:refresh` and `marketdata:qa` npm scripts.
- Dashboard bundle labels for `dataSource: alpaca_iex`, `paperOnly: true`, and `liveTradingEnabled: false`.

### Notes

This adapter reads market data only. It does not place orders, connect broker execution, fund accounts, enable live trading, publish content, send alerts, or expose credentials.

## v0.1 - The Office Admin Approval Console

Created: 2026-05-08

### Added

- Tenant-aware local admin approval console for MarketOps as the first Office tenant.
- Live localhost console at `http://localhost:4317`.
- Content queue review view for blogs, social posts, faceless video scripts, avatar scripts, and video generation packages.
- Local review-state file and approved-content output.
- Review actions: approve, reject, defer, needs_edit, regenerate_requested.

### Notes

Approval actions update local JSON only. They do not post, upload, publish, deploy, trade, send messages, call external APIs, or enable live behavior. Approved items keep `publishAllowed: false`.

## v0.1 - Video Generation Specialist Desk

Created: 2026-05-08

### Added

- Local-only Video Generation Specialist / Shortform Producer desk.
- Draft video production packets for IG Reels, TikTok, YouTube Shorts, and X Video.
- Review-gated content queue items for each video package.
- Agent self-review support for the Video Generation Specialist.
- QA checks for draft-only, paper-simulation labels, and disabled publishing/upload/API behavior.

### Notes

This desk creates production prep packets only. It does not render media, upload, post, call external APIs, use credentials, or publish.

## v0.1 - Section 0 Groundwork

Created: 2026-05-07 11:06:31

### Added

- Base MarketOps project folder
- Section 0 Charter
- Agent Output folders
- Agent Versions folders
- Data folders
- Source folders
- Risk, compliance, strategy, dashboard documentation folders

### Notes

This version does not include executable trading logic, API connections, package installs, broker integrations, or live-money features.

## v0.2 - Consolidated Section 0 Charter

Created: 2026-05-07 13:31:56

### Added

- Consolidated MarketOps Section 0 Charter v0.2
- Chaos Lab / Experimental Sandbox planning
- Staff Writer weekly/monthly field report planning
- Growth Desk social media planning
- Video Desk planning
- Brand Presenter / Avatar Desk planning
- Updated public/private product boundaries
- Updated success, risk, drawdown, strategy, compliance, tax, security, and content rules

### Notes

This version is still planning/documentation only.

No executable trading logic, broker integrations, package installs, API keys, or live-money features were created.
## v0.3 - Technical Architecture v0.1

Created: 2026-05-07 13:43:45

### Added

- MarketOps Technical Architecture v0.1
- MarketOps Phase 1 Build Plan v0.1
- MarketOps Data Schema v0.1
- Phase 1 config template JSON
- Phase 1 folders for sample data, schemas, source, tests, and reports

### Notes

This version is planning/scaffolding only.

No executable trading logic, broker integrations, package installs, API keys, subscriber alerts, or live-money features were created.
## v0.4 - MarketOps Core Phase 1 Paper Simulation Cleanup

Created: 2026-05-07

### Added

- MarketOps Core Phase 1 paper simulation runner
- Deterministic sample-data signal scan
- Risk Desk paper-only approval/block decisions
- Fake paper trade executor with account ledger
- Equity curve generation
- Performance summary generation
- Dashboard data bundle generation
- Staff Writer brief generation
- QA validation script and report
- Required npm scripts: simulate, equity, qa

### Notes

This version remains paper-only and sample-data-only.

No broker integrations, API keys, live market data, SMS alerts, subscriber signals, margin, leverage, options, futures, shorting, or real-money trading were added.


## v0.5 - MarketOps Autonomous Paper Runner v0.1

Created: 2026-05-07

### Added

- npm scripts: paper:run, paper:history, paper:refresh-site, paper:full
- Local paper pipeline wrapper that runs simulation, equity, history, site refresh, and QA
- Public-safe timestamped paper history under Data\paper\history
- Public-safe dashboard bundle v0.4 for SJ3 Labs
- PowerShell full-runner script with timestamped logs under Data\logs
- Scheduled Task install/remove helper scripts
- Automation documentation under Docs\Automation
- QA checks for automation scripts, history files, public dashboard bundle safety, and public phrase scans

### Notes

This version remains paper-only and sample-data-only.

No broker integrations, API keys, live market data, SMS/email sending, payment/subscription logic, subscriber account connections, or real-money trading were added.

## v0.6 - MarketOps Autonomous Office v0.1

- Added local office scripts for content generation, queue building, office QA, and full office runs.
- Added review-only blog/report drafts, social copy packs, faceless video scripts, and avatar presenter scripts.
- Added a local content queue with `draft_review_required` status and `publishAllowed: false` on every item.
- Added compliance reporting for generated content.
- Added PowerShell runner and scheduled-task helper scripts without installing a task automatically.
- Preserved paper simulation only: no broker connection, no real-money trading, no live data, no messaging, and no auto-posting.

## v0.7 - MarketOps Agent Review / Self-Improvement Layer v0.1

- Added `agents:review` and `agents:qa` scripts.
- Added detailed desk reviews under `Data\agent-reviews`.
- Added improvement backlog, monthly human review brief, and biweekly review digest.
- Added digest-throttled review cadence so routine observations are deferred to the next biweekly review window.
- Kept every proposal human-review required with `autoApplyAllowed: false`.
- Updated `office:run` to run paper office flow, agent reviews, and agent QA.

## v0.8 - MarketOps Automation Readiness Check v0.1

- Added `automation:check` readiness gate.
- Added automation readiness report under `Reports\Automation`.
- Verified paper runner, office runner, agent review layer, manual PowerShell runners, scheduled-task helper scripts, and paper-only safety guardrails.
- Confirmed scheduled task helpers are ready but not installed.

## v0.9 - MarketOps Scheduled Automation Install + Stabilization v0.1

- Installed the approved MarketOps paper runner scheduled task.
- Installed the approved MarketOps autonomous office/content/review scheduled task.
- Updated automation readiness checker to validate approved post-install task state.
- Added post-install automation report under `Reports\Automation`.
- Revalidated paper, office, agent, automation, and manual PowerShell runner flows after install.
- Confirmed no duplicate MarketOps scheduled tasks were created.

## v0.10 - MarketOps Backtesting + Regime Lab v0.1

- Added local-only backtesting/regime lab scripts.
- Added deterministic synthetic sample periods for trend, drawdown, choppy, low-volatility, and melt-up regimes.
- Added regime classification, simple paper strategy harness, scoring, JSON outputs, and markdown report.
- Added `backtest:run` and `backtest:qa` scripts.
- Preserved paper-only, no-live-data, no-broker, no-external-integration constraints.

## v0.11 - MarketOps Social Account Readiness + Publishing Prep v0.1

- Added local-only social account readiness template for Instagram, X, TikTok, and YouTube.
- Deferred LinkedIn and Facebook until later polish cycles.
- Added `social:check` and `social:qa` scripts.
- Added manual posting setup docs and a draft publishing checklist.
- Added social readiness reporting under `Reports\Social`.
- Preserved no-credentials, no-API-posting, no-auto-posting, and paper-simulation safety boundaries.

## v0.12 - MarketOps Metrics + Performance Analytics v0.1

- Added `analytics:run` and `analytics:qa` scripts.
- Added local paper-performance analytics under `Data\analytics`.
- Added analytics reporting under `Reports\Analytics`.
- Added drawdown, volatility, Sharpe-like placeholder, win/loss streak, regime comparison, benchmark placeholder, and risk-adjusted score diagnostics.
- Preserved paper-only, sample-data-only, no-live-data, no-broker, no-API, and no-social-posting constraints.

## v0.13 - MarketOps Public-Safe Dashboard Infrastructure v0.1

- Added `dashboard:build` and `dashboard:qa` scripts.
- Added public-safe dashboard aggregation utilities.
- Added dashboard-ready bundles under `Data\dashboard`.
- Added dashboard report under `Reports\Dashboard`.
- Added chart-ready sections for equity, rolling equity, drawdown, signal funnel, trade outcomes, regime scores, and synthetic benchmark comparisons.
- Added cards for paper performance, risk events, content generation, and agent review stats.
- Preserved no private IDs, no local paths, no live data, no broker/API/payment behavior, and no social auto-posting.

## v0.14 - MarketOps Signal Desk Architecture v0.1

- Added `signal-desk:build` and `signal-desk:qa` scripts.
- Added local-only Signal Desk architecture under `Data\signals`.
- Added synthetic signal preview schema, classifications, compliance labels, and review-gated workflow.
- Added Signal Desk architecture and QA reports under `Reports\Signals`.
- Preserved research-only, paper-simulation, no-live-execution, no-subscriber-delivery, no-social-posting, and no-financial-advice boundaries.

## v0.15 - MarketOps Supercruise Approval + Admin Review v0.1

- Added `approvals:generate` and `approvals:qa` scripts.
- Added `admin:build` and `admin:qa` scripts.
- Added `reports:index` script.
- Added local approval queue under `Data\approvals`.
- Added static local admin review console under `Admin\review-console`.
- Added report index under `Reports\marketops-report-index-v0.1.md`.
- Preserved local-only, review-gated, no-external-send, no-posting, no-trading, and no-publishing boundaries.

## v0.16 - MarketOps Social Preview Sandbox v0.1

- Added `social:preview` script.
- Added dedicated social preview outputs under `Data\social-previews`.
- Added IG/X active preview drafts.
- Added TikTok/YouTube future-prep script drafts.
- Kept LinkedIn/Facebook deferred.
- Routed social previews into the approval queue.
- Preserved no posting, no upload, no social API, no live trading, and no financial-advice boundaries.

## v0.17 - MarketOps Reporting + Email Prep v0.1

- Added `emailprep:build` and `emailprep:qa` scripts.
- Added draft-only email queue under `Data\email-queue`.
- Added local email templates under `Docs\Email`.
- Added escalation type report and next-morning review checklist.
- Preserved no email sending, no SMTP/API credentials, no external notification, and no external transmission boundaries.

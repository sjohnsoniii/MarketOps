# MarketOps

MarketOps is a dedicated AI trading office and public paper-trading lab.

It starts with auto paper trading, public performance tracking, strategy review, risk management, and controlled optimization.

Future phases may include Sam-only micro-live auto-trading and a public broadcast-only Signal Desk.

## Current Status

Section 0 groundwork created.

## Important Boundaries

- No real-money trading yet
- No execution, broker, social posting, email, SMS, or payment keys in source control
- No subscriber account connections
- No automated trading for subscribers
- No paid Signal Desk until compliance/legal review
- Paper trading first

## Key Document

Docs\Section 0\MarketOps-Section-0-Charter-v0.1.md

## Media and Growth Expansion

MarketOps now includes planning for:

- Growth Desk / Social Media Expert
- Video Desk
- Brand Presenter / Avatar Desk
- Video Generation Specialist / Shortform Producer

See:
- Docs\Section 0\MarketOps-Section-0-Amendment-Media-Growth-v0.1.md
- Docs\Content\MarketOps-Content-Engine-Spec-v0.1.md
- Docs\Brand\MarketOps-Brand-Presenter-Spec-v0.1.md

## Video Generation Specialist

The Video Generation Specialist turns paper-simulation outputs, dashboard updates, reports, case studies, agent reviews, and social packs into draft short-form production packets for future IG Reels, TikTok, YouTube Shorts, and X Video review.

This is prep-only. It does not render final media, upload, post, call video APIs, use credentials, or publish. Every package remains `draft_review_required` with `publishAllowed: false`.

## Section 0 v0.2 Consolidated Charter

MarketOps now has a consolidated Section 0 v0.2 charter covering:

- private auto-trading for Sam only
- public paper dashboard
- dynamic NASDAQ/S&P universe
- Chaos Lab aggressive paper testing
- +30% core success target
- risk and drawdown gates
- strategy versioning
- optimization rules
- weekly/monthly Staff Writer reports
- Growth Desk social content
- Video Desk scripts
- Brand Presenter / Avatar Desk
- Compliance, tax, security, and logging posture

Primary charter:

Docs\Section 0\MarketOps-Section-0-Charter-v0.2.md
## Technical Architecture v0.1

MarketOps now has Phase 1 technical planning docs:

- Docs\Architecture\MarketOps-Technical-Architecture-v0.1.md
- Docs\Build Plans\MarketOps-Phase-1-Build-Plan-v0.1.md
- Docs\Schemas\MarketOps-Data-Schema-v0.1.md
- Data\schemas\marketops-phase1-config-template-v0.1.json

Phase 1 target:

MarketOps Core v0.1, a local paper-trading simulation engine with no broker/API/live-money capability.
## MarketOps Core Phase 1 Paper Simulation

MarketOps Core is currently a paper-only simulation engine. It can use a local data-only Alpaca IEX market-data adapter when local `.env.local` credentials are present, while all trades remain fake paper simulation. It does not place orders, connect broker execution, send SMS alerts, send subscriber signals, use margin, leverage, options, futures, shorting, or real-money execution.

Core path:

```powershell
cd Source\marketops-core
```

Run the full Phase 1 simulation:

```powershell
npm run simulate
```

Regenerate the equity curve from the latest paper trade output:

```powershell
npm run equity
```

Run QA validation:

```powershell
npm run qa
```

The simulation writes structured paper-only outputs under `Data\paper\`, including signal scans, Risk Desk decisions, fake paper trades, an equity curve, dashboard bundle data, performance summary, Staff Writer brief, and QA report.

Safety boundary: if the config mode is not `paper_simulation`, or if broker/live/SMS/subscriber flags are enabled, MarketOps Core fails loudly instead of running.

## Alpaca Market Data Adapter v0.1

MarketOps includes a data-only Alpaca IEX adapter for paper simulation inputs.

```powershell
cd Source\marketops-core
npm run marketdata:refresh
npm run marketdata:qa
```

The adapter reads credentials from local ignored `.env.local` files only. It writes sanitized market-data cache files under `Data\market-data\alpaca\` and labels outputs with `dataSource: alpaca_iex`, `paperOnly: true`, and `liveTradingEnabled: false`.

This layer does not place orders, fund accounts, connect execution, enable live trading, send alerts, publish content, or expose credentials in reports/dashboard bundles.


## MarketOps Autonomous Paper Runner v0.1

MarketOps now includes a local autonomous paper runner. It remains paper-only and sample-data-only.

From MarketOps Core:

```powershell
cd Source\marketops-core
npm run paper:full
```

Useful scripts:

```powershell
npm run paper:run
npm run paper:history
npm run paper:refresh-site
npm run paper:full
npm run qa
```

PowerShell wrapper:

```powershell
powershell -ExecutionPolicy Bypass -File "Scripts\run-marketops-paper-full-v0.1.ps1"
```

The runner writes logs under `Data\logs`, paper history under `Data\paper\history`, and the public-safe SJ3 Labs dashboard bundle to `sj3labs\data\marketops\dashboard-bundle-public-v0.4.json`.

Scheduled task helper scripts live under `Scripts\`. They are not installed automatically.

Safety boundary: no broker connections, API keys, live market data, real-money trading, SMS/email sending, payments, subscriptions, or subscriber account connections are added.

## MarketOps Autonomous Office v0.1

The Autonomous Office extends the paper runner into a local, review-gated operating office. It runs the paper simulation, refreshes dashboard data, logs history, drafts reports, drafts social/content packs, creates short-form video and avatar presenter scripts, builds a local content queue, and runs compliance checks.

Run from `Source\marketops-core`:

```powershell
npm run office:run
npm run office:qa
```

Generated drafts live under `Data\content`. The review queue lives at `Data\content\queue\content-queue-v0.1.json`. The compliance report lives at `Data\content\compliance\content-compliance-report-v0.1.md`.

Safety boundary: MarketOps remains paper simulation only. Draft content is local, sample-data based, fake-money labeled, and publishing is disabled by default.

## MarketOps Agent Review / Self-Improvement Layer v0.1

MarketOps now includes a local agent-review layer. After office runs, desks can write detailed self-reviews, propose improvements, and defer routine ideas into a biweekly digest.

Run from `Source\marketops-core`:

```powershell
npm run agents:review
npm run agents:qa
```

Review outputs live under `Data\agent-reviews`. Routine proposals default to `review_next_digest`, every proposal requires human review, and `autoApplyAllowed` remains false.

## MarketOps Automation Readiness Check v0.1

Run from `Source\marketops-core`:

```powershell
npm run automation:check
```

The readiness checker verifies the paper runner, office/content runner, agent review layer, manual PowerShell runners, scheduled-task helper scripts, paper-only guardrails, latest outputs, digest cadence, and transparency language. It writes the report to `Reports\Automation\marketops-automation-readiness-v0.1.md`.

This check does not install scheduled tasks.

## MarketOps Scheduled Automation Install + Stabilization v0.1

The approved MarketOps scheduled tasks have been installed and validated:

- `MarketOps Paper Runner v0.1`: runs every 30 minutes while the user is logged in.
- `MarketOps Autonomous Office v0.1`: runs daily at 7:30 PM while the user is logged in.

Post-install report:
`Reports\Automation\marketops-scheduled-automation-install-v0.1.md`

Removal commands remain available under `Scripts\remove-marketops-paper-task-v0.1.ps1` and `Scripts\remove-marketops-office-task-v0.1.ps1`.

## MarketOps Backtesting + Regime Lab v0.1

Run from `Source\marketops-core`:

```powershell
npm run backtest:run
npm run backtest:qa
```

The lab uses deterministic synthetic sample periods only. Outputs live under `Data\backtests` and `Reports\Backtesting`. No live market data, broker connection, or real-money behavior is used.

## MarketOps Social Account Readiness v0.1

Run from `Source\marketops-core`:

```powershell
npm run social:check
npm run social:qa
```

The social readiness layer prepares local-only account documentation and manual publishing checks for Instagram, X, TikTok, and YouTube. LinkedIn and Facebook are deferred for later.

Credentials, tokens, recovery codes, and API keys must stay out of the repo and out of chat. This layer does not post to social platforms, connect APIs, or enable auto-posting.

## MarketOps Metrics + Performance Analytics v0.1

Run from `Source\marketops-core`:

```powershell
npm run analytics:run
npm run analytics:qa
```

The analytics layer generates richer paper-performance diagnostics under `Data\analytics` and `Reports\Analytics`. It covers paper equity, drawdown, Sharpe-like placeholder metrics, streaks, regime comparisons, benchmark placeholders, and risk-adjusted scoring.

All analytics remain local, paper-only, sample-data based, and diagnostic. They are not real performance claims and do not enable live trading, broker connections, live data, APIs, or social posting.

## MarketOps Public-Safe Dashboard Infrastructure v0.1

Run from `Source\marketops-core`:

```powershell
npm run dashboard:build
npm run dashboard:qa
```

The dashboard layer writes local preview-safe bundles under `Data\dashboard` and a summary report under `Reports\Dashboard`. The bundle aggregates paper metrics, regime summaries, rolling equity, drawdown visual data, signal funnel stats, trade outcomes, risk events, content generation stats, and agent review stats.

Outputs stay labeled `paper_simulation`, `sampleData`, `notFinancialAdvice`, and `notLiveMarketData`.

## MarketOps Signal Desk Architecture v0.1

Run from `Source\marketops-core`:

```powershell
npm run signal-desk:build
npm run signal-desk:qa
```

The Signal Desk layer defines a future research-alert structure without enabling real signals, subscriber delivery, social posting, broker behavior, or execution. It creates synthetic research-preview schemas, compliance labels, review workflow data, and local reports under `Data\signals` and `Reports\Signals`.

Every output stays labeled as paper simulation, research/educational only, not financial advice, no guarantee, and no live execution.

## MarketOps Supercruise Approval + Admin Review v0.1

Run from `Source\marketops-core`:

```powershell
npm run approvals:generate
npm run approvals:qa
npm run admin:build
npm run admin:qa
npm run reports:index
```

The approval layer routes review-worthy local outputs into `Data\approvals\approval-queue-latest.json`. The static admin console lives at `Admin\review-console\index.html`.

The console is for local review only. It cannot publish, post, send, email, trade, call APIs, or connect brokers.

## The Office Admin Approval Console v0.1

Run from `Source\marketops-core`:

```powershell
npm run admin:console
npm run admin:live
```

The reusable Office-style console reads the MarketOps tenant content queue and writes local review state under `Data\content\queue`. It supports `approve`, `reject`, `defer`, `needs_edit`, and `regenerate_requested`.

Live local URL:

```text
http://localhost:4317
```

The live console is localhost-only and exposes local endpoints for queue review, item preview, review decisions, and approved-content metadata. Approval means approved for manual use/review only; it does not publish online.

Outputs:

- `Admin\content-approval-console\index.html`
- `Data\content\queue\content-review-state-v0.1.json`
- `Data\content\queue\approved-content-v0.1.json`

Approved content remains local review metadata only. `publishAllowed` stays false until a separate future manual publishing step is explicitly approved.

## MarketOps Social Preview Sandbox v0.1

Run from `Source\marketops-core`:

```powershell
npm run social:preview
npm run social:qa
```

The social preview sandbox generates local-only IG/X draft previews and future TikTok/YouTube script placeholders under `Data\social-previews`. LinkedIn and Facebook remain deferred.

No posting, scheduling, upload, or social API behavior is enabled.

## MarketOps Reporting + Email Prep v0.1

Run from `Source\marketops-core`:

```powershell
npm run emailprep:build
npm run emailprep:qa
```

Email prep creates local draft templates, a draft-only email queue, escalation types, and a morning checklist. It does not send email, configure SMTP, call APIs, or store credentials.

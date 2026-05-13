# MarketOps Autonomous Office v0.1

MarketOps Autonomous Office v0.1 wraps the paper-simulation engine in a local operating office. It runs the fake-money paper loop, refreshes the public-safe dashboard bundle, logs history, drafts reports, drafts social copy, drafts short-form video scripts, drafts avatar presenter scripts, scans the generated content, and writes everything into a local review queue.

Everything remains local, paper-only, sample-data based, and review-gated. Nothing posts publicly. Nothing sends messages. Nothing connects to a broker. Nothing uses live market data.

## Manual Commands

Run from `Source\marketops-core`:

```powershell
npm run office:content
npm run office:queue
npm run office:qa
npm run office:run
```

`npm run office:run` performs the full local office sequence:

1. `paper:full`
2. `office:content`
3. `office:queue`
4. `office:qa`

## Generated Drafts

Drafts are written under `Data\content`:

- `blogs\weekly-marketops-field-report-v0.1.md`
- `blogs\monthly-marketops-lab-report-v0.1.md`
- `reports\trade-case-study-v0.1.md`
- `social\social-pack-v0.1.json`
- `social\social-pack-v0.1.md`
- `video\faceless-video-pack-v0.1.md`
- `avatar\avatar-presenter-pack-v0.1.md`

Every generated item is marked review-required with publishing disabled.

## Queue And Compliance

Queue:

```text
Data\content\queue\content-queue-v0.1.json
```

Latest office summary:

```text
Data\content\queue\latest-office-run-summary.json
```

Compliance report:

```text
Data\content\compliance\content-compliance-report-v0.1.md
```

The compliance scan checks generated content for risky language, raw internal identifiers, and anything that would imply real trading, publishing, or external integrations. If the scan fails, `office:qa` exits nonzero and publishing remains disabled.

## PowerShell Runner

Run the full office wrapper manually:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\sjohn\Desktop\Projects\MarketOps\Scripts\run-marketops-office-full-v0.1.ps1"
```

Logs are written under:

```text
Data\logs
```

## Scheduled Task Helpers

Install helper, if you decide to schedule it later:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\sjohn\Desktop\Projects\MarketOps\Scripts\install-marketops-office-task-v0.1.ps1"
```

Remove helper:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\sjohn\Desktop\Projects\MarketOps\Scripts\remove-marketops-office-task-v0.1.ps1"
```

Default schedule: daily at 7:30 PM while the user is logged in.

## What Is Not Automated Yet

- No publishing
- No social platform posting
- No email or SMS sending
- No payment or subscription flow
- No broker connection
- No real-money trading
- No live market-data fetch

## Review Gate

The office can draft. A human must review. Queue items default to `draft_review_required` and `publishAllowed: false`.

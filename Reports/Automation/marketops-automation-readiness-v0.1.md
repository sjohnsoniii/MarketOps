# MarketOps Automation Readiness Check v0.1

Generated at: 2026-05-29T19:51:09.158Z

## Readiness Verdict

CROSS_PLATFORM_READY
- Windows scheduler (Task Scheduler) is not available on this platform.
- PowerShell-based scheduled task operations are not available.
- All automation checks that require PowerShell return 'not_installed' on Linux.
- schedulerInstalled remains false.
- Future automation on Linux should use systemd timers or cron instead.

### Cross-Platform Status
- sc.`SCHEDULER_AVAILABLE`: false (Linux – no Task Scheduler)
- sc.`PLATFORM`: Linux
- sc.`SCHEDULER_INSTALLED`: false
- sc.`SCHEDULER_UNSUPPORTED`: true

## Scheduled Task Install State

- Paper task: not_installed
- Office task: not_installed
- MarketOps scheduled task count: 0
- Platform: Linux
- Windows scheduler available: false

## Commands Run For This Gate

- npm run paper:full
- npm run office:run
- npm run office:qa
- npm run agents:review
- npm run agents:qa
- npm run automation:check
- .\run-marketops-paper-full-v0.1.ps1
- .\run-marketops-office-full-v0.1.ps1

## Checks Passed

- PASS: npm script exists: simulate - node src/index.js
- PASS: npm script exists: equity - node src/performance/equityCurve.js
- PASS: npm script exists: qa - node src/qa/runQa.js
- PASS: npm script exists: paper:run - node src/paper/runPaper.js
- PASS: npm script exists: paper:history - node src/paper/writeHistory.js
- PASS: npm script exists: paper:refresh-site - node src/site/refreshSiteDashboard.js
- PASS: npm script exists: paper:full - node src/paper/full.js
- PASS: npm script exists: office:content - node src/office/generateContent.js
- PASS: npm script exists: office:queue - node src/office/buildQueue.js
- PASS: npm script exists: office:qa - node src/office/runOfficeQa.js
- PASS: npm script exists: office:run - node src/agents/runOfficeWithAgents.js
- PASS: npm script exists: agents:review - node src/agents/runAgentReviews.js
- PASS: npm script exists: agents:qa - node src/agents/runAgentsQa.js
- PASS: npm script exists: automation:check - node src/automation/runAutomationCheck.js
- PASS: paper:full source exists - /home/sjohnsoniii/Projects/MarketOps/Source/marketops-core/src/paper/full.js
- PASS: office:run source exists - /home/sjohnsoniii/Projects/MarketOps/Source/marketops-core/src/agents/runOfficeWithAgents.js
- PASS: office:qa source exists - /home/sjohnsoniii/Projects/MarketOps/Source/marketops-core/src/office/runOfficeQa.js
- PASS: agents:review source exists - /home/sjohnsoniii/Projects/MarketOps/Source/marketops-core/src/agents/runAgentReviews.js
- PASS: agents:qa source exists - /home/sjohnsoniii/Projects/MarketOps/Source/marketops-core/src/agents/runAgentsQa.js
- PASS: paper:full includes pipeline, site refresh, QA - /home/sjohnsoniii/Projects/MarketOps/Source/marketops-core/src/paper/full.js
- PASS: intraday simulation appends run history - /home/sjohnsoniii/Projects/MarketOps/Source/marketops-core/src/simulation/runIntradaySimulation.js
- PASS: office:run includes office and agent review flow - /home/sjohnsoniii/Projects/MarketOps/Source/marketops-core/src/agents/runOfficeWithAgents.js
- PASS: paper PowerShell runner exists - /home/sjohnsoniii/Projects/MarketOps/Scripts/run-marketops-paper-full-v0.1.ps1
- PASS: paper refresh v0.2 runner exists - /home/sjohnsoniii/Projects/MarketOps/Scripts/run-marketops-paper-refresh-v0.2.ps1
- PASS: refresh task v0.2 install/repair helper exists - /home/sjohnsoniii/Projects/MarketOps/Scripts/install-or-repair-marketops-refresh-tasks-v0.2.ps1
- PASS: refresh task v0.2 check helper exists - /home/sjohnsoniii/Projects/MarketOps/Scripts/check-marketops-refresh-tasks-v0.2.ps1
- PASS: refresh task v0.2 run-once helper exists - /home/sjohnsoniii/Projects/MarketOps/Scripts/run-marketops-refresh-once-v0.2.ps1
- PASS: office PowerShell runner exists - /home/sjohnsoniii/Projects/MarketOps/Scripts/run-marketops-office-full-v0.1.ps1
- PASS: paper scheduled-task install helper exists - /home/sjohnsoniii/Projects/MarketOps/Scripts/install-marketops-paper-task-v0.1.ps1
- PASS: paper scheduled-task remove helper exists - /home/sjohnsoniii/Projects/MarketOps/Scripts/remove-marketops-paper-task-v0.1.ps1
- PASS: office scheduled-task install helper exists - /home/sjohnsoniii/Projects/MarketOps/Scripts/install-marketops-office-task-v0.1.ps1
- PASS: office scheduled-task remove helper exists - /home/sjohnsoniii/Projects/MarketOps/Scripts/remove-marketops-office-task-v0.1.ps1
- PASS: paper install helper schedule is every 30 minutes - /home/sjohnsoniii/Projects/MarketOps/Scripts/install-marketops-paper-task-v0.1.ps1
- PASS: office install helper schedule is daily at 7:30 PM - /home/sjohnsoniii/Projects/MarketOps/Scripts/install-marketops-office-task-v0.1.ps1
- PASS: paper scheduled task approved state - Not installed yet; ready for approved install.
- PASS: office scheduled task approved state - Not installed yet; ready for approved install.
- PASS: no unexpected MarketOps scheduled tasks - 0 MarketOps task(s)
- PASS: no duplicate MarketOps scheduled task names - 0 duplicate name(s)
- PASS: config mode is paper_simulation - paper_simulation
- PASS: allowBrokerConnection is false - false
- PASS: allowLiveTrading is false - false
- PASS: allowSmsAlerts is false - false
- PASS: allowSubscriberSignals is false - false
- PASS: no dependency for alpaca - not found
- PASS: no dependency for coinbase - not found
- PASS: no dependency for ibkr - not found
- PASS: no dependency for twilio - not found
- PASS: no dependency for sendgrid - not found
- PASS: no dependency for mailgun - not found
- PASS: no dependency for stripe - not found
- PASS: no dependency for paypal - not found
- PASS: no dependency for twitter-api - not found
- PASS: no dependency for facebook - not found
- PASS: no dependency for instagram - not found
- PASS: no dependency for linkedin-api - not found
- PASS: latest paper output exists - /home/sjohnsoniii/Projects/MarketOps/Data/paper/history/latest-run-summary.json
- PASS: latest public dashboard bundle exists - /home/sjohnsoniii/Projects/sj3labs/data/marketops/dashboard-bundle-public-v0.4.json
- PASS: latest content queue exists - /home/sjohnsoniii/Projects/MarketOps/Data/content/queue/content-queue-v0.1.json
- PASS: latest compliance report exists - /home/sjohnsoniii/Projects/MarketOps/Data/content/compliance/content-compliance-report-v0.1.md
- PASS: latest agent review summary exists - /home/sjohnsoniii/Projects/MarketOps/Data/agent-reviews/latest-agent-review-summary.json
- PASS: latest biweekly digest exists - /home/sjohnsoniii/Projects/MarketOps/Data/agent-reviews/biweekly-review-digest-v0.1.md
- PASS: latest monthly human review brief exists - /home/sjohnsoniii/Projects/MarketOps/Data/agent-reviews/monthly-human-review-brief-v0.1.md
- PASS: latest paper output is paper-only - {"mode":"paper_simulation","paperOnly":true}
- PASS: public dashboard is paper/sample only - {"mode":"paper_simulation","paperOnly":true,"sampleData":true}
- PASS: content queue publishing is disabled - 33 items
- PASS: content queue requires draft review - 33 items
- PASS: agent review cadence is digest-based - {"reviewCadence":"biweekly_digest","humanReviewLoad":"low"}
- PASS: agent proposals do not auto-apply - false
- PASS: public content mentions paper simulation - paper simulation
- PASS: public content mentions fake/sample context - fake/sample context
- PASS: public content includes not financial advice - not financial advice
- PASS: public content avoids risky claims - no risky hits

## Checks Failed

None.

## Output Locations

- Paper history: Data/paper/history/latest-run-summary.json
- Public dashboard bundle: sj3labs/data/marketops/dashboard-bundle-public-v0.4.json
- Content queue: Data/content/queue/content-queue-v0.1.json
- Compliance report: Data/content/compliance/content-compliance-report-v0.1.md
- Agent review summary: Data/agent-reviews/latest-agent-review-summary.json
- Biweekly digest: Data/agent-reviews/biweekly-review-digest-v0.1.md
- Monthly human review brief: Data/agent-reviews/monthly-human-review-brief-v0.1.md

## Install Commands For Later

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\sjohn\Desktop\Projects\MarketOps\Scripts\install-marketops-paper-task-v0.1.ps1"
powershell -ExecutionPolicy Bypass -File "C:\Users\sjohn\Desktop\Projects\MarketOps\Scripts\install-marketops-office-task-v0.1.ps1"
```

## Removal Commands

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\sjohn\Desktop\Projects\MarketOps\Scripts\remove-marketops-paper-task-v0.1.ps1"
powershell -ExecutionPolicy Bypass -File "C:\Users\sjohn\Desktop\Projects\MarketOps\Scripts\remove-marketops-office-task-v0.1.ps1"
```

## Risks / Warnings / Cleanup Needed

- No blocking readiness issues found. Installed tasks match approved MarketOps automation scope when present.
- Automation remains local, paper-only, fake/sample-money, and review-gated.

## Confirmations

- This checker did not install scheduled tasks.
- No live, broker, API-key, SMS, email, payment, social posting, or deploy behavior happened.
- Agent proposals remain human-review required and do not auto-apply.

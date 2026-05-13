# MarketOps Scheduled Observation v0.1

Generated at: 2026-05-07T22:55:56.2999875-04:00

## Observation Verdict

SCHEDULED_TASKS_FIRING

## Scheduled Task Status

### Paper Runner

- Task name: MarketOps Paper Runner v0.1
- State: Ready
- Last run time: 05/07/2026 22:30:30
- Last task result: 0
- Next run time: 05/07/2026 23:00:00
- Schedule: every 30 minutes
- Trigger interval: PT30M
- Action: powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\sjohn\Desktop\Projects\MarketOps\Scripts\run-marketops-paper-full-v0.1.ps1"

### Office / Content / Review Runner

- Task name: MarketOps Autonomous Office v0.1
- State: Ready
- Last run time: 05/07/2026 19:30:30
- Last task result: 0
- Next run time: 05/08/2026 19:30:30
- Schedule: daily at 7:30 PM
- Days interval: 1
- Action: powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\sjohn\Desktop\Projects\MarketOps\Scripts\run-marketops-office-full-v0.1.ps1"

## Fresh Log Evidence

- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\logs\marketops-paper-full-20260507-223001.log (LastWriteTime: 05/07/2026 22:30:02, Length: 2085)
- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\logs\marketops-paper-full-20260507-200000.log (LastWriteTime: 05/07/2026 20:00:01, Length: 2085)
- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\logs\marketops-office-full-20260507-193000.log (LastWriteTime: 05/07/2026 19:30:03, Length: 7352)
- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\logs\marketops-paper-full-20260507-193000.log (LastWriteTime: 05/07/2026 19:30:02, Length: 2085)
- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\logs\marketops-paper-full-20260507-190000.log (LastWriteTime: 05/07/2026 19:00:01, Length: 2085)
- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\logs\marketops-paper-full-20260507-183000.log (LastWriteTime: 05/07/2026 18:30:01, Length: 2085)
- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\logs\marketops-office-full-20260507-180703.log (LastWriteTime: 05/07/2026 18:07:06, Length: 3675)
- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\logs\marketops-paper-full-20260507-180656.log (LastWriteTime: 05/07/2026 18:06:57, Length: 2085)

## Fresh Paper Output Evidence

Latest paper run summary:

- runId: paper-20260508-023002633Z
- generatedAt: 05/08/2026 02:30:02
- mode: paper_simulation
- paperOnly: True
- sampleData: True
- qaStatus: PASS

Recent paper files:

- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\paper\history\latest-run-summary.json (LastWriteTime: 05/07/2026 22:30:02)
- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\paper\history\runs\paper-20260508-023002633Z.json (LastWriteTime: 05/07/2026 22:30:02)
- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\paper\history\run-history.json (LastWriteTime: 05/07/2026 22:30:02)
- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\paper\history\runs\paper-20260508-022451649Z.json (LastWriteTime: 05/07/2026 22:24:51)
- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\paper\history\runs\paper-20260508-022445991Z.json (LastWriteTime: 05/07/2026 22:24:46)

## Office / Agent Output Evidence

Latest agent summary:

- generatedAt: 05/08/2026 02:25:00
- reviewsGenerated: 11
- proposalCount: 16
- reviewCadence: biweekly_digest
- humanReviewLoad: low
- autoApplyAllowed: False

Recent office/review files:

- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\content\queue\latest-office-run-summary.json (LastWriteTime: 05/07/2026 22:55:12)
- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\content\queue\content-queue-v0.1.json (LastWriteTime: 05/07/2026 22:55:12)
- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\agent-reviews\monthly-human-review-brief-v0.1.md (LastWriteTime: 05/07/2026 22:25:01)
- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\agent-reviews\improvement-backlog-v0.1.md (LastWriteTime: 05/07/2026 22:25:01)
- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\agent-reviews\latest-agent-review-summary.json (LastWriteTime: 05/07/2026 22:25:01)
- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\agent-reviews\biweekly-review-digest-v0.1.md (LastWriteTime: 05/07/2026 22:25:01)
- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\agent-reviews\compliance-desk-review-v0.1.md (LastWriteTime: 05/07/2026 22:25:01)
- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\agent-reviews\avatar-desk-review-v0.1.md (LastWriteTime: 05/07/2026 22:25:01)

## QA Results

- automation:check: PASS, READY_TO_INSTALL_TASKS, 80 checks, 0 failed, install state installed_approved
- office:qa: PASS, 37 checks, 0 failed
- agents:qa: PASS, 58 checks, 0 failed, 16 proposals

## Warnings

- No blocking warnings.
- Paper scheduled automation has produced a fresh 10:30 PM run.
- Office scheduled automation last ran successfully at 7:30 PM; later validation runs refreshed agent outputs after that cycle.
- Continue observing the next office cycle at 7:30 PM to verify another fully scheduled office output refresh.

## Confirmations

- No live trading, broker connection, API key, SMS, email, payment, subscription, social posting, push, commit, or deploy behavior was added.
- Content remains review-gated.
- Agent proposals remain review-gated and autoApplyAllowed remains false.

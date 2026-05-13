# MarketOps Current Status Latest

Generated: 2026-05-08T21:48:13.2510158-04:00

## Current Mode

- Mode: paper_simulation
- Data source: alpaca_iex
- Market data mode: real_market_data_for_paper_simulation
- Paper only: True
- Live trading enabled: False
- Publish allowed risk found: False

## Refresh State

- Last market refresh: 2026-05-09T01:47:25.243Z
- Latest Alpaca bar timestamp: 2026-05-08T13:47:00Z
- Last dashboard refresh: 2026-05-09T01:47:25.602Z
- Generated at: 2026-05-09T01:47:25.602Z
- Next expected refresh: 2026-05-09T02:17:25.602Z
- Refresh cadence minutes: 30
- Bars loaded: 100
- Quotes loaded: 5

## Paper Snapshot

- Starting balance: 10000
- Ending equity: 10000
- Paper P/L: 0
- Paper return percent: 0
- Signals generated: 0
- Risk approved: 0
- Risk blocked: 8
- Fake paper trades: 0
- No-trade reason: Risk Desk did not approve any candidate for fake paper execution in this refresh.

## Admin Console

- Local URL: http://localhost:4317
- Listening: True
- Owning process: 14004
- HTTP status: 200

## Scheduled Tasks

- MarketOps Paper Runner v0.1: exists=True, state=Ready, last=05/08/2026 21:30:30, next=05/08/2026 22:00:00, result=0
  - Trigger: Enabled=True; Start=2026-05-07T00:00:00-04:00; Interval=PT30M; Days=
  - Action: powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\sjohn\Desktop\Projects\MarketOps\Scripts\run-marketops-paper-full-v0.1.ps1"
- MarketOps Autonomous Office v0.1: exists=True, state=Ready, last=05/08/2026 20:29:29, next=05/09/2026 19:30:30, result=0
  - Trigger: Enabled=True; Start=2026-05-07T19:30:00-04:00; Interval=; Days=1
  - Action: powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\sjohn\Desktop\Projects\MarketOps\Scripts\run-marketops-office-full-v0.1.ps1"
- Duplicate task groups: 0

## Latest QA Results

- PASS: npm run admin:qa (exit 0)
- PASS: npm run dashboard:qa (exit 0)
- PASS: npm run automation:check (exit 0)

## Content Queue

- Queue items: 33
- Queue publishAllowed: False
- Review decisions: 3
- Approved content items: 0
- Approved content publishAllowed: False

## sj3labs Git Status

```text
 M data/marketops/dashboard-bundle-public-v0.4.json
 M marketops/dashboard/index.html
 M marketops/marketops.css
```

## Latest Logs

- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\logs\marketops-paper-refresh-v0.2-20260508-214724.log :: 05/08/2026 21:47:28
- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\logs\marketops-paper-refresh-v0.2-20260508-214706.log :: 05/08/2026 21:47:11
- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\logs\marketops-paper-refresh-v0.2-20260508-213300.log :: 05/08/2026 21:33:05
- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\logs\marketops-paper-full-20260508-213001.log :: 05/08/2026 21:30:05
- C:\Users\sjohn\Desktop\Projects\MarketOps\Data\logs\marketops-paper-refresh-v0.2-20260508-213002.log :: 05/08/2026 21:30:05

## Known Blockers

- none detected

## Next Recommended Action

- Run `npm run full:qa`, then `powershell -ExecutionPolicy Bypass -File "C:\Users\sjohn\Desktop\Projects\MarketOps\Scripts\verify-marketops-dashboard-movement-v0.1.ps1"` if dashboard movement needs proof.

## Confirmations

- This script does not commit, push, deploy, post, email, send SMS, place orders, or call external social/broker APIs.
- It reads local state only and writes local reports.

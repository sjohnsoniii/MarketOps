# Common Supercruise Rules

Operate in MarketOps Supercruise Mode.

Approved write scope:

`C:\Users\sjohn\Desktop\Projects\MarketOps`

Approved read scope:

`C:\Users\sjohn\Desktop\Projects\MarketOps`

`C:\Users\sjohn\Desktop\Projects\sj3labs`

Do not ask permission for justified local-only work inside MarketOps.

Never:
- commit
- push
- deploy
- publish
- transmit externally
- call external APIs
- fetch live market data
- connect brokers
- live trade
- send SMS/email
- post social content
- add payments/subscriptions
- add secrets/tokens/API keys
- auto-apply review-gated agent improvements
- access unrelated folders
- scan the whole computer
- destructive cleanup

All outputs must stay local. Route human decisions to approval queue/admin review.

# Run 12 — Approval Queue and Routing

## Goal

Create a reusable approval queue/routing system so Supercruise can keep going without asking the user every time judgment is needed.

## Duration

60-90 minutes.

## Tasks

1. Create source folder if useful:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Source\marketops-core\src\approvals`

2. Add utilities:
- create approval item
- validate approval queue
- write latest queue
- write timestamped queue
- summarize pending items
- generate admin console bundle

3. Add npm scripts:
- `approvals:generate`
- `approvals:qa`

4. Route existing review-worthy outputs into queue where practical:
- social drafts
- signal previews
- agent improvement proposals
- QA warnings
- report summaries

5. Do not auto-approve anything.

## Required Paths

`C:\Users\sjohn\Desktop\Projects\MarketOps\Data\approvals\approval-queue-latest.json`

`C:\Users\sjohn\Desktop\Projects\MarketOps\Reports\Approvals\marketops-approval-queue-v0.1.md`

## Required Approval Actions

- YES_APPROVE
- NO_REJECT
- NEEDS_EDIT
- HOLD
- ESCALATE

## QA

Fail if:
- auto approval enabled
- external send enabled
- missing safety labels
- item lacks approvalQuestion
- yesEffect implies automatic posting/trading/sending

## Validation

Run:
- `npm run approvals:generate`
- `npm run approvals:qa`
- `npm run office:qa`
- `npm run agents:qa`
- `npm run automation:check`

## Report Back

Return files changed, commands run, queue path, item counts, QA results.

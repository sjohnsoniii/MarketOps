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

# Run 15 — Logging, Reporting, and Email Prep

## Goal

Improve Supercruise reporting and create local email-draft/escalation prep without sending email.

## Duration

60-90 minutes.

## Tasks

1. Create email draft/template docs:
`C:\Users\sjohn\Desktop\Projects\MarketOps\Docs\Email`

2. Create local email queue folder:
`C:\Users\sjohn\Desktop\Projects\MarketOps\Data\email-queue`

3. Create reports/escalations folder:
`C:\Users\sjohn\Desktop\Projects\MarketOps\Reports\Escalations`

4. Create draft-only email queue schema:
- autoSendEnabled false
- sendAllowed false
- no SMTP/API credentials

5. Create templates:
- morning summary
- blocked task
- approval needed
- Step 0 complete
- QA failure

6. Create report index:
`C:\Users\sjohn\Desktop\Projects\MarketOps\Reports\marketops-report-index-v0.1.md`

7. Create morning review checklist:
`C:\Users\sjohn\Desktop\Projects\MarketOps\Reports\Overnight\marketops-next-morning-review-checklist-v0.1.md`

8. Add QA if useful:
- `emailprep:qa`
- `reports:index`
- `reports:qa`

## Validation

Run:
- relevant new scripts
- `npm run automation:check`
- `npm run office:qa`
- `npm run agents:qa`

## Required Report

`C:\Users\sjohn\Desktop\Projects\MarketOps\Reports\Overnight\marketops-supercruise-reporting-emailprep-v0.1.md`

## Report Back

Return files changed, commands run, reports created, email queue status, QA results.

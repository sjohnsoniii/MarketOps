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

# Run 13 — Social Preview Sandbox

## Goal

Create or improve the MarketOps social preview sandbox with IG/X as first priority.

## Duration

60-90 minutes.

## Priority

Phase 1:
- Instagram
- X

Phase 2 future:
- TikTok
- YouTube

Phase 3 deferred:
- LinkedIn
- Facebook

## Tasks

1. Inspect existing social readiness work.
2. Add or improve social preview generation.
3. Generate IG/X draft posts based on safe MarketOps themes:
   - paper simulation milestone
   - public dashboard update
   - fake-money lab transparency
   - risk-first trading research
   - building in public
4. Generate future TT/YT scripts only as drafts if low effort.
5. Route every draft to approval queue.
6. Generate local previews only.
7. Do not post anywhere.

## Suggested Paths

`C:\Users\sjohn\Desktop\Projects\MarketOps\Data\social-previews`

`C:\Users\sjohn\Desktop\Projects\MarketOps\Reports\Social`

`C:\Users\sjohn\Desktop\Projects\MarketOps\Source\marketops-core\src\social`

## Required Safety

All social previews must avoid:
- buy now
- sell now
- copy this trade
- guaranteed results
- real-money claims
- live trading implication
- subscriber execution claims

## Suggested npm Scripts

- `social:preview`
- `social:qa`

## Validation

Run:
- `npm run social:preview`
- `npm run social:qa`
- `npm run approvals:qa` if exists
- `npm run office:qa`
- `npm run automation:check`

## Required Report

`C:\Users\sjohn\Desktop\Projects\MarketOps\Reports\Social\marketops-social-preview-sandbox-v0.1.md`

## Report Back

Return files changed, commands run, drafts created, approval items created, QA results.

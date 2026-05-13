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

# Run 17 — Supercruise Low-Power Continuous 4H

## Goal

Continue local-only Step 0 completion work for up to approximately 4 hours.

## Mode

Low-power.
Low-token.
Bounded.
No external sending.
No production.

## Strategy

1. Start by reading:
   - master dossier
   - Step 0 definition of done
   - latest gap report
   - latest QA baseline

2. Work through missing Step 0 items in priority order.

3. Prefer:
   - small local fixes
   - docs
   - reports
   - QA
   - admin/approval/social/signal routing
   - deterministic utilities
   - report index
   - morning summary

4. Avoid:
   - giant rewrites
   - repeated heavy loops
   - CPU-heavy indefinite work
   - anything external

## Required Report

Create/update:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Reports\Overnight\marketops-supercruise-4h-run-v0.1.md`

Update it periodically if possible.

## Required End State

At the end, write:

- completed
- partial
- blocked
- files changed
- commands run
- QA results
- approval items created
- admin console status
- social preview status
- signal preview status
- next exact run
- final hard-boundary confirmations

## Final Confirmations

Must confirm:

- no commit/push/deploy
- no external API/network/social/broker/payment/email/SMS behavior
- no data/signals transmitted externally
- no credentials/secrets added
- all review decisions routed to approval/admin queue

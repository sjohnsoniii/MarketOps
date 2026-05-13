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

# Run 18 — Final Step 0 Promotion Gate

## Goal

Determine whether MarketOps Step 0 is complete and ready for Step 1 fake-money real-time data setup.

## Duration

45-60 minutes.

## Required Inputs

Read:

- Step 0 definition of done
- latest gap report
- latest QA baseline
- latest automation report
- latest admin console report
- latest approval queue report
- latest social preview report
- latest signal sandbox report
- latest reporting/emailprep report
- report index
- morning checklist

## Required Checks

Confirm:

1. scheduled automation installed and observed
2. QA baseline passes
3. admin review interface exists
4. approval queue exists
5. social previews route to approval
6. signal previews route to approval
7. no auto-post/send/trade/deploy behavior
8. email is draft/prep only
9. report index exists
10. final next-step plan for Step 1 exists

## Required Final Report

Create:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Reports\Step0\marketops-step0-final-promotion-report-v0.1.md`

Verdict must be one of:

- `STEP0_COMPLETE_READY_FOR_STEP1_FAKE_REALTIME_DATA_SETUP`
- `STEP0_PARTIAL_NOT_READY`
- `STEP0_BLOCKED`

If not complete, list exact missing items.

If complete, include Step 1 setup requirements:

- choose data provider
- create secrets storage approach
- define symbol universe
- define polling/caching
- define market-hours behavior
- define public-display restrictions
- define fake-money-only guarantee
- define QA gates

## Validation

Run safe QA scripts available.

## Report Back

Return:
- final verdict
- missing items if any
- files changed
- commands run
- QA results
- report path
- Step 1 recommended first run
- hard-boundary confirmations

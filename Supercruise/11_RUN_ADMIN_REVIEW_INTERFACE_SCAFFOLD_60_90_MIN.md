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

# Run 11 — Admin Review Interface Scaffold

## Goal

Create a simple local admin review interface for reviewing MarketOps outputs.

## Duration

60-90 minutes.

## Tasks

1. Create local admin folder:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Admin\review-console`

2. Create static files:

- `index.html`
- `review-console.css`
- `review-console.js`

3. Create sample/local review bundle if needed:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Data\approvals\review-console-bundle-latest.json`

4. Create approval queue if missing:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Data\approvals\approval-queue-latest.json`

5. Support review item types:
- social_post
- x_post
- instagram_post
- short_video_script
- still_image_prompt
- avatar_script
- signal_preview
- report_summary
- blog_draft
- agent_improvement_proposal
- qa_warning
- system_blocker

6. Support statuses:
- PENDING_REVIEW
- YES_APPROVE
- NO_REJECT
- NEEDS_EDIT
- HOLD
- ESCALATE

7. The interface must not post, send, email, trade, or call APIs.

8. Add npm script if useful:
- `admin:build` or `admin:generate`
- `admin:qa`

## QA

Admin QA should verify:

- files exist
- approval queue exists
- no external API calls
- no posting code
- no email sending
- no secrets
- all items have safety labels
- all items require human review

## Required Report

Create:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Reports\Admin\marketops-admin-review-console-v0.1.md`

## Report Back

Return files changed, commands run, QA results, admin console path, and warnings.

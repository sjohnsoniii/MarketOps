# Supercruise Admin Review Interface Spec v0.1

## Purpose

Create a simple local admin interface for reviewing MarketOps sandbox outputs.

This interface is for human review only.

It must not:

- post content
- send signals
- send emails
- call APIs
- commit/push/deploy
- connect to brokers
- execute trades

## Suggested Location

`C:\Users\sjohn\Desktop\Projects\MarketOps\Admin\review-console\index.html`

Optional supporting files:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Admin\review-console\review-console.css`

`C:\Users\sjohn\Desktop\Projects\MarketOps\Admin\review-console\review-console.js`

## Data Sources

Read local generated JSON files only.

Suggested queue:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Data\approvals\approval-queue-latest.json`

Suggested mirrored static review bundle:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Data\approvals\review-console-bundle-latest.json`

## Review Item Types

- `social_post`
- `x_post`
- `instagram_post`
- `short_video_script`
- `still_image_prompt`
- `avatar_script`
- `signal_preview`
- `report_summary`
- `blog_draft`
- `agent_improvement_proposal`
- `qa_warning`
- `system_blocker`

## Required Review Statuses

- `PENDING_REVIEW`
- `YES_APPROVE`
- `NO_REJECT`
- `NEEDS_EDIT`
- `HOLD`
- `ESCALATE`

For Step 0, the admin interface may be read-only/static and instruct the user how to record decisions in the local approval JSON.

Do not implement external posting.

## Required Fields Per Item

- `id`
- `createdAt`
- `type`
- `title`
- `summary`
- `sourcePath`
- `previewPath`
- `riskLevel`
- `safetyLabels`
- `recommendedAction`
- `status`
- `reviewNotes`
- `approvalQuestion`
- `yesEffect`
- `noEffect`
- `needsEditEffect`

## Safety Labels

Possible labels:

- `paper_simulation`
- `fake_money`
- `not_financial_advice`
- `sandbox_only`
- `human_review_required`
- `no_external_send`
- `no_live_execution`
- `draft_only`
- `not_public_yet`

## Layout

Minimum sections:

1. Header
   - MarketOps Supercruise Admin Review
   - local-only warning
   - current generated timestamp

2. Status Summary
   - total items
   - pending
   - approved
   - rejected
   - needs edit
   - escalated

3. Filters
   - type
   - risk
   - status
   - platform

4. Review Cards
   - title
   - type
   - summary
   - preview text
   - source path
   - safety labels
   - approval question
   - suggested action

5. Instructions
   - no posting from this console
   - decisions are local review guidance only
   - user must manually approve/post later

## QA Requirements

Admin QA should confirm:

- admin interface exists
- approval queue exists
- no external URLs are required to operate
- no posting code exists
- no API calls exist
- no credentials exist
- all items require human review
- safety labels are present

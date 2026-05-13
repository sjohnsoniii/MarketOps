# MarketOps Admin Review Console v0.1

Generated: 2026-05-08T18:27:45.881Z

## Output

- Console: Admin\review-console\index.html
- CSS: Admin\review-console\review-console.css
- JS: Admin\review-console\review-console.js
- Bundle: Data\approvals\review-console-bundle-latest.json

## Supported Review Item Types

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

## Supported Statuses

- PENDING_REVIEW
- YES_APPROVE
- NO_REJECT
- NEEDS_EDIT
- HOLD
- ESCALATE

## Operator Status Badges

- draft_only
- approved_for_manual_post
- approved_for_api_later
- rejected
- needs_edit
- hold

## Safety

The console is local-only and static. It does not post, send, email, trade, publish, call APIs, connect brokers, or use external services.

YES approval means later manual/gated use only. It never means post now, send now, email now, trade now, signal now, publish now, or deploy now.

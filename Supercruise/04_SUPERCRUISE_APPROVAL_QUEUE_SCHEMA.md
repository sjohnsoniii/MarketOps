# Supercruise Approval Queue Schema v0.1

## Purpose

The approval queue turns all human-decision items into simple review cards.

The goal is to let Supercruise continue working without stopping for questions.

Instead of asking:

“Should I publish this?”

Supercruise writes a review item:

“Approve this X post? YES / NO / NEEDS EDIT.”

## Suggested Path

`C:\Users\sjohn\Desktop\Projects\MarketOps\Data\approvals\approval-queue-latest.json`

Timestamped path:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Data\approvals\approval-queue-YYYYMMDD-HHMMSS.json`

## Root Object

```json
{
  "schemaVersion": "0.1",
  "mode": "supercruise_local_only",
  "generatedAt": "ISO_TIMESTAMP",
  "externalSendingEnabled": false,
  "autoApprovalEnabled": false,
  "items": []
}
```

## Item Schema

```json
{
  "id": "approval-YYYYMMDD-HHMMSS-001",
  "createdAt": "ISO_TIMESTAMP",
  "type": "x_post",
  "platform": "x",
  "title": "Draft X post about paper simulation milestone",
  "summary": "Short public-safe MarketOps update.",
  "sourcePath": "local path",
  "previewPath": "local path",
  "riskLevel": "low",
  "safetyLabels": [
    "paper_simulation",
    "fake_money",
    "not_financial_advice",
    "draft_only",
    "human_review_required"
  ],
  "approvalQuestion": "Approve this draft for manual posting later?",
  "recommendedAction": "NEEDS_REVIEW",
  "status": "PENDING_REVIEW",
  "yesEffect": "Mark as approved_for_manual_posting only. Does not post automatically.",
  "noEffect": "Mark rejected and archive locally.",
  "needsEditEffect": "Route back to content/social desk for revision.",
  "reviewNotes": "",
  "blockedReason": null
}
```

## Required Safety Rule

Even `YES_APPROVE` must not auto-post during Step 0.

YES means:

- approved for later manual use
- approved for inclusion in a public-safe export
- approved for next gated workflow

It does not mean:

- post now
- email now
- signal now
- deploy now
- trade now

## QA Rules

Approval QA should fail if:

- externalSendingEnabled is true
- autoApprovalEnabled is true
- any item lacks safetyLabels
- any signal item contains buy/sell/copy language
- any social item claims real-money results
- any item has missing source/preview path
- any status is auto-approved without human review

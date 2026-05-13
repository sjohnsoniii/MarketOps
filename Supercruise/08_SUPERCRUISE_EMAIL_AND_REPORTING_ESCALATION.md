# Supercruise Email and Reporting Escalation v0.1

## Purpose

The user wants Supercruise to compile status documents and/or send emails when things are needed.

For Step 0, do not send emails automatically.

Instead:

- create local email templates
- create local email queue files
- create morning summary reports
- create human-needed escalation items
- prepare future email integration as a later approval-gated feature

## Why No Auto Email Yet

Email sending requires:

- verified sender/recipient setup
- authentication details
- secrets/tokens
- privacy review
- sending limits
- content rules

That belongs in a later gated integration.

## Suggested Paths

Email queue:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Data\email-queue`

Email templates:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Docs\Email`

Escalation reports:

`C:\Users\sjohn\Desktop\Projects\MarketOps\Reports\Escalations`

## Email Queue Schema

```json
{
  "schemaVersion": "0.1",
  "mode": "local_email_draft_only",
  "autoSendEnabled": false,
  "generatedAt": "ISO_TIMESTAMP",
  "drafts": []
}
```

## Draft Item

```json
{
  "id": "email-draft-001",
  "type": "morning_summary",
  "subject": "MarketOps Supercruise Morning Summary",
  "bodyPath": "local path to markdown body",
  "status": "DRAFT_ONLY",
  "sendAllowed": false,
  "reason": "Step 0 does not enable email sending."
}
```

## Escalation Types

- `permission_block`
- `qa_failure`
- `thermal_warning`
- `missing_credential`
- `external_integration_needed`
- `human_approval_needed`
- `step0_promotion_ready`

## QA Rules

Fail if:

- autoSendEnabled is true
- sendAllowed is true
- SMTP/API/email credentials appear
- external email code is added
- drafts include secrets

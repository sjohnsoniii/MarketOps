# MarketOps Supercruise Morning Review Checklist

## First Checks

1. Check whether Codex completed or stalled.
2. Read the newest report in:
   `C:\Users\sjohn\Desktop\Projects\MarketOps\Reports\Overnight`
3. Read:
   `C:\Users\sjohn\Desktop\Projects\MarketOps\Reports\Step0\marketops-step0-gap-report-v0.1.md`
4. Read:
   `C:\Users\sjohn\Desktop\Projects\MarketOps\Reports\Step0\marketops-step0-qa-baseline-v0.1.md`
5. Read:
   `C:\Users\sjohn\Desktop\Projects\MarketOps\Reports\Step0\marketops-step0-final-promotion-report-v0.1.md`
   if it exists.

## Scheduled Task Checks

Check:

- newest paper runner logs
- newest office runner logs
- scheduled task last run times
- automation:check result

## Admin/Approval Checks

Open/check:

- `C:\Users\sjohn\Desktop\Projects\MarketOps\Admin\review-console\index.html`
- `C:\Users\sjohn\Desktop\Projects\MarketOps\Data\approvals\approval-queue-latest.json`

Review counts:

- pending approvals
- social drafts
- signal previews
- QA warnings
- blockers

## Social Checks

Confirm:

- IG/X drafts exist
- TT/YT are future/deferred unless explicitly generated as scripts only
- LinkedIn/Facebook remain deferred
- no social auto-posting enabled

## Signal Checks

Confirm:

- signal previews are sandbox-only
- no external alerting
- no buy/sell/copy language

## Step 0 Final Verdict

Look for:

`STEP0_COMPLETE_READY_FOR_STEP1_FAKE_REALTIME_DATA_SETUP`

If present, next major move is Step 1 planning:

Fake-money paper trading against real-time stock data.

Do not start Step 1 until secrets/data provider plan is explicit.

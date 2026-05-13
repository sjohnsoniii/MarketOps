# MarketOps Agent Review / Self-Improvement Layer v0.1

MarketOps Agent Review / Self-Improvement Layer v0.1 adds local reflection after the paper office runs. Each desk writes a detailed review, proposes improvements, and defers routine ideas into a biweekly digest.

This layer does not change production behavior. It does not publish. It does not connect external services. It does not alter Risk Desk rules. It does not promote any proposal without human review.

## Generated Reviews

Reviews live under `Data\agent-reviews`:

- `coordinator-review-v0.1.md`
- `market-data-review-v0.1.md`
- `signal-review-v0.1.md`
- `risk-desk-review-v0.1.md`
- `paper-trader-review-v0.1.md`
- `performance-review-v0.1.md`
- `staff-writer-review-v0.1.md`
- `growth-desk-review-v0.1.md`
- `video-desk-review-v0.1.md`
- `avatar-desk-review-v0.1.md`
- `compliance-desk-review-v0.1.md`

Rollups:

- `latest-agent-review-summary.json`
- `improvement-backlog-v0.1.md`
- `monthly-human-review-brief-v0.1.md`
- `biweekly-review-digest-v0.1.md`

Internal observation history is appended under `Data\agent-reviews\archive`.

## Cadence

The review cadence is `biweekly_digest`.

Daily or repeated runs may update latest summaries and internal observation history, but normal items are deferred to the next digest. Human-facing review should stay low-burden unless there is a critical compliance issue, critical safety/risk issue, or system failure.

Priority levels:

- `routine`
- `review_next_digest`
- `urgent_human_review`

Routine proposals default to `review_next_digest`.

## What Agents May Do

- Reflect
- Critique
- Propose improvements
- Recommend paper-only experiments
- Request human review
- Suggest QA additions

## What Agents May Not Do

- Enable real-money behavior
- Connect brokers, exchanges, platform APIs, or secrets
- Publish content
- Send messages
- Add payments
- Alter Risk Desk rules
- Change public claims
- Bypass QA
- Auto-apply proposals

Every review and proposal must include:

```text
humanReviewRequired: true
autoApplyAllowed: false
```

## Promotion Path

Ideas must move through this path:

```text
idea -> experiment -> paper test -> QA -> human review -> approved change
```

## Commands

Run from `Source\marketops-core`:

```powershell
npm run agents:review
npm run agents:qa
```

`npm run office:run` now runs the existing paper and office sequence, then generates agent reviews and runs agent QA.

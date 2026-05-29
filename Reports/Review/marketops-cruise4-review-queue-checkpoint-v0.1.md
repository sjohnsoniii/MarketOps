# Cruise 4: Private Review Queue Data Layer

**Date:** 2026-05-19  
**Status:** Data layer built. No UI. No public exposure. No auto-apply.

---

## Summary

Created the formal private review queue data layer for bot/entity feedback, improvement proposals, and admin review workflow. Supports Risk Desk, trading bots, dashboard QA, content desk, and any future entity. All data stored in private internal paths only.

**No active rules were changed.**  
**No proposals were auto-applied.**  
**Nothing was published publicly.**  
**No admin UI was built.**

---

## New Source Files

| File | Purpose |
|------|---------|
| `src/review/reviewQueue.js` | Core queue module: schema validation, CRUD (add/get/approve/reject/requestRevision), event logging, import, list/sort, persistent storage |
| `src/review/runReviewQueueImport.js` | Imports proposals from Risk Desk learning JSON (`risk-desk-learning-v0.1.json`) into review queue as pending_review |
| `src/review/runReviewQueueAction.js` | CLI tool for approve, reject, revise (try_again), and list operations with full actor tracking |
| `src/review/runReviewQueueQa.js` | QA: 96 structural, functional, and safety checks |

## New npm Scripts

| Script | Command |
|--------|---------|
| `review:import` | `node src/review/runReviewQueueImport.js` |
| `review:list` | `node src/review/runReviewQueueAction.js list` |
| `review:approve` | `node src/review/runReviewQueueAction.js approve` |
| `review:reject` | `node src/review/runReviewQueueAction.js reject` |
| `review:revise` | `node src/review/runReviewQueueAction.js revise` |
| `review:qa` | `node src/review/runReviewQueueQa.js` |

## Data Paths (private, not public)

| Artifact | Path |
|----------|------|
| Queue JSON | `Data/review/review-queue-v0.1.json` |
| Events JSON | `Data/review/review-events-v0.1.json` |
| Summary Report | `Reports/Review/marketops-review-queue-v0.1.md` |
| QA Report | `Reports/Review/marketops-review-queue-qa-v0.1.md` |

---

## Imported Proposals

**Count:** 4 (from Risk Desk learning records)

| ID | Title | Entity | Type | Status |
|----|-------|--------|------|--------|
| prop-risk-001 | Risk Desk learning record system is operational | Risk Desk | observation_only | pending_review |
| prop-risk-002 | Consider lowering confidence threshold | Risk Desk | threshold_adjustment | needs_revision |
| rec-risk-002 | Review rejection criteria that may have missed winners | Risk Desk | threshold_adjustment | rejected_by_admin |
| rec-risk-003 | Continue shadow tracking for comprehensive learning | Risk Desk | threshold_adjustment | approved_by_admin |

**Current Pending:** 1 proposal awaiting admin review

---

## Action Command Examples

```bash
# List all proposals
npm run review:list

# Approve a proposal (does NOT apply changes)
node src/review/runReviewQueueAction.js approve \
  --proposalId PROP-001 --actorId sam --actorName Sam \
  --note "Looks good"

# Reject a proposal
node src/review/runReviewQueueAction.js reject \
  --proposalId PROP-001 --actorId sam --actorName Sam \
  --note "Need more evidence"

# Request revision
node src/review/runReviewQueueAction.js revise \
  --proposalId PROP-001 --actorId sam --actorName Sam \
  --note "Add shadow trade history"

# Re-import (skips duplicates)
npm run review:import
```

---

## QA Commands and Results

| Command | Checks | Result |
|---------|--------|--------|
| `npm run review:import` | 4 imported, 0 duplicates | PASS |
| `npm run review:qa` | 96/96 | PASS |
| `npm run risk:learning:qa` | 222/222 | PASS |
| `npm run dashboard:data:qa` | 522/522 | PASS |
| `npm run qa:full` | 71/71 | PASS |

---

## Pre-existing Dirty Files Not Touched

All ~54 pre-existing dirty data/report files remain untouched.

### Source/config files that should be committed later
- `src/review/reviewQueue.js`
- `src/review/runReviewQueueImport.js`
- `src/review/runReviewQueueAction.js`
- `src/review/runReviewQueueQa.js`
- `package.json` (npm scripts added)

### Generated files that should remain local/report-only
- `Data/review/review-queue-v0.1.json`
- `Data/review/review-events-v0.1.json`
- `Reports/Review/marketops-review-queue-v0.1.md`
- `Reports/Review/marketops-review-queue-qa-v0.1.md`

---

## Design Decisions

- **Reusable beyond MarketOps:** The queue module uses generic entity/action patterns and does not hardcode MarketOps-specific logic. All valid statuses, proposal types, and action names are params.
- **Admin model:** Supports multi-admin via `actorId`/`actorName`/`actorRole` on every action. No single-user hardcoding.
- **Immutable audit trail:** Every status transition creates an event with previous/new status, actor, timestamp, and note. Events are never modified.
- **Duplicate protection:** `importProposals` checks existing proposalId before importing. Duplicates are skipped with count.
- **Safety:** `autoApply` is always `false`. Approve/reject/revise only change status and log events — they never modify active rules.

---

## Next Recommended Cruise (Cruise 5)

1. **Admin review UI:** Build the private admin page that reads from `Data/review/review-queue-v0.1.json` and provides approve/reject/revise buttons.
2. **Revised proposal workflow:** When a proposal is revised, the entity re-submits with updated evidence and the status returns to `pending_review`.
3. **Cross-entity proposals:** Extend import to support proposals from trading bots, dashboard QA, content desk, and office agents.
4. **Applied-to-sandbox workflow:** After admin approval, allow proposals to be applied to paper sandbox and tracked through QA → promote.

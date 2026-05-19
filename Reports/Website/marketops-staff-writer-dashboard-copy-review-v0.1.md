# Staff Writer Dashboard Copy Review v0.1

**Reviewer:** Staff Writer (automated copy review)
**Date:** 2026-05-18
**Scope:** MarketOps public dashboard page — copy, labels, tone, readability

---

## Issues Found

### 1. Internal Status Codes Visible to Visitors

| Location | Raw Value | Issue |
|----------|-----------|-------|
| Hero mode display | `paper_simulation` | Raw snake_case shown as page heading text |
| Trial status card — Mode | `paper_simulation` | Raw internal enum visible |
| Trial status — Status | `CONTROLLED DEGRADED`, `FAILED` | All-caps machine-lab style |
| Trial status — Scheduler | `Mon-Fri 10:00, 12:00, 14:00, 15:50 America/New_York` | Raw config string, not visitor-friendly |
| Trade table — Mode column | `paper_simulation` | Row-level label repeated without context |
| Hero badge | `DEGRADED`, `ACTIVE` in all-caps | Shouting, reads like a machine state |

**Severity:** High — Visitors should not see internal enum names.

### 2. Hardcoded Fallback Values in HTML

Performance cards had hardcoded `$10,000.00` and `$9,934.92` as placeholder values. These were static and did not update with the actual data bundle.

**Severity:** Medium — Static fallbacks mislead when they never change.

### 3. Label Hygiene

| Observation | Recommendation |
|-------------|----------------|
| `.metric-label` uses `text-transform: uppercase` + monospace font | Use regular sentence case, reader-friendly font |
| `sample-data badge` chart meta text | Rewrite in plain English, not internal tags |
| Chart status badges read "Paper only" | Clear but redundant per-section; acceptable |
| "What this means" captions are helpful | Keep; add more variety |

**Severity:** Low-Medium — Cosmetic but affects trust.

### 4. Provenance Data on Public Page

The data provenance note was prefixed with "Data provenance:" which sounds internal. Shorten to direct statement.

### 5. No Trade Explanation

When `noTradeReason` is present, it shows as "No New Paper Trades:" with raw internal reason text. The copy is readable but could be friendlier.

---

## Rewritten Copy Recommendations

| Original | Recommended |
|----------|-------------|
| `paper_simulation` | Paper simulation |
| `CONTROLLED DEGRADED` | Controlled degraded |
| `FAILED` | Refresh encountered errors |
| `OK` (status) | Running smoothly |
| `Data provenance: All performance numbers...` | (direct text — remove prefix) |
| `Data source: loading market data status...` | `Paper simulation mode. Market data: ... Paper-only execution: confirmed.` |
| `Public Paper Trial v0.1 // ACTIVE` | `Public Paper Trial v0.1 — Active` |

---

## Applying Changes

All recommended copy changes have been applied to `~/Projects/sj3labs/marketops/dashboard/index.html`:
- Added `displayLabel()`, `displayMode()`, `displayStatus()` mapping functions
- All status enums, mode values, and badges use human-readable labels
- Removed hardcoded static performance values
- Updated provenance display to drop internal prefix
- Trade table "Mode" column shows "Paper simulation" instead of `paper_simulation`

---

## Remaining Copy Notes

- NoTradeReason text is readable but wordy. A future revision could shorten it.
- Chart captions could be reviewed by a human editor for variety.
- The "Dashboard v0.4 // paper-simulation preview" hero badge is accurate but could soften to "Research preview — paper simulation only".

---

*Staff Writer review completed. Safe copy changes applied.*

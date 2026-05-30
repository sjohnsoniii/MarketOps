# MarketOps Equity Reporting Fix — v0.19 Checkpoint

**Date:** 2026-05-30  
**Version:** v0.19  
**Session type:** Data correction + documentation

---

## Summary

Identified and documented a historical equity reporting bug where `endingEquity` and
`totalEquity` in paper trading run summaries reflected cash balance only, excluding
holdings value. The bug is now fixed in the live codebase (paperTradeExecutor.js,
equityBuilder.js). Historical run data has been annotated with a correction note.

---

## The Bug

In 43 of 45 runs in `run-history.json` (all runs prior to 2026-05-30), `totalEquity`
was set equal to `cashBalance`. This meant that while the system held open paper
positions, the reported equity figure excluded the holdings component.

**Worst case example (paper-20260529-020644310Z):**
- Cash: $172.44 | Equity reported: $172.44 | Open positions: 10
- True equity was approximately $172.44 + holdings (unknown, unrecoverable)

**Post-fix example (paper-20260530-141622328Z):**
- Cash: $52.68 | Equity: $1,003.56 | Open positions: 18
- Holdings value: $950.88 — correctly included

---

## Files Created

| File | Purpose |
|------|---------|
| `Data/paper/history/run-history-corrected.json` | Original run-history.json with `equityReportingNote` added to all 43 pre-fix runs |
| `Reports/History/equity-correction-summary.md` | Full technical writeup of the bug, fix, and data impact |
| `Data/public/dashboard-public-safe-latest.json` | Fresh public dashboard bundle with corrected equity, cycle status, last run summary, and equity reporting disclosure |

---

## Current System State (2026-05-30)

| Field | Value |
|-------|-------|
| System status | active |
| Cycle | cycle-20260530-1322 (active) |
| Canonical total equity | $1,003.56 |
| Cash balance | $52.68 |
| Holdings value | $950.88 |
| Open positions | 18 |
| Last run | paper-20260530-141622328Z |
| Last run approved | 73 signals |
| Last run blocked | 77 signals |
| Last run trades | 3 executed |
| Total run history | 45 runs (43 pre-fix, 2 post-fix) |

---

## What Was NOT Changed

- Original `run-history.json` — preserved unmodified
- `paperTradeExecutor.js` and `equityBuilder.js` — not modified this session (bug already fixed per PROJECT-BRAIN.md)
- Any files in `Source/` or `config/`
- No sync, no deploy, no git operations

---

## Data Provenance Note

Historical equity data (pre-2026-05-30) is understated and cannot be perfectly corrected.
The correction note in run-history-corrected.json provides disclosure for any future use
of this data. The current cycle state is accurate.

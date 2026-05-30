# MarketOps Equity Reporting Bug — Correction Summary

**Generated:** 2026-05-30  
**Affects:** run-history.json runs prior to 2026-05-30 (43 of 45 entries)  
**Severity:** Data quality / reporting accuracy — no trading logic or real money impacted

---

## The Bug

In runs prior to 2026-05-30, `endingEquity` (and `totalEquity` in per-run summaries) was
reported as the **cash balance only**. Holdings value was not included in the equity calculation.

This meant that while the system held open paper positions (e.g. 10–20 positions with
meaningful notional value), the reported equity figure drastically understated the true
simulated account value.

### Example of the bug (paper-20260529-020644310Z)
```
cashBalance:  172.44
totalEquity:  172.44   ← wrong: held 10 open positions, holdings excluded
openPositionCount: 10
```

### Example post-fix (paper-20260530-141622328Z)
```
cashBalance:  52.68
totalEquity:  1003.56  ← correct: includes $950.88 holdings value
openPositionCount: 18
```

---

## Root Cause

Two files were responsible:

- **paperTradeExecutor.js** — when recording the run summary, it wrote `totalEquity = cashBalance` without summing in the holdings value.
- **equityBuilder.js** — the equity curve builder read the same misreported field and propagated the error into equity charts and dashboard bundles.

The bug was intermittent: some runs appeared to report small MTM differences (e.g. totalEquity = 316.27 vs cashBalance = 316.41) because a separate code path computed mark-to-market on exit, but the primary equity snapshot field was still cash-only.

The dramatic divergence in 2026-05-30 runs (equity $1003.56 vs cash $52.68) is evidence that the fix is working correctly: the system now includes the full holdings value in the canonical equity figure.

---

## What Was Fixed (2026-05-30)

- `paperTradeExecutor.js`: equity snapshot now sums `cashBalance + holdingsValue`
- `equityBuilder.js`: reads from corrected canonical equity field

The fix is reflected in `Data/paper/cycles/paper-cycle-latest-v0.1.json` via:
- `canonicalCashBalance`: 52.68
- `canonicalHoldingsValue`: 950.88
- `canonicalTotalEquity`: 1003.56

---

## What the Corrected Data Shows

| Metric | Value |
|--------|-------|
| Total runs in history | 45 |
| Runs affected by bug (pre-2026-05-30) | 43 |
| Runs with corrected reporting (2026-05-30+) | 2 |
| Current canonical equity (corrected) | $1,003.56 |
| Current cash balance | $52.68 |
| Current holdings value | $950.88 |
| Open positions | 18 |

### What We Cannot Reconstruct
Per-run true equity for the 43 affected runs cannot be perfectly reconstructed because
individual position valuations at each run timestamp are not stored. The cash balance fields
are accurate; only the holdings component is missing.

---

## Corrected File

`Data/paper/history/run-history-corrected.json` — identical to run-history.json but with
`equityReportingNote` added to each pre-2026-05-30 run entry:

> "endingEquity prior to 2026-05-30 reflects cash balance only due to reporting bug.
> Actual equity was higher while positions were open. Bug fixed in
> paperTradeExecutor.js and equityBuilder.js on 2026-05-30."

The original `run-history.json` is not modified.

---

## Impact Assessment

- **No real money involved** — paper simulation only
- **No trading decisions impacted** — the live trading engine uses cycle state, not run history
- **Dashboard bundles affected** — historical equity curve charts will show understated values for pre-2026-05-30 periods
- **Current state is correct** — canonical equity ($1,003.56) is accurate as of the fix date

---

## Note on the Clean-Start Baseline

The `clean-start-v0.7` entry (2026-05-20, $1,000, 0 open positions) has the equity note
attached but was not actually affected — with zero positions, cash == equity is correct.
The note is applied to all pre-fix entries for consistency.

# MarketOps — Trade Enablement Cruise — IMPLEMENTATION PLAN (Step 0)

Read-only plan. **Nothing edited yet.** Awaiting Sam's approval before Phase 1.
Prepared 2026-06-03. Sources read: `TRADER-LOGIC-REVIEW.md`, `PROJECT-BRAIN.md`,
`MARKETOPS_AUDIT.md`, plus the live code/data cited below.

## Hard constraints I am operating under
- **No push to sj3labs main/prod by any path.** Publish env vars stay unset — I will not re-export
  `MARKETOPS_ALLOW_PUBLIC_SITE_SYNC` / `MARKETOPS_ALLOW_DATA_ONLY_GIT_PUBLISH`, and I will not invoke
  `public:sync`, `paper:refresh-site`, or the scheduler runner.
- **No commit to the MarketOps repo.** Yours to approve.
- **Every edited file backed up `.bak.20260603`** before the edit (new files need no backup).
- **Cite `file:line` for every change.**
- **Reuse Phase-A safety machinery:** new behavior that could break a run is wrapped DEGRADABLE
  (failure logs + falls back to prior behavior, never aborts the sim); the integrity gate
  (`src/utils/integrityGate.js`) is run locally after state-mutating steps to confirm cycle invariants.
- **Read-only on everything I'm not explicitly changing.**

## Files this cruise will touch (with backup), + new files
| File | Phase | Type |
|------|-------|------|
| `Data/paper/positions/paper-positions-v0.1.json` | 1 | data edit (backup) |
| `Data/paper/performance/paper-performance-v0.1.json` | 1 | data edit (backup) |
| `config/marketops.phase1.config.json` | 2, 3 | config edit (backup) |
| `src/execution/paperTradeExecutor.js` | 2, 3 | code edit (backup) |
| `src/execution/excursionReport.js` | 3 | **new** (MFE report generator) |
| `Scripts/verify/replay-exit-proof.js` | 3 | **new** (read-only replay harness) |

`config` and `src` are under `Source/marketops-core/`. The position cap (20) is **config-driven**
(`config.learningMode.maxOpenPositions`, read at `riskDesk.js:42`, `runIntradaySimulation.js:103`,
`paperTradeExecutor.js:243`) — so raising it to 40 is a config change only, **no `riskDesk.js` edit**.

---

# PHASE 1 — Clear the jam

## The records I will remove (EXACT list — for your approval)
All 20 open positions in `Data/paper/positions/paper-positions-v0.1.json` are seed/stale records:
`assetType ETF`, entered **2026-06-01 / 2026-06-02** (pre-gate-fix), aged 30–47h, never time-stopped
because the sim was skipped for that window. **Zero legitimately-opened (post-fix) positions exist** —
nothing legitimate is at risk.

| # | positionId | symbol | entryTime | currentValue |
|---|------------|--------|-----------|--------------|
| 1 | `pos-SPY-1780339598762-tm20` | SPY | 2026-06-01T18:44:00Z | 220.78 |
| 2 | `pos-QQQ-1780339598769-rjiq` | QQQ | 2026-06-01T18:44:00Z | 166.64 |
| 3 | `pos-IWM-1780339598774-mky9` | IWM | 2026-06-01T18:44:00Z | 123.95 |
| 4 | `pos-DIA-1780339598779-klnp` | DIA | 2026-06-01T18:43:00Z | 93.37 |
| 5 | `pos-VTI-1780339598784-149s` | VTI | 2026-06-01T18:44:00Z | 69.90 |
| 6 | `pos-VOO-1780339598788-033p` | VOO | 2026-06-01T18:44:00Z | 52.39 |
| 7 | `pos-VXUS-1780340475373-ixey` | VXUS | 2026-06-01T18:58:00Z | 39.35 |
| 8 | `pos-VT-1780340475377-8u3q` | VT | 2026-06-01T18:50:00Z | 29.48 |
| 9 | `pos-VB-1780340475381-h3vt` | VB | 2026-06-01T18:39:00Z | 22.24 |
| 10 | `pos-VO-1780342274320-ixew` | VO | 2026-06-01T19:28:00Z | 16.75 |
| 11 | `pos-XLV-1780342274326-tkty` | XLV | 2026-06-01T19:29:00Z | 3.12 |
| 12 | `pos-VV-1780344070294-jw5p` | VV | 2026-06-01T19:59:00Z | 41.67 |
| 13 | `pos-IVV-1780344070298-4dmq` | IVV | 2026-06-01T19:59:00Z | 31.23 |
| 14 | `pos-IJR-1780344070303-8ris` | IJR | 2026-06-01T19:59:00Z | 5.88 |
| 15 | `pos-IJH-1780344070307-zirh` | IJH | 2026-06-01T19:59:00Z | 22.26 |
| 16 | `pos-SCHB-1780344070311-jxct` | SCHB | 2026-06-01T19:59:00Z | 16.49 |
| 17 | `pos-SCHX-1780344967387-ztwq` | SCHX | 2026-06-01T19:59:00Z | 12.36 |
| 18 | `pos-SCHF-1780344967392-5au5` | SCHF | 2026-06-01T19:59:00Z | 2.32 |
| 19 | `pos-XLK-1780345867520-9zui` | XLK | 2026-06-01T19:59:00Z | 8.76 |
| 20 | `pos-SMH-1780407076861-7h44` | SMH | 2026-06-02T12:21:00Z | 6.77 |

Sum of currentValue (holdings) = **$985.71**; cash = **$19.61**; total equity ≈ **$1,005.32**.

## How I identify them (safe rule)
Match the **explicit 20 `positionId`s above**, guarded by `entryTime ≤ 2026-06-02T23:59Z`
(strictly before today's post-gate-fix runs). I will **NOT** key off the `sample-signal-` prefix —
`simpleSignalScanner.js:169` stamps that prefix on *every* signal including legitimate ones, so the
prefix cannot distinguish seed from real. A future legit position (entryTime = a fresh bar today/onward)
can never match this list.

## DECISION FOR YOU — cash reconciliation (the only thing blocking execution)
Removing the 20 positions without reconciling cash leaves the book empty with only **$19.61** cash —
new positions would size to pennies and the jam-clear achieves nothing. Two clean ways to reconcile:

- **Option A — Close-at-market (preserve equity continuity) [recommended].** Move the 20 to
  `closedPositions` with `exitReason: "seed_jam_clear"`, return their $985.71 currentValue to cash →
  cash ≈ **$1,005.32**, holdings $0, equity ≈ **$1,005.32**, openPositions `[]`. Keeps an audit trail
  and equity continuity. Downside: adds 20 synthetic "closed trades" to performance history.
- **Option B — Clean reset to baseline.** openPositions `[]`, archive the 20 to `closedPositions` with
  `realizedPnl 0` / `exitReason: "seed_jam_clear"`, set cash = **$1,000.00**, equity = **$1,000.00**
  (matches the `standard` paper preset and `resetCycleIfDepleted` semantics). Cleanest book; discards the
  ~$5 equity delta. Learning records preserved either way.

**I recommend Option A** (no fabricated round number, preserves the real equity). Tell me A or B.

## After the edit
Run `cycle:build` so `cycle-state` `currentBalance` re-reconciles to canonicalTotalEquity, then run the
integrity gate locally to confirm invariants hold (no publish). Then run the sim
(`npm run intraday:simulate`, env unset) and report: how many trades flow, against which signals, and the
new approval/blocked counts.

## Expected outcome
With the book empty, today's 70 up-candidates (conf 0.61–0.73 > 0.58) should approve and open up to the
cap. This directly tests the brief's core claim that the blocker was **capacity saturation, not confidence**.

---

# PHASE 2 — Sizing + cap (shipped together)

## Cap: 20 → 40
`config/marketops.phase1.config.json`: `learningMode.maxOpenPositions: 20 → 40`. Propagates to all three
readers (no code edit). I'll spot-check `dayTrading.maxOpenPositions` stays a separate lower bound (5).

## Sizing defect + fix
**Current** (`paperTradeExecutor.js:341`):
`positionValue = cashBalance × maxPositionSizePct(0.25) × sizeMultiplier`, where `cashBalance` **decays
in loop order** as each trade debits it. Sizes collapse geometrically — a 40-position book is impossible.

**Proposed:** size off a **stable total-equity snapshot** taken at run start (`cashBalance + holdings`,
already computed at `paperTradeExecutor.js:268`), times a **named flat allocation**, capped by the
existing 25% guardrail and by remaining cash:
```
equityBase   = cashBalance + holdings            // snapshot once, pre-loop
perTradeValue = equityBase * perTradeAllocationPct * sizeMultiplier
positionValue = min(perTradeValue, equityBase * maxPositionSizePct, remainingCash)
```
New named config under `learningMode.sizing`: **`perTradeAllocationPct: 0.02`** (2% of equity).
`maxPositionSizePct (0.25)` is retained as a per-position safety cap, not the sizing basis.

## Before / after — full 40-position book at $1,000 equity (standard ×1.0)
| Position # | BEFORE (25% of *remaining* cash) | AFTER (flat 2% of equity) |
|-----------|----------------------------------|---------------------------|
| 1 | $250.00 | $20.00 |
| 2 | $187.50 | $20.00 |
| 5 | $79.10 | $20.00 |
| 10 | $18.77 | $20.00 |
| 20 | $1.06 | $20.00 |
| 40 | ~$0.0009 | $20.00 |
| **Deployed / cash buffer** | ~$999 nominal, but only ~10 are meaningful; can't hold 40 | **$800 deployed, $200 (20%) buffer** |

`perTradeAllocationPct 0.02 × 40 = 80%` invested, leaving a deliberate 20% cash buffer (probe trades at
×0.25 = $5). If you'd prefer fuller deployment use 0.025 (→100%, no buffer); 0.02 is my recommendation.
Then run; report book fill (count + size distribution) to confirm it's **broad, not front-loaded**.

---

# PHASE 3 — Instrument-aware exits + excursion tracking

## (1) Exit-pricing fix — `paperTradeExecutor.js:164`
Current: `currentPrice = symBars.length > 0 ? symBars[0].close : position.entryPrice;` → with no fresh
bar, returnPct computes off **entry price = 0%**, so target/stop can never fire (only time-stop).
**Fix:** when `symBars.length === 0` (no fresh bar this run): **do not** synthesize a price. Skip
target/stop evaluation, set `position.pricedThisRun = false` (flag), and fall through to the **time-stop
only**. When a fresh bar exists, evaluate target/stop on the **real** `symBars[0].close`.
*Related flag (not in scope of line 164 but same defect):* `updateUnrealizedPnl` at
`paperTradeExecutor.js:224` has the identical entry-price fallback for mark-to-market display — I'll note
it; fixing the exit gate is the instructed change. Will surface if you want the MTM path fixed too.

## (2) Instrument classification — DEFINITE source (RESOLVED, no STOP)
Source = `assetType` on the position (origin: vehicle universe `Data/sample/sample-vehicles-v0.1.json`,
**ETF=65 / EQUITY=85**, verified single-names e.g. AAPL/MSFT/NVDA are `EQUITY`, sector SPDRs are `ETF`).
Mapping: `assetType === "ETF"` → **etf** thresholds; `assetType === "EQUITY"` → **stock** thresholds;
**missing/unknown → etf (tighter) + set `position.instrumentTypeAssumed = true` flag.** An unknown is
never treated as a stock. No ticker-string parsing, no hand-maintained list.

## (3) Named instrument exits — config (no magic numbers)
`config/marketops.phase1.config.json` `learningMode.exitRules`, restructured:
```jsonc
"exitRules": {
  "maxHoldHours": 72,
  "timeStopAction": "close_at_market",
  "writelearningRecord": true,
  "byInstrumentType": {
    "etf":   { "targetProfitPct": 3, "stopLossPct": 2 },
    "stock": { "targetProfitPct": 6, "stopLossPct": 3 }
  },
  "unknownInstrumentDefault": "etf"
}
```
`loadExitRules()` (`paperTradeExecutor.js:24`) returns the whole block; `checkAndExecuteExits`
(`:153-177`) selects the pair per `position.assetType`, keeps the **72h time-stop** as the backstop.
DEGRADABLE: if the block is malformed, fall back to the legacy `{8,4,72}` defaults and log.

## (4) Max-favorable-excursion tracking — true high-water mark (REPORT-ONLY)
Bars carry `high`/`low`/`open`/`close` (verified), so MFE uses a real **bar-high**, not a close snapshot.
- **Live:** persist a running `maxFavorablePrice` on each open position, updated each cycle in
  `updateUnrealizedPnl` as `max(prev, latestBar.high)`. `closePosition` (`:126`) records
  `maxFavorablePrice`, `mfeReturnPct = (maxFav − entry)/entry`, and `mfeBeyondExitPct =
  (maxFav − exitPrice)/exitPrice` ("how much more it went on to gain after we exited").
- **Replay:** `maxFavorablePrice = max(bar.high)` over bars with `entryTime ≤ ts ≤ exitTime` for the symbol.
- **Report** (`src/execution/excursionReport.js` → `Reports/Paper/marketops-excursion-mfe-v0.1.md`
  + `Data/paper/excursion/mfe-v0.1.json`): per instrument type — exit-reason mix (how often target vs
  stop vs time-stop), and for target exits, the average/median `mfeBeyondExitPct` left on the table.
  **REPORT-ONLY. It will not read back into or mutate any threshold.** Human-gated, per the brief.

## (5) Proof on historical/replayed data
`Scripts/verify/replay-exit-proof.js` (read-only; no state writes, no publish) will:
1. Feed a held ETF a bar sequence crossing **+3%** → assert exit fires `target_hit` at the **real** price;
   feed −2% → assert `stop_loss`; assert neither fires off entry-price fallback.
2. Repeat for a held stock at **+6% / −3%**; assert ETF thresholds do **not** misapply to it and vice-versa.
3. Feed a position with **no fresh bar** → assert target/stop are skipped, `pricedThisRun=false`, and only
   the 72h time-stop can close it.
4. Run a position past target and let price keep rising → assert MFE captures the **bar-high beyond exit**,
   then print the per-instrument-type excursion report.
Report results + the excursion report, then **STOP**.

---

# Open decision before I start
**Phase 1 cash reconciliation: Option A (close-at-market, ~$1,005) or Option B (reset to $1,000)?**
Everything else above is resolved. On your "go (Option A/B)", I execute Phases 1→2→3 straight through,
reporting at each phase boundary.

*Plan only. No code or data changed. Stopping for approval.*

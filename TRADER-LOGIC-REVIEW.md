# MarketOps — Trader Logic Review (what the code ACTUALLY does)

Analysis-only. Read-only cruise. No code changed. Prepared 2026-06-03.
Sources read: `PROJECT-BRAIN.md`, `MARKETOPS_AUDIT.md`, the live data files under `Data/`,
and the core modules under `Source/marketops-core/src/`. Citations are `file:line`.

Paths below are relative to `Source/marketops-core/` unless they start with `Data/`.

---

## TL;DR (read this first)

1. **The Risk Desk is NOT blocking on confidence.** Today's live run (`Data/paper/risk/risk-decisions-v0.1.json`,
   generatedAt 2026-06-03T17:30Z) shows **150 signals, 0 approved**. The dominant block reason is
   **"Max open positions (20) reached" (99 signals)** plus **"Position already open for X" (~20 symbols)**.
   Candidate confidences are 0.61–0.73 against a 0.58 approval threshold — they pass the confidence gate
   easily. **51 signals are tagged `watched_capacity_blocked`**, i.e. they *would* have been approved but for
   the full book. So the real blocker is **portfolio saturation by stale seed positions**, not the confidence
   logic. This contradicts `CLAUDE.md` ("Risk Desk blocking too aggressively") and the audit's framing.

2. **The 20 open positions are `sample-signal-*` seed records** (`Data/paper/positions/paper-positions-v0.1.json`),
   entered 2026-06-01, aged 30–47h. They are under the 72h time-stop, so none have exited yet, so the book
   stays full, so every fresh candidate is capacity-blocked. The system is in a **self-perpetuating saturation
   state**, not a confidence-rejection state.

3. **The "learning" stack is almost entirely open-loop or scaffolding.** Learning records are written but never
   read back into decisions. `confidenceCalibration.js` computes a calibrated confidence that the decision path
   never consumes. The backtest lab runs a hardcoded momentum strategy on *synthetic* data unrelated to the real
   scanner/risk signals. The lower-learning "Learning Governor" emits a fixed list of hardcoded English strings.
   Nothing the learning layer produces feeds back into a future trade decision automatically.

---

# PART 1 — How a trade proposal is actually made

## 1.1 The real code path (market data → proposal → gate → execution)

There are two live entry points; both converge on `runIntradaySimulation()`:

- **30-min path:** `paper:run` → `paper/runPaper.js:32` → `runIntradaySimulation()`.
- **4×/day path:** `marketops:refresh` → `simulation/runMarketOpsRefresh.js:94` → `runIntradaySimulation()`,
  **gated on `freshBarsStatus === "FRESH_BARS_AVAILABLE"`** (`runMarketOpsRefresh.js:70,93`). Off-hours this is
  skipped (the `CONTROLLED_DEGRADED` path).

Inside `simulation/runIntradaySimulation.js`, in execution order:

| # | Step | Module / call | Line |
|---|------|---------------|------|
| 1 | Load vehicles (the universe) | `loadVehicles()` | `runIntradaySimulation.js:26` |
| 2 | Backfill 7-day bars | `backfillMarketData()` | `:33` |
| 3 | Merge into rolling history; `marketBars = rolling.history` | `updateRollingHistory()` | `:40-44` |
| 4 | Build per-symbol vehicle history (trend/vol) | `buildVehicleHistory()` | `:50` |
| 5 | Build market "weather" summary | `buildWeatherStation()` | `:57` |
| 6 | **Generate signals (the proposal)** | `generateSampleSignals()` | `:89` |
| 7 | Cycle depletion auto-reset (<$10 equity) | `resetCycleIfDepleted()` | `:127` |
| 8 | **Exit check** on existing positions | `checkAndExecuteExits()` | `:140` |
| 9 | **Risk Desk gate** | `reviewSignals()` | `:177` |
| 10 | **Execute approved trades** | `executePaperTrades()` | `:186` |
| 11 | Equity curve, run history | `buildEquityCurve()`, `appendRunHistory()` | `:199,203` |
| 12 | Confidence calibration (advisory, see §2.3) | `calibrateAllSymbols()` | `:206` |

Note the ordering quirk: **exits run before the risk gate and before execution** (`:140` then `:177`),
using the *same* `marketBars`. That is fine, but the exit prices come from those bars with a fallback to
entry price (see §1.3), which materially weakens stop/target exits.

## 1.2 The "proposal" — what `generateSampleSignals` emits and what feeds it

The proposal object is built per-vehicle in `signals/simpleSignalScanner.js`. Despite the file/function name
("sample"), this is the **live** signal generator — `runIntradaySimulation.js:98` sets `scan.sampleDataOnly = false`
and writes it as the real signal scan.

**Inputs actually consumed for a proposal:**

| Input | Where it comes from | How it's used | Live? |
|-------|--------------------|----------------|-------|
| `sampleChangePct` | first vs **last** bar close for the symbol across all bars in `marketBars` | the ENTIRE decision driver | **Yes** — this is essentially the only real feature |
| `movementThresholdPct = 2.0` | hardcoded `simpleSignalScanner.js:85` | candidate if `abs(change) ≥ 2%` | Yes |
| `LEARNING_CANDIDATE_THRESHOLD = 1.2` | hardcoded `:82` | `learning_candidate` if `1.2% ≤ abs(change) < 2%` | Yes |
| `directionBias` | sign of `sampleChangePct` | must be `up` to be tradeable | Yes |
| `assetType` / `universe` | vehicle record | risk classification, asset-class block | Yes |
| `vehicleHistorySummary` (trend, volatility, insufficientData) | `vehicleHistoryJson` via `getVehicleHistory` `:166,212` | read by Risk Desk for sizing tweaks `riskDesk.js:205-220` | Partially — populated, lightly used |
| `confidence` | **formula on `absChange` only** `:152-154` | Risk Desk approval band | Yes |
| `riskLevel` | `classifyRisk()` `:240-247` (assetType + absChange) | exit %, sizing % | Yes |

**Confidence is a near-rubber-stamp.** `simpleSignalScanner.js:152`:

```js
const confidence = isCandidate
  ? Math.min(0.9, 0.5 + absChange / 20)   // any ≥2% move starts at 0.60
  : Math.max(0.1, absChange / 10);
```

A 2% move → 0.60; a 4% move → 0.70. With the live approval threshold at **0.58** (config, see §1.4),
**every up-candidate auto-clears the confidence gate**. Confidence here is just a monotonic re-encoding of
`absChange`. It carries no independent information (no trend persistence, no volume, no relative strength).

**Dead / no-op inputs referenced but not populated at the signal stage:**

- `signal.side` and `signal.quantity` — checked by `riskDesk.js:66-72` (`checkHardSafetyFailures`) but the
  scanner never sets them on a signal, so those two hard-safety branches **never fire**. (`side` is later
  hardcoded to `"long"` in the decision record, `riskDesk.js:260`.)
- `companyName` — read by `riskDeskLearningBuilder.js:110` and others, never set by the scanner → always `null`.
- `signalEvidence.momentum` / `trend` (`:62-63`) — cosmetic labels, not used by any gate.
- The `nearCandidate` / `learning_candidate` path produces `entryPlan/exitPlan/riskPlan = null` unless
  `directionBias === "up"` (`:201-210`), so learning candidates with a down/flat bias are structurally
  un-tradeable regardless of score.

## 1.3 Exit logic (what actually closes a position)

`execution/paperTradeExecutor.js:checkAndExecuteExits` (`:153-216`), rules from config
`learningMode.exitRules` (`:24-33`): **target +8%, stop −4%, time-stop 72h**.

Two real problems with how it computes the exit:

1. **Price fallback defeats stop/target.** `:164`:
   `const currentPrice = symBars.length > 0 ? symBars[0].close : position.entryPrice;`
   If the symbol has no fresh bar in `marketBars`, `currentPrice` falls back to **entry price** → `returnPct = 0`
   → neither target nor stop can trigger. Only the **time-stop** (`:175`) can fire, and it closes at entry price
   (`returnPct ≈ 0`, a flat exit). So in any run where a held symbol isn't in the current bar set, exits degrade
   to "do nothing until 72h, then close flat."
2. **The book only turns over on the 72h clock.** Today's 20 positions are 30–47h old, so **zero** have exited.
   Until ~2026-06-04 18:44Z they will keep the book full and keep capacity-blocking everything (§1.5).

This partially contradicts `PROJECT-BRAIN.md:24` ("Exit logic: ACTIVE — target +8%, stop-loss −4%, 72hr").
The logic *exists and is wired*, but in practice the target/stop arms are frequently inert and only the
time-stop reliably fires — and it fires flat.

## 1.4 How the Risk Desk decides — exact gate conditions

`risk/riskDesk.js:reviewSignals` (`:123-298`). Thresholds load from
`config/marketops.phase1.config.json` at module load (`:5-44`). **The hardcoded defaults in the file
(0.63 / 0.57 / 0.50 / 0.55) are dead** — the config overrides them. Effective live thresholds:

| Constant | Hardcoded default (`riskDesk.js`) | **Live value (config)** |
|----------|-----------------------------------|--------------------------|
| `standardApprovalMin` | 0.63 | **0.58** |
| `learningProbeMin` | 0.57 | **0.42** |
| `watchMin` | 0.50 | **0.34** |
| `hardRejectBelow` | 0.55 | **0.34** |
| `maxOpenPositions` (learning) | — | **20** |

A signal is blocked if **any** of these fail (`:141-202`), in order:

1. Hard safety failures (`:141`) — missing ticker/confidence, blocked asset class (CRYPTO/OPTION/FUTURE/FOREX `:63`).
2. **Status gate** (`:149`): must be `candidate` (or `learning_candidate` in learning mode).
3. **Direction gate** (`:153`): `directionBias` must be `up`. Down/flat → blocked ("Phase 1 only allows long/up").
4. Complete trade plan (`:157-162`), present trigger (`:164`), present invalidation (`:168`).
5. **Dedup** (`:176`): a position already open for that symbol → blocked.
6. **Capacity** (`:181`): `openPositions.length ≥ maxOpenPositions (20)` → blocked.
7. **Confidence band** (`:191-202`), using `max(confidence, normalizedConfidence)`:
   - `≥ 0.58` → `approved_standard` (size ×1.0)
   - `≥ 0.42` → `approved_learning_probe` (size ×0.25)
   - `≥ 0.34` → `watched` (size 0, no trade)
   - else → rejected.

There is a **capacity-rescue** branch (`:222-240`): if the *only* block reason is "Max open positions" and the
signal is an up-candidate with confidence ≥ watch, it's re-labeled `watched_capacity_blocked` (held, not traded).

### Why it's blocking ~100% right now — with the live numbers

From `Data/paper/risk/risk-decisions-v0.1.json` (2026-06-03T17:30Z), 150 signals, **0 approved**:

```
approvalBands: { approved_standard: 0, approved_learning_probe: 0,
                 watched: 0, watched_capacity_blocked: 51, rejected: 99 }
reasonDistribution (top):
  "Max open positions (20) reached."            → 99
  "Phase 1 only allows long/up ..."             → 80   (down/flat bias)
  "Position already open for <symbol>"          → ~20  (one per held symbol)
  "Signal did not qualify as a candidate."      → 28   (ignore status)
```

And from `Data/paper/signals/signal-scan-v0.1.json`: of 150 vehicles, **91 candidates, 70 `up`**,
candidate confidences 0.61–0.73. **The confidence gate rejected nothing.** The binding constraints are:

- **The book is full (20/20).** 99 signals die on capacity; 51 of those are confidence/direction-qualified
  (`watched_capacity_blocked`) — they would trade if a slot were free.
- **One-position-per-symbol dedup** removes the ~20 strongest movers (they're already held).
- **Long-only** removes the 80 down/flat names.

**Conclusion:** "blocking too aggressively" is a mischaracterization. The Risk Desk's *thresholds* are
permissive (0.58 against an auto-0.60 confidence). The system produces zero trades because **the portfolio is
saturated with stale seed positions that don't turn over**, compounded by long-only + dedup. Lowering
confidence thresholds would change nothing here.

## 1.5 Position sizing & confidence determination

- **Sizing** (`paperTradeExecutor.js:341`): `positionValue = cashBalance × maxPositionSizePct(0.25) × sizeMultiplier`.
  `sizeMultiplier` is the discrete band multiplier: 1.0 standard, 0.25 probe (`riskDesk.js:30,194`), with two
  volatility/insufficient-history haircuts (`riskDesk.js:206-220`). There is **no continuous conviction sizing,
  no volatility-targeted sizing, no Kelly** — just `25% of *current* cash` per standard trade.
- **Front-loading artifact:** because it's 25% of *remaining* cash and cash depletes as positions open, the
  first trade in a run is ~$250 and each subsequent one is smaller. Position sizes therefore depend on
  *iteration order of approved decisions*, not on signal quality.
- **Confidence** for the decision = `max(scannerConfidence, normalizedConfidence)` (`riskDesk.js:186-189`).
  Both come from the **scanner's absChange formula** (§1.2). The separately-computed *calibrated* confidence
  from `confidenceCalibration.js` is **not** used here (§2.3).

---

# PART 2 — Backtesting, historical replay, learning loops

Classification key: **(a)** runs on a schedule · **(b)** wired into live flow, not scheduled ·
**(c)** code exists, connected to nothing (orphaned) · **(d)** doesn't exist.

## 2.1 Historical backtesting — `backtesting/` — **(c) orphaned**, and it does NOT replay proposed trades

- `backtest:run` / `backtest:qa` exist as npm scripts but appear in **no scheduler script and no systemd unit**
  (grep of `Scripts/` returns only `run-marketops-refresh.sh` for "backtest"… which is a `.bak` false hit;
  the live scheduler invokes none of them).
- What it actually does: `backtesting/runBacktestLab.js:3` pulls `getSampleHistoricalPeriods()` —
  **deterministic synthetic data** ("not live market data, not real historical market data", `runBacktestLab.js:47`) —
  and runs `backtestEngine.js:runSimpleStrategy`, a **hardcoded momentum rule** (`recentMomentum > 0.45`, stop
  −2.25%, 4-day time exit, `backtestEngine.js:14-35`) on a fixed $10,000 book.
- **It has no connection to the real proposal path.** It never reads the scanner's signals, the Risk Desk's
  decisions, or actual positions. It does not replay *the trades the system proposes* against history. Its output
  is consumed by nothing in the decision path (only its own QA reads it).

**Answer to "do we replay proposed trades against historical data to see how they'd have done?" — No.**
There is a backtest *harness*, but it tests a different, hardcoded toy strategy on synthetic series and the
result is generated-and-ignored. This contradicts the spirit of `PROJECT-BRAIN.md:13` ("Backtesting v0.1 in
place") — the harness exists, but it is not backtesting the live logic.

The closest thing to "replay" is the **shadow-trade** computation in `riskDeskLearningBuilder.js:233-274`,
which marks rejected signals to current market price ("would this rejection have missed a winner?"). That is
real and uses live data — but it's a one-step mark, not a historical replay, and (see §2.2) nothing acts on it.

## 2.2 Learning components

| Component | Scheduled? | Consumes | Produces | Acted on? | Class |
|-----------|-----------|----------|----------|-----------|-------|
| `riskDeskLearningBuilder.js` (`risk:learning`) | **Yes** (refresh runner) | risk decisions, positions, trades, market data | `risk-desk-learning-v0.1.json`: approved/rejected/watched outcomes, shadow P&L, **proposals** | proposals → review queue only (manual) | **(a)** but **open loop** |
| `confidenceCalibration.js` (`confidence:calibrate`) | Yes (in `runIntradaySimulation` + refresh) | rolling history (trend/momentum/volatility) | `confidence-calibration-v0.1.json` + report | **Not by the decision path** — read only by `approvalWaterfall.js` and a QA | **(a)** but **advisory/parallel** |
| `lowerLearning/` desks + `learningGovernor.js` (`learning:lower`) | **No** (not in any scheduler/unit) | learning office inputs (shadow) | master report + hardcoded "proposals" | No | **(c) orphaned** |
| Learning records (`learning-records-v0.1.json`) | Written each exit/reset | — | win/loss records per closed position | **Written only; never read into a decision** | **(a) write, open loop** |

Detail:

- **`riskDeskLearningBuilder` (real-ish, but open).** It genuinely computes good/bad approvals and shadow P&L
  on rejected names (`:276-329`) and emits `recommendations`/`proposals`. But every proposal is
  `autoApply: false`, `requiresAdminReview: true` (`:401,423`, and `rec-*` `:344,360`). `review/runReviewQueueImport.js:16,31`
  imports those proposals into the review queue. **Nothing downstream of an approved review writes back to
  `config/marketops.phase1.config.json` or to any threshold.** So the loop is: compute → queue → (human) →
  *dead end*. It learns nothing automatically. Note `riskDeskLearningBuilder.js:412` still describes the
  threshold as "below 0.55", which is stale vs the live 0.58/0.34 config.

- **`confidenceCalibration` (computed, not consumed).** This is the one module that builds *real* features —
  trend (`:10`), momentum (`:18`), volatility with a penalty (`:27,107`), freshness/bar-count gates
  (`:80-101`), and an `approvable` flag at a 0.55 threshold (`:122`). **But the trade decision never reads it.**
  The Risk Desk uses the scanner's absChange-confidence instead. The module's own report admits this:
  *"'Approvable' (calibrated) and risk-desk 'approved' (signal scanner) are independent axes"* (`:228`). So the
  better signal logic in the codebase is sitting **disconnected** from the decisions.

- **`learningGovernor` (pure scaffolding).** `lowerLearning/desks/learningGovernor.js:229-240` pushes a
  **fixed array of English sentences** ("Consider adding VIX…", "Drawdown is significant…") regardless of input.
  Its "guardrail checks" are mostly `true` literals (`:142-151`). It produces no data-driven proposal and is not
  scheduled.

## 2.3 Are there any closed improvement loops?

**No closed loop reaches the trade decision.** Every path that could improve choices is open:

```
scanner ──> riskDesk ──> executor ──> exits ──> learning-records   (WRITE-ONLY sink; never read back)
   │                          │
   │                          └─> riskDeskLearningBuilder ─> proposals ─> review queue ─> (human) ─> ✗ nothing
   │
   └─ confidenceCalibration (better features) ─> confidence-calibration.json ─> ✗ not read by riskDesk
```

The only thing that *changes future behavior automatically* is **state**, not learning:
positions persist, the book saturates, the cycle auto-resets at <$10 (`paperTradeExecutor.js:496`). That's a
state machine, not a feedback loop. The thresholds in `marketops.phase1.config.json` are the single point that
governs decisions, and **nothing in the system edits that file** — only a human does.

This contradicts the autonomy claims in `PROJECT-BRAIN.md:27` ("Learning records: ACTIVE — written on every
position close"): records are written, but "learning" implies consumption, and there is none.

---

# PART 3 — Observations (PROPOSALS ONLY — do not act on these)

Clearly labeled candidate directions. Rough effort (S/M/L) and risk. **Not a plan.**

### Where the logic is thin, naive, or contradictory

- **P-1 — Confidence is a relabeled price move.** `simpleSignalScanner.js:152` makes confidence a monotonic
  function of `absChange`, so the Risk Desk's confidence gate is decorative (auto-0.60 vs 0.58 threshold). The
  one module with real features (`confidenceCalibration.js`) is not wired into the decision. *Naive + contradictory.*
- **P-2 — The real blocker is state, not policy.** 0 trades is caused by a saturated book of stale seed
  positions + long-only + per-symbol dedup, not by the confidence thresholds everyone is tuning. Any effort
  spent loosening thresholds is aimed at the wrong cause.
- **P-3 — Exits degrade to flat.** The entry-price fallback (`paperTradeExecutor.js:164`) silently disables
  stop/target whenever a held symbol isn't in the current bar set; only the 72h time-stop reliably fires, and it
  closes flat. The book turns over on a clock, not on P&L.
- **P-4 — Sizing depends on loop order.** 25%-of-remaining-cash (`:341`) front-loads early decisions; later
  approvals get arbitrarily smaller positions independent of signal quality.
- **P-5 — Dead inputs.** `side`/`quantity` hard-safety checks never fire; `companyName` always null; calibrated
  confidence, learning records, and lower-learning proposals are all produced-and-ignored. Stale "0.55" copy in
  `riskDeskLearningBuilder.js:412` vs live 0.58/0.34.
- **P-6 — Backtest tests the wrong thing.** The harness scores a hardcoded toy strategy on synthetic data; it
  cannot tell you whether *your* proposals would have worked.

### Candidate directions (directions, not a plan)

| ID | Direction | Rough effort | Rough risk |
|----|-----------|--------------|------------|
| D-1 | **Unblock the real cause first:** decide how the seed/`sample-signal-*` positions should clear (turnover policy) before touching thresholds. The "100% blocked" symptom is capacity, not confidence. | S | Low (state hygiene) |
| D-2 | **Wire `confidenceCalibration` into the decision** (replace or blend the scanner's absChange-confidence). The better features already exist and are computed every run. | M | Med (changes who gets approved) |
| D-3 | **Fix the exit price source** so stop/target use the latest available mark (and treat "no fresh bar" explicitly) instead of falling back to entry price. | S | Med (changes realized P&L) |
| D-4 | **Decouple sizing from loop order** (size from total equity / a risk budget, not remaining cash). | S–M | Med |
| D-5 | **Make at least one learning loop closed** — e.g. let the shadow-trade / good-vs-bad-approval stats in `riskDeskLearningBuilder` propose a *bounded, logged, reversible* threshold nudge that an approved review actually applies to config. Today the loop dead-ends at the review queue. | M–L | High (this is where real autonomy + real risk live; keep human-gated) |
| D-6 | **Repoint the backtest harness at the live signal/risk logic over real rolling history** so it replays actual proposals, or explicitly retire `backtesting/` and `lowerLearning/` as non-functional to stop them implying capability they don't have. | M (replay) / S (retire) | Low |
| D-7 | **Add a second real feature** to break the single-feature dependence on `absChange` (e.g. trend persistence or relative strength already available in rolling history). | M | Med |

### Direct contradictions vs PROJECT-BRAIN.md / CLAUDE.md

- `CLAUDE.md` "Risk Desk blocking too aggressively in paper mode" / audit "blocks 100% of signals" → **True that
  0 trade, false on cause.** Cause is capacity saturation + long-only + dedup, not aggressive confidence gating
  (51 signals are confidence-qualified but capacity-blocked; 0 rejected on confidence).
- `PROJECT-BRAIN.md:13` "Backtesting v0.1 in place" → harness exists but tests a hardcoded toy strategy on
  synthetic data; **does not backtest the live logic** and is unscheduled/unconsumed.
- `PROJECT-BRAIN.md:24` "Exit logic: ACTIVE — target +8%, stop −4%, 72hr" → wired, but target/stop are inert
  whenever the held symbol lacks a fresh bar; effectively time-stop-only, closing flat.
- `PROJECT-BRAIN.md:27` "Learning records: ACTIVE" → written, **never read back into decisions** (open loop).
- `riskDesk.js:18-29` hardcoded thresholds (0.63/0.57/0.50/0.55) are **dead** — overridden by config
  (0.58/0.42/0.34/0.34). Anyone reading the source for the "real" thresholds will be misled.

---

*End of brief. No files other than this one were created or modified. Stopping for Sam's review.*

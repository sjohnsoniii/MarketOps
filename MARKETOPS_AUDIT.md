# MarketOps Pipeline Audit — 2026-06-02

Author: Claude Code (under Sam's authority). Read-only recon completed before any change.
Scope: why the pipeline does not reliably run end-to-end and publish current data to Vercel.

---

## TL;DR

**The git publish is NOT broken. The data being published is frozen.**

- sj3labs `main` receives a fresh commit on **every** run (latest `f48816b`, 2026-06-02 14:03 ET;
  HEAD == origin/main, 0 ahead / 0 behind). Vercel deploys on each push.
- But the **content** of those commits has not changed in any meaningful way since **2026-05-21**,
  because every refresh since then has been `CONTROLLED_DEGRADED` and preserves the last-known-good
  dashboard data.
- Root cause of the freeze: the market-data **freshness gate can never pass**. The dashboard refresh
  only runs the simulation when `freshBarsStatus === "FRESH_BARS_AVAILABLE"`, and that condition has
  been unreachable since v0.18.

`dashboard-refresh-health-v0.1.json` (authoritative):
```
lastStatus: CONTROLLED_DEGRADED
lastSuccessfulRefreshAt: 2026-05-21T14:01:39.855Z
consecutiveFailures: 22
failureReason: Market data unavailable: LIMITED_FRESH_BARS. Dashboard data preserved from last successful refresh.
```

---

## Pipeline map

Two independent systemd user pipelines both run the sim and both publish to sj3labs:

1. **marketops-run.timer** → `marketops-run.service` — every 30 min, Mon–Fri 09:30–16:30 ET.
   ExecStart: `npm run paper:run && bash Scripts/run-marketops-public-sync-v0.1.sh`.
   The public-sync script (`Scripts/public-sync/sync-marketops-to-sj3labs.sh`) commits+pushes
   `data/marketops/*.json` to sj3labs `main`. **This is the every-30-min publisher.**

2. **marketops-refresh.timer** → `marketops-refresh.service` — Mon–Fri 10:00, 12:00, 14:00, 15:50 ET.
   ExecStart: `Scripts/scheduler/run-marketops-refresh.sh` (the big runner).
   - Step 1: `npm run marketops:refresh` (full sim, gated on fresh bars).
   - Steps 1b–2: dashboard bundle, risk learning, review queue, public trial status.
   - **Step 3**: `sync-marketops-to-sj3labs.sh` → commits + pushes data files. *(real publisher)*
   - **Step 4**: a *second*, redundant "data-only git publish" guard that re-scans `git status`
     and **blocks** if any non-allowlisted file is dirty. `index.html` is permanently dirty
     (uncommitted manual edit since 2026-05-19), so Step 4 **always** reports
     `blocked_non_allowlisted_changes` — even though Step 3 already pushed the data. This makes the
     update manifest say `expectedVercelTrigger: false`, which is misleading (cosmetic, not the
     cause of staleness; Vercel deploys on any push regardless).

3. **marketops-premarket.timer** — 09:25 ET: `marketdata:refresh && marketdata:backfill && marketdata:rolling`.
4. **marketops-keep-awake** start/stop timers — inhibitor lock during market hours.

Env: both publishing units set `MARKETOPS_ALLOW_PUBLIC_SITE_SYNC=1`; the refresh override adds
`MARKETOPS_ALLOW_DATA_ONLY_GIT_PUBLISH=1`. **The scheduled path has the env vars it needs** — a
manual run with those vars matches the unit environment.

All four units use `StandardOutput=journal` / `StandardError=journal`. No unit uses an
`append:` path with date specifiers → the prior 209/STDOUT failure mode is resolved.

---

## Confirming / refuting the previously-claimed fixes

| Claimed fix | Status | Evidence |
|---|---|---|
| `set -uo pipefail` in runner; publish not killed by early exit | **CONFIRMED.** Line 2 has `set -uo pipefail`; script does **not** use `set -e`; every step captures its own exit code, publish step always runs. | run-marketops-refresh.sh:2; per-step `$?` captures. |
| `StandardOutput=journal` on run/premarket; no `append:` date-spec path | **CONFIRMED.** | `systemctl --user cat marketops-*`. |
| paperCycle.js no longer overwrites `startingBalance` | **TRUE but beside the point.** `startingBalance` is correct (1000, from config). The real corruption is **`currentBalance`** (see below). | paperCycle.js:82, QA "starting balance matches config" passes. |
| cycle JSON correct & won't re-corrupt next run | **REFUTED.** `currentBalance: 4876.46` vs true equity `1008.83`. Re-corrupts every 30 min. | see Finding B. |

**The real reason the dashboard is stale since 5/21 is NOT any of the previously-claimed fixes.**
It is the market-data freshness gate (Finding A), which was never addressed.

---

## Findings (root causes)

### A. Market-data freshness gate is permanently stuck (PRIMARY — causes the stale dashboard)

`src/marketdata/alpacaMarketDataAdapter.js`:
- `buildBarsUrl` calls `/v2/stocks/bars` with `limit=20`, **no `sort`, no `start`/`end`**.
  Alpaca defaults to `sort=asc`, so this returns the **oldest** ~20 one-minute bars of the session.
  Proof: at the 14:00 ET (18:00 UTC) run, `latest bar timestamp: 2026-06-02T13:48:00Z` = 09:48 ET =
  the first ~20 bars after the 13:30 UTC open. The fetch never sees current bars.
- `limit` is also asserted to ≤ 50, and `expectedBarCount = symbols.length * 2`. With 150 symbols
  that's **300**, but `limit` caps the multi-symbol response at ≤ 50 total bars (no pagination), so
  `freshBarCount` (≤ 20) can **never** reach 300. `freshBarsStatus` is therefore **always**
  `LIMITED_FRESH_BARS`.
- `runMarketOpsRefresh.js:70` and `runDashboardRefresh.js:293` only proceed when
  `freshBarsStatus === "FRESH_BARS_AVAILABLE"`. So the simulation and dashboard rebuild are
  **always skipped** → `CONTROLLED_DEGRADED` → last-known-good (2026-05-21) preserved forever.

Regression introduced in **v0.18** (commit 45d1d44, ~2026-05-21), which added
`expectedBarCount = symbols.length * 2` exactly when `lastSuccessfulRefreshAt` stops.

### B. `currentBalance` is a runaway accumulator (data integrity)

`src/cycles/paperCycle.js:140`: `cycle.currentBalance = round(currentBalance + paperPnlDelta)` runs on
every applied run. With `marketops-run` firing every 30 min, each run adds `paperPnl`, so
`currentBalance` has drifted to **4876.46** while the *true* mark-to-market equity
(`canonicalTotalEquity = cash 19.61 + holdings 989.22 = 1008.83`) is computed correctly alongside it.
- Canonical fields are internally consistent (positions sum currentValue 989.19 ≈ holdings 989.22).
- The public dashboard bundle uses canonical values (correct). The cycle status report and the
  depletion logic use the corrupt `currentBalance` (wrong, ~5×).
- The 20 open positions are `sample-signal-*` seed records (no real sim trades since the gate closed).

### C. Big JSON files written non-atomically → intermittent truncation (reliability)

`src/utils/fileStore.js:writeJson` is a single `fs.writeFileSync`. The rolling history
(`rolling-market-history-v0.1.json`, **122 MB**, 333k entries) and backfill (**67 MB**) are rewritten
every run. If the process is interrupted mid-write (machine sleep / kill), the file is left truncated
→ next read throws `Unexpected end of JSON input` (exactly the `marketdata:rolling` failure in the
14:00 run). Once the fresh-bars gate is fixed, the intraday sim also calls `updateRollingHistory()`
directly, so a truncated file would break the sim too. **Atomic write (tmp + rename) fixes this class.**

### D. Redundant Step 4 publish guard mislabels every run as "blocked" (cosmetic)

See pipeline map item 2, Step 4. Not the cause of staleness, but it makes the manifest report
`blocked_non_allowlisted_changes` / `expectedVercelTrigger: false` even though Step 3 pushed the data.

---

## Out-of-scope issues found (logged, not changing without approval)

- **keep-awake.service failed today** (`Failed to inhibit: ... already running`, status=1/FAILURE,
  09:02 ET). A stale inhibitor lock or a missed stop. If the box actually sleeps during market hours,
  scheduled runs are missed and big writes can be interrupted (feeds Finding C). Recommend verifying
  the inhibitor and the start/stop timer pairing separately.
- **Two overlapping publishers** (`marketops-run` every 30 min and `marketops-refresh` 4×/day) both
  push to sj3labs and both mutate the cycle. Works, but is redundant and was the multiplier behind
  Finding B. Worth consolidating later.
- **122 MB rolling history** rewritten every 30 min is a latent perf/memory risk even with atomic
  writes; consider tighter retention or a compact per-symbol store.

---

## Fix plan (Phase 3)

1. **A** — `alpacaMarketDataAdapter.js`: fetch the **latest bar per symbol**
   (`/v2/stocks/bars/latest`) and gate freshness on **recency** (newest bar age ≤ threshold) plus
   reasonable symbol coverage, instead of the unreachable `symbols.length * 2` count.
2. **B** — `paperCycle.js`: set `currentBalance = canonicalTotalEquity` (mark-to-market, idempotent),
   stop the accumulator drift. Heals on next run.
3. **C** — `fileStore.js`: make `writeJson` atomic (write tmp, `fs.renameSync`).
4. **D** — `run-marketops-refresh.sh`: make the manifest status reflect the sync's actual push
   (Step 3) instead of the redundant Step 4 "blocked" verdict.

All files backed up `.bak.20260602` before editing. Changes logged below as applied.

---

## SECOND ROOT CAUSE found in Phase 4 (the audit's TL;DR was incomplete)

The TL;DR above (fresh-bars gate) was necessary but **not sufficient**. Even after the
gate was fixed, the live charts would still have stayed frozen. Reason:

### E. The public CHART bundle is never regenerated by the scheduler (CO-PRIMARY)

The live dashboard (`sj3labs/marketops/dashboard/index.html`, `loadDashboardBundle`,
line ~1304) fetches **`dashboard-bundle-public-v0.5.json` first** and only falls back to
the smaller `dashboard-public-safe-v0.1.json` if v0.5 is missing/invalid. v0.5 existed but
was **frozen at 2026-05-29** (last commit `8d74309`).

That v0.5 chart bundle is written ONLY by `paper:refresh-site`
(`src/site/refreshSiteDashboard.js`), which is called ONLY by `paper:full`. **No systemd
unit runs `paper:full` or `paper:refresh-site`.** The scheduler runs `paper:run` (run timer)
and `marketops:refresh` (refresh timer) — neither regenerates v0.5/v0.4. So the every-30-min
sync only ever updated 6 small status JSONs (banner/trial-status), and the charts the site
actually renders were never touched. This is why the visible chart freeze date (5/29) differs
from the gate-break date (5/21).

**Fix:** added a `paper:refresh-site` step to `run-marketops-refresh.sh` (Step 1b2), after the
sim + dashboard build and before the sync. The sync's `git add data/marketops/` then commits
the regenerated v0.5/v0.4 bundles. Charts now publish on the 4×/day refresh cadence. Verified:
published v0.5 `generatedAt` advanced 2026-05-29 → 2026-06-02 (today) across three runs.

### F. Public chart bundle contains restricted terms `quantity` + `positionValue` (OPEN — needs Sam)

`dashboard:qa`'s leak check (`runDashboardQa.js:131` restrictedTerms) flags the v0.4/v0.5
bundles: they expose per-position `quantity` (60×) and `positionValue` (20×). This is
**pre-existing** (the frozen 5/29 bundle had them too: 38× / 10×) and was masked because the
gate failure short-circuited the run before `dashboard:qa` ever scanned the bundle. Now that
the pipeline runs fully, the check fires → status `PUBLISHED_WITH_WARNINGS` (not PASS).

**Tension:** the live frontend (`index.html:562,571,580,822`) actively renders `quantity` and
`positionValue` in the holdings table, so stripping them from the bundle would blank that table.
This is a public-safety **policy** decision, not a pipeline bug — *do exact share counts and
per-position dollar values belong on a public paper-trial dashboard?* **Not changed; Sam to
decide.** Until resolved, every clean run will report PUBLISHED_WITH_WARNINGS for this reason.

### G. `lastSuccessfulRefreshAt` never advances on PUBLISHED_WITH_WARNINGS (OPEN — recommend)

`refreshHealthTracker.js:31-32` only resets `consecutiveFailures` / advances
`lastSuccessfulRefreshAt` when `lastStatus === "PASS"`. While we're stuck at
PUBLISHED_WITH_WARNINGS (Finding F), the health file keeps `lastSuccessfulRefreshAt` at
2026-05-21, climbs `consecutiveFailures` (now 24+), and emits a `staleWarning` ("last refresh
N hours ago") that **renders on the public dashboard** even though data is fresh and published.
Recommend either (a) resolve F so runs reach PASS, or (b) have the tracker treat
PUBLISHED_WITH_WARNINGS as a successful *publish* for the freshness clock (it did publish fresh
data). Left unchanged pending Sam's call on F, since the two are coupled.

### H. Latent push race between `run` and `refresh` timers (OPEN — recommend)

`sync-marketops-to-sj3labs.sh` does `git commit` + `git push` with **no pull/rebase**. At slots
where both timers fire at the same minute (e.g. 12:00, 14:00), if both reach their push step
concurrently the second would be rejected non-fast-forward and that run's publish would fail.
Did **not** trigger in verification (the `run`/`paper:run` sync is usually a no-op because it
doesn't regenerate the synced public-safe files, and is much shorter than `refresh`).
Recommend hardening: add `git fetch && git rebase` or a push-retry to the sync, or stagger the
schedules so the two never start on the same minute.

### Out-of-scope, still open
- `risk:learning:qa` reports 1 failed check (799/800). Non-blocking (runner continues, exit 0).
- Risk Desk blocks 100% of signals in paper mode (0 trades, 2 empty charts) — the known
  "blocking too aggressively" issue. Drives part of the PUBLISHED_WITH_WARNINGS state.
- `keep-awake.service` failed 09:02 today (stale inhibitor). If the box sleeps in market hours,
  scheduled runs are missed.

---

## Change log (Phase 3 — applied)

All edits backed up before change. Two backup generations exist: `.bak.20260602`
(pre-session-1 original) and `.bak.20260602b` (pre-session-2, this session).

| # | File | Change | Verified |
|---|------|--------|----------|
| A | `src/marketdata/alpacaMarketDataAdapter.js` | Switched bars fetch to `/v2/stocks/bars/latest`; freshness gated on newest-bar **recency** (≤25 min, env-tunable) + ≥50% symbol coverage instead of unreachable `symbols.length*2` count. | Gate now passes in market hours: `FRESH_BARS_AVAILABLE`, 149 symbols, newest bar ~1 min old. |
| B | `src/cycles/paperCycle.js` | Pin `currentBalance = canonicalTotalEquity` (mark-to-market) instead of per-run accumulator. | `currentBalance` healed 4876.46 → 1010.24, equals `canonicalTotalEquity`. Idempotent across runs. |
| C | `src/utils/fileStore.js` | `writeJson` now atomic (write tmp + `fs.renameSync`). | No truncation across repeated 122 MB rolling-history rewrites in 3 full runs. |
| D | `Scripts/scheduler/run-marketops-refresh.sh` | Step 4 compares sj3labs HEAD before/after sync; if Step 3 already pushed, mark `pushed` instead of the redundant allowlist "blocked". | Manifest now reports `published` / `expectedVercelTrigger: true`. |
| E | `Scripts/scheduler/run-marketops-refresh.sh` | **New Step 1b2:** `npm run paper:refresh-site` after dashboard build, before sync — regenerates the v0.5/v0.4 chart bundles the live site renders. Non-fatal. | Published v0.5 `generatedAt` advances every run (5/29 → today). |
| F | `src/marketdata/alpacaMarketDataAdapter.js` | **Retry-with-backoff** (`requestJsonWithRetry`, 4 attempts, 0.5/1/2 s) on transient fetch errors (socket hang up, ECONNRESET, ETIMEDOUT, DNS, 429, 5xx). | Caught a real `socket hang up` on run 2: `[retry] attempt 1/4 ... retrying` → `dashboard:refresh PASS`. Run 1 (no retry) had failed on the same error. |
| G | `Scripts/scheduler/run-marketops-refresh.sh` | **New Step 5b:** commit + push the freshly-generated manifest to sj3labs (it describes the publish, so can't ride in the Step-3 commit). Non-fatal. | Live manifest now reflects the current run (`published`, today's bundle date) instead of lagging one run. |
| I | `src/dashboard/runDashboardQa.js` | **Scoped whitelist** (per Sam): exempt ONLY `quantity` + `positionValue`, and ONLY on the public paper bundle (`sj3labsPublicBundlePath`), from the restricted-term leak scan. Fields NOT stripped (frontend renders them). Every other term on this file, and all terms on all other scanned files, stay enforced — not a general bypass. | `dashboard:qa` → PASS (188/0). Resolves Finding F. |

### Finding F — RESOLVED (whitelist, not strip)

`dashboard:qa` now PASSES (188 checks, 0 failed). With the only QA blocker gone, `runDashboardRefresh`
reaches the `status: "PASS"` branch (line 336) during market hours — all other in-path QAs
(`marketdata:qa`, `cycle:qa`, `dashboard:public-refresh:qa`) already pass, and the "empty charts"
text is just boilerplate printed on any dashboard-QA failure, not an independent gate.

**Finding G follows from F:** verified that a PASS status makes `refreshHealthTracker` advance
`lastSuccessfulRefreshAt` → now, reset `consecutiveFailures` → 0, `isDegraded` → false, and
`staleWarning` → null (proven by invoking `trackRefreshHealth({status:"PASS"})` against the real
degraded prior-state, then restoring the file so no fake PASS was published). The live verification
run landed `CONTROLLED_DEGRADED` only because it ran **after the 16:00 ET close**
(`LIMITED_FRESH_BARS` short-circuits before the QA path) — correct off-hours behavior. The next
market-hours refresh (Wed 10:00 ET timer) will hit fresh bars → PASS → the stale banner clears and
stays cleared (subsequent off-hours `CONTROLLED_DEGRADED` runs preserve the advanced timestamp).

## Phase 4 verification (proof it publishes)

- **Manual end-to-end** (`MARKETOPS_ALLOW_PUBLIC_SITE_SYNC=1 MARKETOPS_ALLOW_DATA_ONLY_GIT_PUBLISH=1
  bash Scripts/scheduler/run-marketops-refresh.sh`): run 2 exit **0**, `[PUSHED] origin main`
  + `[PUSHED] manifest -> origin main`. Commits `cf4e440` + `da846ee` landed on `origin/main`.
- **Unattended timer-triggered run** (16:00 catch-up via `marketops-refresh.timer`, no hand-set
  env — the unit carries `MARKETOPS_ALLOW_PUBLIC_SITE_SYNC=1` +
  `MARKETOPS_ALLOW_DATA_ONLY_GIT_PUBLISH=1`): finished SUCCESS/exit 0, pushed `5b96214` +
  `241f5b3`. Published v0.5 `generatedAt = 2026-06-02T20:05Z`, manifest `published` /
  `expectedVercelTrigger: true`. **The scheduled path publishes fresh data unattended.**
- Timers re-armed: `marketops-run.timer`, `marketops-refresh.timer`, premarket, keep-awake all
  active.
- Remaining status is `PUBLISHED_WITH_WARNINGS` (not PASS) solely due to Findings F + G above —
  data is current and live; the warnings are content/policy, not pipeline failure.

---

## Original change-log placeholder (superseded by the table above)
</content>

---

# Resilience Hardening — PHASE 0 INVENTORY (read-only, 2026-06-02)

Goal: kill two failure classes — **BRITTLENESS** (one step fails → whole run aborts)
and **SILENCE** (something degrades/dies, nobody knows for days = the stale-since-5/21 class).
Nothing changed in this phase. Classification proposed for Sam's approval before Phase A.

**Classification key**
- **CRITICAL** = must abort / must block publish. Reserved for *data-integrity or safety*
  compromise (corrupt/unwritable state, invalid bundle JSON, leak-check fail). Publish must
  NOT proceed on these.
- **DEGRADABLE** = log + record degraded + CONTINUE. Publish still runs (last-known-good,
  labeled). Covers QA/cosmetic warnings, off-hours, transient network, non-essential desks.
- **KEEP** = existing correct behavior, do not modify (off-hours `LIMITED_FRESH_BARS` →
  `CONTROLLED_DEGRADED`; the `dashboard:qa` whitelist; the refreshHealthTracker/banner fix).

## 1. `marketops-premarket.service` — 09:25 ET — `marketdata:refresh && marketdata:backfill && marketdata:rolling`

| ID | Step | Current failure behavior | Proposed |
|----|------|--------------------------|----------|
| P1 | `marketdata:refresh` | `&&` chain: failure ABORTS backfill+rolling; unit fails; journal only; no alert. Adapter has transient retry. | DEGRADABLE (+surface) |
| P2 | `marketdata:backfill` | failure ABORTS rolling; unit fails silently. | DEGRADABLE (+surface) |
| P3 | `marketdata:rolling` | merges into 122 MB file; failure fails unit. Interrupt mid-write = truncation. | DEGRADABLE run / **CRITICAL write-integrity** (atomic) |

`&&` chaining is itself a brittleness point: one early failure silently skips the rest.

## 2. `marketops-run.service` — every 30 min — `paper:run && sync`

| ID | Step | Current failure behavior | Proposed |
|----|------|--------------------------|----------|
| R1 | `paper:run` → `runPaperPipeline` final `runQa` | QA fail → `throw` → exit 1 → `&&` ABORTS sync → **publish silently skipped**. | DEGRADABLE (must NOT block 30-min publish on a QA warning) |
| R2 | `paper:run` Alpaca fetch | transient retry exists (adapter). | DEGRADABLE |
| R3 | `sync` (`set -euo pipefail`) leak check | leak → `exit 1`, no publish. | **CRITICAL** (safety — keep blocking) |
| R4 | `sync` git commit/push | non-fast-forward (race w/ refresh) or auth → `exit 1`; unit fails silently. | DEGRADABLE (retry + flock) |

## 3. `marketops-refresh.service` — 10/12/14/15:50 ET — `run-marketops-refresh.sh`

**Inner `npm run marketops:refresh`** (`runStep` already catches→continues, but propagates a
non-zero *exit code* if any step FAILed; outputs always produced):

| ID | Step | Current failure behavior | Proposed |
|----|------|--------------------------|----------|
| F1 | `marketdata:refresh` | off-hours → `LIMITED_FRESH_BARS` → `CONTROLLED_DEGRADED`, sim skipped, last-good preserved. | **KEEP** |
| F2 | `marketdata:backfill` | runStep continues; may leave stale history. | DEGRADABLE |
| F3 | `marketdata:rolling` | continues; truncation risk on 122 MB file. | DEGRADABLE / **CRITICAL write** |
| F4 | `marketdata:weather` | continues. | DEGRADABLE |
| F5 | `intraday:simulate` | continues (no trades). | DEGRADABLE |
| F6 | `confidence:calibrate` | continues. | DEGRADABLE |
| F7 | `risk:explain` | continues. | DEGRADABLE |
| F8 | `cycle:build` | continues; if fails, cycle state not updated. | DEGRADABLE run / **CRITICAL write-integrity** (cycle/positions) |
| F9 | `marketdata:qa` | continues. | DEGRADABLE |
| F10 | `cycle:qa` | continues. | DEGRADABLE (escalate only if it proves cycle corruption) |
| F11 | `dashboard:build` | continues. | DEGRADABLE |
| F12 | `dashboard:refresh` (`runDashboardRefresh`) | own QA gating; off-hours `CONTROLLED_DEGRADED`; `dashboard:qa`/`publicQa` now PASS; leak/term scan; sets `process.exitCode`. | **KEEP** off-hours + QA-pass logic; leak = CRITICAL |
| F13 | `automation:check`, `scheduler:check` | continue. | DEGRADABLE |

**Bash-runner steps** (exit code captured but NOT gated; publish always runs — good):

| ID | Step | Current failure behavior | Proposed |
|----|------|--------------------------|----------|
| F14 | `dashboard:data:build` | fail → stale data bundle, continues. | DEGRADABLE (+surface) |
| F15 | `dashboard:data:qa` | fail → continues. | DEGRADABLE |
| F16 | `paper:refresh-site` (Step 1b2) | fail → **charts NOT regenerated → silent chart staleness = the 5/29 class**. | DEGRADABLE + **MUST surface (chart-freshness)** |
| F17 | `risk:learning` + `:qa` | `:qa` currently fails 1 check; continues. | DEGRADABLE |
| F18 | `review:import` + `:qa` | continue. | DEGRADABLE |
| F19 | `public:trial-status` | continues. | DEGRADABLE |
| F20 | Step 3 `sync` | leak → CRITICAL; push race → DEGRADABLE. | mixed (see R3/R4) |
| F21 | Step 4 data-only publish | push fail not retried. | DEGRADABLE (retry + flock) |
| F22 | Step 5/5b manifest gen + push | push fail → `[WARN]` only. | DEGRADABLE |
| F23 | Final exit code | exit 1 if inner refresh exit≠0, but **publish already ran** (not gated). | KEEP (informational) |

## 4. Cross-cutting SILENCE (the stale-since-5/21 class)

| ID | Gap | Impact |
|----|-----|--------|
| S1 | **No notifications anywhere** — journal only. | Every failure above is invisible for days. |
| S2 | **No external dead-man's switch.** | Whole box sleeps/dies → nothing runs → nobody knows. The single thing that would have caught 5/21. |
| S3 | Health collapses data / chart / publish freshness into one `lastStatus`. | "data fresh, charts fresh, QA warning" can't be expressed → one stale lie. |
| S4 | No structured run-report JSON (markdown + single health file only). | Hard to reason about per-step/per-component state programmatically. |
| S5 | `keep-awake.service` failed once (inhibitor); timer catch-up not confirmed. | Box may sleep in market hours → missed runs. |
| S6 | Push race: `run` + `refresh` both push, no lock/rebase. | Silent non-fast-forward publish failure. |

## 5. STATE INTEGRITY

| ID | Item | Status |
|----|------|--------|
| I1 | `fileStore.writeJson` atomic (tmp+rename) | DONE (v0.5 fix). Critical state (cycle-state, cycle-latest, run-history, latest-run-summary) uses it. |
| I2 | `fileStore.writeText` NOT atomic | reports only (cosmetic) — low priority. |
| I3 | No last-known-good backup before overwriting cycle/positions | GAP → Phase A. |
| I4 | Positions-file writer not yet located | verify in Phase A before adding LKG backup. |

## Proposed split (for approval)

- **CRITICAL (abort / block publish):** leak-check fail (R3/F20); corrupt or unwritable
  cycle/positions/bundle (data-integrity); invalid JSON in a file about to be published.
- **DEGRADABLE (log + continue + still publish last-good):** everything else — all QA warnings,
  off-hours, transient network, backfill/rolling/weather/calibration/explain/desk steps,
  `paper:refresh-site`, manifest push, automation/scheduler checks.
- **KEEP untouched:** F1/F12 off-hours `CONTROLLED_DEGRADED`, the `dashboard:qa` whitelist,
  refreshHealthTracker PASS/banner logic.

**Open question for Sam:** R1 (`paper:run` QA) — today a QA failure aborts the entire 30-min
publish. Confirm you want this reclassified DEGRADABLE (publish proceeds, QA warning recorded
+ surfaced) rather than CRITICAL. I believe DEGRADABLE is right per your "never gate publish on
a QA/cosmetic warning," but it changes current behavior so I'm flagging it explicitly.

**STOP — awaiting Sam's review of this classification before Phase A.**

---

# Resilience Hardening — PHASE A (Brittleness) — applied 2026-06-02

All files backed up `.bak.20260602-A` before editing. No MarketOps-repo commit.
KEPT untouched: dashboard:qa whitelist, refreshHealthTracker/banner, and the
LIMITED_FRESH_BARS → CONTROLLED_DEGRADED behavior (verified preserved).

## Changes

| # | File | Change |
|---|------|--------|
| A1 | `src/utils/transientRetry.js` (NEW) | ONE shared transient-retry policy. `withTransientRetry(fn)` for Node; CLI mode `node transientRetry.js <cmd>` for bash (git). Allowlist of transient signatures only (socket hang up, ECONNRESET/REFUSED, ETIMEDOUT, DNS, EPIPE, timeouts, HTTP 429, HTTP 5xx, git "could not resolve host"/"connection reset"/"early EOF"/"RPC failed"). Permanent 4xx + git non-fast-forward/auth deliberately NOT matched. |
| A2 | `src/marketdata/alpacaMarketDataAdapter.js` | Removed the local retry duplicate; bars+quotes fetch now wrapped in `withTransientRetry`. Freshness gate unchanged. |
| A3 | `Scripts/public-sync/sync-marketops-to-sj3labs.sh` | `git push` routed through the shared wrapper. |
| A4 | `Scripts/scheduler/run-marketops-refresh.sh` | Step-4 + Step-5b `git push` routed through `git_push_retry` (shared wrapper). |
| A5 | `src/utils/fileStore.js` | Refactored atomic write into `atomicWrite(tmp+rename)`; `writeText` now atomic too (all persisted state). Added `writeJsonWithBackup` (atomic + last-known-good `.lkg` snapshot; a corrupt current file is NOT promoted to LKG). |
| A6 | `src/cycles/paperCycle.js`, `src/simulation/runIntradaySimulation.js` | cycle-state, cycle-latest, and positions writers now use `writeJsonWithBackup` (LKG before overwrite). |
| A7 | `Scripts/scheduler/run-marketops-refresh.sh` | **Step runner** `run_step <name> <CRITICAL\|DEGRADABLE> <cmd>`: captures exit code, stderr tail, duration; records `STEP_LOG`. DEGRADABLE failure logs + appends to `DEGRADED_STEPS` + CONTINUES; CRITICAL failure sets `CRITICAL_FAIL`. All desk/build/QA steps = DEGRADABLE. |
| A8 | `Scripts/scheduler/run-marketops-refresh.sh` | **Pre-publish integrity gate** (Step 2b, the only CRITICAL): validates the 7 to-be-published / core state JSON files parse. On failure → publish (Step 3 sync + Step 4 data-publish + Step 5b manifest) is SKIPPED; never pushes corrupt data. |
| A9 | `Scripts/scheduler/run-marketops-refresh.sh` | Final status: CRITICAL → FAIL/exit 1; off-hours → CONTROLLED_DEGRADED (preserved, notes degraded steps); DEGRADABLE failures → PUBLISHED_WITH_WARNINGS/exit 0 (publish still ran). Publish is no longer gated on inner refresh exit code. |

## Verification (off-hours, 2026-06-02 ~22:39 ET — CONTROLLED_DEGRADED baseline)

- **Unit (LKG):** write1→no `.lkg`; write2→`.lkg` snapshots prior; corrupt current+write3→`.lkg` keeps last good, current updates. PASS.
- **Unit (shared retry CLI):** success→exit 0; permanent (`exit 7`)→no retry, propagates 7; transient (`socket hang up`)→3 retries (1s/2s/4s) then gives up. PASS.
- **Adapter smoke:** live fetch 149 bars, `LIMITED_FRESH_BARS` (off-hours) preserved. PASS.
- **TEST 1 — DEGRADABLE continues + publishes:** live run; `risk:learning:qa` failed (code=1) → `[STEP DEGRADED] — continuing`; all later steps ran; integrity gate OK (7 files); `[PUSHED] origin main` + `[PUSHED] manifest` (commits `d34c372`/`eec72c2`); Final CONTROLLED_DEGRADED, exit 0. **A failed DEGRADABLE step did not abort and still published.**
- **TEST 2 — CRITICAL aborts cleanly:** corrupted `paper-positions-v0.1.json`, live run; gate → `CORRUPT JSON before publish: paper-positions-v0.1.json` → `[STEP CRITICAL-FAIL]` → both publish branches `[ABORT PUBLISH]`; **0 `[PUSHED]`**, sj3labs HEAD unchanged (`eec72c2`); Final FAIL, exit 1. Positions restored. **Corrupt data was not published; run exited cleanly.**
- **Heal run:** clean live run republished consistent data (`2f94d48`), exit 0. No stray `.tmp`. `.lkg` snapshots present for cycle state.

## Phase A scope boundaries (NOT changed — flagged for Sam)

- **R1 (marketops-run.service `paper:run && sync`)**: Phase A's step-runner work was scoped to
  `run-marketops-refresh.sh` only. The 30-min run path's `paper:run` still throws on QA failure
  and `&&` still skips the sync. Sam approved reclassifying R1 DEGRADABLE in Phase 0, but the
  Phase A instructions did not cover this entry point — left untouched to avoid silent scope
  creep. **Decision needed:** harden the run path now or in a later phase?
- **Premarket `&&` chain** (`marketdata:refresh && backfill && rolling`): unchanged (unit
  ExecStart brittleness; candidate for Phase C infra or a follow-up).
- **Hygiene note:** `*.lkg` snapshots land next to cycle/positions JSON under `Data/`. Consider a
  `*.lkg` line in `.gitignore` so they don't clutter `git status` (a repo change — your call).

**STOP — Phase A complete. Awaiting Sam's approval (and the R1/premarket decision) before Phase B.**

---

# Resilience Hardening — PHASE A.1 (pre-Phase-B additions) — 2026-06-03

Backups `.bak.20260603`. No MarketOps-repo commit. systemd user units edited
(backed up) + daemon-reload. KEPT untouched: whitelist, banner/health,
LIMITED_FRESH_BARS→CONTROLLED_DEGRADED.

## 1. Shared step library — one machine, three doors

| File | Role |
|---|---|
| `Scripts/lib/marketops-steplib.sh` (NEW) | Single sourced lib: `run_step`, `retry_cmd`, `git_push_retry`, `integrity_gate`, `log_step_summary`. Tracks `DEGRADED_STEPS`/`CRITICAL_FAIL`/`STEP_LOG`. Idempotent source guard. |
| `Scripts/scheduler/run-marketops-refresh.sh` | Refactored to `source` the lib (removed the inline duplicate run_step/git_push_retry; integrity gate now `integrity_gate …`). |
| `Scripts/scheduler/run-marketops-run.sh` (NEW) | R1 path: `paper:run` (DEGRADABLE — QA warning no longer blocks the 30-min publish) → integrity gate (CRITICAL) → sync (skipped if integrity fails). |
| `Scripts/scheduler/run-marketops-premarket.sh` (NEW) | `marketdata:refresh`/`backfill`/`rolling`, each DEGRADABLE (replaces the brittle `&&` chain). Prep only, no publish. |
| `~/.config/systemd/user/marketops-run.service`, `marketops-premarket.service` | `ExecStart` repointed to the new scripts; `daemon-reload`. WorkingDirectory/Environment/StandardOutput preserved. |

The retry policy itself stays single-sourced in `src/utils/transientRetry.js`
(shared by the Alpaca adapter and every git push).

## 2. `.lkg` gitignored + sync-safe

`.gitignore` += `*.lkg` and `**/*.lkg`. Confirmed `git check-ignore` ignores the
existing `.lkg` snapshots and none appear in `git status`. The sj3labs sync copies
an explicit fixed file list (no globs) and scans with `--include="*.json"` (which
does not match `*.json.lkg`); no `.lkg` exists anywhere under `sj3labs`. Internal only.

## 3. Integrity gate — semantic invariants (CRITICAL)

`src/utils/integrityGate.js` (NEW) replaces the inline parse-only check. Two layers:
1. PARSE — every passed file is valid JSON.
2. SEMANTIC (cycle-state.currentCycle + cycle-latest), each CRITICAL:
   - `startingBalance === declared start` (`state.cycleStartingBalance`)
   - `currentBalance === canonicalTotalEquity` (±0.02)
   - `currentBalance > 0` and `<= startingBalance × 10` (runaway/zero/negative guard)
   - `drawdownFromStart` and `drawdownPct` recompute correctly from starting/current.

## Verification (off-hours 2026-06-03 ~07:10 ET)

- **Semantic catch:** injected `currentBalance=4876.46` (canonical 1011.02) → gate FAILED with 3 invariant violations (≠canonical; drawdownFromStart 11.02≠3876.46; drawdownPct 1.1≠387.65), exit 1. Restored → exit 0. The valid-JSON-but-wrong (4876 / 52.68) class is now caught.
- **No false positive:** gate OK against real current cycle (current=canonical=1011.02, drawdown recomputes).
- **Run path continues on DEGRADABLE:** injected `false` (DEGRADABLE) first → `[STEP DEGRADED] — continuing` → `paper:run` ran → integrity OK (5 files+invariants) → sync ran. exit 0, PUBLISHED_WITH_WARNINGS.
- **Premarket continues on DEGRADABLE:** injected `false` first → `[STEP DEGRADED]` → `marketdata:refresh`+`backfill`+`rolling` ALL ran (old `&&` would have aborted them). exit 0.
- **Clean regressions:** premarket clean → PASS; run path clean → PASS (integrity OK); refresh runner (now lib-sourced) → integrity OK (8 files), `[PUSHED]` + manifest, exit 0, CONTROLLED_DEGRADED.
- Timers armed and repointed (premarket 09:25 / run 09:30 / refresh 10:00). Inject residue removed (0). `.lkg` ignored; none in sj3labs.

**STOP — additions complete. Phase B will begin with the SECRETS trace-and-verify
(NTFY_TOPIC + HEALTHCHECK_URL via the core's dotenv path) BEFORE building the
notifier, per instructions. Awaiting go.**

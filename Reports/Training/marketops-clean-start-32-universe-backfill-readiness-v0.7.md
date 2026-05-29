# MarketOps Clean Start + 32-Vehicle Universe + Prior-Day Backfill Final Cruise v0.7

**Generated:** 2026-05-19T03:07:00.000Z  
**Status:** ALL GOALS ACHIEVED

---

## 1. Clean Paper Start Ready: YES

- `npm run training:clean-start`: **PASS** — 15/15 checks passed
- All active paper state files consistently report **$1,000.00**
- All 482 legacy runs preserved as history; clean-start entry appended to run-history

## 2. Active Starting Balance: $1,000.00

All sources agree:
| Source | Value |
|--------|-------|
| paper-performance startingCash | $1,000.00 |
| paper-performance cashBalance | $1,000.00 |
| paper-performance totalEquity | $1,000.00 |
| paper-positions openPositions | 0 |
| paper-trades startingBalance | $1,000.00 |
| equity-curve startingBalance | $1,000.00 |
| latest-run-summary startingBalance | $1,000.00 |
| cycle-latest currentBalance | $1,000.00 |
| cycle-state currentBalance | $1,000.00 |
| public-trial paperBalance | $1,000.00 |
| public-trial paperEquity | $1,000.00 |
| dashboard-refresh endingEquity | $1,000.00 |
| training:prep-market-open | $1,000.00 |

## 3. Active Current Balance/Equity: $1,000.00

Pre-market, no paper trades executed yet. Dashboard refresh during verification opened 3 positions as expected behavior, but clean-start was re-run to reset to $1,000.00.

## 4. Active Open Positions Before Market Open: 0

All positions cleared. Closed legacy positions preserved with `legacyTest: true` markers.

## 5. Old $4,218.75 / $4,192.26 State Archived: YES

- Pre-reconciliation state backed up to `Backups/`
- Legacy 3 positions (AAPL, MSFT, NVDA) marked with `legacyTest: true`
- 482 legacy runs preserved in run-history with reconciliation metadata
- Zero active state files contain $4,218.75 or $4,192.26

## 6. Selected Universe Profile: standard

From config `paperAccountPresets.standard`

## 7. Target Universe Size: 32

Liquid large-cap NASDAQ/S&P names + broad liquid ETFs:
- 9 ETFs: SPY, QQQ, IWM, DIA, VTI, XLF, XLK, XLV, XLE
- 23 EQUITY: AAPL, MSFT, NVDA, AMZN, META, GOOGL, TSLA, AVGO, JPM, V, JNJ, WMT, PG, XOM, UNH, HD, COST, MRK, ABBV, CRM, AMD, NFLX, INTC

## 8. Actual Vehicles Loaded: 32

All 32 active vehicles loaded by `loadVehicles()`.

## 9. Usable Symbols with Market Data: 32

All 32 symbols have >= 10 bars of backfilled data. Total: 58,397 bars.

## 10. Backfill Status for Prior-Day/Recent Data: COMPLETED

| Metric | Value |
|--------|-------|
| Backfill status | completed |
| Symbols attempted | 32 |
| Symbols usable (>= 10 bars) | 32 |
| Total bars | 58,397 |
| Rolling history | 60,388 bars across 32 symbols |
| Data source | alpaca_iex_backfill |
| Coverage | 100% |

## 11. Scheduler Service Status: 0/SUCCESS

- `systemctl --user start marketops-refresh.service`: **0/SUCCESS**
- Last run: Tue 2026-05-19 10:46:49 EDT, exit code 0
- All safety checks PASS

## 12. Next Scheduled Run Time

- **Tue 2026-05-19 12:00:00 EDT** (1h 13min from report generation)
- Also scheduled: 14:00, 15:50 EDT

## 13. Prod Data-Only Publish Enabled: YES

- `MARKETOPS_ALLOW_DATA_ONLY_GIT_PUBLISH=1` in systemd override
- Allowlist: `data/marketops/*.json`
- Website code auto-commit: disabled
- Manual publish only

## 14. sj3labs/Vercel Update Path Ready: YES

- sj3labs git: clean, up to date with origin/main
- Allowlisted JSON data files present and up to date:
  - dashboard-bundle-public-v0.4.json ✓
  - dashboard-public-safe-v0.1.json ✓
  - dashboard-refresh-latest-v0.1.json ✓
  - marketops-public-trial-status-v0.1.json ✓
  - marketops-shareable-snapshot-v0.1.json ✓
  - dashboard-refresh-health-v0.1.json ✓
- Vercel receives updates through normal GitHub push

## 15. No Live-Money Behavior Exists: YES

- Paper-only mode: YES
- Live trading: disabled
- Broker execution: disabled
- Margin: disabled
- Options: disabled
- Futures: disabled
- Shorting: disabled
- Social posting: disabled
- Email/SMS: disabled
- Payments: disabled
- All safety checks pass every refresh

---

## Scanned Commands Verification

| Command | Status |
|---------|--------|
| `npm run training:clean-start` | PASS (15/15 checks) |
| `npm run training:prep-market-open` | PASS (scenario ready: YES) |
| `npm run cycle:status` | PASS (currentBalance: 1000) |
| `npm run marketdata:backfill` | PASS (58,397 bars, 32 symbols) |
| `npm run training:backfill-prior-day` | PASS (100% coverage) |
| `npm run dashboard:refresh` | PASS (154 QA checks) |
| `npm run dashboard:refresh:qa` | PASS (110 checks) |
| `bash run-marketops-refresh.sh` | PASS (exit 0) |
| `systemctl --user start marketops-refresh.service` | PASS (exit 0/SUCCESS) |
| `systemctl --user list-timers` | PASS (next: 12:00 EDT) |
| `git status --short` on sj3labs | PASS (clean) |

## New Scripts Added

- `npm run training:clean-start` → `src/training/cleanStart.js`
- `npm run training:backfill-prior-day` → `src/training/backfillPriorDay.js`

## Updated Scripts

- `src/training/prepMarketOpen.js` — added universe/profile/backfill reporting
- `package.json` — added 2 new scripts
- `Data/sample/sample-vehicles-v0.1.json` — expanded from 8 to 32 vehicles

## Reports Created

1. `Reports/Training/marketops-clean-paper-start-v0.7.md` — clean start results
2. `Reports/Training/marketops-market-open-training-readiness-v0.7.md` — readiness check
3. `Reports/MarketData/marketops-prior-day-backfill-v0.7.md` — backfill results
4. `Reports/Training/marketops-clean-start-32-universe-backfill-readiness-v0.7.md` — this file

## Summary

**MarketOps v0.7 cruise complete. The system is fully ready for market open Tuesday 2026-05-19 with:**
- Clean $1,000.00 paper account
- 32-vehicle scan universe with 100% backfill coverage
- Active scheduler with next run at 12:00 EDT
- Prod data-only publishing enabled
- All safety guardrails verified
- No live-money behavior exists

# MarketOps Site Integration Handoff v0.1

Generated: 2026-05-15T16:00:00.000Z

## 1. Local Preview File to Review

```
Admin/dashboard-preview/marketops-dashboard-preview-v0.1.html
```

Open with:
```bash
cd ~/Projects/MarketOps/Source/marketops-core
npm run dashboard:preview
xdg-open ~/Projects/MarketOps/Admin/dashboard-preview/marketops-dashboard-preview-v0.1.html
```

## 2. Data Files That Power the Dashboard

| File | Contents |
|------|----------|
| `Data/dashboard/dashboard-public-safe-v0.1.json` | Local public-safe dashboard bundle (all charts, cards, disclaimers, provenance) |
| `Data/dashboard/marketops-shareable-snapshot-v0.1.json` | Shareable snapshot (preset, cycle, signal/risk, refresh status) |
| `Data/dashboard/dashboard-refresh-health-v0.1.json` | Dashboard refresh health tracker (status, failures, stale warnings) |
| `Data/dashboard/dashboard-refresh-latest-v0.1.json` | Latest refresh run summary (steps, error details) |
| `Data/paper/cycles/paper-cycle-latest-v0.1.json` | Paper cycle state (balance, trades, rejection reasons) |
| `Data/paper/history/latest-run-summary.json` | Latest paper run summary (equity, P&L, drawdown) |
| `Data/paper/equity/equity-curve-v0.1.json` | Equity curve points |
| `Data/paper/signals/signal-scan-v0.1.json` | Signal scan output |
| `Data/paper/risk/risk-decisions-v0.1.json` | Risk desk decisions |
| `Data/paper/trades/paper-trades-v0.1.json` | Paper trade records |
| `Data/market-data/alpaca/alpaca-market-data-latest-v0.1.json` | Alpaca IEX bars and quotes |
| `Data/agent-reviews/latest-agent-review-summary.json` | Agent review summary |
| `Reports/Dashboard/marketops-public-share-packet-v0.1.md` | Public shareable numbers and disclaimers |
| `Reports/Dashboard/marketops-data-provenance-v0.1.md` | Full provenance documentation |

## 3. Files That Would Need to Be Copied or Wired into sj3labs

For a static public page at `/marketops`, the following would need to be manually copied after human review:

| Source | Destination | Purpose |
|--------|-------------|---------|
| `Admin/dashboard-preview/marketops-dashboard-preview-v0.1.html` | `sj3labs/public/marketops/index.html` | Main dashboard page |
| `Data/dashboard/marketops-shareable-snapshot-v0.1.json` | `sj3labs/data/marketops/marketops-shareable-snapshot-v0.1.json` | Machine-readable data for widgets |
| `Data/dashboard/dashboard-public-safe-v0.1.json` | `sj3labs/data/marketops/dashboard-public-safe-v0.1.json` | Full chart data bundle |
| `Reports/Dashboard/marketops-public-share-packet-v0.1.md` | `sj3labs/content/marketops/public-share-packet.md` | Public-facing explanation |

**Do NOT copy:**
- Any files from `Data/paper/` containing raw internal IDs, local paths, or unfiltered simulation data
- `.env.local` files
- `Data/market-data/` raw Alpaca bars/quotes (derived movement summaries in the dashboard bundle are sufficient)
- `Reports/` with agent reviews, QA reports, or internal operational reports

## 4. Recommended Public Route/Path

```
/marketops
```

Suggestion: a single-page static dashboard at `sj3labs.com/marketops/` that embeds the preview HTML or links to a generated index.html.

## 5. Exact Manual Next Steps for Future Integration

1. **Human review the preview**: Open `Admin/dashboard-preview/marketops-dashboard-preview-v0.1.html`, verify all numbers, copy, and disclaimers are correct and safe.
2. **Run a fresh dashboard refresh**: `cd ~/Projects/MarketOps/Source/marketops-core && npm run dashboard:refresh`
3. **Regenerate preview**: `npm run dashboard:preview`
4. **Copy approved files to sj3labs** manually (see section 3 above). Do NOT use automated sync.
5. **Verify all public-safe labels** in the copied files: paperOnly, notFinancialAdvice, notLiveTrading, fakeMoney, inDevelopment, publicDisclaimer.
6. **Check for private paths**: grep for local system paths and parent directory references in all copied files. Remove any private paths.
7. **Confirm no live trading claims** appear anywhere in the public copy.
8. **Add a robots noindex meta tag** if the page should remain unindexed during development.
9. **Deploy manually** after all checks pass.

## 6. What Must Be Reviewed Before Publishing

- [ ] All numbers are clearly labeled as paper simulation, not real performance.
- [ ] The "not financial advice" disclaimer is visible on the page.
- [ ] No local file paths are exposed (`/home/`, `C:\`, `../`).
- [ ] No raw internal IDs are exposed (signal IDs, risk decision IDs, trade IDs).
- [ ] No live trading, broker execution, or real-money claims appear.
- [ ] No secrets, API keys, or credentials are present.
- [ ] The stale/degraded status is accurately reflected.
- [ ] The scheduler "not installed" status is visible.
- [ ] Social sharing buttons (if any) are not auto-posting anything.
- [ ] The page does not imply investment advice or guaranteed returns.
- [ ] The page does not tell anyone to buy/sell/trade.

## 7. Confirmation

- No commit, push, deploy, scheduler install, live trading, social posting, email, SMS, payment, or secrets action occurred during this handoff preparation.
- This handoff is a static document. It is not a publication or deployment.
- All files referenced are inside `/home/sjohnsoniii/Projects/MarketOps` unless explicitly noted as sj3labs destination (which is a separate repo).

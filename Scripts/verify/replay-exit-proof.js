// Read-only replay proof for instrument-aware exits + MFE.
// Constructs synthetic positions/bars and drives the REAL exit logic to prove:
//  1. target/stop fire on REAL prices (not entry-price fallback)
//  2. the correct ETF (+3/-2) vs stock (+6/-3) pair applies per assetType
//  3. no-fresh-bar => target/stop skipped, only the 72h time-stop acts (flagged)
//  4. unknown assetType defaults to the tighter ETF pair and is flagged
//  5. MFE captures the bar-HIGH beyond the exit
// Touches no real data files and does not publish.

const core = "../../Source/marketops-core";
const { checkAndExecuteExits, loadExitRules } = require(`${core}/src/execution/paperTradeExecutor`);
const { buildExcursionReport, renderMarkdown } = require(`${core}/src/execution/excursionReport`);

const NOW = new Date("2026-06-03T18:00:00Z").toISOString();
const recent = new Date(Date.parse(NOW) - 2 * 3600000).toISOString();   // 2h old (< 72h)
const old = new Date(Date.parse(NOW) - 80 * 3600000).toISOString();     // 80h old (>= 72h)

let pass = 0, fail = 0;
function check(name, cond, detail = "") {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}  ${detail}`); }
}

function pos(symbol, assetType, entryPrice, entryTime, extra = {}) {
  return {
    positionId: `pos-${symbol}-test`, symbol, assetType, side: "long",
    entryTime, entryPrice, quantity: 1, positionValue: entryPrice, currentValue: entryPrice,
    signalId: `sample-signal-${symbol}`, riskDecisionId: `risk-${symbol}`, approvalBand: "approved_standard",
    ...extra
  };
}
function bar(symbol, close, high) {
  return { symbol, timestamp: NOW, open: close, high: high != null ? high : close, low: close, close };
}
function runOne(position, bars) {
  return checkAndExecuteExits({ openPositions: [position], marketBars: bars, generatedAt: NOW, exitRules: loadExitRules() });
}

console.log("Replay exit proof — instrument-aware exits + MFE\n");
console.log("Loaded exit rules:", JSON.stringify(loadExitRules().byInstrumentType), "\n");

// 1. ETF target +3% on a REAL price
let r = runOne(pos("XLK", "ETF", 100, recent), [bar("XLK", 103.5, 104)]);
let c = r.closedPositions[0];
check("ETF +3.5% -> target_hit", c && c.exitReason === "target_hit", JSON.stringify(c && c.exitReason));
check("ETF exit at REAL price 103.5 (not entry 100)", c && c.exitPrice === 103.5, c && String(c.exitPrice));
check("ETF used etf thresholds (+3/-2)", c && c.targetProfitPctUsed === 3 && c.stopLossPctUsed === 2, c && `${c.targetProfitPctUsed}/${c.stopLossPctUsed}`);
check("ETF instrumentType=etf, not assumed", c && c.instrumentType === "etf" && c.instrumentTypeAssumed === false);
check("ETF pricedThisRun=true", c && c.pricedThisRun === true);

// 2. ETF stop -2%
r = runOne(pos("IWM", "ETF", 100, recent), [bar("IWM", 97.5, 100)]);
c = r.closedPositions[0];
check("ETF -2.5% -> stop_loss at 97.5", c && c.exitReason === "stop_loss" && c.exitPrice === 97.5, c && `${c.exitReason}@${c.exitPrice}`);

// 3. Instrument-specificity: same +3.5% move — ETF exits, STOCK holds
r = runOne(pos("AAPL", "EQUITY", 100, recent), [bar("AAPL", 103.5, 104)]);
check("STOCK +3.5% does NOT hit target (needs +6%) -> stays open", r.closedPositions.length === 0 && r.keptOpenPositions.length === 1);

// 4. Stock target +6% and stop -3%
r = runOne(pos("NVDA", "EQUITY", 100, recent), [bar("NVDA", 106.5, 107)]);
c = r.closedPositions[0];
check("STOCK +6.5% -> target_hit, used stock thresholds (+6/-3)", c && c.exitReason === "target_hit" && c.targetProfitPctUsed === 6 && c.stopLossPctUsed === 3, c && `${c.exitReason} ${c.targetProfitPctUsed}/${c.stopLossPctUsed}`);
r = runOne(pos("TSLA", "EQUITY", 100, recent), [bar("TSLA", 96.5, 100)]);
c = r.closedPositions[0];
check("STOCK -3.5% -> stop_loss at 96.5", c && c.exitReason === "stop_loss" && c.exitPrice === 96.5);

// 5. No fresh bar + within hold window -> NOT closed (target/stop skipped, no time-stop yet)
r = runOne(pos("MSFT", "EQUITY", 100, recent), [bar("OTHER", 200, 200)]); // no MSFT bar
check("No fresh bar, <72h -> stays open (no synthesized 0% exit)", r.closedPositions.length === 0 && r.keptOpenPositions.length === 1);

// 6. No fresh bar + past 72h -> time_stop ONLY, flagged stale
r = runOne(pos("VOO", "ETF", 100, old, { latestPrice: 101 }), [bar("OTHER", 200, 200)]);
c = r.closedPositions[0];
check("No fresh bar, >=72h -> time_stop", c && c.exitReason === "time_stop");
check("time_stop on stale bar flagged exitPriceStale=true, pricedThisRun=false", c && c.exitPriceStale === true && c.pricedThisRun === false);
check("stale exit valued at last mark (101), not faked", c && c.exitPrice === 101, c && String(c.exitPrice));

// 7. Unknown assetType -> defaults to ETF-tight AND flagged (never stock)
r = runOne(pos("MYST", "MYSTERY", 100, recent), [bar("MYST", 103.5, 104)]);
c = r.closedPositions[0];
check("Unknown assetType +3.5% -> target_hit (ETF default), flagged assumed", c && c.exitReason === "target_hit" && c.instrumentType === "etf" && c.instrumentTypeAssumed === true);

// 8. MFE captures bar-HIGH beyond exit
r = runOne(pos("SMH", "ETF", 100, recent), [bar("SMH", 103.5, 110)]); // exits at 103.5, high 110
c = r.closedPositions[0];
check("MFE water-mark = bar high 110", c && c.maxFavorablePrice === 110, c && String(c.maxFavorablePrice));
check("mfeBeyondExitPct > 0 (ran higher after exit)", c && c.mfeBeyondExitPct > 6 && c.mfeBeyondExitPct < 7, c && String(c.mfeBeyondExitPct));

// Excursion report over all the closed records produced above
console.log("\n--- Excursion report (synthetic replay set) ---");
const allClosed = []
  .concat(runOne(pos("XLK", "ETF", 100, recent), [bar("XLK", 103.5, 110)]).closedPositions)
  .concat(runOne(pos("IWM", "ETF", 100, recent), [bar("IWM", 97.5, 100)]).closedPositions)
  .concat(runOne(pos("DIA", "ETF", 100, recent), [bar("DIA", 104, 112)]).closedPositions)
  .concat(runOne(pos("NVDA", "EQUITY", 100, recent), [bar("NVDA", 106.5, 115)]).closedPositions)
  .concat(runOne(pos("TSLA", "EQUITY", 100, recent), [bar("TSLA", 96.5, 100)]).closedPositions);
const report = buildExcursionReport({ closedPositions: allClosed });
console.log(renderMarkdown(report));

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

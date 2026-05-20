const path = require("path");
const { fileExists, loadJson, writeJson, writeText } = require("../utils/fileStore");
const { paths } = require("../utils/paths");
const { loadVehicles } = require("../data/sampleLoaders");
const { backfillMarketData } = require("../marketdata/backfillMarketData");
const { updateRollingHistory } = require("../marketdata/rollingHistoryStore");
const { buildWeatherStation } = require("../marketdata/marketWeatherStation");

const REPORT_PATH = path.join(paths.projectRoot, "Reports", "MarketData", "marketops-prior-day-backfill-v0.7.md");

async function backfillPriorDay() {
  console.log("=".repeat(60));
  console.log("MarketOps Prior-Day Backfill v0.7");
  console.log("=".repeat(60));
  console.log(`Generated: ${new Date().toISOString()}`);

  const vehicles = loadVehicles();
  const equityEtfVehicles = vehicles.filter(v => v.assetType === "EQUITY" || v.assetType === "ETF");
  console.log(`\nActive vehicles: ${vehicles.length}`);
  console.log(`EQUITY/ETF vehicles (backfill-capable): ${equityEtfVehicles.length}`);
  console.log(`CRYPTO vehicles (skipped by backfill): ${vehicles.length - equityEtfVehicles.length}`);

  let backfillResult = { symbols: [], barsCount: 0, errors: [] };
  let backfillError = null;

  try {
    backfillResult = await backfillMarketData();
    console.log(`\nBackfill complete: ${backfillResult.totalBars} bars across ${backfillResult.symbolsCovered ? backfillResult.symbolsCovered.length : 0} symbols`);
  } catch (error) {
    backfillError = error.message;
    console.log(`\nBackfill error (non-fatal): ${error.message}`);
  }

  let rollingResult = { totalBars: 0, symbolsCovered: [] };
  let rollingError = null;

  try {
    rollingResult = updateRollingHistory();
    console.log(`Rolling history: ${rollingResult.totalBars} bars across ${rollingResult.symbolsCovered.length} symbols`);
  } catch (error) {
    rollingError = error.message;
    console.log(`Rolling history error (non-fatal): ${error.message}`);
  }

  let weatherResult = null;
  try {
    weatherResult = buildWeatherStation();
    console.log(`Weather station: ${weatherResult.dataCoverageStatus}`);
  } catch (error) {
    console.log(`Weather station error (non-fatal): ${error.message}`);
  }

  const backfillData = loadOptional(paths.backfillDataJson);
  const perSymbol = backfillData && backfillData.perSymbol ? backfillData.perSymbol : {};
  const symbolKeys = Object.keys(perSymbol);
  const usableSymbols = symbolKeys.filter(s => perSymbol[s].usableForSignal === true);
  const failedSymbols = symbolKeys.filter(s => perSymbol[s].error).map(s => ({ symbol: s, error: perSymbol[s].error }));

  const totalBarsCount = backfillResult.totalBars || (backfillData && backfillData.totalBars) || (backfillData && Array.isArray(backfillData.bars) ? backfillData.bars.length : 0);

  const coveragePct = vehicles.length > 0 ? Math.round((usableSymbols.length / vehicles.length) * 100) : 0;
  const dataReady = coveragePct >= 70;

  console.log("\n--- Backfill Summary ---");
  console.log(`  Total bars backfilled:       ${totalBarsCount}`);
  console.log(`  Total backfill symbols:      ${symbolKeys.length}`);
  console.log(`  Usable symbols (>=10 bars):  ${usableSymbols.length}`);
  console.log(`  Failed symbols:              ${failedSymbols.length}`);
  console.log(`  Coverage:                    ${usableSymbols.length}/${vehicles.length} vehicles (${coveragePct}%)`);
  console.log(`  Data ready for market open:  ${dataReady ? "YES" : "PARTIAL"}`);

  if (failedSymbols.length > 0) {
    console.log("\n  Failed symbols:");
    failedSymbols.forEach(s => console.log(`    - ${s.symbol}: ${s.error}`));
  }

  const report = `# MarketOps Prior-Day Backfill v0.7

Generated: ${new Date().toISOString()}

## Summary

- Total vehicles in universe: ${vehicles.length}
- EQUITY/ETF vehicles: ${equityEtfVehicles.length}
- CRYPTO vehicles (not backfill-capable): ${vehicles.length - equityEtfVehicles.length}
- Total bars backfilled: ${totalBarsCount}
- Total symbols attempted: ${symbolKeys.length}
- Usable symbols (>= 10 bars): ${usableSymbols.length}
- Failed symbols: ${failedSymbols.length}
- Coverage: ${coveragePct}%
- Data ready for market open: ${dataReady ? "YES" : "PARTIAL"}

## Backfill Detail

- Data source: alpaca_iex
- Timeframe: 1Min
- Lookback: 7 days
- Rolling history: ${rollingResult.totalBars} bars, ${rollingResult.symbolsCovered.length} symbols
${weatherResult ? `- Weather station: ${weatherResult.dataCoverageStatus}, ${weatherResult.usableForSignalSummary}` : "- Weather station: unavailable"}

## Usable Symbols

${usableSymbols.length > 0 ? usableSymbols.map(s => `- ${s}`).join("\n") : "- None"}

## Failed Symbols

${failedSymbols.length > 0 ? failedSymbols.map(s => `- ${s.symbol}: ${s.error}`).join("\n") : "- None"}

## Errors

${backfillError ? `- Backfill error: ${backfillError}` : "- None"}
${rollingError ? `- Rolling history error: ${rollingError}` : ""}

## Notes

- Backfill runs against Alpaca IEX feed with 7-day lookback.
- CRYPTO assets are not supported by the backfill endpoint.
- A minimum of 10 bars is required for a symbol to be marked usable.
- Partial coverage is acceptable; simulation will fall back to available data.
`;

  writeText(REPORT_PATH, report);
  console.log(`\nReport: ${REPORT_PATH}`);

  return {
    totalBars: totalBarsCount,
    symbolsAttempted: symbolKeys.length,
    symbolsUsable: usableSymbols.length,
    symbolsFailed: failedSymbols.length,
    vehiclesLoaded: vehicles.length,
    coveragePct,
    dataReady,
    backfillError,
    rollingError
  };
}

function loadOptional(filePath) {
  try {
    return fileExists(filePath) ? loadJson(filePath) : null;
  } catch {
    return null;
  }
}

async function runCli() {
  try {
    await backfillPriorDay();
  } catch (error) {
    console.error("Backfill failed:", error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runCli();
}

module.exports = { backfillPriorDay };

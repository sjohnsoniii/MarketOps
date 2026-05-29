const { fileExists, loadJson, writeJson, writeText, ensureDir } = require("../utils/fileStore");
const { round } = require("../utils/number");
const { paths } = require("../utils/paths");

const LOOKBACK_DAYS = 14;
const LOOKBACK_MS = LOOKBACK_DAYS * 24 * 60 * 60 * 1000;

function getBarsForSymbol(allBars, symbol, beforeTimestamp) {
  const cutoff = beforeTimestamp
    ? new Date(beforeTimestamp).getTime() - LOOKBACK_MS
    : Date.now() - LOOKBACK_MS;
  const beforeMs = beforeTimestamp ? new Date(beforeTimestamp).getTime() : Date.now();

  return (allBars || [])
    .filter((b) => {
      if (b.symbol !== symbol) return false;
      const ts = new Date(b.timestamp).getTime();
      return ts >= cutoff && ts <= beforeMs;
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

function computeVehicleHistory(bars, symbol, generatedAt) {
  const result = {
    symbol,
    lookbackDays: LOOKBACK_DAYS,
    barCount: bars.length,
    firstAvailableAt: bars.length > 0 ? bars[0].timestamp : null,
    lastAvailableAt: bars.length > 0 ? bars[bars.length - 1].timestamp : null,
    startPrice: bars.length > 0 ? round(bars[0].close) : null,
    latestPrice: bars.length > 0 ? round(bars[bars.length - 1].close) : null,
    changePct: null,
    avgDailyRangePct: null,
    volatilityEstimate: null,
    trendDirection: "unknown",
    dataQuality: "insufficient",
    insufficientData: true
  };

  if (bars.length < 2) {
    return result;
  }

  result.insufficientData = bars.length < 5;
  result.dataQuality = bars.length >= 20 ? "good" : bars.length >= 10 ? "moderate" : "limited";

  const startPrice = bars[0].close;
  const endPrice = bars[bars.length - 1].close;
  result.changePct = startPrice > 0 ? round(((endPrice - startPrice) / startPrice) * 100, 2) : 0;

  if (bars.length >= 5) {
    const dailyRanges = [];
    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i];
      if (bar.high && bar.low && bar.close > 0) {
        const rangePct = ((bar.high - bar.low) / bar.close) * 100;
        dailyRanges.push(rangePct);
      }
    }
    if (dailyRanges.length > 0) {
      result.avgDailyRangePct = round(dailyRanges.reduce((s, r) => s + r, 0) / dailyRanges.length, 2);
    }

    const returns = [];
    for (let i = 1; i < bars.length; i++) {
      if (bars[i - 1].close > 0) {
        returns.push((bars[i].close - bars[i - 1].close) / bars[i - 1].close);
      }
    }
    if (returns.length > 1) {
      const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
      const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length;
      result.volatilityEstimate = round(Math.sqrt(variance) * 100, 4);
    }
  }

  if (result.changePct !== null) {
    if (result.changePct > 1.5) {
      result.trendDirection = "up";
    } else if (result.changePct < -1.5) {
      result.trendDirection = "down";
    } else {
      result.trendDirection = "flat";
    }
  }

  return result;
}

function buildVehicleHistory(allBars, generatedAt) {
  const symbols = [...new Set((allBars || []).map((b) => b.symbol))];
  const histories = symbols.map((sym) => {
    const bars = getBarsForSymbol(allBars, sym, generatedAt);
    return computeVehicleHistory(bars, sym, generatedAt);
  });

  const output = {
    schemaVersion: "0.1",
    generatedAt: generatedAt || new Date().toISOString(),
    mode: "paper_simulation",
    paperOnly: true,
    internalOnly: true,
    lookbackDays: LOOKBACK_DAYS,
    totalSymbols: symbols.length,
    symbolsWithHistory: histories.filter((h) => !h.insufficientData).length,
    symbolsInsufficient: histories.filter((h) => h.insufficientData).length,
    histories
  };

  ensureDir(paths.vehicleHistoryRoot);
  writeJson(paths.vehicleHistoryJson, output);

  const rowLines = histories.map((h) =>
    `| ${h.symbol} | ${h.barCount} | ${h.dataQuality} | ${h.changePct !== null ? h.changePct + "%" : "N/A"} | ${h.trendDirection} | ${h.avgDailyRangePct !== null ? h.avgDailyRangePct + "%" : "N/A"} | ${h.volatilityEstimate !== null ? h.volatilityEstimate + "%" : "N/A"} | ${h.insufficientData} |`
  );

  const reportText = [
    "# MarketOps 14-Day Vehicle History v0.1",
    "",
    `Generated: ${output.generatedAt}`,
    `Lookback: ${LOOKBACK_DAYS} calendar days`,
    "Internal decision context only. Not exposed in public dashboard.",
    "",
    "## Summary",
    "",
    `- Total symbols: ${output.totalSymbols}`,
    `- Symbols with history: ${output.symbolsWithHistory}`,
    `- Symbols insufficient data: ${output.symbolsInsufficient}`,
    "",
    "## Per Symbol",
    "",
    "| Symbol | Bars | Data Quality | Change % | Trend | Avg Daily Range % | Volatility % | Insufficient |",
    "|--------|------|-------------|----------|-------|-------------------|--------------|--------------|",
    ...rowLines,
    "",
    "## Notes",
    "",
    "- This history is internal decision context only.",
    "- No public visual charts are generated from this data.",
    "- No lookahead bias: only bars before candidate.generatedAt are used.",
    "- Insufficient data does not automatically reject candidates but may lower confidence.",
    ""
  ];

  writeText(paths.vehicleHistoryReport, reportText.join("\n"));

  return output;
}

function getHistoryForSymbol(historyOutput, symbol) {
  if (!historyOutput || !historyOutput.histories) return null;
  return historyOutput.histories.find((h) => h.symbol === symbol) || null;
}

function adjustConfidenceWithHistory(baseConfidence, history) {
  if (!history || history.insufficientData) {
    return {
      adjusted: round(Math.max(0, baseConfidence - 0.05), 4),
      reason: history ? "insufficient_history" : "no_history",
      adjustment: history ? -0.05 : 0
    };
  }

  let adjustment = 0;

  if (history.trendDirection === "up" && history.changePct > 0) {
    adjustment += 0.03;
  } else if (history.trendDirection === "down") {
    adjustment -= 0.04;
  }

  if (history.volatilityEstimate !== null) {
    if (history.volatilityEstimate > 5) {
      adjustment -= 0.05;
    } else if (history.volatilityEstimate > 3) {
      adjustment -= 0.02;
    } else if (history.volatilityEstimate < 1) {
      adjustment += 0.01;
    }
  }

  const adjusted = round(Math.max(0, Math.min(1, baseConfidence + adjustment)), 4);
  return {
    adjusted,
    reason: "history_adjusted",
    adjustment: round(adjustment, 4)
  };
}

module.exports = {
  LOOKBACK_DAYS,
  buildVehicleHistory,
  getHistoryForSymbol,
  adjustConfidenceWithHistory,
  computeVehicleHistory,
  getBarsForSymbol
};

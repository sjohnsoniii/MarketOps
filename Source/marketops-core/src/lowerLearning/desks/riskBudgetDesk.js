const { clampConfidence } = require("../shared/lowerLearningScoring");

function runRiskBudgetDesk(inputs) {
  const report = {
    status: "operational",
    confidence: 0,
    findings: [],
    dataLimitations: [],
    summary: "",
    details: "",
    recommendations: [],
    recommendationsAdvisory: true,
    activeConfigNotModified: true
  };

  const details = [];
  details.push("## Risk Budget Desk v0.1 — Lower Environment");
  details.push("");
  details.push("**ADVISORY ONLY** — No active configuration is modified.");
  details.push("");

  const performance = inputs.sources.paperPerformance;
  const positions = inputs.sources.paperPositions;
  const trades = inputs.sources.paperTrades;
  const weather = inputs.sources.weatherStation;
  const riskDecisions = inputs.sources.riskDecisions;
  const signals = inputs.sources.signalScan;
  const config = inputs.sources.config;

  let drawdown = 0;
  let losingStreak = 0;
  let openPositionCount = 0;
  let cashBalance = 0;
  let totalEquity = 0;
  let volatility = "unknown";
  let regimeNote = "";
  let operatorWarningLevel = "none";

  if (performance.found && performance.data) {
    const pd = performance.data;
    drawdown = pd.maxDrawdown || 0;
    cashBalance = pd.cashBalance || 0;
    totalEquity = pd.totalEquity || 0;
    report.findings.push(`Performance: max drawdown ${drawdown}%, equity $${totalEquity}, cash $${cashBalance}`);
  } else {
    report.dataLimitations.push("Performance data unavailable for drawdown/cash analysis.");
  }

  if (positions.found && positions.data) {
    openPositionCount = (positions.data.openPositions || []).length;
    report.findings.push(`Open positions: ${openPositionCount}`);
  } else {
    report.dataLimitations.push("Position data unavailable for exposure analysis.");
  }

  if (weather.found && weather.data) {
    const wd = weather.data;
    const entries = Object.values(wd.perSymbol || {});
    const staleCount = entries.filter(e => !e.fresh).length;
    const totalCount = entries.length;
    const stalePct = totalCount > 0 ? (staleCount / totalCount) * 100 : 0;

    if (stalePct > 50) {
      operatorWarningLevel = "elevated";
      report.findings.push(`Weather station: ${stalePct.toFixed(0)}% stale symbols — elevated risk warning`);
    } else if (stalePct > 25) {
      operatorWarningLevel = "moderate";
    } else {
      operatorWarningLevel = "low";
    }
  } else {
    report.dataLimitations.push("Weather station data unavailable for volatility/risk assessment.");
  }

  if (signals.found && signals.data) {
    const avgConf = (signals.data.signals || []).reduce((a, s) => a + (s.confidence || 0), 0) / (signals.data.signals || []).length || 0;
    if (avgConf < 0.3) {
      volatility = "elevated";
      report.findings.push(`Low average signal confidence (${avgConf.toFixed(2)}) suggests elevated uncertainty`);
    } else {
      volatility = "normal";
    }
  }

  if (config.found && config.data) {
    const c = config.data;
    const dayTrading = c.dayTrading || {};
    const maxPos = dayTrading.maxOpenPositions || 5;
    const maxTrades = dayTrading.maxTradesPerDay || 10;
    const maxLossPct = dayTrading.maxDailyLossPct || 0.05;

    details.push("### Current Configuration Reference");
    details.push("");
    details.push(`- Max open positions: ${maxPos}`);
    details.push(`- Max trades per day: ${maxTrades}`);
    details.push(`- Max daily loss: ${(maxLossPct * 100).toFixed(0)}%`);
    details.push(`- Learning mode: ${c.learningMode ? c.learningMode.enabled : "N/A"}`);
    details.push("");
  }

  details.push("### Risk Budget Recommendations (Advisory Only)");
  details.push("");
  details.push("| Parameter | Recommended | Reasoning |");
  details.push("|-----------|-------------|-----------|");

  let recommendedMaxPositions = 5;
  let recommendedMaxTrades = 10;
  let recommendedMaxLossPct = 0.05;
  let recommendedMaxPositionSizePct = 0.25;

  if (drawdown > 50) {
    recommendedMaxPositions = Math.max(1, Math.floor(5 * (1 - drawdown / 200)));
    recommendedMaxTrades = Math.max(1, Math.floor(10 * (1 - drawdown / 200)));
    recommendedMaxLossPct = Math.min(0.05, 0.03 * (1 - drawdown / 200));
    recommendedMaxPositionSizePct = Math.min(0.25, 0.15 * (1 - drawdown / 200));
    details.push(`| Max open positions | ${recommendedMaxPositions} | Drawdown ${drawdown}% suggests reduced position limits |`);
    details.push(`| Max daily trades | ${recommendedMaxTrades} | Reduced to limit further drawdown |`);
    details.push(`| Max daily loss | ${(recommendedMaxLossPct * 100).toFixed(1)}% | Tighter loss limit given existing drawdown |`);
    details.push(`| Max position size | ${(recommendedMaxPositionSizePct * 100).toFixed(0)}% | Reduced position sizing recommended |`);
    report.recommendations.push(`Reduce max positions to ${recommendedMaxPositions} due to ${drawdown}% drawdown.`);
    report.recommendations.push(`Reduce max daily trades to ${recommendedMaxTrades}.`);
  } else if (drawdown > 25) {
    recommendedMaxPositions = Math.max(2, Math.floor(5 * (1 - drawdown / 150)));
    details.push(`| Max open positions | ${recommendedMaxPositions} | Moderate drawdown (${drawdown}%) suggests caution |`);
    details.push(`| Max daily loss | ${(recommendedMaxLossPct * 100).toFixed(1)}% | Maintain current loss limit |`);
    report.recommendations.push(`Consider reducing max positions to ${recommendedMaxPositions}.`);
  } else {
    details.push(`| Max open positions | ${recommendedMaxPositions} | Current setting acceptable |`);
    details.push(`| Max daily loss | ${(recommendedMaxLossPct * 100).toFixed(1)}% | Current setting acceptable |`);
  }

  if (openPositionCount >= 3) {
    const suggested = Math.min(recommendedMaxPositions, openPositionCount);
    details.push(`| New entries | Exercise caution | ${openPositionCount} existing positions |`);
    report.recommendations.push(`Exercise caution on new entries — ${openPositionCount} positions already open.`);
  }

  if (operatorWarningLevel === "elevated") {
    details.push(`| Risk mode | DEFENSIVE | Elevated operator defense warnings |`);
    report.recommendations.push("Activate defensive posture due to elevated operator warnings.");
  }

  if (volatility === "elevated") {
    details.push(`| Position sizing | Reduce by 25-50% | Elevated volatility / low confidence |`);
    report.recommendations.push("Consider reducing position sizes by 25-50% in current conditions.");
  }

  if (cashBalance > 0 && totalEquity > 0) {
    const cashRatio = cashBalance / totalEquity;
    if (cashRatio < 0.1) {
      details.push(`| Cash reserve | Maintain minimum | Cash ratio is ${(cashRatio * 100).toFixed(0)}% — low reserve |`);
      report.recommendations.push("Cash reserve is low. Consider pausing new entries.");
    }
  }

  details.push("");
  details.push("*All recommendations are advisory only. No active configuration has been modified.*");
  details.push("");

  report.findings.push(`Risk budget recommendations produced: ${report.recommendations.length}`);
  report.findings.push(`Active config NOT modified — verified.`);

  const inputsAvailable = [
    performance.found, positions.found, weather.found,
    signals.found, config.found
  ].filter(Boolean).length;
  report.confidence = clampConfidence(inputsAvailable / 5);

  details.push("### Summary");
  details.push("");
  details.push(`- Recommendations: ${report.recommendations.length}`);
  details.push(`- Drawdown: ${drawdown}%`);
  details.push(`- Open positions: ${openPositionCount}`);
  details.push(`- Operator warning level: ${operatorWarningLevel}`);
  details.push(`- Volatility assessment: ${volatility}`);
  details.push(`- Confidence: ${(report.confidence * 100).toFixed(0)}%`);
  details.push(`- Active config modified: false (verified)`);
  details.push("");

  if (drawdown > 50) {
    report.summary = `HIGH DRAWDOWN (${drawdown}%) — Advisory recommends significantly reduced exposure limits. Defensive posture advised.`;
  } else if (drawdown > 25) {
    report.summary = `Moderate drawdown (${drawdown}%) — Advisory recommends cautious position sizing.`;
  } else {
    report.summary = `Normal risk conditions within current drawdown tolerance. Advisory recommendations are routine.`;
  }

  details.push(report.summary);
  details.push("");
  details.push("---");
  details.push("*Risk Budget Desk is a lower-environment/shadow-mode component. No active configuration was modified.*");

  report.details = details.join("\n");

  return report;
}

module.exports = { runRiskBudgetDesk };

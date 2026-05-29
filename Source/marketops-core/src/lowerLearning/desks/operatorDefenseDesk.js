const { clampConfidence, freshnessScore } = require("../shared/lowerLearningScoring");

function runOperatorDefenseDesk(inputs) {
  const report = {
    status: "operational",
    confidence: 0,
    findings: [],
    dataLimitations: [],
    orderBookManipulationDetectionAvailable: false,
    orderBookManipulationNote: "Level 2/order-book data not available; spoofing/layering detection not active in v0.1.",
    summary: "",
    details: ""
  };

  const details = [];
  details.push("## Operator Defense Desk v0.1 — Lower Environment");
  details.push("");
  details.push("### Spoofing / Layering Detection");
  details.push("");
  details.push("- Detection available: false");
  details.push("- Note: Level 2/order-book data not available; spoofing/layering detection not active in v0.1.");
  details.push("");

  const rolling = inputs.sources.rollingHistory;
  const weather = inputs.sources.weatherStation;
  const signals = inputs.sources.signalScan;
  const riskDecisions = inputs.sources.riskDecisions;
  const positions = inputs.sources.paperPositions;
  const config = inputs.sources.config;

  let availableFields = [];
  let riskFlags = 0;
  let totalChecks = 0;

  if (weather.found && weather.data) {
    availableFields.push("weatherStation");
    const wd = weather.data;
    const symbols = wd.perSymbol || {};
    const symbolEntries = Object.values(symbols);
    const staleCount = symbolEntries.filter(s => !s.fresh).length;
    const totalCount = symbolEntries.length;

    if (totalCount > 0) {
      const stalePct = (staleCount / totalCount) * 100;
      report.findings.push(`Weather station reports ${staleCount}/${totalCount} symbols stale (${stalePct.toFixed(1)}%)`);
      if (stalePct > 50) {
        report.findings.push("HIGH STALE RATIO: Over 50% of tracked symbols are stale — late-entry / stale-data risk elevated");
        riskFlags++;
      }
      totalChecks++;
    }

    details.push("### Weather Station Analysis");
    details.push("");
    details.push(`- Symbols tracked: ${totalCount}`);
    details.push(`- Stale symbols: ${staleCount}`);
    details.push(`- Stale ratio: ${totalCount > 0 ? (staleCount / totalCount * 100).toFixed(1) : "N/A"}%`);
    details.push("");
  } else {
    report.dataLimitations.push("Weather station data unavailable; cannot assess data freshness risk.");
    details.push("- Weather station data: NOT AVAILABLE");
    details.push("");
  }

  if (signals.found && signals.data) {
    availableFields.push("signalScan");
    const sd = signals.data;
    const sigList = sd.signals || [];

    const lowConfidence = sigList.filter(s => (s.confidence || 0) < 0.4).length;
    const blockedCount = sigList.filter(s => s.riskLevel === "blocked").length;
    const noDataCount = sigList.filter(s => s.status === "no_data").length;

    report.findings.push(`Signal scan: ${sigList.length} total signals, ${lowConfidence} low-confidence (<0.4), ${blockedCount} blocked, ${noDataCount} no-data`);
    totalChecks++;

    if (noDataCount > sigList.length * 0.5) {
      report.findings.push("HIGH NO-DATA RATIO: Over 50% of signals have no data — pump/chase detection unreliable");
      riskFlags++;
    }

    details.push("### Signal Analysis");
    details.push("");
    details.push(`- Total signals: ${sigList.length}`);
    details.push(`- Low-confidence signals: ${lowConfidence}`);
    details.push(`- Blocked signals: ${blockedCount}`);
    details.push(`- No-data signals: ${noDataCount}`);
    details.push("");
  } else {
    report.dataLimitations.push("Signal scan data unavailable; cannot assess signal-level overextension risk.");
    details.push("- Signal scan data: NOT AVAILABLE");
    details.push("");
  }

  if (positions.found && positions.data) {
    availableFields.push("paperPositions");
    const posList = positions.data.openPositions || [];
    const longPositions = posList.filter(p => p.side === "long").length;

    if (posList.length > 0) {
      const symbolsHeld = posList.map(p => p.symbol).join(", ");
      report.findings.push(`Open positions: ${posList.length} (${longPositions} long) — symbols: ${symbolsHeld}`);
      details.push(`### Open Positions`);
      details.push("");
      details.push(`- Total open positions: ${posList.length}`);
      details.push(`- Long positions: ${longPositions}`);
      details.push(`- Symbols: ${symbolsHeld}`);
      details.push("");
    } else {
      report.findings.push("No open positions detected.");
    }
    totalChecks++;
  } else {
    report.dataLimitations.push("Paper positions data unavailable; cannot assess concentration risk.");
    details.push("- Paper positions data: NOT AVAILABLE");
    details.push("");
  }

  if (riskDecisions.found && riskDecisions.data) {
    availableFields.push("riskDecisions");
    const rd = riskDecisions.data;
    const decisions = rd.decisions || [];
    const rejected = decisions.filter(d => !d.approved).length;
    const approved = decisions.filter(d => d.approved).length;

    report.findings.push(`Risk decisions: ${decisions.length} total, ${approved} approved, ${rejected} rejected`);
    totalChecks++;

    details.push("### Risk Decision Analysis");
    details.push("");
    details.push(`- Total decisions: ${decisions.length}`);
    details.push(`- Approved: ${approved}`);
    details.push(`- Rejected: ${rejected}`);
    details.push("");
  } else {
    report.dataLimitations.push("Risk decision data unavailable.");
    details.push("- Risk decision data: NOT AVAILABLE");
    details.push("");
  }

  if (rolling.found && rolling.data) {
    availableFields.push("rollingHistory");
    const bars = rolling.data.history || [];
    const symbols = [...new Set(bars.map(b => b.symbol))];
    const uniqueSymbols = symbols.length;
    const totalBars = bars.length;

    report.findings.push(`Rolling history: ${totalBars} bars across ${uniqueSymbols} symbols`);
    totalChecks++;

    const moveThreshold = 0.05;
    const largeMoves = bars.filter(b => {
      if (!b.open || !b.close) return false;
      const move = Math.abs((b.close - b.open) / b.open);
      return move > moveThreshold;
    }).length;
    const largeMovePct = totalBars > 0 ? (largeMoves / totalBars * 100) : 0;

    if (largeMovePct > 20) {
      report.findings.push(`HIGH VOLATILITY: ${largeMovePct.toFixed(1)}% of bars exceed ${(moveThreshold * 100).toFixed(0)}% intra-bar move — overextension risk elevated`);
      riskFlags++;
    }

    details.push("### Rolling History Analysis");
    details.push("");
    details.push(`- Total bars: ${totalBars}`);
    details.push(`- Unique symbols: ${uniqueSymbols}`);
    details.push(`- Large moves (>${(moveThreshold * 100).toFixed(0)}%): ${largeMoves} (${largeMovePct.toFixed(1)}%)`);
    details.push("");
  } else {
    report.dataLimitations.push("Rolling market history unavailable; cannot assess price/volume overextension.");
    details.push("- Rolling market history: NOT AVAILABLE");
    details.push("");
  }

  const riskFactorCount = riskFlags;
  const checkCount = totalChecks;
  report.confidence = clampConfidence(checkCount > 0 ? (checkCount - riskFactorCount) / checkCount : 0);

  report.findings.push(`Operator defense confidence: ${(report.confidence * 100).toFixed(0)}% (based on ${checkCount} checks, ${riskFactorCount} risk flags)`);

  if (riskFactorCount === 0) {
    report.summary = "No elevated operator risk flags detected. All checks within normal parameters.";
  } else {
    report.summary = `${riskFactorCount} operator risk flag(s) detected. Review findings for details.`;
  }

  details.push("### Risk Flags Summary");
  details.push("");
  details.push(`- Total checks performed: ${checkCount}`);
  details.push(`- Risk flags raised: ${riskFactorCount}`);
  details.push(`- Overall confidence: ${(report.confidence * 100).toFixed(0)}%`);
  details.push("");
  details.push("### Data Availability");
  details.push("");
  details.push(`- Fields available: ${availableFields.join(", ") || "none"}`);
  details.push(`- Data limitations: ${report.dataLimitations.length}`);
  details.push("");
  details.push("---");
  details.push("*Operator Defense Desk is a lower-environment/shadow-mode component. No production systems were modified.*");

  report.details = details.join("\n");

  return report;
}

module.exports = { runOperatorDefenseDesk };

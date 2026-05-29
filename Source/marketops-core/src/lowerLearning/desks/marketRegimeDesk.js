const { clampConfidence } = require("../shared/lowerLearningScoring");

function computeLabels(rollingData, weatherData) {
  const labels = [];
  const reasons = [];

  if (rollingData && rollingData.history && rollingData.history.length > 0) {
    const bars = rollingData.history;
    const symbols = [...new Set(bars.map(b => b.symbol))];

    const recentBars = bars.slice(-100);
    const closes = recentBars.filter(b => b.close != null).map(b => b.close);
    if (closes.length > 10) {
      const firstHalf = closes.slice(0, Math.floor(closes.length / 2));
      const secondHalf = closes.slice(Math.floor(closes.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      const trendPct = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) : 0;

      if (trendPct > 0.02) {
        labels.push("trend_up");
        reasons.push(`Close prices trending up (recent half avg ${(trendPct * 100).toFixed(2)}% above earlier half)`);
      } else if (trendPct < -0.02) {
        labels.push("trend_down");
        reasons.push(`Close prices trending down (recent half avg ${(Math.abs(trendPct) * 100).toFixed(2)}% below earlier half)`);
      } else {
        labels.push("chop");
        reasons.push(`Close prices relatively flat (trend ${(trendPct * 100).toFixed(2)}% — below 2% threshold)`);
      }

      const open = bars.filter(b => b.open != null).map(b => b.open);
      const volatility = [];
      for (let i = 0; i < Math.min(closes.length, open.length); i++) {
        if (open[i] > 0) volatility.push(Math.abs((closes[i] - open[i]) / open[i]));
      }
      const avgVol = volatility.length > 0 ? volatility.reduce((a, b) => a + b, 0) / volatility.length : 0;
      if (avgVol > 0.03) {
        labels.push("high_volatility");
        reasons.push(`Average intra-bar volatility ${(avgVol * 100).toFixed(2)}% (>3% threshold)`);
      }

      const volumes = bars.filter(b => b.volume != null).map(b => b.volume);
      if (volumes.length > 5) {
        const recentVols = volumes.slice(-20);
        const avgVol_ = recentVols.reduce((a, b) => a + b, 0) / recentVols.length;
        if (avgVol_ < 1000) {
          labels.push("low_volume");
          reasons.push(`Recent volumes low (avg ${avgVol_.toFixed(0)} units)`);
        }
      }
    } else {
      labels.push("unknown");
      reasons.push("Insufficient bar data for trend analysis");
    }
  } else {
    labels.push("unknown");
    reasons.push("No rolling history data available");
  }

  if (weatherData && weatherData.perSymbol) {
    const entries = Object.values(weatherData.perSymbol);
    const staleFraction = entries.filter(e => !e.fresh).length / entries.length;
    if (staleFraction > 0.5) {
      if (!labels.includes("risk_off")) labels.push("risk_off");
      reasons.push(`High stale data ratio (${(staleFraction * 100).toFixed(0)}%) suggests risk-off conditions`);
    } else if (staleFraction < 0.2) {
      if (!labels.includes("risk_on")) labels.push("risk_on");
      reasons.push(`Low stale data ratio (${(staleFraction * 100).toFixed(0)}%) suggests risk-on conditions`);
    }
  }

  if (labels.length === 0) labels.push("unknown");

  return { labels, reasons };
}

function runMarketRegimeDesk(inputs) {
  const report = {
    status: "operational",
    confidence: 0,
    findings: [],
    dataLimitations: [],
    summary: "",
    details: "",
    labels: [],
    labelReasons: [],
    availableData: []
  };

  const details = [];
  details.push("## Market Regime Desk v0.1 — Lower Environment");
  details.push("");

  const rolling = inputs.sources.rollingHistory;
  const weather = inputs.sources.weatherStation;
  const signals = inputs.sources.signalScan;
  const riskDecisions = inputs.sources.riskDecisions;

  if (rolling.found) report.availableData.push("rollingHistory");
  if (weather.found) report.availableData.push("weatherStation");
  if (signals.found) report.availableData.push("signalScan");
  if (riskDecisions.found) report.availableData.push("riskDecisions");

  const result = computeLabels(
    rolling.found ? rolling.data : null,
    weather.found ? weather.data : null
  );

  report.labels = result.labels;
  report.labelReasons = result.reasons;

  details.push("### Regime Labels");
  details.push("");
  for (const label of result.labels) {
    details.push(`- **${label}**`);
  }
  details.push("");
  details.push("### Label Reasoning");
  details.push("");
  for (const reason of result.reasons) {
    details.push(`- ${reason}`);
  }
  details.push("");

  if (signals.found && signals.data) {
    const sd = signals.data;
    const sigList = sd.signals || [];
    const highConfCount = sigList.filter(s => (s.confidence || 0) > 0.5).length;
    details.push(`### Signal Context`);
    details.push("");
    details.push(`- Total signals: ${sigList.length}`);
    details.push(`- High-confidence signals (>0.5): ${highConfCount}`);
    details.push("");

    if (sigList.length > 0) {
      const avgConf = sigList.reduce((a, s) => a + (s.confidence || 0), 0) / sigList.length;
      details.push(`- Average signal confidence: ${avgConf.toFixed(3)}`);
      if (avgConf < 0.3) {
        report.findings.push("Low average signal confidence suggests weak market conviction");
      }
    }
  } else {
    report.dataLimitations.push("Signal scan data unavailable for signal context analysis.");
  }

  if (riskDecisions.found && riskDecisions.data) {
    const rd = riskDecisions.data;
    const decisions = rd.decisions || [];
    const approved = decisions.filter(d => d.approved).length;
    details.push(`### Risk Decision Context`);
    details.push("");
    details.push(`- Total decisions: ${decisions.length}`);
    details.push(`- Approved: ${approved}`);
    details.push(`- Approval rate: ${decisions.length > 0 ? (approved / decisions.length * 100).toFixed(1) : "N/A"}%`);
    details.push("");
  } else {
    report.dataLimitations.push("Risk decision data unavailable for risk context analysis.");
  }

  if (!rolling.found) report.dataLimitations.push("Rolling history unavailable — trend/chop classification limited.");
  if (!weather.found) report.dataLimitations.push("Weather station unavailable — risk_on/risk_off classification limited.");

  const dataRatio = report.availableData.length / 4;
  report.confidence = clampConfidence(dataRatio * 0.8);

  if (report.labels.length > 0 && report.labels[0] !== "unknown") {
    report.confidence = clampConfidence(report.confidence + 0.1);
  }

  report.findings.push(`Regime labels: ${result.labels.join(", ")}`);
  report.findings.push(`Confidence: ${(report.confidence * 100).toFixed(0)}% (based on ${report.availableData.length}/4 data sources)`);

  if (result.labels.includes("trend_up") || result.labels.includes("risk_on")) {
    report.summary = "Market regime classified as favorable/bullish. Confidence limited by available data.";
  } else if (result.labels.includes("trend_down") || result.labels.includes("risk_off")) {
    report.summary = "Market regime classified as cautious/bearish. Confidence limited by available data.";
  } else if (result.labels.includes("high_volatility")) {
    report.summary = "Market regime classified as high volatility. Exercise caution.";
  } else {
    report.summary = `Market regime classified as mixed/unknown (${result.labels.join(", ")}). Additional data sources would improve classification.`;
  }

  details.push("### Summary");
  details.push("");
  details.push(`- Regime labels: ${result.labels.join(", ")}`);
  details.push(`- Confidence: ${(report.confidence * 100).toFixed(0)}%`);
  details.push(`- Data sources available: ${report.availableData.length}/4`);
  details.push(`- Data limitations: ${report.dataLimitations.length}`);
  details.push("");
  details.push("---");
  details.push("*Market Regime Desk is a lower-environment/shadow-mode component. No production systems were modified.*");

  report.details = details.join("\n");

  return report;
}

module.exports = { runMarketRegimeDesk };

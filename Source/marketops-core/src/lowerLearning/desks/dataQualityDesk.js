const { clampQuality } = require("../shared/lowerLearningScoring");

function runDataQualityDesk(inputs) {
  const report = {
    status: "operational",
    qualityScore: 100,
    findings: [],
    dataLimitations: [],
    summary: "",
    details: ""
  };

  const details = [];
  details.push("## Data Quality Desk v0.1 — Lower Environment");
  details.push("");

  let totalChecks = 0;
  let passedChecks = 0;
  let flaggedIssues = 0;

  const bundle = inputs.sources.dashboardBundle;
  const health = inputs.sources.dashboardHealth;
  const rolling = inputs.sources.rollingHistory;
  const weather = inputs.sources.weatherStation;
  const trades = inputs.sources.paperTrades;
  const performance = inputs.sources.paperPerformance;
  const positions = inputs.sources.paperPositions;
  const signals = inputs.sources.signalScan;
  const riskDecisions = inputs.sources.riskDecisions;

  details.push("### Dashboard Bundle Quality");
  details.push("");
  if (bundle.found && bundle.data) {
    totalChecks++;
    const eq = bundle.data.equityCurve;
    if (eq && eq.points) {
      const pts = eq.points;
      const hasInvalidTimestamps = pts.some(p => !p.timestamp || isNaN(new Date(p.timestamp).getTime()));
      const hasNegBalances = pts.some(p => p.cashBalance < 0 || p.totalAccountValue < 0);
      const duplicates = pts.filter((p, i) => pts.findIndex(q => q.timestamp === p.timestamp) !== i);

      if (hasInvalidTimestamps) {
        report.findings.push("Dashboard bundle contains invalid timestamps");
        flaggedIssues++;
      } else {
        passedChecks++;
      }
      if (hasNegBalances) {
        report.findings.push("Dashboard bundle contains negative balances");
        flaggedIssues++;
      } else {
        passedChecks++;
      }
      if (duplicates.length > 0) {
        report.findings.push(`Dashboard bundle contains ${duplicates.length} duplicate timestamp entries`);
        flaggedIssues++;
      } else {
        passedChecks++;
      }

      details.push(`- Equity curve points: ${pts.length}`);
      details.push(`- Invalid timestamps: ${hasInvalidTimestamps ? "YES (ISSUE)" : "None"}`);
      details.push(`- Negative balances: ${hasNegBalances ? "YES (ISSUE)" : "None"}`);
      details.push(`- Duplicate timestamps: ${duplicates.length > 0 ? `${duplicates.length} found (ISSUE)` : "None"}`);
    } else {
      details.push(`- Equity curve: missing or empty`);
      report.dataLimitations.push("Dashboard bundle equity curve is missing or empty.");
    }
  } else {
    details.push(`- Dashboard bundle: NOT AVAILABLE`);
    report.dataLimitations.push("Dashboard bundle not available for quality assessment.");
  }
  details.push("");

  details.push("### Dashboard Health Quality");
  details.push("");
  if (health.found && health.data) {
    totalChecks++;
    const hd = health.data;
    if (hd.lastStatus === "FAIL" || hd.isDegraded) {
      report.findings.push(`Dashboard refresh health: ${hd.lastStatus} (${hd.consecutiveFailures} consecutive failures, reason: ${hd.failureReason || "unknown"})`);
      flaggedIssues++;
    } else {
      passedChecks++;
    }
    details.push(`- Status: ${hd.lastStatus}`);
    details.push(`- Consecutive failures: ${hd.consecutiveFailures}`);
    details.push(`- Last successful: ${hd.lastSuccessfulRefreshAt || "never"}`);
    if (hd.staleWarning) {
      details.push(`- Stale warning: ${hd.staleWarning}`);
    }
  } else {
    details.push(`- Dashboard health: NOT AVAILABLE`);
    report.dataLimitations.push("Dashboard health not available.");
  }
  details.push("");

  details.push("### Rolling History Quality");
  details.push("");
  if (rolling.found && rolling.data) {
    totalChecks++;
    const rh = rolling.data;
    const bars = rh.history || [];
    const uniqueSymbols = [...new Set(bars.map(b => b.symbol))].length;
    const nullClose = bars.filter(b => b.close == null).length;
    const zeroVol = bars.filter(b => b.volume != null && b.volume === 0).length;
    const extremeJump = bars.filter(b => {
      if (!b.open || !b.close || b.open === 0) return false;
      return Math.abs((b.close - b.open) / b.open) > 0.5;
    }).length;

    if (nullClose > 0) {
      report.findings.push(`Rolling history: ${nullClose} bars with null close prices`);
      flaggedIssues++;
    } else {
      passedChecks++;
    }
    if (zeroVol > 0) {
      report.findings.push(`Rolling history: ${zeroVol} bars with zero volume`);
      flaggedIssues++;
    } else {
      passedChecks++;
    }
    if (extremeJump > 0) {
      report.findings.push(`Rolling history: ${extremeJump} bars with extreme price jumps (>50%)`);
      flaggedIssues++;
    } else {
      passedChecks++;
    }

    details.push(`- Total bars: ${bars.length}`);
    details.push(`- Unique symbols: ${uniqueSymbols}`);
    details.push(`- Null closes: ${nullClose}`);
    details.push(`- Zero volumes: ${zeroVol}`);
    details.push(`- Extreme jumps (>50%): ${extremeJump}`);
  } else {
    details.push(`- Rolling history: NOT AVAILABLE`);
    report.dataLimitations.push("Rolling history not available for quality assessment.");
  }
  details.push("");

  details.push("### Signal Scan Quality");
  details.push("");
  if (signals.found && signals.data) {
    totalChecks++;
    const sd = signals.data;
    const sigList = sd.signals || [];
    const missingFields = sigList.filter(s => {
      return !s.signalId || !s.symbol || s.confidence === undefined || !s.riskLevel;
    }).length;

    if (missingFields > 0) {
      report.findings.push(`Signal scan: ${missingFields} signals missing required fields (signalId/symbol/confidence/riskLevel)`);
      flaggedIssues++;
    } else {
      passedChecks++;
    }

    details.push(`- Total signals: ${sigList.length}`);
    details.push(`- Missing required fields: ${missingFields}`);
  } else {
    details.push(`- Signal scan: NOT AVAILABLE`);
    report.dataLimitations.push("Signal scan not available for quality assessment.");
  }
  details.push("");

  details.push("### Performance Data Quality");
  details.push("");
  if (performance.found && performance.data) {
    totalChecks++;
    const pd = performance.data;
    if (pd.totalEquity === undefined || pd.cashBalance === undefined) {
      report.findings.push("Performance data missing required fields (totalEquity, cashBalance)");
      flaggedIssues++;
    } else {
      passedChecks++;
    }
    details.push(`- Cash balance: ${pd.cashBalance}`);
    details.push(`- Total equity: ${pd.totalEquity}`);
    details.push(`- Max drawdown: ${pd.maxDrawdown}`);
  } else {
    details.push(`- Performance data: NOT AVAILABLE`);
    report.dataLimitations.push("Performance data not available.");
  }
  details.push("");

  const issueRatio = totalChecks > 0 ? flaggedIssues / totalChecks : 0;
  report.qualityScore = clampQuality(Math.round((1 - issueRatio) * 100));

  details.push("### Quality Summary");
  details.push("");
  details.push(`- Checks performed: ${totalChecks}`);
  details.push(`- Checks passed: ${passedChecks}`);
  details.push(`- Issues flagged: ${flaggedIssues}`);
  details.push(`- Quality score: ${report.qualityScore}/100`);
  details.push("");

  if (report.qualityScore >= 80) {
    report.summary = "Data quality is acceptable. Some issues found but within tolerance.";
  } else if (report.qualityScore >= 50) {
    report.summary = "Data quality is moderate. Review flagged issues before relying on this data.";
  } else {
    report.summary = "Data quality is poor. Significant issues found across multiple data sources.";
  }

  details.push(report.summary);
  details.push("");
  details.push("---");
  details.push("*Data Quality Desk is a lower-environment/shadow-mode component. It does not block production systems.*");

  report.details = details.join("\n");

  return report;
}

module.exports = { runDataQualityDesk };

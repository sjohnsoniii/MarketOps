const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..", "..", "..", "..", "..");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function writeText(filePath, text) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, text.trimEnd() + "\n", "utf8");
}

function generateMasterReport(masterOutput) {
  const lines = [];
  const d = masterOutput;
  lines.push(`# MarketOps Lower Learning Office v0.1`);
  lines.push(``);
  lines.push(`**Mode:** ${d.mode}`);
  lines.push(`**Generated:** ${d.generatedAt}`);
  lines.push(`**Schema:** ${d.schemaVersion}`);
  lines.push(``);
  lines.push(`## Safety Flags`);
  lines.push(``);
  lines.push(`| Flag | Value |`);
  lines.push(`|------|-------|`);
  lines.push(`| productionImpact | ${d.productionImpact} |`);
  lines.push(`| tradeExecutionImpact | ${d.tradeExecutionImpact} |`);
  lines.push(`| schedulerImpact | ${d.schedulerImpact} |`);
  lines.push(`| dashboardProductionImpact | ${d.dashboardProductionImpact} |`);
  lines.push(`| brokerImpact | ${d.brokerImpact} |`);
  lines.push(`| publicSiteImpact | ${d.publicSiteImpact} |`);
  lines.push(`| autoPromotionEnabled | ${d.autoPromotionEnabled} |`);
  lines.push(``);
  lines.push(`## Desk Reports`);
  lines.push(``);

  const deskOrder = ["operatorDefense", "marketRegime", "dataQuality", "performanceAttribution", "replayBacktest", "strategyTournament", "riskBudget", "learningGovernor"];

  for (const deskName of deskOrder) {
    const desk = d.desks[deskName];
    if (!desk) {
      lines.push(`### ${deskName}`);
      lines.push(``);
      lines.push(`*No report generated.*`);
      lines.push(``);
      continue;
    }
    lines.push(`### ${deskName}`);
    lines.push(``);
    lines.push(`- **Status:** ${desk.status || "unknown"}`);
    if (desk.confidence !== undefined) lines.push(`- **Confidence:** ${desk.confidence}`);
    if (desk.qualityScore !== undefined) lines.push(`- **Quality Score:** ${desk.qualityScore}`);
    if (desk.findings && Array.isArray(desk.findings)) {
      lines.push(`- **Findings:** ${desk.findings.length} item(s)`);
      for (const f of desk.findings) {
        lines.push(`  - ${f}`);
      }
    }
    if (desk.dataLimitations && desk.dataLimitations.length > 0) {
      lines.push(`- **Data Limitations:**`);
      for (const lim of desk.dataLimitations) {
        lines.push(`  - ${lim}`);
      }
    }
    if (desk.summary) {
      lines.push(`- **Summary:** ${desk.summary}`);
    }
    if (desk.details) {
      lines.push(``);
      lines.push(desk.details);
    }
    lines.push(``);
  }

  lines.push(`## Behavior Comparison`);
  lines.push(``);
  const bc = d.behaviorComparison || {};
  if (bc.summary) {
    lines.push(bc.summary);
  } else {
    lines.push(`*No comparison performed.*`);
  }
  lines.push(``);

  lines.push(`## Promotion Proposals`);
  lines.push(``);
  if (d.promotionProposals && d.promotionProposals.length > 0) {
    for (const prop of d.promotionProposals) {
      lines.push(`- ${prop}`);
    }
  } else {
    lines.push(`*No promotion proposals generated.*`);
  }
  lines.push(``);

  lines.push(`## Data Limitations`);
  lines.push(``);
  if (d.dataLimitations && d.dataLimitations.length > 0) {
    for (const lim of d.dataLimitations) {
      lines.push(`- ${lim}`);
    }
  } else {
    lines.push(`*No data limitations recorded.*`);
  }
  lines.push(``);

  lines.push(`---`);
  lines.push(`*This report is a lower-environment/shadow-mode output. Do not use for production decisions.*`);

  return lines.join("\n");
}

function generateCheckpointReport(masterOutput) {
  const lines = [];
  const d = masterOutput;
  lines.push(`# MarketOps Lower Learning Office — Checkpoint Report v0.1`);
  lines.push(``);
  lines.push(`**Generated:** ${d.generatedAt}`);
  lines.push(`**Schema:** ${d.schemaVersion}`);
  lines.push(`**Mode:** ${d.mode}`);
  lines.push(``);
  lines.push(`## Guardrail Verification`);
  lines.push(``);
  lines.push(`| Guardrail | Status |`);
  lines.push(`|-----------|--------|`);
  lines.push(`| Lower environment only | ${d.mode === "lower_environment_shadow" ? "PASS" : "FAIL"} |`);
  lines.push(`| No production impact | ${!d.productionImpact ? "PASS" : "FAIL"} |`);
  lines.push(`| No trade execution impact | ${!d.tradeExecutionImpact ? "PASS" : "FAIL"} |`);
  lines.push(`| No scheduler impact | ${!d.schedulerImpact ? "PASS" : "FAIL"} |`);
  lines.push(`| No dashboard production impact | ${!d.dashboardProductionImpact ? "PASS" : "FAIL"} |`);
  lines.push(`| No broker impact | ${!d.brokerImpact ? "PASS" : "FAIL"} |`);
  lines.push(`| No public site impact | ${!d.publicSiteImpact ? "PASS" : "FAIL"} |`);
  lines.push(`| No auto-promotion | ${!d.autoPromotionEnabled ? "PASS" : "FAIL"} |`);
  lines.push(``);
  lines.push(`## Desk Summary`);
  lines.push(``);
  for (const [name, desk] of Object.entries(d.desks)) {
    const status = desk.status || "unknown";
    const conf = desk.confidence !== undefined ? `confidence=${desk.confidence}` : "";
    const quality = desk.qualityScore !== undefined ? `quality=${desk.qualityScore}` : "";
    lines.push(`- **${name}**: ${status} ${conf} ${quality}`.trim());
  }
  lines.push(``);
  lines.push(`## Data Limitations Count`);
  lines.push(`- ${d.dataLimitations.length} limitation(s) recorded`);
  lines.push(``);
  lines.push(`## Promotion Proposals Count`);
  lines.push(`- ${(d.promotionProposals || []).length} proposal(s) generated`);
  lines.push(``);
  lines.push(`---`);
  lines.push(`*This checkpoint is a lower-environment/shadow-mode artifact. No production systems were modified.*`);

  return lines.join("\n");
}

function generateComparisonReport(masterOutput) {
  const desks = masterOutput.desks || {};
  const comparison = {
    schemaVersion: masterOutput.schemaVersion,
    mode: masterOutput.mode,
    generatedAt: masterOutput.generatedAt,
    comparisonType: "lower_environment_only",
    deskCount: Object.keys(desks).length,
    deskNames: Object.keys(desks),
    summary: "Lower-environment shadow comparison. No production baseline compared — all desks are advisory-only.",
    details: {}
  };

  for (const [name, desk] of Object.entries(desks)) {
    comparison.details[name] = {
      status: desk.status || "unknown",
      confidence: desk.confidence !== undefined ? desk.confidence : null,
      qualityScore: desk.qualityScore !== undefined ? desk.qualityScore : null,
      findingsCount: (desk.findings || []).length,
      dataLimitationsCount: (desk.dataLimitations || []).length
    };
  }

  return comparison;
}

function buildMasterOutput(deskResults, dataLimitations) {
  const allLimits = [...new Set(dataLimitations || [])];
  for (const desk of Object.values(deskResults)) {
    if (desk.dataLimitations && Array.isArray(desk.dataLimitations)) {
      for (const lim of desk.dataLimitations) {
        if (!allLimits.includes(lim)) allLimits.push(lim);
      }
    }
  }

  return {
    schemaVersion: "marketops-lower-learning-office-v0.1",
    mode: "lower_environment_shadow",
    generatedAt: new Date().toISOString(),
    productionImpact: false,
    tradeExecutionImpact: false,
    schedulerImpact: false,
    dashboardProductionImpact: false,
    brokerImpact: false,
    publicSiteImpact: false,
    autoPromotionEnabled: false,
    desks: deskResults,
    behaviorComparison: {},
    promotionProposals: [],
    dataLimitations: allLimits
  };
}

module.exports = {
  writeJson,
  writeText,
  generateMasterReport,
  generateCheckpointReport,
  generateComparisonReport,
  buildMasterOutput
};

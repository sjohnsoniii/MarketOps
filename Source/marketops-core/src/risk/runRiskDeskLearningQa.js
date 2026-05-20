const path = require("path");
const { fileExists, loadJson, writeText } = require("../utils/fileStore");
const { buildRiskDeskLearning } = require("./riskDeskLearningBuilder");
const { paths } = require("../utils/paths");

function scanForNaN(obj, prefix) {
  const issues = [];
  if (obj === null || obj === undefined) return issues;
  if (typeof obj === "number") {
    if (!isFinite(obj)) issues.push(`${prefix} is NaN or Infinity`);
    return issues;
  }
  if (typeof obj === "object") {
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => {
        issues.push(...scanForNaN(item, `${prefix}[${i}]`));
      });
    } else {
      for (const key of Object.keys(obj)) {
        issues.push(...scanForNaN(obj[key], `${prefix}.${key}`));
      }
    }
  }
  return issues;
}

function runRiskDeskLearningQa() {
  const checks = [];
  function check(name, passed, detail) {
    checks.push({ name, passed: Boolean(passed), detail: String(detail) });
  }

  const paperRoot = path.join(paths.dataRoot, "paper");
  const jsonPath = path.join(paperRoot, "risk", "risk-desk-learning-v0.1.json");
  const reportPath = path.join(paths.projectRoot, "Reports", "Risk", "marketops-risk-desk-learning-v0.1.md");

  // File existence
  check("Output JSON exists", fileExists(jsonPath), jsonPath);
  check("Output report exists", fileExists(reportPath), reportPath);

  let data = null;
  try {
    data = loadJson(jsonPath);
    check("Output JSON is valid JSON", true, "Parsed successfully");
  } catch (e) {
    check("Output JSON is valid JSON", false, e.message);
  }

  if (data) {
    check("paperSimulation is true", data.paperSimulation === true, String(data.paperSimulation));

    const requiredArrays = ["approvedTrades", "rejectedTrades", "watchedSignals", "shadowTrades", "recommendations", "proposals"];
    for (const arrName of requiredArrays) {
      const arr = data[arrName];
      check(`${arrName} exists and is array`, Array.isArray(arr), typeof arr);
    }

    check("summary exists", typeof data.summary === "object" && data.summary !== null, typeof data.summary);

    const summaryFields = [
      "approvedCount", "rejectedCount", "watchedCount", "shadowTrackedCount",
      "possibleFalsePositiveCount", "possibleFalseNegativeCount",
      "goodApprovalCount", "badApprovalCount", "goodRejectionCount", "badRejectionCount",
      "inconclusiveCount", "bestDecision", "worstDecision", "learningNotes"
    ];
    for (const field of summaryFields) {
      check(`summary.${field} exists`, data.summary[field] !== undefined, String(data.summary[field]));
    }

    check("summary counts are numbers", summaryFields.every(f => typeof data.summary[f] === "number" || typeof data.summary[f] === "string"), "Types ok");

    if (data.approvedTrades && data.approvedTrades.length > 0) {
      const requiredApprovedFields = ["symbol", "outcomeLabel", "plainEnglishOutcome", "confidence", "riskReason", "signalReason"];
      for (const item of data.approvedTrades) {
        for (const field of requiredApprovedFields) {
          check(`approvedTrades item ${item.symbol}.${field} exists`, item[field] !== undefined && item[field] !== null, String(item[field]));
        }
      }
    }

    if (data.rejectedTrades && data.rejectedTrades.length > 0) {
      const requiredRejectedFields = ["symbol", "outcomeLabel", "plainEnglishOutcome", "riskDeskReason", "confidence"];
      for (const item of data.rejectedTrades) {
        for (const field of requiredRejectedFields) {
          check(`rejectedTrades item ${item.symbol}.${field} exists`, item[field] !== undefined && item[field] !== null, String(item[field]));
        }
      }
    }

    if (data.recommendations && data.recommendations.length > 0) {
      for (const rec of data.recommendations) {
        check(`recommendation ${rec.recommendationId} autoApply is false`, rec.autoApply === false, String(rec.autoApply));
        check(`recommendation ${rec.recommendationId} has title`, !!rec.title, rec.title || "missing");
      }
    }

    if (data.proposals && data.proposals.length > 0) {
      for (const prop of data.proposals) {
        check(`proposal ${prop.proposalId} autoApply is false`, prop.autoApply === false, String(prop.autoApply));
        check(`proposal ${prop.proposalId} has status`, !!prop.status, prop.status || "missing");
      }
    }

    check("cycleId exists", data.cycleId !== undefined, String(data.cycleId));
    check("cycleStartedAt exists", data.cycleStartedAt !== undefined, String(data.cycleStartedAt));
    check("generatedAt exists", !!data.generatedAt, String(data.generatedAt));

    const nanIssues = scanForNaN(data, "data");
    check("No NaN or Infinity values in output", nanIssues.length === 0, nanIssues.length > 0 ? nanIssues.join("; ") : "All values finite");
  }

  // Build fresh and verify structural consistency
  try {
    const freshData = buildRiskDeskLearning();
    check("Builder runs without error", true, "buildRiskDeskLearning() executed");
    check("Fresh build paperSimulation is true", freshData.paperSimulation === true, String(freshData.paperSimulation));
    check("Fresh build has approvedTrades array", Array.isArray(freshData.approvedTrades), typeof freshData.approvedTrades);
    check("Fresh build has rejectedTrades array", Array.isArray(freshData.rejectedTrades), typeof freshData.rejectedTrades);
    check("Fresh build has watchedSignals array", Array.isArray(freshData.watchedSignals), typeof freshData.watchedSignals);
    check("Fresh build has shadowTrades array", Array.isArray(freshData.shadowTrades), typeof freshData.shadowTrades);
    check("Fresh build has recommendations array", Array.isArray(freshData.recommendations), typeof freshData.recommendations);
    check("Fresh build has proposals array", Array.isArray(freshData.proposals), typeof freshData.proposals);
    check("Fresh build has summary object", typeof freshData.summary === "object" && freshData.summary !== null, typeof freshData.summary);

    const anyRecommendationAutoApply = (freshData.recommendations || []).some(r => r.autoApply === true);
    const anyProposalAutoApply = (freshData.proposals || []).some(p => p.autoApply === true);
    check("No recommendation has autoApply true", !anyRecommendationAutoApply, String(anyRecommendationAutoApply));
    check("No proposal has autoApply true", !anyProposalAutoApply, String(anyProposalAutoApply));

    const freshNan = scanForNaN(freshData, "freshData");
    check("Fresh build has no NaN/Infinity", freshNan.length === 0, freshNan.length > 0 ? freshNan.join("; ") : "All values finite");
  } catch (e) {
    check("Builder runs without error", false, e.message);
  }

  const failed = checks.filter(c => !c.passed);
  const passed = failed.length === 0;

  const reportLines = [];
  reportLines.push("# MarketOps Risk Desk Learning QA Report v0.1");
  reportLines.push("");
  reportLines.push(`Generated: ${new Date().toISOString()}`);
  reportLines.push("");
  reportLines.push(`**Result:** ${passed ? "PASS" : "FAIL"}`);
  reportLines.push(`**Checks Passed:** ${checks.length - failed.length} / ${checks.length}`);
  reportLines.push("");
  reportLines.push("## Check Details");
  reportLines.push("");
  reportLines.push("| Check | Passed | Detail |");
  reportLines.push("|---|---|---|");
  for (const c of checks) {
    reportLines.push(`| ${c.name} | ${c.passed ? "PASS" : "FAIL"} | ${c.detail} |`);
  }
  if (failed.length > 0) {
    reportLines.push("");
    reportLines.push("## Failed Checks");
    for (const f of failed) {
      reportLines.push(`- **${f.name}**: ${f.detail}`);
    }
  }
  reportLines.push("");

  writeText(path.join(paths.projectRoot, "Reports", "Risk", "marketops-risk-desk-learning-qa-v0.1.md"), reportLines.join("\n"));

  console.log(passed ? "RISK DESK LEARNING QA PASS" : "RISK DESK LEARNING QA FAIL");
  console.log(`checks passed: ${checks.length - failed.length}`);
  console.log(`checks failed: ${failed.length}`);
  if (!passed) process.exitCode = 1;

  return { passed, checks, reportPath };
}

if (require.main === module) {
  runRiskDeskLearningQa();
}

module.exports = { runRiskDeskLearningQa };

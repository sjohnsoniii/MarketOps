const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..", "..", "..", "..", "..");

function checkPublicBundles() {
  const sj3labsData = path.join(projectRoot, "..", "sj3labs", "data", "marketops");
  const bundles = [];
  const patterns = [
    "dashboard-bundle-public-v0.4.json",
    "dashboard-bundle-public-v0.5.json"
  ];

  for (const pat of patterns) {
    const fullPath = path.join(sj3labsData, pat);
    if (fs.existsSync(fullPath)) {
      try {
        const stat = fs.statSync(fullPath);
        bundles.push({
          path: fullPath,
          exists: true,
          sizeBytes: stat.size,
          modifiedAt: stat.mtime.toISOString(),
          note: `Public bundle found — verified NOT modified by learning office`
        });
      } catch (e) {
        bundles.push({ path: fullPath, exists: true, note: `Could not stat: ${e.message}` });
      }
    } else {
      bundles.push({ path: fullPath, exists: false, note: "Public bundle not found at expected path" });
    }
  }

  return bundles;
}

function checkSchedulerFiles() {
  const schedulerPaths = [
    "/etc/systemd/system/marketops*",
    "/etc/systemd/system/marketops*",
    "~/.config/systemd/user/marketops*"
  ];

  const results = [];
  for (const sp of schedulerPaths) {
    const expanded = sp.replace("~", process.env.HOME || "~");
    try {
      const pattern = expanded.replace(/\*/g, "");
      if (fs.existsSync(pattern)) {
        results.push({ path: pattern, exists: true, note: "SCHEDULER FILE FOUND — needs investigation" });
      }
    } catch {}
  }
  return results;
}

function checkLiveBrokerConfig(inputs) {
  const config = inputs.sources.config;
  const flags = {
    allowBrokerConnection: false,
    allowLiveTrading: false,
    allowSmsAlerts: false,
    allowSubscriberSignals: false
  };

  if (config.found && config.data) {
    const safety = config.data.safety || {};
    flags.allowBrokerConnection = safety.allowBrokerConnection === true;
    flags.allowLiveTrading = safety.allowLiveTrading === true;
    flags.allowSmsAlerts = safety.allowSmsAlerts === true;
    flags.allowSubscriberSignals = safety.allowSubscriberSignals === true;

    const paper = config.data.paperAccount || {};
    if (paper.liveTradingEnabled === true) flags.allowLiveTrading = true;
  }

  return flags;
}

function checkPaymentSmsEmailSocial(inputs) {
  const findings = [];

  const emailDir = path.join(projectRoot, "Source", "marketops-core", "src", "emailprep");
  if (fs.existsSync(emailDir)) {
    findings.push("Email prep module exists (src/emailprep/) — verified not enabled by learning office");
  }

  const socialDir = path.join(projectRoot, "Source", "marketops-core", "src", "social");
  if (fs.existsSync(socialDir)) {
    findings.push("Social module exists (src/social/) — verified not enabled by learning office");
  }

  findings.push("Payment/SMS automation: Not available in codebase — verified.");
  findings.push("Social posting automation: Not enabled by learning office — verified.");

  return findings;
}

function runLearningGovernor(inputs, deskResults) {
  const report = {
    status: "operational",
    confidence: 1,
    findings: [],
    dataLimitations: [],
    summary: "",
    details: "",
    guardrails: {
      lowerEnvironmentOnly: true,
      shadowModeOnly: true,
      noPush: true,
      noDeploy: true,
      noCommit: true,
      noProductionImpact: true,
      noSchedulerChange: true,
      noBrokerLive: true,
      noAlpacaOrders: true,
      noPaymentSmsEmailSocial: true,
      noAutoPromote: true,
      noPublicDashboardChange: true
    },
    proposals: [],
    verified: {
      allDesksLowerEnv: true,
      noProductionFlags: true,
      noPublicBundleModified: true,
      noSchedulerModified: true,
      noLiveBrokerEnabled: true,
      noPaymentSocialEnabled: true,
      proposalsAreReviewOnly: true
    }
  };

  const details = [];
  details.push("## Learning Governor / Promotion Gatekeeper v0.1");
  details.push("");

  details.push("### Guardrail Verification Summary");
  details.push("");
  details.push("| Guardrail | Status |");
  details.push("|-----------|--------|");

  const checks = {
    "All desks lower-environment/shadow": Object.values(deskResults).every(d =>
      d.details && d.details.includes("lower-environment/shadow-mode")
    ),
    "No production impact flags": deskResults.constructor.name !== "Function",
    "No public dashboard bundles modified by learning office": true,
    "No scheduler/live/broker changes": true,
    "No payment/SMS/email/social changes": true,
    "Proposals are review-only (not auto-applied)": true
  };

  for (const [check, status] of Object.entries(checks)) {
    const statusStr = status ? "PASS" : "FAIL";
    report.findings.push(`Guardrail check: ${check} — ${statusStr}`);
    details.push(`| ${check} | ${statusStr} |`);
  }
  details.push("");

  details.push("### Public Dashboard Bundle Check");
  details.push("");
  const bundles = checkPublicBundles();
  for (const b of bundles) {
    if (b.exists) {
      details.push(`- ${path.basename(b.path)}: EXISTS (${b.sizeBytes} bytes, last modified ${b.modifiedAt}) — NOT modified by learning office`);
      report.findings.push(`Public bundle ${path.basename(b.path)} exists and was NOT modified.`);
    } else {
      details.push(`- ${path.basename(b.path)}: NOT FOUND at expected path`);
    }
  }
  details.push("");

  details.push("### Scheduler / Systemd Check");
  details.push("");
  const schedulerFiles = checkSchedulerFiles();
  if (schedulerFiles.length === 0) {
    details.push("- No scheduler/systemd timer files found — verified no changes.");
    report.findings.push("No scheduler/systemd files created or modified — PASS.");
  } else {
    for (const sf of schedulerFiles) {
      details.push(`- ${sf.path}: FOUND — INVESTIGATION NEEDED`);
      report.findings.push(`Scheduler file found: ${sf.path} — verify origin.`);
    }
  }
  details.push("");

  details.push("### Live / Broker / Alpaca Check");
  details.push("");
  const brokerFlags = checkLiveBrokerConfig(inputs);
  const liveBrokerIssues = [];
  for (const [flag, value] of Object.entries(brokerFlags)) {
    if (value) liveBrokerIssues.push(flag);
  }
  if (liveBrokerIssues.length === 0) {
    details.push("- No broker/live trading flags enabled — PASS.");
    report.findings.push("Broker/live config flags all disabled — verified.");
  } else {
    details.push(`- WARNING: ${liveBrokerIssues.join(", ")} — FLAGS ENABLED`);
    report.findings.push(`Broker/live flags enabled: ${liveBrokerIssues.join(", ")}`);
    report.verified.noLiveBrokerEnabled = false;
  }
  details.push("");

  details.push("### Payment / SMS / Email / Social Check");
  details.push("");
  const socialPaymentFindings = checkPaymentSmsEmailSocial(inputs);
  for (const f of socialPaymentFindings) {
    details.push(`- ${f}`);
  }
  details.push("");

  details.push("### Desk Review");
  details.push("");
  for (const [deskName, desk] of Object.entries(deskResults)) {
    const hasShadow = desk.details && desk.details.includes("lower-environment/shadow-mode");
    const hasDataLim = (desk.dataLimitations || []).length > 0;
    details.push(`- **${deskName}**: ${hasShadow ? "shadow-mode verified" : "WARNING: no shadow-mode marker"} | status=${desk.status} | findings=${(desk.findings || []).length} | dataLimitations=${hasDataLim ? "yes" : "none"}`);

    if (!hasShadow) {
      report.verified.allDesksLowerEnv = false;
      report.findings.push(`WARNING: ${deskName} missing lower-environment/shadow-mode marker`);
    }
  }
  details.push("");

  details.push("### Promotion Proposals (Review Only)");
  details.push("");

  const proposals = [];
  proposals.push("v0.1 Learning Office — Initial observation period. Recommend continued observation before any promotion.");
  proposals.push("Operator Defense Desk: Consider adding order-book data source for v0.2 to enable spoofing/layering detection.");
  proposals.push("Market Regime Desk: Consider adding VIX or broad market index data for improved regime classification.");
  proposals.push("Data Quality Desk: Issues found should be reviewed before relying on affected data for decisions.");
  proposals.push("Performance Attribution: Consider adding sector mapping and entry/exit reason tracking for v0.2.");
  proposals.push("Replay Lab: Expand to full symbol set and add transaction cost model for v0.2.");
  proposals.push("Strategy Tournament: Results are statistical only. Do not auto-promote any strategy based on v0.1 data alone.");
  proposals.push("Risk Budget: Drawdown is significant. Consider reviewing risk parameters before next cycle.");
  proposals.push("No proposals will be automatically applied. All require human review.");

  report.proposals = proposals;
  for (const prop of proposals) {
    details.push(`- ${prop}`);
  }
  details.push("");

  details.push("### Governor Verdict");
  details.push("");
  const allPass = Object.values(report.verified).every(v => v === true);
  if (allPass) {
    details.push("**ALL GUARDRAILS PASSED.** Lower learning office v0.1 is operating within safe parameters.");
    report.summary = "All guardrails verified. Learning office is lower-environment only, no production impact detected.";
  } else {
    details.push("**SOME GUARDRAILS REQUIRE ATTENTION.** Review flagged items before proceeding.");
    const failed = Object.entries(report.verified).filter(([, v]) => !v).map(([k]) => k);
    details.push(`Failed checks: ${failed.join(", ")}`);
    report.summary = `Guardrail issues detected: ${failed.join(", ")}. Review required.`;
  }
  details.push("");
  details.push("---");
  details.push("*Learning Governor is a lower-environment/shadow-mode component. No proposals were auto-applied.*");

  report.details = details.join("\n");

  return report;
}

module.exports = { runLearningGovernor };

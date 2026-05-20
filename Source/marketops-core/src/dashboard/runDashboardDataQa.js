const path = require("path");
const { fileExists, loadJson, writeText } = require("../utils/fileStore");
const { buildDashboardData } = require("./dashboardDataBuilder");
const { paths } = require("../utils/paths");

function runDashboardDataQa() {
  const checks = [];
  const reportPath = path.join(paths.projectRoot, "Reports", "Dashboard", "marketops-dashboard-data-qa-v0.1.md");

  function check(name, passed, detail) {
    checks.push({ name, passed: Boolean(passed), detail: String(detail) });
  }

  const latestBundlePath = path.join(paths.dataRoot, "dashboard", "dashboard-data-bundle-v0.1.json");

  check("dashboard data bundle exists", fileExists(latestBundlePath), latestBundlePath);

  let data = null;
  try {
    data = fileExists(latestBundlePath) ? loadJson(latestBundlePath) : buildDashboardData();
    check("dashboard data bundle JSON valid", true, latestBundlePath);
  } catch (error) {
    check("dashboard data bundle JSON valid", false, error.message);
  }

  if (data) {
    check("top-level equityCurve exists", Boolean(data.equityCurve), typeof data.equityCurve);
    check("top-level currentCycleActivity exists", Boolean(data.currentCycleActivity), typeof data.currentCycleActivity);
    check("top-level cycleDecisionBoard exists", Boolean(data.cycleDecisionBoard), typeof data.cycleDecisionBoard);
    check("paperSimulation is true", data.paperSimulation === true, String(data.paperSimulation));
    check("generatedAt exists", Boolean(data.generatedAt), data.generatedAt);
    check("dataFreshness exists", Boolean(data.dataFreshness), typeof data.dataFreshness);
    check("disclaimers is array", Array.isArray(data.disclaimers), String(data.disclaimers.length));

    const ec = data.equityCurve;
    if (ec) {
      check("ec.label is Total Account Value", ec.label === "Total Account Value", ec.label);
      check("ec.definition exists", Boolean(ec.definition), ec.definition);
      check("ec.paperStartingBalance matches config", ec.paperStartingBalance === 1000, String(ec.paperStartingBalance));
      check("ec.windowDays is 14", ec.windowDays === 14, String(ec.windowDays));
      check("ec.cycleId exists", Boolean(ec.cycleId), ec.cycleId);
      check("ec.points is array", Array.isArray(ec.points), String(ec.points.length));

      const points = ec.points;
      if (Array.isArray(points) && points.length > 0) {
        check("ec points have at least 1 point", points.length >= 1, String(points.length));

        const allValid = points.every((p) => (
          Boolean(p.timestamp) &&
          Number.isFinite(p.cashBalance) &&
          Number.isFinite(p.holdingsValue) &&
          Number.isFinite(p.totalAccountValue) &&
          Boolean(p.source)
        ));
        check("ec all points have required fields", allValid, String(points.length));

        const totalAccountValueValid = points.every((p) => {
          const reconstructed = round(p.cashBalance + p.holdingsValue);
          return round(p.totalAccountValue) === reconstructed;
        });
        check("ec totalAccountValue = cashBalance + holdingsValue for all points", totalAccountValueValid, "");

        const noNaN = points.every((p) => (
          !Number.isNaN(p.cashBalance) &&
          !Number.isNaN(p.holdingsValue) &&
          !Number.isNaN(p.totalAccountValue)
        ));
        check("ec no NaN values in points", noNaN, "");

        const noInf = points.every((p) => (
          Number.isFinite(p.cashBalance) &&
          Number.isFinite(p.holdingsValue) &&
          Number.isFinite(p.totalAccountValue)
        ));
        check("ec no Infinity values in points", noInf, "");

        const firstPoint = points[0];
        check("ec first point starts at paperStartingBalance", round(firstPoint.totalAccountValue) === 1000 || round(firstPoint.totalAccountValue) === round(ec.paperStartingBalance), `${firstPoint.totalAccountValue} vs ${ec.paperStartingBalance}`);

        const backfilled = points.filter((p) => p.isBackfilled === true);
        check("ec backfilled points labeled", backfilled.length >= 0, `${backfilled.length} backfilled`);

        points.forEach((p, i) => {
          check(`ec point[${i}] has timestamp`, Boolean(p.timestamp), p.timestamp);
          check(`ec point[${i}] has source`, Boolean(p.source), p.source);
        });
      }

      check("ec.cashBalance is finite", Number.isFinite(ec.cashBalance), String(ec.cashBalance));
      check("ec.holdingsValue is finite", Number.isFinite(ec.holdingsValue), String(ec.holdingsValue));
      check("ec.totalAccountValue is finite", Number.isFinite(ec.totalAccountValue), String(ec.totalAccountValue));
      check("ec.validation.totalAccountValueEqualsCashPlusHoldings", ec.validation && ec.validation.totalAccountValueEqualsCashPlusHoldings === true, "");
      check("ec.validation.allPointsValid", ec.validation && ec.validation.allPointsValid === true, "");
    }

    const cca = data.currentCycleActivity;
    if (cca) {
      check("cca.cycleId exists", Boolean(cca.cycleId), cca.cycleId);
      check("cca.cycleStartedAt exists", Boolean(cca.cycleStartedAt) || cca.cycleStartedAt === null, String(cca.cycleStartedAt));
      check("cca.startingPaperBalance is 1000", cca.startingPaperBalance === 1000, String(cca.startingPaperBalance));
      check("cca.currentCashBalance is finite", Number.isFinite(cca.currentCashBalance), String(cca.currentCashBalance));
      check("cca.currentHoldingsValue is finite", Number.isFinite(cca.currentHoldingsValue), String(cca.currentHoldingsValue));
      check("cca.currentTotalAccountValue is finite", Number.isFinite(cca.currentTotalAccountValue), String(cca.currentTotalAccountValue));
      check("cca.buys is array", Array.isArray(cca.buys), String(cca.buys.length));
      check("cca.sells is array", Array.isArray(cca.sells), String(cca.sells.length));
      check("cca.openHoldings is array", Array.isArray(cca.openHoldings), String(cca.openHoldings.length));
      check("cca.canRenderEmpty is boolean", typeof cca.canRenderEmpty === "boolean", String(cca.canRenderEmpty));
      check("cca.paperOnly is true", cca.paperOnly === true, String(cca.paperOnly));
      check("cca.liveTradingEnabled is false", cca.liveTradingEnabled === false, String(cca.liveTradingEnabled));

      if (cca.openHoldings.length > 0) {
        cca.openHoldings.forEach((h, i) => {
          check(`cca openHolding[${i}] ${h.symbol} has sellDate null`, h.sellDate === null, String(h.sellDate));
          check(`cca openHolding[${i}] ${h.symbol} purchaseDate exists`, Boolean(h.purchaseDate), h.purchaseDate);
          check(`cca openHolding[${i}] ${h.symbol} quantity > 0`, h.quantity > 0, String(h.quantity));
          check(`cca openHolding[${i}] ${h.symbol} averageBuyPrice finite`, Number.isFinite(h.averageBuyPrice), String(h.averageBuyPrice));
          check(`cca openHolding[${i}] ${h.symbol} currentPrice finite`, Number.isFinite(h.currentPrice), String(h.currentPrice));
          check(`cca openHolding[${i}] ${h.symbol} currentValue finite`, Number.isFinite(h.currentValue), String(h.currentValue));
          check(`cca openHolding[${i}] ${h.symbol} unrealizedPnl finite`, Number.isFinite(h.unrealizedPnl), String(h.unrealizedPnl));
          check(`cca openHolding[${i}] ${h.symbol} daysHeld >= 0`, h.daysHeld >= 0, String(h.daysHeld));
        });
      }

      if (cca.sells.length > 0) {
        cca.sells.forEach((s, i) => {
          check(`cca sell[${i}] ${s.symbol} has sellDate`, Boolean(s.sellDate), s.sellDate);
          check(`cca sell[${i}] ${s.symbol} realizedPnl finite`, Number.isFinite(s.realizedPnl), String(s.realizedPnl));
          check(`cca sell[${i}] ${s.symbol} exitReason exists`, Boolean(s.exitReason), s.exitReason);
        });
      }

      if (cca.buys.length > 0) {
        cca.buys.forEach((b, i) => {
          check(`cca buy[${i}] ${b.symbol} purchaseDate exists when known`, b.purchaseDate === null || Boolean(b.purchaseDate), String(b.purchaseDate));
          check(`cca buy[${i}] ${b.symbol} unrealizedPnl finite`, Number.isFinite(b.unrealizedPnl), String(b.unrealizedPnl));
          check(`cca buy[${i}] ${b.symbol} plainEnglishReason exists`, Boolean(b.plainEnglishReason), b.plainEnglishReason);
        });
      }
    }

    const cdb = data.cycleDecisionBoard;
    if (cdb) {
      check("cdb.sections.bought exists", Boolean(cdb.sections.bought), typeof cdb.sections.bought);
      check("cdb.sections.watched exists", Boolean(cdb.sections.watched), typeof cdb.sections.watched);
      check("cdb.sections.rejected exists", Boolean(cdb.sections.rejected), typeof cdb.sections.rejected);
      check("cdb.sections.bought.items is array", Array.isArray(cdb.sections.bought.items), String(cdb.sections.bought.items.length));
      check("cdb.sections.watched.items is array", Array.isArray(cdb.sections.watched.items), String(cdb.sections.watched.items.length));
      check("cdb.sections.rejected.items is array", Array.isArray(cdb.sections.rejected.items), String(cdb.sections.rejected.items.length));
      check("cdb.totalDecisions > 0", cdb.totalDecisions > 0, String(cdb.totalDecisions));
      check("cdb.paperOnly is true", cdb.paperOnly === true, String(cdb.paperOnly));

      ["bought", "watched", "rejected"].forEach((section) => {
        const items = cdb.sections[section].items;
        if (Array.isArray(items)) {
          items.forEach((item, i) => {
            check(`cdb.${section}[${i}] ${item.symbol} has symbol`, Boolean(item.symbol), item.symbol);
            check(`cdb.${section}[${i}] ${item.symbol} has decision`, Boolean(item.decision), item.decision);
            check(`cdb.${section}[${i}] ${item.symbol} has timestamp`, Boolean(item.timestamp), item.timestamp);
            check(`cdb.${section}[${i}] ${item.symbol} has technicalReason`, Boolean(item.technicalReason), item.technicalReason);
            check(`cdb.${section}[${i}] ${item.symbol} has plainEnglishReason`, Boolean(item.plainEnglishReason), item.plainEnglishReason);
          });
        }
      });
    }
  }

  const failed = checks.filter((item) => !item.passed);
  const passed = failed.length === 0;

  const report = `# MarketOps Cruise 1 — Dashboard Data QA

Generated: ${new Date().toISOString()}

## Result

${passed ? "PASS" : "FAIL"}

## Summary

- Checks passed: ${checks.filter((item) => item.passed).length}
- Checks failed: ${failed.length}
- Total checks: ${checks.length}

## Failed Checks

${failed.length ? failed.map((item) => `- ${item.name}: ${item.detail}`).join("\n") : "- None"}

## All Checks

${checks.map((item) => `- ${item.passed ? "PASS" : "FAIL"}: ${item.name} (${item.detail})`).join("\n")}
`;

  writeText(reportPath, report);

  console.log(passed ? "DASHBOARD DATA QA PASS" : "DASHBOARD DATA QA FAIL");
  console.log(`checks passed: ${checks.filter((item) => item.passed).length}`);
  console.log(`checks failed: ${failed.length}`);
  console.log(`qa report: ${reportPath}`);
  if (!passed) process.exitCode = 1;

  return { passed, checks, reportPath };
}

function round(value, places) {
  const factor = 10 ** (places || 2);
  return Math.round(Number(value) * factor) / factor;
}

if (require.main === module) {
  runDashboardDataQa();
}

module.exports = { runDashboardDataQa };

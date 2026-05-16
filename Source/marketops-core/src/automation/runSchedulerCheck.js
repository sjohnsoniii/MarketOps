const fs = require("fs");
const path = require("path");
const os = require("os");

const { fileExists, loadJson, writeText } = require("../utils/fileStore");
const { paths } = require("../utils/paths");

const isLinux = os.platform() === "linux";

const SCRIPTS_DIR = path.join(paths.projectRoot, "Scripts");
const SCHEDULER_DIR = path.join(SCRIPTS_DIR, "scheduler");
const LOGS_DIR = path.join(paths.projectRoot, "logs");

function schedulerPaths() {
  const user = os.userInfo().username;
  const serviceName = "marketops-refresh";
  return {
    serviceName,
    serviceFile: path.join(os.homedir(), ".config", "systemd", "user", `${serviceName}.service`),
    timerFile: path.join(os.homedir(), ".config", "systemd", "user", `${serviceName}.timer`),
    runScript: path.join(SCHEDULER_DIR, "run-marketops-refresh.sh"),
    installScript: path.join(SCHEDULER_DIR, "install-marketops-refresh.sh"),
    uninstallScript: path.join(SCHEDULER_DIR, "uninstall-marketops-refresh.sh"),
    checkScript: path.join(SCHEDULER_DIR, "check-marketops-refresh.sh"),
    readme: path.join(SCHEDULER_DIR, "README.md"),
    user
  };
}

function checkSystemdInstalled() {
  if (!isLinux) return { installed: false, reason: "Not a Linux platform" };
  try {
    const result = require("child_process").execSync("which systemctl", { encoding: "utf8", stdio: "pipe" }).trim();
    return { installed: result.length > 0, reason: result ? "systemctl found" : "not found" };
  } catch {
    return { installed: false, reason: "systemctl not found" };
  }
}

function checkUserServiceInstalled(sPaths) {
  if (!isLinux) return { installed: false, reason: "Not Linux" };
  const serviceExists = fileExists(sPaths.serviceFile);
  const timerExists = fileExists(sPaths.timerFile);
  if (!serviceExists && !timerExists) return { installed: false, reason: "Service and timer files not found" };
  try {
    const status = require("child_process").execSync(
      `systemctl --user is-active ${sPaths.serviceName}.timer`,
      { encoding: "utf8", stdio: "pipe" }
    ).trim();
    return { installed: status === "active", reason: `Timer status: ${status}` };
  } catch {
    return { installed: false, reason: "Timer not active" };
  }
}

function checkEnvFlag() {
  const val = process.env.MARKETOPS_ALLOW_LOCAL_SCHEDULER_INSTALL;
  if (val === "1") return { allowed: true, value: val };
  return { allowed: false, value: val || "not set (0)" };
}

function runSchedulerCheck() {
  const sPaths = schedulerPaths();
  const systemd = checkSystemdInstalled();
  const installed = systemd.installed ? checkUserServiceInstalled(sPaths) : { installed: false, reason: "systemd not available" };
  const envFlag = checkEnvFlag();

  const checks = [];
  let passed = 0;
  let failed = 0;

  function check(name, ok, detail) {
    checks.push({ name, passed: ok, detail });
    if (ok) passed++; else failed++;
  }

  check("Platform is Linux", isLinux, os.platform());
  check("systemctl available", systemd.installed, systemd.reason);
  check("Scheduler env flag allows install", envFlag.allowed, envFlag.value);

  check("Scheduler run script exists", fileExists(sPaths.runScript), sPaths.runScript);
  check("Scheduler install script exists", fileExists(sPaths.installScript), sPaths.installScript);
  check("Scheduler uninstall script exists", fileExists(sPaths.uninstallScript), sPaths.uninstallScript);
  check("Scheduler check script exists", fileExists(sPaths.checkScript), sPaths.checkScript);
  check("Scheduler README exists", fileExists(sPaths.readme), sPaths.readme);

  check("Systemd user service installed", installed.installed, installed.reason);

  const verdict = failed === 0 ? (installed.installed ? "INSTALLED_AND_READY" : "PLAN_READY") : "ISSUES_FOUND";

  const report = [
    "# MarketOps Scheduler Check v0.1",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Platform: ${os.platform()}`,
    `Username: ${sPaths.user}`,
    "",
    "## Verdict",
    "",
    verdict,
    "",
    "## Summary",
    "",
    `- Systemd available: ${systemd.installed}`,
    `- Scheduler installed: ${installed.installed}`,
    `- Install allowed (MARKETOPS_ALLOW_LOCAL_SCHEDULER_INSTALL=1): ${envFlag.allowed}`,
    `- Scheduler files exist: ${checks.filter((c) => c.name.includes("exists") && c.passed).length}/5`,
    "",
    "## Checks",
    "",
    ...checks.map((c) => `- ${c.passed ? "PASS" : "FAIL"}: ${c.name} - ${c.detail}`),
    "",
    "## Install Command (when ready)",
    "",
    "```bash",
    `cd ${paths.projectRoot}`,
    `MARKETOPS_ALLOW_LOCAL_SCHEDULER_INSTALL=1 bash ${sPaths.installScript}`,
    "```",
    "",
    "## Uninstall Command",
    "",
    "```bash",
    `cd ${paths.projectRoot}`,
    `bash ${sPaths.uninstallScript}`,
    "```",
    "",
    "## Safety",
    "",
    "- User-level only: yes",
    "- No sudo/root: yes",
    "- Paper-only commands: yes",
    "- No live trading: yes",
    "- No deploy/post/email: yes",
    ""
  ];

  const reportPath = path.join(paths.projectRoot, "Reports", "Automation", "marketops-scheduler-check-v0.1.md");
  writeText(reportPath, report.join("\n"));

  console.log(`Scheduler check: ${verdict}`);
  console.log(`Checks passed: ${passed}, failed: ${failed}`);
  console.log(`Report: ${reportPath}`);

  return { verdict, checks, reportPath, installed: installed.installed };
}

if (require.main === module) {
  runSchedulerCheck();
}

module.exports = { runSchedulerCheck, schedulerPaths };

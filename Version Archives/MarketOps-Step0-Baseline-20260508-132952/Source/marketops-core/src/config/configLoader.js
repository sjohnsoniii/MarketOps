const { loadJson } = require("../utils/fileStore");
const { paths } = require("../utils/paths");

const REQUIRED_FALSE_FLAGS = [
  "allowBrokerConnection",
  "allowLiveTrading",
  "allowSmsAlerts",
  "allowSubscriberSignals"
];

function loadConfig(configPath = paths.config) {
  const config = loadJson(configPath);
  assertPaperOnlyConfig(config);
  return config;
}

function assertPaperOnlyConfig(config) {
  if (!config || config.mode !== "paper_simulation") {
    throw new Error(`Unsafe mode detected: ${config && config.mode ? config.mode : "missing"}`);
  }

  if (!config.safety) {
    throw new Error("Missing safety config. Phase 1 must stay paper-only.");
  }

  const unsafe = REQUIRED_FALSE_FLAGS.filter((flag) => config.safety[flag] !== false);
  if (unsafe.length > 0) {
    throw new Error(`Unsafe safety flag detected: ${unsafe.join(", ")}. Phase 1 must stay paper-only.`);
  }

  return true;
}

function getRequiredFalseFlags() {
  return [...REQUIRED_FALSE_FLAGS];
}

module.exports = {
  assertPaperOnlyConfig,
  getRequiredFalseFlags,
  loadConfig
};

const { runCycleStatus } = require("./paperCycle");

if (require.main === module) {
  try {
    runCycleStatus();
  } catch (error) {
    console.error(`cycle:status failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { runCycleStatus };

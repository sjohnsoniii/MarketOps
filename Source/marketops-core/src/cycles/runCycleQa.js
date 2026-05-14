const { runCycleQa } = require("./paperCycle");

if (require.main === module) {
  runCycleQa();
}

module.exports = { runCycleQa };

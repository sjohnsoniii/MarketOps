const { runSignalDeskQa } = require("../signalDesk/runSignalDeskQa");

function runSignalQa() {
  return runSignalDeskQa();
}

if (require.main === module) {
  runSignalQa();
}

module.exports = { runSignalQa };

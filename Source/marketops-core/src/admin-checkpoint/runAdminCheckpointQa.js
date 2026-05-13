const { runCheckpointQa } = require("./adminCheckpoint");

if (require.main === module) {
  runCheckpointQa();
}

module.exports = { runCheckpointQa };

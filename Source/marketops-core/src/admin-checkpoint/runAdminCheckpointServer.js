const { runCheckpointServer } = require("./adminCheckpoint");

if (require.main === module) {
  try {
    runCheckpointServer();
  } catch (error) {
    console.error(`admin:run failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { runCheckpointServer };

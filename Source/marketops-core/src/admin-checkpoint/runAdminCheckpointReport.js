const { writeCheckpointReport } = require("./adminCheckpoint");

if (require.main === module) {
  try {
    writeCheckpointReport();
  } catch (error) {
    console.error(`admin:checkpoint:report failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { writeCheckpointReport };

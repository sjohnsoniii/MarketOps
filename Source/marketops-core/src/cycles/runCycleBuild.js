const { runCycleBuild } = require("./paperCycle");

if (require.main === module) {
  try {
    runCycleBuild();
  } catch (error) {
    console.error(`cycle:build failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { runCycleBuild };

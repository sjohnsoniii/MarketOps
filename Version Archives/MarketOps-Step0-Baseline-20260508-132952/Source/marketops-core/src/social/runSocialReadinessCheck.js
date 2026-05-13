const { runSocialReadinessCheck } = require("./socialReadinessUtils");

if (require.main === module) {
  runSocialReadinessCheck();
}

module.exports = { runSocialReadinessCheck };

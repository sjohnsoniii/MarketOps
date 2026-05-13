const { writeStaticConsole, resolveTenant } = require("./contentApprovalConsole");

function runAdminConsole() {
  const tenant = resolveTenant(process.env.OFFICE_TENANT || "marketops");
  const result = writeStaticConsole(tenant);
  console.log("The Office admin approval console generated");
  console.log(`tenant: ${tenant.tenantId}`);
  console.log(`console: ${result.consolePath}`);
  console.log(`queue items: ${result.model.items.length}`);
  console.log(`approved content items: ${result.model.counts.approvedContentItems}`);
  console.log("publishAllowed: false");
  return result;
}

if (require.main === module) {
  try {
    runAdminConsole();
  } catch (error) {
    console.error(`admin:console failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { runAdminConsole };

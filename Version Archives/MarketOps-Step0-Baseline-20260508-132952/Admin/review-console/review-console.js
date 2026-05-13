const bundle = window.MARKETOPS_REVIEW_BUNDLE || { items: [], statusCounts: {} };
const cards = document.getElementById("cards");
const statusGrid = document.getElementById("statusGrid");
const generatedAt = document.getElementById("generatedAt");
const filters = {
  type: document.getElementById("typeFilter"),
  risk: document.getElementById("riskFilter"),
  status: document.getElementById("statusFilter"),
  platform: document.getElementById("platformFilter")
};

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function addOptions(select, values) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function renderStats() {
  const stats = [
    ["Total", bundle.totalItems || bundle.items.length],
    ["Pending", (bundle.statusCounts && bundle.statusCounts.PENDING_REVIEW) || 0],
    ["Approved", (bundle.statusCounts && bundle.statusCounts.YES_APPROVE) || 0],
    ["Rejected", (bundle.statusCounts && bundle.statusCounts.NO_REJECT) || 0],
    ["Needs Edit", (bundle.statusCounts && bundle.statusCounts.NEEDS_EDIT) || 0],
    ["Held", (bundle.statusCounts && bundle.statusCounts.HOLD) || 0],
    ["Escalated", (bundle.statusCounts && bundle.statusCounts.ESCALATE) || 0],
    ["External Send", bundle.noExternalSending ? "OFF" : "CHECK"]
  ];
  statusGrid.innerHTML = stats.map(([label, value]) => `<article class="stat"><strong>${value}</strong><span>${label}</span></article>`).join("");
}

function passes(item) {
  return (filters.type.value === "all" || item.type === filters.type.value)
    && (filters.risk.value === "all" || item.riskLevel === filters.risk.value)
    && (filters.status.value === "all" || item.status === filters.status.value)
    && (filters.platform.value === "all" || item.platform === filters.platform.value);
}

function renderCards() {
  const visible = bundle.items.filter(passes);
  cards.innerHTML = visible.map((item) => `
    <article class="card">
      <div class="meta">
        <span class="pill">${item.type}</span>
        ${item.platform ? `<span class="pill">${item.platform}</span>` : ""}
        <span class="pill risk-${item.riskLevel}">${item.riskLevel}</span>
        <span class="pill">${item.status}</span>
      </div>
      <h3>${item.title}</h3>
      <p>${item.summary}</p>
      <p><strong>Recommended action:</strong> ${item.recommendedAction}</p>
      <p class="question">${item.approvalQuestion}</p>
      <p><strong>YES:</strong> ${item.yesEffect}</p>
      <p><strong>NO:</strong> ${item.noEffect}</p>
      <p><strong>NEEDS EDIT:</strong> ${item.needsEditEffect}</p>
      <p class="path"><strong>Source:</strong> ${item.sourcePath}</p>
      <p class="path"><strong>Preview:</strong> ${item.previewPath}</p>
      <p class="path"><strong>Created:</strong> ${item.createdAt}</p>
      <div class="labels">${item.safetyLabels.map((label) => `<span class="label">${label}</span>`).join("")}</div>
    </article>
  `).join("") || "<p>No review items match the current filters.</p>";
}

addOptions(filters.type, unique(bundle.items.map((item) => item.type)));
addOptions(filters.risk, unique(bundle.items.map((item) => item.riskLevel)));
addOptions(filters.status, unique(bundle.items.map((item) => item.status)));
addOptions(filters.platform, unique(bundle.items.map((item) => item.platform)));
Object.values(filters).forEach((select) => select.addEventListener("change", renderCards));
generatedAt.textContent = bundle.generatedAt || "unknown";
renderStats();
renderCards();

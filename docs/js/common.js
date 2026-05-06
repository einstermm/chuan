const NAV_ITEMS = [
  ["首页", "home.html"],
  ["策略", "strategies.html"],
  ["订单", "orders.html"],
  ["账本", "ledger.html"],
  ["风控", "risk.html"],
  ["日志", "logs.html"],
  ["设置", "settings.html"]
];

function renderNav(currentNav) {
  const nav = document.getElementById("nav");
  if (!nav) return;
  nav.innerHTML = NAV_ITEMS.map(item => (
    `<button class="nav-item ${item[0] === currentNav ? "active" : ""}" type="button" data-href="${item[1]}">${item[0]}</button>`
  )).join("");
  nav.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
      if (!button.classList.contains("active")) {
        window.location.href = button.dataset.href;
      }
    });
  });
}

function renderSummaryCards(items, targetId = "summaryGrid") {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = items.map(item => (
    `<article class="summary-card">
      <div class="summary-label">${item[0]}</div>
      <div class="summary-value ${item[3] || ""}">${item[1]}</div>
      <div class="summary-meta">${item[2]}</div>
    </article>`
  )).join("");
}

function matchesValueRule(text, rule = {}) {
  const exact = rule.exact || [];
  const startsWith = rule.startsWith || [];
  const includes = rule.includes || [];
  return exact.includes(text) ||
    startsWith.some(prefix => text.startsWith(prefix)) ||
    includes.some(fragment => text.includes(fragment));
}

function formatValueByRules(value, rules) {
  const text = String(value);
  const classes = [
    ["ok", "ok"],
    ["blue", "blue"],
    ["warn", "warn"],
    ["danger", "danger-text"],
    ["purple", "purple"]
  ];
  const matched = classes.find(item => matchesValueRule(text, rules[item[0]]));
  return matched ? `<span class="${matched[1]}">${text}</span>` : text;
}

const navItems = ["首页 / 运行台", "策略", "订单", "账本", "风控", "事件日志", "设置"];

const summaries = [
  ["执行中订单", "3", "等待成交或继续执行", "ok"],
  ["部分成交", "1", "需关注剩余未成交数量", "warn"],
  ["今日已完成", "8", "订单已完成并入账", "ok"],
  ["风控拒单", "2", "未进入执行层", "danger"],
  ["失败 / 撤单", "4", "失败、超时或手动撤销", "danger"],
  ["需人工处理", "1", "存在异常待排查", "warn"]
];

const filters = [
  ["状态", ["全部", "FILLED", "PARTIAL", "REJECTED_BY_RISK", "FAILED", "CANCELLED_BY_TIMEOUT"]],
  ["策略", ["全部策略", "S_MOM_VOL_BTC", "S_TREND_ETH"]],
  ["交易对", ["BTC-USDT", "ETH-USDT"]],
  ["方向", ["全部", "BUY", "SELL"]],
  ["环境", ["Live", "Paper", "Sandbox"]],
  ["搜索", ["搜索订单 ID / 交易所订单号 / Hummingbot 任务 ID"]]
];

const orders = [
  ["10:00:02", "OI-BTC-001", "S_MOM_VOL_BTC", "BTC-USDT", "BUY", "0.0330", "LIMIT", "PASS", "FILLED", "0.0330", "BOOKED", "PASS", "查看"],
  ["10:15:30", "OI-BTC-002", "S_MOM_VOL_BTC", "BTC-USDT", "BUY", "0.0500", "LIMIT", "PASS", "PARTIAL", "0.0180 / 0.0500", "BOOKED_PARTIAL", "PASS", "查看 / 撤单"],
  ["10:25:10", "OI-BTC-003", "S_MOM_VOL_BTC", "BTC-USDT", "BUY", "0.2000", "-", "REJECTED", "REJECTED_BY_RISK", "0", "NOT_SENT", "-", "查看"],
  ["10:35:20", "OI-ETH-004", "S_TREND_ETH", "ETH-USDT", "SELL", "2.0000", "POSITION_EXIT", "PASS", "FILLED", "2.0000", "BOOKED", "PASS", "查看"],
  ["10:40:12", "OI-BTC-005", "S_MOM_VOL_BTC", "BTC-USDT", "BUY", "0.00001", "LIMIT", "PASS", "FAILED", "0", "NOT_BOOKED", "-", "查看"],
  ["11:05:00", "OI-BTC-006", "S_MOM_VOL_BTC", "BTC-USDT", "BUY", "0.0300", "LIMIT", "PASS", "CANCELLED_BY_TIMEOUT", "0", "NOT_BOOKED", "PASS", "查看"]
];

const tabs = ["生命周期", "风控与执行", "成交与入账", "事件流", "原始对象"];
let activeTab = "生命周期";

const lifecycle = [
  ["10:00:01", "LiveSignal", "BUY BTC-USDT confidence=0.74"],
  ["10:00:02", "PortfolioDecision", "target_btc_weight=50%"],
  ["10:00:03", "RebalancePlan", "delta_btc=+0.0500"],
  ["10:00:04", "OrderIntent", "OI-BTC-002 created"],
  ["10:00:05", "RiskDecision", "APPROVED"],
  ["10:00:06", "ExecutionPlan", "LIMIT BUY 0.0500 BTC @ 60000"],
  ["10:00:07", "HummingbotTask", "HB-TASK-002 created"],
  ["10:00:08", "ExchangeOrder", "OKX-778899004 submitted"],
  ["10:15:30", "FillEvent", "filled 0.0180 BTC @ 60000"],
  ["10:15:31", "Idempotency", "ACCEPTED_AND_BOOKED"],
  ["10:15:32", "Ledger", "position +0.0180 BTC, cash -1080.864 USDT"],
  ["10:15:35", "Reconciliation", "PASS"]
];

const riskExecution = [
  ["风控结果", "APPROVED"],
  ["风控状态", "NORMAL"],
  ["余额检查", "通过"],
  ["订单金额", "2,400 USDT"],
  ["最大单笔限制", "2,500 USDT"],
  ["预估滑点", "0.12%"],
  ["最大滑点限制", "0.30%"],
  ["执行计划", "LIMIT BUY 0.0500 BTC @ 60000"],
  ["Hummingbot 任务", "HB-TASK-002"],
  ["交易所订单号", "OKX-778899004"],
  ["Kill Switch", "策略未触发 Kill Switch"]
];

const fillLedger = {
  summary: [
    ["订单数量", "0.0500 BTC"],
    ["手续费", "0.864 USDT"],
    ["已成交", "0.0180 BTC"],
    ["入账结果", "BTC +0.0180 / USDT -1,080.864"],
    ["剩余数量", "0.0320 BTC"],
    ["幂等状态", "ACCEPTED"],
    ["成交均价", "60,000"],
    ["入账状态", "BOOKED_PARTIAL"]
  ],
  rows: [
    ["OKX-TRADE-pf001", "10:15:30", "0.0180", "60,000", "0.864", "ACCEPTED"],
    ["OKX-TRADE-pf001", "10:15:31", "0.0180", "60,000", "0.864", "DUPLICATE_SKIPPED"]
  ]
};

const rawObject = {
  order_intent_id: "OI-BTC-002",
  strategy_id: "S_MOM_VOL_BTC",
  symbol: "BTC-USDT",
  side: "BUY",
  quantity: "0.0500",
  risk_result: "APPROVED",
  execution_plan_id: "EP-BTC-002",
  hummingbot_task_id: "HB-TASK-002",
  exchange_order_id: "OKX-778899004",
  status: "PARTIALLY_FILLED",
  booked_status: "BOOKED_PARTIAL"
};

function renderNav() {
  const nav = document.getElementById("nav");
  nav.innerHTML = navItems.map(item => (
    `<button class="nav-item ${item === "订单" ? "active" : ""}" type="button">${item}</button>`
  )).join("");
}

function renderSummaries() {
  document.getElementById("summaryGrid").innerHTML = summaries.map(item => (
    `<article class="summary-card">
      <div class="summary-label">${item[0]}</div>
      <div class="summary-value ${item[3]}">${item[1]}</div>
      <div class="summary-meta">${item[2]}</div>
    </article>`
  )).join("");
}

function renderFilters() {
  document.getElementById("filters").innerHTML = filters.map(item => {
    if (item[0] === "搜索") {
      return `<div class="filter"><input value="" placeholder="${item[1][0]}"></div>`;
    }
    return `<div class="filter">
      <label>${item[0]}</label>
      <select>${item[1].map(option => `<option>${option}</option>`).join("")}</select>
    </div>`;
  }).join("");
}

function renderOrders() {
  document.getElementById("orderRows").innerHTML = orders.map(row => (
    `<tr>${row.map(value => `<td>${formatValue(value)}</td>`).join("")}</tr>`
  )).join("");
}

function renderTabs() {
  document.getElementById("tabs").innerHTML = tabs.map(tab => (
    `<button class="tab ${tab === activeTab ? "active" : ""}" type="button" data-tab="${tab}">${tab}</button>`
  )).join("");
  document.querySelectorAll("[data-tab]").forEach(button => {
    button.addEventListener("click", () => {
      activeTab = button.dataset.tab;
      renderTabs();
      renderTabContent();
    });
  });
}

function renderTabContent() {
  const target = document.getElementById("tabContent");
  if (activeTab === "生命周期") {
    target.innerHTML = `
      <section class="detail-card">
        <h3>订单生命周期</h3>
        ${renderTimeline(lifecycle)}
      </section>`;
    return;
  }

  if (activeTab === "风控与执行") {
    target.innerHTML = `<section class="detail-card">${renderRiskExecutionCard(true)}</section>`;
    return;
  }

  if (activeTab === "成交与入账") {
    target.innerHTML = `<section class="detail-card">${renderFillLedgerCard(true)}</section>`;
    return;
  }

  if (activeTab === "事件流") {
    target.innerHTML = `<section class="detail-card">
      <h3>事件流</h3>
      ${renderTimeline(lifecycle)}
    </section>`;
    return;
  }

  target.innerHTML = `<section class="detail-card">
    <h3>原始对象</h3>
    <pre class="raw-box">${JSON.stringify(rawObject, null, 2)}</pre>
  </section>`;
}

function renderTimeline(rows) {
  return `<div class="timeline">${rows.map(row => (
    `<div class="timeline-row">
      <div>${row[0]}</div>
      <div>${row[1]}</div>
      <div>${formatValue(row[2])}</div>
    </div>`
  )).join("")}</div>`;
}

function renderRiskExecutionCard(standalone = false) {
  return `<div class="${standalone ? "" : "detail-card"}">
    <h3>风控与执行</h3>
    <div class="kv-grid ${standalone ? "" : "two-col"}">
      ${riskExecution.map(row => `<div class="kv-label">${row[0]}：</div><div class="kv-value">${formatValue(row[1])}</div>`).join("")}
    </div>
  </div>`;
}

function renderFillLedgerCard(standalone = false) {
  return `<div class="${standalone ? "" : "detail-card"}">
    <h3>成交与入账</h3>
    <div class="fill-summary">
      ${fillLedger.summary.map(row => `<div class="kv-label">${row[0]}：</div><div class="kv-value">${formatValue(row[1])}</div>`).join("")}
    </div>
    <table>
      <thead><tr><th>trade_id</th><th>时间</th><th>数量</th><th>价格</th><th>手续费</th><th>幂等状态</th></tr></thead>
      <tbody>${fillLedger.rows.map(row => `<tr>${row.map(value => `<td>${formatValue(value)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  </div>`;
}

function formatValue(value) {
  const text = String(value);
  if (["PASS", "BUY", "BOOKED", "APPROVED", "NORMAL", "通过", "ACCEPTED", "ACCEPTED_AND_BOOKED"].includes(text) || text.includes("BTC +")) {
    return `<span class="ok">${text}</span>`;
  }
  if (["LIMIT", "POSITION_EXIT"].includes(text) || text.startsWith("OI-") || text.startsWith("HB-") || text.startsWith("OKX-")) {
    return `<span class="blue">${text}</span>`;
  }
  if (["PARTIAL", "BOOKED_PARTIAL", "CANCELLED_BY_TIMEOUT", "DUPLICATE_SKIPPED"].includes(text)) {
    return `<span class="warn">${text}</span>`;
  }
  if (["SELL", "REJECTED", "REJECTED_BY_RISK", "FAILED", "NOT_SENT", "NOT_BOOKED"].includes(text)) {
    return `<span class="danger-text">${text}</span>`;
  }
  return text;
}

renderNav();
renderSummaries();
renderFilters();
renderOrders();
renderTabs();
renderTabContent();

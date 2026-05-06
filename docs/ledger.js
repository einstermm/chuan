const navItems = [
  ["首页", "home.html"],
  ["策略", "strategies.html"],
  ["订单", "orders.html"],
  ["账本", "ledger.html"],
  ["风控", "risk.html"],
  ["日志", "logs.html"],
  ["设置", "settings.html"]
];
const currentNav = "账本";

const summaries = [
  ["当前权益", "16,120.30 USDT", "账户总资产价值", "blue"],
  ["可用现金", "8,018.58 USDT", "可用于新订单", "blue"],
  ["持仓市值", "8,101.72 USDT", "BTC / ETH 持仓价值", ""],
  ["今日盈亏", "+142.65 USDT", "未实现 +37.20 USDT", "ok"],
  ["今日手续费", "2.63 USDT", "交易手续费累计", ""],
  ["对账状态", "PASS", "最近对账：2 分钟前", "ok"]
];

const filters = [
  ["账户", ["acct_spot_001", "acct_paper_001"]],
  ["交易所", ["OKX", "Binance"]],
  ["资产", ["全部", "USDT", "BTC", "ETH"]],
  ["策略", ["全部策略", "S_MOM_VOL_BTC", "S_TREND_ETH"]],
  ["账本类型", ["全部", "POSITION", "CASH", "FEE", "PNL"]],
  ["时间范围", ["今日", "近7日", "近30日"]],
  ["搜索", ["搜索 trade_id / order_id / ledger_entry_id"]]
];

const assets = [
  ["USDT", "8,018.581132", "8,018.581132", "0.000000", "8,018.581132", "0", "0.01", "PASS"],
  ["BTC", "0.133000", "0.133000", "0.000000", "0.133000", "0", "0.0001", "PASS"],
  ["ETH", "2.000000", "2.000000", "0.000000", "2.000000", "0", "0.0001", "PASS"]
];

const ledgerTabs = ["资产快照", "持仓账本", "现金账本", "费用账本", "盈亏", "对账", "账本流水"];
let activeLedgerTab = "账本流水";

const ledgerTables = {
  "资产快照": {
    title: "资产快照",
    head: ["资产", "内部总余额", "可用余额", "冻结余额", "交易所余额", "差异", "对账状态"],
    rows: assets.map(row => [row[0], row[1], row[2], row[3], row[4], row[5], row[7]])
  },
  "持仓账本": {
    title: "持仓账本",
    head: ["时间", "流水 ID", "资产", "变动方向", "变动数量", "余额", "来源事件", "入账状态"],
    rows: [
      ["10:00:09", "LE-BTC-001", "BTC", "+", "0.0330", "0.1330", "FillEvent", "BOOKED"],
      ["10:15:32", "LE-BTC-002", "BTC", "+", "0.0180", "0.1510", "FillEvent", "BOOKED_PARTIAL"]
    ]
  },
  "现金账本": {
    title: "现金账本",
    head: ["时间", "流水 ID", "资产", "变动方向", "变动数量", "余额", "来源事件", "入账状态"],
    rows: [
      ["10:00:09", "LE-USDT-001", "USDT", "-", "1,978.416132", "8,020.00", "FillEvent", "BOOKED"],
      ["10:15:32", "LE-USDT-002", "USDT", "-", "1,080.864000", "8,018.581132", "FillEvent", "BOOKED_PARTIAL"]
    ]
  },
  "费用账本": {
    title: "费用账本",
    head: ["时间", "流水 ID", "费用类型", "资产", "金额", "关联订单", "来源事件", "入账状态"],
    rows: [
      ["10:00:09", "LE-FEE-001", "TAKER_FEE", "USDT", "1.583868", "OI-BTC-001", "FeeEvent", "BOOKED"],
      ["10:15:32", "LE-FEE-002", "TAKER_FEE", "USDT", "0.864000", "OI-BTC-002", "FeeEvent", "BOOKED_PARTIAL"]
    ]
  },
  "盈亏": {
    title: "盈亏",
    head: ["时间", "账户", "已实现盈亏", "未实现盈亏", "手续费", "净盈亏", "状态"],
    rows: [
      ["10:15:35", "acct_spot_001", "+105.45", "+37.20", "2.63", "+142.65", "PASS"]
    ]
  },
  "对账": {
    title: "对账",
    head: ["对账 ID", "资产", "内部余额", "交易所余额", "差异", "阈值", "对账状态"],
    rows: [
      ["REC-001", "BTC", "0.1510", "0.1510", "0", "0.0001", "PASS"],
      ["REC-002", "USDT", "8,018.581132", "8,018.581132", "0", "0.01", "PASS"]
    ]
  },
  "账本流水": {
    title: "账本流水",
    head: ["时间", "流水 ID", "账本类型", "资产", "变动方向", "变动数量", "余额", "来源事件", "关联订单", "幂等", "入账状态", "对账", "操作"],
    rows: [
      ["10:00:09", "LE-BTC-001", "POSITION", "BTC", "+", "0.0330", "0.1330", "FillEvent", "OI-BTC-001", "ACCEPTED", "BOOKED", "PASS", "查看"],
      ["10:00:09", "LE-USDT-001", "CASH", "USDT", "-", "1,978.416132", "8,020.00", "FillEvent", "OI-BTC-001", "ACCEPTED", "BOOKED", "PASS", "查看"],
      ["10:00:09", "LE-FEE-001", "FEE", "USDT", "-", "1.583868", "8,018.581132", "FeeEvent", "OI-BTC-001", "ACCEPTED", "BOOKED", "PASS", "查看"],
      ["10:15:32", "LE-BTC-002", "POSITION", "BTC", "+", "0.0180", "0.1510", "FillEvent", "OI-BTC-002", "ACCEPTED", "BOOKED_PARTIAL", "PASS", "查看"],
      ["10:15:33", "LE-BTC-DUP", "POSITION", "BTC", "0", "0", "0.1510", "DuplicateFill", "OI-BTC-002", "DUPLICATE", "SKIPPED_DUPLICATE", "PASS", "查看"]
    ]
  }
};

const detailTabs = ["入账详情", "来源链路", "幂等检查", "对账结果", "原始对象"];
let activeDetailTab = "入账详情";

const entryDetail = [
  ["流水 ID", "LE-BTC-002"],
  ["入账后余额", "0.1510"],
  ["账本类型", "PositionLedger"],
  ["入账状态", "BOOKED_PARTIAL"],
  ["资产", "BTC"],
  ["入账时间", "2026-05-03 10:15:32"],
  ["变动方向", "+"],
  ["变动数量", "0.0180"],
  ["幂等状态", "ACCEPTED_AND_BOOKED"],
  ["对账状态", "PASS"],
  ["关联 trade_id", "OKX-TRADE-pf001"]
];

const splitRows = [
  ["PositionLedger", "BTC", "+0.0180"],
  ["CashLedger", "USDT", "-1,080.0000"],
  ["FeeLedger", "USDT", "-0.8640"]
];

const sourceChain = [
  ["LiveSignal", "SIG-20260503-100000-BTC-001"],
  ["PortfolioDecision", "target_btc_weight=50%"],
  ["RebalancePlan", "delta_btc=+0.0500"],
  ["OrderIntent", "OI-BTC-002"],
  ["ExecutionPlan", "EP-BTC-002"],
  ["HummingbotTask", "HB-TASK-002"],
  ["ExchangeOrder", "OKX-778899004"],
  ["FillEvent", "OKX-TRADE-pf001"],
  ["LedgerEntry", "LE-BTC-002"]
];

const idempotency = [
  ["幂等 key", "OKX | OKX-778899004 | OKX-TRADE-pf001"],
  ["第一次回报", "ACCEPTED_AND_BOOKED"],
  ["动作", "生成 Position / Cash / Fee 分录"],
  ["第二次回报", "SKIPPED_DUPLICATE"],
  ["动作", "不生成新分录"]
];

const reconciliation = [
  ["对账 ID", "REC-001"],
  ["差异", "0"],
  ["内部 BTC", "0.1510"],
  ["阈值", "0.0001"],
  ["交易所 BTC", "0.1510"],
  ["对账状态", "PASS"]
];

const rawObject = {
  ledger_entry_id: "LE-BTC-002",
  ledger_type: "POSITION",
  asset: "BTC",
  delta: "+0.0180",
  balance_after: "0.1510",
  source_event: "FillEvent",
  order_intent_id: "OI-BTC-002",
  trade_id: "OKX-TRADE-pf001",
  idempotency_status: "ACCEPTED_AND_BOOKED",
  booking_status: "BOOKED_PARTIAL",
  reconciliation_status: "PASS"
};

function renderNav() {
  const nav = document.getElementById("nav");
  nav.innerHTML = navItems.map(item => (
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

function renderAssets() {
  document.getElementById("assetRows").innerHTML = assets.map(row => (
    `<tr>${row.map(value => `<td>${formatValue(value)}</td>`).join("")}</tr>`
  )).join("");
}

function renderLedgerTabs() {
  document.getElementById("ledgerTabs").innerHTML = ledgerTabs.map(tab => (
    `<button class="tab ${tab === activeLedgerTab ? "active" : ""}" type="button" data-ledger-tab="${tab}">${tab}</button>`
  )).join("");
  document.querySelectorAll("[data-ledger-tab]").forEach(button => {
    button.addEventListener("click", () => {
      activeLedgerTab = button.dataset.ledgerTab;
      renderLedgerTabs();
      renderLedgerTable();
    });
  });
}

function renderLedgerTable() {
  const table = ledgerTables[activeLedgerTab];
  document.getElementById("ledgerTableTitle").textContent = table.title;
  document.getElementById("ledgerHead").innerHTML = `<tr>${table.head.map(head => `<th>${head}</th>`).join("")}</tr>`;
  document.getElementById("ledgerRows").innerHTML = table.rows.map(row => (
    `<tr>${row.map(value => `<td>${formatValue(value)}</td>`).join("")}</tr>`
  )).join("");
}

function renderDetailTabs() {
  document.getElementById("detailTabs").innerHTML = detailTabs.map(tab => (
    `<button class="tab ${tab === activeDetailTab ? "active" : ""}" type="button" data-detail-tab="${tab}">${tab}</button>`
  )).join("");
  document.querySelectorAll("[data-detail-tab]").forEach(button => {
    button.addEventListener("click", () => {
      activeDetailTab = button.dataset.detailTab;
      renderDetailTabs();
      renderDetailContent();
    });
  });
}

function renderDetailContent() {
  const target = document.getElementById("detailContent");
  if (activeDetailTab === "入账详情") {
    target.innerHTML = `<section class="detail-card">
      <h3>入账详情</h3>
      <div class="kv-grid">${entryDetail.map(row => `<div class="kv-label">${row[0]}：</div><div class="kv-value">${formatValue(row[1])}</div>`).join("")}</div>
      <table class="split-table">
        <thead><tr><th>分录明细</th><th>资产</th><th>变动</th></tr></thead>
        <tbody>${splitRows.map(row => `<tr>${row.map(value => `<td>${formatValue(value)}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    </section>`;
    return;
  }

  if (activeDetailTab === "来源链路") {
    target.innerHTML = `<section class="detail-card">
      <h3>来源链路</h3>
      ${renderTimeline(sourceChain)}
    </section>`;
    return;
  }

  if (activeDetailTab === "幂等检查") {
    target.innerHTML = `<section class="detail-card">
      <h3>幂等检查</h3>
      <div class="kv-grid two-col">${idempotency.map(row => `<div class="kv-label">${row[0]}：</div><div class="kv-value">${formatValue(row[1])}</div>`).join("")}</div>
    </section>`;
    return;
  }

  if (activeDetailTab === "对账结果") {
    target.innerHTML = `<section class="detail-card">
      <h3>对账结果</h3>
      <div class="kv-grid">${reconciliation.map(row => `<div class="kv-label">${row[0]}：</div><div class="kv-value">${formatValue(row[1])}</div>`).join("")}</div>
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
      <div>${formatValue(row[1])}</div>
    </div>`
  )).join("")}</div>`;
}

function formatValue(value) {
  const text = String(value);
  if (["PASS", "ACCEPTED", "BOOKED", "ACCEPTED_AND_BOOKED"].includes(text) || text.startsWith("+")) {
    return `<span class="ok">${text}</span>`;
  }
  if (text.startsWith("LE-") || text.startsWith("OI-") || text.startsWith("OKX-") || text.startsWith("REC-") || text.startsWith("HB-") || text.startsWith("EP-") || text.startsWith("SIG-")) {
    return `<span class="blue">${text}</span>`;
  }
  if (["BOOKED_PARTIAL", "DUPLICATE", "SKIPPED_DUPLICATE"].includes(text)) {
    return `<span class="warn">${text}</span>`;
  }
  if (text.startsWith("-")) {
    return `<span class="danger-text">${text}</span>`;
  }
  return text;
}

renderNav();
renderSummaries();
renderFilters();
renderAssets();
renderLedgerTabs();
renderLedgerTable();
renderDetailTabs();
renderDetailContent();

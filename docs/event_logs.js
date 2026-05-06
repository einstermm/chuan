const navItems = ["首页 / 运行台", "策略", "订单", "账本", "风控", "事件日志", "设置"];

const summaries = [
  ["今日事件总数", "1,286", "系统消息持续写入", "blue"],
  ["错误 / 告警", "12", "需关注 ERROR / WARN 事件", "danger"],
  ["关键链路异常", "3", "订单 / 对账 / 风控异常", "warn"],
  ["平均事件延迟", "180 ms", "采集与入库延迟", ""],
  ["未处理异常", "4", "等待人工排查", "warn"],
  ["日志存储状态", "NORMAL", "近 24h 存储正常", "ok"]
];

const filters = [
  ["时间范围", ["今日", "近1小时", "近7日"]],
  ["级别", ["全部", "INFO", "WARN", "ERROR"]],
  ["事件类型", ["全部", "ReconciliationFailed", "RiskApproved", "FillPartiallyBooked"]],
  ["模块", ["全部模块", "SignalEngine", "Portfolio", "Risk", "Execution", "Ledger", "Reconciliation"]],
  ["策略", ["全部策略", "S_MOM_VOL_BTC", "S_GRID_BTC"]],
  ["交易对", ["全部", "BTC-USDT", "ETH-USDT"]],
  ["搜索", ["搜索 event_id / trace_id / order_id / trade_id / strategy_id"]]
];

const events = [
  ["10:00:01", "EVT-1001", "INFO", "LiveSignalGenerated", "SignalEngine", "BTC-USDT", "BUY confidence=0.74", "TRC-7801", "RECORDED", "查看"],
  ["10:00:03", "EVT-1002", "INFO", "PortfolioDecisionCreated", "Portfolio", "S_MOM_VOL_BTC", "target_btc_weight=50%", "TRC-7801", "RECORDED", "查看"],
  ["10:00:05", "EVT-1003", "INFO", "RiskApproved", "Risk", "OI-BTC-001", "pre-trade checks passed", "TRC-7801", "RECORDED", "查看"],
  ["10:00:08", "EVT-1004", "INFO", "HummingbotTaskCreated", "Execution", "HB-TASK-001", "task created successfully", "TRC-7801", "RECORDED", "查看"],
  ["10:15:30", "EVT-1005", "WARN", "FillPartiallyBooked", "Ledger", "OI-BTC-002", "partial fill booked 0.0180 BTC", "TRC-7812", "RECORDED", "查看"],
  ["11:06:30", "EVT-1006", "WARN", "InTradeRiskTriggered", "Risk", "OI-BTC-006", "api_latency=12s cancel order", "TRC-7830", "OPEN", "查看"],
  ["11:20:10", "EVT-1007", "ERROR", "ReconciliationFailed", "Reconciliation", "acct_spot_001", "BTC diff -0.0005 exceeds threshold", "TRC-7844", "MANUAL_REVIEW", "查看"],
  ["11:20:12", "EVT-1008", "ERROR", "NewOrderBlockedByRisk", "Risk", "S_MOM_VOL_BTC", "new orders paused after reconciliation fail", "TRC-7844", "ACTIVE", "查看"]
];

const detailTabs = ["事件详情", "上下游链路", "上下文", "对账差异检查", "影响与动作", "推荐动作", "原始载荷"];
let activeDetailTab = "事件详情";

const eventDetail = [
  ["事件 ID", "EVT-1007"],
  ["事件类型", "ReconciliationFailed"],
  ["触发时间", "2026-05-03 11:20:10"],
  ["模块", "Reconciliation"],
  ["账户", "acct_spot_001"],
  ["交易所", "OKX"],
  ["关联对象", "BTC"],
  ["Trace ID", "TRC-7844"],
  ["级别", "ERROR"],
  ["状态", "MANUAL_REVIEW"],
  ["摘要", "BTC diff -0.0005 exceeds threshold 0.0001"]
];

const compareRows = [
  ["内部 BTC", "0.0792"],
  ["交易所 BTC", "0.0787"],
  ["差异", "-0.0005"],
  ["阈值", "0.0001"],
  ["自动动作", "暂停新订单"]
];

const traceRows = [
  ["10:00:01", "LiveSignalGenerated", "BTC-USDT"],
  ["10:00:03", "PortfolioDecisionCreated", "S_MOM_VOL_BTC"],
  ["10:00:05", "RiskApproved", "OI-BTC-001"],
  ["10:00:07", "ExecutionPlanCreated", "PLAN-001"],
  ["10:00:08", "HummingbotTaskCreated", "HB-TASK-001"],
  ["10:15:30", "FillPartiallyBooked", "OI-BTC-002"],
  ["11:20:10", "ReconciliationFailed", "acct_spot_001"],
  ["11:20:12", "NewOrderBlockedByRisk", "S_MOM_VOL_BTC"]
];

const context = [
  ["影响范围", "账户 acct_spot_001"],
  ["新订单", "已阻止"],
  ["执行中订单", "保持原状态"],
  ["策略状态", "等待人工处理"],
  ["Kill Switch", "未触发"],
  ["对账状态", "FAIL"]
];

const recommendations = ["记录 ERROR 事件", "生成人工处理任务", "发送风控告警"];

const rawPayload = {
  event_id: "EVT-1007",
  event_type: "ReconciliationFailed",
  module: "Reconciliation",
  account_id: "acct_spot_001",
  asset: "BTC",
  internal_balance: 0.0792,
  exchange_balance: 0.0787,
  diff: -0.0005,
  threshold: 0.0001,
  trace_id: "TRC-7844",
  status: "MANUAL_REVIEW"
};

function renderNav() {
  const nav = document.getElementById("nav");
  nav.innerHTML = navItems.map(item => (
    `<button class="nav-item ${item === "事件日志" ? "active" : ""}" type="button">${item}</button>`
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

function renderEvents() {
  document.getElementById("eventRows").innerHTML = events.map(row => (
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
  if (activeDetailTab === "事件详情") {
    target.innerHTML = `<section class="detail-card">
        <h3>事件详情</h3>
        <div class="kv-grid two-col">${eventDetail.map(row => `<div class="kv-label">${row[0]}：</div><div>${formatValue(row[1])}</div>`).join("")}</div>
      </section>`;
    return;
  }

  if (activeDetailTab === "上下游链路") {
    target.innerHTML = `<section class="detail-card">
      <h3>上下游链路</h3>
      ${renderTimeline(traceRows)}
    </section>`;
    return;
  }

  if (activeDetailTab === "上下文") {
    target.innerHTML = `<section class="detail-card">
      <h3>上下文</h3>
      <div class="kv-grid">${context.map(row => `<div class="kv-label">${row[0]}：</div><div>${formatValue(row[1])}</div>`).join("")}</div>
    </section>`;
    return;
  }

  if (activeDetailTab === "对账差异检查") {
    target.innerHTML = `<section class="detail-card">
      <h3>对账差异检查</h3>
      <div class="kv-grid two-col">${compareRows.map(row => `<div class="kv-label">${row[0]}：</div><div>${formatValue(row[1])}</div>`).join("")}</div>
    </section>`;
    return;
  }

  if (activeDetailTab === "影响与动作") {
    target.innerHTML = `<section class="detail-card">
      <h3>影响与动作</h3>
      <div class="kv-grid">${context.map(row => `<div class="kv-label">${row[0]}：</div><div>${formatValue(row[1])}</div>`).join("")}</div>
    </section>`;
    return;
  }

  if (activeDetailTab === "推荐动作") {
    target.innerHTML = `<section class="detail-card">
      <h3>推荐动作</h3>
      <ul class="action-list">${recommendations.map(item => `<li>${item}</li>`).join("")}</ul>
    </section>`;
    return;
  }

  target.innerHTML = `<section class="detail-card">
    <h3>原始载荷</h3>
    <pre class="raw-box">${JSON.stringify(rawPayload, null, 2)}</pre>
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

function formatValue(value) {
  const text = String(value);
  if (["INFO", "RECORDED", "NORMAL"].includes(text)) {
    return `<span class="ok">${text}</span>`;
  }
  if (text.startsWith("EVT-") || text.startsWith("TRC-") || text.startsWith("OI-") || text.startsWith("HB-") || text.startsWith("PLAN-") || text === "查看") {
    return `<span class="blue">${text}</span>`;
  }
  if (["WARN", "OPEN"].includes(text)) {
    return `<span class="warn">${text}</span>`;
  }
  if (["ERROR", "ACTIVE", "FAIL"].includes(text) || text.startsWith("-") || text.includes("diff")) {
    return `<span class="danger-text">${text}</span>`;
  }
  if (["MANUAL_REVIEW"].includes(text)) {
    return `<span class="purple">${text}</span>`;
  }
  return text;
}

renderNav();
renderSummaries();
renderFilters();
renderEvents();
renderDetailTabs();
renderDetailContent();

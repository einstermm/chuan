const navItems = [
  ["首页", "home.html"],
  ["策略", "strategies.html"],
  ["订单", "orders.html"],
  ["账本", "ledger.html"],
  ["风控", "risk.html"],
  ["日志", "logs.html"],
  ["设置", "settings.html"]
];
const currentNav = "首页";

const statusCards = [
  ["系统状态", "RUNNING", "数据延迟：正常", "ok"],
  ["Hummingbot", "CONNECTED", "运行任务数：1　|　异常任务数：0", "ok"],
  ["风控状态", "NORMAL", "今日亏损限额使用：18%", "ok"],
  ["对账状态", "PASS", "最近对账：2 分钟前", "ok"],
  ["今日盈亏", "+142.65 USDT", "未实现：+37.20　|　手续费：2.63", "ok"],
  ["当前权益", "16,120.30 USDT", "USDT：8,018.58　|　BTC：0.1330", "blue"]
];

const pipeline = [
  ["信号", "BUY", "ok"],
  ["组合", "REBALANCE", "blue"],
  ["风控", "PASS", "ok"],
  ["执行计划", "LIMIT", "blue"],
  ["Hummingbot", "RUNNING", "ok"],
  ["成交", "PARTIAL", "warn"],
  ["账本", "PASS", "ok"]
];

const decisions = [
  ["策略", "S_MOM_VOL_BTC"],
  ["当前 BTC 权重", "37.5%"],
  ["交易对", "BTC-USDT"],
  ["目标 BTC 权重", "50.0%"],
  ["市场状态", "TREND_UP_LOW_VOL"],
  ["调仓差额", "+2,000 USDT"],
  ["当前价格", "60,000"],
  ["系统决策", "生成订单草图"],
  ["信号", "BUY"],
  ["原因", "信号满足买入条件，当前仓位低于目标仓位，且调仓金额超过阈值"],
  ["置信度", "0.74"]
];

const orders = [
  ["10:00:02", "BTC-USDT", "BUY", "PASS", "LIMIT", "FILLED", "0.0330", "BOOKED"],
  ["10:15:30", "BTC-USDT", "BUY", "PASS", "LIMIT", "PARTIAL", "0.0180 / 0.0500", "BOOKED_PARTIAL"],
  ["10:25:10", "BTC-USDT", "BUY", "REJECTED", "-", "REJECTED_BY_RISK", "0", "NOT_SENT"]
];

const events = [
  ["10:00:01", "LiveSignal", "BUY BTC-USDT confidence=0.74"],
  ["10:00:02", "PortfolioDecision", "target_btc_weight=50%"],
  ["10:00:03", "RiskDecision", "APPROVED"],
  ["10:00:04", "ExecutionPlan", "LIMIT BUY 0.0330 BTC @ 59995"],
  ["10:00:05", "HummingbotTask", "CREATED"],
  ["10:00:08", "FillEvent", "FILLED 0.0330 BTC"],
  ["10:00:09", "Ledger", "POSITION_UPDATED"],
  ["10:00:10", "Reconciliation", "PASS"]
];

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

function renderStatusCards() {
  document.getElementById("statusCards").innerHTML = statusCards.map(card => (
    `<article class="status-card">
      <div class="status-label">${card[0]}</div>
      <div class="status-value ${card[3]}">${card[1]}</div>
      <div class="status-meta">${card[2]}</div>
    </article>`
  )).join("");
}

function renderPipeline() {
  document.getElementById("pipeline").innerHTML = pipeline.map(step => (
    `<div class="step">
      <div class="step-name">${step[0]}</div>
      <div class="step-state ${step[2]}">${step[1]}</div>
    </div>`
  )).join("");
}

function renderDecision() {
  document.getElementById("decisionGrid").innerHTML = decisions.map(item => (
    `<div class="decision-item">
      <div class="decision-label">${item[0]}：</div>
      <div class="decision-value">${formatValue(item[1])}</div>
    </div>`
  )).join("");
}

function renderOrders() {
  document.getElementById("orderRows").innerHTML = orders.map(order => (
    `<tr>${order.map(value => `<td>${formatValue(value)}</td>`).join("")}</tr>`
  )).join("");
}

function renderEvents() {
  const middle = Math.ceil(events.length / 2);
  const groups = [events.slice(0, middle), events.slice(middle)];
  document.getElementById("eventGrid").innerHTML = groups.map(group => (
    `<div>${group.map(event => (
      `<div class="event-row">
        <div>${event[0]}</div>
        <div>${event[1]}</div>
        <div>${formatValue(event[2])}</div>
      </div>`
    )).join("")}</div>`
  )).join("");
}

function formatValue(value) {
  const text = String(value);
  if (["RUNNING", "CONNECTED", "NORMAL", "PASS", "BUY", "FILLED", "BOOKED"].includes(text) || text.startsWith("+")) {
    return `<span class="ok">${text}</span>`;
  }
  if (["REBALANCE", "LIMIT"].includes(text) || text.includes("订单草图")) {
    return `<span class="blue">${text}</span>`;
  }
  if (["PARTIAL", "BOOKED_PARTIAL"].includes(text)) {
    return `<span class="warn">${text}</span>`;
  }
  if (["REJECTED", "REJECTED_BY_RISK", "NOT_SENT"].includes(text)) {
    return `<span class="danger-text">${text}</span>`;
  }
  return text;
}

renderNav();
renderStatusCards();
renderPipeline();
renderDecision();
renderOrders();
renderEvents();

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
  ["置信度", "0.74"],
  ["原因", "信号满足买入条件，当前仓位低于目标仓位，且调仓金额超过阈值"]
];

const orders = [
  ["10:00:02", "BTC-USDT", "BUY", "PASS", "LIMIT", "FILLED", "0.0330", "BOOKED"],
  ["10:15:30", "BTC-USDT", "BUY", "PASS", "LIMIT", "PARTIAL", "0.0180 / 0.0500", "BOOKED_PARTIAL"],
  ["10:25:10", "BTC-USDT", "BUY", "REJECTED", "-", "REJECTED_BY_RISK", "0", "NOT_SENT"]
];

const orderDetails = [
  {
    id: "OI-20260506-100002",
    title: "BTC-USDT BUY / FILLED",
    summary: [
      ["订单意图", "OI-20260506-100002"],
      ["执行计划", "EP-20260506-100004"],
      ["执行任务", "HB-20260506-100005"],
      ["交易所订单", "OKX-827731"],
      ["成交事件", "FILL-20260506-100008"],
      ["入账流水", "LE-20260506-100009"]
    ],
    chain: [
      ["实盘信号", "SIG-20260506-100001", "BUY"],
      ["组合决策", "PD-20260506-100002", "REBALANCE"],
      ["订单意图", "OI-20260506-100002", "APPROVED"],
      ["交易前风控", "RE-20260506-100003", "PASS"],
      ["执行计划", "EP-20260506-100004", "LIMIT"],
      ["Hummingbot 执行", "HB-20260506-100005", "RUNNING"],
      ["交易所订单", "OKX-827731", "FILLED"],
      ["成交入账", "LE-20260506-100009", "BOOKED"]
    ],
    events: [
      ["10:00:01", "LiveSignalCreated", "SIG-20260506-100001", "BUY"],
      ["10:00:02", "OrderIntentApproved", "OI-20260506-100002", "APPROVED"],
      ["10:00:03", "PreTradeRiskPassed", "RE-20260506-100003", "PASS"],
      ["10:00:04", "ExecutionPlanCreated", "EP-20260506-100004", "LIMIT"],
      ["10:00:05", "HummingbotTaskCreated", "HB-20260506-100005", "RUNNING"],
      ["10:00:08", "FillReceived", "FILL-20260506-100008", "FILLED"],
      ["10:00:09", "LedgerBooked", "LE-20260506-100009", "BOOKED"]
    ]
  },
  {
    id: "OI-20260506-101530",
    title: "BTC-USDT BUY / PARTIAL",
    summary: [
      ["订单意图", "OI-20260506-101530"],
      ["执行计划", "EP-20260506-101532"],
      ["执行任务", "HB-20260506-101533"],
      ["交易所订单", "OKX-827892"],
      ["成交事件", "FILL-20260506-101540"],
      ["入账流水", "LE-20260506-101541"]
    ],
    chain: [
      ["实盘信号", "SIG-20260506-101528", "BUY"],
      ["组合决策", "PD-20260506-101529", "REBALANCE"],
      ["订单意图", "OI-20260506-101530", "APPROVED"],
      ["交易前风控", "RE-20260506-101531", "PASS"],
      ["执行计划", "EP-20260506-101532", "LIMIT"],
      ["Hummingbot 执行", "HB-20260506-101533", "RUNNING"],
      ["交易所订单", "OKX-827892", "PARTIAL"],
      ["成交入账", "LE-20260506-101541", "BOOKED_PARTIAL"]
    ],
    events: [
      ["10:15:28", "LiveSignalCreated", "SIG-20260506-101528", "BUY"],
      ["10:15:30", "OrderIntentApproved", "OI-20260506-101530", "APPROVED"],
      ["10:15:31", "PreTradeRiskPassed", "RE-20260506-101531", "PASS"],
      ["10:15:32", "ExecutionPlanCreated", "EP-20260506-101532", "LIMIT"],
      ["10:15:33", "HummingbotTaskCreated", "HB-20260506-101533", "RUNNING"],
      ["10:15:40", "PartialFillReceived", "FILL-20260506-101540", "PARTIAL"],
      ["10:15:41", "LedgerBookedPartial", "LE-20260506-101541", "BOOKED_PARTIAL"]
    ]
  },
  {
    id: "OI-20260506-102510",
    title: "BTC-USDT BUY / REJECTED",
    summary: [
      ["订单意图", "OI-20260506-102510"],
      ["执行计划", "-"],
      ["执行任务", "-"],
      ["交易所订单", "-"],
      ["成交事件", "-"],
      ["入账流水", "NOT_SENT"]
    ],
    chain: [
      ["实盘信号", "SIG-20260506-102507", "BUY"],
      ["组合决策", "PD-20260506-102508", "REBALANCE"],
      ["订单意图", "OI-20260506-102510", "REJECTED_BY_RISK"],
      ["交易前风控", "RE-20260506-102509", "REJECTED"],
      ["执行计划", "-", "NOT_SENT"],
      ["Hummingbot 执行", "-", "NOT_SENT"],
      ["交易所订单", "-", "NOT_SENT"],
      ["成交入账", "-", "NOT_SENT"]
    ],
    events: [
      ["10:25:07", "LiveSignalCreated", "SIG-20260506-102507", "BUY"],
      ["10:25:08", "PortfolioDecisionCreated", "PD-20260506-102508", "REBALANCE"],
      ["10:25:09", "PreTradeRiskRejected", "RE-20260506-102509", "REJECTED"],
      ["10:25:10", "OrderIntentRejected", "OI-20260506-102510", "REJECTED_BY_RISK"]
    ]
  }
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

let selectedOrderIndex = 0;
let strategyPaused = false;
let pendingStrategyPaused = false;
let killSwitchActive = false;

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
    `<div class="decision-item ${item[0] === "原因" ? "wide" : ""}">
      <div class="decision-label">${item[0]}：</div>
      <div class="decision-value">${formatValue(item[1])}</div>
    </div>`
  )).join("");
}

function renderOrders() {
  document.getElementById("orderRows").innerHTML = orders.map((order, index) => (
    `<tr class="${index === selectedOrderIndex ? "selected-row" : ""}" data-order-index="${index}">
      ${order.map(value => `<td>${formatValue(value)}</td>`).join("")}
    </tr>`
  )).join("");
  document.querySelectorAll("[data-order-index]").forEach(row => {
    row.addEventListener("click", () => {
      selectedOrderIndex = Number(row.dataset.orderIndex);
      renderOrders();
    });
  });
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

function openOrderModal(view) {
  const detail = orderDetails[selectedOrderIndex];
  const modal = document.getElementById("orderModal");
  document.getElementById("orderModalTitle").textContent = view === "chain" ? "订单业务链路" : "订单事件流";
  document.getElementById("orderModalMeta").textContent = `${detail.id}　|　${detail.title}`;

  const body = view === "chain" ? renderOrderChain(detail) : renderOrderEvents(detail);
  document.getElementById("orderModalBody").innerHTML = `
    <div class="order-summary">
      ${detail.summary.map(item => `
        <div>
          <div class="summary-label">${item[0]}</div>
          <div class="summary-value">${formatValue(item[1])}</div>
        </div>
      `).join("")}
    </div>
    ${body}
  `;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeOrderModal() {
  const modal = document.getElementById("orderModal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function openPauseModal() {
  if (killSwitchActive) return;
  pendingStrategyPaused = !strategyPaused;
  const modal = document.getElementById("pauseModal");
  const title = pendingStrategyPaused ? "暂停策略" : "恢复策略";
  document.getElementById("pauseModalTitle").textContent = title;
  document.getElementById("pauseCurrentState").textContent = strategyPaused ? "PAUSED" : "RUNNING";
  document.getElementById("pauseCurrentState").className = `summary-value ${strategyPaused ? "warn" : "ok"}`;
  document.getElementById("pauseSignalEffect").textContent = pendingStrategyPaused ? "暂停生成" : "恢复生成";
  document.getElementById("pauseSignalEffect").className = `summary-value ${pendingStrategyPaused ? "warn" : "ok"}`;
  document.getElementById("pauseOrderEffect").textContent = pendingStrategyPaused ? "继续跟踪" : "继续跟踪";
  document.getElementById("pauseLedgerEffect").textContent = pendingStrategyPaused ? "继续运行" : "继续运行";
  document.getElementById("pauseConfirmBtn").textContent = pendingStrategyPaused ? "确认暂停" : "确认恢复";
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closePauseModal() {
  const modal = document.getElementById("pauseModal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function openKillModal() {
  const modal = document.getElementById("killModal");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeKillModal() {
  const modal = document.getElementById("killModal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function setPipelineState(name, value, className) {
  const item = pipeline.find(step => step[0] === name);
  if (item) {
    item[1] = value;
    item[2] = className;
  }
}

function setDecisionValue(name, value) {
  const item = decisions.find(decision => decision[0] === name);
  if (item) {
    item[1] = value;
  }
}

function applyStrategyState(paused) {
  if (killSwitchActive) return;
  strategyPaused = paused;
  statusCards[0] = paused
    ? ["系统状态", "PAUSED", "新信号：暂停　|　已发订单：继续跟踪", "warn"]
    : ["系统状态", "RUNNING", "数据延迟：正常", "ok"];

  setPipelineState("信号", paused ? "PAUSED" : "BUY", paused ? "warn" : "ok");
  setPipelineState("组合", paused ? "HOLD" : "REBALANCE", paused ? "warn" : "blue");
  setPipelineState("执行计划", paused ? "PAUSED" : "LIMIT", paused ? "warn" : "blue");
  setPipelineState("Hummingbot", paused ? "CONNECTED" : "RUNNING", "ok");

  setDecisionValue("系统决策", paused ? "暂停策略" : "生成订单草图");
  setDecisionValue("信号", paused ? "PAUSED" : "BUY");
  setDecisionValue("置信度", paused ? "-" : "0.74");
  setDecisionValue("原因", paused
    ? "用户暂停策略，暂不生成新的订单意图，已发订单继续跟踪"
    : "信号满足买入条件，当前仓位低于目标仓位，且调仓金额超过阈值"
  );

  const statusText = document.getElementById("systemStatusText");
  statusText.textContent = paused ? "PAUSED" : "RUNNING";
  statusText.className = paused ? "warn" : "text-ok";
  document.getElementById("pauseStrategyBtn").textContent = paused ? "恢复策略" : "暂停策略";

  renderStatusCards();
  renderPipeline();
  renderDecision();
}

function applyKillSwitch() {
  killSwitchActive = true;
  strategyPaused = true;
  statusCards[0] = ["系统状态", "KILL_SWITCH", "新信号：阻断　|　执行链路：停止", "danger"];
  statusCards[1] = ["Hummingbot", "STOPPED", "执行任务数：0　|　紧急停止", "danger"];
  statusCards[2] = ["风控状态", "KILL_SWITCH", "全局交易开关已关闭", "danger"];

  setPipelineState("信号", "BLOCKED", "danger");
  setPipelineState("组合", "BLOCKED", "danger");
  setPipelineState("风控", "KILL_SWITCH", "danger");
  setPipelineState("执行计划", "STOPPED", "danger");
  setPipelineState("Hummingbot", "STOPPED", "danger");
  setPipelineState("成交", "LOCKED", "warn");
  setPipelineState("账本", "RECONCILE", "blue");

  setDecisionValue("系统决策", "Kill Switch 已触发");
  setDecisionValue("信号", "BLOCKED");
  setDecisionValue("置信度", "-");
  setDecisionValue("原因", "紧急停止已触发，停止新信号、新订单意图和执行任务，未完成订单进入撤单处理");

  orders[1] = ["10:15:30", "BTC-USDT", "BUY", "KILL_SWITCH", "CANCEL", "CANCELLED_BY_KILL", "0.0180 / 0.0500", "BOOKED_PARTIAL"];
  const partialDetail = orderDetails[1];
  partialDetail.title = "BTC-USDT BUY / CANCELLED_BY_KILL";
  partialDetail.chain[2] = ["订单意图", "OI-20260506-101530", "KILL_SWITCH"];
  partialDetail.chain[4] = ["执行计划", "EP-20260506-101532", "STOPPED"];
  partialDetail.chain[5] = ["Hummingbot 执行", "HB-20260506-101533", "STOPPED"];
  partialDetail.chain[6] = ["交易所订单", "OKX-827892", "CANCELLED_BY_KILL"];
  partialDetail.events.push(["10:16:02", "KillSwitchTriggered", "GLOBAL-RISK", "KILL_SWITCH"]);
  partialDetail.events.push(["10:16:03", "ExchangeOrderCancelRequested", "OKX-827892", "CANCELLED_BY_KILL"]);

  events.unshift(["10:16:02", "KillSwitch", "KILL_SWITCH"]);
  events.unshift(["10:16:03", "Execution", "STOPPED"]);

  const statusText = document.getElementById("systemStatusText");
  statusText.textContent = "KILL_SWITCH";
  statusText.className = "danger-text";
  const pauseButton = document.getElementById("pauseStrategyBtn");
  pauseButton.textContent = "策略已停止";
  pauseButton.disabled = true;
  const killButton = document.getElementById("killSwitchBtn");
  killButton.textContent = "Kill Switch 已触发";
  killButton.disabled = true;

  renderStatusCards();
  renderPipeline();
  renderDecision();
  renderOrders();
  renderEvents();
}

function bindPauseActions() {
  document.getElementById("pauseStrategyBtn").addEventListener("click", openPauseModal);
  document.getElementById("pauseModalClose").addEventListener("click", closePauseModal);
  document.getElementById("pauseCancelBtn").addEventListener("click", closePauseModal);
  document.getElementById("pauseConfirmBtn").addEventListener("click", () => {
    applyStrategyState(pendingStrategyPaused);
    closePauseModal();
  });
  document.getElementById("pauseModal").addEventListener("click", event => {
    if (event.target.id === "pauseModal") {
      closePauseModal();
    }
  });
}

function bindKillActions() {
  document.getElementById("killSwitchBtn").addEventListener("click", openKillModal);
  document.getElementById("killModalClose").addEventListener("click", closeKillModal);
  document.getElementById("killCancelBtn").addEventListener("click", closeKillModal);
  document.getElementById("killConfirmBtn").addEventListener("click", () => {
    applyKillSwitch();
    closeKillModal();
  });
  document.getElementById("killModal").addEventListener("click", event => {
    if (event.target.id === "killModal") {
      closeKillModal();
    }
  });
}

function renderOrderChain(detail) {
  return `
    <div class="chain-grid">
      ${detail.chain.map(item => `
        <div class="chain-node">
          <div class="chain-name">${item[0]}</div>
          <div class="chain-object">${formatValue(item[1])}</div>
          <div class="chain-state">${formatValue(item[2])}</div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderOrderEvents(detail) {
  return `
    <table class="detail-table">
      <thead>
        <tr>
          <th>时间</th>
          <th>事件</th>
          <th>对象</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        ${detail.events.map(row => `<tr>${row.map(value => `<td>${formatValue(value)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  `;
}

function bindOrderActions() {
  document.querySelectorAll("[data-order-modal]").forEach(button => {
    button.addEventListener("click", () => {
      openOrderModal(button.dataset.orderModal);
    });
  });
  document.getElementById("orderModalClose").addEventListener("click", closeOrderModal);
  document.getElementById("orderModal").addEventListener("click", event => {
    if (event.target.id === "orderModal") {
      closeOrderModal();
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeOrderModal();
      closePauseModal();
      closeKillModal();
    }
  });
}

function bindOrderDoubleClick() {
  document.getElementById("orderRows").addEventListener("dblclick", event => {
    const row = event.target.closest("[data-order-index]");
    if (row) {
      selectedOrderIndex = Number(row.dataset.orderIndex);
      renderOrders();
      openOrderModal("chain");
    }
  });
}

function formatValue(value) {
  return formatValueByRules(value, {
    ok: {
      exact: ["RUNNING", "CONNECTED", "NORMAL", "PASS", "BUY", "FILLED", "BOOKED", "APPROVED"],
      startsWith: ["+"]
    },
    blue: {
      exact: ["REBALANCE", "LIMIT"],
      startsWith: ["SIG-", "PD-", "OI-", "RE-", "EP-", "HB-", "OKX-", "FILL-", "LE-"],
      includes: ["订单草图"]
    },
    warn: {
      exact: ["PARTIAL", "BOOKED_PARTIAL", "PAUSED", "HOLD", "LOCKED", "RECONCILE"],
      includes: ["暂停"]
    },
    danger: {
      exact: ["REJECTED", "REJECTED_BY_RISK", "NOT_SENT", "-", "KILL_SWITCH", "BLOCKED", "STOPPED", "CANCEL", "CANCELLED_BY_KILL"],
      includes: ["Kill Switch"]
    }
  });
}

renderNav("首页");
renderStatusCards();
renderPipeline();
renderDecision();
renderOrders();
bindOrderActions();
bindOrderDoubleClick();
bindPauseActions();
bindKillActions();
renderEvents();

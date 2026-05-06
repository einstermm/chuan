const summaries = [
  ["全局风险状态", "NORMAL", "允许新订单：YES", "ok"],
  ["日亏损使用", "18%", "-58.20 / -320 USDT", "warn"],
  ["风险暴露", "BTC 50.3%", "上限 55.0%", "warn"],
  ["今日风控拒单", "2", "交易前风控已拦截", "danger"],
  ["执行中异常", "1", "API 延迟 / 撤单异常", "warn"],
  ["Kill Switch", "OFF", "最近触发：10:42 S_GRID_BTC", "ok"]
];

const meters = [
  ["日亏损", "-58.20 / -320 USDT", "18%", 18, "ok"],
  ["BTC 暴露", "50.3% / 55.0%", "91.4%", 91, "warn"],
  ["单笔订单金额", "2,400 / 2,500 USDT", "96%", 96, "warn"],
  ["滑点预估", "0.12% / 0.30%", "40%", 40, "ok"],
  ["对账状态", "PASS | Hummingbot CONNECTED | 允许新订单 YES", "", 100, "ok"]
];

const riskTabs = ["风险总览", "风控规则", "风控事件", "拒单/调整", "Kill Switch"];
let activeRiskTab = "风控事件";

const riskTables = {
  "风险总览": {
    title: "风险总览",
    head: ["风险项", "当前值", "阈值", "使用率", "状态", "处理动作"],
    rows: [
      ["日亏损", "-58.20 USDT", "-320 USDT", "18%", "NORMAL", "允许交易"],
      ["BTC 暴露", "50.3%", "55.0%", "91.4%", "WARNING", "继续监控"],
      ["单笔订单金额", "2,400 USDT", "2,500 USDT", "96%", "WARNING", "限制放行"],
      ["滑点预估", "0.12%", "0.30%", "40%", "NORMAL", "允许交易"],
      ["对账状态", "PASS", "PASS", "-", "NORMAL", "允许新订单"]
    ]
  },
  "风控规则": {
    title: "风控规则",
    head: ["规则 ID", "规则名称", "作用范围", "阈值", "当前状态", "动作", "启用状态"],
    rows: [
      ["RR-001", "单笔金额限制", "订单", "2,500 USDT", "命中", "REJECT_ORDER", "启用"],
      ["RR-002", "BTC 暴露上限", "账户", "55.0%", "接近阈值", "WARN", "启用"],
      ["RR-003", "日亏损限制", "策略", "-320 USDT", "触发", "KILL_SWITCH", "启用"],
      ["RR-004", "滑点限制", "订单", "0.30%", "正常", "ADJUST_ORDER", "启用"]
    ]
  },
  "风控事件": {
    title: "风控事件",
    head: ["时间", "事件 ID", "级别", "事件类型", "作用范围", "对象", "触发值", "阈值", "风控动作", "处理状态", "操作"],
    rows: [
      ["10:25:10", "RE-001", "HIGH", "PRE_TRADE_REJECT", "策略", "OI-BTC-003", "12,000", "2,500", "拒单", "CLOSED", "查看"],
      ["10:32:40", "RE-002", "MEDIUM", "ORDER_ADJUSTED", "策略", "OI-BTC-007", "4,896", "2,500", "拆成 2 单", "CLOSED", "查看"],
      ["10:42:00", "RE-003", "CRITICAL", "DAILY_LOSS_LIMIT", "策略", "S_GRID_BTC", "-335.20", "-320", "Kill Switch", "ACTIVE", "查看"],
      ["11:06:30", "RE-004", "HIGH", "IN_TRADE_RISK", "订单", "OI-BTC-006", "api_latency=12s", "10s", "撤单并暂停", "OPEN", "查看"],
      ["11:20:10", "RE-005", "HIGH", "RECONCILIATION_FAIL", "账户", "acct_spot_001", "BTC diff -0.0005", "0.0001", "暂停新订单", "MANUAL_REVIEW", "查看"]
    ]
  },
  "拒单/调整": {
    title: "拒单/调整",
    head: ["时间", "订单意图", "策略", "原始数量", "风控结果", "调整后数量", "动作", "原因"],
    rows: [
      ["10:25:10", "OI-BTC-003", "S_MOM_VOL_BTC", "0.2000 BTC", "REJECTED", "0", "拒单", "单笔金额超过阈值"],
      ["10:32:40", "OI-BTC-007", "S_MOM_VOL_BTC", "0.0816 BTC", "ADJUSTED", "0.0408 x 2", "拆单", "接近单笔金额上限"],
      ["11:06:30", "OI-BTC-006", "S_MOM_VOL_BTC", "0.0300 BTC", "PAUSED", "0", "撤单并暂停", "执行中 API 延迟"]
    ]
  },
  "Kill Switch": {
    title: "Kill Switch",
    head: ["触发时间", "对象", "触发原因", "触发值", "阈值", "状态", "恢复条件"],
    rows: [
      ["10:42:00", "S_GRID_BTC", "DAILY_LOSS_LIMIT", "-335.20", "-320", "ACTIVE", "人工复核"],
      ["10:42:02", "账户新订单", "策略触发 Kill Switch", "-", "-", "BLOCKED", "解除 Kill Switch"]
    ]
  }
};

const detailTabs = ["事件详情", "检查项", "系统动作", "影响范围", "原始对象"];
let activeDetailTab = "检查项";

const checkItems = [
  ["余额检查", "FAIL", "账户 USDT：8,000", "预计金额：12,000"],
  ["单笔金额检查", "FAIL", "限制：2,500", "当前：12,000"],
  ["BTC 暴露检查", "PASS", "当前：50.3%", "上限：55.0%"],
  ["滑点检查", "PASS", "0.12%", "上限：0.30%"],
  ["Kill Switch 检查", "PASS", "当前状态：OFF", ""]
];

const eventDetail = [
  ["事件 ID", "RE-001"],
  ["事件类型", "PRE_TRADE_REJECT"],
  ["触发时间", "2026-05-03 10:25:10"],
  ["作用范围", "策略"],
  ["对象", "S_MOM_VOL_BTC"],
  ["关联订单意图", "OI-BTC-003"],
  ["关联信号", "SIG-20260503-100000-BTC-001"],
  ["参数版本", "v1.2.0"],
  ["风控结果", "REJECTED"]
];

const systemActions = ["不生成 ExecutionPlan", "不调用 Hummingbot", "不产生 ExchangeOrder", "记录风控事件", "发送告警"];

const impactScope = [
  ["影响范围", "单个订单意图"],
  ["策略状态", "保持 RUNNING"],
  ["账户状态", "保持 NORMAL"],
  ["Hummingbot", "无新任务"],
  ["账本", "无变化"],
  ["对账", "NOT_REQUIRED"]
];

const rawObject = {
  risk_event_id: "RE-001",
  order_intent_id: "OI-BTC-003",
  strategy_id: "S_MOM_VOL_BTC",
  risk_result: "REJECTED",
  action: "REJECT_ORDER",
  trigger_time: "2026-05-03T10:25:10.123Z",
  level: "HIGH"
};

function renderMeters() {
  document.getElementById("meterGrid").innerHTML = meters.map(item => (
    `<div class="meter">
      <div class="meter-title">${item[0]}</div>
      <div class="meter-line"><span>${formatValue(item[1])}</span><span>${item[2]}</span></div>
      <div class="bar"><div class="bar-fill ${item[4]}" style="width:${item[3]}%"></div></div>
    </div>`
  )).join("");
}

function renderRiskTabs() {
  document.getElementById("riskTabs").innerHTML = riskTabs.map(tab => (
    `<button class="tab ${tab === activeRiskTab ? "active" : ""}" type="button" data-risk-tab="${tab}">${tab}</button>`
  )).join("");
  document.querySelectorAll("[data-risk-tab]").forEach(button => {
    button.addEventListener("click", () => {
      activeRiskTab = button.dataset.riskTab;
      renderRiskTabs();
      renderRiskTable();
    });
  });
}

function renderRiskTable() {
  const table = riskTables[activeRiskTab];
  document.getElementById("riskTableTitle").textContent = table.title;
  document.getElementById("riskHead").innerHTML = `<tr>${table.head.map(head => `<th>${head}</th>`).join("")}</tr>`;
  document.getElementById("riskRows").innerHTML = table.rows.map(row => (
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
      <div class="kv-grid">${eventDetail.map(row => `<div class="kv-label">${row[0]}：</div><div>${formatValue(row[1])}</div>`).join("")}</div>
    </section>`;
    return;
  }

  if (activeDetailTab === "检查项") {
    target.innerHTML = `<section class="detail-card">
      <h3>检查项</h3>
      <table class="check-table">
        <thead><tr><th>检查项</th><th>结果</th><th>当前值</th><th>阈值 / 说明</th></tr></thead>
        <tbody>${checkItems.map(row => `<tr>${row.map(value => `<td>${formatValue(value)}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    </section>`;
    return;
  }

  if (activeDetailTab === "系统动作") {
    target.innerHTML = `<section class="detail-card">
      <h3>系统动作</h3>
      <ul class="action-list">${systemActions.map(item => `<li>${item}</li>`).join("")}</ul>
    </section>`;
    return;
  }

  if (activeDetailTab === "影响范围") {
    target.innerHTML = `<section class="detail-card">
      <h3>影响范围</h3>
      <div class="kv-grid">${impactScope.map(row => `<div class="kv-label">${row[0]}：</div><div>${formatValue(row[1])}</div>`).join("")}</div>
    </section>`;
    return;
  }

  target.innerHTML = `<section class="detail-card">
    <h3>原始对象</h3>
    <pre class="raw-box">${JSON.stringify(rawObject, null, 2)}</pre>
  </section>`;
}

function formatValue(value) {
  return formatValueByRules(value, {
    ok: {
      exact: ["NORMAL", "YES", "PASS", "CLOSED", "OFF", "RUNNING"]
    },
    blue: {
      exact: ["查看"],
      startsWith: ["RE-", "OI-", "SIG-"]
    },
    warn: {
      exact: ["MEDIUM", "WARNING", "OPEN", "MANUAL_REVIEW", "ADJUSTED", "PAUSED"],
      includes: ["拆"]
    },
    danger: {
      exact: ["HIGH", "CRITICAL", "FAIL", "REJECTED", "ACTIVE", "REJECT_ORDER", "KILL_SWITCH", "BLOCKED"],
      startsWith: ["-"],
      includes: ["diff", "latency"]
    }
  });
}

renderNav("风控");
renderSummaryCards(summaries);
renderMeters();
renderRiskTabs();
renderRiskTable();
renderDetailTabs();
renderDetailContent();

const navItems = [
  ["首页", "home.html"],
  ["策略", "strategies.html"],
  ["订单", "orders.html"],
  ["账本", "ledger.html"],
  ["风控", "risk.html"],
  ["日志", "logs.html"],
  ["设置", "settings.html"]
];
const currentNav = "策略";

const summaries = [
  ["运行中策略", "2", "正在生成信号并决策", "ok"],
  ["待上线审批", "1", "等待风险审批上线", "warn"],
  ["已暂停策略", "1", "手动或计划性暂停", ""],
  ["风控停止", "1", "触发风控规则停止", "danger"],
  ["今日策略盈亏", "+128.42 USDT", "较昨日 +36.18 USDT", "blue"]
];

const filters = [
  ["状态", ["全部", "RUNNING", "PAPER_RUNNING", "PAUSED", "STOPPED_BY_RISK"]],
  ["环境", ["全部", "Live", "Paper", "Sandbox"]],
  ["交易所", ["OKX", "Binance", "Gate"]],
  ["策略类型", ["全部", "趋势", "均值回归", "网格"]],
  ["搜索", ["搜索策略名称 / ID"]]
];

const strategies = [
  ["BTC 动量波动策略", "S_MOM_VOL_BTC", "趋势", "BTC-USDT", "v1.2.0", "Live", "RUNNING", "BUY 0.74", "生成订单草图", "+142.65", "NORMAL"],
  ["BTC 均值回归策略", "S_MEAN_REVERT_BTC", "均值回归", "BTC-USDT", "v0.9.3", "Paper", "PAPER_RUNNING", "NO SIGNAL", "不交易", "+0.00", "NORMAL"],
  ["ETH 趋势策略", "S_TREND_ETH", "趋势", "ETH-USDT", "v1.0.1", "Sandbox", "PAUSED", "SELL 0.62", "暂停中", "-18.20", "PAUSED"],
  ["BTC 网格策略", "S_GRID_BTC", "网格", "BTC-USDT", "v0.5.0", "Live", "STOPPED_BY_RISK", "-", "Kill Switch", "-335.20", "RISK_STOP"]
];

const tabs = ["概览", "参数", "最近信号", "组合目标", "上线治理", "版本记录"];

const overview = [
  ["策略名称", "BTC 动量波动策略"],
  ["当前版本", "v1.2.0"],
  ["策略类型", "趋势 / 动量"],
  ["运行状态", "RUNNING"],
  ["交易所", "OKX"],
  ["上线状态", "APPROVED"],
  ["账户", "acct_spot_001"],
  ["风控状态", "NORMAL"],
  ["交易对", "BTC-USDT"],
  ["最近心跳", "10 秒前"]
];

const miniMetrics = [
  ["今日盈亏", "+142.65 USDT", "ok"],
  ["7日盈亏", "+388.20 USDT", "ok"],
  ["今日信号数", "12", ""],
  ["风控拒单", "1", ""]
];

const params = [
  {
    title: "信号参数",
    rows: [["信号周期", "1h"], ["买入阈值", "0.010"], ["卖出阈值", "-0.006"], ["最大波动率", "0.008"], ["最低置信度", "0.70"]]
  },
  {
    title: "组合参数",
    rows: [["目标 BTC 权重", "50.0%"], ["最大 BTC 权重", "55.0%"], ["最小调仓金额", "500 USDT"]]
  },
  {
    title: "风控与执行",
    rows: [["单日最大亏损", "-320 USDT"], ["最大单笔订单金额", "2,500 USDT"], ["最大滑点", "0.30%"], ["默认订单类型", "LIMIT"], ["post_only", "true"], ["订单超时", "60 秒"]]
  }
];

const signals = [
  ["10:00:01", "BTC-USDT", "TREND_UP_LOW_VOL", "BUY", "0.74", "60,000", "进入组合决策"],
  ["11:00:00", "BTC-USDT", "NEUTRAL", "NO_SIGNAL", "-", "60,100", "不交易"],
  ["12:30:00", "BTC-USDT", "TREND_UP_LOW_VOL", "BUY", "0.76", "60,220", "持仓不变"]
];

const target = [
  ["当前 BTC 权重", "37.5%"],
  ["目标 BTC 权重", "50.0%"],
  ["调仓差额", "+0.0330 BTC"],
  ["预计调仓金额", "+2,000 USDT"],
  ["组合决策", "REBALANCE"],
  ["下一步", "生成订单草图"]
];

const governance = [
  ["当前状态", "APPROVED"],
  ["审批人", "risk_admin"],
  ["审批时间", "2026-05-03 09:30:00"],
  ["上线环境", "Live"],
  ["资金上限", "10,000 USDT"]
];

const checks = ["参数版本已锁定", "回测通过", "模拟交易通过", "风控规则已配置"];

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

function renderStrategies() {
  document.getElementById("strategyRows").innerHTML = strategies.map(row => (
    `<tr>
      ${row.map(value => `<td>${formatValue(value)}</td>`).join("")}
      <td><button class="btn small" type="button">查看</button></td>
    </tr>`
  )).join("");
}

function renderTabs() {
  document.getElementById("tabs").innerHTML = tabs.map((tab, index) => (
    `<button class="tab ${index === 0 ? "active" : ""}" type="button">${tab}</button>`
  )).join("");
}

function renderOverview() {
  document.getElementById("overview").innerHTML = overview.map(row => (
    `<div class="kv-label">${row[0]}：</div><div class="kv-value">${formatValue(row[1])}</div>`
  )).join("");
}

function renderMiniMetrics() {
  document.getElementById("miniMetrics").innerHTML = miniMetrics.map(item => (
    `<div class="mini-card">
      <div class="mini-label">${item[0]}</div>
      <div class="mini-value ${item[2]}">${item[1]}</div>
    </div>`
  )).join("");
}

function renderParams() {
  document.getElementById("params").innerHTML = params.map(group => (
    `<div class="param-card">
      <div class="param-title">${group.title}</div>
      ${group.rows.map(row => `<div class="param-row"><span>${row[0]}：</span><strong>${row[1]}</strong></div>`).join("")}
    </div>`
  )).join("");
}

function renderSignals() {
  document.getElementById("signalRows").innerHTML = signals.map(row => (
    `<tr>${row.map(value => `<td>${formatValue(value)}</td>`).join("")}</tr>`
  )).join("");
}

function renderGovernance() {
  document.getElementById("target").innerHTML = target.map(row => (
    `<div class="kv-label">${row[0]}：</div><div class="kv-value">${formatValue(row[1])}</div>`
  )).join("");
  document.getElementById("governance").innerHTML = governance.map(row => (
    `<div class="kv-label">${row[0]}：</div><div class="kv-value">${formatValue(row[1])}</div>`
  )).join("");
  document.getElementById("checks").innerHTML = checks.map(item => `<li>${item}</li>`).join("");
}

function formatValue(value) {
  const text = String(value);
  if (["RUNNING", "APPROVED", "NORMAL", "BUY", "REBALANCE"].includes(text) || text.startsWith("+")) {
    return `<span class="ok">${text}</span>`;
  }
  if (["PAPER_RUNNING", "生成订单草图", "Live"].includes(text)) {
    return `<span class="blue">${text}</span>`;
  }
  if (["PAUSED"].includes(text)) {
    return `<span class="warn">${text}</span>`;
  }
  if (["STOPPED_BY_RISK", "SELL 0.62", "RISK_STOP"].includes(text) || text.startsWith("-")) {
    return `<span class="danger-text">${text}</span>`;
  }
  return text;
}

renderNav();
renderSummaries();
renderFilters();
renderStrategies();
renderTabs();
renderOverview();
renderMiniMetrics();
renderParams();
renderSignals();
renderGovernance();

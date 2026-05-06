const navItems = ["首页 / 运行台", "策略", "订单", "账本", "风控", "事件日志", "设置"];

const summaries = [
  ["当前环境", "Live", "账户：acct_spot_001", "blue"],
  ["交易所连接", "OKX CONNECTED", "最近检测：10 秒前", "ok"],
  ["默认执行模式", "LIMIT", "post_only：true", "blue"],
  ["通知状态", "NORMAL", "邮件 / Telegram 已开启", "ok"],
  ["日志保留", "30 天", "对象存储已启用", "blue"],
  ["配置版本", "v1.2.0", "最后更新：today 11:45", "blue"]
];

const settingTabs = ["基础设置", "交易所与账户", "默认执行", "风控默认值", "通知告警", "日志与存储", "权限与安全"];
let activeTab = "基础设置";

const basicSettings = [
  ["系统名称", "量化交易系统"],
  ["默认交易所", "OKX"],
  ["运行环境", "Live"],
  ["默认账户", "acct_spot_001"],
  ["默认时区", "UTC+0"],
  ["主题", "浅色"],
  ["计价基准", "USDT"],
  ["语言", "简体中文"]
];

const exchangeRows = [
  ["OKX", "acct_spot_001", "Spot", "okx_live_********29", "read / trade", "已配置", "CONNECTED", "2026-05-06 11:44:58"],
  ["OKX", "acct_paper_001", "Paper", "okx_paper_********71", "read / trade", "已配置", "CONNECTED", "2026-05-06 11:44:35"]
];

const executionSettings = [
  ["默认订单类型", "LIMIT"],
  ["最大子订单数", "2"],
  ["post_only", "true"],
  ["默认滑点容忍", "0.30%"],
  ["默认订单超时", "60 秒"],
  ["成交回报确认", "开启"],
  ["默认拆单方式", "TWAP"],
  ["异常自动撤单", "开启"]
];

const riskSettings = [
  ["单日最大亏损", "-320 USDT"],
  ["最大滑点", "0.30%"],
  ["单策略亏损限制", "-200 USDT"],
  ["对账失败保护", "开启"],
  ["最大单笔订单金额", "2,500 USDT"],
  ["Kill Switch 默认范围", "策略级"],
  ["最大 BTC 暴露", "55%"],
  ["风控事件保留", "90 天"]
];

const riskChecks = ["风控默认值已发布", "对账保护已启用", "Kill Switch 需二次确认"];

const notifications = [
  ["邮件告警", "开启"],
  ["ops@quant.local", "已配置"],
  ["Telegram Bot", "开启"],
  ["@zane_quant_bot", "已配置"],
  ["风控高优先级", "立即推送"],
  ["订单失败", "5 分钟汇总"],
  ["对账失败", "立即推送"],
  ["每日报告", "08:30 UTC"],
  ["Webhook", "已配置"],
  ["短信", "未开启"]
];

const storageSettings = [
  ["事件日志保留", "30 天"],
  ["Bucket", "quant-prod-logs"],
  ["原始载荷保留", "7 天"],
  ["冷存归档", "开启"],
  ["对账快照保留", "90 天"],
  ["最近归档任务", "成功"],
  ["存储类型", "Object Storage"],
  ["日志采集延迟", "180 ms"]
];

const securitySettings = [
  ["当前用户", "admin"],
  ["密钥轮换周期", "90 天"],
  ["角色", "System Admin"],
  ["配置修改审批", "Live 环境需要确认"],
  ["双因素认证", "已开启"],
  ["审计日志", "开启"],
  ["上次登录", "2026-05-06 09:21"],
  ["高危操作确认", "开启"]
];

const changes = [
  ["11:45", "默认订单超时", "45 秒", "60 秒", "admin", "已发布"],
  ["11:20", "Telegram Bot", "未配置", "@zane_quant_bot", "admin", "已发布"],
  ["10:55", "日志保留", "14 天", "30 天", "admin", "已发布"]
];

function renderNav() {
  const nav = document.getElementById("nav");
  nav.innerHTML = navItems.map(item => (
    `<button class="nav-item ${item === "设置" ? "active" : ""}" type="button">${item}</button>`
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

function renderTabs() {
  document.getElementById("settingTabs").innerHTML = settingTabs.map(tab => (
    `<button class="tab ${tab === activeTab ? "active" : ""}" type="button" data-tab="${tab}">${tab}</button>`
  )).join("");
  document.querySelectorAll("[data-tab]").forEach(button => {
    button.addEventListener("click", () => {
      activeTab = button.dataset.tab;
      renderTabs();
      renderSettingContent();
    });
  });
}

function renderSettingContent() {
  const target = document.getElementById("settingContent");
  if (activeTab === "基础设置") {
    target.innerHTML = `<div class="settings-grid single">
      ${renderCard("基础设置", renderForm(basicSettings), "已发布 / 生效中")}
    </div>`;
    return;
  }

  if (activeTab === "交易所与账户") {
    target.innerHTML = `<div class="settings-grid single">
      <section class="setting-card">
        <div class="card-head"><h3>交易所与账户</h3><span class="tag ok">连接正常</span></div>
        <table>
          <thead><tr><th>交易所</th><th>账户</th><th>模式</th><th>API Key</th><th>权限</th><th>IP 白名单</th><th>连接状态</th><th>最近检测</th></tr></thead>
          <tbody>${exchangeRows.map(row => `<tr>${row.map(value => `<td>${formatValue(value)}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
      </section>
    </div>`;
    return;
  }

  if (activeTab === "默认执行") {
    target.innerHTML = `<div class="settings-grid single">
      ${renderCard("默认执行参数", renderForm(executionSettings), "当前生产参数 / 只读")}
    </div>`;
    return;
  }

  if (activeTab === "风控默认值") {
    target.innerHTML = `<div class="settings-grid">
      ${renderCard("风控默认值", renderForm(riskSettings), "已发布")}
      ${renderCard("风控检查", `<div class="switch-list">${riskChecks.map(item => `<div class="switch-row"><span>${item}</span><span class="switch">PASS</span></div>`).join("")}</div>`, "NORMAL")}
    </div>`;
    return;
  }

  if (activeTab === "通知告警") {
    target.innerHTML = `<div class="settings-grid single">
      ${renderCard("通知告警", renderSwitches(notifications), "NORMAL")}
    </div>`;
    return;
  }

  if (activeTab === "日志与存储") {
    target.innerHTML = `<div class="settings-grid single">
      ${renderCard("日志与存储", renderForm(storageSettings), "存储 NORMAL")}
    </div>`;
    return;
  }

  target.innerHTML = `<div class="settings-grid single">
    ${renderCard("权限与安全", renderForm(securitySettings), "安全策略已启用")}
  </div>`;
}

function renderCard(title, content, tag) {
  return `<section class="setting-card">
    <div class="card-head"><h3>${title}</h3><span class="tag ok">${tag}</span></div>
    ${content}
  </section>`;
}

function renderForm(rows) {
  return `<div class="form-grid">${rows.map(row => (
    `<div class="label">${row[0]}：</div><div>${formatValue(row[1])}</div>`
  )).join("")}</div>`;
}

function renderSwitches(rows) {
  return `<div class="switch-list">${rows.map(row => (
    `<div class="switch-row"><span>${row[0]}</span><span class="switch">${formatValue(row[1])}</span></div>`
  )).join("")}</div>`;
}

function renderChanges() {
  document.getElementById("changeRows").innerHTML = changes.map(row => (
    `<tr>${row.map(value => `<td>${formatValue(value)}</td>`).join("")}</tr>`
  )).join("");
}

function formatValue(value) {
  const text = String(value);
  if (["CONNECTED", "开启", "已开启", "已配置", "已发布", "成功", "PASS", "NORMAL"].includes(text) || text.includes("已发布")) {
    return `<span class="ok">${text}</span>`;
  }
  if (["Live", "LIMIT", "Object Storage", "System Admin", "admin"].includes(text) || text.startsWith("v")) {
    return `<span class="blue">${text}</span>`;
  }
  if (["Paper", "未开启"].includes(text) || text.includes("需要确认")) {
    return `<span class="warn">${text}</span>`;
  }
  if (text.startsWith("-")) {
    return `<span class="danger-text">${text}</span>`;
  }
  return text;
}

renderNav();
renderSummaries();
renderTabs();
renderSettingContent();
renderChanges();

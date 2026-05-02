# 量化交易产品原型业务主线：分层解耦版本

下面是将产品原型业务主线做成的**分层解耦版本**。重点是：每一层只负责一类事情，层与层之间用标准对象传递，不让“信号直接下单”，也不让 “Hummingbot 承担组合和风控职责”。

---

## 一、分层后的总结构

```text
第一层：数据层 DataLayer
第二层：研究验证层 ResearchValidationLayer
第三层：上线治理层 DeploymentGovernanceLayer
第四层：实盘信号层 LiveSignalLayer
第五层：组合决策层 PortfolioDecisionLayer
第六层：订单意图层 OrderIntentLayer
第七层：执行计划层 ExecutionPlanningLayer
第八层：Hummingbot 执行层 HummingbotExecutionLayer
第九层：交易事件层 TradingEventLayer
第十层：账本风控层 LedgerRiskLayer
第十一层：复盘迭代层 ReviewIterationLayer
```

---

## 二、解耦后的完整业务流程

### 第一层：数据层 DataLayer

这一层只负责数据，不负责策略，不负责下单。

```text
历史数据 HistoricalData
→ 数据质检 DataQualityCheck
→ 特征生成 FeatureGeneration
→ 实时行情数据 LiveMarketData
```

| 业务节点 | 作用 | 输出对象 |
|---|---|---|
| 历史数据 HistoricalData | 接入历史 K 线、成交、盘口、资金费率等数据 | 原始数据集 Dataset |
| 数据质检 DataQualityCheck | 检查缺失、重复、异常价格、时间错位 | 数据版本 DataVersion |
| 特征生成 FeatureGeneration | 生成动量、波动率、成交量、资金费率等特征 | 特征版本 FeatureVersion |
| 实时行情数据 LiveMarketData | 接入实时价格、盘口、成交、账户状态 | 实时行情事件 MarketDataEvent |

**解耦边界：**

数据层不判断买卖，只提供可信数据。

---

### 第二层：研究验证层 ResearchValidationLayer

这一层只负责研究策略是否有效，不负责实盘交易。

```text
信号研究 SignalResearch
→ 策略参数 StrategyParameterSet
→ 回测验证 BacktestRun
→ 模拟交易 PaperTradingRun
```

| 业务节点 | 作用 | 输出对象 |
|---|---|---|
| 信号研究 SignalResearch | 判断信号是否有预测能力 | 信号定义 SignalDefinition |
| 策略参数 StrategyParameterSet | 配置入场、出场、仓位、止损、调仓周期 | 参数版本 ParameterVersion |
| 回测验证 BacktestRun | 验证历史收益、回撤、胜率、手续费、滑点 | 回测报告 BacktestReport |
| 模拟交易 PaperTradingRun | 用实时行情模拟策略运行，不真实下单 | 模拟交易报告 PaperTradingReport |

**解耦边界：**

研究验证层只能产生“可上线候选策略”，不能直接影响实盘账户。

---

### 第三层：上线治理层 DeploymentGovernanceLayer

这一层负责把研究策略变成可以实盘运行的生产配置。

```text
上线审批 DeploymentApproval
→ 上线配置 DeploymentConfig
```

| 业务节点 | 作用 | 输出对象 |
|---|---|---|
| 上线审批 DeploymentApproval | 投资、风控、技术确认是否允许上线 | 审批记录 ApprovalRecord |
| 上线配置 DeploymentConfig | 配置账户、标的、资金上限、风控限额、执行方式 | 上线配置快照 DeploymentSnapshot |

**解耦边界：**

上线配置是研究环境和实盘环境之间的隔离层。  
没有上线配置，实盘信号层不能启动。

---

### 第四层：实盘信号层 LiveSignalLayer

这一层只负责生成实盘信号，不负责决定最终买多少。

```text
实盘信号 LiveSignal
```

| 业务节点 | 作用 | 输出对象 |
|---|---|---|
| 实盘信号 LiveSignal | 根据实时行情和上线策略生成买入、卖出、空仓等信号 | 实盘信号事件 SignalEvent |

**解耦边界：**

实盘信号只是“交易观点”，不是订单。

错误做法：

```text
实盘信号 LiveSignal
→ 订单意图 OrderIntent
```

正确做法：

```text
实盘信号 LiveSignal
→ 组合决策 PortfolioDecision
```

---

### 第五层：组合决策层 PortfolioDecisionLayer

这一层负责把信号变成目标组合。

```text
组合决策 PortfolioDecision
→ 目标组合 PortfolioTarget
→ 调仓计划 RebalancePlan
```

| 业务节点 | 作用 | 输出对象 |
|---|---|---|
| 组合决策 PortfolioDecision | 结合信号、当前持仓、现金、风险限额，判断是否调仓 | 组合决策结果 PortfolioDecisionResult |
| 目标组合 PortfolioTarget | 定义希望最终持有什么仓位 | 目标组合 TargetPortfolio |
| 调仓计划 RebalancePlan | 比较当前持仓和目标持仓，计算需要交易什么 | 调仓计划 TradeList |

**解耦边界：**

组合决策层不直接下单，只输出“应该调什么仓”。

核心区别：

| 对象 | 含义 |
|---|---|
| 实盘信号 LiveSignal | 策略认为 BTC 应该看多 |
| 目标组合 PortfolioTarget | 组合希望 BTC 持仓达到 30% |
| 调仓计划 RebalancePlan | 当前 BTC 只有 20%，所以需要增加 10% |

---

### 第六层：订单意图层 OrderIntentLayer

这一层负责把调仓计划转换为交易意图，并做交易前风控。

```text
订单意图 OrderIntent
→ 交易前风控检查 PreTradeRiskCheck
```

| 业务节点 | 作用 | 输出对象 |
|---|---|---|
| 订单意图 OrderIntent | 表达想交易什么、交易多少、什么时间完成 | 订单意图 OrderIntent |
| 交易前风控检查 PreTradeRiskCheck | 检查余额、杠杆、限额、持仓、交易规则 | 已批准订单意图 ApprovedOrderIntent |

**解耦边界：**

订单意图还不是 Hummingbot 任务，也不是交易所订单。

核心区别：

| 对象 | 含义 |
|---|---|
| 调仓计划 RebalancePlan | 需要买入 0.5 个 BTC |
| 订单意图 OrderIntent | 希望在 30 分钟内买入 0.5 个 BTC，最大滑点 20 bps |
| 已批准订单意图 ApprovedOrderIntent | 风控检查通过，可以进入执行计划 |

---

### 第七层：执行计划层 ExecutionPlanningLayer

这一层负责决定订单怎么执行。

```text
执行计划 ExecutionPlan
→ Hummingbot 适配器 HummingbotAdapter
```

| 业务节点 | 作用 | 输出对象 |
|---|---|---|
| 执行计划 ExecutionPlan | 决定市价、限价、分批、做 maker、做 taker 等执行方式 | 执行计划 ExecutionPlan |
| Hummingbot 适配器 HummingbotAdapter | 把平台执行计划转换成 Hummingbot 能理解的任务配置 | Hummingbot 任务配置 HummingbotTaskConfig |

**解耦边界：**

执行计划层不直接操作交易所。  
它只生成执行引擎可以使用的配置。

---

### 第八层：Hummingbot 执行层 HummingbotExecutionLayer

这一层只负责执行，不负责组合决策，不负责策略复盘。

```text
Hummingbot 执行任务 HummingbotTask
→ 交易所订单 ExchangeOrder
```

| 业务节点 | 作用 | 输出对象 |
|---|---|---|
| Hummingbot 执行任务 HummingbotTask | 启动 Bot，连接交易所，创建订单，撤单，追踪订单 | Hummingbot 执行状态 HummingbotTaskStatus |
| 交易所订单 ExchangeOrder | 交易所真实接收的订单 | 交易所订单 ExchangeOrder |

**解耦边界：**

Hummingbot 是执行引擎，不是完整投资系统。

Hummingbot 负责：

```text
接收任务
→ 创建订单
→ 撤单
→ 追踪订单
→ 回传订单状态
→ 回传成交事件
```

Hummingbot 不负责：

```text
组合目标
风控预算
策略审批
账本核算
业绩归因
策略复盘
```

---

### 第九层：交易事件层 TradingEventLayer

这一层负责接收订单状态和成交事件。

```text
订单事件流 OrderEventStream
→ 成交事件流 FillEventStream
```

| 业务节点 | 作用 | 输出对象 |
|---|---|---|
| 订单事件流 OrderEventStream | 记录订单创建、提交、部分成交、完全成交、撤单、拒单、失败 | 订单事件 OrderEvent |
| 成交事件流 FillEventStream | 记录真实成交价格、数量、手续费、成交时间 | 成交事件 FillEvent |

**解耦边界：**

交易事件层只记录事实，不直接修改策略参数。

它需要维护 ID 映射：

```text
订单意图编号 IntentId
执行计划编号 ExecutionPlanId
Hummingbot 订单编号 HummingbotOrderId
交易所订单编号 ExchangeOrderId
成交编号 FillId
```

---

### 第十层：账本风控层 LedgerRiskLayer

这一层负责把成交事件转成持仓、现金、费用、盈亏和风险。

```text
持仓账本 PositionLedger
→ 现金账本 CashLedger
→ 费用账本 FeeLedger
→ 盈亏计算 PnLEngine
→ 风险计算 RiskEngine
→ 交易所对账 Reconciliation
```

| 业务节点 | 作用 | 输出对象 |
|---|---|---|
| 持仓账本 PositionLedger | 根据成交更新持仓数量、平均成本、可用持仓 | 持仓快照 PositionSnapshot |
| 现金账本 CashLedger | 根据成交更新现金余额、冻结资金、保证金 | 现金快照 CashSnapshot |
| 费用账本 FeeLedger | 记录手续费、资金费率、借贷费用、返佣 | 费用明细 FeeRecord |
| 盈亏计算 PnLEngine | 计算已实现盈亏、未实现盈亏、当日盈亏 | 盈亏结果 PnLResult |
| 风险计算 RiskEngine | 计算杠杆、敞口、回撤、保证金率、亏损限额 | 风险快照 RiskSnapshot |
| 交易所对账 Reconciliation | 对比平台账本和交易所账户是否一致 | 对账结果 ReconciliationResult |

**解耦边界：**

账本风控层只根据成交和行情计算结果，不直接创建订单。

---

### 第十一层：复盘迭代层 ReviewIterationLayer

这一层负责把实盘结果反馈给研究和参数。

```text
业绩归因 Attribution
→ 策略复盘 StrategyReview
→ 参数迭代 ParameterIteration
```

| 业务节点 | 作用 | 输出对象 |
|---|---|---|
| 业绩归因 Attribution | 分析收益来自信号、仓位、执行、手续费、资金费率还是市场波动 | 归因报告 AttributionReport |
| 策略复盘 StrategyReview | 判断策略是否有效、执行是否偏离、风控是否合理 | 复盘结论 ReviewConclusion |
| 参数迭代 ParameterIteration | 根据复盘结果调整策略参数 | 新参数版本 NewParameterVersion |

**解耦边界：**

复盘迭代层不能直接修改正在运行的生产参数。  
它只能生成新的参数版本，再重新进入回测、模拟交易、上线审批。

---

## 三、分层后的主流程图

```text
数据层 DataLayer
历史数据 HistoricalData
→ 数据质检 DataQualityCheck
→ 特征生成 FeatureGeneration

研究验证层 ResearchValidationLayer
信号研究 SignalResearch
→ 策略参数 StrategyParameterSet
→ 回测验证 BacktestRun
→ 模拟交易 PaperTradingRun

上线治理层 DeploymentGovernanceLayer
上线审批 DeploymentApproval
→ 上线配置 DeploymentConfig

实盘信号层 LiveSignalLayer
实时行情数据 LiveMarketData
→ 实盘信号 LiveSignal

组合决策层 PortfolioDecisionLayer
组合决策 PortfolioDecision
→ 目标组合 PortfolioTarget
→ 调仓计划 RebalancePlan

订单意图层 OrderIntentLayer
订单意图 OrderIntent
→ 交易前风控检查 PreTradeRiskCheck

执行计划层 ExecutionPlanningLayer
执行计划 ExecutionPlan
→ Hummingbot 适配器 HummingbotAdapter

Hummingbot 执行层 HummingbotExecutionLayer
Hummingbot 执行任务 HummingbotTask
→ 交易所订单 ExchangeOrder

交易事件层 TradingEventLayer
订单事件流 OrderEventStream
→ 成交事件流 FillEventStream

账本风控层 LedgerRiskLayer
持仓账本 PositionLedger
→ 现金账本 CashLedger
→ 费用账本 FeeLedger
→ 盈亏计算 PnLEngine
→ 风险计算 RiskEngine
→ 交易所对账 Reconciliation

复盘迭代层 ReviewIterationLayer
业绩归因 Attribution
→ 策略复盘 StrategyReview
→ 参数迭代 ParameterIteration
```

---

## 四、层与层之间的标准接口

| 上游层 | 下游层 | 标准传递对象 |
|---|---|---|
| 数据层 DataLayer | 研究验证层 ResearchValidationLayer | 数据版本 DataVersion，特征版本 FeatureVersion |
| 研究验证层 ResearchValidationLayer | 上线治理层 DeploymentGovernanceLayer | 回测报告 BacktestReport，模拟交易报告 PaperTradingReport |
| 上线治理层 DeploymentGovernanceLayer | 实盘信号层 LiveSignalLayer | 上线配置快照 DeploymentSnapshot |
| 实盘信号层 LiveSignalLayer | 组合决策层 PortfolioDecisionLayer | 实盘信号事件 SignalEvent |
| 组合决策层 PortfolioDecisionLayer | 订单意图层 OrderIntentLayer | 调仓计划 TradeList |
| 订单意图层 OrderIntentLayer | 执行计划层 ExecutionPlanningLayer | 已批准订单意图 ApprovedOrderIntent |
| 执行计划层 ExecutionPlanningLayer | Hummingbot 执行层 HummingbotExecutionLayer | Hummingbot 任务配置 HummingbotTaskConfig |
| Hummingbot 执行层 HummingbotExecutionLayer | 交易事件层 TradingEventLayer | 交易所订单 ExchangeOrder |
| 交易事件层 TradingEventLayer | 账本风控层 LedgerRiskLayer | 订单事件 OrderEvent，成交事件 FillEvent |
| 账本风控层 LedgerRiskLayer | 复盘迭代层 ReviewIterationLayer | 盈亏结果 PnLResult，风险快照 RiskSnapshot，对账结果 ReconciliationResult |
| 复盘迭代层 ReviewIterationLayer | 研究验证层 ResearchValidationLayer | 新参数版本 NewParameterVersion，复盘结论 ReviewConclusion |

---

## 五、最关键的解耦原则

### 1. 信号和组合解耦

```text
实盘信号 LiveSignal
≠
目标组合 PortfolioTarget
```

信号只表达观点，目标组合才表达仓位。

---

### 2. 组合和订单解耦

```text
目标组合 PortfolioTarget
≠
订单意图 OrderIntent
```

目标组合表达“想持有什么”，订单意图表达“准备怎么交易”。

---

### 3. 订单意图和执行计划解耦

```text
订单意图 OrderIntent
≠
执行计划 ExecutionPlan
```

订单意图表达交易需求，执行计划表达具体执行方法。

---

### 4. 执行计划和 Hummingbot 解耦

```text
执行计划 ExecutionPlan
≠
Hummingbot 执行任务 HummingbotTask
```

执行计划是平台标准对象，Hummingbot 只是其中一种执行引擎。

以后你换成其他执行引擎，也不应该影响前面的组合、风控、订单意图。

---

### 5. 成交事件和账本解耦

```text
成交事件 FillEvent
≠
持仓账本 PositionLedger
```

成交只是事实记录，账本是根据成交计算出来的账户状态。

---

## 六、产品原型建议按这些模块画

| 模块 | 包含页面 |
|---|---|
| 数据模块 | 历史数据页，数据质检页，特征生成页，实时行情页 |
| 研究模块 | 信号研究页，策略参数页，回测验证页，模拟交易页 |
| 上线模块 | 上线审批页，上线配置页 |
| 实盘信号模块 | 实盘信号页 |
| 组合模块 | 组合决策页，目标组合页，调仓计划页 |
| 订单模块 | 订单意图页，交易前风控页 |
| 执行模块 | 执行计划页，Hummingbot 适配器页，Hummingbot 执行页 |
| 交易事件模块 | 交易所订单页，订单事件页，成交事件页 |
| 账本风控模块 | 持仓账本页，现金账本页，费用账本页，盈亏页，风控页，对账页 |
| 复盘模块 | 业绩归因页，策略复盘页，参数迭代页 |

---

## 七、总结版逻辑

这个分层后，产品逻辑会更清楚：

```text
研究层证明策略有效
上线层允许策略运行
信号层产生交易观点
组合层决定目标仓位
订单层表达交易意图
执行层负责真实交易
事件层记录交易事实
账本层计算账户状态
风控层监控风险变化
复盘层推动参数迭代
```

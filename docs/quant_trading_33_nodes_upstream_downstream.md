# 33 个节点的上下游关系明细

| 序号 | 业务节点 | 直接上游 | 直接下游 | 追溯重点 |
|---:|---|---|---|---|
| 1 | 历史数据 HistoricalData | 外部行情源、交易所历史数据、数据供应商 | 数据质检 | 原始数据来源、时间范围、品种、粒度、版本 |
| 2 | 数据质检 DataQualityCheck | 历史数据、实时行情数据 | 特征生成 | 缺失、重复、异常价格、时间戳错位、数据延迟 |
| 3 | 特征生成 FeatureGeneration | 数据质检后的数据 | 信号研究、回测验证、模拟交易、实盘信号 | 特征版本、计算逻辑、窗口参数、依赖数据 |
| 4 | 实时行情数据 LiveMarketData | 交易所实时行情、盘口、成交、K线 | 实盘信号、执行中风控监控、风险计算 | 实时价格、盘口深度、延迟、行情质量 |
| 5 | 信号研究 SignalResearch | 特征生成、历史数据、研究假设 | 策略参数 | 信号逻辑、因子逻辑、研究结论 |
| 6 | 策略参数 StrategyParameterSet | 信号研究、参数迭代 | 回测验证、模拟交易、上线审批、上线配置 | 参数版本、阈值、周期、仓位规则 |
| 7 | 回测验证 BacktestRun | 策略参数、历史数据、特征 | 模拟交易、上线审批 | 回测区间、收益、回撤、夏普、换手、费用假设 |
| 8 | 模拟交易 PaperTradingRun | 策略参数、实时或仿真实时行情、回测结果 | 上线审批 | 实时环境下的策略稳定性、延迟、滑点 |
| 9 | 上线审批 DeploymentApproval | 回测验证、模拟交易、风险评估、人工审批 | 上线配置 | 谁审批、审批时间、审批依据、上线范围 |
| 10 | 上线配置 DeploymentConfig | 上线审批、策略参数、账户配置、风控规则 | 实盘信号、交易前风控检查、执行中风控监控 | 部署版本、账户、品种、限额、开关状态 |
| 11 | 实盘信号 LiveSignal | 上线配置、实时行情数据、特征生成 | 组合决策 | 信号方向、强度、置信度、策略版本 |
| 12 | 组合决策 PortfolioDecision | 实盘信号、当前持仓、现金、风险状态 | 目标组合 | 多信号合成、仓位约束、风险预算 |
| 13 | 目标组合 PortfolioTarget | 组合决策 | 调仓计划 | 目标资产、目标权重、目标数量 |
| 14 | 调仓计划 RebalancePlan | 目标组合、当前持仓、现金账本 | 订单意图 | 当前组合与目标组合之间的差额 |
| 15 | 订单意图 OrderIntent | 调仓计划 | 交易前风控检查 | 买卖方向、数量、价格约束、账户、交易标的 |
| 16 | 交易前风控检查 PreTradeRiskCheck | 订单意图、上线配置、风险计算、持仓账本、现金账本 | 执行计划 | 是否允许交易、是否超限、是否拒单或调整 |
| 17 | 执行计划 ExecutionPlan | 交易前风控检查通过的订单意图 | Hummingbot 适配器 | 执行方式、拆单规则、限价/市价、时间策略 |
| 18 | Hummingbot 适配器 HummingbotAdapter | 执行计划 | Hummingbot 执行任务 | 系统内部订单到 Hummingbot 指令的转换 |
| 19 | Hummingbot 执行任务 HummingbotTask | Hummingbot 适配器 | 执行中风控监控、交易所订单 | 任务状态、执行进度、任务参数 |
| 20 | 执行中风控监控 InTradeRiskMonitor | Hummingbot 执行任务、交易所订单、实时行情、风控配置 | 交易所订单、撤单/暂停/调整动作 | 执行过程中的风险、滑点、异常波动 |
| 21 | 交易所订单 ExchangeOrder | Hummingbot 执行任务、执行中风控监控 | 订单事件流 | 交易所订单号、客户订单号、订单状态 |
| 22 | 订单事件流 OrderEventStream | 交易所订单、交易所回报 | 成交事件流 | 提交、确认、部分成交、完全成交、撤单、拒单 |
| 23 | 成交事件流 FillEventStream | 订单事件流 | 成交幂等处理 | 成交编号、成交价格、成交数量、成交时间 |
| 24 | 成交幂等处理 FillIdempotencyProcessor | 成交事件流 | 持仓账本、现金账本、费用账本 | 防止重复成交、乱序事件、重复记账 |
| 25 | 持仓账本 PositionLedger | 成交幂等处理 | 盈亏计算、风险计算、调仓计划、交易前风控检查 | 持仓数量、成本、持仓变化 |
| 26 | 现金账本 CashLedger | 成交幂等处理 | 盈亏计算、风险计算、调仓计划、交易前风控检查 | 可用现金、冻结现金、资金变化 |
| 27 | 费用账本 FeeLedger | 成交幂等处理 | 盈亏计算、业绩归因 | 手续费、资金费率、交易成本 |
| 28 | 盈亏计算 PnLEngine | 持仓账本、现金账本、费用账本、实时行情 | 风险计算、业绩归因、策略复盘 | 已实现盈亏、未实现盈亏、净值曲线 |
| 29 | 风险计算 RiskEngine | 持仓账本、现金账本、盈亏计算、实时行情 | 交易前风控检查、执行中风控监控、组合决策、策略复盘 | 敞口、杠杆、回撤、VaR、集中度 |
| 30 | 交易所对账 Reconciliation | 交易所订单、成交事件、内部账本、交易所账户数据 | 策略复盘、账本修正、异常处理 | 内外部持仓、现金、成交、费用是否一致 |
| 31 | 业绩归因 Attribution | 盈亏计算、费用账本、持仓账本、交易记录 | 策略复盘 | 收益来源、亏损来源、费用影响、滑点影响 |
| 32 | 策略复盘 StrategyReview | 业绩归因、风险计算、交易所对账、执行质量 | 参数迭代 | 策略是否继续、暂停、调参、下线 |
| 33 | 参数迭代 ParameterIteration | 策略复盘 | 策略参数、信号研究、回测验证 | 新参数、新假设、新研究方向 |

## 说明

这张表描述的是每个业务节点的直接上下游关系。实际系统落地时，建议为每个节点补充唯一业务 ID，并通过这些 ID 形成完整追溯链，例如：

```text
strategy_id
parameter_set_id
deployment_id
live_signal_id
portfolio_decision_id
rebalance_plan_id
order_intent_id
execution_plan_id
hummingbot_task_id
exchange_order_id
fill_event_id
ledger_entry_id
pnl_run_id
risk_run_id
review_id
iteration_id
```

其中，`33 参数迭代 ParameterIteration` 的核心反馈下游是：

```text
33 参数迭代 ParameterIteration
→ 6 策略参数 StrategyParameterSet
```

如果参数迭代涉及信号逻辑重构，则也可以回流到：

```text
33 参数迭代 ParameterIteration
→ 5 信号研究 SignalResearch
```

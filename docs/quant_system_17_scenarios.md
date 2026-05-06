# 量化交易系统 17 个核心运行场景

> 适用范围：基于当前量化交易系统业务闭环设计。系统主链路为：数据层 → 研究验证层 → 上线治理层 → 实盘信号层 → 组合决策层 → 订单意图层 → 执行计划层 → Hummingbot 执行层 → 交易事件层 → 账本风控层 → 复盘迭代层。

---

## 0. 场景总览

| 编号 | 场景 | 主要目的 | 关键模块 |
|---:|---|---|---|
| 01 | 买入成功场景 | 信号触发后成功买入资产 | 信号、组合、风控、执行、账本 |
| 02 | 卖出成功场景 | 信号触发后成功卖出资产 | 信号、组合、风控、执行、账本 |
| 03 | 无交易场景 | 行情进入系统，但没有满足交易条件 | 实盘信号、复盘 |
| 04 | 持仓不变场景 | 有信号，但当前仓位已接近目标，无需调仓 | 组合决策、调仓计划 |
| 05 | 交易前风控拒单场景 | 订单意图触发，但被交易前风控拒绝 | 订单意图、交易前风控 |
| 06 | 风控调整订单场景 | 风控不拒绝订单，但缩小、拆分或改变执行约束 | 风控、执行计划 |
| 07 | 部分成交场景 | 订单只成交一部分，账本按实际成交更新 | Hummingbot、交易事件、账本 |
| 08 | 订单超时撤单场景 | 限价单超过等待时间未成交，被自动撤单 | 执行计划、Hummingbot、订单事件 |
| 09 | 订单失败场景 | 交易所拒单、余额不足、精度错误或 API 异常 | Hummingbot、订单事件、告警 |
| 10 | 重复成交回报场景 | 同一成交事件被重复推送，系统避免重复入账 | 成交幂等、账本 |
| 11 | 止损 / 止盈 / 时间退出场景 | PositionExecutor 触发退出规则 | 执行器、交易事件、账本 |
| 12 | 执行中风控场景 | 下单后行情、滑点、API 或撤单异常触发风控 | 执行中风控、Kill Switch |
| 13 | 交易所对账异常场景 | 内部账本与交易所余额、订单或成交不一致 | 账本、对账、异常处理 |
| 14 | Kill Switch 场景 | 全局、账户或策略级停机 | 风控、执行、告警 |
| 15 | 多策略资金冲突场景 | 多个策略对同一资产或资金产生冲突 | 组合决策、资金分配 |
| 16 | 网格 / DCA 执行场景 | Hummingbot 持续创建多层或分批订单 | GridExecutor、DCAExecutor |
| 17 | 复盘参数迭代场景 | 根据实盘结果生成复盘和新参数版本 | 业绩归因、策略复盘、参数迭代 |

---

# 01. 买入成功场景

## 场景目标

验证系统可以从买入信号开始，经过组合决策、风控、执行计划、Hummingbot 下单、成交事件、账本更新，最终完成一次成功买入。

## 触发条件

```text
BTC-USDT 当前价格：60,000
账户 USDT：10,000
账户 BTC：0.1000
当前 BTC 权重：37.5%
策略目标 BTC 权重：50%
策略信号：BUY
```

## 主要数据流

```text
LiveMarketData
  → LiveSignal
  → PortfolioDecision
  → PortfolioTarget
  → RebalancePlan
  → OrderIntent
  → RiskDecision
  → ExecutionPlan
  → HummingbotRequest
  → ExchangeOrder
  → FillEvent
  → PositionLedger / CashLedger / FeeLedger
  → PnLResult
  → RiskSnapshot
  → ReconciliationResult
  → StrategyReview
```

## 示例假数据

```json
{
  "signal": {
    "signal_id": "SIG-20260503-100000-BTC-001",
    "symbol": "BTC-USDT",
    "direction": "BUY",
    "confidence": 0.74,
    "market_state": "TREND_UP_LOW_VOL"
  },
  "rebalance_plan": {
    "current_btc": 0.1000,
    "target_btc": 0.133333,
    "rounded_delta_btc": 0.0330,
    "action": "BUY_BTC"
  },
  "execution_plan": {
    "side": "BUY",
    "amount": 0.0330,
    "limit_price": 59995,
    "post_only": true
  },
  "fill_result": {
    "filled_amount": 0.0330,
    "avg_fill_price": 59995,
    "fee_usdt": 1.583868
  }
}
```

## 系统预期结果

```text
BTC：0.1000 → 0.1330
USDT：10,000.00 → 8,018.581132
订单状态：FILLED
对账状态：PASS
风险状态：NORMAL
```

## 核心验收点

- 买入信号不会直接下单。
- 组合层先生成目标仓位，再生成调仓计划。
- 风控检查余额、仓位、滑点、订单金额后放行。
- Hummingbot 只负责执行。
- 账本只根据幂等后的成交事件更新。

---

# 02. 卖出成功场景

## 场景目标

验证系统可以从卖出 / 降仓信号开始，经过组合决策、风控、拆单执行、成交事件、账本更新，最终完成一次成功卖出。

## 触发条件

```text
BTC-USDT 当前价格：61,200
账户 USDT：8,018.581132
账户 BTC：0.1330
当前 BTC 权重：约 50.37%
策略目标 BTC 权重：30%
策略信号：SELL / REDUCE_EXPOSURE
```

## 主要数据流

```text
LiveMarketData
  → LiveSignal
  → PortfolioDecision
  → PortfolioTarget
  → RebalancePlan
  → OrderIntent
  → RiskDecision
  → ExecutionPlan
  → HummingbotRequest
  → HummingbotTask
  → ExchangeOrder
  → FillEvent
  → Ledger
  → PnLResult
  → RiskSnapshot
  → ReconciliationResult
```

## 示例假数据

```json
{
  "signal": {
    "signal_id": "SIG-20260503-153000-BTC-002",
    "symbol": "BTC-USDT",
    "direction": "SELL",
    "signal_type": "REDUCE_EXPOSURE",
    "market_state": "NEUTRAL_HIGH_VOL"
  },
  "rebalance_plan": {
    "current_btc": 0.1330,
    "target_btc": 0.07920677,
    "rounded_delta_btc": -0.0538,
    "action": "SELL_BTC"
  },
  "risk_decision": {
    "approved": true,
    "must_split": true,
    "recommended_child_order_count": 2
  },
  "fill_result": {
    "filled_amount": 0.0538,
    "avg_fill_price": 61207.50,
    "fee_usdt": 2.6343708,
    "realized_pnl_usdt": 142.657437
  }
}
```

## 系统预期结果

```text
BTC：0.1330 → 0.0792
USDT：8,018.581132 → 11,308.9102612
BTC 权重：约 50.37% → 约 30.00%
订单状态：FILLED
对账状态：PASS
风险状态：NORMAL
```

## 核心验收点

- 卖出信号不会直接变成交易所订单。
- 超过单笔金额限制时，风控要求拆单。
- 卖出后需要计算已实现盈亏。
- 剩余持仓仍要保留成本基础。
- 对账必须确认 BTC、USDT、成交、手续费一致。

---

# 03. 无交易场景

## 场景目标

验证系统在行情进入后，如果不满足信号条件，不会生成订单意图。

## 触发条件

```text
BTC-USDT 当前价格：60,100
momentum_1h：0.002
volatility_1h：0.006
策略要求：momentum_1h > 0.01 才允许买入
```

## 示例假数据

```json
{
  "live_market_data": {
    "symbol": "BTC-USDT",
    "mid_price": 60100,
    "timestamp": "2026-05-03 11:00:00"
  },
  "features": {
    "momentum_1h": 0.002,
    "volatility_1h": 0.006
  },
  "signal_result": {
    "signal_type": "NO_SIGNAL",
    "reason": "momentum_1h below threshold"
  }
}
```

## 系统预期结果

```text
不生成 PortfolioDecision。
不生成 RebalancePlan。
不生成 OrderIntent。
不调用 Hummingbot。
只记录行情、特征、信号评估结果。
```

## 核心验收点

- 无信号时系统必须安静。
- 不能因为行情更新就重复生成空订单。
- 复盘中应能看到“为什么没有交易”。

---

# 04. 持仓不变场景

## 场景目标

验证有信号但当前仓位已经接近目标仓位时，系统不会无意义调仓。

## 触发条件

```text
当前 BTC 权重：49.8%
目标 BTC 权重：50.0%
账户总权益：16,000 USDT
仓位差额：32 USDT
rebalance_threshold_usdt：500 USDT
```

## 示例假数据

```json
{
  "live_signal": {
    "direction": "BUY",
    "confidence": 0.76
  },
  "portfolio_decision": {
    "target_btc_weight": 0.50,
    "current_btc_weight": 0.498,
    "delta_notional_usdt": 32,
    "rebalance_threshold_usdt": 500,
    "decision": "KEEP_POSITION"
  }
}
```

## 系统预期结果

```text
生成 PortfolioDecision。
不生成 RebalancePlan。
不生成 OrderIntent。
不下单。
```

## 核心验收点

- 有信号不等于必须交易。
- 调仓差额小于阈值时应跳过交易。
- 系统应记录“仓位已接近目标”。

---

# 05. 交易前风控拒单场景

## 场景目标

验证订单意图在进入 Hummingbot 前，会被交易前风控检查并拒绝不合规交易。

## 触发条件

```text
订单意图：BUY BTC-USDT 0.20 BTC
预计成交金额：12,000 USDT
账户 USDT：8,000 USDT
最大单笔订单金额：2,500 USDT
```

## 示例假数据

```json
{
  "order_intent": {
    "side": "BUY",
    "symbol": "BTC-USDT",
    "amount": 0.20,
    "estimated_notional_usdt": 12000
  },
  "risk_decision": {
    "approved": false,
    "reject_reason": "insufficient_balance_and_order_notional_exceeds_limit",
    "risk_state": "NORMAL"
  }
}
```

## 系统预期结果

```text
订单意图状态：REJECTED_BY_PRE_TRADE_RISK
不生成 ExecutionPlan。
不调用 Hummingbot。
不产生交易所订单。
记录拒单原因。
```

## 核心验收点

- 风控拒单必须发生在 Hummingbot 前。
- 拒单原因必须可追踪。
- 被拒订单不能进入执行层。

---

# 06. 风控调整订单场景

## 场景目标

验证订单意图不被完全拒绝，但被风控缩小数量、拆单或改变执行约束。

## 触发条件

```text
订单意图：SELL BTC-USDT 0.0800 BTC
预计金额：4,896 USDT
最大单笔订单金额：2,500 USDT
当前 BTC 持仓：0.1330 BTC
```

## 示例假数据

```json
{
  "order_intent": {
    "side": "SELL",
    "amount": 0.0800,
    "estimated_notional_usdt": 4896
  },
  "risk_decision": {
    "approved": true,
    "adjusted": true,
    "must_split": true,
    "child_order_count": 2,
    "child_order_amount": 0.0400,
    "reason": "max_single_order_notional_limit"
  }
}
```

## 系统预期结果

```text
订单没有被拒绝。
执行计划变成拆单执行。
Hummingbot 接收到 TWAP 或多子订单配置。
```

## 核心验收点

- 风控可以调整订单，而不是只有通过 / 拒绝。
- 原始订单意图和调整后执行计划都必须保留。
- 执行计划必须遵守风控输出。

---

# 07. 部分成交场景

## 场景目标

验证订单只部分成交时，系统能正确更新成交部分账本，并保留剩余订单状态。

## 触发条件

```text
限价买单：BUY BTC-USDT 0.0500 BTC @ 60,000
实际只成交：0.0180 BTC
剩余未成交：0.0320 BTC
```

## 示例假数据

```json
{
  "exchange_order": {
    "exchange_order_id": "OKX-778899004",
    "side": "BUY",
    "amount": 0.0500,
    "price": 60000,
    "status": "PARTIALLY_FILLED"
  },
  "fill_event": {
    "trade_id": "OKX-TRADE-pf001",
    "amount": 0.0180,
    "price": 60000,
    "fee_usdt": 0.864
  }
}
```

## 系统预期结果

```text
BTC 只增加 0.0180。
USDT 只扣减成交金额和手续费。
订单剩余 0.0320 BTC 仍处于 OPEN 或等待撤单状态。
PnL 和风险按实际成交数量更新。
```

## 核心验收点

- 部分成交不能按全量订单入账。
- 剩余数量必须准确。
- 后续完全成交、撤单或超时都应能接上同一个订单生命周期。

---

# 08. 订单超时撤单场景

## 场景目标

验证限价单超过等待时间未成交时，Hummingbot 自动撤单，系统记录撤单事件。

## 触发条件

```text
限价买单：BUY BTC-USDT 0.0300 @ 59,500
当前市场价格持续在 60,000 附近
订单超时设置：60 秒
60 秒内未成交
```

## 示例假数据

```json
{
  "execution_plan": {
    "order_type": "LIMIT",
    "side": "BUY",
    "amount": 0.0300,
    "limit_price": 59500,
    "time_limit_seconds": 60,
    "cancel_on_timeout": true
  },
  "order_event": {
    "event_type": "ORDER_CANCELLED",
    "reason": "timeout",
    "filled_amount": 0
  }
}
```

## 系统预期结果

```text
订单状态：CANCELLED_BY_TIMEOUT
无 FillEvent。
不更新持仓和现金。
记录执行失败原因：价格未触达 / 超时撤单。
```

## 核心验收点

- 超时撤单不应产生账本变化。
- 撤单事件必须进入订单事件流。
- 对账时交易所未完成订单应为 0。

---

# 09. 订单失败场景

## 场景目标

验证交易所拒单、API 异常、交易规则错误等失败情况不会污染账本。

## 触发条件

```text
订单意图：BUY BTC-USDT 0.00001 BTC
交易所最小下单量：0.0001 BTC
```

## 示例假数据

```json
{
  "hummingbot_request": {
    "side": "BUY",
    "amount": 0.00001,
    "symbol": "BTC-USDT"
  },
  "order_event": {
    "event_type": "ORDER_FAILED",
    "error_code": "MIN_ORDER_SIZE_NOT_MET",
    "error_message": "amount below exchange minimum"
  }
}
```

## 系统预期结果

```text
订单状态：FAILED
无成交事件。
不更新持仓。
不更新现金。
生成告警或错误日志。
```

## 核心验收点

- 失败订单不能生成 FillEvent。
- 失败原因必须记录。
- 如果失败来自交易规则，应反馈给执行计划层或配置检查。

---

# 10. 重复成交回报场景

## 场景目标

验证 Hummingbot 或交易所重复推送同一成交时，系统只入账一次。

## 触发条件

```text
同一个 trade_id 被推送两次。
成交：SELL BTC-USDT 0.0100 @ 61,000
trade_id：OKX-TRADE-dup001
```

## 示例假数据

```json
{
  "fill_event_1": {
    "exchange": "okx",
    "exchange_order_id": "OKX-778899005",
    "trade_id": "OKX-TRADE-dup001",
    "amount": 0.0100,
    "price": 61000
  },
  "fill_event_2": {
    "exchange": "okx",
    "exchange_order_id": "OKX-778899005",
    "trade_id": "OKX-TRADE-dup001",
    "amount": 0.0100,
    "price": 61000
  }
}
```

## 系统预期结果

```text
第一次成交：ACCEPTED_AND_BOOKED
第二次成交：SKIPPED_DUPLICATE
账本只减少 0.0100 BTC。
账本只增加一次 USDT。
手续费只记录一次。
```

## 核心验收点

- 幂等 key 必须稳定。
- 重复成交不得重复影响账本和 PnL。
- 复盘中应能看到 duplicate fill skipped。

---

# 11. 止损 / 止盈 / 时间退出场景

## 场景目标

验证 PositionExecutor 根据止损、止盈或时间限制自动退出，并将退出成交回传系统。

## 触发条件

```text
开仓：BUY ETH-USDT 2 ETH @ 3,000
止盈：+2%
止损：-1%
时间限制：2 小时
当前价格：3,060，触发止盈
```

## 示例假数据

```json
{
  "position_executor": {
    "executor_id": "PEX-ETH-001",
    "entry_price": 3000,
    "amount": 2,
    "take_profit_price": 3060,
    "stop_loss_price": 2970,
    "time_limit_seconds": 7200
  },
  "exit_event": {
    "exit_reason": "TAKE_PROFIT",
    "side": "SELL",
    "amount": 2,
    "fill_price": 3060,
    "fee_usdt": 4.896
  }
}
```

## 系统预期结果

```text
PositionExecutor 状态：CLOSED
退出原因：TAKE_PROFIT
生成卖出成交事件。
更新 ETH 持仓、USDT 现金、手续费和已实现盈亏。
```

## 核心验收点

- 退出逻辑由执行器触发，但账本仍以 FillEvent 为准。
- 止损、止盈、时间退出原因必须可追踪。
- 退出成交也要经过幂等处理。

---

# 12. 执行中风控场景

## 场景目标

验证订单下达后，如果执行过程中出现异常波动、滑点扩大、撤单失败或 API 延迟，系统能暂停、撤单或停止执行。

## 触发条件

```text
Hummingbot 正在执行 BUY BTC-USDT 0.0500
下单后 30 秒内 BTC 波动率突然扩大
盘口深度下降 70%
API 延迟超过 10 秒
```

## 示例假数据

```json
{
  "in_trade_risk_monitor": {
    "market_volatility_1m": 0.025,
    "depth_drop_pct": 0.70,
    "api_latency_ms": 12000,
    "risk_action": "CANCEL_AND_PAUSE_STRATEGY"
  }
}
```

## 系统预期结果

```text
撤销未成交订单。
暂停该策略新开仓。
执行状态进入 PAUSED_BY_IN_TRADE_RISK。
发送告警。
账本只更新已成交部分。
```

## 核心验收点

- 执行中风控必须高于普通执行逻辑。
- 已成交和未成交部分必须分开处理。
- 风控动作必须记录原因、时间和影响范围。

---

# 13. 交易所对账异常场景

## 场景目标

验证内部账本与交易所账户不一致时，系统能识别异常并阻止继续交易。

## 触发条件

```text
内部账本 BTC：0.0792
交易所返回 BTC：0.0787
差异：0.0005 BTC
差异超过容忍阈值：0.0001 BTC
```

## 示例假数据

```json
{
  "internal_ledger": {
    "BTC": 0.0792,
    "USDT": 11308.9102612
  },
  "exchange_snapshot": {
    "BTC": 0.0787,
    "USDT": 11308.9102612
  },
  "reconciliation_result": {
    "status": "FAIL",
    "mismatch_asset": "BTC",
    "diff": -0.0005
  }
}
```

## 系统预期结果

```text
对账状态：FAIL
暂停新订单。
进入 MANUAL_REVIEW 或 RECONCILIATION_REQUIRED。
生成异常报告。
不自动修改账本，除非有明确补账规则。
```

## 核心验收点

- 对账异常不能继续正常交易。
- 内部账本不能随意覆盖成交易所数据。
- 需要保留异常来源：余额、成交、费用、转账或订单状态。

---

# 14. Kill Switch 场景

## 场景目标

验证全局、账户或策略级 Kill Switch 触发后，系统能停止新订单并处理已有挂单。

## 触发条件

```text
单日亏损达到 -320 USDT
或人工触发全局 Kill Switch
或交易所 API 状态异常
```

## 示例假数据

```json
{
  "risk_snapshot": {
    "daily_pnl_usdt": -335.20,
    "daily_loss_limit_usdt": -320
  },
  "kill_switch_event": {
    "scope": "STRATEGY",
    "strategy_id": "S_MOM_VOL_BTC",
    "action": "STOP_NEW_ORDERS_AND_CANCEL_OPEN_ORDERS",
    "reason": "daily_loss_limit_breached"
  }
}
```

## 系统预期结果

```text
禁止新订单意图进入 Hummingbot。
撤销该策略未成交挂单。
已成交部分正常入账。
策略状态：STOPPED_BY_RISK
发送告警。
生成复盘任务。
```

## 核心验收点

- Kill Switch 必须优先级最高。
- 新订单必须被阻断。
- 已有订单的处理规则要明确：撤单、只减仓、停止执行器。

---

# 15. 多策略资金冲突场景

## 场景目标

验证多个策略同时对同一资产或账户资金提出冲突目标时，组合层能合并或裁决。

## 触发条件

```text
策略 A：想买 BTC，目标 BTC 权重 50%
策略 B：想卖 BTC，目标 BTC 权重 20%
账户级 BTC 最大权重：55%
当前 BTC 权重：35%
```

## 示例假数据

```json
{
  "strategy_targets": [
    {
      "strategy_id": "S_MOM_VOL_BTC",
      "target_btc_weight": 0.50,
      "confidence": 0.72
    },
    {
      "strategy_id": "S_MEAN_REVERT_BTC",
      "target_btc_weight": 0.20,
      "confidence": 0.64
    }
  ],
  "portfolio_decision": {
    "account_level_target_btc_weight": 0.35,
    "decision": "KEEP_POSITION",
    "reason": "strategy_targets_conflict_and_net_result_close_to_current"
  }
}
```

## 系统预期结果

```text
不允许两个策略各自独立下单互相打架。
组合层生成账户级目标。
如果账户级目标接近当前仓位，则不交易。
```

## 核心验收点

- 多策略不能绕过组合层各自下单。
- 资金冲突、仓位冲突、风险暴露冲突必须统一裁决。
- 复盘中要能看到每个策略的原始目标和最终账户目标。

---

# 16. 网格 / DCA 执行场景

## 场景目标

验证 Hummingbot 执行持续型策略时，系统能跟踪多层订单、多次成交和持续账本更新。

## 触发条件

```text
市场状态：RANGE_LOW_VOL
BTC 当前价格：60,000
网格区间：58,800 - 61,200
网格层数：6
单层订单金额：300 USDT
```

## 示例假数据

```json
{
  "grid_executor_config": {
    "executor_id": "GRID-BTC-001",
    "symbol": "BTC-USDT",
    "lower_bound": 58800,
    "upper_bound": 61200,
    "grid_levels": 6,
    "order_notional_usdt": 300,
    "max_open_orders": 6
  },
  "grid_events": [
    {
      "event_type": "GRID_BUY_FILLED",
      "price": 59600,
      "amount": 0.00503
    },
    {
      "event_type": "GRID_SELL_FILLED",
      "price": 60400,
      "amount": 0.00503
    }
  ]
}
```

## 系统预期结果

```text
每一笔网格成交都进入 FillEvent。
每一笔成交都更新账本。
GridExecutor 状态持续运行，直到触发停止条件。
系统定期计算库存偏移、已实现盈亏、未实现盈亏和手续费。
```

## 核心验收点

- 网格 / DCA 不是一次性订单，而是执行任务生命周期。
- 多个子订单必须映射到同一个 executor_id。
- 每个成交都必须幂等入账。
- 超出区间、亏损超限或 Kill Switch 时必须停止执行器。

---

# 17. 复盘参数迭代场景

## 场景目标

验证系统在交易结束后，可以根据业绩归因和策略复盘生成参数迭代建议，但不会直接修改生产参数。

## 触发条件

```text
最近 7 天策略表现：
收益：-1.8%
最大回撤：-3.5%
手续费占亏损比例：42%
高波动状态下亏损集中
```

## 示例假数据

```json
{
  "attribution_report": {
    "strategy_id": "S_MOM_VOL_BTC",
    "period": "2026-05-01 to 2026-05-07",
    "total_pnl_usdt": -288.00,
    "fee_cost_usdt": 121.00,
    "slippage_cost_usdt": 64.00,
    "loss_by_regime": {
      "TREND_UP_LOW_VOL": 85.00,
      "NEUTRAL_HIGH_VOL": -373.00
    }
  },
  "strategy_review": {
    "conclusion": "reduce_trading_in_high_vol_regime",
    "suggested_change": {
      "max_volatility_1h": 0.008,
      "new_max_volatility_1h": 0.006
    }
  }
}
```

## 系统预期结果

```text
生成 StrategyReview。
生成 ParameterIteration。
新参数版本状态为 DRAFT 或 BACKTEST_REQUIRED。
生产参数 v1.2.0 不直接改变。
新参数必须重新进入回测、模拟交易、上线审批。
```

## 核心验收点

- 复盘层不能直接修改生产配置。
- 参数变更必须有版本号。
- 新参数必须重新验证。
- 每一笔交易都应能追溯到当时使用的策略版本和参数版本。

---

# 推荐测试顺序

```text
01 无交易场景
02 买入成功场景
03 卖出成功场景
04 持仓不变场景
05 部分成交场景
06 订单超时撤单场景
07 订单失败场景
08 交易前风控拒单场景
09 风控调整订单场景
10 重复成交回报场景
11 止损 / 止盈 / 时间退出场景
12 执行中风控场景
13 交易所对账异常场景
14 Kill Switch 场景
15 多策略资金冲突场景
16 网格 / DCA 执行场景
17 复盘参数迭代场景
```

---

# 最小验收标准

这 17 个场景全部跑通后，系统至少应能回答以下问题：

```text
1. 为什么产生这笔交易？
2. 这笔交易来自哪个策略、哪个信号、哪个参数版本？
3. 风控为什么放行、拒绝或调整？
4. Hummingbot 创建了哪些任务和订单？
5. 交易所实际成交了多少？
6. 成交是否只入账一次？
7. 账本和交易所是否一致？
8. 盈亏来自信号、执行、手续费、滑点、库存还是市场波动？
9. 风控触发时系统做了什么？
10. 复盘结论是否进入了新一轮研究验证，而不是直接修改生产参数？
```

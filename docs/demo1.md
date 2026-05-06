# 量化系统数据流程假数据示例

下面用一笔 **BTC-USDT 现货买入调仓** 的假数据，把整套流程跑一遍。

主链路是：数据层 → 研究验证层 → 上线治理层 → 实盘信号层 → 组合决策层 → 订单意图层 → 执行计划层 → Hummingbot 执行层 → 交易事件层 → 账本风控层 → 复盘迭代层。这个例子会严格按这条链路走。

---

# 假设场景

```text
交易所：OKX
账户：acct_spot_001
交易对：BTC-USDT
策略：S_MOM_VOL_BTC
策略版本：v1.2.0
执行方式：Hummingbot 限价单执行
日期：2026-05-03
```

账户初始状态：

```text
USDT 余额：10,000.00
BTC 持仓：0.1000 BTC
BTC 当前价格：60,000 USDT
账户总权益：10,000 + 0.1000 * 60,000 = 16,000 USDT
```

策略目标：

```text
当 BTC 进入“上涨趋势 + 波动率可接受”状态时，
把 BTC 仓位调整到总权益的 50%。

当前 BTC 仓位价值：
0.1000 * 60,000 = 6,000 USDT

当前 BTC 权重：
6,000 / 16,000 = 37.5%

目标 BTC 权重：
50%

目标 BTC 价值：
16,000 * 50% = 8,000 USDT

需要增加 BTC：
8,000 - 6,000 = 2,000 USDT

折算 BTC 数量：
2,000 / 60,000 = 0.033333 BTC

考虑交易所精度后：
买入 0.0330 BTC
```

---

# 1. 数据层：历史数据 → 数据质检 → 特征生成

系统先准备研究和回测数据。

## 输入：历史行情

```json
{
  "object_type": "HistoricalData",
  "object_id": "HD-BTC-USDT-20260503-1m",
  "exchange": "okx",
  "symbol": "BTC-USDT",
  "timeframe": "1m",
  "rows": [
    {
      "timestamp": "2026-05-03 09:57:00",
      "open": 59880,
      "high": 59920,
      "low": 59850,
      "close": 59910,
      "volume": 132.5
    },
    {
      "timestamp": "2026-05-03 09:58:00",
      "open": 59910,
      "high": 59980,
      "low": 59900,
      "close": 59960,
      "volume": 144.2
    },
    {
      "timestamp": "2026-05-03 09:59:00",
      "open": 59960,
      "high": 60020,
      "low": 59940,
      "close": 60000,
      "volume": 158.7
    }
  ]
}
```

## 输出：数据质检结果

```json
{
  "object_type": "DataQualityResult",
  "object_id": "DQC-BTC-USDT-20260503-1m",
  "source_object_id": "HD-BTC-USDT-20260503-1m",
  "missing_rows": 0,
  "duplicate_rows": 0,
  "abnormal_price_count": 0,
  "timestamp_error_count": 0,
  "status": "PASS"
}
```

## 输出：特征集

```json
{
  "object_type": "FeatureSet",
  "object_id": "FEAT-BTC-USDT-20260503-100000",
  "symbol": "BTC-USDT",
  "feature_version": "feat_v0.8.3",
  "features": {
    "momentum_1h": 0.018,
    "momentum_4h": 0.031,
    "volatility_1h": 0.0042,
    "volatility_24h": 0.011,
    "volume_zscore_1h": 1.35,
    "trend_filter": "PASS",
    "volatility_filter": "PASS"
  }
}
```

这一层只产出数据和特征，不产生订单。

---

# 2. 研究验证层：信号研究 → 参数 → 回测 → 模拟交易

这一层用历史数据验证策略是否值得上线。

## 策略参数

```json
{
  "object_type": "StrategyParameterSet",
  "object_id": "PARAM-S_MOM_VOL_BTC-v1.2.0",
  "strategy_id": "S_MOM_VOL_BTC",
  "params": {
    "min_momentum_1h": 0.01,
    "max_volatility_1h": 0.008,
    "target_btc_weight_when_bullish": 0.50,
    "target_btc_weight_when_neutral": 0.30,
    "target_btc_weight_when_bearish": 0.00,
    "rebalance_threshold_usdt": 500,
    "max_single_order_notional": 2500,
    "max_slippage_bps": 10
  }
}
```

## 回测结果

```json
{
  "object_type": "BacktestResult",
  "object_id": "BT-S_MOM_VOL_BTC-v1.2.0-202604",
  "strategy_id": "S_MOM_VOL_BTC",
  "period": "2026-04-01 to 2026-04-30",
  "metrics": {
    "total_return": 0.084,
    "max_drawdown": -0.032,
    "sharpe": 1.42,
    "win_rate": 0.56,
    "turnover": 0.38,
    "fee_paid_usdt": 184.25,
    "slippage_cost_usdt": 96.40
  },
  "status": "PASS"
}
```

## 模拟交易结果

```json
{
  "object_type": "PaperTradingRun",
  "object_id": "PAPER-S_MOM_VOL_BTC-v1.2.0-20260501",
  "period": "2026-05-01 to 2026-05-02",
  "simulated_pnl_usdt": 126.80,
  "max_intraday_drawdown_usdt": -72.30,
  "orders_submitted": 14,
  "orders_filled": 13,
  "status": "PASS"
}
```

这一层的输出是：**策略可以上线，但还没有进入实盘交易。**

---

# 3. 上线治理层：上线审批 → 上线配置

通过回测和模拟后，系统生成生产配置。

```json
{
  "object_type": "DeploymentConfig",
  "object_id": "DEPLOY-S_MOM_VOL_BTC-v1.2.0-acct_spot_001",
  "strategy_id": "S_MOM_VOL_BTC",
  "strategy_version": "v1.2.0",
  "account_id": "acct_spot_001",
  "exchange": "okx",
  "symbols": ["BTC-USDT"],
  "capital_limit_usdt": 16000,
  "risk_config": {
    "daily_loss_limit_usdt": -320,
    "weekly_loss_limit_usdt": -800,
    "max_symbol_exposure_pct": 0.55,
    "max_single_order_notional": 2500,
    "max_slippage_bps": 10,
    "global_kill_switch": false
  },
  "execution_config": {
    "default_executor": "limit_order",
    "post_only": true,
    "order_timeout_seconds": 60,
    "retry_count": 0
  },
  "status": "ACTIVE"
}
```

这一步之后，策略才允许进入实盘信号层。

---

# 4. 实盘信号层：实时行情 → 实盘信号

现在进入实盘运行。

## 实时行情输入

```json
{
  "object_type": "LiveMarketData",
  "object_id": "LMD-BTC-USDT-20260503-100000",
  "exchange": "okx",
  "symbol": "BTC-USDT",
  "timestamp": "2026-05-03 10:00:00",
  "best_bid": 59990,
  "best_ask": 60010,
  "mid_price": 60000,
  "spread_bps": 3.33,
  "order_book_depth_1pct_usdt": 12500000,
  "last_price": 60000
}
```

## 实盘特征

```json
{
  "object_type": "LiveFeatureSnapshot",
  "object_id": "LIVE-FEAT-BTC-USDT-20260503-100000",
  "source_market_data_id": "LMD-BTC-USDT-20260503-100000",
  "features": {
    "momentum_1h": 0.018,
    "momentum_4h": 0.031,
    "volatility_1h": 0.0042,
    "volatility_24h": 0.011,
    "trend_filter": "PASS",
    "volatility_filter": "PASS"
  }
}
```

## 实盘信号输出

```json
{
  "object_type": "LiveSignal",
  "signal_id": "SIG-20260503-100000-BTC-001",
  "strategy_id": "S_MOM_VOL_BTC",
  "symbol": "BTC-USDT",
  "timestamp": "2026-05-03 10:00:00",
  "direction": "BUY",
  "strength": 0.68,
  "confidence": 0.74,
  "market_state": "TREND_UP_LOW_VOL",
  "reason": "momentum_1h > 0.01 and volatility_1h < 0.008"
}
```

注意：这里输出的是 **信号**，不是订单。

---

# 5. 组合决策层：信号 → 目标组合 → 调仓计划

系统开始计算账户应该持有什么。

## 当前账户状态

```json
{
  "object_type": "CurrentAccountSnapshot",
  "snapshot_id": "ACCT-SNAP-20260503-100000",
  "account_id": "acct_spot_001",
  "balances": {
    "USDT": 10000.00,
    "BTC": 0.1000
  },
  "mark_prices": {
    "BTC-USDT": 60000
  },
  "equity_usdt": 16000.00,
  "current_btc_value_usdt": 6000.00,
  "current_btc_weight": 0.375
}
```

## 组合决策

```json
{
  "object_type": "PortfolioDecision",
  "decision_id": "PD-20260503-100000-001",
  "source_signal_id": "SIG-20260503-100000-BTC-001",
  "decision": "INCREASE_BTC_EXPOSURE",
  "target_btc_weight": 0.50,
  "reason": "bullish signal with acceptable volatility"
}
```

## 目标组合

```json
{
  "object_type": "PortfolioTarget",
  "portfolio_target_id": "PT-20260503-100000-001",
  "account_id": "acct_spot_001",
  "target": {
    "BTC": {
      "target_weight": 0.50,
      "target_value_usdt": 8000.00,
      "target_quantity": 0.133333
    },
    "USDT": {
      "target_weight": 0.50,
      "target_value_usdt": 8000.00
    }
  }
}
```

## 调仓计划

```json
{
  "object_type": "RebalancePlan",
  "rebalance_plan_id": "RB-20260503-100000-001",
  "portfolio_target_id": "PT-20260503-100000-001",
  "current_btc_quantity": 0.1000,
  "target_btc_quantity": 0.133333,
  "raw_delta_btc": 0.033333,
  "rounded_delta_btc": 0.0330,
  "estimated_notional_usdt": 1980.00,
  "action": "BUY_BTC"
}
```

这一层的输出是：**需要买入 0.0330 BTC**。

但这还不是订单。

---

# 6. 订单意图层：调仓计划 → 订单意图 → 交易前风控

系统把调仓计划转成订单意图。

## 订单意图

```json
{
  "object_type": "OrderIntent",
  "order_intent_id": "OI-20260503-100000-001",
  "rebalance_plan_id": "RB-20260503-100000-001",
  "strategy_id": "S_MOM_VOL_BTC",
  "account_id": "acct_spot_001",
  "exchange": "okx",
  "symbol": "BTC-USDT",
  "side": "BUY",
  "amount": 0.0330,
  "estimated_price": 60000,
  "estimated_notional_usdt": 1980.00,
  "reason": "rebalance_to_target_btc_weight",
  "idempotency_key": "OI-acct_spot_001-BTC-USDT-BUY-20260503-100000"
}
```

## 交易前风控检查

| 风控项 | 假数据 | 结果 |
|---|---:|---|
| 全局 Kill Switch | false | 通过 |
| 单日亏损限制 | 当前 PnL = 0，限制 = -320 USDT | 通过 |
| 最大单笔订单金额 | 1,980 < 2,500 USDT | 通过 |
| 单币种最大风险暴露 | 买入后 BTC 权重约 49.9%，限制 55% | 通过 |
| USDT 余额 | 10,000 USDT，预计需要 1,981.42 USDT | 通过 |
| 最大滑点限制 | 限制 10 bps，买入最高价 60,060 | 通过 |
| 最小下单量 | 0.0330 BTC > 0.0001 BTC | 通过 |

## 风控决策输出

```json
{
  "object_type": "RiskDecision",
  "risk_decision_id": "RD-20260503-100000-001",
  "order_intent_id": "OI-20260503-100000-001",
  "approved": true,
  "adjusted_amount": 0.0330,
  "max_allowed_price": 60060,
  "risk_state": "NORMAL",
  "reject_reason": null
}
```

这一步之后，订单意图才允许进入执行计划层。

---

# 7. 执行计划层：订单意图 → 执行计划 → Hummingbot 请求

系统现在决定“怎么买”。

## 执行计划

```json
{
  "object_type": "ExecutionPlan",
  "execution_plan_id": "EP-20260503-100000-001",
  "order_intent_id": "OI-20260503-100000-001",
  "executor_type": "limit_order",
  "exchange": "okx",
  "symbol": "BTC-USDT",
  "side": "BUY",
  "amount": 0.0330,
  "limit_price": 59995,
  "post_only": true,
  "time_limit_seconds": 60,
  "cancel_on_timeout": true,
  "max_slippage_bps": 10,
  "retry_count": 0
}
```

这里为什么用 59,995？

```text
当前 best_bid = 59,990
当前 best_ask = 60,010
mid = 60,000

系统选择在 59,995 挂买单：
- 低于 best_ask，不会直接吃单
- 高于 best_bid，有机会成为更优买单
- post_only = true，尽量做 maker
```

## Hummingbot 请求

```json
{
  "object_type": "HummingbotRequest",
  "hummingbot_request_id": "HBREQ-20260503-100000-001",
  "execution_plan_id": "EP-20260503-100000-001",
  "connector": "okx",
  "trading_pair": "BTC-USDT",
  "action": "CREATE_LIMIT_ORDER",
  "order": {
    "side": "BUY",
    "amount": "0.0330",
    "price": "59995",
    "post_only": true
  }
}
```

这一层的输出是 Hummingbot 能理解的执行请求。

---

# 8. Hummingbot 执行层：Hummingbot 请求 → 交易所订单

Hummingbot 接收请求，然后连接 OKX 创建真实订单。

## Hummingbot 执行任务

```json
{
  "object_type": "HummingbotTask",
  "hb_task_id": "HBT-20260503-100000-001",
  "hummingbot_request_id": "HBREQ-20260503-100000-001",
  "status": "RUNNING",
  "connector": "okx",
  "trading_pair": "BTC-USDT",
  "executor_type": "limit_order"
}
```

## 交易所订单

```json
{
  "object_type": "ExchangeOrder",
  "exchange_order_id": "OKX-778899001",
  "client_order_id": "CL-OI-20260503-100000-001",
  "hb_task_id": "HBT-20260503-100000-001",
  "symbol": "BTC-USDT",
  "side": "BUY",
  "price": 59995,
  "amount": 0.0330,
  "filled_amount": 0,
  "status": "OPEN",
  "created_at": "2026-05-03 10:00:02"
}
```

这时才真正有交易所订单。

---

# 9. 交易事件层：订单事件 → 成交事件 → 幂等处理

订单开始产生事件。

## 订单事件流

| 时间 | 事件 | 数据 |
|---|---|---|
| 10:00:01 | ORDER_CREATED | 系统创建 Hummingbot 请求 |
| 10:00:02 | ORDER_SUBMITTED | Hummingbot 向 OKX 提交订单 |
| 10:00:03 | ORDER_ACCEPTED | OKX 接受订单，订单号 OKX-778899001 |
| 10:00:22 | ORDER_PARTIALLY_FILLED | 成交 0.0200 BTC |
| 10:00:45 | ORDER_FILLED | 剩余 0.0130 BTC 成交 |
| 10:00:46 | ORDER_CLOSED | 订单完全结束 |

## 成交事件 1

```json
{
  "object_type": "FillEvent",
  "fill_event_id": "FILL-20260503-100022-001",
  "exchange": "okx",
  "account_id": "acct_spot_001",
  "exchange_order_id": "OKX-778899001",
  "trade_id": "OKX-TRADE-abc001",
  "symbol": "BTC-USDT",
  "side": "BUY",
  "price": 59995,
  "amount": 0.0200,
  "notional_usdt": 1199.90,
  "fee_amount": 0.95992,
  "fee_currency": "USDT",
  "event_time": "2026-05-03 10:00:22"
}
```

## 成交事件 2

```json
{
  "object_type": "FillEvent",
  "fill_event_id": "FILL-20260503-100045-002",
  "exchange": "okx",
  "account_id": "acct_spot_001",
  "exchange_order_id": "OKX-778899001",
  "trade_id": "OKX-TRADE-abc002",
  "symbol": "BTC-USDT",
  "side": "BUY",
  "price": 59995,
  "amount": 0.0130,
  "notional_usdt": 779.935,
  "fee_amount": 0.623948,
  "fee_currency": "USDT",
  "event_time": "2026-05-03 10:00:45"
}
```

总成交：

```text
成交 BTC：
0.0200 + 0.0130 = 0.0330 BTC

成交金额：
1,199.90 + 779.935 = 1,979.835 USDT

手续费：
0.95992 + 0.623948 = 1.583868 USDT

总现金扣减：
1,979.835 + 1.583868 = 1,981.418868 USDT
```

## 幂等处理

假设系统重连后，Hummingbot 又回传了一次第二笔成交。

重复事件：

```json
{
  "trade_id": "OKX-TRADE-abc002",
  "exchange_order_id": "OKX-778899001",
  "amount": 0.0130,
  "price": 59995
}
```

幂等处理器检查：

```text
idempotency_key =
okx + acct_spot_001 + OKX-778899001 + OKX-TRADE-abc002
```

发现这个成交已经处理过：

```json
{
  "object_type": "IdempotencyResult",
  "fill_event_id": "FILL-20260503-100045-002-DUPLICATE",
  "status": "SKIPPED",
  "reason": "duplicate trade_id"
}
```

所以账本不会重复增加 BTC，也不会重复扣 USDT。

---

# 10. 账本风控层：成交事件 → 持仓/现金/费用/PnL/风险

幂等后的成交事件进入账本。

## 交易前账本

```json
{
  "object_type": "LedgerSnapshot",
  "snapshot_id": "LEDGER-BEFORE-20260503-100000",
  "account_id": "acct_spot_001",
  "balances": {
    "USDT": 10000.00,
    "BTC": 0.1000
  },
  "btc_cost_basis_usdt": 58000,
  "btc_position_cost_usdt": 5800.00
}
```

## 交易后持仓账本

```json
{
  "object_type": "PositionLedger",
  "ledger_entry_id": "POS-LEDGER-20260503-100046-001",
  "account_id": "acct_spot_001",
  "symbol": "BTC",
  "before_quantity": 0.1000,
  "change_quantity": 0.0330,
  "after_quantity": 0.1330,
  "new_position_cost_usdt": 7781.418868,
  "new_avg_cost_usdt": 58506.91
}
```

计算过程：

```text
原 BTC 成本：
0.1000 * 58,000 = 5,800 USDT

新买入成本：
1,979.835 + 1.583868 = 1,981.418868 USDT

总 BTC 成本：
5,800 + 1,981.418868 = 7,781.418868 USDT

新 BTC 数量：
0.1000 + 0.0330 = 0.1330 BTC

新平均成本：
7,781.418868 / 0.1330 = 58,506.91 USDT
```

## 交易后现金账本

```json
{
  "object_type": "CashLedger",
  "ledger_entry_id": "CASH-LEDGER-20260503-100046-001",
  "account_id": "acct_spot_001",
  "asset": "USDT",
  "before_balance": 10000.00,
  "trade_notional_debit": 1979.835,
  "fee_debit": 1.583868,
  "after_balance": 8018.581132
}
```

## 费用账本

```json
{
  "object_type": "FeeLedger",
  "ledger_entry_id": "FEE-LEDGER-20260503-100046-001",
  "account_id": "acct_spot_001",
  "symbol": "BTC-USDT",
  "fee_currency": "USDT",
  "fee_amount": 1.583868,
  "fee_type": "maker_fee"
}
```

---

# 11. 盈亏计算

成交后，BTC 最新 mark price 变成 60,020。

```json
{
  "object_type": "PnLResult",
  "pnl_id": "PNL-20260503-100100-001",
  "account_id": "acct_spot_001",
  "mark_prices": {
    "BTC-USDT": 60020
  },
  "cash_usdt": 8018.581132,
  "btc_quantity": 0.1330,
  "btc_mark_value_usdt": 7982.66,
  "equity_usdt": 16001.241132,
  "position_cost_usdt": 7781.418868,
  "unrealized_pnl_usdt": 201.241132
}
```

账户权益计算：

```text
BTC 市值：
0.1330 * 60,020 = 7,982.66 USDT

USDT 现金：
8,018.581132 USDT

账户总权益：
7,982.66 + 8,018.581132 = 16,001.241132 USDT
```

这笔交易之后，账户从 16,000 变成 16,001.241132。

变动来源：

```text
原有 0.1000 BTC 从 60,000 涨到 60,020：
0.1000 * 20 = +2.00 USDT

新买入 0.0330 BTC 从 59,995 到 60,020：
0.0330 * 25 = +0.825 USDT

手续费：
-1.583868 USDT

总变化：
2.00 + 0.825 - 1.583868 = +1.241132 USDT
```

---

# 12. 风险计算

```json
{
  "object_type": "RiskSnapshot",
  "risk_snapshot_id": "RISK-20260503-100100-001",
  "account_id": "acct_spot_001",
  "equity_usdt": 16001.241132,
  "btc_exposure_usdt": 7982.66,
  "btc_exposure_pct": 0.4989,
  "daily_pnl_usdt": 1.241132,
  "daily_loss_limit_usdt": -320,
  "max_symbol_exposure_pct": 0.55,
  "risk_state": "NORMAL"
}
```

风控判断：

```text
BTC 当前风险暴露：
7,982.66 / 16,001.241132 = 49.89%

限制：
55%

结果：
没有超限
```

---

# 13. 交易所对账

系统把内部账本和交易所实际账户做对账。

| 项目 | 内部系统 | OKX 返回 | 状态 |
|---|---:|---:|---|
| BTC | 0.1330 | 0.1330 | 一致 |
| USDT | 8018.581132 | 8018.581132 | 一致 |
| 未完成订单 | 0 | 0 | 一致 |
| 成交记录 | 2 笔 | 2 笔 | 一致 |
| 手续费 | 1.583868 USDT | 1.583868 USDT | 一致 |

输出：

```json
{
  "object_type": "ReconciliationResult",
  "reconciliation_id": "RECON-20260503-100200-001",
  "account_id": "acct_spot_001",
  "status": "PASS",
  "position_matched": true,
  "cash_matched": true,
  "order_matched": true,
  "fill_matched": true
}
```

---

# 14. 复盘迭代层：归因 → 复盘 → 参数迭代

交易完成后，系统生成复盘数据。

## 业绩归因

```json
{
  "object_type": "AttributionReport",
  "attribution_id": "ATTR-20260503-100300-001",
  "account_id": "acct_spot_001",
  "strategy_id": "S_MOM_VOL_BTC",
  "trade_id": "OI-20260503-100000-001",
  "pnl_breakdown": {
    "existing_btc_price_move": 2.00,
    "new_trade_mark_to_market": 0.825,
    "fee_cost": -1.583868,
    "total_equity_change": 1.241132
  },
  "execution_quality": {
    "intended_mid_price": 60000,
    "actual_avg_fill_price": 59995,
    "price_improvement_usdt": 0.165,
    "fully_filled_seconds": 45,
    "maker_order": true
  }
}
```

价格改善计算：

```text
如果按 mid price 60,000 买入：
0.0330 * 60,000 = 1,980.00 USDT

实际按 59,995 买入：
0.0330 * 59,995 = 1,979.835 USDT

价格改善：
1,980.00 - 1,979.835 = 0.165 USDT
```

## 策略复盘

```json
{
  "object_type": "StrategyReview",
  "review_id": "REVIEW-20260503-DAILY-001",
  "strategy_id": "S_MOM_VOL_BTC",
  "summary": {
    "signal_count": 1,
    "order_intent_count": 1,
    "approved_order_count": 1,
    "filled_order_count": 1,
    "duplicate_fill_skipped": 1,
    "reconciliation_status": "PASS",
    "risk_state": "NORMAL"
  },
  "conclusion": "strategy operating normally, no parameter change required"
}
```

## 参数迭代

这次没有改参数。

```json
{
  "object_type": "ParameterIteration",
  "parameter_iteration_id": "PARAM-ITER-20260503-001",
  "strategy_id": "S_MOM_VOL_BTC",
  "current_parameter_version": "v1.2.0",
  "new_parameter_version": null,
  "action": "KEEP_CURRENT_PARAMS",
  "reason": "execution normal, risk normal, pnl attribution expected"
}
```

---

# 15. 全链路对象追踪

这笔交易从数据到复盘，完整对象链是：

```text
HistoricalData
HD-BTC-USDT-20260503-1m
    ↓
DataQualityResult
DQC-BTC-USDT-20260503-1m
    ↓
FeatureSet
FEAT-BTC-USDT-20260503-100000
    ↓
StrategyParameterSet
PARAM-S_MOM_VOL_BTC-v1.2.0
    ↓
BacktestResult
BT-S_MOM_VOL_BTC-v1.2.0-202604
    ↓
DeploymentConfig
DEPLOY-S_MOM_VOL_BTC-v1.2.0-acct_spot_001
    ↓
LiveMarketData
LMD-BTC-USDT-20260503-100000
    ↓
LiveSignal
SIG-20260503-100000-BTC-001
    ↓
PortfolioDecision
PD-20260503-100000-001
    ↓
PortfolioTarget
PT-20260503-100000-001
    ↓
RebalancePlan
RB-20260503-100000-001
    ↓
OrderIntent
OI-20260503-100000-001
    ↓
RiskDecision
RD-20260503-100000-001
    ↓
ExecutionPlan
EP-20260503-100000-001
    ↓
HummingbotRequest
HBREQ-20260503-100000-001
    ↓
HummingbotTask
HBT-20260503-100000-001
    ↓
ExchangeOrder
OKX-778899001
    ↓
OrderEvent
ORDER_CREATED / ORDER_ACCEPTED / ORDER_FILLED
    ↓
FillEvent
FILL-20260503-100022-001
FILL-20260503-100045-002
    ↓
IdempotencyResult
duplicate fill skipped
    ↓
PositionLedger / CashLedger / FeeLedger
POS-LEDGER-20260503-100046-001
CASH-LEDGER-20260503-100046-001
FEE-LEDGER-20260503-100046-001
    ↓
PnLResult
PNL-20260503-100100-001
    ↓
RiskSnapshot
RISK-20260503-100100-001
    ↓
ReconciliationResult
RECON-20260503-100200-001
    ↓
AttributionReport
ATTR-20260503-100300-001
    ↓
StrategyReview
REVIEW-20260503-DAILY-001
```

---

# 16. 用一句话看懂这个假例子

这套系统实际运行时是这样：

```text
实时行情告诉系统：BTC 当前 60,000，趋势向上，波动率可接受。

策略生成 BUY 信号。

组合层发现 BTC 当前只占 37.5%，目标是 50%，所以需要买入 0.0330 BTC。

订单意图层生成买入意图。

交易前风控检查：余额够、风险没超、订单金额没超、滑点没超，所以放行。

执行计划层决定用 Hummingbot 挂 post-only 限价买单，价格 59,995。

Hummingbot 把订单发到 OKX。

OKX 分两次成交，共买入 0.0330 BTC。

交易事件层收到两个成交事件，并跳过一个重复回传事件。

账本层增加 BTC，扣减 USDT，记录手续费。

PnL 层计算账户权益从 16,000 变成 16,001.241132。

风险层确认 BTC 暴露 49.89%，低于 55% 上限。

对账层确认内部账本和 OKX 一致。

复盘层记录这笔交易正常，不需要改参数。
```

这个例子里最关键的边界是：

```text
LiveSignal 只是信号；
PortfolioTarget 只是目标；
OrderIntent 只是交易意图；
ExecutionPlan 才决定怎么执行；
ExchangeOrder 才是真实交易所订单；
FillEvent 才是真实成交事实；
Ledger 只根据成交事实更新；
Review 只生成复盘结论，不直接改实盘参数。
```

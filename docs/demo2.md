# 量化系统卖出场景：假数据全链路示例

> 场景说明：本文承接前一步“买入成功”后的账户状态，展示一次 **触发卖出、成功成交、更新账本、完成复盘** 的完整数据流程。
>
> 主链路：实时行情 → 实盘信号 → 组合决策 → 目标组合 → 调仓计划 → 订单意图 → 交易前风控 → 执行计划 → Hummingbot 执行层 → 交易事件层 → 账本风控层 → 复盘迭代层。

---

## 0. 承接上一笔买入后的账户状态

上一笔买入完成后，账户状态如下：

```json
{
  "object_type": "LedgerSnapshot",
  "snapshot_id": "LEDGER-AFTER-BUY-20260503-100100",
  "account_id": "acct_spot_001",
  "exchange": "okx",
  "balances": {
    "USDT": 8018.581132,
    "BTC": 0.1330
  },
  "btc_avg_cost_usdt": 58506.91,
  "btc_position_cost_usdt": 7781.418868,
  "last_mark_price": 60020,
  "equity_usdt": 16001.241132,
  "btc_exposure_pct": 0.4989
}
```

简单理解：

```text
现在账户有：
USDT = 8,018.581132
BTC = 0.1330

BTC 平均成本 = 58,506.91
BTC 最新价格 = 60,020
BTC 仓位权重约 = 49.89%
```

策略当前处于接近 50% BTC 仓位的状态。

---

## 1. 新行情触发卖出信号

到了下午，市场状态变化。

假设时间：

```text
2026-05-03 15:30:00
```

实时行情如下：

```json
{
  "object_type": "LiveMarketData",
  "object_id": "LMD-BTC-USDT-20260503-153000",
  "exchange": "okx",
  "symbol": "BTC-USDT",
  "timestamp": "2026-05-03 15:30:00",
  "best_bid": 61190,
  "best_ask": 61210,
  "mid_price": 61200,
  "spread_bps": 3.27,
  "order_book_depth_1pct_usdt": 9800000,
  "last_price": 61200
}
```

实时特征变成这样：

```json
{
  "object_type": "LiveFeatureSnapshot",
  "object_id": "LIVE-FEAT-BTC-USDT-20260503-153000",
  "source_market_data_id": "LMD-BTC-USDT-20260503-153000",
  "features": {
    "momentum_1h": 0.003,
    "momentum_4h": 0.018,
    "volatility_1h": 0.0125,
    "volatility_24h": 0.019,
    "volume_zscore_1h": 2.10,
    "trend_filter": "WEAKENING",
    "volatility_filter": "FAIL"
  }
}
```

解释：

```text
1 小时动量已经从强势变弱；
1 小时波动率 0.0125，超过策略允许的 0.008；
成交量异常放大；
趋势过滤器显示上涨趋势减弱；
波动率过滤器失败。
```

于是策略不再维持 50% BTC 仓位，而是切换到中性状态。

---

## 2. 实盘信号层：生成 SELL / REDUCE 信号

```json
{
  "object_type": "LiveSignal",
  "signal_id": "SIG-20260503-153000-BTC-002",
  "strategy_id": "S_MOM_VOL_BTC",
  "strategy_version": "v1.2.0",
  "symbol": "BTC-USDT",
  "timestamp": "2026-05-03 15:30:00",
  "signal_type": "REDUCE_EXPOSURE",
  "direction": "SELL",
  "strength": 0.62,
  "confidence": 0.71,
  "market_state": "NEUTRAL_HIGH_VOL",
  "reason": "volatility_1h > max_volatility_1h and trend_filter weakened"
}
```

这一步只产生信号：

```text
BTC 仓位太高了。
市场波动变大。
趋势变弱。
应该降低 BTC 风险暴露。
```

但它还不是订单。

---

## 3. 组合决策层：从 50% BTC 降到 30% BTC

当前账户状态按 BTC = 61,200 重新估值：

```json
{
  "object_type": "CurrentAccountSnapshot",
  "snapshot_id": "ACCT-SNAP-20260503-153000",
  "account_id": "acct_spot_001",
  "balances": {
    "USDT": 8018.581132,
    "BTC": 0.1330
  },
  "mark_prices": {
    "BTC-USDT": 61200
  },
  "btc_value_usdt": 8139.60,
  "equity_usdt": 16158.181132,
  "current_btc_weight": 0.5037
}
```

当前 BTC 权重：

```text
BTC 市值 = 0.1330 * 61,200 = 8,139.60 USDT

账户总权益 = 8,018.581132 + 8,139.60
          = 16,158.181132 USDT

当前 BTC 权重 = 8,139.60 / 16,158.181132
             ≈ 50.37%
```

策略进入中性状态后，目标 BTC 权重变成：

```text
target_btc_weight = 30%
```

于是组合决策输出：

```json
{
  "object_type": "PortfolioDecision",
  "decision_id": "PD-20260503-153000-002",
  "source_signal_id": "SIG-20260503-153000-BTC-002",
  "decision": "REDUCE_BTC_EXPOSURE",
  "current_btc_weight": 0.5037,
  "target_btc_weight": 0.30,
  "reason": "market_state changed from bullish to neutral_high_vol"
}
```

---

## 4. 目标组合：计算目标 BTC 数量

目标 BTC 价值：

```text
账户总权益 = 16,158.181132 USDT
目标 BTC 权重 = 30%

目标 BTC 价值 = 16,158.181132 * 0.30
             = 4,847.454340 USDT
```

目标 BTC 数量：

```text
目标 BTC 数量 = 4,847.454340 / 61,200
             = 0.07920677 BTC
```

当前 BTC 数量：

```text
当前 BTC = 0.1330 BTC
```

需要卖出的 BTC：

```text
需要卖出 = 0.1330 - 0.07920677
        = 0.05379323 BTC
```

按交易所精度处理后：

```text
卖出数量 = 0.0538 BTC
```

目标组合对象：

```json
{
  "object_type": "PortfolioTarget",
  "portfolio_target_id": "PT-20260503-153000-002",
  "account_id": "acct_spot_001",
  "source_decision_id": "PD-20260503-153000-002",
  "target": {
    "BTC": {
      "target_weight": 0.30,
      "target_value_usdt": 4847.454340,
      "target_quantity": 0.07920677
    },
    "USDT": {
      "target_weight": 0.70
    }
  }
}
```

---

## 5. 调仓计划：卖出 0.0538 BTC

```json
{
  "object_type": "RebalancePlan",
  "rebalance_plan_id": "RB-20260503-153000-002",
  "portfolio_target_id": "PT-20260503-153000-002",
  "current_btc_quantity": 0.1330,
  "target_btc_quantity": 0.07920677,
  "raw_delta_btc": -0.05379323,
  "rounded_delta_btc": -0.0538,
  "estimated_price": 61200,
  "estimated_notional_usdt": 3292.56,
  "action": "SELL_BTC"
}
```

这一步的意思是：

```text
为了把 BTC 权重从 50.37% 降到 30%，需要卖出 0.0538 BTC。
```

还没下单。

---

## 6. 订单意图层：生成卖出意图

```json
{
  "object_type": "OrderIntent",
  "order_intent_id": "OI-20260503-153000-002",
  "rebalance_plan_id": "RB-20260503-153000-002",
  "strategy_id": "S_MOM_VOL_BTC",
  "account_id": "acct_spot_001",
  "exchange": "okx",
  "symbol": "BTC-USDT",
  "side": "SELL",
  "amount": 0.0538,
  "estimated_price": 61200,
  "estimated_notional_usdt": 3292.56,
  "reason": "reduce_btc_exposure_to_neutral_target",
  "idempotency_key": "OI-acct_spot_001-BTC-USDT-SELL-20260503-153000"
}
```

这一步仍然只是：

```text
我想卖出 0.0538 BTC。
```

不是 Hummingbot 订单，也不是交易所订单。

---

## 7. 交易前风控检查

风控开始检查这笔卖出意图。

| 风控项 | 假数据 | 结果 |
|---|---:|---|
| 全局 Kill Switch | false | 通过 |
| 当前 BTC 持仓 | 0.1330 BTC | 足够卖出 0.0538 BTC |
| 卖出后 BTC 数量 | 0.0792 BTC | 正常 |
| 单日亏损限制 | 当前日内 PnL 为正 | 通过 |
| 最大单币种暴露 | 卖出后 BTC 暴露约 30% | 通过 |
| 最大滑点限制 | 10 bps | 通过 |
| 最大单笔订单金额 | 2,500 USDT | 父订单 3,292.56 USDT，需拆单 |
| 交易所最小下单量 | 0.0001 BTC | 通过 |
| 交易所价格精度 | 0.01 USDT | 通过 |

这里有一个细节：

```text
卖出总金额 3,292.56 USDT，超过最大单笔订单金额 2,500 USDT。
```

所以风控不直接拒绝，而是要求执行层拆成两笔：

```text
每笔 0.0269 BTC
每笔名义金额约 1,646 USDT
```

风控决策输出：

```json
{
  "object_type": "RiskDecision",
  "risk_decision_id": "RD-20260503-153000-002",
  "order_intent_id": "OI-20260503-153000-002",
  "approved": true,
  "risk_state": "NORMAL",
  "adjusted_amount": 0.0538,
  "execution_constraint": {
    "must_split": true,
    "max_child_order_notional_usdt": 2500,
    "recommended_child_order_count": 2
  },
  "min_allowed_sell_price": 61138.80,
  "reject_reason": null
}
```

最低允许卖出价的计算：

```text
mid price = 61,200
最大滑点 = 10 bps = 0.10%

最低允许卖出价 = 61,200 * (1 - 0.001)
              = 61,138.80
```

---

## 8. 执行计划层：决定用 TWAP 拆成两笔卖出

因为父订单超过最大单笔金额，所以执行层不用一笔限价单，而是使用类似 TWAP 的拆单执行。

```json
{
  "object_type": "ExecutionPlan",
  "execution_plan_id": "EP-20260503-153000-002",
  "order_intent_id": "OI-20260503-153000-002",
  "executor_type": "TWAP_SELL",
  "exchange": "okx",
  "symbol": "BTC-USDT",
  "side": "SELL",
  "total_amount": 0.0538,
  "child_order_count": 2,
  "child_order_amount": 0.0269,
  "post_only": true,
  "time_limit_seconds": 180,
  "child_interval_seconds": 60,
  "min_allowed_price": 61138.80,
  "cancel_on_timeout": true,
  "retry_count": 0,
  "max_slippage_bps": 10
}
```

解释：

```text
总共卖出 0.0538 BTC；
拆成 2 个子订单；
每个子订单卖出 0.0269 BTC；
尽量 post-only 做 maker；
如果 180 秒内不能完成，就撤单；
不低于 61,138.80 成交。
```

---

## 9. Hummingbot 请求：创建卖出执行任务

```json
{
  "object_type": "HummingbotRequest",
  "hummingbot_request_id": "HBREQ-20260503-153000-002",
  "execution_plan_id": "EP-20260503-153000-002",
  "connector": "okx",
  "trading_pair": "BTC-USDT",
  "action": "CREATE_TWAP_EXECUTOR",
  "executor_config": {
    "side": "SELL",
    "total_amount": "0.0538",
    "child_order_amount": "0.0269",
    "child_order_count": 2,
    "post_only": true,
    "min_allowed_price": "61138.80",
    "time_limit_seconds": 180
  }
}
```

---

## 10. Hummingbot 执行层：创建两笔真实交易所卖单

Hummingbot 接到任务后，开始创建子订单。

### Hummingbot 执行任务

```json
{
  "object_type": "HummingbotTask",
  "hb_task_id": "HBT-20260503-153000-002",
  "hummingbot_request_id": "HBREQ-20260503-153000-002",
  "status": "RUNNING",
  "connector": "okx",
  "trading_pair": "BTC-USDT",
  "executor_type": "TWAP_SELL",
  "total_amount": 0.0538,
  "filled_amount": 0
}
```

### 子订单 1

```json
{
  "object_type": "ExchangeOrder",
  "exchange_order_id": "OKX-778899002",
  "client_order_id": "CL-OI-20260503-153000-002-A",
  "hb_task_id": "HBT-20260503-153000-002",
  "symbol": "BTC-USDT",
  "side": "SELL",
  "price": 61210,
  "amount": 0.0269,
  "filled_amount": 0,
  "status": "OPEN",
  "created_at": "2026-05-03 15:30:05"
}
```

### 子订单 2

```json
{
  "object_type": "ExchangeOrder",
  "exchange_order_id": "OKX-778899003",
  "client_order_id": "CL-OI-20260503-153000-002-B",
  "hb_task_id": "HBT-20260503-153000-002",
  "symbol": "BTC-USDT",
  "side": "SELL",
  "price": 61205,
  "amount": 0.0269,
  "filled_amount": 0,
  "status": "OPEN",
  "created_at": "2026-05-03 15:31:05"
}
```

---

## 11. 交易事件层：订单事件流

订单开始回传状态。

| 时间 | 订单 | 事件 | 数据 |
|---|---|---|---|
| 15:30:05 | OKX-778899002 | ORDER_SUBMITTED | 提交第一笔卖单 |
| 15:30:06 | OKX-778899002 | ORDER_ACCEPTED | OKX 接受订单 |
| 15:31:02 | OKX-778899002 | ORDER_FILLED | 成交 0.0269 BTC |
| 15:31:05 | OKX-778899003 | ORDER_SUBMITTED | 提交第二笔卖单 |
| 15:31:06 | OKX-778899003 | ORDER_ACCEPTED | OKX 接受订单 |
| 15:32:14 | OKX-778899003 | ORDER_FILLED | 成交 0.0269 BTC |
| 15:32:15 | HBT-20260503-153000-002 | TASK_COMPLETED | TWAP 卖出任务完成 |

---

## 12. 成交事件流：两笔卖出成交

### 成交事件 1

```json
{
  "object_type": "FillEvent",
  "fill_event_id": "FILL-20260503-153102-003",
  "exchange": "okx",
  "account_id": "acct_spot_001",
  "exchange_order_id": "OKX-778899002",
  "trade_id": "OKX-TRADE-def001",
  "symbol": "BTC-USDT",
  "side": "SELL",
  "price": 61210,
  "amount": 0.0269,
  "notional_usdt": 1646.549,
  "fee_amount": 1.3172392,
  "fee_currency": "USDT",
  "event_time": "2026-05-03 15:31:02"
}
```

### 成交事件 2

```json
{
  "object_type": "FillEvent",
  "fill_event_id": "FILL-20260503-153214-004",
  "exchange": "okx",
  "account_id": "acct_spot_001",
  "exchange_order_id": "OKX-778899003",
  "trade_id": "OKX-TRADE-def002",
  "symbol": "BTC-USDT",
  "side": "SELL",
  "price": 61205,
  "amount": 0.0269,
  "notional_usdt": 1646.4145,
  "fee_amount": 1.3171316,
  "fee_currency": "USDT",
  "event_time": "2026-05-03 15:32:14"
}
```

总成交结果：

```text
卖出 BTC：
0.0269 + 0.0269 = 0.0538 BTC

成交金额：
1,646.549 + 1,646.4145 = 3,292.9635 USDT

手续费：
1.3172392 + 1.3171316 = 2.6343708 USDT

卖出净收入：
3,292.9635 - 2.6343708 = 3,290.3291292 USDT

平均成交价：
3,292.9635 / 0.0538 = 61,207.50 USDT
```

---

## 13. 成交幂等处理

假设 Hummingbot 重连后，第二笔成交又回传了一次。

重复事件：

```json
{
  "exchange": "okx",
  "account_id": "acct_spot_001",
  "exchange_order_id": "OKX-778899003",
  "trade_id": "OKX-TRADE-def002",
  "side": "SELL",
  "price": 61205,
  "amount": 0.0269
}
```

幂等处理器生成 key：

```text
okx + acct_spot_001 + OKX-778899003 + OKX-TRADE-def002
```

发现该成交已经入账。

```json
{
  "object_type": "IdempotencyResult",
  "fill_event_id": "FILL-20260503-153214-004-DUPLICATE",
  "status": "SKIPPED",
  "reason": "duplicate trade_id"
}
```

所以系统不会重复减少 BTC，也不会重复增加 USDT。

---

## 14. 账本风控层：更新持仓、现金、费用

### 卖出前账本

```json
{
  "object_type": "LedgerSnapshot",
  "snapshot_id": "LEDGER-BEFORE-SELL-20260503-153000",
  "account_id": "acct_spot_001",
  "balances": {
    "USDT": 8018.581132,
    "BTC": 0.1330
  },
  "btc_avg_cost_usdt": 58506.91,
  "btc_position_cost_usdt": 7781.418868
}
```

### 卖出后持仓账本

```json
{
  "object_type": "PositionLedger",
  "ledger_entry_id": "POS-LEDGER-20260503-153215-002",
  "account_id": "acct_spot_001",
  "symbol": "BTC",
  "before_quantity": 0.1330,
  "change_quantity": -0.0538,
  "after_quantity": 0.0792,
  "avg_cost_usdt": 58506.91,
  "removed_position_cost_usdt": 3147.671692,
  "remaining_position_cost_usdt": 4633.747176
}
```

计算过程：

```text
卖出前 BTC 平均成本 = 58,506.91

卖出 0.0538 BTC 对应成本：
0.0538 * 58,506.91 = 3,147.671692 USDT

剩余 BTC：
0.1330 - 0.0538 = 0.0792 BTC

剩余持仓成本：
7,781.418868 - 3,147.671692
= 4,633.747176 USDT
```

### 卖出后现金账本

```json
{
  "object_type": "CashLedger",
  "ledger_entry_id": "CASH-LEDGER-20260503-153215-002",
  "account_id": "acct_spot_001",
  "asset": "USDT",
  "before_balance": 8018.581132,
  "sell_gross_credit": 3292.9635,
  "fee_debit": 2.6343708,
  "net_credit": 3290.3291292,
  "after_balance": 11308.9102612
}
```

计算过程：

```text
卖出总收入 = 3,292.9635 USDT
手续费 = 2.6343708 USDT

净到账 = 3,292.9635 - 2.6343708
       = 3,290.3291292 USDT

卖出后 USDT：
8,018.581132 + 3,290.3291292
= 11,308.9102612 USDT
```

### 费用账本

```json
{
  "object_type": "FeeLedger",
  "ledger_entry_id": "FEE-LEDGER-20260503-153215-002",
  "account_id": "acct_spot_001",
  "symbol": "BTC-USDT",
  "fee_currency": "USDT",
  "fee_amount": 2.6343708,
  "fee_type": "maker_fee"
}
```

---

## 15. 实现盈亏计算

这次卖出是减仓，所以会产生已实现盈亏。

```text
卖出总金额 = 3,292.9635 USDT
手续费 = 2.6343708 USDT
卖出对应成本 = 3,147.671692 USDT

已实现盈亏 =
卖出总金额 - 手续费 - 卖出对应成本

= 3,292.9635 - 2.6343708 - 3,147.671692
= 142.657437 USDT
```

PnL 结果：

```json
{
  "object_type": "PnLResult",
  "pnl_id": "PNL-20260503-153215-002",
  "account_id": "acct_spot_001",
  "realized_pnl_from_sell_usdt": 142.657437,
  "fee_paid_usdt": 2.634371,
  "remaining_btc_quantity": 0.0792,
  "remaining_btc_cost_usdt": 4633.747176
}
```

注意这里的重点：

```text
这次卖出兑现了 142.657437 USDT 的已实现收益。
```

---

## 16. 卖出后账户权益

假设卖出完成后，BTC 最新 mark price 是：

```text
BTC mark price = 61,205
```

剩余 BTC 市值：

```text
0.0792 * 61,205 = 4,847.436 USDT
```

卖出后总权益：

```text
USDT 现金 = 11,308.9102612
BTC 市值 = 4,847.436

账户总权益 = 11,308.9102612 + 4,847.436
          = 16,156.3462612 USDT
```

PnL 结果扩展：

```json
{
  "object_type": "PnLResult",
  "pnl_id": "PNL-20260503-153300-003",
  "account_id": "acct_spot_001",
  "mark_prices": {
    "BTC-USDT": 61205
  },
  "cash_usdt": 11308.9102612,
  "btc_quantity": 0.0792,
  "btc_mark_value_usdt": 4847.436,
  "equity_usdt": 16156.3462612,
  "realized_pnl_from_sell_usdt": 142.657437,
  "remaining_unrealized_pnl_usdt": 213.688824
}
```

剩余未实现盈亏：

```text
剩余 BTC 市值 = 4,847.436
剩余 BTC 成本 = 4,633.747176

剩余未实现盈亏 =
4,847.436 - 4,633.747176
= 213.688824 USDT
```

这里有两个不同口径：

```text
已实现收益：142.657437 USDT
剩余未实现收益：213.688824 USDT

这两个加起来，是当前 BTC 持仓体系相对成本的收益。
```

---

## 17. 风险计算：BTC 仓位降到约 30%

卖出后：

```text
BTC 市值 = 4,847.436
账户权益 = 16,156.3462612

BTC 权重 =
4,847.436 / 16,156.3462612
≈ 30.00%
```

风险快照：

```json
{
  "object_type": "RiskSnapshot",
  "risk_snapshot_id": "RISK-20260503-153300-002",
  "account_id": "acct_spot_001",
  "equity_usdt": 16156.3462612,
  "btc_exposure_usdt": 4847.436,
  "btc_exposure_pct": 0.3000,
  "cash_usdt": 11308.9102612,
  "daily_loss_limit_usdt": -320,
  "max_symbol_exposure_pct": 0.55,
  "risk_state": "NORMAL"
}
```

风控结论：

```text
BTC 仓位已经从 50.37% 降到约 30.00%。
风险状态正常。
没有触发 Kill Switch。
没有超出单币种风险暴露。
```

---

## 18. 交易所对账

系统用内部账本和 OKX 返回数据对账。

| 项目 | 内部系统 | OKX 返回 | 状态 |
|---|---:|---:|---|
| BTC | 0.0792 | 0.0792 | 一致 |
| USDT | 11,308.9102612 | 11,308.9102612 | 一致 |
| 未完成订单 | 0 | 0 | 一致 |
| 卖出成交记录 | 2 笔 | 2 笔 | 一致 |
| 手续费 | 2.6343708 USDT | 2.6343708 USDT | 一致 |

对账结果：

```json
{
  "object_type": "ReconciliationResult",
  "reconciliation_id": "RECON-20260503-153400-002",
  "account_id": "acct_spot_001",
  "status": "PASS",
  "position_matched": true,
  "cash_matched": true,
  "order_matched": true,
  "fill_matched": true,
  "fee_matched": true
}
```

---

## 19. 业绩归因

系统开始分析这次卖出到底发生了什么。

```json
{
  "object_type": "AttributionReport",
  "attribution_id": "ATTR-20260503-153500-002",
  "account_id": "acct_spot_001",
  "strategy_id": "S_MOM_VOL_BTC",
  "order_intent_id": "OI-20260503-153000-002",
  "trade_summary": {
    "side": "SELL",
    "amount": 0.0538,
    "average_fill_price": 61207.50,
    "gross_proceeds_usdt": 3292.9635,
    "fee_usdt": 2.6343708,
    "net_proceeds_usdt": 3290.3291292
  },
  "pnl_breakdown": {
    "removed_position_cost_usdt": 3147.671692,
    "realized_pnl_usdt": 142.657437,
    "remaining_unrealized_pnl_usdt": 213.688824
  },
  "execution_quality": {
    "intended_mid_price": 61200,
    "actual_avg_fill_price": 61207.50,
    "price_improvement_usdt": 0.4035,
    "fully_filled_seconds": 134,
    "child_orders": 2,
    "maker_order": true
  }
}
```

价格改善：

```text
如果按 mid price 61,200 卖出：
0.0538 * 61,200 = 3,292.56 USDT

实际平均按 61,207.50 卖出：
0.0538 * 61,207.50 = 3,292.9635 USDT

价格改善：
3,292.9635 - 3,292.56
= 0.4035 USDT
```

不过手续费是：

```text
2.6343708 USDT
```

所以执行层虽然价格略好，但手续费仍然是主要交易成本。

---

## 20. 策略复盘

```json
{
  "object_type": "StrategyReview",
  "review_id": "REVIEW-20260503-SELL-002",
  "strategy_id": "S_MOM_VOL_BTC",
  "summary": {
    "sell_signal_count": 1,
    "order_intent_count": 1,
    "approved_order_count": 1,
    "child_order_count": 2,
    "filled_child_order_count": 2,
    "duplicate_fill_skipped": 1,
    "realized_pnl_usdt": 142.657437,
    "btc_exposure_before": 0.5037,
    "btc_exposure_after": 0.3000,
    "reconciliation_status": "PASS",
    "risk_state": "NORMAL"
  },
  "conclusion": "sell execution completed successfully, target exposure reached, no parameter change required"
}
```

参数迭代：

```json
{
  "object_type": "ParameterIteration",
  "parameter_iteration_id": "PARAM-ITER-20260503-SELL-002",
  "strategy_id": "S_MOM_VOL_BTC",
  "current_parameter_version": "v1.2.0",
  "new_parameter_version": null,
  "action": "KEEP_CURRENT_PARAMS",
  "reason": "sell signal, execution, ledger update and reconciliation all normal"
}
```

---

## 21. 这次卖出完整对象链

这次卖出从信号到复盘，完整链路是：

```text
LiveMarketData
LMD-BTC-USDT-20260503-153000
    ↓
LiveFeatureSnapshot
LIVE-FEAT-BTC-USDT-20260503-153000
    ↓
LiveSignal
SIG-20260503-153000-BTC-002
    ↓
PortfolioDecision
PD-20260503-153000-002
    ↓
PortfolioTarget
PT-20260503-153000-002
    ↓
RebalancePlan
RB-20260503-153000-002
    ↓
OrderIntent
OI-20260503-153000-002
    ↓
RiskDecision
RD-20260503-153000-002
    ↓
ExecutionPlan
EP-20260503-153000-002
    ↓
HummingbotRequest
HBREQ-20260503-153000-002
    ↓
HummingbotTask
HBT-20260503-153000-002
    ↓
ExchangeOrder
OKX-778899002
OKX-778899003
    ↓
OrderEvent
ORDER_SUBMITTED / ORDER_ACCEPTED / ORDER_FILLED
    ↓
FillEvent
FILL-20260503-153102-003
FILL-20260503-153214-004
    ↓
IdempotencyResult
duplicate fill skipped
    ↓
PositionLedger
POS-LEDGER-20260503-153215-002
    ↓
CashLedger
CASH-LEDGER-20260503-153215-002
    ↓
FeeLedger
FEE-LEDGER-20260503-153215-002
    ↓
PnLResult
PNL-20260503-153300-003
    ↓
RiskSnapshot
RISK-20260503-153300-002
    ↓
ReconciliationResult
RECON-20260503-153400-002
    ↓
AttributionReport
ATTR-20260503-153500-002
    ↓
StrategyReview
REVIEW-20260503-SELL-002
```

---

## 22. 一句话总结这次卖出流程

```text
市场从上涨低波动变成中性高波动。

策略生成 SELL / REDUCE_EXPOSURE 信号。

组合层发现 BTC 当前权重约 50.37%，目标应该降到 30%。

调仓计划计算出需要卖出 0.0538 BTC。

订单意图层生成卖出意图。

交易前风控发现总金额 3,292.56 USDT，超过单笔 2,500 USDT 限额，所以要求拆成两笔。

执行计划层生成 TWAP_SELL 计划。

Hummingbot 创建两个 post-only 限价卖单。

OKX 分两笔成交，共卖出 0.0538 BTC，平均成交价 61,207.50。

成交事件进入幂等处理，重复成交被跳过。

账本减少 BTC，增加 USDT，记录手续费。

系统确认这次卖出实现收益 142.657437 USDT。

BTC 仓位从约 50.37% 降到约 30.00%。

交易所对账通过。

复盘结论是：卖出执行正常，目标仓位达成，不需要修改参数。
```

这个例子里，最关键的边界是：

```text
SELL 信号不是订单；
目标仓位不是订单；
订单意图不是交易所订单；
风控可以要求拆单；
ExecutionPlan 决定怎么卖；
Hummingbot 只负责执行；
FillEvent 才是真实成交事实；
账本只根据幂等后的成交更新；
复盘只生成结论，不直接改生产参数。
```

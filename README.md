# Chuan 量化交易系统

> 自研：策略大脑 / 信号 / 风控 / 组合管理 / 研究系统 / 监控系统
> Hummingbot：连接交易所 / 行情读取 / 下单 / 撤单 / 订单状态 / 执行器 / 基础部署

## 项目结构

```
chuan/
├── backend/          # FastAPI 后端（Python 3.11+）
├── frontend/         # React + Vite + TypeScript 前端
├── docker-compose.yml
├── hummingbot_vs_self_development_tasks.md   # 任务边界清单
└── README.md
```


## 技术栈

| 层 | 技术 |
|---|---|
| 后端 | FastAPI + SQLAlchemy 2.x (async) + Alembic + Pydantic v2 |
| 数据库 | PostgreSQL 16 |
| 加密 | cryptography Fernet（用于 API Secret 加密存储） |
| 前端 | React 18 + Vite + TypeScript + Ant Design 5 + axios |
| 编排 | Docker Compose |

## 开发计划

任务边界与执行顺序见 [`hummingbot_vs_self_development_tasks.md`](hummingbot_vs_self_development_tasks.md)。



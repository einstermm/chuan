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

## 快速启动（Docker Compose）

```bash
# 1. 准备后端环境变量
cp backend/.env.example backend/.env
# 生成 Fernet 加密 key 写入 backend/.env 的 ENCRYPTION_KEY
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# 2. 启动整套服务
docker compose up -d --build

# 3. 在 backend 容器内执行迁移
docker compose exec backend alembic upgrade head
```

启动后访问：
- 前端：http://localhost:5173
- 后端 OpenAPI 文档：http://localhost:8000/docs
- 健康检查：http://localhost:8000/api/v1/health

## 本地裸跑（不使用 Docker）

详见 [`backend/README.md`](backend/README.md) 与 [`frontend/README.md`](frontend/README.md)。

最低限度：

```bash
# 启动 Postgres（仅用 docker 起数据库）
docker compose up -d postgres

# 后端
cd backend
python3.11 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env  # 然后填入 ENCRYPTION_KEY
alembic upgrade head
uvicorn app.main:app --reload

# 前端（新开终端）
cd frontend
npm install
npm run dev
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



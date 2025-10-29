# InnoLiber

智能科研基金申请助理系统 - MVP 1.0

## 项目概述

InnoLiber是一个基于AI的科研基金申请智能助理系统，帮助职业早期科研研究者（ECR）提升NSFC申请书质量。

## 技术栈

### 后端
- Python 3.11
- FastAPI 0.118.2
- PostgreSQL 16 + pgvector
- SQLAlchemy 2.0 + asyncpg
- PyTorch 2.5.1

### 前端
- React 18
- TypeScript 5
- Ant Design 5
- Vite 5
- Zustand 4

## 项目结构

```
InnoLiber/
├── backend/          # Python后端服务
├── frontend/         # React前端应用
├── data/             # RDR数据资源
├── docs/             # 完整文档
├── tools/            # 工程工具
├── .env.template     # 环境变量模板
└── docker-compose.yml # Docker配置
```

## 快速开始

### 前置要求
- Python 3.11+
- Node.js 18+
- PostgreSQL 16+
- Docker（推荐）

### 环境配置

1. 复制环境变量模板
```bash
cp .env.template .env
```

2. 编辑 `.env` 文件，填写必要配置

3. 启动开发环境
```bash
docker-compose up -d
```

### 后端开发

```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload
```

### 前端开发

```bash
cd frontend
npm install
npm run dev
```

## 文档

- [开发计划](docs/technical/00_development_plan.md)
- [技术栈选型](docs/technical/01_tech_stack.md)
- [数据库设计](docs/technical/02_database_design.md)
- [API规范](docs/technical/03_api_specification.md)
- [代码规范](docs/development/coding_standards.md)
- [前端设计](docs/design/frontend_prototypes.md)

## 开发状态

当前阶段：阶段0 - 基础设施搭建

- [x] 完整技术文档
- [x] 前端设计方案
- [ ] 项目骨架搭建（进行中）
- [ ] 开发环境配置
- [ ] 第一个页面实现

## 许可证

[待定]

---

**最后更新**: 2025-10-28
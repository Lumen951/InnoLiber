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
- **Anaconda/Miniconda**: Python环境管理（推荐）
- **Node.js 18+**: 前端开发
- **Docker Desktop**: 数据库服务
- **NVIDIA GPU** (可选): CUDA 12.6+ 支持PyTorch加速

### 方案一：一键启动（Windows推荐）

直接运行启动脚本，会自动检查并配置环境：

```cmd
start-dev.bat
```

该脚本会自动完成：
- ✅ 检查Conda环境
- ✅ 创建Python虚拟环境（如果不存在）
- ✅ 检查GPU和CUDA环境
- ✅ 启动Docker数据库服务

### 方案二：手动配置

#### 1. 创建Conda环境

```bash
# 使用预配置的environment.yml创建环境
conda env create -f environment.yml

# 激活环境
conda activate innoliber
```

#### 2. 验证PyTorch CUDA支持（如有GPU）

```bash
python -c "import torch; print(f'PyTorch: {torch.__version__}'); print(f'CUDA可用: {torch.cuda.is_available()}')"
```

#### 3. 启动数据库服务

```bash
# 使用本地开发配置（仅数据库服务）
docker-compose -f docker-compose.local-dev.yml up -d
```

#### 4. 启动后端服务

```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 5. 启动前端服务（新终端）

```bash
cd frontend
npm install
npm run dev
```

### 访问地址

- 前端应用: http://localhost:5173
- 后端API: http://localhost:8000
- API文档: http://localhost:8000/docs
- pgAdmin: http://localhost:5050

### 环境配置

复制并编辑环境变量文件：

```bash
# Windows
copy .env.template .env

# Linux/macOS
cp .env.template .env
```

### 详细配置指南

完整的环境配置、故障排除和跨平台说明，请查看：
- **[Conda开发环境配置指南](docs/development/conda_setup.md)** 🔥 推荐阅读

## 文档

### 开发指南
- **[Conda开发环境配置](docs/development/conda_setup.md)** - 完整的环境配置指南（推荐）
- [代码规范](docs/development/coding_standards.md)

### 技术文档
- [开发计划](docs/technical/00_development_plan.md)
- [技术栈选型](docs/technical/01_tech_stack.md)
- [数据库设计](docs/technical/02_database_design.md)
- [API规范](docs/technical/03_api_specification.md)

### 设计文档
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
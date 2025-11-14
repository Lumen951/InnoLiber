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
- **Docker & Docker Compose**: 容器化部署（推荐）
- **Anaconda/Miniconda**: Python环境管理（本地开发）
- **Node.js 20+**: 前端开发
- **NVIDIA GPU** (可选): CUDA 12.6+ 支持PyTorch加速

### 🐳 方案一：Docker 一键部署（推荐）

使用 Docker Compose 一键启动所有服务（PostgreSQL, Redis, Backend, Frontend）：

```bash
# 1. 复制环境变量模板并配置
cp .env.example .env
# 编辑 .env 文件，至少配置 DEEPSEEK_API_KEY

# 2. 启动所有服务（开发环境）
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 4. 停止所有服务
docker-compose down
```

服务访问地址：
- **前端**: http://localhost:3000
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **pgAdmin**: http://localhost:5050

#### 生产环境部署

```bash
# 使用生产配置启动
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 查看服务状态
docker-compose ps

# 查看资源使用
docker stats
```

更多 Docker 部署细节，请参考 [Docker 部署指南](docs/technical/05_docker_deployment_guide.md)

---

### 方案二：一键启动（Windows本地开发）

直接运行启动脚本，会自动检查并配置环境：

```cmd
start-dev.bat
```

该脚本会自动完成：
- ✅ 检查Conda环境
- ✅ 创建Python虚拟环境（如果不存在）
- ✅ 检查GPU和CUDA环境
- ✅ 启动Docker数据库服务

### 方案三：手动配置（本地开发）

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
- [前端设计原型](docs/design/frontend_prototypes.md) - 三种设计方案对比
- [完整页面设计](docs/design/frontend_pages_complete.md) - 7个核心页面设计（含移动端）
- [响应式设计指南](docs/design/responsive_design_guide.md) - 移动端适配指南
- [组件开发规范](docs/design/component_development_standards.md) - 前端开发标准

## 开发状态

当前阶段：阶段1 - 前端核心页面开发

**阶段0完成** ✅:
- [x] 完整技术文档
- [x] 前端设计方案（含移动端适配）
- [x] 项目骨架搭建
- [x] 开发环境配置
- [x] Dashboard首页实现

**阶段1进行中** 🔄:
- [ ] 登录/注册页实现
- [ ] 新建标书页实现
- [ ] 标书编辑页实现（富文本编辑器）
- [ ] 标书详情页实现
- [ ] 数据分析页实现（图表集成）
- [ ] 文献库页实现
- [ ] 设置页实现
- [ ] 移动端响应式适配完成

## 许可证

[待定]

---

**最后更新**: 2025-10-30
# Dockerfile Implementation Plan

## 项目概述
为 InnoLiber 项目创建生产级 Dockerfile，支持 backend (FastAPI + PyTorch) 和 frontend (React + Vite) 的容器化部署。

## 当前环境分析

### 依赖配置文件对比

项目中存在三个依赖配置文件，需要核对并统一版本：

#### 1. environment.yml (Conda 环境配置)
**系统包：**
- Python 3.11
- PyTorch 2.5.1 (CUDA 12.6)
- torchvision 0.20.1
- torchaudio 2.5.1
- numpy 1.24.3
- scikit-learn 1.3.2
- pandas 2.1.3

**pip 依赖：**
- fastapi 0.104.1
- uvicorn[standard] 0.24.0
- sqlalchemy 2.0.23
- asyncpg 0.29.0
- alembic 1.12.1
- pgvector 0.2.4
- redis 5.0.1
- pydantic 2.5.0
- pydantic-settings 2.1.0
- openai 1.3.7
- httpx 0.25.1

#### 2. requirements.txt (pip freeze 导出)
**核心依赖：**
- Python 3.11
- **torch 2.6.0** (CUDA 12.6) ⚠️ 与 environment.yml 不一致
- torchvision 0.21.0
- torchaudio 2.6.0
- numpy 1.24.3
- scikit-learn 1.3.2
- pandas 2.1.3
- fastapi 0.104.1
- uvicorn[standard] 0.24.0
- sqlalchemy 2.0.23
- asyncpg 0.29.0
- alembic 1.12.1
- redis 5.0.1
- openai 1.3.7

#### 3. backend/pyproject.toml (Poetry 管理)
**核心依赖：**
- Python ^3.11
- fastapi ^0.118.2 ⚠️ 版本高于 environment.yml (0.104.1)
- uvicorn[standard] ^0.31.0 ⚠️ 版本高于 environment.yml (0.24.0)
- sqlalchemy[asyncio] ^2.0.35 ⚠️ 版本高于 environment.yml (2.0.23)
- asyncpg ^0.29.0 ✅
- pydantic[email] ^2.9.2 ⚠️ 版本高于 environment.yml (2.5.0)
- pydantic-settings ^2.6.0 ⚠️ 版本高于 environment.yml (2.1.0)
- python-jose[cryptography] ^3.3.0 ✅
- passlib[bcrypt] ^1.7.4 ✅
- python-multipart ^0.0.12 ⚠️ environment.yml 为 0.0.6
- alembic ^1.13.3 ⚠️ 版本高于 environment.yml (1.12.1)
- redis ^5.2.0 ⚠️ 版本高于 environment.yml (5.0.1)
- celery ^5.4.0 ⚠️ environment.yml 中缺失
- **torch ^2.5.1** (重点：大体积依赖)
- openai ^1.55.0 ⚠️ 版本高于 environment.yml (1.3.7)
- httpx ^0.27.2 ⚠️ 版本高于 environment.yml (0.25.1)

**开发依赖：**
- pytest ^8.3.3
- pytest-asyncio ^0.24.0
- pytest-cov ^6.0.0
- black ^24.10.0
- isort ^5.13.2
- flake8 ^7.1.1
- mypy ^1.13.0

### 版本冲突分析

| 包名 | environment.yml | requirements.txt | pyproject.toml | 状态 |
|------|----------------|------------------|----------------|------|
| torch | 2.5.1 | **2.6.0** | ^2.5.1 | ⚠️ 不一致 |
| torchvision | 0.20.1 | **0.21.0** | - | ⚠️ 不一致 |
| torchaudio | 2.5.1 | **2.6.0** | - | ⚠️ 不一致 |
| fastapi | 0.104.1 | 0.104.1 | **^0.118.2** | ⚠️ 不一致 |
| uvicorn | 0.24.0 | 0.24.0 | **^0.31.0** | ⚠️ 不一致 |
| sqlalchemy | 2.0.23 | 2.0.23 | **^2.0.35** | ⚠️ 不一致 |
| pydantic | 2.5.0 | 2.5.0 | **^2.9.2** | ⚠️ 不一致 |
| openai | 1.3.7 | 1.3.7 | **^1.55.0** | ⚠️ 不一致 |
| celery | - | - | **^5.4.0** | ⚠️ 缺失 |

### 依赖统一决策

**原则**：以 **pyproject.toml** 为权威源，理由：
1. Poetry 是 Python 社区推荐的现代依赖管理工具
2. pyproject.toml 定义了语义化版本约束
3. 支持开发/生产依赖分离
4. 便于 Docker 环境复现

**行动计划**：
1. ✅ Docker 使用 pyproject.toml + Poetry 安装依赖
2. 🔄 更新 environment.yml 和 requirements.txt 以匹配 pyproject.toml
3. 🔄 测试更新后的依赖是否兼容现有代码

### Frontend 依赖分析 (package.json)

**生产依赖：**
- React 19.1.1
- React DOM 19.1.1
- React Router DOM 7.9.4
- Ant Design 5.27.6
- @ant-design/icons 6.1.0
- Zustand 5.0.8
- axios 1.13.1
- react-hook-form 7.66.0
- @hookform/resolvers 5.2.2
- zod 4.1.12
- lodash 4.17.21

**开发依赖：**
- TypeScript 5.9.3
- Vite 7.1.7
- ESLint 9.36.0
- @vitejs/plugin-react 5.0.4

### Docker Compose 现状

**当前状态**：
- ✅ `docker-compose.yml` 已清空，准备重写
- ✅ `docker-compose.local-dev.yml` 已清空，准备重写

**原有基础设施服务**（已删除，将在新配置中恢复）：
- postgres (pgvector/pgvector:pg16)
- redis (redis:7-alpine)
- pgadmin (dpage/pgadmin4)

**新配置将包含**：
- Backend API 服务
- Frontend 服务
- Celery Worker 服务
- PostgreSQL + pgvector
- Redis
- pgAdmin (可选)

## 实施计划

### Phase 0: 依赖配置核实与更新（新增）

#### Task 0.1: 更新 environment.yml 以匹配 pyproject.toml
- **目标**: 统一 conda 环境配置与 Poetry 配置
- **文件**: `environment.yml`
- **更新内容**:
  - 升级 fastapi: 0.104.1 → 0.118.2
  - 升级 uvicorn: 0.24.0 → 0.31.0
  - 升级 sqlalchemy: 2.0.23 → 2.0.35
  - 升级 pydantic: 2.5.0 → 2.9.2
  - 升级 openai: 1.3.7 → 1.55.0
  - 添加 celery 5.4.0
- **验证**: conda env update 后测试应用启动

#### Task 0.2: 更新 requirements.txt 以匹配 pyproject.toml
- **目标**: 同步 pip requirements 与 Poetry 配置
- **文件**: `requirements.txt`
- **方法**: 从 poetry.lock 导出
  ```bash
  cd backend
  poetry export -f requirements.txt --output ../requirements.txt --without-hashes
  ```
- **验证**: pip install -r requirements.txt 测试

#### Task 0.3: 解决 PyTorch 版本冲突
- **问题**: requirements.txt (2.6.0) vs pyproject.toml (^2.5.1)
- **决策**:
  - pyproject.toml 保持 ^2.5.1 (允许 2.5.x - 2.x)
  - Docker 将安装 Poetry 解析的版本
  - 测试 2.5.1 vs 2.6.0 的兼容性
- **验证**: 运行现有 PyTorch 相关代码测试

#### Task 0.4: 更新 poetry.lock 文件
- **目标**: 确保 lock 文件最新
- **命令**:
  ```bash
  cd backend
  poetry lock --no-update  # 只更新 lock，不升级依赖
  poetry install  # 测试安装
  ```

### Phase 1: Backend Dockerfile 设计

#### Task 1.1: 查询 PyTorch 官方 Docker 配置建议
- **目标**: 了解 PyTorch 2.5.1 在 Docker 中的最佳实践
- **工具**: Context7 查询 pytorch 文档
- **重点**:
  - CPU vs GPU 镜像选择
  - 依赖安装顺序
  - 缓存优化策略
  - 镜像体积优化

#### Task 1.2: 查询 FastAPI 官方 Docker 配置建议
- **目标**: FastAPI 生产环境部署最佳实践
- **工具**: Context7 查询 fastapi 文档
- **重点**:
  - Uvicorn 配置
  - 多阶段构建
  - 健康检查
  - 优雅关闭

#### Task 1.3: 查询 SQLAlchemy 异步数据库配置
- **目标**: 异步数据库连接池配置
- **工具**: Context7 查询 sqlalchemy 文档
- **重点**:
  - asyncpg 驱动配置
  - 连接池设置
  - 数据库迁移 (Alembic)

#### Task 1.4: 查询 Celery + Redis 容器化配置
- **目标**: 后台任务队列配置
- **工具**: Context7 查询 celery, redis 文档
- **重点**:
  - Celery worker 启动
  - Redis 连接配置
  - 多服务编排

#### Task 1.5: 编写 Backend Dockerfile
- **文件**: `backend/Dockerfile`
- **策略**: 多阶段构建
  - Stage 1: 构建阶段（安装依赖）
  - Stage 2: 运行阶段（最小化镜像）
- **优化点**:
  - 利用 Docker layer 缓存
  - 分离依赖安装和代码复制
  - 非 root 用户运行
  - 健康检查配置

#### Task 1.6: 编写 Backend .dockerignore
- **文件**: `backend/.dockerignore`
- **排除内容**:
  - `__pycache__`
  - `.pytest_cache`
  - `.mypy_cache`
  - `.venv`
  - `*.pyc`
  - `.env`
  - 测试文件

### Phase 2: Frontend Dockerfile 设计

#### Task 2.1: 查询 Vite 官方构建优化
- **目标**: Vite 生产构建最佳实践
- **工具**: Context7 查询 vite 文档
- **重点**:
  - 构建优化参数
  - 环境变量注入
  - 资源压缩

#### Task 2.2: 查询 React 生产部署配置
- **目标**: React 19 生产环境优化
- **工具**: Context7 查询 react 文档
- **重点**:
  - 生产构建模式
  - 性能优化
  - 代码分割

#### Task 2.3: 查询 Nginx 静态文件服务配置
- **目标**: Nginx 作为前端静态文件服务器
- **工具**: Context7 查询 nginx 文档
- **重点**:
  - SPA 路由配置 (try_files)
  - Gzip 压缩
  - 缓存策略
  - 反向代理配置（可选）

#### Task 2.4: 编写 Frontend Dockerfile
- **文件**: `frontend/Dockerfile`
- **策略**: 多阶段构建
  - Stage 1: 构建阶段（npm install + build）
  - Stage 2: Nginx 服务阶段
- **优化点**:
  - npm ci 代替 npm install
  - 利用 npm 缓存
  - 最小化 Nginx 镜像

#### Task 2.5: 编写 Nginx 配置文件
- **文件**: `frontend/nginx.conf`
- **配置内容**:
  - SPA 路由支持
  - API 代理（如果需要）
  - 静态资源缓存
  - Gzip 压缩

#### Task 2.6: 编写 Frontend .dockerignore
- **文件**: `frontend/.dockerignore`
- **排除内容**:
  - `node_modules`
  - `dist`
  - `.vite`
  - `.env.local`
  - `*.log`

### Phase 3: Docker Compose 更新

#### Task 3.1: 集成 Backend 服务到 docker-compose.yml
- **服务名**: `backend`
- **配置内容**:
  - 构建上下文
  - 环境变量
  - 依赖关系 (depends_on: postgres, redis)
  - 端口映射
  - 健康检查
  - 卷挂载（开发模式）

#### Task 3.2: 集成 Frontend 服务到 docker-compose.yml
- **服务名**: `frontend`
- **配置内容**:
  - 构建上下文
  - 环境变量 (API_URL)
  - 端口映射
  - 依赖关系 (depends_on: backend)

#### Task 3.3: 集成 Celery Worker 服务
- **服务名**: `celery-worker`
- **配置内容**:
  - 使用 backend 镜像
  - 覆盖启动命令
  - 依赖 postgres, redis
  - 环境变量共享

#### Task 3.4: 添加开发与生产环境配置
- **文件**:
  - `docker-compose.yml` (开发环境)
  - `docker-compose.prod.yml` (生产环境)
- **差异**:
  - 开发：代码热重载、挂载源码
  - 生产：优化构建、无挂载

### Phase 4: 环境配置和文档

#### Task 4.1: 创建环境变量模板
- **文件**:
  - `backend/.env.docker`
  - `frontend/.env.docker`
- **内容**:
  - 数据库连接字符串
  - Redis 连接配置
  - DeepSeek API Key
  - JWT Secret
  - CORS 配置

#### Task 4.2: 编写 Docker 部署文档
- **文件**: `docs/technical/05_docker_deployment_guide.md`
- **内容**:
  - 构建命令
  - 启动命令
  - 环境变量配置
  - 常见问题排查
  - 日志查看方法

#### Task 4.3: 创建启动脚本
- **文件**:
  - `tools/scripts/docker-dev.sh` (开发环境)
  - `tools/scripts/docker-prod.sh` (生产环境)
- **功能**:
  - 一键启动
  - 环境检查
  - 数据库初始化
  - 日志输出

#### Task 4.4: 更新主 README.md
- **更新内容**:
  - Docker 快速启动指南
  - 环境要求
  - 端口说明
  - 链接到详细文档

## 执行 Todo List

### Phase 0: 依赖配置核实与更新 (4 tasks) - 新增
0. [ ] 更新 `environment.yml` 以匹配 pyproject.toml
1. [ ] 更新 `requirements.txt` 从 poetry.lock 导出
2. [ ] 解决 PyTorch 版本冲突，测试兼容性
3. [ ] 更新 poetry.lock 并验证安装

### Phase 1: Backend Dockerfile (8 tasks)
4. [ ] Context7 查询 PyTorch Docker 最佳实践
5. [ ] Context7 查询 FastAPI Docker 最佳实践
6. [ ] Context7 查询 SQLAlchemy asyncpg 配置
7. [ ] Context7 查询 Celery + Redis 容器化
8. [ ] 编写 `backend/Dockerfile` (多阶段构建)
9. [ ] 编写 `backend/.dockerignore`
10. [ ] 创建 `backend/.env.docker` 模板
11. [ ] 测试 backend 镜像构建

### Phase 2: Frontend Dockerfile (7 tasks)
12. [ ] Context7 查询 Vite 构建优化
13. [ ] Context7 查询 React 生产部署
14. [ ] Context7 查询 Nginx 静态服务配置
15. [ ] 编写 `frontend/Dockerfile` (多阶段构建)
16. [ ] 编写 `frontend/nginx.conf`
17. [ ] 编写 `frontend/.dockerignore`
18. [ ] 测试 frontend 镜像构建

### Phase 3: Docker Compose 集成 (6 tasks)
19. [ ] 重写 `docker-compose.yml` 完整配置（开发环境）
20. [ ] 添加 PostgreSQL + pgvector 服务
21. [ ] 添加 Redis 服务
22. [ ] 添加 Backend + Celery Worker 服务
23. [ ] 添加 Frontend 服务
24. [ ] 创建 `docker-compose.prod.yml` 生产配置
25. [ ] 测试完整 docker-compose 启动

### Phase 4: 文档和脚本 (5 tasks)
26. [ ] 编写 `docs/technical/05_docker_deployment_guide.md`
27. [ ] 创建 `tools/scripts/docker-dev.sh`
28. [ ] 创建 `tools/scripts/docker-prod.sh`
29. [ ] 更新主 `README.md` Docker 部分
30. [ ] 最终测试和优化验证

**总计：31 个任务**（新增 Phase 0 的 4 个任务）

## 关键技术决策

### 1. 依赖管理统一（新增）
- **决策**: 以 pyproject.toml 为唯一权威源
- **理由**:
  - Poetry 提供确定性构建（lock 文件）
  - 语义化版本管理
  - 开发/生产依赖分离
  - Docker 构建可复现
- **影响**:
  - environment.yml 和 requirements.txt 作为辅助配置
  - Docker 镜像使用 Poetry 安装依赖
  - CI/CD 流程统一使用 Poetry

### 2. PyTorch 版本问题
- **问题**:
  - environment.yml: 2.5.1 (CUDA 12.6)
  - requirements.txt: 2.6.0 (CUDA 12.6)
  - pyproject.toml: ^2.5.1（语义化版本，允许 2.5.x - 2.x）
- **决策**:
  - Docker 使用 Poetry 解析的版本（可能是 2.5.1 或更新）
  - 更新 environment.yml 和 requirements.txt 以匹配
- **验证**: 需要在 Docker 环境中测试 PyTorch 功能
- **风险缓解**: Phase 0 先测试依赖兼容性

### 3. 基础镜像选择
- **Backend**:
  - 方案 A: `python:3.11-slim-bookworm` + pip install torch (CPU only)
  - 方案 B: `pytorch/pytorch:2.5.1-cuda12.4-cudnn9-runtime` (GPU support)
  - **推荐**: 方案 A（开发环境），方案 B（生产环境可选）
- **Frontend**:
  - 构建阶段: `node:20-alpine`
  - 运行阶段: `nginx:1.25-alpine`

### 4. 多阶段构建策略
- **目标**: 减少最终镜像体积
- **Backend 阶段**:
  1. Builder: 安装 Poetry + 依赖
  2. Runtime: 复制虚拟环境 + 代码
- **Frontend 阶段**:
  1. Builder: npm ci + build
  2. Runtime: Nginx + 静态文件

### 5. Docker Compose 架构（更新）
- **开发环境** (docker-compose.yml):
  - 代码热重载（挂载源码）
  - 实时日志输出
  - pgAdmin 管理工具
  - 环境变量从 .env 文件加载
- **生产环境** (docker-compose.prod.yml):
  - 优化构建（无源码挂载）
  - 健康检查和重启策略
  - 资源限制
  - 安全配置

### 6. 网络和端口规划
- Frontend: 3000 (dev), 80 (prod)
- Backend: 8000
- PostgreSQL: 5432
- Redis: 6379
- pgAdmin: 5050
- Celery Flower (可选): 5555

### 5. 数据持久化
- PostgreSQL: `postgres_data` volume
- Redis: `redis_data` volume
- pgAdmin: `pgadmin_data` volume
- 上传文件: `backend_uploads` volume (待添加)

## 预期成果

### 文件清单（更新）
```
InnoLiber/
├── backend/
│   ├── Dockerfile (新增)
│   ├── .dockerignore (新增)
│   └── .env.docker (新增)
├── frontend/
│   ├── Dockerfile (新增)
│   ├── .dockerignore (新增)
│   ├── .env.docker (新增)
│   └── nginx.conf (新增)
├── environment.yml (更新)
├── requirements.txt (更新)
├── docker-compose.yml (重写)
├── docker-compose.local-dev.yml (重写，可选)
├── docker-compose.prod.yml (新增)
├── .env.example (新增，环境变量模板)
├── docs/technical/
│   ├── 04_dockerfile_implementation_plan.md (本文档)
│   └── 05_docker_deployment_guide.md (待创建)
└── tools/scripts/
    ├── docker-dev.sh (待创建)
    └── docker-prod.sh (待创建)
```

### 成功标准
1. 所有服务可通过 `docker-compose up` 一键启动
2. Backend 健康检查通过 (http://localhost:8000/health)
3. Frontend 可访问 (http://localhost:3000)
4. 数据库连接正常（可通过 pgAdmin 验证）
5. Celery worker 正常运行
6. 镜像体积合理（Backend < 2GB, Frontend < 50MB）
7. 构建时间可接受（Backend < 10min, Frontend < 5min）

## 风险和注意事项

### 高风险项
1. **依赖版本不一致**: environment.yml, requirements.txt, pyproject.toml 三者不同步
   - 缓解措施: Phase 0 优先统一依赖配置，充分测试
   - 验证方法: 在 Docker 环境和 conda 环境分别测试
2. **PyTorch 体积问题**: CPU 版本约 800MB，可能导致镜像过大
   - 缓解措施: 使用 slim 基础镜像，清理 pip 缓存
   - 目标: Backend 镜像 < 2GB
3. **Windows 路径兼容性**: 当前在 Windows 开发
   - 缓解措施: 使用 POSIX 路径，测试跨平台兼容性
   - 验证: 在 Linux 容器中测试所有路径
4. **Docker Compose 配置丢失**: 原有配置已清空
   - 缓解措施: 从头重写完整配置，参考原有架构
   - 备份: 确保所有服务配置完整

### 中风险项
1. **构建时间长**: PyTorch 安装耗时
   - 缓解措施: Docker layer 缓存，CI/CD 预构建镜像
2. **内存需求**: PyTorch 运行时内存需求高
   - 缓解措施: 配置 Docker 内存限制，监控资源使用
3. **Celery 配置**: 新增服务，需要正确配置
   - 缓解措施: 参考 Context7 文档，测试任务队列

## 时间估算

- Phase 0: 依赖配置核实 - 2-3 小时（新增）
- Phase 1: Backend Dockerfile - 4-6 小时
- Phase 2: Frontend Dockerfile - 2-3 小时
- Phase 3: Docker Compose 重写 - 3-4 小时（从头重写）
- Phase 4: 文档和脚本 - 2-3 小时
- 测试和优化 - 3-5 小时（增加测试时间）

**总计**: 16-24 小时（原 12-19 小时 + Phase 0 及重写时间）

## 下一步行动

等待用户确认计划后，按照 Phase 顺序执行：

### Phase 0（优先）：
1. 核对并更新 environment.yml 以匹配 pyproject.toml
2. 从 poetry.lock 导出新的 requirements.txt
3. 测试依赖兼容性（conda 环境和 Docker 环境）
4. 解决 PyTorch 版本冲突

### Phase 1-4：
5. 使用 Context7 查询相关库的 Docker 最佳实践
6. 逐步创建 Dockerfile 和配置文件
7. 从头重写 docker-compose.yml（完整配置）
8. 创建 docker-compose.prod.yml
9. 编写文档和脚本
10. 完整测试验证

---
**文档版本**: v2.0
**更新日期**: 2025-11-14
**作者**: Claude Code
**状态**: 等待用户确认（已更新依赖分析和 Phase 0）

## 更新日志

### v2.0 (2025-11-14)
- ✅ 新增 Phase 0: 依赖配置核实与更新
- ✅ 添加三个依赖文件的详细对比分析
- ✅ 识别 9 个版本不一致的包
- ✅ 确定依赖管理统一策略（以 pyproject.toml 为准）
- ✅ 更新 Docker Compose 现状（已清空，需重写）
- ✅ 调整任务总数：25 → 31 个
- ✅ 更新时间估算：12-19 小时 → 16-24 小时
- ✅ 增加高风险项：依赖版本不一致、Docker Compose 配置丢失

### v1.0 (2025-11-13)
- 初始版本创建

# Docker Compose 多服务编排详解

> **适合人群**：了解 Docker 基础的开发者
>
> **学习时长**：约 50-60 分钟
>
> **先修知识**：Docker 基础（镜像、容器、网络、数据卷）、YAML 语法基础

---

## 📌 什么是 Docker Compose？

**一句话解释**：Docker Compose 是一个用于定义和运行多容器 Docker 应用的工具，通过一个 YAML 文件配置所有服务，一键启动整个应用栈。

### 为什么需要 Docker Compose？

**问题场景**：你的应用需要运行多个容器（Web 服务器、数据库、缓存、后台任务等）：

**传统方式（手动管理）**：
```bash
# 1. 创建网络
docker network create my-network

# 2. 启动 PostgreSQL
docker run -d \
  --name postgres \
  --network my-network \
  -e POSTGRES_PASSWORD=password \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:16

# 3. 启动 Redis
docker run -d \
  --name redis \
  --network my-network \
  -v redis_data:/data \
  redis:7-alpine

# 4. 启动后端
docker run -d \
  --name backend \
  --network my-network \
  -e DATABASE_URL=postgresql://postgres:5432/db \
  -e REDIS_HOST=redis \
  -p 8000:8000 \
  my-backend

# 5. 启动前端
docker run -d \
  --name frontend \
  --network my-network \
  -p 3000:80 \
  my-frontend

# 问题：
# ❌ 命令繁琐，容易出错
# ❌ 启动顺序难以控制（后端依赖数据库）
# ❌ 环境变量管理混乱
# ❌ 停止/重启需要逐个操作
# ❌ 团队成员难以复现环境
```

**Docker Compose 方式**：
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "pg_isready"]
      interval: 10s

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - app-network

  backend:
    build: ./backend
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    environment:
      DATABASE_URL: postgresql://postgres:5432/db
      REDIS_HOST: redis
    ports:
      - "8000:8000"
    networks:
      - app-network

  frontend:
    build: ./frontend
    depends_on:
      - backend
    ports:
      - "3000:80"
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

**启动命令**：
```bash
# 一键启动所有服务
docker-compose up -d

# 优势：
# ✅ 声明式配置，易于理解和维护
# ✅ 自动管理启动顺序（depends_on + healthcheck）
# ✅ 统一的环境变量管理
# ✅ 一键启动/停止所有服务
# ✅ 团队成员环境完全一致
```

### 在 InnoLiber 项目中的应用

在我们的项目中，Docker Compose 负责：
- ✅ **6 服务编排**：PostgreSQL、Redis、Backend、Celery、Frontend、pgAdmin
- ✅ **启动顺序控制**：后端等待数据库健康后才启动
- ✅ **网络隔离**：所有服务在同一网络，通过服务名通信
- ✅ **数据持久化**：数据库和缓存数据在容器重启后保留
- ✅ **开发环境统一**：所有团队成员运行相同的服务版本

**项目文件位置**：
- 开发环境：`docker-compose.yml`
- 生产环境：`docker-compose.prod.yml`

---

## 🔑 核心概念（用日常语言理解）

### 1. docker-compose.yml = 应用的"配置清单"

**类比**：`docker-compose.yml` 就像餐厅的菜单，列出了所有"菜品"（服务）和"做法"（配置）。

**项目实例**（来自 `docker-compose.yml:1-10`）：

```yaml
# ============================================================================
# Docker Compose 配置文件结构
# ============================================================================

# 📋 版本声明（文件格式版本）
version: '3.8'
# 说明：
# - 3.8 是 Docker Compose 文件格式版本
# - 支持最新的 Docker Engine 特性
# - 向后兼容 3.x 系列

# ============================================================================
# 核心三大部分
# ============================================================================
services:   # 🔑 服务定义（容器）
  # 定义所有需要运行的容器

volumes:    # 🔑 数据卷定义
  # 定义数据持久化存储

networks:   # 🔑 网络定义
  # 定义容器间通信网络
```

---

### 2. Services（服务）= 容器的"配置模板"

**类比**：每个 Service 就像一道菜的完整配方，包含食材、做法、摆盘等所有细节。

#### **服务定义的完整结构**

**项目实例**（来自 `docker-compose.yml:11-53`）：

```yaml
# ============================================================================
# Service 1: PostgreSQL 数据库
# ============================================================================
services:
  postgres:
    # 🔑 镜像配置
    image: pgvector/pgvector:pg16        # 使用官方镜像
    # 或
    # build:                              # 从 Dockerfile 构建
    #   context: ./backend
    #   dockerfile: Dockerfile

    # 🔑 容器配置
    container_name: innoliber_postgres   # 容器名称（可选）
    hostname: postgres                    # 容器主机名
    restart: unless-stopped               # 重启策略

    # 🔑 端口映射
    ports:
      - "${POSTGRES_PORT:-5432}:5432"    # 宿主机:容器（支持环境变量）

    # 🔑 环境变量
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-innoliber}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-password}
      POSTGRES_DB: ${POSTGRES_DB:-innoliber}
      # 性能调优参数
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --lc-collate=C --lc-ctype=C"

    # 🔑 数据卷挂载
    volumes:
      - postgres_data:/var/lib/postgresql/data  # 命名卷
      # 或
      # - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro  # 绑定挂载

    # 🔑 网络配置
    networks:
      - innoliber_network

    # 🔑 健康检查
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-innoliber}"]
      interval: 10s                       # 检查间隔
      timeout: 5s                         # 超时时间
      retries: 5                          # 失败重试次数
      start_period: 10s                   # 启动等待时间
```

**关键属性解释**：

| 属性 | 说明 | 使用场景 | 项目示例 |
|------|------|---------|---------|
| `image` | 使用预构建镜像 | ✅ 第三方服务（数据库、缓存） | `postgres:16` |
| `build` | 从 Dockerfile 构建 | ✅ 自定义应用（后端、前端） | `context: ./backend` |
| `container_name` | 容器名称 | 🟡 方便识别和管理 | `innoliber_postgres` |
| `restart` | 重启策略 | ✅ 生产环境自动恢复 | `unless-stopped` |
| `ports` | 端口映射 | ✅ 外部访问服务 | `"8000:8000"` |
| `environment` | 环境变量 | ✅ 配置应用行为 | `DATABASE_URL=...` |
| `volumes` | 数据卷 | ✅ 数据持久化 | `postgres_data:/var/lib/postgresql/data` |
| `networks` | 网络 | ✅ 服务间通信 | `innoliber_network` |
| `depends_on` | 依赖关系 | ✅ 控制启动顺序 | `condition: service_healthy` |
| `healthcheck` | 健康检查 | ✅ 确保服务就绪 | `pg_isready` |

---

### 3. depends_on（依赖关系）= 启动顺序控制

**类比**：`depends_on` 就像做菜的顺序，必须先洗菜、再切菜、最后炒菜。

**项目实例**（来自 `docker-compose.yml:54-81`）：

```yaml
# ============================================================================
# Service 3: Backend（依赖 PostgreSQL 和 Redis）
# ============================================================================
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: innoliber_backend
    restart: unless-stopped
    ports:
      - "${BACKEND_PORT:-8000}:8000"

    # 🔑 依赖关系配置
    depends_on:
      postgres:
        condition: service_healthy       # ✅ 等待 postgres 健康检查通过
      redis:
        condition: service_healthy       # ✅ 等待 redis 健康检查通过
      # 或简单模式：
      # depends_on:
      #   - postgres                     # ❌ 只等待容器启动，不等待服务就绪
      #   - redis

    environment:
      # 🔑 使用服务名作为主机名连接数据库
      DATABASE_URL: "postgresql+asyncpg://${POSTGRES_USER:-innoliber}:${POSTGRES_PASSWORD:-password}@postgres:5432/${POSTGRES_DB:-innoliber}"
      #                                                                                            ↑ 服务名
      REDIS_HOST: redis                  # 🔑 服务名即主机名
      REDIS_PORT: 6379
      JWT_SECRET_KEY: ${JWT_SECRET_KEY:-your-secret-key-change-in-production}
      ENVIRONMENT: ${ENVIRONMENT:-development}

    volumes:
      # 🔑 开发模式：绑定挂载代码（热重载）
      - ./backend/app:/app/app:ro        # ro = read-only

    networks:
      - innoliber_network

    # 🔑 后端健康检查
    healthcheck:
      test: ["CMD", "python", "-c", "import requests; requests.get('http://localhost:8000/health', timeout=2)"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s                  # 🔑 后端启动需要更长时间
```

**depends_on 的三种模式**：

```yaml
# ❌ 模式1：简单依赖（不推荐）
depends_on:
  - postgres
  - redis
# 问题：只等待容器启动，不等待服务就绪
# 结果：后端可能在数据库初始化完成前就尝试连接，导致失败

# ✅ 模式2：健康检查依赖（推荐）
depends_on:
  postgres:
    condition: service_healthy          # 等待健康检查通过
  redis:
    condition: service_healthy
# 优势：确保依赖服务完全就绪

# 🟡 模式3：启动完成依赖
depends_on:
  postgres:
    condition: service_started          # 只等待容器启动
# 使用场景：依赖服务没有健康检查
```

**启动顺序示意图**：
```
┌─────────────────────────────────────────────────────┐
│              Docker Compose 启动流程                 │
├─────────────────────────────────────────────────────┤
│                                                       │
│  1️⃣ 创建网络 innoliber_network                       │
│     └─> docker network create innoliber_network     │
│                                                       │
│  2️⃣ 创建数据卷                                       │
│     ├─> postgres_data                                │
│     ├─> redis_data                                   │
│     └─> pgadmin_data                                 │
│                                                       │
│  3️⃣ 启动无依赖的服务（并行）                          │
│     ┌────────────────┐        ┌────────────────┐    │
│     │  postgres      │        │  redis         │    │
│     │  (启动中...)   │        │  (启动中...)   │    │
│     └────────────────┘        └────────────────┘    │
│            ↓ healthcheck           ↓ healthcheck    │
│     ┌────────────────┐        ┌────────────────┐    │
│     │  postgres      │        │  redis         │    │
│     │  ✅ healthy    │        │  ✅ healthy    │    │
│     └────────────────┘        └────────────────┘    │
│            │                          │              │
│            └──────────────┬───────────┘              │
│                           ↓                          │
│  4️⃣ 启动依赖服务（串行）                              │
│     ┌────────────────────────────────────────┐      │
│     │  backend (depends_on: postgres, redis) │      │
│     │  (等待依赖服务健康...)                  │      │
│     └────────────────────────────────────────┘      │
│                           ↓                          │
│     ┌────────────────────────────────────────┐      │
│     │  backend                                │      │
│     │  ✅ healthy (监听 8000 端口)           │      │
│     └────────────────────────────────────────┘      │
│                           │                          │
│                           ↓                          │
│  5️⃣ 启动前端（depends_on: backend）                  │
│     ┌────────────────────────────────────────┐      │
│     │  frontend (Nginx + React 静态文件)     │      │
│     │  ✅ healthy (监听 80 端口)             │      │
│     └────────────────────────────────────────┘      │
│                                                       │
│  6️⃣ 启动辅助服务                                     │
│     ├─> celery-worker (异步任务)                    │
│     └─> pgadmin (数据库管理工具)                    │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

### 4. Environment Variables（环境变量）= 动态配置

**类比**：环境变量就像遥控器的按钮，可以在不修改代码的情况下调整行为。

#### **环境变量的三种来源**

**项目实例**：

```yaml
# ============================================================================
# 1️⃣ 直接在 docker-compose.yml 中定义
# ============================================================================
services:
  backend:
    environment:
      # 直接设置
      PROJECT_NAME: InnoLiber
      VERSION: 0.1.0
      JWT_ALGORITHM: HS256

# ============================================================================
# 2️⃣ 从宿主机环境变量读取（带默认值）
# ============================================================================
services:
  postgres:
    environment:
      # ${变量名:-默认值}
      POSTGRES_USER: ${POSTGRES_USER:-innoliber}       # 未设置时使用 innoliber
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-password} # 未设置时使用 password
      POSTGRES_DB: ${POSTGRES_DB:-innoliber}

# ============================================================================
# 3️⃣ 从 .env 文件读取
# ============================================================================
# .env 文件内容：
# POSTGRES_USER=innoliber
# POSTGRES_PASSWORD=secure_password_123
# JWT_SECRET_KEY=super_secret_key

services:
  backend:
    env_file:
      - .env                             # 🔑 加载 .env 文件
      # 或多个文件：
      # - .env
      # - .env.local                      # 本地覆盖配置
```

**环境变量优先级**（从高到低）：
```
1. docker-compose.yml 中的 environment 字段
   ↓
2. docker-compose.yml 中的 env_file 字段
   ↓
3. 宿主机的环境变量
   ↓
4. Dockerfile 中的 ENV 指令
```

**实际使用示例**：

```bash
# .env 文件（项目根目录）
POSTGRES_USER=innoliber
POSTGRES_PASSWORD=secure_password_123
POSTGRES_DB=innoliber
POSTGRES_PORT=5432
BACKEND_PORT=8000
FRONTEND_PORT=3000
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
ENVIRONMENT=development
```

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    ports:
      - "${POSTGRES_PORT}:5432"          # .env 中的 POSTGRES_PORT
    environment:
      POSTGRES_USER: ${POSTGRES_USER}    # .env 中的 POSTGRES_USER
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}

  backend:
    build: ./backend
    ports:
      - "${BACKEND_PORT}:8000"           # .env 中的 BACKEND_PORT
    environment:
      DATABASE_URL: "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}  # .env 中的 JWT_SECRET_KEY
      ENVIRONMENT: ${ENVIRONMENT}
```

**环境变量插值语法**：

```yaml
# 基础语法
${VARIABLE}                              # 直接替换

# 带默认值
${VARIABLE:-default}                     # 如果未设置或为空，使用 default
${VARIABLE-default}                      # 如果未设置，使用 default

# 必需变量（未设置则报错）
${VARIABLE:?error message}               # 未设置或为空时报错
${VARIABLE?error message}                # 未设置时报错

# 条件替换
${VARIABLE:+replacement}                 # 如果设置且非空，使用 replacement
${VARIABLE+replacement}                  # 如果设置，使用 replacement

# 示例：
DATABASE_URL: "postgresql://${DB_USER:-postgres}:${DB_PASS:?Database password is required}@${DB_HOST:-localhost}:5432/${DB_NAME:-mydb}"
```

---

### 5. Networks（网络）= 服务间通信

**类比**：Docker 网络就像虚拟局域网，容器之间可以通过"内部 IP"或"服务名"通信。

**项目实例**（来自 `docker-compose.yml:183-186`）：

```yaml
# ============================================================================
# 网络定义
# ============================================================================
networks:
  innoliber_network:
    driver: bridge                       # 🔑 桥接模式（默认）
    # driver_opts:
    #   com.docker.network.bridge.name: innoliber_br
```

**服务如何使用网络**：

```yaml
services:
  postgres:
    image: postgres:16
    container_name: innoliber_postgres
    networks:
      - innoliber_network                # 🔑 加入网络

  backend:
    build: ./backend
    networks:
      - innoliber_network
    environment:
      # 🔑 使用服务名作为主机名
      DATABASE_URL: "postgresql://user:pass@postgres:5432/db"
      #                                        ↑ 服务名即 DNS 主机名
      REDIS_HOST: redis                  # 🔑 服务名
```

**网络通信原理**：

```
┌──────────────────────────────────────────────────────┐
│       Docker 桥接网络（innoliber_network）            │
├──────────────────────────────────────────────────────┤
│                                                        │
│  🔹 内部 DNS 解析                                     │
│     postgres → 172.18.0.2                             │
│     redis → 172.18.0.3                                │
│     backend → 172.18.0.4                              │
│                                                        │
│  ┌──────────────┐       ┌──────────────┐            │
│  │  postgres    │◄──────┤  backend     │            │
│  │  (5432)      │  SQL  │  (8000)      │            │
│  └──────────────┘       └──────────────┘            │
│         ↑                      │                      │
│         │                      │                      │
│         │                      ↓                      │
│         │               ┌──────────────┐            │
│         │               │  redis       │            │
│         │               │  (6379)      │            │
│         │               └──────────────┘            │
│         │                                             │
│         └──────────── 内部通信（服务名） ──────────┘ │
│                                                        │
└──────────────────────────────────────────────────────┘
         │                              │
         └──────────────────────────────┘
                     ↓
              宿主机网络（端口映射）
              - postgres:5432 → localhost:5432
              - backend:8000 → localhost:8000
              - redis:6379 → localhost:6379
```

**网络模式对比**：

| 网络驱动 | 说明 | 使用场景 | 项目使用 |
|---------|------|---------|---------|
| `bridge` | 桥接模式（默认） | ✅ 单主机多容器通信 | ✅ InnoLiber 开发环境 |
| `host` | 主机模式 | 🟡 性能优先（无网络隔离） | ❌ 不推荐（端口冲突） |
| `overlay` | 覆盖网络 | ✅ 跨主机容器通信（Swarm） | ❌ 不适用（单机部署） |
| `none` | 无网络 | 🟡 完全隔离 | ❌ 不适用 |

---

### 6. Volumes（数据卷）= 持久化存储

**类比**：数据卷就像外接硬盘，容器删除后数据仍然保留。

**项目实例**（来自 `docker-compose.yml:173-181`）：

```yaml
# ============================================================================
# 数据卷定义
# ============================================================================
volumes:
  # 🔑 命名卷（Docker 管理）
  postgres_data:
    driver: local                        # 本地存储驱动
  redis_data:
    driver: local
  pgadmin_data:
    driver: local

# ============================================================================
# 服务中使用数据卷
# ============================================================================
services:
  postgres:
    image: postgres:16
    volumes:
      # 格式：volume_name:container_path[:options]
      - postgres_data:/var/lib/postgresql/data  # 命名卷
      # 或
      # - ./local/path:/container/path           # 绑定挂载

  backend:
    build: ./backend
    volumes:
      # 🔑 开发模式：绑定挂载（代码热重载）
      - ./backend/app:/app/app:ro        # ro = read-only
      # 说明：本地修改代码 → 容器内立即更新

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data                 # Redis 数据持久化
```

**数据卷类型对比**：

| 类型 | 语法 | 特点 | 使用场景 | 项目示例 |
|------|------|------|---------|---------|
| **命名卷** | `volume_name:/path` | Docker 管理，持久化 | ✅ 生产数据 | `postgres_data:/var/lib/postgresql/data` |
| **绑定挂载** | `./host/path:/path` | 宿主机目录映射 | ✅ 开发代码热重载 | `./backend/app:/app/app:ro` |
| **tmpfs 挂载** | `type: tmpfs` | 内存中临时存储 | 🟡 敏感数据（密钥） | （少用） |

**数据卷生命周期**：

```
┌─────────────────────────────────────────────────────┐
│              数据卷生命周期管理                      │
├─────────────────────────────────────────────────────┤
│                                                       │
│  1️⃣ docker-compose up                                │
│     └─> 自动创建卷（如果不存在）                     │
│         innoliber_postgres_data                      │
│         innoliber_redis_data                         │
│                                                       │
│  2️⃣ 容器运行期间                                     │
│     └─> 数据写入卷                                   │
│         PostgreSQL 数据库文件                        │
│         Redis RDB 快照                               │
│                                                       │
│  3️⃣ docker-compose down                              │
│     └─> 停止并删除容器，但保留卷 ✅                  │
│                                                       │
│  4️⃣ docker-compose up                                │
│     └─> 重新启动，数据自动恢复 ✅                    │
│                                                       │
│  5️⃣ docker-compose down -v                           │
│     └─> 停止容器并删除卷 ⚠️（数据丢失！）           │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

### 7. Healthcheck（健康检查）= 服务就绪检测

**类比**：健康检查就像定期体检，自动检测容器是否正常工作。

**项目实例**（来自 `docker-compose.yml:45-53`）：

```yaml
# ============================================================================
# PostgreSQL 健康检查
# ============================================================================
services:
  postgres:
    image: pgvector/pgvector:pg16
    healthcheck:
      # 🔑 检查命令：pg_isready
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-innoliber}"]
      interval: 10s                      # 每 10 秒检查一次
      timeout: 5s                        # 检查超时 5 秒
      retries: 5                         # 失败 5 次才标记为不健康
      start_period: 10s                  # 启动后等待 10 秒再检查

  # ============================================================================
  # Redis 健康检查
  # ============================================================================
  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # ============================================================================
  # Backend 健康检查
  # ============================================================================
  backend:
    build: ./backend
    healthcheck:
      test: ["CMD", "python", "-c", "import requests; requests.get('http://localhost:8000/health', timeout=2)"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s                  # 🔑 后端启动需要更长时间

  # ============================================================================
  # Frontend 健康检查
  # ============================================================================
  frontend:
    build: ./frontend
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
```

**健康检查状态变化**：

```
┌─────────────────────────────────────────────────────┐
│              容器健康状态变化流程                    │
├─────────────────────────────────────────────────────┤
│                                                       │
│  starting (启动中)                                   │
│     ↓                                                 │
│     └─> 等待 start_period (10s)                     │
│         不执行健康检查                               │
│                                                       │
│  healthy (健康)                                      │
│     ↓                                                 │
│     └─> 每 interval (10s) 执行检查                  │
│         ├─> 成功 → 保持 healthy                     │
│         └─> 失败 → 进入 unhealthy                    │
│                                                       │
│  unhealthy (不健康)                                  │
│     ↓                                                 │
│     └─> 触发 retries (5 次)                          │
│         ├─> 任一检查成功 → 回到 healthy              │
│         └─> 持续失败 → 容器重启（如配置 restart）    │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**健康检查命令类型**：

```yaml
# 类型1：Shell 命令
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  # 等价于：/bin/sh -c "pg_isready -U postgres"

# 类型2：Exec 命令（不经过 Shell）
healthcheck:
  test: ["CMD", "redis-cli", "ping"]
  # 直接执行：redis-cli ping

# 类型3：HTTP 请求（通过 curl/wget）
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  # 检查 HTTP 端点

# 类型4：Python 脚本
healthcheck:
  test: ["CMD", "python", "-c", "import requests; requests.get('http://localhost:8000/health')"]
  # 使用 Python 发起 HTTP 请求
```

---

## 💻 项目中的实际应用

### 示例 1：完整的 6 服务编排配置

**文件位置**：`docker-compose.yml`（完整解析）

```yaml
# ============================================================================
# InnoLiber 项目 Docker Compose 配置
# ============================================================================

version: '3.8'

# ============================================================================
# 服务定义（6 个服务）
# ============================================================================
services:
  # --------------------------------------------------------------------------
  # 1️⃣ PostgreSQL 数据库（带 pgvector 扩展）
  # --------------------------------------------------------------------------
  postgres:
    image: pgvector/pgvector:pg16
    container_name: innoliber_postgres
    restart: unless-stopped               # 自动重启（除非手动停止）
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-innoliber}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-password}
      POSTGRES_DB: ${POSTGRES_DB:-innoliber}
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --lc-collate=C --lc-ctype=C"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - innoliber_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-innoliber}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  # --------------------------------------------------------------------------
  # 2️⃣ Redis 缓存
  # --------------------------------------------------------------------------
  redis:
    image: redis:7-alpine
    container_name: innoliber_redis
    restart: unless-stopped
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redis_data:/data
    networks:
      - innoliber_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # --------------------------------------------------------------------------
  # 3️⃣ FastAPI 后端
  # --------------------------------------------------------------------------
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: innoliber_backend
    restart: unless-stopped
    ports:
      - "${BACKEND_PORT:-8000}:8000"
    # 🔑 依赖关系：等待数据库和缓存健康
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      # 🔑 数据库连接（使用服务名）
      DATABASE_URL: "postgresql+asyncpg://${POSTGRES_USER:-innoliber}:${POSTGRES_PASSWORD:-password}@postgres:5432/${POSTGRES_DB:-innoliber}"
      # 🔑 Redis 连接
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_DB: 0
      # 🔑 JWT 认证
      JWT_SECRET_KEY: ${JWT_SECRET_KEY:-your-secret-key-change-in-production}
      JWT_ALGORITHM: HS256
      ACCESS_TOKEN_EXPIRE_MINUTES: 1440
      # 🔑 应用配置
      PROJECT_NAME: InnoLiber
      VERSION: 0.1.0
      ENVIRONMENT: ${ENVIRONMENT:-development}
    volumes:
      # 🔑 开发模式：代码热重载
      - ./backend/app:/app/app:ro
    networks:
      - innoliber_network
    healthcheck:
      test: ["CMD", "python", "-c", "import requests; requests.get('http://localhost:8000/health', timeout=2)"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # --------------------------------------------------------------------------
  # 4️⃣ Celery Worker（异步任务）
  # --------------------------------------------------------------------------
  celery-worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: innoliber_celery_worker
    restart: unless-stopped
    # 🔑 覆盖默认启动命令
    command: celery -A app.core.celery_app worker --loglevel=info
    depends_on:
      - postgres
      - redis
      - backend
    environment:
      DATABASE_URL: "postgresql+asyncpg://${POSTGRES_USER:-innoliber}:${POSTGRES_PASSWORD:-password}@postgres:5432/${POSTGRES_DB:-innoliber}"
      REDIS_HOST: redis
      REDIS_PORT: 6379
    volumes:
      - ./backend/app:/app/app:ro
    networks:
      - innoliber_network

  # --------------------------------------------------------------------------
  # 5️⃣ React 前端（Nginx）
  # --------------------------------------------------------------------------
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: innoliber_frontend
    restart: unless-stopped
    ports:
      - "${FRONTEND_PORT:-3000}:80"
    depends_on:
      - backend
    networks:
      - innoliber_network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3

  # --------------------------------------------------------------------------
  # 6️⃣ pgAdmin（数据库管理工具）
  # --------------------------------------------------------------------------
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: innoliber_pgadmin
    restart: unless-stopped
    ports:
      - "${PGADMIN_PORT:-5050}:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_EMAIL:-admin@innoliber.com}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD:-admin}
      PGADMIN_CONFIG_SERVER_MODE: 'False'
      PGADMIN_CONFIG_MASTER_PASSWORD_REQUIRED: 'False'
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    networks:
      - innoliber_network
    depends_on:
      - postgres

# ============================================================================
# 数据卷定义（3 个持久化卷）
# ============================================================================
volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  pgadmin_data:
    driver: local

# ============================================================================
# 网络定义（1 个桥接网络）
# ============================================================================
networks:
  innoliber_network:
    driver: bridge
```

**配置亮点分析**：

1. **依赖链管理**：
   ```
   postgres/redis (健康) → backend (健康) → frontend
                                          → celery-worker
                                          → pgadmin
   ```

2. **环境变量使用**：
   - ✅ 所有敏感信息从 `.env` 文件读取
   - ✅ 提供默认值（`${VAR:-default}`）
   - ✅ 服务名作为主机名（`DATABASE_URL=...@postgres:5432/...`）

3. **健康检查策略**：
   - ✅ 基础服务（数据库、缓存）：10秒间隔
   - ✅ 应用服务（后端、前端）：30秒间隔，更长 start_period

4. **数据持久化**：
   - ✅ PostgreSQL：`postgres_data` 卷
   - ✅ Redis：`redis_data` 卷
   - ✅ pgAdmin：`pgadmin_data` 卷

---

### 示例 2：开发环境 vs 生产环境配置

**开发环境**（`docker-compose.yml`）：

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development               # 🔑 开发阶段
    ports:
      - "8000:8000"
      - "8001:8001"                      # 调试端口
    environment:
      ENVIRONMENT: development
      DEBUG: "true"
      LOG_LEVEL: DEBUG
    volumes:
      # 🔑 代码热重载
      - ./backend/app:/app/app:rw        # 可读写
    command: >
      uvicorn app.main:app
      --host 0.0.0.0
      --port 8000
      --reload                            # 🔑 自动重载

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: development
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      VITE_API_URL: http://localhost:8000
    volumes:
      # 🔑 代码热重载
      - ./frontend/src:/app/src:rw
      - ./frontend/public:/app/public:rw
    command: npm run dev                 # 🔑 开发服务器
```

**生产环境**（`docker-compose.prod.yml`）：

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production                 # 🔑 生产阶段
    ports:
      - "8000:8000"
    environment:
      ENVIRONMENT: production
      DEBUG: "false"
      LOG_LEVEL: INFO
    # 🔑 不挂载代码卷
    # volumes: []
    command: >
      uvicorn app.main:app
      --host 0.0.0.0
      --port 8000
      --workers 4                         # 🔑 多进程
      --proxy-headers

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production                 # 🔑 生产阶段
    ports:
      - "80:80"
      - "443:443"
    environment:
      NODE_ENV: production
    # 🔑 不挂载代码卷
    # volumes: []
    command: nginx -g "daemon off;"      # 🔑 Nginx 服务器
```

**启动命令**：

```bash
# 开发环境
docker-compose up -d

# 生产环境
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 说明：
# - docker-compose.prod.yml 会覆盖 docker-compose.yml 的同名配置
# - 适合共享基础配置，环境特定配置独立管理
```

---

### 示例 3：多环境配置文件合并

**基础配置**（`docker-compose.yml`）：

```yaml
version: '3.8'

services:
  backend:
    image: my-backend
    ports:
      - "8000:8000"
    environment:
      PROJECT_NAME: InnoLiber

  postgres:
    image: postgres:16
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:

networks:
  app-network:
```

**开发覆盖**（`docker-compose.dev.yml`）：

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      target: development
    environment:
      DEBUG: "true"                       # 🔑 添加环境变量
    volumes:
      - ./backend/app:/app/app:rw        # 🔑 添加代码卷
    command: uvicorn app.main:app --reload
```

**生产覆盖**（`docker-compose.prod.yml`）：

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      target: production
    environment:
      DEBUG: "false"                      # 🔑 覆盖环境变量
    command: >
      uvicorn app.main:app
      --host 0.0.0.0
      --workers 4
      --proxy-headers

  postgres:
    restart: always                       # 🔑 添加重启策略
```

**使用方式**：

```bash
# 开发环境
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# 生产环境
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 查看合并后的配置
docker-compose -f docker-compose.yml -f docker-compose.dev.yml config
```

---

## 🎯 快速上手指南

### Step 1：创建基础配置文件

```bash
# 项目结构
InnoLiber/
├── backend/
│   ├── Dockerfile
│   └── app/
├── frontend/
│   ├── Dockerfile
│   └── src/
├── docker-compose.yml         # 🔑 主配置文件
└── .env                        # 🔑 环境变量文件
```

**创建 .env 文件**：

```bash
# .env
POSTGRES_USER=innoliber
POSTGRES_PASSWORD=secure_password_123
POSTGRES_DB=innoliber
POSTGRES_PORT=5432
REDIS_PORT=6379
BACKEND_PORT=8000
FRONTEND_PORT=3000
JWT_SECRET_KEY=your-super-secret-jwt-key
ENVIRONMENT=development
```

---

### Step 2：编写 docker-compose.yml

```yaml
version: '3.8'

services:
  # 数据库
  postgres:
    image: postgres:16
    container_name: my_postgres
    restart: unless-stopped
    ports:
      - "${POSTGRES_PORT}:5432"
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 后端
  backend:
    build: ./backend
    container_name: my_backend
    restart: unless-stopped
    ports:
      - "${BACKEND_PORT}:8000"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"
    networks:
      - app-network

  # 前端
  frontend:
    build: ./frontend
    container_name: my_frontend
    restart: unless-stopped
    ports:
      - "${FRONTEND_PORT}:80"
    depends_on:
      - backend
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

---

### Step 3：启动和管理服务

```bash
# 1. 启动所有服务（后台运行）
docker-compose up -d

# 2. 查看服务状态
docker-compose ps

# 输出示例：
# NAME                COMMAND                  SERVICE      STATUS         PORTS
# my_postgres         "docker-entrypoint..."   postgres     running        0.0.0.0:5432->5432/tcp
# my_backend          "uvicorn app.main:..."   backend      running        0.0.0.0:8000->8000/tcp
# my_frontend         "nginx -g 'daemon ..."   frontend     running        0.0.0.0:3000->80/tcp

# 3. 查看服务日志
docker-compose logs -f backend          # 跟踪后端日志
docker-compose logs -f postgres         # 跟踪数据库日志
docker-compose logs --tail=50 backend   # 查看最后 50 行

# 4. 停止所有服务
docker-compose down

# 5. 停止并删除数据卷（⚠️ 数据会丢失）
docker-compose down -v

# 6. 重启特定服务
docker-compose restart backend

# 7. 查看服务配置
docker-compose config

# 8. 进入容器 Shell
docker-compose exec backend bash
docker-compose exec postgres psql -U postgres

# 9. 构建镜像（不启动）
docker-compose build

# 10. 重新构建并启动
docker-compose up -d --build
```

---

## ⚠️ 常见陷阱（新手必看）

### 陷阱 1：忘记配置 depends_on 的健康检查

```yaml
# ❌ 错误：只依赖容器启动
services:
  backend:
    depends_on:
      - postgres                          # 只等待容器启动
# 问题：后端可能在数据库初始化完成前就尝试连接

# ✅ 正确：依赖健康检查
services:
  backend:
    depends_on:
      postgres:
        condition: service_healthy        # 等待健康检查通过

  postgres:
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 10s
```

---

### 陷阱 2：环境变量插值语法错误

```yaml
# ❌ 错误：未使用 $ 符号
services:
  backend:
    environment:
      DATABASE_URL: "postgresql://postgres:5432"

# ❌ 错误：忘记加引号
services:
  backend:
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432
      # 问题：YAML 解析错误（@符号）

# ✅ 正确：使用引号
services:
  backend:
    environment:
      DATABASE_URL: "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"
```

---

### 陷阱 3：端口映射冲突

```yaml
# ❌ 错误：多个服务映射到同一宿主机端口
services:
  backend1:
    ports:
      - "8000:8000"

  backend2:
    ports:
      - "8000:8000"                       # ❌ 端口冲突！
# 结果：第二个服务启动失败

# ✅ 正确：使用不同的宿主机端口
services:
  backend1:
    ports:
      - "8000:8000"

  backend2:
    ports:
      - "8001:8000"                       # ✅ 不同宿主机端口
```

---

### 陷阱 4：数据卷路径错误

```yaml
# ❌ 错误：相对路径不正确
services:
  backend:
    volumes:
      - app:/app/app                      # ❌ 会被认为是命名卷
# 结果：创建名为 "app" 的卷，而非挂载本地目录

# ✅ 正确：使用 ./ 前缀表示相对路径
services:
  backend:
    volumes:
      - ./backend/app:/app/app            # ✅ 绑定挂载本地目录
```

---

### 陷阱 5：忘记定义网络导致服务无法通信

```yaml
# ❌ 错误：服务在不同网络
services:
  backend:
    networks:
      - backend-network

  postgres:
    networks:
      - database-network                  # ❌ 不同网络
# 结果：后端无法连接数据库

# ✅ 正确：所有服务在同一网络
services:
  backend:
    networks:
      - app-network

  postgres:
    networks:
      - app-network

networks:
  app-network:
```

---

### 陷阱 6：生产环境使用开发配置

```yaml
# ❌ 错误：生产环境启用调试模式
services:
  backend:
    environment:
      DEBUG: "true"                       # ❌ 生产环境不应启用
      LOG_LEVEL: DEBUG                    # ❌ 日志过多
    volumes:
      - ./backend/app:/app/app:rw        # ❌ 代码可被修改
    command: uvicorn --reload             # ❌ 启用热重载

# ✅ 正确：生产环境配置
services:
  backend:
    environment:
      DEBUG: "false"                      # ✅ 关闭调试
      LOG_LEVEL: INFO                     # ✅ 适度日志
    # 不挂载代码卷
    command: uvicorn --workers 4          # ✅ 多进程
```

---

### 陷阱 7：忘记 .dockerignore 导致构建缓慢

```bash
# ❌ 问题：没有 .dockerignore，所有文件都被复制

# ✅ 解决方案：创建 .dockerignore
# backend/.dockerignore
__pycache__
*.pyc
.venv
.git
.pytest_cache
node_modules

# frontend/.dockerignore
node_modules
.git
dist
build
.vscode
```

---

## 📚 学习资源

### 官方资源
- **Docker Compose 官方文档**：https://docs.docker.com/compose/
- **Context7 查询结果**：`/websites/docs_docker_com` (已查询)
- **Compose 文件参考**：https://docs.docker.com/compose/compose-file/
- **最佳实践指南**：https://docs.docker.com/develop/dev-best-practices/

### 项目中的参考文件
- **开发环境配置**：`docker-compose.yml` - 6 服务编排
- **生产环境配置**：`docker-compose.prod.yml` - 生产优化
- **环境变量模板**：`.env.example` - 配置示例

### 进阶学习主题
- **Docker Swarm**：Docker 官方集群编排
- **Kubernetes**：更强大的容器编排平台
- **Secrets 管理**：敏感信息的安全存储
- **服务发现**：动态服务注册和发现

---

## 🎯 实践练习建议

### 练习 1：创建简单的 3 服务应用

```yaml
# 任务：创建包含以下服务的 docker-compose.yml
# - Web 服务（Nginx）
# - API 服务（Python Flask）
# - 数据库（PostgreSQL）
# 要求：
# - API 依赖数据库健康检查
# - Web 代理 API 请求
# - 数据持久化
```

---

### 练习 2：实现多环境配置

```bash
# 任务：创建开发和生产两套配置
# - docker-compose.yml（基础配置）
# - docker-compose.dev.yml（开发覆盖）
# - docker-compose.prod.yml（生产覆盖）
# 要求：
# - 开发环境启用代码热重载
# - 生产环境优化性能（多进程）
# - 使用环境变量区分配置
```

---

### 练习 3：添加监控服务

```yaml
# 任务：为现有应用添加监控
# - Prometheus（指标收集）
# - Grafana（可视化）
# 要求：
# - Prometheus 抓取应用指标
# - Grafana 连接 Prometheus
# - 数据持久化
```

---

## ✅ 学习检查清单

完成以下任务，说明你已经掌握 Docker Compose 多服务编排：

- [ ] **理解核心概念**：能解释 services、volumes、networks 的作用
- [ ] **会编写配置文件**：能创建包含多个服务的 docker-compose.yml
- [ ] **掌握依赖管理**：理解 depends_on 和 healthcheck 的配合使用
- [ ] **会使用环境变量**：能通过 .env 文件管理配置
- [ ] **理解网络通信**：知道如何通过服务名访问其他容器
- [ ] **会配置数据卷**：能区分命名卷和绑定挂载的使用场景
- [ ] **能管理服务生命周期**：熟练使用 up、down、logs、restart 等命令
- [ ] **会调试问题**：能查看日志、进入容器、检查网络连接
- [ ] **理解多环境配置**：能为开发和生产环境创建不同配置
- [ ] **能避免常见陷阱**：健康检查、端口冲突、数据卷路径等

---

## 🎓 下一步学习

完成本文档后，建议继续学习：

1. **项目架构总览**：`12_project_architecture_overview.md` - InnoLiber 系统设计
2. **开发工作流**：`13_development_workflow.md` - 完整开发流程
3. **项目实战**：尝试为新服务编写 Docker Compose 配置

---

## 🚀 实际项目应用

**在 InnoLiber 项目中的使用场景**：

1. **一键启动开发环境**：`docker-compose up -d` 启动完整应用栈
2. **服务依赖管理**：后端等待数据库健康后才启动
3. **数据持久化**：数据库和缓存数据在容器重启后保留
4. **团队协作**：所有成员运行相同的服务版本
5. **CI/CD 集成**：测试环境自动化部署

**项目特色实现**：
- ✅ 6 服务完整编排（PostgreSQL、Redis、Backend、Celery、Frontend、pgAdmin）
- ✅ 健康检查驱动的启动顺序控制
- ✅ 环境变量统一管理（.env 文件）
- ✅ 开发模式代码热重载（绑定挂载）
- ✅ 生产模式性能优化（多进程、无代码卷）

**常用命令速查**：
```bash
# 启动服务
docker-compose up -d                  # 后台启动所有服务
docker-compose up -d backend          # 只启动 backend 及其依赖

# 查看状态
docker-compose ps                     # 查看服务状态
docker-compose logs -f backend        # 跟踪后端日志
docker-compose top                    # 查看容器内进程

# 管理服务
docker-compose stop                   # 停止所有服务
docker-compose start                  # 启动已停止的服务
docker-compose restart backend        # 重启特定服务
docker-compose down                   # 停止并删除容器
docker-compose down -v                # 停止并删除数据卷

# 调试
docker-compose exec backend bash      # 进入容器 Shell
docker-compose exec postgres psql -U postgres  # 进入数据库
docker-compose config                 # 查看合并后的配置
docker-compose build --no-cache       # 强制重新构建镜像

# 多环境
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

**文档版本**：v1.0
**最后更新**：2025-11-15
**维护者**：InnoLiber Team
**参考来源**：Context7 - Docker Compose 官方文档

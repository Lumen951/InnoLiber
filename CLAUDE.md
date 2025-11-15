# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InnoLiber is an AI-powered research grant application assistant system designed to help Early Career Researchers (ECR) improve NSFC (National Natural Science Foundation of China) application quality. It features three core services:

- **K-TAS**: Knowledge Trend Analysis Service - Literature analysis and trend identification
- **SPG-S**: Structured Proposal Generation Service - AI-powered content generation using DeepSeek LLM
- **DDC-S**: Document Compliance Checking Service - Format compliance and automated corrections

## Development Commands

### Docker Environment
```bash
# Start development environment (PostgreSQL, Redis, pgAdmin)
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f postgres
```

### Backend Development
```bash
cd backend

# Install dependencies
poetry install

# Start development server
poetry run uvicorn app.main:app --reload

# Code formatting and linting
poetry run black .
poetry run isort .
poetry run flake8 .
poetry run mypy .

# Run tests
poetry run pytest
poetry run pytest --cov=app
poetry run pytest tests/test_specific_file.py
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Monorepo Structure
```
InnoLiber/
├── backend/          # Python FastAPI backend
├── frontend/         # React TypeScript frontend
├── data/            # RDR (Research Data Repository) resources
├── docs/            # Technical documentation
├── tools/           # Engineering tools and scripts
└── docker-compose.yml # Local development environment
```

### Technology Stack

**Backend:**
- Python 3.11 with FastAPI
- PostgreSQL 16 + pgvector for vector storage
- SQLAlchemy 2.0 with asyncpg for async database operations
- PyTorch 2.5.1 for ML/AI operations
- OpenAI SDK for DeepSeek API integration
- Poetry for dependency management

**Frontend:**
- React 18 with TypeScript 5
- Ant Design 5 for UI components
- Vite 5 for build tooling
- Zustand 4 for state management

### Three-Core Service Architecture

The system is built around three independent but interconnected services:

1. **K-TAS (Knowledge Trend Analysis Service)**
   - arXiv data crawling and processing
   - Vector-based literature clustering using PyTorch
   - Trend identification and semantic search
   - Research landscape analysis

2. **SPG-S (Structured Proposal Generation Service)**
   - DeepSeek LLM integration for content generation
   - Structured NSFC proposal generation
   - Feasibility analysis and suggestions
   - Template-based content creation

3. **DDC-S (Document Compliance Checking Service)**
   - NSFC format rule engine
   - Automated compliance checking
   - Modification suggestions
   - Format standardization

### Database Design

The PostgreSQL database uses pgvector for embedding storage and supports:
- Proposals and draft management
- Research corpus storage
- Vector embeddings for semantic search
- User management and authentication

## Environment Configuration

1. Copy `.env.template` to `.env`
2. Configure database connection settings
3. Add DeepSeek API key (`DEEPSEEK_API_KEY`)
4. Set up JWT secret keys for production

Key environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `DEEPSEEK_API_KEY`: Required for LLM functionality
- `JWT_SECRET_KEY`: Authentication security
- `REDIS_HOST`: Optional, for caching and task queues

## Development Status

Current phase: **Phase 2 - Backend API Implementation (30% Complete)**
Next phase: **Phase 2.3 - Proposal CRUD API Implementation**

**Phase 0 Completed** ✅ (2025-10-29):
- ✅ Technical documentation
- ✅ Frontend design prototypes
- ✅ Project skeleton setup
- ✅ Development environment configuration
- ✅ Dashboard首页实现
- ✅ 完整页面设计规范（含移动端适配）

**Phase 0.5 Docker Containerization** ✅ (2025-11-14):
- ✅ Backend Dockerfile (Poetry + Conda versions)
- ✅ Frontend Dockerfile (multi-stage build with Nginx)
- ✅ docker-compose.yml (development environment)
- ✅ docker-compose.prod.yml (production environment)
- ✅ Alembic database migration setup
- ✅ Environment variable templates (.env.example)
- ✅ Deployment documentation (docs/technical/04_dockerfile_implementation_plan.md, 05_docker_deployment_guide.md)
- ⏳ Full integration testing

**Phase 1 Completed** ✅ (60% Complete):
- ✅ LoginPage - 登录页 (100%)
- ✅ RegisterPage - 注册页 (100%)
- ✅ Dashboard - 首页/仪表板 (100%)
- ✅ ProposalCreatePage - 新建标书页 (100%)
- ⏳ ProposalEditPage - 标书编辑页
- ⏳ ProposalDetailPage - 标书详情页
- ⏳ AnalysisPage - 数据分析页
- ⏳ LibraryPage - 文献库页
- ⏳ SettingsPage - 设置页

**Phase 2 In Progress** 🔄 (30% Complete):
- ✅ Phase 2.1 - 数据库迁移配置 (100%) - 2025-11-15
- ✅ Phase 2.2 - 认证系统实现 (100%) - 2025-11-15
  - ✅ JWT令牌生成和验证
  - ✅ 密码哈希和验证 (bcrypt直接实现)
  - ✅ 注册、登录、用户信息API
  - ✅ 教育邮箱检测功能
- ⏳ Phase 2.3 - 标书CRUD API (0%)
- ⏳ Phase 2.4 - 种子数据和测试 (0%)
- ⏳ Phase 2.5 - 前后端联调 (0%)

## Frontend Development Progress

### Page Implementation Status
- [x] **Dashboard** - 首页/仪表板 (100% 完成)
- [x] **LoginPage** - 登录页 (100% 完成)
- [x] **RegisterPage** - 注册页 (100% 完成)
- [x] **ProposalCreatePage** - 新建标书页 (100% 完成)
- [x] **ProposalEditPage** - 标书编辑页 (100% 完成)
- [x] **ProposalDetailPage** - 标书详情页 (100% 完成)
- [x] **AnalysisPage** - 数据分析页 (100% 完成)
- [x] **LibraryPage** - 文献库页 (100% 完成)
- [x] **SettingsPage** - 设置页 (100% 完成)

### Component Library Status
- [x] **SidebarLayout** - 侧边栏布局组件 (100%)
- [x] **ProposalCard** - 标书卡片组件 (100%)
- [x] **StatusTag** - 状态标签组件 (100%)
- [x] **QualityScore** - 质量评分组件 (100%)
- [x] **PasswordStrength** - 密码强度指示器 (100%)
- [x] **CaptchaPlaceholder** - 验证码占位组件 (100%)

### Infrastructure Status
- [x] **State Management** - Zustand状态管理 (proposalStore, authStore) (100%)
- [x] **API Layer** - 服务层封装 (api.ts, proposalService.ts) (100%)
- [x] **Routing** - 路由配置 (100%)
- [x] **Type System** - TypeScript类型定义 (100%)
- [x] **Docker Containerization** - 容器化部署配置 (90%)
  - Backend Dockerfile (Poetry + Conda versions)
  - Frontend Dockerfile (Nginx multi-stage build)
  - docker-compose.yml (dev) + docker-compose.prod.yml
  - Alembic database migrations
  - Deployment documentation

## Frontend Development Standards

### Responsive Design Principles
- **Mobile First**: 移动端优先设计
- **Ant Design Grid**: 使用Ant Design Grid系统
- **Breakpoints**: xs < 576px, md ≥ 768px, xl ≥ 1200px
- **Navigation**: 桌面端固定侧边栏，移动端抽屉导航

### Component Development Workflow
1. 参考设计文档 (docs/design/frontend_pages_complete.md)
2. 创建类型定义 (types/index.ts)
3. 实现组件逻辑
4. 添加响应式样式
5. 集成状态管理
6. 编写单元测试

### Technology Stack Extensions
**New Dependencies for Page Implementation**:
```json
{
  "react-quill": "^2.0.0",          // 富文本编辑器
  "recharts": "^2.13.3",            // 图表库
  "react-hook-form": "^7.54.2",     // 表单处理
  "zod": "^3.24.1",                 // 表单验证
  "@hookform/resolvers": "^3.9.1",  // React Hook Form + Zod集成
  "lodash": "^4.17.21"              // 工具库（debounce等）
}
```

## Key Files to Reference

### Technical Documentation
- `docs/technical/00_development_plan.md` - Comprehensive development roadmap
- `docs/technical/02_database_design.md` - Database schema and architecture
- `docs/technical/03_api_specification.md` - API endpoint specifications

### Design Documentation
- `docs/design/frontend_pages_complete.md` - 完整页面设计规范（7个页面 × 2版本）
- `docs/design/responsive_design_guide.md` - 响应式设计指南
- `docs/design/component_development_standards.md` - 组件开发规范
- `docs/design/frontend_prototypes.md` - 原始设计方案（方案A/B/C）
- `docs/design/icon_requirements.md` - 图标需求清单

### Configuration Files
- `backend/app/core/config.py` - Backend configuration management
- `frontend/vite.config.ts` - Frontend build configuration

## Testing

- Backend: `pytest` with async support and coverage reporting
- Frontend: Vitest for unit tests (configured in Vite)
- Integration: End-to-end API testing

## Deployment

The project is designed for deployment on Alibaba Cloud with containerized services using Docker Compose.

---

## Development Workflow (开发工作流程规范)

### 📌 Overview (概述)

本项目遵循结构化开发流程，确保每个阶段的工作可追溯、可交接。Claude Code在完成每个阶段任务后，必须严格遵循以下工作流程。

---

### 🔄 Complete Development Cycle (完整开发周期)

每次开发任务遵循以下标准流程：

```
┌─────────────────────────────────────────────────────────────┐
│                    开发周期完整流程                            │
└─────────────────────────────────────────────────────────────┘

📋 PHASE 0: PRE-DEVELOPMENT CHECK (开发前检查)
    ↓
    ├─ Step 0.1: 检查开发计划文档
    │  └─ 读取 docs/technical/00_development_plan.md
    │  └─ 确认当前Phase和进度百分比
    │  └─ 查看上一次开发记录
    │
    ├─ Step 0.2: 分析任务依赖关系
    │  └─ 确认前置任务是否完成
    │  └─ 识别阻塞项（外部依赖/API密钥）
    │
    ├─ Step 0.3: 查询技术文档 (Context7)
    │  └─ 识别涉及的技术栈（如：FastAPI, React, PostgreSQL）
    │  └─ 使用mcp__context7__resolve-library-id查找库ID
    │  └─ 使用mcp__context7__get-library-docs获取最新文档
    │  └─ 阅读相关API用法和最佳实践
    │
    └─ Step 0.4: 确认可以开始开发
       └─ 所有依赖就绪 → 继续
       └─ 缺少依赖 → 通知用户

    ↓

💻 PHASE 1: DEVELOPMENT EXECUTION (开发执行)
    ↓
    └─ 按照任务清单编写代码
    └─ 参考Context7获取的技术文档
    └─ 遵循项目代码规范

    ↓

✅ PHASE 2: POST-DEVELOPMENT DOCUMENTATION (开发后文档更新)
    ↓
    ├─ Step 1: 更新开发状态
    │  └─ 修改 CLAUDE.md "Development Status"
    │  └─ 修改 docs/technical/00_development_plan.md
    │  └─ 标记完成任务为 ✅
    │
    ├─ Step 2: 记录待完成项
    │  └─ 未完成的功能
    │  └─ 已知问题
    │  └─ 技术债务
    │
    ├─ Step 3: 列出外部依赖需求
    │  └─ 当前阶段是否需要用户提供资源
    │  └─ 下一阶段需要什么（API Key/配置等）
    │
    └─ Step 4: 更新README.md
       └─ 更新功能列表
       └─ 更新安装说明（如有新依赖）
       └─ 更新使用指南（如有新功能）

    ↓

📝 PHASE 3: GIT COMMIT & PUSH (代码提交)
    ↓
    └─ git status 检查修改
    └─ git add . 暂存文件
    └─ git commit -m "<type>(<scope>): <subject> (Phase X.Y)"
    └─ git push origin main

    ↓

✅ CYCLE COMPLETE (周期完成)
```

---

### 📋 Pre-Development Checklist (开发前检查清单)

**重要性**: 开发前检查是避免返工和提高效率的关键！

#### Step 0.1: Review Development Plan (检查开发计划)

**操作步骤**:
```bash
# 1. 读取开发计划文档
Read: docs/technical/00_development_plan.md

# 2. 关注以下信息：
- 当前处于哪个Phase？（如：Phase 2.2）
- 当前Phase的完成进度？（如：30%）
- 上一次开发完成了什么？
- 当前任务的目标是什么？
```

**检查清单**:
- [ ] 已读取`docs/technical/00_development_plan.md`
- [ ] 确认当前Phase编号（如：Phase 2.2）
- [ ] 确认Phase完成进度（如：Phase 2 - 30%）
- [ ] 查看"开发记录"章节的最新条目
- [ ] 理解当前任务的验收标准

**示例**:
```markdown
# 从开发计划文档中提取的信息

**当前阶段**: Phase 2.2 - 认证系统实现
**进度**: Phase 2 整体30%完成
**上次完成**: Phase 2.1 数据库迁移配置 (100%)
**当前目标**:
  - 创建认证相关模块（security.py, dependencies.py）
  - 实现JWT令牌生成和验证
  - 实现注册/登录API端点
**依赖检查**:
  - ✅ PostgreSQL已启动（Phase 2.1完成）
  - ✅ User模型已扩展（Phase 2.1完成）
  - ❌ 需要安装新依赖：python-jose, passlib
```

---

#### Step 0.2: Check Previous Progress (检查上一次进度)

**操作步骤**:
```bash
# 1. 查看Git提交历史
git log --oneline -10

# 2. 查看CLAUDE.md的"Development Status"章节
Read: CLAUDE.md (line 141-173)

# 3. 查看上一次的待完成项
Search: "🚧 Pending Items" in docs/technical/00_development_plan.md
```

**检查清单**:
- [ ] 查看最近10条Git提交记录
- [ ] 确认最后一次提交是哪个Phase
- [ ] 检查是否有未完成的任务遗留
- [ ] 检查是否有已知问题需要先解决

**问题处理**:
- 如果发现**遗留问题** → 先解决或记录为技术债务
- 如果发现**依赖缺失** → 通知用户提供或调整计划
- 如果**状态不清晰** → 向用户确认当前应该做什么

---

#### Step 0.3: Query Technical Documentation (查询技术文档 - Context7)

**核心原则**: 在开始编写代码前，必须查询最新的技术文档！

**适用场景**:
- ✅ 使用新的库或框架（如：FastAPI, React Hook Form）
- ✅ 不确定API的正确用法
- ✅ 需要了解最佳实践
- ✅ 升级依赖版本后（确保API兼容性）

**操作流程**:

```markdown
1️⃣ **识别涉及的技术栈**

   分析当前任务需要使用哪些库/框架：
   - 后端认证 → FastAPI, python-jose, passlib
   - 前端表单 → React Hook Form, Zod
   - 数据库 → SQLAlchemy, asyncpg
   - 等等...

2️⃣ **使用Context7查询文档**

   对于每个关键技术栈：

   # Step A: 查找库的Context7 ID
   mcp__context7__resolve-library-id(libraryName: "FastAPI")
   # 返回：/tiangolo/fastapi

   # Step B: 获取该库的最新文档
   mcp__context7__get-library-docs(
     context7CompatibleLibraryID: "/tiangolo/fastapi",
     topic: "authentication",  # 可选：聚焦特定主题
     tokens: 5000              # 可选：文档长度
   )

3️⃣ **阅读关键内容**

   专注于以下部分：
   - API签名和参数说明
   - 代码示例和用法
   - 常见陷阱（Gotchas）
   - 版本兼容性说明

4️⃣ **记录参考信息**

   在代码中添加注释：
   # Reference: Context7 - FastAPI /tiangolo/fastapi
   # OAuth2PasswordBearer用法参见：Security - OAuth2
   oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
```

**Context7使用示例**:

**场景1: 实现FastAPI认证系统（Phase 2.2）**

需要查询的技术栈:
1. FastAPI - 路由和依赖注入
2. python-jose - JWT令牌处理
3. passlib - 密码哈希

查询步骤:
```bash
# 查询FastAPI认证相关文档
mcp__context7__resolve-library-id(libraryName: "FastAPI")
→ 返回: /tiangolo/fastapi

mcp__context7__get-library-docs(
  context7CompatibleLibraryID: "/tiangolo/fastapi",
  topic: "security oauth2 jwt",
  tokens: 8000
)
→ 获取:
  - OAuth2PasswordBearer的使用方法
  - 依赖注入的最佳实践
  - JWT令牌验证流程示例代码
```

从文档中提取的关键信息:
- ✅ FastAPI的OAuth2PasswordBearer需要指定tokenUrl
- ✅ JWT过期时间使用timedelta而非整数秒
- ✅ 密码验证使用CryptContext(schemes=["bcrypt"])
- ⚠️ 注意：jose.jwt.decode在v3.3.0+需要显式指定algorithms参数

**检查清单**:
- [ ] 已识别当前任务涉及的所有技术栈（≥2个）
- [ ] 已使用Context7查询每个关键库的文档
- [ ] 已阅读相关API用法和代码示例
- [ ] 已记录关键注意事项（版本兼容性/常见陷阱）

---

#### Step 0.4: Confirm External Dependencies (确认外部依赖)

**操作步骤**:
```bash
# 1. 检查是否需要API密钥
Check: 当前任务是否涉及第三方服务？
- DeepSeek LLM → 需要 DEEPSEEK_API_KEY
- 阿里云服务 → 需要 ALIYUN_ACCESS_KEY

# 2. 检查是否需要云服务配置
Check: 是否需要域名/服务器/数据库？

# 3. 检查是否需要用户提供文档
Check: 是否需要NSFC样本/BIT规范？
```

**检查清单**:
- [ ] 确认当前Phase不需要外部依赖，或
- [ ] 已向用户请求必要的API密钥/配置，或
- [ ] 已在代码中使用TODO-ALIYUN标记预留未来功能

**决策树**:
```
需要外部依赖？
  ├─ 是 → 依赖是否已提供？
  │       ├─ 是 → ✅ 继续开发
  │       └─ 否 → ❌ 通知用户，调整计划或预留接口
  └─ 否 → ✅ 继续开发
```

---

### 💻 Development Execution (开发执行)

**开发原则**:
- ✅ 遵循Context7查询到的最佳实践
- ✅ 参考项目代码规范（见docs/design/component_development_standards.md）
- ✅ 编写清晰的代码注释（包括rationale/warning/todo标签）
- ✅ 为预留功能添加TODO-ALIYUN标记

**开发过程中持续参考**:
- 技术文档（Context7查询结果）
- 项目设计文档（docs/design/）
- 开发计划任务清单（docs/technical/00_development_plan.md）

---

### ✅ Post-Development Checklist (开发后检查清单)

#### Step 1: Update Development Status (更新开发状态)

**操作步骤**:
```bash
# 1. 更新 CLAUDE.md
Edit: CLAUDE.md (line 141-173) "Development Status" section

# 2. 更新 docs/technical/00_development_plan.md
Edit: docs/technical/00_development_plan.md
- 标记完成的任务为 ✅
- 更新进度百分比
- 添加开发记录条目
```

**更新内容**:
- [ ] 将完成的任务标记为 ✅
- [ ] 更新Phase完成进度（如：30% → 40%）
- [ ] 更新"Current phase"和"Next phase"
- [ ] 在"开发记录"章节添加本次完成的内容

**示例**:
```markdown
# CLAUDE.md 更新
**Phase 2 In Progress** 🔄 (40% Complete):  # 从30%更新
- ✅ Phase 2.1 - 数据库迁移配置 (100%)
- ✅ Phase 2.2 - 认证系统实现 (100%)     # 新增
- ⏳ Phase 2.3 - 标书CRUD API (0%)

# docs/technical/00_development_plan.md 更新
### 2025-11-15
**主要成果**:
- ✅ 完成Phase 2.2认证系统实现
- ✅ 创建security.py, dependencies.py, auth.py
- ✅ 实现注册/登录/JWT验证API

**技术亮点**:
- 使用bcrypt密码哈希（rounds=12）
- JWT令牌24小时过期机制
- OAuth2PasswordBearer依赖注入
```

---

#### Step 2: Document Pending Items (记录待完成项)

在相应阶段的文档中明确标注：

**格式模板**:
```markdown
### 🚧 Pending Items for Phase X.Y

**未完成功能**:
- [ ] `backend/app/api/v1/proposals.py` - DELETE端点权限检查（第245行）
- [ ] `frontend/src/pages/ProposalEditPage.tsx` - 自动保存功能（第120行）

**已知问题**:
- ⚠️ 数据库连接池偶现超时（压力测试中发现）
- ⚠️ 前端表单验证在移动端显示异常（iOS Safari）

**技术债务**:
- 🔧 `backend/app/core/security.py` - 密码哈希算法需要升级到Argon2
- 🔧 前端状态管理需要添加持久化层
```

**检查清单**:
- [ ] 记录所有未完成的功能点
- [ ] 记录开发中发现的问题
- [ ] 记录需要后续优化的代码

---

#### Step 3: List External Requirements (列出外部依赖需求)

明确标注**需要用户提供**的内容：

**格式模板**:
```markdown
### 🔑 External Requirements (需要用户提供)

**当前阶段需要**:
- ❌ 无外部依赖

**下一阶段需要** (Phase X+1):
- 🔄 DeepSeek API Key - 用于LLM内容生成（Phase 3开始前）
- 🔄 阿里云账号凭证 - 用于邮件推送服务（Phase 3.5开始前）
  - AccessKey ID
  - AccessKey Secret
  - DirectMail发信域名（建议：innoliber.com）

**未来阶段需要** (Phase X+2及之后):
- ⏳ NSFC申请书样本文档 - 用于格式合规检查（Phase 5）
- ⏳ BIT论文规范PDF - 用于格式规则引擎（Phase 5）
```

**检查清单**:
- [ ] 确认当前阶段所有依赖已满足
- [ ] 列出下一阶段需要的外部资源
- [ ] 标注每个依赖的用途和时间点

---

#### Step 4: Update README.md (更新项目说明文档)

**更新内容**:

1. **功能列表更新**
   ```markdown
   # 如果添加了新功能，在README.md的"Features"章节更新

   ## Features (功能特性)
   - ✅ 用户认证系统（注册/登录/JWT）         # 新增
   - ✅ 标书创建和管理
   - ⏳ AI辅助内容生成（开发中）
   ```

2. **安装说明更新**（如有新依赖）
   ```markdown
   # 如果添加了新的依赖包，更新安装说明

   ### Backend Dependencies
   poetry add python-jose[cryptography] passlib[bcrypt]  # 新增
   ```

3. **使用指南更新**（如有新的API或页面）
   ```markdown
   # 如果添加了新的API端点

   ### API Endpoints
   - POST /api/v1/auth/register - 用户注册       # 新增
   - POST /api/v1/auth/login - 用户登录          # 新增
   - GET /api/v1/auth/me - 获取当前用户信息      # 新增
   ```

4. **环境变量更新**（如有新配置）
   ```markdown
   # 如果添加了新的环境变量

   ### Environment Variables
   JWT_SECRET_KEY=your-secret-key-here           # 新增
   JWT_ALGORITHM=HS256                           # 新增
   ACCESS_TOKEN_EXPIRE_MINUTES=1440              # 新增
   ```

**检查清单**:
- [ ] 功能列表与实际代码一致
- [ ] 安装说明包含所有新依赖
- [ ] API文档包含新增端点
- [ ] 环境变量说明完整

**何时需要更新README.md**:
- ✅ 添加了新的功能模块
- ✅ 添加了新的API端点
- ✅ 修改了安装步骤或依赖
- ✅ 添加了新的环境变量
- ❌ 仅修复Bug或代码重构（不需要更新）

---

### 📝 Git Commit Guidelines (Git提交规范)

#### Commit Message 格式

```
<type>(<scope>): <subject>

[可选] <body>

[可选] <footer>
```

#### Type 类型定义

| Type | 说明 | 使用场景 |
|------|------|---------|
| `feat` | 新功能 | 完成新的页面/API/组件 |
| `fix` | Bug修复 | 修复功能性错误 |
| `docs` | 文档更新 | 修改README/CLAUDE.md/技术文档 |
| `style` | 代码格式 | 代码风格调整（不影响功能） |
| `refactor` | 重构 | 代码结构优化（不改变功能） |
| `test` | 测试 | 添加或修改测试用例 |
| `chore` | 构建/工具 | 依赖更新/配置修改 |
| `perf` | 性能优化 | 提升运行效率 |

#### Scope 范围定义

- `frontend` - 前端相关
- `backend` - 后端相关
- `docker` - Docker配置
- `docs` - 文档系统
- `design` - 设计规范
- `deps` - 依赖管理

#### Subject 主题要求

- ✅ 使用祈使句（"implement"而非"implemented"）
- ✅ 首字母小写
- ✅ 结尾不加句号
- ✅ 简明扼要（≤50字符）
- ✅ 标注阶段编号（如：Phase 1.2）

#### 提交示例

**✅ 良好示例**:
```bash
feat(frontend): implement ProposalCreatePage (Phase 1.2)
feat(backend): add authentication API endpoints (Phase 2.2)
fix(frontend): resolve mobile layout issues in Dashboard
docs: update development progress in CLAUDE.md
chore(deps): upgrade React to 18.3.0
refactor(backend): optimize database query performance
```

**❌ 不良示例**:
```bash
update files                        # 太模糊
完成了登录页面                       # 应使用英文
feat: added new feature             # 缺少scope
feat(frontend): Add Login Page.     # 首字母应小写，不加句号
```

#### 提交频率建议

- 🟢 **推荐**: 每完成一个独立功能模块提交一次
- 🟢 **推荐**: 每完成阶段性任务（Phase X.Y）提交一次
- 🔴 **避免**: 一天只提交一次（粒度太粗）
- 🔴 **避免**: 每修改一行提交一次（粒度太细）

---

### 🔍 Context7 Usage Guide (Context7使用指南)

#### 什么时候使用Context7？

**✅ 必须使用的场景**:
1. 开始新的Phase开发（如Phase 2.2认证系统）
2. 使用不熟悉的库或框架
3. 遇到API使用问题或报错
4. 升级依赖版本后（确保兼容性）

**🟡 建议使用的场景**:
5. 实现复杂功能（如JWT认证、文件上传）
6. 性能优化（查询最佳实践）
7. 安全相关功能（确保没有漏洞）

**❌ 不需要使用的场景**:
- 简单的CRUD操作（已有示例代码）
- 纯逻辑代码（不涉及外部库）
- 项目特定的业务逻辑

#### Context7查询最佳实践

**技巧1: 精准的topic参数**
```bash
# ❌ 不好的查询
mcp__context7__get-library-docs(
  context7CompatibleLibraryID: "/tiangolo/fastapi",
  topic: "fastapi"  # 太宽泛
)

# ✅ 好的查询
mcp__context7__get-library-docs(
  context7CompatibleLibraryID: "/tiangolo/fastapi",
  topic: "oauth2 jwt authentication middleware"  # 具体明确
)
```

**技巧2: 合理的tokens参数**
- 简单API查询: 3000-5000 tokens
- 复杂功能学习: 8000-10000 tokens
- 完整模块理解: 15000+ tokens

**技巧3: 多库组合查询**
```bash
# 实现前端表单验证需要查询3个库
1. React Hook Form → 表单状态管理
2. Zod → Schema定义和验证
3. Ant Design → UI组件集成
```

#### 常用技术栈的Context7 ID参考

| 技术栈 | Library Name | Context7 ID | 常用Topic |
|--------|-------------|-------------|-----------|
| FastAPI | FastAPI | /tiangolo/fastapi | authentication, middleware, websocket |
| React | React | /facebook/react | hooks, context, performance |
| Ant Design | antd | /ant-design/ant-design | form, table, layout |
| SQLAlchemy | SQLAlchemy | /sqlalchemy/sqlalchemy | async, relationships, query |
| Zustand | zustand | /pmndrs/zustand | middleware, persist, devtools |
| Zod | zod | /colinhacks/zod | schema, validation, errors |

*注：实际Context7 ID可能不同，使用时请先通过resolve-library-id确认*

---

### 🔑 External Dependencies Tracking (外部依赖追踪)

本项目依赖以下外部资源，需要用户在特定阶段前提供：

#### 🔴 必需依赖 (Critical - 阻塞开发)

| 依赖项 | 需要阶段 | 状态 | 备注 |
|--------|---------|------|------|
| DeepSeek API Key | Phase 3 开始前 | 🔄 待提供 | 用于SPG-S内容生成服务 |
| PostgreSQL 16 | 已配置 | ✅ 就绪 | Docker环境已包含 |

#### 🟡 重要依赖 (Important - 影响完整功能)

| 依赖项 | 需要阶段 | 状态 | 备注 |
|--------|---------|------|------|
| 阿里云AccessKey | Phase 3.5 开始前 | 🔄 待提供 | 用于邮件推送/验证码服务 |
| 域名配置 | Phase 3.5 开始前 | 🔄 待提供 | 用于DirectMail发信（如innoliber.com） |

#### 🟢 可选依赖 (Optional - 增强体验)

| 依赖项 | 需要阶段 | 状态 | 备注 |
|--------|---------|------|------|
| NSFC样本文档 | Phase 5 开始前 | ⏳ 未来需求 | 用于DDC-S格式合规检查 |
| BIT论文规范 | Phase 5 开始前 | ⏳ 未来需求 | 用于格式规则引擎训练 |

#### 依赖提供方式

用户应通过以下方式提供外部依赖：

1. **API密钥**:
   - 复制`.env.template`为`.env`
   - 在`.env`文件中填写相应变量
   - **不要提交`.env`到Git仓库**

2. **文档资料**:
   - 放置在`data/external/`目录
   - 添加到`.gitignore`（如包含敏感信息）

3. **云服务配置**:
   - 提供配置截图或配置参数
   - 在`docs/deployment/`目录创建配置文档

---

### 📋 Phase Completion Checklist Template (阶段完成检查清单模板)

复制此清单用于每次阶段完成后的自检：

```markdown
## Phase X.Y Completion Checklist

### 📋 Pre-Development (开发前)
- [ ] 已读取开发计划文档
- [ ] 已检查上一次进度和Git历史
- [ ] 已使用Context7查询相关技术文档（≥2个库）
- [ ] 已确认所有外部依赖就绪

### 💻 Development (开发执行)
- [ ] 已完成所有计划的功能点
- [ ] 代码遵循项目规范
- [ ] 已添加必要的代码注释
- [ ] 预留功能已标记TODO-ALIYUN

### ✅ Post-Development (开发后)
- [ ] 已更新CLAUDE.md的"Development Status"
- [ ] 已更新docs/technical/00_development_plan.md
- [ ] 已记录未完成功能（如有）
- [ ] 已记录已知问题（如有）
- [ ] 已记录技术债务（如有）
- [ ] 已列出下一阶段外部依赖需求
- [ ] 已更新README.md（如有新功能/API/依赖）

### 📝 Git Commit (代码提交)
- [ ] 执行`git status`检查修改
- [ ] 执行`git add .`暂存文件
- [ ] 使用规范格式提交：`<type>(<scope>): <subject> (Phase X.Y)`
- [ ] 执行`git push origin main`推送到远程

### 🧪 Quality Check (质量检查)
- [ ] 后端：运行`poetry run pytest`确保测试通过
- [ ] 后端：运行`poetry run black .`格式化代码
- [ ] 前端：运行`npm run lint`检查代码规范
- [ ] 前端：运行`npm run build`确保构建成功
```

---

### 🚨 Important Notes (重要提示)

1. **不要跳过工作流程**: 每个步骤都是为了确保代码质量和项目可维护性
2. **Context7是必需的**: 开发前必须查询技术文档，避免使用过时API
3. **提交信息很重要**: 清晰的提交历史是团队协作的基础
4. **及时沟通外部依赖**: 提前告知用户需要提供的资源，避免阻塞开发
5. **保持文档同步**: CLAUDE.md、开发计划文档和README.md应始终反映最新状态
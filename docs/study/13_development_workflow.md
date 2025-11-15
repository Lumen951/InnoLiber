# InnoLiber 开发工作流程详解

> **适合人群**：参与 InnoLiber 项目开发的团队成员
>
> **学习时长**：约 60-80 分钟
>
> **先修知识**：Git 基础命令、软件开发生命周期概念、团队协作经验

---

## 📌 什么是开发工作流程？

**一句话解释**：开发工作流程是团队在软件开发过程中遵循的标准化步骤和规范，确保代码质量、协作效率和项目可维护性。

### 为什么需要标准化工作流程？

**问题场景**：团队开发中经常出现的混乱情况：

**无规范的开发方式**：
```bash
# ❌ 开发者A的工作方式
git add .
git commit -m "修复了一些问题"
git push origin main

# ❌ 开发者B的工作方式
git add .
git commit -m "update files"
git push origin develop

# ❌ 开发者C的工作方式
git checkout -b fix-bug
# ... 开发了3天 ...
git add .
git commit -m "feat: 完成了登录页面和数据库和API还有前端组件"
git push origin fix-bug

# 问题：
# ❌ 提交信息不规范，无法追踪变更内容
# ❌ 分支命名混乱，目的不明确
# ❌ 提交粒度不合理，难以回滚和调试
# ❌ 没有代码审查，质量难以保证
# ❌ 工作流程不统一，协作困难
```

**InnoLiber 标准化工作流程**：
```bash
# ✅ 标准化工作流程
# 1. 创建规范的分支
git checkout -b feature/user-authentication

# 2. 开发过程中的规范提交
git add backend/app/core/security.py
git commit -m "feat(backend): implement password hashing with bcrypt (Phase 2.2)"

git add backend/app/api/v1/auth.py
git commit -m "feat(backend): add JWT authentication endpoints (Phase 2.2)"

git add frontend/src/pages/LoginPage.tsx
git commit -m "feat(frontend): implement login form with validation (Phase 2.2)"

# 3. 提交前的质量检查
npm run lint
poetry run black .
poetry run pytest

# 4. 创建Pull Request进行代码审查
git push origin feature/user-authentication
# 通过GitHub/GitLab界面创建PR

# 优势：
# ✅ 提交信息遵循Conventional Commits规范，便于自动化处理
# ✅ 分支命名清晰，反映开发目的
# ✅ 提交粒度合理，每次只关注一个功能点
# ✅ 自动化代码检查，确保质量标准
# ✅ Pull Request流程，强制代码审查
```

### 在 InnoLiber 项目中的应用

在我们的项目中，标准化工作流程确保：
- ✅ **开发进度可追踪**：每个Phase的完成情况清晰可见
- ✅ **代码质量一致**：统一的格式化、测试和审查标准
- ✅ **协作效率高**：清晰的分支策略和提交规范
- ✅ **文档同步更新**：开发完成后自动更新相关文档

**项目文件位置**：
- 工作流程规范：`CLAUDE.md` (第580-1100行)
- Git配置：`.gitignore`, `.env.example`
- 代码质量配置：`backend/pyproject.toml`, `frontend/package.json`

---

## 🔑 核心概念（用日常语言理解）

### 1. 开发周期 = 工厂生产流水线

**类比**：InnoLiber的开发工作流就像现代化工厂的生产流水线，每个环节都有严格的质量控制。

**项目实例**（来自 `CLAUDE.md:400-470`）：

```markdown
# ============================================================================
# InnoLiber 完整开发周期
# ============================================================================

📋 PHASE 0: PRE-DEVELOPMENT CHECK (开发前检查)
    ↓
    ├─ Step 0.1: 检查开发计划文档
    │  └─ 读取 docs/technical/00_development_plan.md
    │  └─ 确认当前Phase和进度百分比
    │
    ├─ Step 0.2: 分析任务依赖关系
    │  └─ 确认前置任务是否完成
    │  └─ 识别阻塞项（外部依赖/API密钥）
    │
    ├─ Step 0.3: 查询技术文档 (Context7)
    │  └─ 识别涉及的技术栈（如：FastAPI, React, PostgreSQL）
    │  └─ 使用mcp__context7__resolve-library-id查找库ID
    │  └─ 使用mcp__context7__get-library-docs获取最新文档
    │
    └─ Step 0.4: 确认可以开始开发

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
    ├─ Step 2: 记录待完成项
    ├─ Step 3: 列出外部依赖需求
    └─ Step 4: 更新README.md

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

**开发周期的关键原则**：
- **可追溯性**：每个变更都有明确的Phase标识和提交记录
- **可重现性**：通过Context7文档查询，确保使用最新的API和最佳实践
- **可回滚性**：小粒度提交，问题发生时可以精确定位和修复

---

### 2. Git Commit 规范 = 图书馆分类系统

**类比**：Git提交信息就像图书馆的分类系统，让每本书（每次提交）都能快速找到和理解。

**项目实例**（来自 `CLAUDE.md:733-801`）：

#### **Commit Message 格式标准**

```bash
# ============================================================================
# Conventional Commits 格式
# ============================================================================
<type>(<scope>): <subject>

[可选] <body>

[可选] <footer>

# ============================================================================
# InnoLiber 项目实例
# ============================================================================

# 示例1：新功能开发
feat(backend): implement JWT authentication middleware (Phase 2.2)

# 完整信息：
# - type: feat（新功能）
# - scope: backend（后端模块）
# - subject: implement JWT authentication middleware（具体功能）
# - Phase: Phase 2.2（开发阶段标识）

# 示例2：Bug修复
fix(frontend): resolve mobile layout overflow in Dashboard

# 示例3：文档更新
docs: update development progress to Phase 2.2 complete

# 示例4：依赖管理
chore(deps): upgrade SQLAlchemy to 2.0.35 for async support
```

#### **Type 类型系统**

**项目实例**（基于InnoLiber实际开发）：

| Type | 说明 | InnoLiber使用场景 | 实际示例 |
|------|------|------------------|---------|
| **feat** | 新功能 | 完成Phase任务、新页面、新API | `feat(frontend): implement ProposalCreatePage (Phase 1.2)` |
| **fix** | Bug修复 | 修复功能性错误 | `fix(backend): resolve database connection timeout` |
| **docs** | 文档更新 | 更新CLAUDE.md、技术文档 | `docs: update Phase 2.1 completion status` |
| **style** | 代码格式 | Black格式化、ESLint修复 | `style(backend): apply black formatting to auth module` |
| **refactor** | 重构 | 代码结构优化 | `refactor(frontend): extract common validation logic` |
| **test** | 测试 | 添加/修改测试 | `test(backend): add unit tests for JWT validation` |
| **chore** | 构建/工具 | 依赖更新、配置修改 | `chore(docker): update postgres to version 16` |
| **perf** | 性能优化 | 数据库查询优化、前端性能 | `perf(backend): optimize proposal list query with pagination` |

#### **Scope 范围定义**

**项目实例**（基于InnoLiber架构）：

```bash
# ============================================================================
# InnoLiber 项目 Scope 定义
# ============================================================================

# 前端相关
feat(frontend): implement responsive Dashboard layout
fix(frontend): resolve Ant Design form validation issues
style(frontend): update LoginPage component styling

# 后端相关
feat(backend): add K-TAS service API endpoints
fix(backend): resolve SQLAlchemy async session handling
perf(backend): optimize PostgreSQL vector search performance

# 容器化相关
chore(docker): update docker-compose health check intervals
feat(docker): add pgAdmin service to development environment

# 文档系统
docs: complete 13_development_workflow.md learning guide
docs: update API specification for authentication endpoints

# 设计规范
design: finalize mobile responsive breakpoints
design: update component development standards

# 依赖管理
chore(deps): upgrade React Router to version 7.9.4
chore(deps): add python-jose for JWT token handling
```

#### **Subject 主题编写规范**

**项目实例**：

```bash
# ============================================================================
# ✅ 良好的Subject示例（InnoLiber实际使用）
# ============================================================================

# 1. 使用祈使句
feat(backend): implement password hashing with bcrypt
# ✅ "implement" 而非 "implemented" 或 "implementing"

# 2. 首字母小写
feat(frontend): add ProposalCard hover effects
# ✅ "add" 而非 "Add"

# 3. 结尾不加句号
fix(docker): resolve postgres container startup issue
# ✅ 不使用 "resolve postgres container startup issue."

# 4. 简明扼要（≤50字符）
feat(backend): add JWT auth middleware
# ✅ 简洁明了，47字符

# 5. 标注Phase信息
feat(frontend): implement Dashboard layout (Phase 1.1)
# ✅ 明确标注开发阶段

# ============================================================================
# ❌ 不良示例
# ============================================================================

update files                           # 太模糊，无法理解具体改动
完成了用户认证功能                       # 使用中文，不符合国际化标准
feat: added authentication               # 缺少scope，无法定位模块
feat(frontend): Add Login Page.         # 首字母大写，结尾有句号
feat(backend): implement user authentication system with JWT tokens and password hashing using bcrypt algorithm for secure login and registration functionality
# 超过50字符，过于冗长
```

---

### 3. 分支管理策略 = 城市道路规划

**类比**：Git分支就像城市的道路系统，主干道（main）、支路（feature）、快速通道（hotfix）各司其职。

**项目分支策略**（基于Context7查询结果）：

```bash
# ============================================================================
# InnoLiber 分支命名规范
# ============================================================================

# 1. 主分支（Main Branches）
main                    # 🎯 生产环境分支，稳定可发布
develop                 # 🔄 开发集成分支（如果使用）

# 2. 功能开发分支（Feature Branches）
feature/user-authentication      # ✅ 新功能开发
feature/proposal-crud           # ✅ 标书CRUD功能
feature/k-tas-service           # ✅ K-TAS服务实现
feat/mobile-responsive          # ✅ 简写形式也可接受

# 3. 错误修复分支（Bugfix Branches）
bugfix/dashboard-layout         # ✅ 一般bug修复
fix/database-connection         # ✅ 简写形式
bugfix/issue-123-form-validation  # ✅ 关联Issue编号

# 4. 紧急修复分支（Hotfix Branches）
hotfix/security-patch-jwt       # 🚨 紧急生产问题
hotfix/critical-memory-leak     # 🚨 严重性能问题

# 5. 发布准备分支（Release Branches）
release/v1.0.0                  # 🚀 版本发布准备
release/v1.2.0-beta.1           # 🚀 测试版本

# 6. 维护分支（Chore Branches）
chore/update-dependencies       # 🔧 依赖更新
chore/improve-documentation     # 🔧 文档改进
```

**InnoLiber 分支工作流实例**：

```bash
# ============================================================================
# 完整的功能开发流程示例
# ============================================================================

# 场景：开发Phase 2.2认证系统
# 开发者：张三

# 1. 从main分支创建功能分支
git checkout main
git pull origin main                    # 确保本地main是最新的
git checkout -b feature/user-authentication

# 2. 开发过程中的分阶段提交
# 第一步：实现密码哈希
vim backend/app/core/security.py
git add backend/app/core/security.py
git commit -m "feat(backend): implement password hashing with bcrypt (Phase 2.2)"

# 第二步：创建JWT中间件
vim backend/app/core/dependencies.py
git add backend/app/core/dependencies.py
git commit -m "feat(backend): add JWT authentication dependency injection (Phase 2.2)"

# 第三步：实现认证API
vim backend/app/api/v1/auth.py
git add backend/app/api/v1/auth.py
git commit -m "feat(backend): add registration and login endpoints (Phase 2.2)"

# 3. 推送分支并创建Pull Request
git push origin feature/user-authentication

# 4. 通过GitHub/GitLab界面创建PR，等待代码审查

# 5. 审查通过后合并到main
# git checkout main
# git merge --no-ff feature/user-authentication
# git branch -d feature/user-authentication
```

**分支命名验证规则**（基于Context7查询结果）：

```yaml
# ============================================================================
# 分支命名自动化验证配置
# ============================================================================
# .commitcheckrc.yml
checks:
  branch:
    - check: branch_pattern
      pattern: ^(main|master|develop|feature\/|feat\/|bugfix\/|fix\/|hotfix\/|release\/|chore\/)
      error: |
        Invalid branch name format.

        Your branch: {branch}

        Valid formats:
          • feature/description or feat/description
          • bugfix/description or fix/description
          • hotfix/description
          • release/vX.Y.Z
          • chore/description

        Example: feature/add-payment-gateway

    - check: branch_format
      pattern: ^[a-z0-9\/\.\-]+
      error: |
        Branch name contains invalid characters.
        Use only lowercase letters (a-z), numbers (0-9), hyphens (-), and dots (.)

    - check: no_consecutive_separators
      pattern: ^(?!.*(-{2}|\.{2}))
      error: "Branch name cannot contain consecutive hyphens or dots"
```

---

### 4. Context7 文档查询工作流 = 智能图书馆系统

**类比**：Context7就像智能图书馆，可以快速找到最新、最准确的技术文档。

**Context7集成工作流**（来自 `CLAUDE.md:804-870`）：

#### **什么时候使用Context7？**

**项目实例**（基于InnoLiber实际开发）：

```bash
# ============================================================================
# ✅ 必须使用Context7的场景
# ============================================================================

# 场景1：开始新Phase开发
# 例如：Phase 2.2 - 认证系统实现
# 需要查询：FastAPI认证、JWT、bcrypt等技术栈

# 场景2：使用新库或升级版本
# 例如：升级SQLAlchemy到2.0.35
# 需要查询：异步API变更、兼容性问题

# 场景3：遇到API使用问题
# 例如：OAuth2PasswordBearer配置错误
# 需要查询：FastAPI Security文档

# 场景4：实现复杂功能
# 例如：向量相似度搜索（K-TAS服务）
# 需要查询：pgvector使用方法、PyTorch集成
```

#### **Context7查询最佳实践**

**项目实例**：

```bash
# ============================================================================
# Context7查询工作流程示例
# ============================================================================

# 场景：实现Phase 2.2认证系统

# Step 1: 识别涉及的技术栈
技术栈清单：
- FastAPI Security (OAuth2PasswordBearer)
- python-jose (JWT处理)
- passlib (密码哈希)
- SQLAlchemy (用户模型)

# Step 2: 查找Context7库ID
mcp__context7__resolve-library-id(libraryName: "FastAPI")
# 返回：/tiangolo/fastapi

# Step 3: 获取相关文档
mcp__context7__get-library-docs(
  context7CompatibleLibraryID: "/tiangolo/fastapi",
  topic: "security authentication oauth2 jwt",
  tokens: 8000
)

# Step 4: 从文档中提取关键信息
从Context7文档中学到：
- ✅ OAuth2PasswordBearer需要指定tokenUrl="token"
- ✅ JWT令牌验证需要显式指定algorithms=["HS256"]
- ✅ 密码验证使用CryptContext(schemes=["bcrypt"], deprecated="auto")
- ⚠️ jose.jwt.decode在v3.3.0+需要algorithms参数

# Step 5: 在代码中应用并添加参考注释
```

**实际代码应用示例**：

```python
# ============================================================================
# backend/app/core/security.py - 基于Context7文档实现
# ============================================================================

# Reference: Context7 - FastAPI /tiangolo/fastapi
# OAuth2PasswordBearer用法参见：Security - OAuth2

from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

# 🔑 OAuth2PasswordBearer配置（基于Context7文档）
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="token"  # ✅ Context7文档指出必须指定tokenUrl
)

# 🔑 密码哈希配置（基于Context7 passlib文档）
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"  # ✅ Context7建议的最佳实践
)

# 🔑 JWT令牌生成（基于Context7 python-jose文档）
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})

    # ✅ Context7文档强调：v3.3.0+必须指定algorithms
    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM  # ✅ 显式指定算法
    )
    return encoded_jwt

def verify_token(token: str):
    try:
        # ✅ Context7文档：解码时必须指定algorithms参数
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]  # ✅ 关键：指定算法列表
        )
        return payload
    except JWTError:
        return None
```

#### **Context7技术栈映射表**

**InnoLiber项目常用查询**：

| InnoLiber功能模块 | 涉及技术栈 | Context7库ID | 查询Topic |
|------------------|-----------|-------------|-----------|
| **认证系统** | FastAPI, python-jose, passlib | `/tiangolo/fastapi` | security oauth2 jwt |
| **数据库操作** | SQLAlchemy, asyncpg | `/sqlalchemy/sqlalchemy` | async relationships query |
| **前端状态管理** | React, Zustand | `/pmndrs/zustand` | middleware persist devtools |
| **表单验证** | React Hook Form, Zod | `/react-hook-form/react-hook-form` | validation typescript |
| **UI组件** | Ant Design | `/ant-design/ant-design` | form table layout |
| **容器化** | Docker, Docker Compose | `/docker/compose` | multi-service networking |

---

### 5. 代码质量保证 = 生产线质检系统

**类比**：代码质量检查就像工厂的质检流水线，每道工序都有严格的标准。

#### **自动化质量检查流程**

**项目实例**（基于InnoLiber配置）：

```bash
# ============================================================================
# InnoLiber 质量检查工作流
# ============================================================================

# 后端质量检查（Python）
cd backend

# 1. 代码格式化
poetry run black .                     # 自动格式化Python代码
poetry run isort .                     # 自动排序import语句

# 2. 代码规范检查
poetry run flake8 .                    # PEP8规范检查
poetry run mypy .                      # 类型检查

# 3. 单元测试
poetry run pytest                      # 运行所有测试
poetry run pytest --cov=app            # 运行测试并生成覆盖率报告

# 4. 安全检查
poetry run bandit -r app/              # 安全漏洞扫描

# ============================================================================
# 前端质量检查（TypeScript + React）
cd frontend

# 1. 代码规范检查
npm run lint                           # ESLint检查
npm run lint:fix                       # 自动修复可修复的问题

# 2. 类型检查
npm run type-check                     # TypeScript类型检查

# 3. 单元测试
npm test                               # Jest单元测试
npm run test:coverage                  # 测试覆盖率报告

# 4. 构建验证
npm run build                          # 确保代码可以正确构建
```

#### **Git Hook集成**

**项目实例**（pre-commit配置）：

```yaml
# ============================================================================
# .pre-commit-config.yaml - 提交前自动检查
# ============================================================================
repos:
  # Python代码质量
  - repo: https://github.com/psf/black
    rev: 23.9.1
    hooks:
      - id: black
        language_version: python3.11
        files: ^backend/

  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort
        files: ^backend/

  - repo: https://github.com/pycqa/flake8
    rev: 6.1.0
    hooks:
      - id: flake8
        files: ^backend/

  # 前端代码质量
  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.51.0
    hooks:
      - id: eslint
        files: ^frontend/src/
        additional_dependencies:
          - eslint@8.51.0
          - "@typescript-eslint/eslint-plugin"
          - "@typescript-eslint/parser"

  # 通用检查
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
```

#### **Pull Request模板**

**项目实例**（`.github/pull_request_template.md`）：

```markdown
# ============================================================================
# InnoLiber Pull Request 模板
# ============================================================================

## 📋 变更概述
<!-- 简要描述这次PR的主要变更内容 -->

**相关Phase**: Phase X.Y
**变更类型**:
- [ ] 新功能 (feature)
- [ ] Bug修复 (fix)
- [ ] 文档更新 (docs)
- [ ] 重构 (refactor)
- [ ] 性能优化 (perf)
- [ ] 测试 (test)
- [ ] 构建/工具 (chore)

## 🎯 实现的功能
<!-- 详细描述实现的功能，对应开发计划中的哪些任务 -->

- [ ] 任务1：具体功能描述
- [ ] 任务2：具体功能描述
- [ ] 任务3：具体功能描述

## 🔧 技术实现
<!-- 描述关键的技术实现点和设计决策 -->

**后端变更**:
- 文件：`backend/app/core/security.py`
- 实现：JWT认证中间件，使用bcrypt密码哈希
- 参考：Context7 FastAPI Security文档

**前端变更**:
- 文件：`frontend/src/pages/LoginPage.tsx`
- 实现：登录表单，集成React Hook Form + Zod验证
- 参考：Context7 React Hook Form文档

## 🧪 测试情况
<!-- 描述测试覆盖情况 -->

**后端测试**:
- [ ] 单元测试通过 (`poetry run pytest`)
- [ ] 代码覆盖率 ≥ 80%
- [ ] 类型检查通过 (`poetry run mypy`)

**前端测试**:
- [ ] 组件测试通过 (`npm test`)
- [ ] ESLint检查通过 (`npm run lint`)
- [ ] 构建成功 (`npm run build`)

## 📚 文档更新
<!-- 列出相关的文档更新 -->

- [ ] 更新 `CLAUDE.md` 开发状态
- [ ] 更新 `docs/technical/00_development_plan.md`
- [ ] 更新 `README.md`（如有新功能/API）
- [ ] API文档更新（如有新端点）

## 🔍 代码审查要点
<!-- 指出需要审查者重点关注的地方 -->

**请重点检查**:
- 密码哈希算法的安全性配置
- JWT令牌的过期时间设置
- 前端表单验证的用户体验
- API错误处理的完整性

## 📸 截图/演示
<!-- 如果是UI相关变更，提供截图或动图 -->

**登录页面效果**:
![登录页面截图](link-to-screenshot)

## ✅ 提交前检查清单
<!-- 提交者确认清单 -->

- [ ] 所有测试通过
- [ ] 代码已格式化（black/prettier）
- [ ] 无TypeScript/MyPy错误
- [ ] 提交信息遵循Conventional Commits规范
- [ ] 相关文档已更新
- [ ] 无TODO或FIXME注释遗留
```

---

## 💻 项目中的实际应用

### 示例 1：完整的Phase开发工作流

**场景**：开发Phase 2.2认证系统

```bash
# ============================================================================
# Phase 2.2 开发工作流完整示例
# ============================================================================

# --------------------------------------------------------------------------
# 🔍 Phase 1: 开发前检查
# --------------------------------------------------------------------------

# Step 1: 检查开发计划
cat docs/technical/00_development_plan.md | grep "Phase 2.2"
# 输出：
# **Phase 2.2**: 认证系统实现 (开始时间: 2025-11-15)
# **前置条件**: Phase 2.1完成 ✅
# **主要任务**:
#   - 实现JWT认证中间件
#   - 创建注册/登录API
#   - 实现密码哈希和验证

# Step 2: Context7文档查询
# 识别技术栈：FastAPI Security, python-jose, passlib
mcp__context7__resolve-library-id(libraryName: "FastAPI")
mcp__context7__get-library-docs(
  context7CompatibleLibraryID: "/tiangolo/fastapi",
  topic: "security oauth2 jwt authentication",
  tokens: 8000
)

# Step 3: 确认外部依赖
# ✅ 数据库已启动（Phase 2.1）
# ✅ 用户模型已创建（Phase 2.1）
# ❌ 需要安装新依赖

# --------------------------------------------------------------------------
# 💻 Phase 2: 开发执行
# --------------------------------------------------------------------------

# Step 1: 创建功能分支
git checkout main
git pull origin main
git checkout -b feature/user-authentication

# Step 2: 安装依赖
cd backend
poetry add python-jose[cryptography] passlib[bcrypt]

# Step 3: 实现认证核心模块
# 参考Context7文档实现密码哈希
vim backend/app/core/security.py
git add backend/app/core/security.py
git commit -m "feat(backend): implement password hashing with bcrypt (Phase 2.2)"

# 参考Context7文档实现JWT依赖注入
vim backend/app/core/dependencies.py
git add backend/app/core/dependencies.py
git commit -m "feat(backend): add JWT authentication dependencies (Phase 2.2)"

# Step 4: 实现API端点
vim backend/app/api/v1/auth.py
git add backend/app/api/v1/auth.py
git commit -m "feat(backend): add registration and login endpoints (Phase 2.2)"

# Step 5: 添加单元测试
vim backend/tests/test_auth.py
git add backend/tests/test_auth.py
git commit -m "test(backend): add authentication API tests (Phase 2.2)"

# --------------------------------------------------------------------------
# ✅ Phase 3: 开发后检查
# --------------------------------------------------------------------------

# Step 1: 运行质量检查
poetry run black .                 # 代码格式化
poetry run pytest                  # 单元测试
poetry run mypy .                  # 类型检查

# Step 2: 更新文档
vim CLAUDE.md
# 更新内容：
# **Phase 2 In Progress** 🔄 (60% Complete):
# - ✅ Phase 2.1 - 数据库迁移配置 (100%)
# - ✅ Phase 2.2 - 认证系统实现 (100%)  # ← 新增
# - ⏳ Phase 2.3 - 标书CRUD API (0%)

git add CLAUDE.md
git commit -m "docs: update Phase 2.2 completion status"

vim docs/technical/00_development_plan.md
# 添加开发记录：
# ### 2025-11-15
# **主要成果**:
# - ✅ 完成Phase 2.2认证系统实现
# - ✅ 实现JWT认证中间件和密码哈希

git add docs/technical/00_development_plan.md
git commit -m "docs: record Phase 2.2 development completion"

# Step 3: 推送分支并创建PR
git push origin feature/user-authentication
```

---

### 示例 2：代码审查最佳实践

**项目实例**（基于InnoLiber团队协作）：

```bash
# ============================================================================
# 代码审查工作流程
# ============================================================================

# --------------------------------------------------------------------------
# 🔍 审查者工作流程
# --------------------------------------------------------------------------

# Step 1: 获取PR代码
git fetch origin
git checkout feature/user-authentication
git diff main...feature/user-authentication

# Step 2: 本地验证功能
# 启动开发环境
docker-compose up -d postgres redis
cd backend
poetry run uvicorn app.main:app --reload

# 测试认证功能
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","full_name":"Test User"}'

curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Step 3: 代码质量检查
cd backend
poetry run pytest                  # ✅ 所有测试通过
poetry run black --check .         # ✅ 代码格式符合标准
poetry run mypy .                  # ✅ 无类型错误
poetry run bandit -r app/          # ✅ 无安全漏洞

# Step 4: 审查关键代码
# 检查密码哈希实现
cat backend/app/core/security.py
# ✅ 使用bcrypt算法
# ✅ rounds=12，安全强度足够
# ✅ 参考了Context7 FastAPI文档

# 检查JWT实现
cat backend/app/core/dependencies.py
# ✅ 明确指定algorithms=["HS256"]
# ✅ 令牌过期时间设置为24小时
# ✅ 错误处理完整

# --------------------------------------------------------------------------
# 📝 审查反馈示例
# --------------------------------------------------------------------------

# ✅ 正面反馈
代码质量很好，有以下亮点：
1. 严格遵循Context7文档建议，JWT实现安全可靠
2. 密码哈希使用bcrypt算法，安全强度充足
3. API错误处理完整，用户体验良好
4. 单元测试覆盖率达到95%

# 🔧 改进建议
建议优化以下几点：
1. line 45: 建议添加速率限制，防止暴力破解
2. line 78: JWT Secret应该从环境变量读取，不要硬编码
3. 建议添加登录失败次数限制和账户锁定机制

# ✅ 批准条件
修复安全相关建议后可以合并。

# --------------------------------------------------------------------------
# 🔄 开发者响应流程
# --------------------------------------------------------------------------

# Step 1: 修复审查意见
vim backend/app/core/security.py
# 修复：JWT Secret从环境变量读取

vim backend/app/core/config.py
# 添加：JWT_SECRET_KEY配置

vim backend/app/api/v1/auth.py
# 添加：速率限制中间件

git add .
git commit -m "fix(backend): address security review feedback (Phase 2.2)"

# Step 2: 推送更新
git push origin feature/user-authentication
# GitHub自动更新PR，通知审查者
```

---

### 示例 3：多人协作工作流

**场景**：团队同时开发多个功能

```bash
# ============================================================================
# 多人协作场景
# ============================================================================

# 开发者A：负责后端认证（Phase 2.2）
git checkout -b feature/backend-auth
# ... 开发认证API ...
git commit -m "feat(backend): implement JWT authentication (Phase 2.2)"

# 开发者B：负责前端登录页（Phase 1.4）
git checkout -b feature/frontend-login
# ... 开发登录组件 ...
git commit -m "feat(frontend): implement LoginPage component (Phase 1.4)"

# 开发者C：负责Docker优化（DevOps改进）
git checkout -b chore/docker-optimization
# ... 优化容器配置 ...
git commit -m "chore(docker): optimize multi-stage builds for faster deployment"

# --------------------------------------------------------------------------
# 🔄 集成和解决冲突
# --------------------------------------------------------------------------

# 场景：A和B的分支都需要合并到main

# Step 1: A先完成开发，创建PR，通过审查，合并到main
git checkout main
git merge --no-ff feature/backend-auth
git branch -d feature/backend-auth

# Step 2: B需要更新自己的分支以包含A的更改
git checkout feature/frontend-login
git rebase main                    # 或者 git merge main

# 如果有冲突，解决冲突：
# 冲突文件：backend/app/api/__init__.py
# <<<<<<< HEAD
# from .auth import router as auth_router  # B的更改
# =======
# from .authentication import router as auth_router  # A的更改（已在main中）
# >>>>>>> main

# 解决冲突后：
git add .
git rebase --continue              # 或者 git commit（如果使用merge）

# Step 3: B推送更新后的分支，创建PR
git push origin feature/frontend-login --force-with-lease

# --------------------------------------------------------------------------
# 📊 项目进度同步
# --------------------------------------------------------------------------

# 每日站会前，同步项目状态
git checkout main
git pull origin main

# 查看最近的开发进度
git log --oneline --since="1 day ago"
# 输出示例：
# abc123f feat(backend): implement JWT authentication (Phase 2.2)
# def456g feat(frontend): add ProposalCard responsive design (Phase 1.3)
# ghi789h docs: update Phase 2.2 completion status
# jkl012m chore(deps): upgrade SQLAlchemy to 2.0.35

# 检查当前所有活跃分支
git branch -a
# 输出示例：
# * main
#   feature/frontend-login
#   remotes/origin/feature/k-tas-service
#   remotes/origin/feature/proposal-crud
```

---

## 🎯 快速上手指南

### Step 1：环境配置

```bash
# 1. 克隆项目
git clone https://github.com/your-org/InnoLiber.git
cd InnoLiber

# 2. 配置Git用户信息
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 3. 安装pre-commit hooks（可选）
pip install pre-commit
pre-commit install
```

### Step 2：开始新功能开发

```bash
# 1. 查看开发计划
cat docs/technical/00_development_plan.md
# 确认当前Phase和可认领的任务

# 2. 创建功能分支（遵循命名规范）
git checkout -b feature/your-feature-name

# 3. 查询Context7文档（如需要）
# 例如：开发React组件
# mcp__context7__resolve-library-id(libraryName: "React")
# mcp__context7__get-library-docs(...)
```

### Step 3：开发过程中的最佳实践

```bash
# 1. 小粒度提交
git add specific_file.py
git commit -m "feat(backend): implement user model validation (Phase 2.1)"

# 2. 定期推送
git push origin feature/your-feature-name

# 3. 保持分支更新
git fetch origin main
git rebase origin/main    # 或 git merge origin/main
```

### Step 4：完成开发后的工作流

```bash
# 1. 最终质量检查
npm run lint              # 前端
poetry run pytest        # 后端

# 2. 更新相关文档
vim CLAUDE.md
vim docs/technical/00_development_plan.md

# 3. 创建Pull Request
git push origin feature/your-feature-name
# 通过GitHub/GitLab界面创建PR

# 4. 等待代码审查和合并
```

---

## ⚠️ 常见陷阱（新手必看）

### 陷阱 1：提交信息不规范

```bash
# ❌ 错误示例
git commit -m "update files"           # 太模糊
git commit -m "完成了登录功能"           # 使用中文
git commit -m "Add new features."       # 首字母大写，有句号
git commit -m "feat: added login page and fixed some bugs and updated documentation"  # 太长，混合多种变更

# ✅ 正确示例
git commit -m "feat(frontend): implement LoginPage component (Phase 1.4)"
git commit -m "fix(backend): resolve JWT token validation error"
git commit -m "docs: update API specification for auth endpoints"
git commit -m "chore(deps): upgrade React Router to 7.9.4"
```

---

### 陷阱 2：分支命名不规范

```bash
# ❌ 错误示例
git checkout -b login-page              # 缺少类型前缀
git checkout -b Feature/Login           # 大写字母
git checkout -b fix_bug                 # 下划线
git checkout -b feature/New-Login-Page  # 大写字母

# ✅ 正确示例
git checkout -b feature/login-page
git checkout -b bugfix/form-validation
git checkout -b hotfix/security-patch
git checkout -b chore/update-dependencies
```

---

### 陷阱 3：忘记查询Context7文档

```bash
# ❌ 错误：直接开始编码
# 问题：可能使用过时的API或不安全的实现

# ✅ 正确：开发前查询文档
# 特别是以下场景：
# - 使用新的库或框架
# - 实现安全相关功能（认证、加密等）
# - 升级依赖版本
# - 遇到API使用问题

# 示例：实现JWT认证前的查询
mcp__context7__resolve-library-id(libraryName: "FastAPI")
mcp__context7__get-library-docs(
  context7CompatibleLibraryID: "/tiangolo/fastapi",
  topic: "security oauth2 jwt",
  tokens: 6000
)
```

---

### 陷阱 4：提交粒度不合理

```bash
# ❌ 错误：提交粒度过大
git add .
git commit -m "feat(backend): implement complete authentication system with JWT tokens and password hashing and user registration and login endpoints and database models"
# 问题：一次提交包含太多功能，难以回滚和调试

# ❌ 错误：提交粒度过小
git commit -m "fix: add semicolon"
git commit -m "fix: remove whitespace"
git commit -m "fix: fix typo"
# 问题：提交历史混乱，没有实际意义

# ✅ 正确：合理的提交粒度
git commit -m "feat(backend): implement password hashing with bcrypt (Phase 2.2)"
git commit -m "feat(backend): add JWT token generation and validation (Phase 2.2)"
git commit -m "feat(backend): implement user registration endpoint (Phase 2.2)"
git commit -m "feat(backend): implement login endpoint with JWT response (Phase 2.2)"
```

---

### 陷阱 5：忘记更新文档

```bash
# ❌ 错误：完成开发但不更新文档
# 结果：其他团队成员不知道新功能的存在和使用方法

# ✅ 正确：开发完成后及时更新文档
# 需要更新的文档：
# 1. CLAUDE.md - 开发进度状态
# 2. docs/technical/00_development_plan.md - Phase完成情况
# 3. README.md - 新功能、API端点、安装说明
# 4. API文档 - 新增的API端点

# 示例：完成认证功能后的文档更新
vim CLAUDE.md
# 更新：**Phase 2.2** - 认证系统实现 ✅

vim README.md
# 添加：
# ### API Endpoints
# - POST /api/v1/auth/register - 用户注册
# - POST /api/v1/auth/login - 用户登录
```

---

### 陷阱 6：代码审查流程不当

```bash
# ❌ 错误：直接推送到main分支
git checkout main
git add .
git commit -m "feat: add new features"
git push origin main
# 问题：跳过了代码审查，可能引入bug和安全问题

# ✅ 正确：通过Pull Request流程
git checkout -b feature/new-feature
# ... 开发功能 ...
git push origin feature/new-feature
# 创建PR，等待代码审查和批准后再合并

# ❌ 错误：忽略审查意见
# 审查者提出改进建议后，不予回应或修复

# ✅ 正确：积极响应审查意见
# 1. 认真阅读审查意见
# 2. 修复代码问题
# 3. 推送更新
# 4. 回复审查者说明修改内容
```

---

### 陷阱 7：环境不一致导致的问题

```bash
# ❌ 错误：本地环境和CI/CD环境不一致
# 本地：Python 3.10，依赖版本松散
# CI/CD：Python 3.11，依赖版本严格
# 结果：本地测试通过，CI/CD失败

# ✅ 解决方案：使用Docker统一环境
docker-compose up -d                   # 使用与CI相同的环境
docker-compose exec backend bash       # 在容器内运行测试
poetry run pytest                      # 确保测试在标准环境中通过

# ✅ 解决方案：使用Poetry锁定依赖版本
poetry lock                           # 锁定依赖版本
git add poetry.lock                   # 提交锁文件
git commit -m "chore(deps): update poetry lock file"
```

---

## 📚 学习资源

### 官方资源
- **Git官方文档**：https://git-scm.com/docs
- **Context7查询结果**：`/websites/git-scm` (已查询)
- **Conventional Commits规范**：https://www.conventionalcommits.org/
- **Context7查询结果**：`/websites/conventional-branch_github_io` (已查询)

### 项目中的参考文件
- **工作流程规范**：`CLAUDE.md` (第400-1100行) - 完整开发工作流
- **开发计划文档**：`docs/technical/00_development_plan.md` - Phase任务清单
- **项目配置**：`pyproject.toml`, `package.json` - 代码质量配置
- **容器配置**：`docker-compose.yml` - 开发环境标准化

### 进阶学习主题
- **Git Flow vs GitHub Flow**：不同的分支管理策略对比
- **代码审查最佳实践**：如何进行有效的代码审查
- **CI/CD集成**：GitHub Actions/GitLab CI与工作流程集成
- **自动化测试策略**：单元测试、集成测试、端到端测试

---

## 🎯 实践练习建议

### 练习 1：规范提交信息

```bash
# 场景：你刚修复了一个前端表单验证的bug
# 练习写出规范的提交信息

# 你的提交信息：
git commit -m "____________________"

# 标准答案：
git commit -m "fix(frontend): resolve form validation error in LoginPage"
```

### 练习 2：分支命名规范

```bash
# 场景：你要开发一个新的用户设置页面
# 练习创建规范的分支名

# 你的分支名：
git checkout -b ____________________

# 标准答案：
git checkout -b feature/user-settings-page
```

### 练习 3：完整的开发工作流

```bash
# 场景：开发一个简单的API端点
# 练习完整的工作流程

# 1. 创建分支：____________________
# 2. 查询Context7文档（如需要）
# 3. 编写代码并提交：____________________
# 4. 运行测试：____________________
# 5. 更新文档：____________________
# 6. 创建PR并等待审查

# 参考答案：
# 1. git checkout -b feature/health-check-endpoint
# 2. mcp__context7__get-library-docs(context7CompatibleLibraryID: "/tiangolo/fastapi", topic: "health check endpoint")
# 3. git commit -m "feat(backend): add health check endpoint (Phase 2.1)"
# 4. poetry run pytest
# 5. 更新README.md中的API文档
# 6. git push origin feature/health-check-endpoint
```

---

## ✅ 学习检查清单

完成以下任务，说明你已经掌握 InnoLiber 开发工作流程：

### 基础工作流程
- [ ] **理解开发周期**：能解释开发前检查、开发执行、文档更新、代码提交四个阶段
- [ ] **掌握Git规范**：能编写符合Conventional Commits标准的提交信息
- [ ] **掌握分支策略**：会创建规范的功能分支（feature/、bugfix/、hotfix/等）
- [ ] **会使用Context7**：知道何时查询技术文档，如何应用到实际开发中

### 代码质量保证
- [ ] **会运行质量检查**：掌握前后端代码格式化、测试、类型检查命令
- [ ] **理解pre-commit hooks**：知道如何配置和使用自动化代码检查
- [ ] **会创建规范的PR**：能填写完整的Pull Request描述和检查清单
- [ ] **会进行代码审查**：能提出建设性的审查意见和响应审查反馈

### 团队协作
- [ ] **理解协作流程**：掌握多人开发时的分支管理和冲突解决
- [ ] **会更新项目文档**：完成开发后及时更新CLAUDE.md、开发计划等文档
- [ ] **会同步开发进度**：能查看项目状态、Phase进度和团队成员的开发情况
- [ ] **能避免常见陷阱**：提交粒度、文档更新、环境一致性等问题

### 项目特色理解
- [ ] **理解Phase开发模式**：知道如何按照开发计划的Phase进行任务分解
- [ ] **掌握Context7集成**：能在开发前查询相关技术文档，应用最佳实践
- [ ] **理解外部依赖管理**：知道如何标注和跟踪项目所需的外部资源
- [ ] **会维护学习文档**：理解技术学习文档的价值和维护方法

---

## 🎓 下一步学习

完成本文档后，建议：

1. **实践应用**：在实际开发中严格遵循工作流程规范
2. **工具定制**：根据个人习惯配置Git别名、IDE插件等提效工具
3. **持续改进**：定期回顾工作流程，识别可优化的环节
4. **分享经验**：向团队分享工作流程中的心得和最佳实践

---

## 🚀 实际项目应用

**在 InnoLiber 项目中的核心价值**：

1. **确保开发质量**：通过标准化流程和自动化检查，保证代码质量一致性
2. **提高协作效率**：清晰的分支策略和提交规范，减少团队沟通成本
3. **支撑快速迭代**：Phase化开发模式，支持敏捷开发和快速交付
4. **积累技术资产**：Context7集成和文档同步更新，形成可复用的知识库

**项目特色实践**：
- ✅ **Phase驱动开发**：按照开发计划的Phase进行任务分解和进度跟踪
- ✅ **Context7技术查询**：开发前必须查询相关技术文档，应用最新最佳实践
- ✅ **文档驱动协作**：开发完成后强制更新CLAUDE.md和技术文档
- ✅ **质量门禁机制**：pre-commit hooks + Pull Request审查双重保障

**常用命令速查**：
```bash
# 开发工作流
git checkout -b feature/your-feature-name    # 创建功能分支
git commit -m "feat(scope): description (Phase X.Y)"  # 规范提交
git push origin feature/your-feature-name    # 推送分支

# 质量检查
poetry run black . && poetry run pytest     # 后端检查
npm run lint && npm test                     # 前端检查

# Context7查询
mcp__context7__resolve-library-id(libraryName: "技术栈名称")
mcp__context7__get-library-docs(context7CompatibleLibraryID: "/org/project", topic: "相关主题")

# 分支管理
git fetch origin main && git rebase origin/main  # 更新分支
git branch -d feature/completed-feature      # 删除已合并分支

# 文档更新
vim CLAUDE.md                               # 更新开发状态
vim docs/technical/00_development_plan.md   # 更新Phase进度
vim README.md                               # 更新功能说明
```

---

**文档版本**：v1.0
**最后更新**：2025-11-15
**维护者**：InnoLiber Team
**参考来源**：Context7 - Git文档、Conventional Commits规范、项目实际开发实践

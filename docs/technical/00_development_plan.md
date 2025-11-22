# InnoLiber 技术开发计划文档

**版本**: v1.2
**创建日期**: 2025-10-28
**更新日期**: 2025-11-12
**状态**: 执行中

---

## 📋 项目概述

### 项目名称
**InnoLiber** - 科研基金申请智能助理系统

### 产品定位
- **类型**: 商业产品级别的AI Agent系统
- **目标用户**: 职业早期科研研究者（ECR）
- **核心价值**: 提升NSFC申请书质量，实现高能动性AI助理

### 技术特点
- **高能动性Agent**: 具备自主决策和建议能力
- **三大核心服务**: K-TAS（分析）+ SPG-S（生成）+ DDC-S（合规）
- **Monorepo架构**: 统一代码管理，静态分析友好
- **类型安全**: 全栈TypeScript/Python类型安全

---

## 🎯 技术栈决策（已确认）

### 后端技术栈
| 组件 | 选定技术 | 版本 | 确认状态 |
|------|---------|------|---------|
| **运行时** | Python | 3.11 | ✅ 确认 |
| **Web框架** | FastAPI | 0.118.2+ | ✅ 确认 |
| **数据库** | PostgreSQL | 16+ | ✅ 确认 |
| **向量搜索** | pgvector | 最新版 | ✅ 确认 |
| **数据库驱动** | asyncpg | 0.29+ | ✅ 确认 |
| **ORM** | SQLAlchemy | 2.0+ | ✅ 确认 |
| **AI推理** | PyTorch | 2.5.1 | ✅ 确认 |
| **LLM调用** | OpenAI SDK | 1.68+ | ✅ 确认 |
| **依赖管理** | Poetry | 最新版 | ✅ 确认 |

### 前端技术栈（已确认 + 扩展）
| 组件 | 选定技术 | 版本 | 确认状态 |
|------|---------|------|---------|
| **框架** | React | 18+ | ✅ 确认 |
| **类型系统** | TypeScript | 5+ | ✅ 确认 |
| **UI库** | Ant Design | 5+ | ✅ 确认 |
| **构建工具** | Vite | 5+ | ✅ 确认 |
| **状态管理** | Zustand | 4+ | ✅ 确认 |
| **表单处理** | React Hook Form + Zod | 最新版 | ✅ 确认 |
| **富文本编辑器** | Quill.js (react-quill) | 2.0+ | ✅ 确认 |
| **图表库** | Recharts | 2.13+ | ✅ 确认 |
| **工具库** | lodash | 4.17+ | ✅ 确认 |
| **包管理** | npm/yarn | 最新版 | ✅ 确认 |

### 基础设施（已确认）
| 组件 | 选定技术 | 确认状态 |
|------|---------|---------|
| **云服务商** | 阿里云 | ✅ 确认 |
| **认证方式** | 简化JWT | ✅ 确认 |
| **容器化** | Docker + Docker Compose | ✅ 确认 |
| **CI/CD** | GitHub Actions | ✅ 确认 |

---

## 🏗️ 项目架构

### Monorepo目录结构
```
InnoLiber/
├── docs/                    # 📚 文档中心
├── backend/                 # 🐍 Python后端服务
├── frontend/                # ⚛️ React前端应用
├── data/                    # 📊 RDR数据资源
├── tools/                   # 🔧 工程工具
├── .env.template           # 🔑 环境变量模板
├── docker-compose.yml      # 🐳 本地开发环境
└── README.md               # 📖 项目说明
```

### 三大核心服务架构
```
┌─────────────────────────────────────────────────────────┐
│                    前端界面层                              │
│              React + Ant Design                       │
└─────────────────────────────────────────────────────────┘
                            │ HTTP API
┌─────────────────────────────────────────────────────────┐
│                   FastAPI 网关层                         │
│              路由 + 认证 + 参数验证                        │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼─────┐    ┌────────▼────────┐    ┌────▼─────┐
│  K-TAS服务   │    │   SPG-S服务      │    │ DDC-S服务 │
│   知识分析   │    │   内容生成       │    │  格式合规 │
│              │    │                 │    │          │
│ • 趋势识别   │    │ • LLM调用       │    │ • 规则检查│
│ • 文献聚类   │    │ • 结构化生成     │    │ • 自动修正│
│ • 语义检索   │    │ • 可行性建议     │    │ • 格式输出│
└─────────────┘    └─────────────────┘    └──────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                PostgreSQL数据层                          │
│         proposals + corpus + embeddings              │
│              MVCC + pgvector索引                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📅 开发阶段计划

### 阶段0：基础设施搭建（2-3天）✅ 已完成
**目标**: 完成项目骨架和核心文档

**完成日期**: 2025-10-29

**已完成任务**:
- [x] 技术栈调研与确认
- [x] 项目架构设计
- [x] 开发计划文档创建
- [x] 技术栈详细文档
- [x] 数据库设计文档
- [x] API接口规范文档
- [x] 前端设计原型及方案确认（方案A）
- [x] 创建完整Monorepo目录结构
- [x] 配置Docker开发环境（PostgreSQL + Redis + pgAdmin）
- [x] 环境变量模板创建
- [x] 后端FastAPI框架搭建
- [x] 前端React+TypeScript+Ant Design框架搭建
- [x] 数据库模型定义（User, Proposal）
- [x] 首页完整实现（Dashboard + 相关组件）

**完成日期**: 2025-10-29

**技术成果清单**:

1. **项目结构**
   - Monorepo架构完成
   - 前后端分离结构
   - 文档系统建立

2. **开发环境**
   - Docker Compose配置完成
   - PostgreSQL 16 + pgvector
   - Redis缓存服务
   - pgAdmin数据库管理工具
   - 一键启动脚本（start-dev.bat）

3. **后端基础**
   - FastAPI应用框架: `backend/app/main.py`
   - 核心配置系统: `backend/app/core/config.py`
   - SQLAlchemy数据模型:
     - User模型: `backend/app/models/user.py`
     - Proposal模型: `backend/app/models/proposal.py`
   - Poetry依赖管理: `backend/pyproject.toml`

4. **前端基础**
   - React 18 + TypeScript 5 + Vite配置
   - Ant Design 5集成和主题定制
   - React Router路由系统
   - TypeScript类型系统: `frontend/src/types/index.ts`
   - Axios API服务: `frontend/src/services/api.ts`
   - Zustand状态管理: `frontend/src/store/proposalStore.ts`

5. **首页完整实现**
   - 侧边栏布局: `frontend/src/components/SidebarLayout.tsx`
   - 仪表板页面: `frontend/src/pages/Dashboard.tsx`
   - 标书卡片: `frontend/src/components/ProposalCard.tsx`
   - 状态标签: `frontend/src/components/StatusTag.tsx`
   - 质量评分: `frontend/src/components/QualityScore.tsx`
   - 自定义Hook: `frontend/src/hooks/useProposals.ts`
   - 全局样式: `frontend/src/styles/global.css`

6. **文档体系**
   - 快速启动指南: `QUICK_START.md`
   - 前端设计方案: `docs/design/frontend_prototypes.md`
   - **完整页面设计**: `docs/design/frontend_pages_complete.md`
   - **响应式设计指南**: `docs/design/responsive_design_guide.md`
   - **组件开发规范**: `docs/design/component_development_standards.md`
   - 图标需求清单: `docs/design/icon_requirements.md`
   - 开发计划: `docs/technical/00_development_plan.md`
   - 技术栈文档: `docs/technical/01_tech_stack.md`
   - 数据库设计: `docs/technical/02_database_design.md`
   - API规范: `docs/technical/03_api_specification.md`

---

### 阶段0.5：前端设计系统完善（1天）✅ 已完成
**目标**: 创建完整的前端页面设计和开发规范

**完成日期**: 2025-10-30

**已完成任务**:
- [x] 7个核心页面完整设计（UTF-8字符原型）
- [x] 桌面端和移动端双版本设计
- [x] 响应式设计指南文档
- [x] 组件开发规范文档
- [x] 技术选型确认（Quill.js + Recharts）
- [x] 移动端适配策略制定
- [x] 更新项目文档（CLAUDE.md, README.md）

**设计成果清单**:

1. **完整页面设计** (`docs/design/frontend_pages_complete.md`)
   - 登录页（桌面端 + 移动端）
   - 注册页（桌面端 + 移动端）
   - 新建标书页（桌面端 + 移动端）
   - 标书编辑页（桌面端 + 移动端） - 最复杂
   - 标书详情页（桌面端 + 移动端）
   - 数据分析页（桌面端 + 移动端）
   - 文献库页（桌面端 + 移动端）
   - 设置页（桌面端 + 移动端）

2. **响应式设计指南** (`docs/design/responsive_design_guide.md`)
   - Ant Design Grid系统使用
   - 断点系统定义和使用策略
   - useBreakpoint Hook实践
   - 移动端优化（触摸目标、字体、间距）
   - 导航模式适配
   - 表单、表格、编辑器适配策略
   - 实用响应式Hook和工具
   - 响应式检查清单

3. **组件开发规范** (`docs/design/component_development_standards.md`)
   - 目录结构规范
   - 组件开发流程
   - 命名规范（文件、组件、变量）
   - TypeScript类型规范
   - 样式编写规范（CSS Modules推荐）
   - 可访问性（ARIA）规范
   - 状态管理规范
   - 测试规范
   - 性能优化建议

4. **技术选型文档**
   - 富文本编辑器: Quill.js (轻量、易集成)
   - 图表库: Recharts (React原生、声明式)
   - 响应式方案: Ant Design Grid + useBreakpoint
   - 无需额外依赖包

---

### 阶段0.5：Docker容器化部署（2天）✅ 已完成
**目标**: 完成生产级Docker配置和部署方案

**完成日期**: 2025-11-14

**已完成任务**:
- [x] Backend Dockerfile创建（Poetry版本）
- [x] Backend Dockerfile.conda创建（Conda版本）
- [x] Frontend Dockerfile创建（多阶段构建 + Nginx）
- [x] docker-compose.yml完整重写（开发环境）
- [x] docker-compose.prod.yml创建（生产环境）
- [x] Alembic数据库迁移配置（alembic.ini + migrations/）
- [x] 环境变量模板创建（.env.example）
- [x] .dockerignore文件创建（backend + frontend）
- [x] Nginx配置文件创建（frontend/nginx.conf）
- [x] Docker部署文档编写（04_dockerfile_implementation_plan.md）
- [x] 部署指南文档编写（05_docker_deployment_guide.md）
- [x] Dockerfile对比说明（DOCKERFILE_COMPARISON.md）

**技术成果清单**:

1. **Backend容器化**
   - 多阶段构建优化 (Builder + Runtime)
   - Poetry依赖管理集成
   - Conda环境备选方案
   - 非root用户运行 (appuser)
   - 健康检查配置
   - 最终镜像约2GB（含PyTorch）

2. **Frontend容器化**
   - Vite生产构建优化
   - Nginx静态文件服务
   - SPA路由支持 (try_files)
   - Gzip压缩配置
   - 最终镜像约50MB

3. **Docker Compose完整编排**
   - PostgreSQL 16 + pgvector
   - Redis 7 (缓存 + 消息队列)
   - Backend API服务
   - Celery Worker服务
   - Frontend Nginx服务
   - pgAdmin管理工具
   - 网络隔离和依赖管理

4. **数据库迁移系统**
   - Alembic配置完成
   - 迁移脚本目录结构
   - 版本控制准备就绪

5. **部署文档体系**
   - 实施计划文档（依赖分析、31任务清单）
   - 部署指南（快速启动、故障排查、性能调优）
   - Dockerfile对比说明（Poetry vs Conda）

**待完成项**:
- [ ] 完整集成测试（docker-compose up验证）
- [ ] 镜像构建性能优化
- [ ] CI/CD流程集成

---

### 阶段1：前端核心页面开发（5-7天）🔄 40%完成
**目标**: 完成7个核心页面的实现和响应式适配

**任务清单**:

#### 第一优先级 - 核心流程（3天）
- [x] **登录/注册页实现**（1天）✅ 已完成 (2025-11-11)
  - 左右分栏布局（桌面端）
  - 单列布局（移动端）
  - React Hook Form + Zod表单验证
  - authStore状态管理
  - JWT认证集成
  - 教育邮箱格式检测（前端提示）
  - 密码强度指示器
  - **MVP范围**: 基础登录/注册功能，暂不发送验证邮件
  - **代码预留**: 使用TODO-ALIYUN标记未来扩展功能

- [ ] **新建标书页实现**（0.5天）
  - 表单分组设计
  - 下拉选择器集成
  - AI辅助生成摘要功能
  - 表单验证和提交

- [ ] **标书编辑页实现**（2天）- 最复杂
  - Quill.js富文本编辑器集成
  - 三栏布局（桌面端）：章节导航 + 编辑器 + AI助手
  - 标签页布局（移动端）：编辑 / 建议 / 质量
  - 实时自动保存（debounce 2秒）
  - 章节进度计算
  - AI优化和建议功能UI
  - 质量评分实时显示

#### 第二优先级 - 详情与分析（2天）
- [ ] **标书详情页实现**（0.5天）
  - 信息展示卡片
  - 质量评分可视化
  - 标签页：基本信息 / 完整内容 / 参考文献 / 审阅记录
  - 操作历史时间线

- [ ] **数据分析页实现**（1天）
  - Recharts图表集成
  - 趋势分析结果展示
  - 热门研究方向列表
  - 推荐文献卡片
  - 研究空白识别

- [ ] **文献库页实现**（0.5天）
  - 文献列表展示
  - 搜索和筛选功能
  - 文献卡片设计
  - 添加到标书功能

#### 第三优先级 - 设置（0.5天）
- [ ] **设置页实现**（0.5天）
  - 个人信息编辑
  - 偏好设置（语言、主题、时区）
  - 通知设置
  - 安全设置（修改密码、双因素认证）

#### 响应式适配验证（1天）
- [ ] 所有页面xs断点测试（< 576px）
- [ ] 所有页面md断点测试（768-991px）
- [ ] 所有页面xl断点测试（≥ 1200px）
- [ ] 触摸目标尺寸验证（≥ 44px）
- [ ] 移动端导航测试
- [ ] 表单、表格、编辑器移动端测试

**技术关键点**:
- React Hook Form + Zod表单验证
- Quill.js富文本编辑器集成
- Recharts图表集成
- Ant Design响应式Grid布局
- useBreakpoint条件渲染
- Drawer抽屉导航（移动端）
- 自动保存机制（lodash debounce）

**预计完成时间**: 2025-11-06

---

### 阶段1.5：Rams 风格改造（5-7天）🔄 当前执行
**目标**: 将前端设计从现代活泼风格改造为适度 Rams 化风格

**确认日期**: 2025-11-22

#### 设计理念

基于 Dieter Rams 设计十诫的**适度 Rams 化**：
1. ✅ **创新但不炫技** - 保留 AI 功能亮点
2. ✅ **有用且诚实** - 功能明确，不夸大
3. ✅ **美学服务功能** - 视觉支持效率
4. ✅ **清晰易懂** - 减少认知负担
5. ✅ **克制但不冷漠** - 保留学术温度
6. ✅ **诚实呈现** - 开发中功能明确标注
7. ✅ **持久耐看** - 避免流行趋势
8. ✅ **细节完美** - 8px 栅格系统
9. ✅ **环保高效** - 轻量级组件
10. ✅ **尽可能少** - 每个元素都有理由

#### 配色系统更新

**主色调 - 群青色系**:
- 主色: #0437F2 (群青蓝)
- 辅助: #002B8C (深蓝) + #E6F0FF (浅蓝)
- 背景: #FAFAFA (极浅灰)
- 功能色: 保留但克制使用

**取消颜色**:
- ❌ 金色 #F59E0B (过度装饰)
- ✅ 成功/警告/错误色保留但降低饱和度

#### 图标系统更新

**从 Emoji 迁移到 Lucide Icons**:
- 📝 → FileText (标书管理)
- 📊 → BarChart3 (数据分析)
- 📚 → BookOpen (文献库)
- ⚙️ → Settings (设置)
- ✨ → Sparkles (AI 功能)
- ... 30+ 图标映射

**特点**:
- 极简线性风格 (2px 线宽)
- 一致的几何美学
- 完全开源
- 支持 Tree-shaking

#### 视觉系统更新

**8px 栅格系统**:
- 基准单位: 8px
- 间距: 8px, 16px, 24px, 32px, 48px, 64px

**统一圆角**:
- 所有组件: 4px (从 6-8px 统一)

**边框设计**:
- 卡片: 移除阴影，使用 1px #E5E5E5 边框
- 悬停: 边框变主色 #0437F2

**响应式简化**:
- 从 6 个断点简化为 3 个
- mobile (< 768px), tablet (768-1023px), desktop (≥ 1024px)

#### 实施阶段

**Phase 1.5.0: 文档整合（0.5-1天）** ✅ 已完成 (2025-11-22)
- 清理和整合现有设计文档
- 归档过时文档到 archive 目录
- 删除冗余和临时文档
- 文档数量从 33 个优化到 27 个

**Phase 1.5.1: 基础设施（0.5-1天）**
- 安装 lucide-react
- 创建 CSS 变量系统
- 配置 Ant Design 主题
- 创建图标映射

**Phase 1.5.2: 核心组件（1-1.5天）**
- Button: 简化为 primary/secondary/text
- Card: 移除阴影使用边框
- Input: 统一 40px 高度
- Tag: 细边框无背景
- Progress: 4px 高度

**Phase 1.5.3: 页面组件（1.5-2天）**
- SidebarLayout: 替换图标
- ProposalCard: 移除 emoji
- Dashboard: 使用新组件
- ProposalEditPage: 简化布局
- LoginPage/RegisterPage: 图标替换
- 其他页面: 图标和样式更新

**Phase 1.5.4: 细节优化（1-1.5天）**
- 全局样式调整
- 动画统一 (0.2s ease)
- 移动端适配验证
- 性能优化
- 代码清理

**Phase 1.5.5: 验证合并（0.5天）**
- 视觉回归测试
- 功能测试
- 性能测试
- 更新 README
- 合并到 main

#### Git 分支策略

```
main
  └── feature/phase-1.5-rams-redesign
        ├── /docs (Phase 0)
        ├── /foundation (Phase 1)
        ├── /components (Phase 2)
        ├── /pages (Phase 3)
        └── /polish (Phase 4)
```

#### 验收标准

**文档验收**:
- [x] 开发计划包含完整 Phase 1.5
- [ ] 设计文档反映 Rams 风格
- [x] 所有文档修改无遗漏

**视觉验收**:
- [ ] 主色统一 #0437F2
- [ ] emoji 全部替换为 Lucide Icons
- [ ] 卡片无阴影仅边框
- [ ] 圆角统一 4px
- [ ] 间距符合 8px 栅格

**功能验收**:
- [ ] 所有页面正常渲染
- [ ] 导航跳转正常
- [ ] 表单交互正常
- [ ] 响应式布局正常

**性能验收**:
- [ ] 图标库 Tree-shaking 生效
- [ ] 首屏加载无明显增加
- [ ] CSS 文件大小可控

#### 预计完成时间
**开始日期**: 2025-11-22
**预计完成**: 2025-11-29 (7个工作日)

---

### 阶段2：后端API实现与数据库迁移（5-7天）🔄 10%完成
**目标**: 实现完整的后端API服务、数据库迁移系统、完善的测试用例和云端部署方案

**制定日期**: 2025-11-12
**执行状态**: Phase 2.1和2.2已完成，Phase 2.3待执行

---

## Phase 1: 数据库迁移配置（0.5天）✅ 已完成（2025-11-15）

#### 1.1 Alembic初始化
- [x] 在backend目录下运行 `poetry run alembic init alembic`
- [x] 配置 `alembic.ini` 中的数据库连接字符串
- [x] 修改 `alembic/env.py` 设置target_metadata
- [x] 导入所有模型到 `alembic/env.py` 中

#### 1.2 User模型扩展
- [x] 在 `backend/app/models/user.py` 添加 email_verified 字段（已存在）
- [x] 添加 is_edu_email 字段（已存在）
- [x] 添加 verify_token 字段（预留）（已存在）
- [x] 添加 verify_token_expires 字段（预留）（已存在）
- [x] 添加 research_field 字段（已存在）
- [x] 添加 failed_login_attempts 字段（预留）（已存在）
- [x] 添加 locked_until 字段（预留）（已存在）

#### 1.3 生成并执行迁移
- [x] 运行 `poetry run alembic revision --autogenerate -m "Initial database schema"`
- [x] 运行 `poetry run alembic upgrade head` 执行迁移
- [x] 验证数据库表创建成功
- [x] 验证所有字段和索引创建正确
- [x] 验证外键约束正常工作

**额外完成**:
- [x] 升级Base模型到SQLAlchemy 2.0 (AsyncAttrs + DeclarativeBase)
- [x] 使用Context7查询Alembic和SQLAlchemy 2.0最新文档

---

## Phase 2: 认证系统实现（1.5天）✅ 已完成（2025-11-15）

#### 2.1 核心安全模块
- [x] 创建 `backend/app/core/security.py` 文件
- [x] 实现 get_password_hash 函数（bcrypt直接实现，替代passlib）
- [x] 实现 verify_password 函数
- [x] 实现 create_access_token 函数
- [x] 实现 verify_token 函数
- [x] 实现 is_edu_email 函数

#### 2.2 数据库会话管理
- [x] 创建 `backend/app/db/session.py` 文件
- [x] 配置异步数据库引擎
- [x] 创建 AsyncSessionLocal 工厂
- [x] 实现 get_db 依赖注入函数

#### 2.3 FastAPI依赖注入
- [x] 创建 `backend/app/core/dependencies.py` 文件
- [x] 实现 oauth2_scheme 依赖
- [x] 实现 get_current_user 函数
- [x] 实现 get_current_active_user 函数

#### 2.4 Pydantic Schema
- [x] 创建 `backend/app/schemas/auth.py` 文件
- [x] 定义 UserRegister model
- [x] 定义 UserLogin model
- [x] 定义 Token model
- [x] 定义 UserResponse model
- [x] 添加表单验证规则

#### 2.5 认证API路由
- [x] 创建 `backend/app/api/v1/auth.py` 文件
- [x] 实现注册端点：POST /api/v1/auth/register
- [x] 实现登录端点：POST /api/v1/auth/login
- [x] 实现获取当前用户：GET /api/v1/auth/me
- [x] 添加错误处理和HTTP状态码
- [x] 添加 TODO-ALIYUN 标记预留功能

#### 2.6 集成到主应用
- [x] 修改 `backend/app/main.py` 导入认证路由
- [x] 注册认证路由到FastAPI应用

**额外完成**:
- [x] 移除passlib依赖，直接使用bcrypt库
- [x] 实现SHA256+base64长密码处理方案
- [x] 添加完整的技术文档和设计决策说明
- [x] 完成端到端认证功能测试
- [ ] 配置CORS中间件
- [ ] 测试应用启动正常

---

## Phase 3: 标书CRUD API（1天）

#### 3.1 Proposal Schema定义
- [ ] 创建 `backend/app/schemas/proposal.py` 文件
- [ ] 定义 ProposalCreate model
- [ ] 定义 ProposalUpdate model
- [ ] 定义 ProposalResponse model
- [ ] 定义 ProposalDetail model

#### 3.2 Proposal API路由
- [ ] 创建 `backend/app/api/v1/proposals.py` 文件
- [ ] 实现列表端点：GET /api/v1/proposals
- [ ] 实现详情端点：GET /api/v1/proposals/{id}
- [ ] 实现创建端点：POST /api/v1/proposals
- [ ] 实现更新端点：PUT /api/v1/proposals/{id}
- [ ] 实现删除端点：DELETE /api/v1/proposals/{id}

#### 3.3 高级功能
- [ ] 添加分页支持（skip, limit参数）
- [ ] 添加状态筛选功能
- [ ] 添加标题搜索功能
- [ ] 添加权限检查（只能操作自己的标书）
- [ ] 实现统计端点：GET /api/v1/proposals/statistics/summary

#### 3.4 路由集成
- [ ] 修改 `backend/app/main.py` 导入proposals路由
- [ ] 注册proposals路由到FastAPI应用
- [ ] 测试所有API端点正常响应

---

## Phase 4: 种子数据和测试（1天）

#### 4.1 种子数据脚本
- [ ] 创建 `backend/scripts/seed_data.py` 文件
- [ ] 实现种子数据生成逻辑
- [ ] 创建2-3个测试用户
- [ ] 创建5-8个测试标书（不同状态）
- [ ] 添加脚本运行说明

#### 4.2 测试环境配置
- [ ] 创建 `backend/tests/conftest.py` 文件
- [ ] 配置测试数据库URL
- [ ] 创建异步测试引擎
- [ ] 创建测试会话fixture
- [ ] 创建应用依赖覆盖fixture

#### 4.3 认证功能测试
- [ ] 创建 `backend/tests/test_auth.py` 文件
- [ ] 编写注册成功测试用例
- [ ] 编写重复邮箱注册失败测试用例
- [ ] 编写登录成功测试用例
- [ ] 编写密码错误测试用例
- [ ] 编写JWT验证测试用例

#### 4.4 标书功能测试
- [ ] 创建 `backend/tests/test_proposals.py` 文件
- [ ] 编写创建标书测试用例
- [ ] 编写获取标书列表测试用例
- [ ] 编写获取标书详情测试用例
- [ ] 编写更新标书测试用例
- [ ] 编写删除标书测试用例
- [ ] 编写权限检查测试用例

#### 4.5 测试执行和验证
- [ ] 运行测试：`poetry run pytest tests/ -v`
- [ ] 检查测试覆盖率：`poetry run pytest --cov=app`
- [ ] 确保测试覆盖率 ≥ 70%
- [ ] 修复所有失败的测试用例
- [ ] 生成HTML覆盖率报告

---

## Phase 5: 部署准备（1天）

#### 5.1 部署文档
- [ ] 创建 `docs/deployment/aliyun_deployment_guide.md`
- [ ] 创建 `docs/deployment/database_migration.md`
- [ ] 创建 `docs/deployment/environment_setup.md`
- [ ] 创建 `docs/deployment/docker_production.md`
- [ ] 编写详细的部署步骤说明

#### 5.2 部署脚本
- [ ] 创建 `tools/scripts/deploy_to_aliyun.sh`
- [ ] 编写Docker镜像构建逻辑
- [ ] 编写镜像推送到阿里云逻辑
- [ ] 编写SSH部署执行逻辑
- [ ] 添加脚本使用说明

#### 5.3 生产环境配置
- [ ] 创建 `docker-compose.prod.yml`
- [ ] 配置生产环境数据库连接
- [ ] 配置生产环境CORS设置
- [ ] 配置生产环境日志设置
- [ ] 配置健康检查端点

#### 5.4 迁移工具准备
- [ ] 编写本地数据导出脚本
- [ ] 编写阿里云数据导入脚本
- [ ] 创建数据库备份脚本
- [ ] 创建数据验证脚本
- [ ] 测试完整迁移流程

---

## 验收检查清单

### 功能验收
- [ ] 前端能成功调用注册API
- [ ] 前端能成功调用登录API
- [ ] 前端能完整使用标书CRUD功能
- [ ] 统计数据在Dashboard正确显示
- [ ] 用户只能操作自己的数据

### 技术验收
- [ ] 所有API端点响应时间 < 500ms
- [ ] 测试覆盖率 ≥ 70%
- [ ] 数据库迁移执行无错误
- [ ] 所有API端点有Swagger文档
- [ ] 错误处理完善，有合适的HTTP状态码

### 部署验收
- [ ] 本地环境能稳定运行
- [ ] docker-compose up -d 正常启动
- [ ] 部署文档完整且可执行
- [ ] 部署脚本测试通过
- [ ] 环境变量配置模板清晰

### 扩展性验收
- [ ] 所有预留功能有 TODO-ALIYUN 标记
- [ ] 数据库支持字段扩展
- [ ] API支持版本管理
- [ ] 认证系统支持第三方登录集成

---

## 时间表

| Phase | 计划时间 | 完成标准 |
|-------|---------|---------|
| Phase 1 | 0.5天 | 数据库迁移完成 |
| Phase 2 | 1.5天 | 认证API可用 |
| Phase 3 | 1天 | 标书CRUD完成 |
| Phase 4 | 1天 | 测试通过 |
| Phase 5 | 1天 | 部署就绪 |
| **总计** | **5天** | **全部验收通过** |

**计划开始日期**: 2025-11-13
**预计完成日期**: 2025-11-17

### 阶段2：前端MVP原型（3-5天）✅ 部分完成
**目标**: 可演示的前端界面（Mock数据）

**依赖条件**:
- ✅ 用户确认React + Ant Design
- ✅ 用户选择设计风格（方案A）

**已完成**:
- [x] 布局框架（侧边栏导航）
- [x] 首页仪表板实现
- [x] 标书卡片组件
- [x] 状态标签和质量评分组件

**待完成核心功能**:
- [ ] 标书创建/编辑表单页面
- [ ] 标书详情查看页面
- [ ] 数据分析展示页面
- [ ] 文献库页面
- [ ] 用户设置页面

### 阶段1.1：MVP认证系统详细方案（2天）🔄 当前执行
**目标**: 实现精简版登录/注册功能，预留扩展接口

**确认日期**: 2025-11-11

#### 设计决策

**认证方式**：
- ✅ 邮箱 + 密码（主要方式）
- ✅ 教育邮箱检测（格式验证，标记但不强制）
- ❌ 短信验证码（暂不实现，Phase 3.5）
- ❌ 人机验证（暂不实现，Phase 3.5）

**验证策略**：
- ✅ 允许用户注册后不验证邮箱也能使用（宽松策略）
- ❌ 邮件发送功能（暂不实现，预留接口）
- ✅ 数据库预留验证字段（email_verified, verify_token等）

**代码规范**：
- 使用 `TODO-ALIYUN` 标记所有未来功能
- 预留API端点和数据库字段
- 添加详细的实现说明注释

#### 前端开发任务（1天）

**1. 安装依赖包**
| 请你将这部分添加到编译指示文件当中
```bash
npm install react-hook-form zod @hookform/resolvers lodash
npm install -D @types/lodash
```

**2. 创建文件结构**
```
frontend/src/
├── pages/
│   ├── LoginPage.tsx                    # 登录页
│   ├── RegisterPage.tsx                 # 注册页
│   └── EmailVerifySuccessPage.tsx       # 【预留】验证成功页
├── store/
│   └── authStore.ts                     # 认证状态管理（新建）
├── components/
│   ├── PasswordStrength.tsx             # 密码强度指示器
│   └── CaptchaPlaceholder.tsx           # 【预留】验证码组件
└── utils/
    └── validators.ts                    # 邮箱验证工具
```

**3. 页面功能清单**

**LoginPage.tsx**：
- [x] 左右分栏布局（桌面端 50/50）
- [x] 单列布局（移动端）
- [x] 表单字段：邮箱、密码
- [x] 记住我功能（7天免登录）
- [x] 忘记密码链接【预留】
- [x] React Hook Form + Zod验证
- [x] 错误提示UI
- [x] 登录成功跳转Dashboard

**RegisterPage.tsx**：
- [x] 表单字段：邮箱、密码、确认密码、姓名、研究方向
- [x] 教育邮箱实时检测（图标提示）
- [x] 密码强度指示器（弱/中/强）
- [x] 验证码组件位置预留（TODO-ALIYUN标记）
- [x] 用户协议勾选
- [x] 注册成功提示（说明暂无验证邮件）

**authStore.ts**：
- [x] 状态：user, token, isAuthenticated
- [x] 方法：login(), register(), logout(), checkAuth()
- [x] Token持久化（localStorage）
- [x] 自动刷新逻辑【预留】

**4. 表单验证规则**
```typescript
// 邮箱验证
- 格式验证（RFC 5322标准）
- 教育邮箱检测（.edu.cn, .edu, .ac.*）
- 后端重复检测

// 密码验证
- 长度 ≥ 8位
- 必须包含字母和数字
- 密码强度可视化（0-4级）
```

#### 后端开发任务（1天）

**1. 安装依赖包**
```bash
poetry add python-jose[cryptography] passlib[bcrypt] python-multipart
# 邮件依赖暂不安装
```

**2. 创建文件结构**
```
backend/app/
├── api/
│   └── auth.py                          # 认证路由
├── core/
│   ├── security.py                      # JWT/密码工具
│   └── email.py                         # 【预留】邮件服务
├── schemas/
│   └── auth.py                          # Pydantic模型
└── models/
    └── user.py                          # 扩展User模型
```

**3. 数据库模型扩展（User表）**
```python
# 新增字段
email_verified: bool = False              # 邮箱验证状态
is_edu_email: bool = False                # 教育邮箱标记
verify_token: str | None = None           # 【预留】验证令牌
verify_token_expires: datetime | None     # 【预留】令牌过期时间
failed_login_attempts: int = 0            # 【预留】失败次数
last_login: datetime | None               # 最后登录时间
```

**4. API端点实现**
```python
POST /api/auth/register:
  - 输入验证（邮箱、密码、姓名）
  - 邮箱重复检测
  - 教育邮箱判断（正则匹配）
  - 密码哈希（bcrypt, rounds=12）
  - 创建用户记录
  - 【TODO-ALIYUN】生成验证令牌（预留）
  - 【TODO-ALIYUN】调用邮件服务（预留）
  - 返回成功信息

POST /api/auth/login:
  - 邮箱查询用户
  - 密码验证
  - 【TODO-ALIYUN】失败次数检测（预留）
  - JWT签发（24小时有效期）
  - 更新last_login时间戳
  - 返回token和用户信息

GET /api/auth/me:
  - JWT验证（依赖注入）
  - 返回当前用户信息

GET /api/auth/verify-email?token=xxx:
  - 【预留接口】验证token有效性
  - 更新email_verified状态
  - 返回成功/失败信息
```

**5. 安全实现要点**
- 密码哈希：bcrypt算法，rounds=12
- JWT配置：HS256算法，24小时过期
- CORS配置：允许前端域名
- 输入验证：Pydantic模型严格验证

**6. TODO-ALIYUN注释规范**
```python
# TODO-ALIYUN: [功能名称] - 需要配置阿里云服务
# 依赖：服务名称
# 预计工作量：X小时
# 优先级：P1/P2/P3
# 参考文档：URL

示例：
async def send_verification_email(email: str, token: str):
    """
    发送邮箱验证邮件

    TODO-ALIYUN: [邮件发送] - 需要配置阿里云DirectMail服务
    依赖：
      1. 阿里云账号开通DirectMail
      2. 配置发信域名（如 innolifer.com）
      3. 安装SDK: aliyun-python-sdk-dm
      4. 环境变量: ALIYUN_ACCESS_KEY, ALIYUN_SECRET_KEY
    预计工作量：2-3小时
    优先级：P1
    参考文档：https://help.aliyun.com/product/29412.html
    """
    # 当前实现：开发模式日志
    logger.info(f"[DEV] 验证邮件应发送至：{email}")
    logger.info(f"[DEV] 验证链接：{settings.FRONTEND_URL}/verify-email?token={token}")
    pass
```

#### 数据库迁移

**1. 生成迁移文件**
```bash
cd backend
alembic revision --autogenerate -m "Add email verification fields to users"
```

**2. 执行迁移**
```bash
alembic upgrade head
```

#### 测试清单

- [ ] 注册功能：成功/失败/重复邮箱
- [ ] 教育邮箱检测：.edu.cn/.edu/.ac.uk
- [ ] 登录功能：成功/密码错误/用户不存在
- [ ] Token验证：有效/过期/无效
- [ ] 响应式布局：xs/md/xl断点
- [ ] 表单验证：所有验证规则触发

---

### 阶段3：SPG-S内容生成服务（7-10天）⏳ 待开始
**目标**: 实现内容生成核心功能

**依赖条件**:
- 🔄 用户提供DeepSeek API Key

**核心功能**:
- [ ] DeepSeek API集成
- [ ] Prompt工程
- [ ] 结构化内容生成
- [ ] 前后端API联调

---

### 阶段3.5：认证系统增强 - 阿里云服务集成（5-7天）⏳ 未来实现
**目标**: 完善认证系统，集成阿里云服务提升安全性和用户体验

**确认日期**: 2025-11-11
**实施时机**: Phase 3完成后，Phase 4之前

#### 阿里云服务集成清单

##### P1 - 高优先级（Phase 3完成后立即实施）

**1. 阿里云邮件推送（DirectMail）** 🔴
```
功能：发送邮箱验证邮件、密码重置邮件
服务地址：https://www.aliyun.com/product/directmail

准备工作：
  1. 阿里云账号 + 实名认证
  2. 域名准备（如 innolifer.com）
  3. 在阿里云DirectMail配置发信域名
  4. 配置DNS记录（SPF、MX、CNAME）
  5. 域名验证通过（约1-2小时）
  6. 创建发信地址（如 noreply@innolifer.com）

技术实现：
  - Python SDK：aliyun-python-sdk-dm
  - 或SMTP方式：使用标准邮件库

成本：
  - 免费额度：每日200封
  - 超出后：约 0.0004元/封

工作量：2-3小时
优先级：P1

代码位置：
  - backend/app/core/email.py
  - backend/app/api/auth.py (register/reset-password端点)

实现步骤：
  1. poetry add aliyun-python-sdk-core aliyun-python-sdk-dm
  2. 配置环境变量（ACCESS_KEY, SECRET_KEY, MAIL_FROM）
  3. 实现send_verification_email()函数
  4. 创建HTML邮件模板
  5. 集成到注册流程
  6. 实现邮箱验证端点
  7. 测试发送流程
```

**2. 阿里云验证码2.0（滑动拼图验证）** 🔴
```
功能：替换登录/注册的人机验证机制
服务地址：https://help.aliyun.com/product/28308.html

准备工作：
  1. 阿里云账号 + 实名认证
  2. 开通验证码2.0服务
  3. 创建验证配置（场景：注册、登录）
  4. 获取AppKey和SecretKey

触发场景：
  - 用户注册时（必须验证）
  - 登录失败3次后触发
  - 发送密码重置邮件前

技术实现：
  - 前端：引入阿里云验证码SDK
  - 后端：调用验证API

成本：
  - 免费额度：每月10万次调用
  - 超出后：约 0.0015元/次

工作量：2-3小时
优先级：P1

代码位置：
  - frontend/src/components/CaptchaPlaceholder.tsx → AliCaptcha.tsx
  - backend/app/core/captcha.py
  - backend/app/api/auth.py (增加验证逻辑)

实现步骤：
  1. 前端安装SDK: npm install @alicloud/captcha-sdk
  2. 创建验证组件（滑动拼图UI）
  3. 后端安装SDK: poetry add aliyun-python-sdk-captcha
  4. 实现后端验证逻辑
  5. 集成到注册/登录流程
  6. 测试验证流程
```

##### P2 - 中优先级（正式发布前）

**3. 邮箱验证强制化** 🟡
```
功能：未验证用户功能限制策略
依赖：阿里云DirectMail（必须先完成P1-1）

限制策略：
  - 未验证用户最多创建3个标书
  - 未验证用户不能使用AI生成功能
  - 未验证用户不能导出标书
  - 每7天发送提醒邮件

技术实现：
  - 后端中间件检查email_verified状态
  - API端点增加权限验证
  - 定时任务发送提醒邮件

工作量：1-2小时
优先级：P2

代码位置：
  - backend/app/middleware/permissions.py
  - backend/app/api/proposals.py
  - backend/app/tasks/email_reminders.py
```

**4. 手机号绑定（可选）** 🟡
```
功能：账号安全增强，提供密码重置备用方式
服务地址：https://www.aliyun.com/product/sms

准备工作：
  1. 开通阿里云短信服务
  2. 实名认证（需企业资质）
  3. 创建短信签名（审核1-2工作日）
  4. 创建短信模板（审核1-2工作日）
  5. 获取AccessKey和SecretKey

功能清单：
  - 绑定手机号（可选）
  - 手机验证码登录（快捷登录）
  - 手机验证码重置密码

成本：
  - 约0.045元/条（中国大陆）

工作量：4-5小时
优先级：P2

数据库扩展：
  - User.phone: str | None
  - User.phone_verified: bool = False

代码位置：
  - backend/app/core/sms.py
  - backend/app/api/auth.py (新增短信相关端点)
  - frontend/src/pages/RegisterPage.tsx (添加手机号字段)
```

##### P3 - 低优先级（长期优化）

**5. 第三方登录** ⚪
```
功能：提供便捷登录方式

实现选项：
  - 微信登录（国内用户友好）
  - ORCID登录（学术身份认证）
  - Google登录（国际用户）

工作量：每个3-4小时
优先级：P3
```

**6. 无感知验证（智能风控）** ⚪
```
功能：提升用户体验，仅风险用户触发验证

技术方案：
  - 设备指纹识别
  - 鼠标轨迹/键盘输入分析
  - IP地址风险评估
  - 登录时间/频率异常检测

工作量：7-10天（需要大量数据训练）
优先级：P3
```

#### 环境变量配置清单

Phase 3.5完成后需要的环境变量：

```bash
# 阿里云通用配置
ALIYUN_ACCESS_KEY_ID=LTAI5t...
ALIYUN_ACCESS_KEY_SECRET=xxx...
ALIYUN_REGION_ID=cn-hangzhou

# DirectMail邮件推送
ALIYUN_MAIL_FROM=noreply@innoliber.com
ALIYUN_MAIL_FROM_NAME=InnoLiber团队
ALIYUN_MAIL_REPLY_TO=support@innoliber.com

# 验证码2.0
ALIYUN_CAPTCHA_APP_KEY=xxx
ALIYUN_CAPTCHA_SECRET_KEY=xxx

# 短信服务（可选）
ALIYUN_SMS_SIGN_NAME=InnoLiber
ALIYUN_SMS_TEMPLATE_CODE=SMS_xxx

# 前端URL（用于邮件链接）
FRONTEND_URL=https://innoliber.com
# 或开发环境：http://localhost:5173
```

#### 实施时间表

| 任务 | 工作量 | 依赖 | 预计完成日期 |
|------|--------|------|-------------|
| P1-1: DirectMail集成 | 3小时 | 域名配置 | Phase 3完成后第1天 |
| P1-2: 验证码2.0集成 | 3小时 | 无 | Phase 3完成后第2天 |
| 测试与调试 | 1天 | P1-1, P1-2 | Phase 3完成后第3天 |
| P2-3: 邮箱验证强制化 | 2小时 | P1-1 | Phase 4期间 |
| P2-4: 手机号绑定 | 5小时 | 短信审核 | 正式发布前 |

#### 成功标准

- [ ] 用户注册后收到验证邮件（到达率 > 95%）
- [ ] 滑动验证码识别率 > 99%（人类）
- [ ] 验证码恶意请求拦截率 > 90%
- [ ] 邮件发送延迟 < 10秒
- [ ] 验证码交互响应 < 2秒
- [ ] 无误拦截正常用户（误报率 < 1%）

---

### 阶段4：K-TAS文献分析服务（10-14天）⏳ 待开始
**目标**: 实现文献分析功能

**核心功能**:
- [ ] arXiv数据爬取
- [ ] 向量化处理（PyTorch）
- [ ] 文献聚类分析
- [ ] 趋势识别算法

### 阶段5：DDC-S格式合规服务（5-7天）⏳ 待开始
**目标**: 实现格式合规检查

**依赖条件**:
- 🔄 用户提供NSFC申请书样本
- 🔄 用户提供BIT论文规范文档

**核心功能**:
- [ ] 格式规则引擎
- [ ] 自动检查算法
- [ ] 修改建议生成

### 阶段6：测试与优化（持续）
**目标**: 确保产品质量

**核心内容**:
- [ ] 单元测试（pytest + vitest）
- [ ] 集成测试（API端到端）
- [ ] 性能优化
- [ ] 安全检查

---

## 🎨 前端设计方案确认

### ✅ 已选定设计方案：方案A - 学术专业风

**确认日期**: 2025-10-29
**参考文档**: `docs/design/frontend_prototypes.md`

#### 设计风格特点
- **整体风格**: 学术专业风格，注重信息层次和内容可读性
- **色彩方案**:
  - 主色：深蓝 `#1E3A8A` - 代表专业、信任、学术
  - 辅助色：
    - 成功：绿色 `#10B981`
    - 警告：金色 `#F59E0B`
    - 错误：红色 `#EF4444`
    - 信息：天蓝 `#3B82F6`
  - 背景：浅灰 `#F9FAFB`，营造舒适的阅读环境
- **设计原则**: 遵循CRAP设计原则
  - **Contrast** (对比): 清晰的视觉层次
  - **Repetition** (重复): 统一的设计元素
  - **Alignment** (对齐): 网格化布局
  - **Proximity** (亲密性): 相关信息分组
- **UI组件库**: Ant Design 5.x
- **圆角设计**:
  - 卡片：8px
  - 按钮/输入框：6px
- **阴影效果**: 柔和的卡片阴影，hover时增强

#### 核心页面布局结构

1. **侧边栏导航布局** (`SidebarLayout.tsx`)
   - 固定左侧导航栏，宽度200px
   - 顶部Logo和系统名称
   - 主要菜单项：标书管理、数据分析、文献库、设置
   - 底部用户信息和退出登录

2. **首页/仪表板** (`Dashboard.tsx`)
   - 顶部统计卡片区域（4列）
   - 搜索和筛选功能栏
   - 标书卡片网格展示（响应式）
   - 底部分页控制

3. **标书卡片组件** (`ProposalCard.tsx`)
   - 标题和状态标签
   - 元信息（资助机构、申请金额、期限）
   - 质量评分可视化（星级+进度条）
   - 操作按钮组（继续编辑/查看详情/删除）

#### 图标使用规范
- **图标库**: `@ant-design/icons`
- **图标清单**: 详见 `docs/design/icon_requirements.md`
- **使用原则**: 保持图标风格统一，语义明确

**当前状态**: ✅ 设计方案已确认并实施

---

## 🔑 环境配置

### API密钥需求
用户将提供以下API Key：
- **DeepSeek API Key**: 用于LLM调用
- **阿里云访问密钥**: 用于部署

### 环境变量模板
将创建 `.env.template` 文件，包含：
- 数据库连接信息
- API密钥占位符
- 服务端口配置
- JWT密钥配置

---

## 📊 里程碑时间线

| 时间点 | 里程碑 | 交付成果 | 状态 |
|--------|--------|----------|------|
| **2025-10-29** | 阶段0完成 | 项目骨架+文档+首页 | ✅ 已完成 |
| **2025-11-01** | 阶段1完成 | 后端API服务 | 🔄 进行中 |
| **2025-11-05** | 阶段2完成 | 前端完整页面 | ⏳ 待开始 |
| **2025-11-15** | 阶段3完成 | SPG-S内容生成 | ⏳ 待开始 |
| **2025-11-29** | 阶段4完成 | K-TAS文献分析 | ⏳ 待开始 |
| **2025-12-06** | 阶段5完成 | DDC-S格式检查 | ⏳ 待开始 |
| **2025-12-13** | **MVP 1.0** | 完整可用产品 | ⏳ 待开始 |

---

## 🎯 成功标准

### MVP 1.0成功标准
1. **功能完整性**
   - [ ] 用户能创建并编辑标书
   - [ ] 系统能生成结构化内容建议
   - [ ] 系统能进行格式合规检查
   - [ ] 系统能提供文献趋势分析

2. **技术指标**
   - [ ] API响应时间 < 2秒
   - [ ] 前端首屏加载 < 3秒
   - [ ] 支持并发用户数 ≥ 50
   - [ ] 数据库事务ACID保证

3. **用户体验**
   - [ ] 界面响应式设计
   - [ ] 操作流程清晰直观
   - [ ] 错误提示友好
   - [ ] 支持中文内容处理

---

## 🚀 当前工作与下一步行动

### ✅ 已完成
**阶段0 - 基础设施搭建（2025-10-29）**
- 完整的Monorepo项目结构
- Docker开发环境配置
- 前后端框架搭建
- 数据库模型定义
- 首页完整实现（包括所有相关组件）
- 完整的技术文档体系

**阶段0.5 - 前端设计系统完善（2025-10-30）**
- 7个核心页面完整设计（桌面端+移动端）
- 响应式设计指南
- 组件开发规范

### 🔄 正在进行
**阶段1.1 - MVP认证系统（2025-11-11）**
- ✅ 认证方案确认（邮箱+密码，教育邮箱检测）
- ✅ 详细执行计划制定
- ⏳ 等待开始实现登录/注册页面

**当前状态**:
- 已完成认证系统详细方案设计
- 已添加Phase 3.5阿里云服务集成计划
- 已定义TODO-ALIYUN注释规范
- 准备开始前后端代码实现

**下一步**:
1. 安装前端依赖包（react-hook-form, zod等）
2. 创建LoginPage和RegisterPage
3. 实现authStore状态管理
4. 扩展后端User模型
5. 创建认证API端点
6. 数据库迁移

### ⏳ 待开始（按优先级排序）
1. **阶段1剩余部分** - 其他前端页面（标书编辑、详情、分析等）
2. **阶段2** - 后端API实现（标书CRUD等）
3. **阶段3** - SPG-S内容生成服务集成
4. **阶段3.5** - 认证系统增强（阿里云服务集成）
5. **阶段4** - K-TAS文献分析服务
6. **阶段5** - DDC-S格式合规检查

### 等待用户提供
**Phase 3需要**:
- 🔄 DeepSeek API Key（SPG-S服务）

**Phase 3.5需要（阿里云服务）**:
- 🔄 阿里云账号（已有）
- 🔄 域名配置（邮件推送）
- 🔄 开通DirectMail服务
- 🔄 开通验证码2.0服务

**Phase 5需要**:
- 🔄 NSFC申请书样本文档
- 🔄 BIT论文规范文档

---

## 📝 开发记录

### 2025-11-15
**主要成果**:
- ✅ 完成CLAUDE.md开发工作流程规范化（新增689行）
- ✅ 完成Phase 2.1数据库迁移配置
- ✅ 升级Base模型到SQLAlchemy 2.0 (AsyncAttrs + DeclarativeBase)
- ✅ 验证User和Proposal模型字段完整性
- ✅ 生成并执行初始数据库迁移 (revision 9a6e37957675)
- ✅ 成功创建users和proposals表及所有索引

**技术亮点**:
- 工作流程规范：引入Pre-Development Check（含Context7查询）和Post-Development文档更新流程
- Context7集成：开发前强制查询技术文档确保最佳实践
- ORM升级：主动从declarative_base()升级到现代DeclarativeBase + AsyncAttrs模式
- Alembic配置：env.py已配置异步数据库URL转换，支持asyncpg驱动

**验收标准达成**:
- ✅ 数据库迁移执行无错误
- ✅ 所有字段和索引创建正确（含email_verified、is_edu_email等预留字段）
- ✅ User模型包含所有认证所需字段
- ✅ 外键约束正常工作（proposals.user_id → users.id）

**Context7技术文档查询记录**:
- `/sqlalchemy/alembic`: 学习Alembic最佳实践（alembic init, autogenerate, upgrade命令）
- `/websites/sqlalchemy_en_20`: 学习SQLAlchemy 2.0异步模式（AsyncAttrs, DeclarativeBase）

**下一步计划**:
- Phase 2.2：认证系统实现（1.5天）
- 创建core/security.py（密码哈希、JWT生成）
- 创建db/session.py（异步会话管理）
- 实现认证API路由（注册、登录、获取当前用户）

### 2025-11-22
**主要成果**:
- ✅ 完成Phase 1.5.0文档整合与更新
- ✅ 完成Phase 1.5.1 Foundation Setup（基础设施搭建）
- ✅ 安装lucide-react依赖（v0.469.0）
- ✅ 创建design-system.css（253行CSS变量系统）
- ✅ 创建theme.ts（304行Ant Design主题配置）
- ✅ 创建icons/index.tsx（410行图标映射系统）
- ✅ 更新main.tsx导入新设计系统
- ✅ 修复2个TypeScript类型错误

**技术亮点**:
- **CSS变量系统**: 完整的设计令牌系统，基于8px网格
- **Ant Design主题**: 统一4px圆角、1px边框、移除阴影、群青蓝#0437F2主色
- **图标系统**: 60+个Lucide图标语义映射，类型安全的Icon组件
- **设计哲学**: 严格遵循Dieter Rams"Less but Better"原则

**验收标准达成**:
- ✅ lucide-react成功安装（peer dependency警告非阻塞）
- ✅ CSS变量覆盖所有设计令牌（颜色、间距、字体、边框、阴影、动效）
- ✅ Ant Design主题配置完整（token + 18个组件配置）
- ✅ 图标系统类型安全（IconProps, IconSize, IconColor枚举）
- ✅ TypeScript编译错误已修复（仅剩36个预存代码错误）

**Context7技术文档查询记录**:
- 本阶段未涉及新技术栈，直接使用已掌握的CSS、TypeScript、Ant Design知识

**下一步计划**:
- Phase 1.5.2：核心组件重构（Button、Card、Input、Tag、Progress）
- 为每个组件添加Rams风格样式覆盖
- 验证组件在真实页面中的视觉效果
- 更新Storybook文档（如有）

### 2025-11-11
**主要成果**:
- ✅ 完成认证系统详细方案设计
- ✅ 确认MVP范围：邮箱+密码，教育邮箱检测，暂不集成第三方服务
- ✅ 添加Phase 1.1详细实施计划（前后端任务清单）
- ✅ 添加Phase 3.5阿里云服务集成计划（邮件推送、验证码、短信）
- ✅ 定义TODO-ALIYUN代码注释规范
- ✅ 更新开发计划文档

**设计决策**:
- 认证方式：邮箱+密码（主要），教育邮箱标记（不强制）
- 验证策略：宽松策略，允许未验证邮箱用户使用
- 代码预留：所有未来功能使用TODO-ALIYUN标记
- 扩展性：数据库字段和API端点预留扩展空间

**下一步计划**:
- 开始Phase 1.1代码实现
- 前端：LoginPage + RegisterPage + authStore
- 后端：认证API + 数据库迁移
- 测试：注册/登录/Token验证流程

### 2025-10-29
**主要成果**:
- ✅ 完成阶段0所有任务
- ✅ 确认前端设计方案为方案A（学术专业风）
- ✅ 实现首页Dashboard及所有相关组件
- ✅ 创建User和Proposal数据库模型
- ✅ 更新开发计划文档，记录当前进度

**技术亮点**:
- Monorepo架构设计合理，前后端分离清晰
- TypeScript类型系统完善
- Ant Design主题定制符合设计风格
- 组件化设计良好，可复用性强

---

**文档状态**: 📝 持续更新
**负责人**: Claude Code
**审核人**: 项目所有者

---

*本文档将随开发进度持续更新，确保团队对项目状态的一致理解。*
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

Current phase: **Phase 1 - Frontend Core Pages Development (40% Complete)**
Next phase: **Phase 2 - Backend API Implementation (Ready to Start)**

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

**Phase 1 In Progress** 🔄 (40% Complete):
- ✅ LoginPage - 登录页 (100%)
- ✅ RegisterPage - 注册页 (100%)
- ✅ Dashboard - 首页/仪表板 (100%)
- ⏳ ProposalCreatePage - 新建标书页
- ⏳ ProposalEditPage - 标书编辑页
- ⏳ ProposalDetailPage - 标书详情页
- ⏳ AnalysisPage - 数据分析页
- ⏳ LibraryPage - 文献库页
- ⏳ SettingsPage - 设置页

## Frontend Development Progress

### Page Implementation Status
- [x] **Dashboard** - 首页/仪表板 (100% 完成)
- [x] **LoginPage** - 登录页 (100% 完成)
- [x] **RegisterPage** - 注册页 (100% 完成)
- [ ] **ProposalCreatePage** - 新建标书页 (设计完成，待实现)
- [ ] **ProposalEditPage** - 标书编辑页 (设计完成，待实现)
- [ ] **ProposalDetailPage** - 标书详情页 (设计完成，待实现)
- [ ] **AnalysisPage** - 数据分析页 (设计完成，待实现)
- [ ] **LibraryPage** - 文献库页 (设计完成，待实现)
- [ ] **SettingsPage** - 设置页 (设计完成，待实现)

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
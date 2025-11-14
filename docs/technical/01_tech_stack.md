# 技术栈选型文档

**版本**: v1.0
**创建日期**: 2025-10-28
**状态**: 已确认

---

## 📋 选型概述

本文档详细说明 InnoLiber 项目的技术栈选择理由、版本兼容性分析和最佳实践建议。

### 核心选型原则
1. **商业产品级稳定性**: 选择生产环境验证的技术
2. **类型安全**: 全栈类型检查，减少运行时错误
3. **开发效率**: 优秀的开发工具和生态支持
4. **性能优先**: 支持高并发和大数据处理
5. **中国本土化**: 适配国内网络环境和用户习惯

---

## 🐍 后端技术栈

### Python 3.11
**选择理由**:
- ✅ **最佳兼容性**: OpenAI SDK需要3.8+，PyTorch 2.5.1完美支持
- ✅ **性能提升**: 比3.10提升10-20%的执行效率
- ✅ **异步支持**: 完善的asyncio生态，支持高并发
- ✅ **类型提示**: 强化的类型系统，支持静态分析

**版本兼容性验证**:
```bash
# 核心依赖兼容性检查
Python 3.11 ✅
├── openai>=1.68.0 ✅ (支持3.8+)
├── torch>=2.5.1 ✅ (完美支持)
├── fastapi>=0.118.2 ✅ (支持3.8+)
└── asyncpg>=0.29.0 ✅ (支持3.9+)
```

### FastAPI 0.118.2
**选择理由**:
- ✅ **高性能**: 基于Starlette和Pydantic，性能接近Node.js
- ✅ **类型安全**: 原生支持Python类型提示
- ✅ **自动文档**: 自动生成OpenAPI/Swagger文档
- ✅ **异步优先**: 原生支持async/await
- ✅ **数据验证**: 内置Pydantic数据验证

**核心特性**:
```python
# 最新版本特性（0.118.2）
- 简化的参数声明（无需default=...）
- 改进的依赖注入系统
- 增强的异步支持
- 更好的类型推导
```

### PostgreSQL 16 + pgvector
**选择理由**:
- ✅ **MVCC支持**: 满足PRD中的并发控制要求
- ✅ **向量搜索**: pgvector扩展支持嵌入检索
- ✅ **ACID保证**: 事务完整性，关键数据安全
- ✅ **JSON支持**: 灵活存储结构化数据
- ✅ **成熟生态**: 丰富的工具和监控支持

**核心配置**:
```sql
-- 必需扩展
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 向量索引示例
CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops);
```

### SQLAlchemy 2.0 + asyncpg
**选择理由**:
- ✅ **异步ORM**: 原生支持async/await
- ✅ **类型安全**: 完善的类型提示支持
- ✅ **性能优异**: asyncpg是最快的PostgreSQL驱动
- ✅ **事务管理**: 支持MVCC和复杂事务逻辑

**连接池配置**:
```python
# 高性能连接池设置
DATABASE_URL = "postgresql+asyncpg://user:pass@localhost/db"
pool_size = 20          # 连接池大小
max_overflow = 30       # 最大溢出连接
pool_pre_ping = True    # 连接健康检查
```

### PyTorch 2.5.1
**选择理由**:
- ✅ **稳定版本**: 生产环境验证的稳定版本
- ✅ **Python 3.11兼容**: 完美支持最新Python
- ✅ **向量计算**: 高效的tensor运算，支持GPU加速
- ✅ **模型生态**: 丰富的预训练模型

**核心用途**:
```python
# RDR框架中的应用
- 文献向量化（embedding）
- 聚类分析（K-means, DBSCAN）
- 相似度计算（cosine similarity）
- 预训练模型加载（nvidia/NV-Embed-v2）
```

### OpenAI Python SDK 1.68+
**选择理由**:
- ✅ **DeepSeek兼容**: 支持OpenAI格式的API调用
- ✅ **异步支持**: 原生async客户端
- ✅ **错误处理**: 完善的异常处理机制
- ✅ **Streaming**: 支持流式响应

**DeepSeek集成示例**:
```python
from openai import AsyncOpenAI

# DeepSeek API配置
client = AsyncOpenAI(
    api_key="sk-xxx",
    base_url="https://api.deepseek.com"
)

# 支持模型路由（V3.2 vs R1）
async def llm_call(model: str, messages: list):
    response = await client.chat.completions.create(
        model=model,  # "deepseek-chat" or "deepseek-reasoner"
        messages=messages
    )
    return response
```

---

## ⚛️ 前端技术栈

### React 18
**选择理由**:
- ✅ **并发特性**: Concurrent Rendering提升用户体验
- ✅ **成熟生态**: 最丰富的组件库和工具链
- ✅ **商业验证**: 大量企业级产品使用
- ✅ **TypeScript支持**: 完善的类型定义

**核心特性**:
```tsx
// React 18新特性使用
- Concurrent Mode（并发模式）
- Automatic Batching（自动批处理）
- useId Hook（唯一ID生成）
- useDeferredValue（延迟值）
```

### Ant Design 5
**选择理由**:
- ✅ **企业级UI**: 专为商业产品设计
- ✅ **中文友好**: 原生支持中文，符合国内用户习惯
- ✅ **组件丰富**: 60+高质量组件，覆盖全场景
- ✅ **主题定制**: 支持Design Token主题系统
- ✅ **TypeScript**: 完整类型定义

**核心组件规划**:
```tsx
// 标书编辑相关
- Form：表单处理
- Upload：文件上传
- Editor：富文本编辑
- Table：数据展示

// 分析展示相关
- Chart：数据可视化
- Card：信息卡片
- Timeline：时间轴
- Tree：层次结构

// 交互反馈
- Message：消息提示
- Modal：对话框
- Drawer：抽屉
- Progress：进度条
```

### TypeScript 5
**选择理由**:
- ✅ **类型安全**: 编译时错误检查
- ✅ **开发效率**: 智能代码提示和重构
- ✅ **维护性**: 大型项目代码可维护性
- ✅ **团队协作**: 接口契约明确

**配置策略**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Vite 5
**选择理由**:
- ✅ **开发速度**: HMR秒级热更新
- ✅ **构建优化**: 基于Rollup的高效打包
- ✅ **开箱即用**: 零配置TypeScript/JSX支持
- ✅ **插件生态**: 丰富的插件系统

### Zustand
**选择理由**:
- ✅ **轻量级**: < 2KB，性能优异
- ✅ **简单API**: 学习成本低，易于维护
- ✅ **TypeScript**: 完美类型推导
- ✅ **DevTools**: 支持Redux DevTools

**状态设计**:
```tsx
// 全局状态结构
interface AppState {
  user: UserInfo | null;
  currentProposal: Proposal | null;
  ktas: KTASState;
  spgs: SPGSState;
  ddcs: DDCSState;
}
```

---

## 🏗️ 基础设施

### 依赖管理
**后端**: Poetry
- ✅ **锁文件**: 确保依赖版本一致性
- ✅ **虚拟环境**: 自动管理Python环境
- ✅ **构建工具**: 支持wheel打包

**前端**: npm/yarn
- ✅ **package-lock**: 锁定依赖版本
- ✅ **Workspaces**: 支持Monorepo
- ✅ **scripts**: 自动化构建脚本

### 容器化
**Docker + Docker Compose**
```yaml
# 开发环境配置
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: innoliber
      POSTGRES_USER: innoliber
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### 认证系统
**简化JWT方案**
```python
# JWT配置
- 算法: HS256（开发阶段）
- 过期时间: 24小时
- 刷新策略: 自动刷新
- 密钥管理: 环境变量

# 升级路径：OAuth2 + JWT（生产环境）
```

---

## 🚀 部署架构

### 阿里云服务选型

**计算服务**:
- **ECS**: 2核4G起步（开发环境）
- **SLB**: 负载均衡（生产环境）
- **ACK**: Kubernetes服务（扩展期）

**存储服务**:
- **RDS PostgreSQL**: 托管数据库服务
- **OSS**: 对象存储（文件上传）
- **NAS**: 网络文件系统（模型存储）

**网络服务**:
- **VPC**: 私有网络
- **CDN**: 静态资源加速
- **域名备案**: 中国大陆访问

**成本估算**:
```
开发环境：
- ECS 2核4G: ¥200/月
- RDS 1核2G: ¥300/月
- 带宽 5M: ¥100/月
总计: ¥600/月

生产环境：
- ECS 4核8G: ¥600/月
- RDS 2核4G: ¥800/月
- SLB + CDN: ¥200/月
总计: ¥1600/月
```

---

## 🔄 开发工具链

### 代码质量
```yaml
# Python
- Black: 代码格式化
- isort: import排序
- flake8: 语法检查
- mypy: 类型检查
- pytest: 单元测试

# TypeScript
- ESLint: 语法检查
- Prettier: 代码格式化
- Vitest: 单元测试
- Playwright: E2E测试
```

### CI/CD流程
```yaml
# GitHub Actions
- 代码检查（lint + type check）
- 单元测试（覆盖率 > 80%）
- 构建镜像（Docker build）
- 部署到阿里云（生产环境）
```

---

## ⚡ 性能基准

### 响应时间目标
- **API响应**: < 200ms（P95）
- **数据库查询**: < 100ms（简单查询）
- **LLM调用**: < 3秒（DeepSeek API）
- **前端首屏**: < 2秒

### 并发能力目标
- **并发用户**: 100+（MVP阶段）
- **QPS**: 500+（单机）
- **数据库连接**: 50个连接池

### 存储容量规划
- **用户数据**: 1TB（10万用户）
- **RDR语料库**: 10TB（100万篇论文）
- **向量索引**: 500GB（pgvector）

---

## 🔐 安全考虑

### 数据安全
- **HTTPS**: 全站SSL加密
- **SQL注入**: 参数化查询
- **XSS防护**: CSP策略
- **认证**: JWT + refresh token

### API安全
- **限流**: 基于用户的请求限制
- **参数验证**: Pydantic严格验证
- **错误处理**: 不暴露内部信息
- **审计日志**: 关键操作记录

---

## 📈 监控指标

### 业务指标
- **用户活跃度**: DAU/MAU
- **标书生成量**: 每日生成数
- **系统可用性**: 99.9%目标
- **响应时间**: P50/P95/P99

### 技术指标
- **CPU使用率**: < 70%
- **内存使用率**: < 80%
- **数据库连接**: < 80%
- **错误率**: < 0.1%

---

**文档状态**: ✅ 已确认
**最后更新**: 2025-10-28
**下次审核**: 开发过程中持续更新
# Phase 2.2 认证系统实现计划

**阶段名称**: Phase 2.2 - 认证系统实现 (Authentication System Implementation)
**预计时间**: 1.5天
**目标**: 实现完整的JWT认证系统，包括用户注册、登录、密码加密、token生成和验证
**开始日期**: 2025-11-15
**预计完成日期**: 2025-11-16

---

## 📋 Phase Completion清单模板

### PRE-DEVELOPMENT CHECK (开发前检查) ✅
- [ ] Step 0.1: 检查开发计划文档
- [ ] Step 0.2: 分析任务依赖关系
- [ ] Step 0.3: 查询技术文档 (Context7)
- [ ] Step 0.4: 确认外部依赖

### DEVELOPMENT EXECUTION (开发执行)
- [ ] 2.2.1: 核心安全模块实现
- [ ] 2.2.2: 数据库会话管理
- [ ] 2.2.3: FastAPI依赖注入
- [ ] 2.2.4: Pydantic Schema定义
- [ ] 2.2.5: 认证API路由实现
- [ ] 2.2.6: 集成到主应用

### POST-DEVELOPMENT (开发后文档)
- [ ] Step 1: 更新开发状态
- [ ] Step 2: 记录待完成项
- [ ] Step 3: 列出外部依赖需求
- [ ] Step 4: Git提交并推送

---

## 🔍 PRE-DEVELOPMENT CHECK

### Step 0.1: 检查开发计划文档 ✅
**当前状态**: Phase 2.1已完成，数据库表已创建
**User模型状态**: ✅ 包含所有认证字段
  - email_verified, is_edu_email, verify_token, verify_token_expires
  - failed_login_attempts, locked_until, last_login

### Step 0.2: 分析任务依赖关系 ✅
**前置条件**:
- ✅ PostgreSQL数据库运行中
- ✅ User和Proposal表已创建
- ✅ 依赖包已安装 (python-jose, passlib, python-multipart)

**任务依赖**:
- security.py → session.py (依赖数据库连接)
- session.py → dependencies.py (依赖会话管理)
- dependencies.py → auth.py (依赖认证功能)
- auth.py → main.py (路由注册)

### Step 0.3: 查询技术文档 (Context7) ✅
**已查询文档**:

1. **FastAPI安全认证** (`/fastapi/fastapi`)
   - OAuth2PasswordBearer token认证
   - OAuth2PasswordRequestForm表单验证
   - get_current_user依赖注入
   - JWT token验证最佳实践

2. **Passlib密码哈希** (`/websites/passlib_readthedocs_io_en_stable`)
   - CryptContext配置 (bcrypt算法)
   - hash() 和 verify() 方法
   - 自动hash升级策略

3. **Python-JOSE JWT** (`/mpdavis/python-jose`)
   - jwt.encode() 生成token
   - jwt.decode() 验证token
   - 过期时间和声明验证

**关键技术要点**:
```python
# 1. 密码哈希 (Passlib)
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed_password = pwd_context.hash(password)
pwd_context.verify(password, hashed_password)

# 2. JWT生成 (python-jose)
from jose import jwt
access_token = jwt.encode(data={"sub": user.email}, secret=SECRET_KEY, algorithm=ALGORITHM)

# 3. FastAPI认证依赖
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")
```

### Step 0.4: 确认外部依赖 ✅
**已满足的依赖**:
- ✅ `python-jose[cryptography] ^3.3.0` (pyproject.toml:17)
- ✅ `passlib[bcrypt] ^1.7.4` (pyproject.toml:18)
- ✅ `python-multipart ^0.0.12` (pyproject.toml:19)
- ✅ PostgreSQL 16 (Docker运行中)
- ✅ 环境变量配置 (config.py已有SECRET_KEY占位符)

**需要添加的环境变量**:
- JWT_SECRET_KEY: JWT签名密钥
- JWT_ALGORITHM: 默认HS256
- ACCESS_TOKEN_EXPIRE_MINUTES: token过期时间

---

## 💻 DEVELOPMENT EXECUTION PLAN

### 2.2.1: 核心安全模块实现 (0.3天)

**文件**: `backend/app/core/security.py`

**功能模块**:
```python
# 1. 密码哈希和验证
def get_password_hash(password: str) -> str
def verify_password(plain_password: str, hashed_password: str) -> bool

# 2. JWT token生成和验证
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str
def verify_token(token: str) -> Optional[str]

# 3. 教育邮箱检测
def is_edu_email(email: str) -> bool
```

**技术实现**:
- 使用Passlib CryptContext配置bcrypt
- JWT算法使用HS256，过期时间24小时
- 教育邮箱正则：`\.edu\.cn$|\.edu$|\.ac\.[a-z]{2}$`

### 2.2.2: 数据库会话管理 (0.2天)

**文件**: `backend/app/db/session.py`

**功能模块**:
```python
# 1. 异步数据库引擎
engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# 2. 依赖注入函数
async def get_db() -> AsyncSession
```

**技术实现**:
- 使用asyncpg驱动连接PostgreSQL
- 每个请求一个独立的数据库会话
- 使用contextmanager确保会话正确关闭

### 2.2.3: FastAPI依赖注入 (0.2天)

**文件**: `backend/app/core/dependencies.py`

**功能模块**:
```python
# 1. OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

# 2. 用户认证依赖
async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User
async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User
```

**技术实现**:
- 从JWT token中提取用户email
- 验证用户存在且处于active状态
- 处理token过期和无效token的异常

### 2.2.4: Pydantic Schema定义 (0.2天)

**文件**: `backend/app/schemas/auth.py`

**Schema定义**:
```python
# 请求模型
class UserRegister(BaseModel)
class UserLogin(BaseModel)
class Token(BaseModel)  # access_token, token_type

# 响应模型
class UserResponse(BaseModel)
class Token(BaseModel)  # access_token, token_type
```

**字段验证**:
- 邮箱格式验证 (Pydantic EmailStr)
- 密码最小长度8位
- 教育邮箱标记检测

### 2.2.5: 认证API路由实现 (0.4天)

**文件**: `backend/app/api/v1/auth.py`

**API端点**:
```python
# POST /api/v1/auth/register - 用户注册
# POST /api/v1/auth/login - 用户登录
# GET /api/v1/auth/me - 获取当前用户信息
# [预留] GET /api/v1/auth/verify-email - 邮箱验证
```

**功能实现**:
- 注册：邮箱重复检测、密码哈希、教育邮箱标记
- 登录：密码验证、JWT生成、last_login更新
- 获取用户信息：JWT验证、用户数据返回

**TODO-ALIYUN标记**:
```python
# TODO-ALIYUN: [邮件发送] - 需要配置阿里云DirectMail服务
# 发送邮箱验证邮件，依赖：
#   1. 阿里云DirectMail开通
#   2. 发信域名配置
#   3. 环境变量配置
# 预计工作量：2-3小时
# 优先级：P1
```

### 2.2.6: 集成到主应用 (0.1天)

**文件**: `backend/app/main.py`

**集成任务**:
- 导入auth路由
- 注册APIRouter: `/api/v1/auth`
- 配置CORS（如需要调整）
- 添加健康检查端点（测试用）

---

## 📊 文件创建清单

### 新建文件 (6个)
1. `backend/app/core/security.py` - 安全工具函数
2. `backend/app/db/session.py` - 数据库会话管理
3. `backend/app/core/dependencies.py` - FastAPI依赖注入
4. `backend/app/schemas/auth.py` - 认证相关Pydantic模型
5. `backend/app/api/v1/auth.py` - 认证API路由
6. `backend/app/models/__init__.py` - 模型导入（如需要）

### 修改文件 (2个)
1. `backend/app/core/config.py` - 添加JWT相关配置
2. `backend/app/main.py` - 注册认证路由

---

## 🔧 环境变量配置

**添加到 `.env.template`**:
```bash
# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours
```

**生成JWT密钥命令**:
```bash
openssl rand -hex 32
```

---

## ✅ 验收标准

### 功能验收
- [ ] 用户能成功注册（邮箱+密码）
- [ ] 重复邮箱注册失败
- [ ] 教育邮箱正确标记
- [ ] 用户能成功登录获取JWT token
- [ ] 无效登录失败（密码错误、用户不存在）
- [ ] JWT token验证成功获取用户信息
- [ ] 过期token正确拒绝访问

### 技术验收
- [ ] 密码使用bcrypt哈希（rounds=12）
- [ ] JWT token包含正确claims（sub、exp、iat）
- [ ] API响应时间 < 500ms
- [ ] 错误处理完善（401、400状态码）
- [ ] 所有API端点有Swagger文档

### 安全验收
- [ ] 密码明文永不存在于数据库
- [ ] JWT密钥从环境变量读取
- [ ] Token过期机制正常工作
- [ ] 邮箱重复检测有效
- [ ] 输入验证严格（Pydantic schema）

---

## 🧪 测试计划

### 手动测试用例
```bash
# 1. 用户注册
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","full_name":"Test User"}'

# 2. 用户登录
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=testpass123"

# 3. 获取用户信息
curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer <access_token>"
```

### 测试数据
- 普通邮箱用户：test@gmail.com
- 教育邮箱用户：test@pku.edu.cn
- 无效邮箱：invalid-email
- 弱密码：12345678
- 强密码：SecurePass123!

---

## 📝 技术债务记录

### Phase 2.2范围限制
- ⏸️ 不实现邮件发送（预留TODO-ALIYUN标记）
- ⏸️ 不实现验证码（预留接口）
- ⏸️ 不实现密码重置（Phase 3.5实现）
- ⏸️ 不实现账户锁定机制（预留字段已存在）

### Phase 3.5扩展计划
- 阿里云DirectMail邮件验证
- 阿里云验证码2.0人机验证
- 账户安全增强（失败次数限制）

---

## ⏱️ 时间表

| 任务 | 预计时间 | 依赖关系 |
|------|---------|----------|
| 2.2.1 核心安全模块 | 0.3天 | 无 |
| 2.2.2 数据库会话 | 0.2天 | 2.2.1 |
| 2.2.3 依赖注入 | 0.2天 | 2.2.2 |
| 2.2.4 Schema定义 | 0.2天 | 2.2.3 |
| 2.2.5 API路由 | 0.4天 | 2.2.4 |
| 2.2.6 主应用集成 | 0.1天 | 2.2.5 |
| **总计** | **1.5天** | **串行开发** |

---

**创建时间**: 2025-11-15
**创建者**: Claude Code
**文档版本**: v1.0
**状态**: 计划制定完成，等待执行确认
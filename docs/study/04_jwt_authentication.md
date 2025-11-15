# JWT 认证机制详解

> **适合人群**：了解 Web 开发基础的开发者
>
> **学习时长**：约 30-40 分钟
>
> **先修知识**：HTTP 基础、FastAPI 基础、密码学基本概念

---

## 📌 什么是 JWT？

**全称**：JSON Web Token（JSON 网络令牌）

**一句话解释**：JWT 是一种安全的、自包含的令牌，用于在前后端之间传递用户身份信息。

### 为什么需要JWT？

**问题场景**：你登录了一个网站，然后访问不同的页面，服务器怎么知道"这是你"？

**传统方案（Session + Cookie）**：
```
用户登录 → 服务器创建 Session（保存在服务器内存/Redis）
       → 返回 Session ID（保存在浏览器 Cookie）
       → 以后每次请求都带上 Cookie
       → 服务器根据 Cookie 查询 Session
```

**缺点**：
- ❌ 服务器需要存储所有用户的 Session（占内存）
- ❌ 多台服务器需要共享 Session（复杂）
- ❌ 不适合移动端（App没有Cookie机制）

**JWT 方案**：
```
用户登录 → 服务器生成 JWT（包含用户信息 + 签名）
       → 返回 JWT 给前端
       → 前端每次请求都在 Header 里带上 JWT
       → 服务器验证 JWT 签名（不需要查数据库）
```

**优点**：
- ✅ 无状态（服务器不保存任何信息）
- ✅ 易于扩展（多台服务器无需共享Session）
- ✅ 跨域友好（可用于App、小程序）

---

## 🔑 核心概念（用日常语言理解）

### 1. JWT 的结构 = 身份证

**类比**：JWT 就像你的身份证，包含三部分信息。

```
JWT = Header.Payload.Signature
     （头部） （载荷） （签名）
```

**示例 JWT**：
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IuW8oOS4iSIsImlhdCI6MTUxNjIzOTAyMn0.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**解码后**：

```json
// Header（头部）- 说明令牌类型和签名算法
{
  "alg": "HS256",  // 签名算法：HMAC SHA256
  "typ": "JWT"     // 令牌类型
}

// Payload（载荷）- 存放用户信息
{
  "sub": "1234567890",  // subject: 用户ID
  "name": "张三",        // 自定义字段：用户名
  "email": "zhangsan@example.com",
  "iat": 1516239022,    // issued at: 签发时间
  "exp": 1516325422     // expiration: 过期时间
}

// Signature（签名）- 防止篡改
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret  // 服务器的密钥（只有服务器知道）
)
```

**安全机制**：
- 前端可以解码 JWT，看到里面的信息（不要存放敏感信息如密码！）
- 但前端**无法伪造或篡改** JWT（因为没有密钥）
- 服务器通过验证签名，确保 JWT 没被篡改

### 2. 密码哈希 = 单向加密

**类比**：密码哈希就像把鸡蛋打碎 → 炒蛋，过程不可逆。

```python
原始密码: "MyPassword123"
           ↓ （哈希算法）
哈希值: "$2b$12$KIXl.QN5..."  # 不可逆！无法还原原始密码
```

**为什么要哈希？**
- ✅ **数据库被盗也安全**：黑客拿到哈希值也无法知道原密码
- ✅ **每次哈希结果不同**：同一个密码，每次哈希都不同（bcrypt 自带盐值）
- ✅ **验证密码**：用户登录时，对输入的密码哈希，与数据库里的哈希对比

**项目中使用的算法**：**bcrypt**（专为密码设计，比 MD5/SHA256 更安全）

---

## 💻 项目中的实际应用

### 示例 1：密码哈希与验证

**文件位置**：`backend/app/core/security.py`（根据项目实际情况）

```python
from passlib.context import CryptContext

# 创建密码上下文（使用 bcrypt 算法）
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """
    对密码进行哈希

    示例：
    >>> hash_password("MyPassword123")
    '$2b$12$KIXl.QN5uyFJVwY7Z4nQc.Y3gY6xU5QGJh8tRh3C6mKf8F1bNp7bS'

    参数说明：
    - $2b$：bcrypt 算法标识
    - 12：cost factor（哈希轮数 = 2^12 次，越高越安全但越慢）
    - 后面是随机盐值 + 哈希结果
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    验证密码是否正确

    工作原理：
    1. 从 hashed_password 中提取盐值
    2. 用相同的盐值对 plain_password 哈希
    3. 比较两个哈希值是否相同
    """
    return pwd_context.verify(plain_password, hashed_password)


# === 使用示例 ===
# 注册时
password = "MyPassword123"
hashed = hash_password(password)
# 保存 hashed 到数据库

# 登录时
input_password = "MyPassword123"  # 用户输入
db_hashed = "$2b$12$KIXl..."  # 从数据库读取
is_valid = verify_password(input_password, db_hashed)
# 返回 True 表示密码正确
```

### 示例 2：JWT 令牌生成

**文件位置**：`backend/app/core/security.py`

```python
from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """
    生成 JWT 访问令牌

    参数：
    - data: 要编码到 JWT 的数据（通常是 user_id）
    - expires_delta: 过期时间（默认 24 小时）

    返回：
    - JWT 字符串
    """
    to_encode = data.copy()  # 复制数据（避免修改原字典）

    # 设置过期时间
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)

    # 添加过期时间到 payload
    to_encode.update({"exp": expire})

    # 编码生成 JWT
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,  # 🔑 密钥（从配置读取）
        algorithm=settings.JWT_ALGORITHM  # HS256
    )

    return encoded_jwt


# === 使用示例 ===
# 用户登录成功后
user_id = 123
token = create_access_token(
    data={"sub": str(user_id), "username": "zhangsan"},
    expires_delta=timedelta(hours=24)
)
# 返回给前端：{"access_token": "eyJhbGc...", "token_type": "bearer"}
```

### 示例 3：JWT 令牌验证

```python
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# 定义 OAuth2 认证方案（从 Header 的 Authorization 字段获取 token）
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

def verify_token(token: str) -> dict:
    """
    验证 JWT 令牌

    返回：
    - payload: JWT 中的数据（如 user_id）

    异常：
    - 令牌无效、过期、签名错误 → 抛出 HTTPException
    """
    try:
        # 解码 JWT（会自动验证签名和过期时间）
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭证",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    获取当前登录用户（依赖注入函数）

    工作流程：
    1. FastAPI 自动从 Header 提取 token
    2. 验证 token 并解码
    3. 从数据库查询用户
    4. 返回 User 对象

    使用方法：
    @app.get("/users/me")
    async def get_me(current_user: User = Depends(get_current_user)):
        return current_user
    """
    # Step 1: 验证 token
    payload = verify_token(token)
    user_id = payload.get("sub")  # 从 payload 获取 user_id

    if user_id is None:
        raise HTTPException(status_code=401, detail="无效的认证凭证")

    # Step 2: 查询用户
    stmt = select(User).where(User.id == int(user_id))
    result = await db.execute(stmt)
    user = result.scalars().one_or_none()

    if user is None:
        raise HTTPException(status_code=404, detail="用户不存在")

    return user
```

### 示例 4：注册和登录 API

**文件位置**：`backend/app/api/v1/auth.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter()

@router.post("/register")
async def register(
    username: str,
    email: str,
    password: str,
    db: AsyncSession = Depends(get_db)
):
    """
    用户注册

    步骤：
    1. 检查邮箱是否已存在
    2. 对密码进行哈希
    3. 创建用户记录
    4. 返回成功信息
    """
    # Step 1: 检查邮箱是否已注册
    stmt = select(User).where(User.email == email)
    existing_user = (await db.execute(stmt)).scalars().one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已被注册"
        )

    # Step 2: 哈希密码
    hashed_password = hash_password(password)

    # Step 3: 创建用户
    new_user = User(
        username=username,
        email=email,
        full_name=username,  # 默认使用用户名
        hashed_password=hashed_password
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return {
        "message": "注册成功",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email
        }
    }


@router.post("/login")
async def login(
    email: str,
    password: str,
    db: AsyncSession = Depends(get_db)
):
    """
    用户登录

    步骤：
    1. 查询用户
    2. 验证密码
    3. 生成 JWT
    4. 返回 token
    """
    # Step 1: 查询用户
    stmt = select(User).where(User.email == email)
    user = (await db.execute(stmt)).scalars().one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误"
        )

    # Step 2: 验证密码
    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误"
        )

    # Step 3: 生成 JWT
    access_token = create_access_token(
        data={"sub": str(user.id), "username": user.username}
    )

    # Step 4: 返回 token
    return {
        "access_token": access_token,
        "token_type": "bearer",  # 🔑 标准 OAuth2 格式
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }


@router.get("/me")
async def get_me(
    current_user: User = Depends(get_current_user)  # 🔑 依赖注入验证
):
    """
    获取当前用户信息

    需要在 Header 中携带 token：
    Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
    """
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "is_active": current_user.is_active
    }
```

---

## 🎯 快速上手指南

### Step 1：前端调用注册 API

```javascript
// 注册
const response = await fetch('http://localhost:8000/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'zhangsan',
    email: 'zhangsan@example.com',
    password: 'MyPassword123'
  })
});

const data = await response.json();
console.log(data); // { message: "注册成功", user: {...} }
```

### Step 2：前端调用登录 API

```javascript
// 登录
const response = await fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'zhangsan@example.com',
    password: 'MyPassword123'
  })
});

const data = await response.json();
// { access_token: "eyJhbGc...", token_type: "bearer", user: {...} }

// 保存 token 到 localStorage
localStorage.setItem('access_token', data.access_token);
```

### Step 3：前端携带 token 访问受保护的 API

```javascript
// 获取当前用户信息
const token = localStorage.getItem('access_token');

const response = await fetch('http://localhost:8000/api/v1/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`  // 🔑 携带 token
  }
});

const user = await response.json();
console.log(user); // { id: 1, username: "zhangsan", ... }
```

---

## ⚠️ 常见陷阱（新手必看）

### 陷阱 1：在 JWT 中存放敏感信息

```javascript
// ❌ 错误：把密码、信用卡号存入 JWT
const token = create_access_token({
  "user_id": 123,
  "password": "MyPassword123",  // ❌ 千万不要！
  "credit_card": "1234-5678-9012-3456"  // ❌ 千万不要！
})

// ✅ 正确：只存放必要的、非敏感信息
const token = create_access_token({
  "sub": "123",  // 用户ID
  "username": "zhangsan",
  "role": "user"  // 角色
})
```

**为什么？** JWT 的 payload 可以被任何人解码（只是 Base64 编码，不是加密！）

### 陷阱 2：密钥（SECRET_KEY）泄露

```python
# ❌ 错误：把密钥写死在代码里
JWT_SECRET_KEY = "my-secret-key"  # ❌ 提交到 GitHub → 泄露！

# ✅ 正确：从环境变量读取
from app.core.config import settings
JWT_SECRET_KEY = settings.JWT_SECRET_KEY  # 从 .env 文件读取
```

**生成强密钥的方法**：
```bash
# 生成 32 字节随机字符串
python -c "import secrets; print(secrets.token_urlsafe(32))"
# 输出：xQz5n7K8mP2L9oT4hW6vR3cE1aF8dG0jY5uI2bN7qM4sA9x
```

### 陷阱 3：忘记设置过期时间

```python
# ❌ 错误：JWT 永不过期
token = create_access_token(data={"user_id": 123})
# 如果 token 被盗，永远有效！

# ✅ 正确：设置合理的过期时间
token = create_access_token(
    data={"user_id": 123},
    expires_delta=timedelta(hours=24)  # 24小时后过期
)
```

**推荐过期时间**：
- 访问令牌（Access Token）：15分钟 - 24小时
- 刷新令牌（Refresh Token）：7天 - 30天

### 陷阱 4：使用弱密码哈希算法

```python
# ❌ 错误：使用 MD5 或 SHA256
import hashlib
hashed = hashlib.md5(password.encode()).hexdigest()
# MD5 已被破解，不安全！

# ❌ 错误：SHA256 也不适合密码
hashed = hashlib.sha256(password.encode()).hexdigest()
# SHA256 太快，容易被暴力破解

# ✅ 正确：使用 bcrypt（专为密码设计）
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed = pwd_context.hash(password)
# bcrypt 慢（故意的），增加破解难度
```

---

## 📚 学习资源

### 官方资源
- **JWT 官网**：https://jwt.io/
- **FastAPI 安全指南**：https://fastapi.tiangolo.com/tutorial/security/
- **python-jose 文档**：https://python-jose.readthedocs.io/
- **passlib 文档**：https://passlib.readthedocs.io/

### 项目中的参考文件
- **安全工具**：`backend/app/core/security.py` - JWT 和密码工具
- **认证 API**：`backend/app/api/v1/auth.py` - 注册/登录端点
- **User 模型**：`backend/app/models/user.py:39` - 用户数据模型
- **配置文件**：`backend/app/core/config.py:132` - JWT 配置

---

## ✅ 学习检查清单

完成以下任务，说明你已经掌握 JWT 认证机制：

- [ ] **理解 JWT 结构**：能解释 Header、Payload、Signature 的作用
- [ ] **理解密码哈希**：知道为什么要用 bcrypt 而不是 MD5
- [ ] **能生成 JWT**：会调用 `create_access_token()` 函数
- [ ] **能验证 JWT**：会调用 `verify_token()` 函数
- [ ] **能实现注册**：会写注册 API（哈希密码 + 保存用户）
- [ ] **能实现登录**：会写登录 API（验证密码 + 生成 token）
- [ ] **能保护路由**：会使用 `Depends(get_current_user)` 保护 API
- [ ] **知道安全要点**：不在 JWT 存敏感信息、设置过期时间

---

## 🎓 下一步学习

完成本文档后，建议继续学习：

1. **前端集成**：学习 React 中如何使用 Zustand 管理认证状态
2. **刷新令牌**：实现 Access Token + Refresh Token 双令牌机制
3. **项目实战**：完善项目的 `backend/app/api/v1/auth.py` 文件

---

**文档版本**：v1.0
**最后更新**：2025-11-15
**维护者**：InnoLiber Team
**安全提示**：请定期更新密钥，并启用 HTTPS

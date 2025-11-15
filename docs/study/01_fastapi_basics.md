# FastAPI 基础入门

> **适合人群**：Python 入门级开发者，想要快速学习 Web API 开发
>
> **学习时长**：约 30-40 分钟
>
> **先修知识**：Python 基础语法、HTTP 基本概念

---

## 📌 什么是 FastAPI？

**一句话解释**：FastAPI 是一个现代、快速的 Python Web 框架，专门用来构建 API 服务。

### 为什么选择 FastAPI？

想象你要开一家餐厅（后端 API），顾客（前端应用）需要点菜（发送请求）。FastAPI 就像一个超高效的点餐系统：

1. **自动验证菜单**（数据验证）：顾客点了一份"牛排（medium）"，系统自动检查你是不是真的有这道菜，以及"medium"这个要求是否合法。
2. **自动生成菜单手册**（自动文档）：系统会自动为你生成一份漂亮的菜单，顾客可以在网上查看。
3. **速度快**（高性能）：使用异步技术，同时服务多个顾客，不会让一个顾客慢了就影响其他人。

### 在 InnoLiber 项目中的应用

在我们的项目中，FastAPI 负责：
- ✅ **处理用户请求**：登录、注册、创建标书等
- ✅ **连接数据库**：读取和保存标书数据
- ✅ **与前端通信**：返回 JSON 格式的数据
- ✅ **保护用户隐私**：JWT 认证、密码加密

**代码位置**：`backend/app/main.py`

---

## 🔑 核心概念（用日常语言理解）

### 1. 路由（Routes）= 餐厅的不同菜单

**类比**：餐厅有不同的区域（正餐区、甜品区、饮料区），每个区域提供不同的服务。

**代码示例**（来自项目 `backend/app/main.py:124`）：

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")  # 🏠 首页路由 - 当访问 http://localhost:8000/ 时触发
async def root():
    """
    这是最简单的路由示例
    - @app.get("/") 表示：监听GET请求，路径是"/"
    - async def 表示：这是一个异步函数（可以同时处理多个请求）
    - 返回值会自动转换为 JSON 格式
    """
    return {
        "message": "InnoLiber API Service",
        "version": "0.1.0",
        "status": "running"
    }
```

**URL 访问示例**：
```bash
# 在浏览器或 curl 中访问
http://localhost:8000/

# 返回结果（JSON）
{
  "message": "InnoLiber API Service",
  "version": "0.1.0",
  "status": "running"
}
```

### 2. 路径参数（Path Parameters）= 指定具体的菜品编号

**类比**：顾客说"我要 5 号桌的订单"，这个"5"就是路径参数。

**项目实例**（类似 `backend/app/api/v1/proposals.py` 的设计）：

```python
@app.get("/proposals/{proposal_id}")
async def get_proposal_detail(proposal_id: int):
    """
    获取指定标书的详情
    - {proposal_id} 是路径参数，会从 URL 中提取
    - proposal_id: int 表示这个参数必须是整数类型
    - FastAPI 会自动验证：如果传入的不是整数，返回 422 错误
    """
    return {
        "proposal_id": proposal_id,
        "title": "2024年人工智能研究项目申请书",
        "status": "draft"
    }
```

**URL 示例**：
```bash
# ✅ 正确：传入整数
GET http://localhost:8000/proposals/123
→ 返回: {"proposal_id": 123, "title": "...", "status": "draft"}

# ❌ 错误：传入字符串
GET http://localhost:8000/proposals/abc
→ 返回: 422 Unprocessable Entity (验证失败)
```

### 3. 查询参数（Query Parameters）= 额外的筛选条件

**类比**：顾客说"我要牛排，要七分熟，不要洋葱"。"七分熟"和"不要洋葱"就是查询参数。

**代码示例**：

```python
from typing import Union

@app.get("/proposals")
async def list_proposals(
    status: Union[str, None] = None,  # 可选参数：按状态筛选
    skip: int = 0,                     # 默认值：跳过前 0 条
    limit: int = 20                    # 默认值：每页 20 条
):
    """
    获取标书列表（支持分页和筛选）
    - status: 可选，筛选特定状态的标书（draft/submitted/approved）
    - skip: 跳过前N条记录（用于分页）
    - limit: 每页显示多少条
    """
    return {
        "total": 100,
        "items": [
            {"id": 1, "title": "标书A", "status": "draft"},
            {"id": 2, "title": "标书B", "status": "submitted"}
        ],
        "page": {"skip": skip, "limit": limit}
    }
```

**URL 示例**：
```bash
# 基础查询（使用默认值）
GET http://localhost:8000/proposals
→ 返回前20条标书

# 带筛选条件
GET http://localhost:8000/proposals?status=draft
→ 只返回状态为 draft 的标书

# 分页查询（第2页，每页10条）
GET http://localhost:8000/proposals?skip=10&limit=10
→ 返回第11-20条标书
```

### 4. 依赖注入（Dependency Injection）= 餐厅的统一配料准备

**类比**：每道菜都需要盐和油，不用每个厨师自己准备，由中央厨房统一配送。

**项目实例**（来自 `backend/app/db/session.py:128`）：

```python
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    数据库会话依赖注入函数

    白话解释：
    - 这个函数负责"借出"一个数据库连接
    - 用完后自动"归还"连接到连接池
    - 就像图书馆借书：借 → 使用 → 归还
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session  # 借出数据库连接
        finally:
            await session.close()  # 自动归还

# 在路由中使用依赖注入
@app.get("/users/me")
async def get_current_user_info(
    db: AsyncSession = Depends(get_db)  # 🔑 依赖注入：自动获取数据库连接
):
    """
    FastAPI 会自动调用 get_db()，然后把返回的 session 传给 db 参数
    """
    # 现在可以直接使用 db 进行数据库操作
    user = await db.execute(select(User).where(User.id == 1))
    return {"user": user}
```

**为什么要用依赖注入？**
1. **避免重复代码**：不用在每个函数里都写一遍"获取数据库连接"
2. **自动资源管理**：函数结束后自动释放连接
3. **易于测试**：可以轻松替换为测试用的假数据库

---

## 💻 项目中的实际应用

### 示例 1：健康检查接口

**文件位置**：`backend/app/main.py:154`

```python
@app.get("/health")
async def health_check():
    """
    健康检查接口 - 用途说明：

    1. 监控系统：每分钟自动访问这个接口，检查服务是否在线
    2. 负载均衡器：判断这个服务器是否可以接收新请求
    3. 容器编排（Kubernetes）：决定是否需要重启服务

    返回格式：
    - status: "healthy" 表示服务正常运行
    - service: 服务名称，便于识别
    """
    return {
        "status": "healthy",
        "service": "innoliber-backend"
    }
```

**实际测试**：
```bash
# 使用 curl 命令测试
curl http://localhost:8000/health

# 预期返回
{"status": "healthy", "service": "innoliber-backend"}
```

### 示例 2：CORS 中间件配置

**文件位置**：`backend/app/main.py:98`

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # 允许的前端域名
    allow_credentials=True,                # 允许携带Cookie
    allow_methods=["*"],                   # 允许所有HTTP方法
    allow_headers=["*"],                   # 允许所有请求头
)
```

**白话解释 - 什么是 CORS？**

**类比**：你家（前端 `http://localhost:5173`）想去隔壁超市（后端 `http://localhost:8000`）买东西。

- **没有 CORS**：保安说"你不是我们小区的，不能进！" → ❌ 浏览器阻止请求
- **有 CORS**：保安看到通行证说"你被允许了，请进！" → ✅ 请求成功

**配置说明**：
- `allow_origins`：哪些网站可以访问我的 API（白名单）
- `allow_credentials`：允许发送 Cookie（用于身份认证）
- `allow_methods`：允许哪些 HTTP 方法（GET、POST、PUT、DELETE 等）

---

## 🎯 快速上手指南

### Step 1：最小可运行示例

创建文件 `test_api.py`：

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def hello_world():
    return {"message": "Hello, FastAPI!"}

@app.get("/greet/{name}")
def greet_user(name: str):
    return {"greeting": f"你好，{name}！"}
```

运行命令：
```bash
# 安装 FastAPI 和 uvicorn
pip install fastapi uvicorn

# 启动服务器
uvicorn test_api:app --reload

# 访问 API 文档（自动生成！）
# 打开浏览器：http://localhost:8000/docs
```

### Step 2：测试 API

使用浏览器或 curl：
```bash
# 测试根路径
curl http://localhost:8000/
→ {"message": "Hello, FastAPI!"}

# 测试路径参数
curl http://localhost:8000/greet/张三
→ {"greeting": "你好，张三！"}
```

### Step 3：理解项目代码

打开 `backend/app/main.py`，尝试：

1. **找到所有路由**：搜索 `@app.get` 或 `@app.post`
2. **理解健康检查**：看 `health_check()` 函数
3. **查看 CORS 配置**：找到 `add_middleware` 部分

---

## ⚠️ 常见陷阱（新手必看）

### 陷阱 1：路由定义顺序很重要

```python
# ❌ 错误示例：顺序错误
@app.get("/users/{user_id}")
async def get_user(user_id: str):
    return {"user_id": user_id}

@app.get("/users/me")  # 永远不会被执行！
async def get_current_user():
    return {"user": "current"}

# 问题：访问 /users/me 时，FastAPI 会匹配第一个路由
# 把 "me" 当作 user_id 参数传入

# ✅ 正确示例：固定路径放前面
@app.get("/users/me")
async def get_current_user():
    return {"user": "current"}

@app.get("/users/{user_id}")
async def get_user(user_id: str):
    return {"user_id": user_id}
```

**解决方案**：固定路径（如 `/users/me`）必须定义在动态路径（如 `/users/{user_id}`）之前。

### 陷阱 2：忘记使用 async/await

```python
# ❌ 错误：在 async 函数中不使用 await
@app.get("/data")
async def get_data(db: AsyncSession = Depends(get_db)):
    result = db.execute(select(User))  # 缺少 await
    return result

# ✅ 正确：记得 await 异步操作
@app.get("/data")
async def get_data(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))  # ✅ 使用 await
    return result.scalars().all()
```

**记忆口诀**：
- 函数用 `async def` 定义 → 调用异步函数时必须 `await`
- 数据库操作、网络请求等耗时操作 → 都需要 `await`

### 陷阱 3：CORS 配置过于宽松

```python
# ⚠️ 危险：生产环境不要这样写！
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有网站访问（安全风险！）
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 安全：明确指定允许的域名
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",     # 开发环境前端
        "https://innoliber.com"      # 生产环境前端
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

**安全提示**：生产环境必须明确指定允许的域名，不要用 `*`。

---

## 📚 学习资源

### 官方资源
- **FastAPI 官方文档**：https://fastapi.tiangolo.com/zh/
- **Context7 FastAPI 文档**：`/fastapi/fastapi` (已查询)
- **交互式 API 文档**：启动项目后访问 `http://localhost:8000/docs`

### 项目中的参考文件
- **主应用入口**：`backend/app/main.py:41` - FastAPI 实例化
- **健康检查**：`backend/app/main.py:154` - 简单路由示例
- **配置管理**：`backend/app/core/config.py:46` - Settings 类

### 推荐学习路径
1. ✅ **本文档**：理解基础概念
2. 📖 **运行项目**：`cd backend && poetry run uvicorn app.main:app --reload`
3. 🌐 **访问文档**：http://localhost:8000/docs（Swagger UI）
4. 💻 **修改代码**：尝试添加一个新路由
5. 🔍 **阅读源码**：查看 `backend/app/api/v1/auth.py`（认证路由）

### 视频教程推荐
- **B站搜索**："FastAPI 快速入门"（中文字幕）
- **YouTube**："FastAPI Tutorial for Beginners"

---

## ✅ 学习检查清单

完成以下任务，说明你已经掌握 FastAPI 基础：

- [ ] **理解 FastAPI 是什么**：能用自己的话解释给朋友听
- [ ] **能创建简单路由**：GET `/hello` 返回 JSON
- [ ] **理解路径参数**：能从 URL 中提取 `{user_id}` 并使用
- [ ] **理解查询参数**：能处理 `?name=xxx&age=20` 这样的参数
- [ ] **知道 async/await**：理解为什么要用异步，什么时候需要 await
- [ ] **能阅读项目代码**：打开 `backend/app/main.py` 能看懂每一行
- [ ] **能使用 Swagger UI**：访问 `/docs` 并测试 API
- [ ] **知道 CORS 是什么**：能解释为什么需要 CORS 配置

---

## 🎓 下一步学习

完成本文档后，建议继续学习：

1. **数据验证**：`02_sqlalchemy_async.md` - 数据库操作
2. **认证系统**：`04_jwt_authentication.md` - JWT 认证机制
3. **项目实战**：尝试修改 `backend/app/api/v1/auth.py` 添加新功能

---

**文档版本**：v1.0
**最后更新**：2025-11-15
**维护者**：InnoLiber Team
**反馈渠道**：项目 GitHub Issues

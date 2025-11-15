# SQLAlchemy 2.0 异步操作详解

> **适合人群**：了解 Python 基础和简单 SQL 语句的开发者
>
> **学习时长**：约 40-50 分钟
>
> **先修知识**：Python 基础、async/await 语法、FastAPI 基础

---

## 📌 什么是 SQLAlchemy？

**一句话解释**：SQLAlchemy 是 Python 的 ORM（对象关系映射）工具，让你用 Python 对象操作数据库，不用写 SQL 语句。

### 为什么需要 ORM？

**类比**：想象你要从图书馆（数据库）借书。

**没有 ORM（传统方式）**：
```python
# 需要写原始 SQL 语句
cursor.execute("SELECT * FROM books WHERE author = '张三' AND year > 2020")
results = cursor.fetchall()
# 返回的是元组列表：[('书名1', '张三', 2021), ('书名2', '张三', 2022')]
```

**有 ORM（SQLAlchemy）**：
```python
# 用 Python 对象操作
books = session.query(Book).filter(
    Book.author == '张三',
    Book.year > 2020
).all()
# 返回的是对象列表：[<Book('书名1')>, <Book('书名2')>]
# 可以直接访问：books[0].title, books[0].author
```

### 什么是异步（Async）？

**类比**：你在咖啡馆点了一杯咖啡（数据库查询）：

- **同步（传统方式）**：你站在柜台前死等 5 分钟，咖啡做好才走（阻塞）
- **异步（Async）**：你点完咖啡拿了号码牌，去座位上刷手机，叫号了再去取（非阻塞）

在 Web 服务器中，异步可以让一个服务器同时处理上千个请求，而不是一个接一个慢慢处理。

---

## 🔑 核心概念（用日常语言理解）

### 1. ORM 模型（Model）= 数据库表的 Python 类

**项目实例**（来自 `backend/app/models/user.py:39`）：

```python
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from .base import Base

class User(Base):
    """
    用户模型 - 对应数据库中的 users 表

    白话解释：
    - User 类 = users 表
    - User 的每个实例 = users 表中的一行数据
    - User 的每个属性 = users 表中的一列（字段）
    """
    __tablename__ = "users"  # 🔑 指定数据库表名

    # 字段定义（每个字段对应数据库的一列）
    id = Column(Integer, primary_key=True, index=True)  # 主键，自动递增
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)  # 密码哈希值

    # 状态标记
    is_active = Column(Boolean, default=True)  # 账户是否激活
    is_superuser = Column(Boolean, default=False)  # 是否为管理员

    # 时间戳（自动生成）
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

**字段类型说明**：
- `Integer`：整数（如 ID、年龄）
- `String(长度)`：字符串（如用户名、邮箱）
- `Boolean`：布尔值（True/False）
- `DateTime`：日期时间
- `primary_key=True`：主键（唯一标识）
- `unique=True`：不能重复（如邮箱、用户名）
- `nullable=False`：不能为空（必填）

### 2. 数据库会话（Session）= 与数据库的"对话通道"

**类比**：Session 就像你与数据库的"电话线"。

**项目实例**（来自 `backend/app/db/session.py:115`）：

```python
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from typing import AsyncGenerator

# 创建异步数据库引擎（连接池）
engine = create_async_engine(
    settings.DATABASE_URL,  # 数据库连接字符串
    echo=settings.ENV == "development",  # 开发环境显示SQL日志
    pool_size=20,  # 连接池大小
    max_overflow=30,  # 最大溢出连接数
    pool_pre_ping=True,  # 健康检查
)

# 创建会话工厂（异步）
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,  # 🔑 提交后对象不过期（重要！）
    autoflush=True,
    autocommit=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    数据库会话依赖注入函数

    白话解释：
    1. 借出一个数据库连接（yield session）
    2. 用完自动归还（finally: await session.close()）
    3. 就像图书馆借书：借 → 使用 → 归还
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session  # 🎁 "借出"数据库会话
        finally:
            await session.close()  # 🔒 自动关闭会话
```

**为什么需要会话？**
- **事务管理**：多个操作要么全成功，要么全失败（原子性）
- **连接池管理**：复用连接，提高性能
- **对象追踪**：Session 会追踪对象的修改状态

### 3. CRUD 操作 = 增删改查

**项目实例**（结合实际使用场景）：

#### **C - Create（创建）**

```python
from app.models.user import User
from app.db.session import get_db
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

@app.post("/users/")
async def create_user(
    username: str,
    email: str,
    db: AsyncSession = Depends(get_db)
):
    """
    创建新用户

    步骤：
    1. 创建 User 对象
    2. 添加到 session
    3. 提交到数据库
    """
    # Step 1: 创建 Python 对象
    new_user = User(
        username=username,
        email=email,
        full_name="张三",
        hashed_password="hashed_password_here"
    )

    # Step 2: 添加到 session（标记为"待保存"）
    db.add(new_user)

    # Step 3: 提交到数据库（执行 INSERT）
    await db.commit()

    # Step 4: 刷新对象（获取数据库生成的 ID）
    await db.refresh(new_user)

    return {"id": new_user.id, "username": new_user.username}
```

#### **R - Read（查询）**

```python
from sqlalchemy import select

@app.get("/users/{user_id}")
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    查询单个用户

    SQLAlchemy 2.0 推荐使用 select() 语法
    """
    # 构建查询语句
    stmt = select(User).where(User.id == user_id)

    # 执行查询（await 等待数据库返回）
    result = await db.execute(stmt)

    # 获取结果（scalars() 返回对象，而不是元组）
    user = result.scalars().one_or_none()

    if user is None:
        raise HTTPException(status_code=404, detail="用户不存在")

    return {"id": user.id, "username": user.username}

@app.get("/users/")
async def list_users(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """
    查询用户列表（分页）
    """
    stmt = select(User).offset(skip).limit(limit).order_by(User.id)
    result = await db.execute(stmt)
    users = result.scalars().all()  # .all() 返回列表

    return {"total": len(users), "users": users}
```

#### **U - Update（更新）**

```python
@app.put("/users/{user_id}")
async def update_user(
    user_id: int,
    new_username: str,
    db: AsyncSession = Depends(get_db)
):
    """
    更新用户信息

    步骤：
    1. 查询用户
    2. 修改属性
    3. 提交到数据库
    """
    # Step 1: 查询用户
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalars().one_or_none()

    if user is None:
        raise HTTPException(status_code=404, detail="用户不存在")

    # Step 2: 修改属性
    user.username = new_username

    # Step 3: 提交（Session 会自动检测到对象被修改）
    await db.commit()

    # Step 4: 刷新对象（获取 updated_at 时间戳）
    await db.refresh(user)

    return {"id": user.id, "username": user.username}
```

#### **D - Delete（删除）**

```python
@app.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    删除用户
    """
    # Step 1: 查询用户
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalars().one_or_none()

    if user is None:
        raise HTTPException(status_code=404, detail="用户不存在")

    # Step 2: 标记为删除
    await db.delete(user)

    # Step 3: 提交
    await db.commit()

    return {"message": "用户已删除"}
```

### 4. 关系（Relationships）= 表之间的连接

**项目实例**（`backend/app/models/user.py` 和 `proposal.py`）：

```python
# === User 模型（一对多：一个用户有多个标书）===
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True)

    # 关系定义：一个用户有多个标书
    # proposals = relationship("Proposal", back_populates="user")


# === Proposal 模型（多对一：一个标书属于一个用户）===
class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))  # 🔑 外键

    # 关系定义：反向引用用户
    # user = relationship("User", back_populates="proposals")
```

**白话解释**：
- `ForeignKey("users.id")`：告诉数据库"这个字段指向 users 表的 id"
- `relationship()`：在 Python 中建立对象之间的连接
- `back_populates`：双向关系（User 能访问 proposals，Proposal 能访问 user）

**使用关系查询**：

```python
# 查询用户及其所有标书
from sqlalchemy.orm import selectinload

stmt = select(User).where(User.id == 1).options(
    selectinload(User.proposals)  # 🔑 预加载关系（避免 N+1 问题）
)
result = await db.execute(stmt)
user = result.scalars().one()

# 访问关系
print(f"用户 {user.username} 有 {len(user.proposals)} 个标书")
for proposal in user.proposals:
    print(f"  - {proposal.title}")
```

---

## 💻 项目中的实际应用

### 示例 1：Base 模型定义（SQLAlchemy 2.0 新特性）

**文件位置**：`backend/app/models/base.py:1`

```python
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase

class Base(AsyncAttrs, DeclarativeBase):
    """
    所有模型的基类

    SQLAlchemy 2.0 新特性：
    1. DeclarativeBase：取代旧的 declarative_base()
    2. AsyncAttrs：支持异步访问关系（await obj.awaitable_attrs.relationship）
    """
    pass
```

**为什么要这样写？**
- `DeclarativeBase`：SQLAlchemy 2.0 推荐的基类写法
- `AsyncAttrs`：支持异步环境下访问懒加载的关系

### 示例 2：数据库引擎配置（连接池）

**文件位置**：`backend/app/db/session.py:84`

```python
engine = create_async_engine(
    settings.DATABASE_URL,  # postgresql+asyncpg://user:pass@host:5432/db
    echo=settings.ENV == "development",  # 开发环境显示 SQL 日志
    pool_size=20,  # 🔑 连接池大小（同时保持 20 个连接）
    max_overflow=30,  # 🔑 最大溢出数（超出pool_size后最多再创建30个）
    pool_pre_ping=True,  # 🔑 连接前先 ping，确保连接有效
    pool_recycle=3600,  # 🔑 1小时回收连接（避免 MySQL 8小时超时）
)
```

**参数说明**：
- `pool_size`：常驻连接数（就像银行常开的柜台）
- `max_overflow`：临时连接数（客户多了临时开的柜台）
- `pool_pre_ping`：使用前检查连接是否还活着
- `pool_recycle`：定期"换血"，避免长时间连接被服务器断开

### 示例 3：Session 配置（expire_on_commit）

**文件位置**：`backend/app/db/session.py:115`

```python
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,  # 🔑 非常重要的设置！
    autoflush=True,
    autocommit=False,
)
```

**为什么 `expire_on_commit=False` 很重要？**

```python
# ❌ 如果 expire_on_commit=True（默认值）
user = User(username="zhangsan")
db.add(user)
await db.commit()  # 提交后，user 对象的属性会"过期"
print(user.username)  # ❌ 报错！需要重新从数据库加载

# ✅ 如果 expire_on_commit=False
user = User(username="zhangsan")
db.add(user)
await db.commit()  # 提交后，user 对象的属性仍然有效
print(user.username)  # ✅ 正常输出 "zhangsan"
```

---

## 🎯 快速上手指南

### Step 1：定义模型

创建文件 `test_models.py`：

```python
from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase

class Base(AsyncAttrs, DeclarativeBase):
    pass

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    author = Column(String(100), nullable=False)
    year = Column(Integer)
```

### Step 2：创建表

```python
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine

async def create_tables():
    engine = create_async_engine("sqlite+aiosqlite:///test.db")

    async with engine.begin() as conn:
        # 创建所有表
        await conn.run_sync(Base.metadata.create_all)

    await engine.dispose()

# 运行
asyncio.run(create_tables())
```

### Step 3：插入数据

```python
from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession

async def insert_books():
    engine = create_async_engine("sqlite+aiosqlite:///test.db")
    async_session = async_sessionmaker(engine, class_=AsyncSession)

    async with async_session() as session:
        async with session.begin():
            # 创建书籍对象
            session.add_all([
                Book(title="Python编程", author="张三", year=2020),
                Book(title="Web开发", author="李四", year=2021),
            ])
        # 退出 begin() 块时自动提交

    await engine.dispose()

asyncio.run(insert_books())
```

### Step 4：查询数据

```python
from sqlalchemy import select

async def query_books():
    engine = create_async_engine("sqlite+aiosqlite:///test.db")
    async_session = async_sessionmaker(engine, class_=AsyncSession)

    async with async_session() as session:
        # 查询所有书籍
        stmt = select(Book).order_by(Book.year)
        result = await session.execute(stmt)
        books = result.scalars().all()

        for book in books:
            print(f"{book.title} - {book.author} ({book.year})")

    await engine.dispose()

asyncio.run(query_books())
```

---

## ⚠️ 常见陷阱（新手必看）

### 陷阱 1：忘记使用 await

```python
# ❌ 错误：忘记 await
result = db.execute(select(User))  # 返回的是 coroutine 对象，不是结果
users = result.scalars().all()  # 报错！

# ✅ 正确：记得 await
result = await db.execute(select(User))  # ✅ await 等待查询完成
users = result.scalars().all()  # ✅ 正确获取结果
```

**记忆口诀**：所有数据库操作都需要 `await`（execute, commit, refresh, delete 等）。

### 陷阱 2：Session 生命周期管理错误

```python
# ❌ 错误：在 session 外部访问对象
async def bad_example():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.id == 1))
        user = result.scalars().one()
    # session 已关闭！

    print(user.username)  # ❌ 可能报错或返回 None

# ✅ 正确：在 session 内部使用完毕
async def good_example():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.id == 1))
        user = result.scalars().one()
        print(user.username)  # ✅ 在 session 内部访问
        # 或者设置 expire_on_commit=False
```

### 陷阱 3：N+1 查询问题

```python
# ❌ 错误：N+1 问题（性能杀手）
users = (await db.execute(select(User))).scalars().all()
for user in users:  # 循环 N 次
    # 每次循环都查询一次数据库！
    proposals = (await db.execute(
        select(Proposal).where(Proposal.user_id == user.id)
    )).scalars().all()
    print(f"{user.username}: {len(proposals)} 个标书")
# 总共执行：1（查用户）+ N（每个用户查标书）= N+1 次查询

# ✅ 正确：使用 joinedload 或 selectinload 预加载
from sqlalchemy.orm import selectinload

stmt = select(User).options(selectinload(User.proposals))
users = (await db.execute(stmt)).scalars().all()
for user in users:
    print(f"{user.username}: {len(user.proposals)} 个标书")
# 总共执行：2 次查询（一次查用户，一次查所有标书）
```

**解决方案**：
- `selectinload()`：适用于一对多关系（推荐）
- `joinedload()`：适用于一对一关系

### 陷阱 4：忘记提交事务

```python
# ❌ 错误：修改了数据但没提交
user.username = "new_name"
# 忘记 await db.commit()
# 数据不会保存到数据库！

# ✅ 正确：记得提交
user.username = "new_name"
await db.commit()  # ✅ 提交事务
```

---

## 📚 学习资源

### 官方资源
- **SQLAlchemy 2.0 官方文档**：https://docs.sqlalchemy.org/en/20/
- **Context7 查询结果**：`/websites/sqlalchemy_en_20` (已查询)
- **异步 ORM 指南**：https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html

### 项目中的参考文件
- **Base 模型**：`backend/app/models/base.py:1` - 基类定义
- **User 模型**：`backend/app/models/user.py:39` - 完整模型示例
- **Session 配置**：`backend/app/db/session.py:115` - 会话工厂
- **依赖注入**：`backend/app/db/session.py:128` - get_db() 函数

### 推荐学习路径
1. ✅ **本文档**：理解 ORM 基础概念
2. 📖 **阅读 User 模型**：`backend/app/models/user.py`
3. 💻 **尝试简单查询**：在项目中添加一个查询用户的 API
4. 🔍 **学习关系**：理解 User 和 Proposal 的一对多关系
5. 📝 **下一篇文档**：`03_alembic_migrations.md` - 数据库迁移

---

## ✅ 学习检查清单

完成以下任务，说明你已经掌握 SQLAlchemy 异步操作：

- [ ] **理解 ORM 概念**：能解释为什么要用 ORM
- [ ] **理解异步的好处**：知道 async/await 的作用
- [ ] **能定义模型**：创建一个包含 3-5 个字段的模型
- [ ] **能执行 CRUD**：会写增删改查的代码
- [ ] **理解 Session**：知道 Session 的生命周期
- [ ] **知道 await 的位置**：知道哪些操作需要 await
- [ ] **能避免 N+1 问题**：会使用 selectinload 预加载关系
- [ ] **能阅读项目代码**：看懂 `backend/app/models/user.py`

---

## 🎓 下一步学习

完成本文档后，建议继续学习：

1. **数据库迁移**：`03_alembic_migrations.md` - Alembic 工具使用
2. **认证系统**：`04_jwt_authentication.md` - JWT 结合数据库
3. **项目实战**：尝试在项目中添加一个新模型（如 Comment 评论）

---

**文档版本**：v1.0
**最后更新**：2025-11-15
**维护者**：InnoLiber Team
**参考来源**：Context7 - SQLAlchemy 2.0 官方文档

"""
数据库会话管理

<copyright>
Copyright (c) 2024-2025 InnoLiber Team
Licensed under the MIT License
</copyright>

<rationale>
异步会话管理设计：
- AsyncSessionLocal: 异步会话工厂，支持高并发
- get_db: FastAPI依赖注入函数，确保会话生命周期正确
- contextmanager: 自动处理会话的开启、提交和关闭
- 连接池: 复用数据库连接，提升性能
</rationale>

<warning type="database">
⚠️ 数据库会话注意事项：
- 每个请求一个独立会话，避免并发冲突
- 异常时自动回滚，保证数据一致性
- 使用 async with 确保会话正确关闭
- expire_on_commit=False: 避免访问已过期的ORM对象
</warning>

<design-decision>
为什么使用sessionmaker而非直接create_async_session？
- sessionmaker: 工厂模式，配置一次，重复使用
- 连接池复用: 避免每次请求重新配置引擎
- 类型安全: AsyncSession类型注解，IDE友好
- FastAPI集成: 与Depends()依赖注入完美配合
</design-decision>

Dependencies:
    - sqlalchemy[asyncio]: 异步ORM支持
    - asyncpg: PostgreSQL异步驱动

Related:
    - app/core/config.py: 数据库URL配置
    - app/models/base.py: ORM基类
    - app/core/dependencies.py: 认证依赖使用

<reference>
参考 Context7 - SQLAlchemy 2.0 /websites/sqlalchemy_en_20
异步会话最佳实践：
- create_async_engine(): 创建异步引擎
- sessionmaker(class_=AsyncSession): 异步会话工厂
- expire_on_commit=False: 防止提交后对象失效
- async with session.begin(): 事务管理
</reference>
"""

from typing import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# ============================================================================
# 异步数据库引擎配置 (Async Database Engine Configuration)
# ============================================================================

"""
异步数据库引擎初始化

<rationale>
引擎参数说明：
- echo=False: 生产环境关闭SQL日志，避免性能影响和敏感信息泄露
- pool_size=20: 连接池大小，根据并发需求调整
- max_overflow=30: 连接池溢出数，处理突发流量
- pool_pre_ping=True: 连接健康检查，自动重连断开的连接
- pool_recycle=3600: 1小时回收连接，避免MySQL的8小时超时
</rationale>

<warning type="performance">
⚠️ 连接池配置注意：
- pool_size过小: 高并发时连接不够，请求排队
- pool_size过大: 数据库连接数超限，被拒绝连接
- 建议监控: 连接池使用率，根据实际负载调整
- 云数据库: 注意厂商的连接数限制
</warning>
"""
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.ENV == "development",  # 开发环境显示SQL日志
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    pool_pre_ping=True,  # 连接健康检查
    pool_recycle=3600,   # 1小时回收连接
)

# ============================================================================
# 异步会话工厂 (Async Session Factory)
# ============================================================================

"""
异步会话工厂配置

<rationale>
sessionmaker参数说明：
- bind=engine: 绑定异步引擎
- class_=AsyncSession: 使用异步会话类
- expire_on_commit=False: 提交后对象不过期
  - 允许在事务外访问ORM对象属性
  - 避免"Instance was not refreshed after a rollback"错误
  - 特别重要用于FastAPI响应序列化

使用async_sessionmaker优势：
- 类型安全: 返回正确的AsyncSession类型
- 现代API: SQLAlchemy 2.0推荐方式
- 更好的异步支持: 完全异步化的会话管理
</rationale>
"""
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=True,  # 自动刷新，保证查询结果一致性
    autocommit=False,  # 手动控制事务提交
)

# ============================================================================
# 数据库依赖注入 (Database Dependency Injection)
# ============================================================================


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    获取数据库会话依赖注入函数

    FastAPI的Depends()依赖函数，为每个请求提供独立的数据库会话。
    使用Python生成器确保会话在请求结束后正确关闭。

    <rationale>
    会话生命周期管理：
    1. 请求开始: 创建新的AsyncSession
    2. 请求处理: yield session供业务逻辑使用
    3. 请求结束: 自动关闭session，释放连接回连接池
    4. 异常情况: finally块确保session必定关闭
    </rationale>

    <warning type="concurrency">
    ⚠️ 并发安全：
    - 每个请求独立会话，避免线程/协程间的状态共享
    - 不要在全局变量中存储session
    - 避免跨请求共享ORM对象
    </warning>

    Yields:
        AsyncSession: 异步数据库会话对象

    Example:
        >>> # 在API路由中使用
        >>> @app.get("/users/")
        >>> async def get_users(db: AsyncSession = Depends(get_db)):
        >>>     result = await db.execute(select(User))
        >>>     return result.scalars().all()
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            # 确保会话关闭，连接返回池中
            # AsyncSession.__aexit__ 会自动调用 close()
            await session.close()


# ============================================================================
# 便捷数据库操作函数 (Convenience Database Functions)
# ============================================================================


async def get_db_session() -> AsyncSession:
    """
    直接获取数据库会话（非依赖注入场景）

    用于后台任务、CLI命令等非HTTP请求场景。
    调用者需要手动管理会话生命周期。

    <warning type="manual-management">
    ⚠️ 手动会话管理：
    - 调用者必须手动调用 await session.close()
    - 推荐使用 async with get_db_session() as session:
    - 避免在HTTP请求中使用，优先使用get_db()依赖注入
    </warning>

    Returns:
        AsyncSession: 新创建的异步数据库会话

    Example:
        >>> # 后台任务中使用
        >>> async def background_task():
        >>>     async with get_db_session() as session:
        >>>         users = await session.execute(select(User))
        >>>         # session会自动关闭
    """
    return AsyncSessionLocal()


# ============================================================================
# 数据库健康检查 (Database Health Check)
# ============================================================================


async def check_database_connection() -> bool:
    """
    检查数据库连接健康状态

    用于应用启动时和健康检查接口，验证数据库是否可访问。

    Returns:
        bool: 连接正常返回True，异常返回False

    Example:
        >>> # 在main.py启动时检查
        >>> if not await check_database_connection():
        >>>     logger.error("数据库连接失败")
        >>>     exit(1)
    """
    try:
        async with AsyncSessionLocal() as session:
            # 执行简单查询测试连接
            await session.execute(text("SELECT 1"))
            return True
    except Exception as e:
        # 可以在这里记录具体错误信息
        # logger.error(f"数据库连接检查失败: {e}")
        return False
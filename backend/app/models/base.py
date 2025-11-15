"""
SQLAlchemy基础模型定义

<copyright>
Copyright (c) 2024-2025 InnoLiber Team
Licensed under the MIT License
</copyright>

<rationale>
ORM基类设计：
- declarative_base: SQLAlchemy声明式映射基类
- 所有数据模型继承Base类，自动映射到数据库表
- 统一的元数据管理，支持Alembic迁移
</rationale>

<warning type="migration">
⚠️ 数据库迁移注意：
- Base.metadata包含所有表的元数据
- 修改模型后必须创建Alembic迁移脚本
- 生产环境禁止使用Base.metadata.create_all()直接建表
- 迁移脚本必须经过测试环境验证
</warning>

<design-decision>
为什么不使用SQLModel？
- SQLAlchemy 2.0提供了更成熟的异步支持
- 与Pydantic V2集成良好（通过Pydantic schema单独定义）
- 更灵活的关系映射和查询能力
- 社区生态更完善（Alembic、pytest-sqlalchemy等）
</design-decision>

Dependencies:
    - SQLAlchemy 2.0+: 异步ORM框架
    - asyncpg: PostgreSQL异步驱动

Related:
    - app/models/user.py: User模型定义
    - app/models/proposal.py: Proposal模型定义
    - alembic/: 数据库迁移脚本（待实现）

Usage:
    >>> from app.models.base import Base
    >>> from sqlalchemy import Column, Integer, String
    >>>
    >>> class MyModel(Base):
    ...     __tablename__ = "my_table"
    ...     id = Column(Integer, primary_key=True)
    ...     name = Column(String(100))
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.sql import func

"""
SQLAlchemy 2.0 声明式基类

<rationale>
Base类作用（SQLAlchemy 2.0+）：
- 所有ORM模型的共同父类
- 提供表映射的基础功能
- 管理所有表的元数据（metadata）
- 支持自动表名生成和关系映射
- AsyncAttrs Mixin: 使关系和延迟加载属性可await访问
</rationale>

<design-decision>
为什么使用 DeclarativeBase + AsyncAttrs？
- DeclarativeBase: SQLAlchemy 2.0推荐的现代基类
- AsyncAttrs Mixin: 防止异步环境中的隐式IO错误
- 支持 await obj.awaitable_attrs.relationship 访问延迟加载的关系
- 更好的类型提示和IDE支持
</design-decision>

<warning type="thread-safety">
⚠️ Base类是全局单例：
- 整个应用共享同一个Base实例
- 不同模块导入的Base是同一个对象
- 避免在运行时动态修改Base.metadata
</warning>

<reference>
参考 Context7 - SQLAlchemy 2.0 /websites/sqlalchemy_en_20
AsyncAttrs 使用模式：
- 继承顺序：class Base(AsyncAttrs, DeclarativeBase)
- 访问延迟属性：await obj.awaitable_attrs.relationship_name
- 防止 greenlet_spawn 错误在异步上下文中
</reference>

Example:
    >>> # 定义新模型（SQLAlchemy 2.0风格）
    >>> class Article(Base):
    ...     __tablename__ = "articles"
    ...     id = Column(Integer, primary_key=True)
    ...     title = Column(String(200))
    ...     created_at = Column(DateTime, server_default=func.now())
    ...
    >>> # 异步访问关系
    >>> article = await session.get(Article, 1)
    >>> comments = await article.awaitable_attrs.comments
"""


class Base(AsyncAttrs, DeclarativeBase):
    """
    SQLAlchemy 2.0 异步ORM基类

    Features:
    - AsyncAttrs: 支持异步访问延迟加载属性
    - DeclarativeBase: 现代声明式映射基类
    - Type hints friendly: 更好的IDE支持
    """
    pass
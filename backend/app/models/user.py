"""
用户数据模型

<copyright>
Copyright (c) 2024-2025 InnoLiber Team
Licensed under the MIT License
</copyright>

<rationale>
设计决策：
- 唯一索引: username 和 email 建立唯一索引，防止重复注册
- 密码存储: 使用 hashed_password 存储哈希后的密码（bcrypt），不存储明文
- is_active 标记: 软删除用户（而非物理删除），保留历史数据
- is_superuser: 区分普通用户和管理员（对应前端 role: ecr/admin）
</rationale>

<security>
安全注意事项：
- 密码必须使用 bcrypt 哈希（cost factor >= 12）
- 登录失败需要速率限制（防止暴力破解）
- 敏感字段（hashed_password）禁止在 API 响应中返回
- last_login 用于检测异常登录行为
</security>

Dependencies:
    - SQLAlchemy 2.0 (async ORM)
    - passlib/bcrypt (密码哈希)

Related:
    - frontend/src/types/index.ts: User 接口
    - app/core/security.py: 密码哈希和验证
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.sql import func
from .base import Base


class User(Base):
    """
    用户模型

    存储系统用户的账户信息和个人资料。

    <design-decision>
    角色设计：
    - 使用 is_superuser 布尔字段而非 role 枚举
    - 原因：简单场景（仅 2 种角色）无需复杂的 RBAC
    - 未来扩展：如需更多角色，可添加 role 字段或 roles 多对多关系表
    </design-decision>

    <warning type="security">
    ⚠️ 安全警告：
    - hashed_password 字段禁止在 API 响应中返回
    - 使用 Pydantic schema 的 exclude 参数或 Config.orm_mode
    - 登录接口需添加速率限制（如 slowapi）
    </warning>

    Attributes:
        id (int): 主键ID，自增
        username (str): 用户名（3-50字符，唯一，索引）
        email (str): 邮箱（RFC 5322格式，唯一，索引）
        full_name (str): 真实姓名
        hashed_password (str): 哈希后的密码（bcrypt，255字符）
        avatar_url (str): 头像URL（可选）
        institution (str): 所属机构（如"北京大学"）
        department (str): 所属院系
        position (str): 职位（如"副教授"）
        phone (str): 手机号
        research_field (str): 研究方向（如"人工智能"）
        is_active (bool): 账户是否激活（软删除标记）
        is_superuser (bool): 是否为管理员
        email_verified (bool): 邮箱是否已验证
        is_edu_email (bool): 是否为教育邮箱
        verify_token (str): 邮箱验证令牌（预留Phase 3.5）
        verify_token_expires (datetime): 令牌过期时间（预留Phase 3.5）
        failed_login_attempts (int): 登录失败次数（预留Phase 3.5）
        locked_until (datetime): 账户锁定至（预留Phase 3.5）
        created_at (datetime): 注册时间（UTC，自动生成）
        updated_at (datetime): 更新时间（UTC，自动更新）
        last_login (datetime): 最后登录时间（UTC，可选）

    Relationships:
        proposals (list[Proposal]): 用户创建的标书列表（一对多）
        注意：反向关系在 proposal.py 中定义（避免循环导入）

    Example:
        >>> from app.core.security import get_password_hash
        >>> user = User(
        ...     username="zhangsan",
        ...     email="zhangsan@example.com",
        ...     full_name="张三",
        ...     hashed_password=get_password_hash("SecurePassword123!"),
        ...     is_active=True,
        ...     is_superuser=False
        ... )
        >>> session.add(user)
        >>> await session.commit()
    """

    __tablename__ = "users"

    # ========== 基础字段 ==========
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False, comment="用户名")
    email = Column(String(100), unique=True, index=True, nullable=False, comment="邮箱")
    full_name = Column(String(100), nullable=False, comment="真实姓名")

    # ========== 安全字段 ==========
    hashed_password = Column(String(255), nullable=False, comment="哈希密码（bcrypt）")

    # ========== 个人资料 ==========
    avatar_url = Column(String(255), nullable=True, comment="头像URL")
    institution = Column(String(200), nullable=True, comment="所属机构")
    department = Column(String(200), nullable=True, comment="所属院系")
    position = Column(String(100), nullable=True, comment="职位")
    phone = Column(String(20), nullable=True, comment="手机号")
    research_field = Column(String(100), nullable=True, comment="研究方向")

    # ========== 状态标记 ==========
    is_active = Column(Boolean, default=True, comment="账户是否激活")
    is_superuser = Column(Boolean, default=False, comment="是否为管理员")

    # ========== 邮箱验证字段（Phase 1.1 - MVP认证增强）==========
    email_verified = Column(Boolean, default=False, comment="邮箱是否已验证")
    is_edu_email = Column(Boolean, default=False, comment="是否为教育邮箱")

    # ========== 验证令牌字段（Phase 3.5预留 - 阿里云DirectMail）==========
    verify_token = Column(String(255), nullable=True, comment="邮箱验证令牌")
    verify_token_expires = Column(DateTime(timezone=True), nullable=True, comment="令牌过期时间")

    # ========== 安全增强字段（Phase 3.5预留 - 登录保护）==========
    failed_login_attempts = Column(Integer, default=0, comment="登录失败次数")
    locked_until = Column(DateTime(timezone=True), nullable=True, comment="账户锁定至")

    # ========== 时间戳 ==========
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="注册时间")
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        comment="更新时间"
    )
    last_login = Column(DateTime(timezone=True), nullable=True, comment="最后登录时间")

    def __repr__(self):
        """开发调试用的字符串表示"""
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"

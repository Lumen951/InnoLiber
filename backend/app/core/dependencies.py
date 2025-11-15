"""
FastAPI依赖注入模块

<copyright>
Copyright (c) 2024-2025 InnoLiber Team
Licensed under the MIT License
</copyright>

<rationale>
依赖注入设计：
- OAuth2PasswordBearer: FastAPI标准OAuth2认证scheme
- get_current_user: JWT token验证，返回User对象
- get_current_active_user: 验证用户active状态
- 分层依赖: 每层专注单一职责，便于复用和测试
</rationale>

<warning type="security">
⚠️ 认证安全注意事项：
- Token验证失败必须返回401 Unauthorized
- WWW-Authenticate头: Bearer scheme，符合OAuth2规范
- 用户不存在: 同样返回401，避免泄露用户信息
- 账户禁用: 返回400 Bad Request，明确告知账户状态
</warning>

<design-decision>
为什么使用分层依赖（get_current_user → get_current_active_user）？
- 单一职责: get_current_user只管token验证，不关心业务状态
- 灵活性: 某些API可能允许inactive用户访问（如账户激活接口）
- 可测试: 每层独立测试，mock更容易
- 可扩展: 未来可添加get_current_admin_user等角色依赖
</design-decision>

Dependencies:
    - fastapi: FastAPI框架和OAuth2支持
    - sqlalchemy: 异步数据库查询

Related:
    - app/core/security.py: JWT验证函数
    - app/db/session.py: 数据库会话依赖
    - app/models/user.py: User模型
    - app/api/v1/auth.py: 认证API使用

<reference>
参考 Context7 - FastAPI /fastapi/fastapi
OAuth2依赖注入最佳实践：
- OAuth2PasswordBearer(tokenUrl): 指定token获取端点
- HTTPException(401): 认证失败标准响应
- WWW-Authenticate: Bearer: OAuth2规范要求
- Depends()嵌套: 依赖链式调用
</reference>
"""

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_token
from app.db.session import get_db
from app.models.user import User

# ============================================================================
# OAuth2 Scheme配置 (OAuth2 Scheme Configuration)
# ============================================================================

"""
OAuth2PasswordBearer配置

<rationale>
tokenUrl参数说明：
- tokenUrl="api/v1/auth/login": 登录端点相对路径
- 自动在Swagger UI中显示"Authorize"按钮
- 用户点击按钮后，Swagger会引导到此URL获取token
- 返回的token自动添加到Authorization header
</rationale>

<design-decision>
为什么不使用OAuth2AuthorizationCodeBearer？
- OAuth2PasswordBearer: 适合第一方应用（前后端同一团队）
- OAuth2AuthorizationCodeBearer: 适合第三方应用集成
- Password Flow: 用户直接提供用户名密码，简单直接
- Authorization Code Flow: 用户在第三方授权页面登录，安全但复杂
- MVP阶段选择Password Flow，未来可扩展支持OAuth2
</design-decision>
"""
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

# ============================================================================
# 用户认证依赖 (User Authentication Dependencies)
# ============================================================================


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    获取当前认证用户

    从Authorization header中提取JWT token，验证并返回对应的User对象。
    这是所有需要认证的API端点的基础依赖。

    <rationale>
    验证流程：
    1. OAuth2PasswordBearer自动提取token（从"Authorization: Bearer <token>"）
    2. verify_token验证JWT签名和过期时间，提取用户email
    3. 数据库查询User对象
    4. 未找到用户或token无效，抛出401异常
    </rationale>

    Args:
        token: JWT token字符串（由oauth2_scheme自动提取）
        db: 数据库会话（由get_db依赖注入）

    Returns:
        User: 当前认证的用户对象

    Raises:
        HTTPException: 401 Unauthorized - token无效、过期或用户不存在

    Example:
        >>> # 在API路由中使用
        >>> @app.get("/users/me")
        >>> async def read_users_me(
        >>>     current_user: User = Depends(get_current_user)
        >>> ):
        >>>     return current_user
    """
    # 定义认证失败异常
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # 验证token并提取用户email
    email: Optional[str] = verify_token(token)
    if email is None:
        raise credentials_exception

    # 查询用户
    result = await db.execute(
        select(User).where(User.email == email)
    )
    user: Optional[User] = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    获取当前活跃用户

    在get_current_user的基础上，额外验证用户账户是否处于active状态。
    大多数业务API应使用此依赖而非get_current_user。

    <rationale>
    账户状态检查：
    - is_active=False: 账户被禁用、封禁或注销
    - 返回400而非401: 用户已认证但账户不可用，明确告知状态
    - 允许账户激活接口使用get_current_user（不检查active）
    </rationale>

    <design-decision>
    为什么分离active检查？
    - 某些API需要允许inactive用户访问：
      - 账户激活接口：用户收到激活邮件后访问
      - 账户资料查看：允许禁用用户查看自己信息
      - 申诉接口：被封禁用户可以发起申诉
    - 灵活性：不同API可选择不同依赖
    </design-decision>

    Args:
        current_user: 当前认证用户（由get_current_user依赖注入）

    Returns:
        User: 当前活跃的用户对象

    Raises:
        HTTPException: 400 Bad Request - 用户账户未激活

    Example:
        >>> # 在需要active用户的API中使用
        >>> @app.post("/proposals/")
        >>> async def create_proposal(
        >>>     current_user: User = Depends(get_current_active_user)
        >>> ):
        >>>     # 只有active用户能创建标书
        >>>     ...
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    return current_user


# ============================================================================
# 未来扩展依赖 (Future Extension Dependencies)
# ============================================================================

"""
预留的依赖函数（Phase 3.5实现）

<todo priority="medium">
TODO-PHASE-3.5: 实现高级认证依赖

1. get_current_admin_user() - 管理员权限依赖
   - 检查 current_user.is_superuser
   - 用于管理后台API

2. get_current_verified_user() - 已验证邮箱用户
   - 检查 current_user.email_verified
   - 用于需要邮箱验证的敏感操作

3. require_edu_email() - 教育邮箱用户依赖
   - 检查 current_user.is_edu_email
   - 用于教育用户专属功能

4. rate_limit_dependency() - 速率限制依赖
   - 集成Redis实现API限流
   - 防止滥用和DDOS
</todo>

Example (未来实现):
    >>> async def get_current_admin_user(
    >>>     current_user: User = Depends(get_current_active_user)
    >>> ) -> User:
    >>>     if not current_user.is_superuser:
    >>>         raise HTTPException(status_code=403, detail="Admin access required")
    >>>     return current_user
"""

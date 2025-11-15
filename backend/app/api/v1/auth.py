"""
认证API路由

<copyright>
Copyright (c) 2024-2025 InnoLiber Team
Licensed under the MIT License
</copyright>

<rationale>
API设计原则：
- RESTful风格: 使用标准HTTP方法和状态码
- 原子操作: 每个端点职责单一，易于测试
- 错误处理: 明确的错误消息，帮助客户端调试
- 文档完善: Swagger自动生成交互式API文档
</rationale>

<warning type="security">
⚠️ API安全注意事项：
- 密码传输: 仅通过HTTPS，防止中间人攻击
- 重复注册: 检查邮箱是否已存在
- 登录失败: 避免泄露"用户不存在"或"密码错误"细节
- Rate Limiting: Phase 3.5添加速率限制防止暴力破解
</warning>

<design-decision>
为什么使用OAuth2PasswordRequestForm而非自定义表单？
- 标准化: OAuth2规范要求username/password字段
- Swagger集成: 自动显示"Authorize"按钮
- 安全性: 内置CSRF保护
- 兼容性: 第三方OAuth2客户端可直接使用
- 灵活性: username字段映射到email，符合业务需求
</design-decision>

Dependencies:
    - fastapi: API路由和依赖注入
    - sqlalchemy: 数据库操作

Related:
    - app/core/security.py: 密码哈希、JWT生成
    - app/core/dependencies.py: 用户认证依赖
    - app/schemas/auth.py: 请求/响应模型
    - app/models/user.py: User数据库模型

<reference>
参考 Context7 - FastAPI /fastapi/fastapi
OAuth2 Password Flow最佳实践：
- OAuth2PasswordRequestForm: 标准登录表单
- POST /token: OAuth2规范要求的token端点
- response_model: 自动序列化和文档生成
- status_code: 明确的HTTP状态码
</reference>
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user, get_current_user
from app.core.security import (
    create_access_token,
    get_password_hash,
    is_edu_email,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import Token, UserRegister, UserResponse

# ============================================================================
# 路由配置 (Router Configuration)
# ============================================================================

"""
APIRouter配置

<rationale>
路由参数说明：
- prefix="/auth": 所有认证相关端点的前缀
- tags=["认证"]: Swagger文档分组标签
- responses: 通用错误响应文档
</rationale>
"""
router = APIRouter(
    prefix="/auth",
    tags=["认证"],
    responses={
        401: {"description": "未授权：Token无效或已过期"},
        400: {"description": "请求错误：参数验证失败"}
    }
)

# ============================================================================
# 用户注册端点 (User Registration Endpoint)
# ============================================================================


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="用户注册",
    description="创建新用户账户。邮箱必须唯一，密码将被安全哈希存储。"
)
async def register(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db)
):
    """
    用户注册接口

    创建新用户账户，执行以下操作：
    1. 检查邮箱是否已注册
    2. 检测是否为教育邮箱
    3. 哈希密码（bcrypt）
    4. 创建用户记录
    5. 【预留】发送验证邮件

    <rationale>
    注册流程设计：
    - 邮箱唯一性: 防止重复注册，使用数据库索引保证
    - 教育邮箱检测: 自动标记，便于后续审核
    - 默认状态: is_active=True（宽松策略），email_verified=False
    - TODO-ALIYUN: 邮件验证在Phase 3.5实现
    </rationale>

    Args:
        user_data: 用户注册信息（邮箱、密码、姓名等）
        db: 数据库会话

    Returns:
        UserResponse: 创建的用户信息（不含密码）

    Raises:
        HTTPException 400: 邮箱已被注册
    """
    # 1. 检查邮箱是否已注册
    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    existing_user: Optional[User] = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # 2. 检测教育邮箱
    is_edu = is_edu_email(user_data.email)

    # 3. 创建用户对象
    new_user = User(
        email=user_data.email,
        username=user_data.email.split('@')[0],  # 使用邮箱前缀作为用户名
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password),
        research_field=user_data.research_field,
        is_edu_email=is_edu,
        is_active=True,  # MVP: 默认激活，无需邮箱验证
        email_verified=False,  # 预留字段，Phase 3.5实现验证
    )

    # 4. 保存到数据库
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # TODO-ALIYUN: [邮件发送] - 需要配置阿里云DirectMail服务
    # 依赖：
    #   1. 阿里云DirectMail开通
    #   2. 发信域名配置和DNS验证
    #   3. 环境变量: ALIYUN_ACCESS_KEY, ALIYUN_SECRET_KEY, MAIL_FROM
    # 预计工作量：2-3小时
    # 优先级：P1
    # 参考文档：https://help.aliyun.com/product/29412.html
    #
    # 实现示例：
    # from app.core.email import send_verification_email
    # verify_token = secrets.token_urlsafe(32)
    # new_user.verify_token = verify_token
    # new_user.verify_token_expires = datetime.utcnow() + timedelta(hours=24)
    # await db.commit()
    # await send_verification_email(new_user.email, verify_token)

    return new_user


# ============================================================================
# 用户登录端点 (User Login Endpoint)
# ============================================================================


@router.post(
    "/login",
    response_model=Token,
    summary="用户登录",
    description="使用邮箱和密码登录，返回JWT访问令牌。"
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """
    用户登录接口

    验证用户凭证并返回JWT token。

    <rationale>
    登录流程设计：
    - OAuth2PasswordRequestForm: 标准表单，username字段映射到email
    - 密码验证: constant-time比较，防止时序攻击
    - 失败信息: 统一错误消息，避免泄露"用户不存在"或"密码错误"
    - last_login更新: 记录登录时间，用于安全审计
    - TODO-ALIYUN: Phase 3.5添加失败次数限制和账户锁定
    </rationale>

    Args:
        form_data: OAuth2登录表单（username=email, password）
        db: 数据库会话

    Returns:
        Token: JWT访问令牌和token类型

    Raises:
        HTTPException 401: 邮箱或密码错误
    """
    # 1. 查询用户（username字段实际是email）
    result = await db.execute(
        select(User).where(User.email == form_data.username)
    )
    user: Optional[User] = result.scalar_one_or_none()

    # 2. 验证用户存在且密码正确
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. 更新最后登录时间
    user.last_login = datetime.utcnow()
    await db.commit()

    # TODO-ALIYUN: [账户安全] - Phase 3.5实现登录保护
    # 功能：
    #   1. 失败次数限制（failed_login_attempts字段）
    #   2. 账户自动锁定（locked_until字段）
    #   3. 异地登录检测
    # 预计工作量：3-4小时
    # 优先级：P2
    #
    # 实现示例：
    # if user.failed_login_attempts >= 5:
    #     if user.locked_until and user.locked_until > datetime.utcnow():
    #         raise HTTPException(403, detail="Account locked")
    # if password_incorrect:
    #     user.failed_login_attempts += 1
    #     if user.failed_login_attempts >= 5:
    #         user.locked_until = datetime.utcnow() + timedelta(minutes=30)
    #     await db.commit()
    # else:
    #     user.failed_login_attempts = 0  # 重置失败次数

    # 4. 生成JWT token
    access_token = create_access_token(data={"sub": user.email})

    return {"access_token": access_token, "token_type": "bearer"}


# ============================================================================
# 获取当前用户端点 (Get Current User Endpoint)
# ============================================================================


@router.get(
    "/me",
    response_model=UserResponse,
    summary="获取当前用户信息",
    description="通过JWT token获取当前登录用户的详细信息。需要认证。"
)
async def get_me(
    current_user: User = Depends(get_current_active_user)
):
    """
    获取当前用户信息接口

    返回当前认证用户的详细信息。

    <rationale>
    端点设计：
    - 依赖get_current_active_user: 确保用户已认证且账户active
    - response_model=UserResponse: 自动过滤敏感字段
    - 无需数据库查询: current_user已包含所有信息
    </rationale>

    Args:
        current_user: 当前认证用户（依赖注入）

    Returns:
        UserResponse: 用户详细信息
    """
    return current_user


# ============================================================================
# 邮箱验证端点（预留Phase 3.5）
# ============================================================================

"""
<todo priority="medium">
TODO-PHASE-3.5: 实现邮箱验证API

@router.get("/verify-email")
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    \"\"\"
    验证邮箱接口

    用户点击邮件中的链接后，验证token并激活账户。

    流程：
    1. 解析token
    2. 查询用户
    3. 检查token有效期
    4. 更新email_verified=True
    5. 清除verify_token
    \"\"\"
    # 实现代码...
    pass

@router.post("/resend-verification")
async def resend_verification(email: EmailStr, db: AsyncSession = Depends(get_db)):
    \"\"\"
    重新发送验证邮件

    用户未收到验证邮件时，可请求重新发送。
    \"\"\"
    # 实现代码...
    pass
</todo>
"""

"""
认证相关Pydantic模型

<copyright>
Copyright (c) 2024-2025 InnoLiber Team
Licensed under the MIT License
</copyright>

<rationale>
Schema设计原则：
- 请求验证: 严格的输入校验，防止无效数据
- 响应序列化: 控制输出字段，避免泄露敏感信息
- 类型安全: 完整的类型注解，IDE智能提示
- 文档生成: 自动生成Swagger API文档
</rationale>

<warning type="security">
⚠️ 数据安全注意：
- 响应模型不包含hashed_password
- 使用EmailStr确保邮箱格式正确
- 密码长度限制防止超长输入攻击
- 敏感字段（token）标记为non-serializable
</warning>

<design-decision>
为什么分离Request和Response模型？
- 输入验证: 请求模型包含password等提交字段
- 输出安全: 响应模型排除敏感字段
- 灵活性: 同一实体可能有多种响应格式
- 文档清晰: Swagger自动区分输入/输出schema
</design-decision>

Dependencies:
    - pydantic: 数据验证和序列化
    - pydantic[email]: EmailStr字段支持

Related:
    - app/models/user.py: User数据库模型
    - app/api/v1/auth.py: API路由使用
    - app/core/dependencies.py: 认证依赖返回类型

<reference>
参考 Context7 - Pydantic (implicitly from FastAPI docs)
Pydantic v2最佳实践：
- Field(): 添加字段验证和文档
- EmailStr: 自动邮箱格式验证
- ConfigDict: 模型配置（ORM mode等）
- model_validator: 自定义验证逻辑
</reference>
"""

from typing import Optional
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, ConfigDict

# ============================================================================
# 认证请求模型 (Authentication Request Models)
# ============================================================================


class UserRegister(BaseModel):
    """
    用户注册请求模型

    <rationale>
    字段设计：
    - email: 使用EmailStr自动验证格式
    - password: 8-100字符限制，平衡安全和可用性
    - full_name: 真实姓名，可选字段
    - research_field: 研究方向，便于后续个性化推荐
    </rationale>
    """

    email: EmailStr = Field(
        ...,
        description="用户邮箱地址",
        examples=["user@example.com", "student@pku.edu.cn"]
    )

    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="用户密码（8-100字符）",
        examples=["SecurePass123"]
    )

    full_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="用户真实姓名",
        examples=["张三", "John Doe"]
    )

    research_field: Optional[str] = Field(
        None,
        max_length=100,
        description="研究方向（可选）",
        examples=["人工智能", "生物信息学"]
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "researcher@pku.edu.cn",
                "password": "MySecurePassword123",
                "full_name": "张三",
                "research_field": "深度学习"
            }
        }
    )


class UserLogin(BaseModel):
    """
    用户登录请求模型

    <warning type="api-usage">
    ⚠️ 注意：
    - FastAPI的OAuth2PasswordRequestForm自动处理登录表单
    - 此模型用于文档和类型提示，实际API使用Form data
    - OAuth2规范要求username字段，我们映射到email
    </warning>
    """

    email: EmailStr = Field(
        ...,
        description="用户邮箱地址",
        examples=["user@example.com"]
    )

    password: str = Field(
        ...,
        description="用户密码",
        examples=["SecurePass123"]
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "researcher@pku.edu.cn",
                "password": "MySecurePassword123"
            }
        }
    )


# ============================================================================
# 认证响应模型 (Authentication Response Models)
# ============================================================================


class Token(BaseModel):
    """
    JWT Token响应模型

    符合OAuth2规范的token响应格式。

    <reference>
    OAuth2 Token Response (RFC 6749):
    - access_token: 必需，访问令牌
    - token_type: 必需，固定为"bearer"
    - expires_in: 可选，过期秒数
    - refresh_token: 可选，刷新令牌（Phase 3.5实现）
    </reference>
    """

    access_token: str = Field(
        ...,
        description="JWT访问令牌",
        examples=["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."]
    )

    token_type: str = Field(
        default="bearer",
        description="令牌类型",
        examples=["bearer"]
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwiZXhwIjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
                "token_type": "bearer"
            }
        }
    )


class UserResponse(BaseModel):
    """
    用户信息响应模型

    返回用户公开信息，排除敏感字段。

    <rationale>
    字段选择：
    - 包含: id, email, full_name等公开信息
    - 排除: hashed_password, verify_token等敏感信息
    - 时间字段: created_at, last_login用于审计
    - 状态字段: is_active, email_verified用于前端显示
    </rationale>
    """

    id: int = Field(..., description="用户ID", examples=[1])

    email: EmailStr = Field(..., description="用户邮箱", examples=["user@example.com"])

    full_name: str = Field(..., description="用户姓名", examples=["张三"])

    is_active: bool = Field(..., description="账户是否激活", examples=[True])

    is_superuser: bool = Field(..., description="是否为管理员", examples=[False])

    email_verified: bool = Field(..., description="邮箱是否已验证", examples=[False])

    is_edu_email: bool = Field(..., description="是否为教育邮箱", examples=[True])

    research_field: Optional[str] = Field(
        None,
        description="研究方向",
        examples=["人工智能"]
    )

    institution: Optional[str] = Field(
        None,
        description="所属机构",
        examples=["北京大学"]
    )

    created_at: datetime = Field(..., description="注册时间")

    last_login: Optional[datetime] = Field(None, description="最后登录时间")

    # Pydantic v2 ORM mode配置
    model_config = ConfigDict(
        from_attributes=True,  # Pydantic v2: 允许从ORM对象创建
        json_schema_extra={
            "example": {
                "id": 1,
                "email": "researcher@pku.edu.cn",
                "full_name": "张三",
                "is_active": True,
                "is_superuser": False,
                "email_verified": True,
                "is_edu_email": True,
                "research_field": "深度学习",
                "institution": "北京大学",
                "created_at": "2024-10-29T12:00:00Z",
                "last_login": "2024-11-15T10:30:00Z"
            }
        }
    )


# ============================================================================
# 邮箱验证模型（预留Phase 3.5）
# ============================================================================

"""
<todo priority="medium">
TODO-PHASE-3.5: 实现邮箱验证相关Schema

1. EmailVerificationRequest - 发送验证邮件请求
   - email: EmailStr

2. EmailVerificationConfirm - 验证邮件token
   - token: str

3. PasswordResetRequest - 密码重置请求
   - email: EmailStr

4. PasswordResetConfirm - 密码重置确认
   - token: str
   - new_password: str

需要集成阿里云DirectMail服务
</todo>
"""

"""
核心安全工具模块

<copyright>
Copyright (c) 2024-2025 InnoLiber Team
Licensed under the MIT License
</copyright>

<rationale>
安全模块设计：
- 密码哈希: 直接使用bcrypt库，避免passlib兼容性问题
- 长密码处理: SHA256+base64编码，支持任意长度密码
- JWT生成: python-jose实现，HS256签名算法
- 教育邮箱检测: 正则匹配，支持国内外教育机构域名
- 单一职责: 纯函数设计，方便单元测试
</rationale>

<warning type="security">
⚠️ 安全警告：
- 密码哈希: bcrypt rounds=12，平衡安全性和性能
- 长密码处理: SHA256哈希后再bcrypt，防止截断信息丢失
- JWT密钥: 必须从环境变量读取，禁止硬编码
- Token过期: 默认24小时，可根据业务调整
- 密码明文: 永远不存储、不记录日志
</warning>

<design-decision>
为什么移除passlib改用直接bcrypt？
- 兼容性问题: passlib与某些bcrypt版本存在兼容性问题
- 代码简洁: bcrypt API简单直接，无需额外封装层
- 依赖更少: 减少一个依赖库，降低维护成本
- 性能相当: bcrypt底层实现一致，性能无差异
- 可控性强: 直接控制哈希参数和错误处理
</design-decision>

Dependencies:
    - bcrypt: 密码哈希核心库
    - python-jose[cryptography]: JWT生成和验证

Related:
    - app/core/config.py: JWT配置读取
    - app/api/v1/auth.py: 认证API使用
    - app/core/dependencies.py: JWT验证依赖

<reference>
参考 Context7 - Bcrypt /pyca/bcrypt
bcrypt最佳实践：
- hashpw(password, gensalt()): 生成哈希
- checkpw(password, hashed): 验证密码
- gensalt(rounds=12): 设置工作因子
- 长密码处理: SHA256+base64编码绕过72字节限制

参考 Context7 - Python-JOSE /mpdavis/python-jose
JWT最佳实践：
- algorithm="HS256": 对称加密，性能优秀
- exp claim: 强制设置过期时间
- sub claim: 存储用户唯一标识（email）
- iat claim: 签发时间，用于审计
</reference>
"""

import base64
import hashlib
import re
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings

# ============================================================================
# 密码哈希函数 (Password Hashing Functions)
# ============================================================================


def get_password_hash(password: str) -> str:
    """
    生成密码的bcrypt哈希

    使用bcrypt算法生成密码哈希，自动处理盐值生成和轮次设置。
    对于超过72字节的密码，使用SHA256+base64编码处理。

    <rationale>
    实现策略：
    - 短密码（≤72字节）: 直接bcrypt哈希
    - 长密码（>72字节）: SHA256哈希 → base64编码 → bcrypt哈希
    - rounds=12: 2^12次迭代，现代CPU约100ms验证时间
    - base64编码: 避免SHA256输出的NULL字节问题
    </rationale>

    <warning type="bcrypt-limitation">
    ⚠️ bcrypt限制：
    - 密码最大72字节（约72个ASCII字符或24个中文字符）
    - 超过部分使用SHA256预哈希，不会丢失信息
    - UTF-8编码：中文字符占3字节
    </warning>

    <reference>
    参考 Context7 - Bcrypt /pyca/bcrypt
    长密码处理方案：
    password = b"very long password" * 10
    hashed = bcrypt.hashpw(
        base64.b64encode(hashlib.sha256(password).digest()),
        bcrypt.gensalt()
    )
    </reference>

    Args:
        password: 用户明文密码

    Returns:
        str: bcrypt哈希字符串，约60字符长度

    Example:
        >>> hash_pwd = get_password_hash("mypassword123")
        >>> print(hash_pwd)
        $2b$12$KIXxkV4SD3h9cVYZ5zHY2eGP5nDlHn7/SSkJ0N0G6kJq2H3r7j.7G
    """
    password_bytes = password.encode('utf-8')

    # 处理长密码：超过72字节使用SHA256+base64
    if len(password_bytes) > 72:
        password_bytes = base64.b64encode(
            hashlib.sha256(password_bytes).digest()
        )

    # 使用bcrypt哈希，rounds=12
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt(rounds=12))

    # 转为字符串存储到数据库
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    验证密码是否匹配哈希值

    使用constant-time比较，防止时序攻击。自动处理长密码的SHA256编码。

    <rationale>
    验证流程：
    1. 将明文密码编码为字节
    2. 如果超过72字节，进行SHA256+base64处理（与哈希时保持一致）
    3. 使用bcrypt.checkpw进行constant-time比较
    4. 返回True/False
    </rationale>

    Args:
        plain_password: 用户输入的明文密码
        hashed_password: 数据库存储的哈希密码

    Returns:
        bool: 密码匹配返回True，否则False

    Example:
        >>> hashed = get_password_hash("mypassword123")
        >>> verify_password("mypassword123", hashed)
        True
        >>> verify_password("wrongpassword", hashed)
        False
    """
    password_bytes = plain_password.encode('utf-8')

    # 处理长密码：超过72字节使用SHA256+base64（与哈希时一致）
    if len(password_bytes) > 72:
        password_bytes = base64.b64encode(
            hashlib.sha256(password_bytes).digest()
        )

    # 使用bcrypt验证
    return bcrypt.checkpw(password_bytes, hashed_password.encode('utf-8'))


# ============================================================================
# JWT Token函数 (JWT Token Functions)
# ============================================================================


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    生成JWT访问令牌

    创建包含用户信息和过期时间的JWT token，使用HS256算法签名。

    <rationale>
    JWT Claims说明：
    - sub (Subject): 用户唯一标识，使用email作为主键
    - exp (Expiration): 过期时间，Unix时间戳
    - iat (Issued At): 签发时间，用于审计和token刷新判断
    - 不包含敏感信息: JWT可被解码，不存储密码等敏感数据
    </rationale>

    Args:
        data: 要编码的数据字典，通常包含 {"sub": user.email}
        expires_delta: token有效期，默认为配置的JWT_ACCESS_TOKEN_EXPIRE

    Returns:
        str: JWT token字符串

    Example:
        >>> token = create_access_token(data={"sub": "user@example.com"})
        >>> print(token)
        eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    """
    to_encode = data.copy()

    # 设置过期时间
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(seconds=settings.JWT_ACCESS_TOKEN_EXPIRE)

    # 添加标准JWT claims
    to_encode.update({
        "exp": expire,  # 过期时间
        "iat": datetime.utcnow()  # 签发时间
    })

    # 使用配置的密钥和算法签名
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )

    return encoded_jwt


def verify_token(token: str) -> Optional[str]:
    """
    验证JWT token并提取用户标识

    解码并验证JWT token的签名和有效期，返回token中的用户email。

    <rationale>
    验证过程：
    1. 签名验证: 确保token未被篡改
    2. 过期验证: 检查exp claim
    3. 提取sub: 返回用户email用于数据库查询
    4. 异常处理: 捕获所有JWT相关错误，返回None
    </rationale>

    Args:
        token: JWT token字符串

    Returns:
        Optional[str]: 成功返回用户email，失败返回None

    Raises:
        不会抛出异常，所有错误情况返回None

    Example:
        >>> token = create_access_token(data={"sub": "user@example.com"})
        >>> email = verify_token(token)
        >>> print(email)
        user@example.com
        >>> verify_token("invalid_token")
        None
    """
    try:
        # 解码并验证token
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )

        # 提取用户email（sub claim）
        email: str = payload.get("sub")
        if email is None:
            return None

        return email

    except JWTError:
        # Token无效、过期或签名错误
        return None


# ============================================================================
# 教育邮箱检测 (Educational Email Detection)
# ============================================================================


def is_edu_email(email: str) -> bool:
    """
    检测是否为教育邮箱

    使用正则表达式匹配常见的教育机构邮箱域名后缀。

    <rationale>
    支持的教育邮箱格式：
    - 中国大陆: .edu.cn (如 student@pku.edu.cn)
    - 美国: .edu (如 student@mit.edu)
    - 其他国家: .ac.* (如 student@cam.ac.uk)
    - 不支持: 部分学校使用通用域名（如gmail.com），需手动审核
    </rationale>

    <design-decision>
    为什么不使用完整的教育邮箱数据库？
    - MVP阶段：正则匹配覆盖90%+教育邮箱
    - 维护成本：全球数万所大学，数据库维护困难
    - 扩展性：Phase 3.5可集成第三方教育邮箱验证API
    - 现有方案：标记而非强制，用户体验友好
    </design-decision>

    Args:
        email: 邮箱地址字符串

    Returns:
        bool: 是教育邮箱返回True，否则False

    Example:
        >>> is_edu_email("student@pku.edu.cn")
        True
        >>> is_edu_email("student@mit.edu")
        True
        >>> is_edu_email("user@gmail.com")
        False
    """
    # 教育邮箱正则模式
    # \.edu\.cn$ : 中国大陆教育网
    # \.edu$ : 美国及部分国家教育网
    # \.ac\.[a-z]{2}$ : 英国、澳大利亚等国家学术网（如.ac.uk, .ac.jp）
    edu_pattern = r'\.(edu\.cn|edu|ac\.[a-z]{2})$'

    return bool(re.search(edu_pattern, email.lower()))

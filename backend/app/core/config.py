"""
应用配置管理

<copyright>
Copyright (c) 2024-2025 InnoLiber Team
Licensed under the MIT License
</copyright>

<rationale>
配置管理设计：
- Pydantic Settings: 类型安全的配置验证和环境变量读取
- .env文件支持: 开发环境配置，避免硬编码敏感信息
- 默认值: 开发环境快速启动，生产环境强制覆盖
- 类型注解: IDE智能提示，减少配置错误
</rationale>

<warning type="security">
⚠️ 安全警告：
- JWT_SECRET_KEY: 生产环境必须使用强随机密钥（>32字符）
- DATABASE_URL: 不应提交到版本控制，使用环境变量
- DEEPSEEK_API_KEY: 敏感凭证，仅从环境变量读取
- 默认密码: 开发用途，生产环境禁止使用
</warning>

<todo priority="critical">
TODO(devops-team, 2025-11-10): [P0] 生产环境部署检查清单
1. 更换JWT_SECRET_KEY为加密随机字符串
2. 配置实际数据库连接字符串（RDS/云数据库）
3. 设置DEEPSEEK_API_KEY环境变量
4. 限制CORS_ORIGINS为真实前端域名
5. 启用ENV="production"
</todo>

Dependencies:
    - pydantic-settings 2.0+: 配置管理和验证

Related:
    - .env: 环境变量文件（不提交到Git）
    - app/main.py: 使用settings实例
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    应用配置类 - 集中管理所有环境配置

    <rationale>
    配置分组设计：
    - 基础配置: 应用名称、版本、运行环境
    - API配置: 服务监听地址和端口
    - CORS配置: 跨域资源共享白名单
    - 数据库配置: PostgreSQL连接池设置
    - JWT配置: 用户认证和token生成
    - DeepSeek API: 外部AI服务集成
    - Redis配置: 缓存和任务队列
    </rationale>

    <warning type="production">
    ⚠️ 生产环境配置要求：
    - 所有敏感配置必须从环境变量读取
    - 禁止使用默认密钥和密码
    - 数据库连接池大小需根据实际负载调整
    - JWT过期时间应根据安全策略设置
    </warning>

    Attributes:
        APP_NAME (str): 应用名称
        APP_VERSION (str): 应用版本（语义化版本）
        ENV (str): 运行环境（development/staging/production）
        API_HOST (str): API监听地址（0.0.0.0监听所有接口）
        API_PORT (int): API监听端口
        CORS_ORIGINS (List[str]): 允许跨域的前端域名列表
        DATABASE_URL (str): PostgreSQL异步连接字符串
        DATABASE_POOL_SIZE (int): 数据库连接池大小
        DATABASE_MAX_OVERFLOW (int): 连接池最大溢出数
        JWT_SECRET_KEY (str): JWT签名密钥（生产环境必须更换）
        JWT_ALGORITHM (str): JWT签名算法
        JWT_ACCESS_TOKEN_EXPIRE (int): JWT过期时间（秒）
        DEEPSEEK_API_KEY (str): DeepSeek API密钥
        DEEPSEEK_API_BASE_URL (str): DeepSeek API基础URL
        DEEPSEEK_DEFAULT_MODEL (str): 默认使用的模型名称
        REDIS_HOST (str): Redis服务器地址
        REDIS_PORT (int): Redis端口
        REDIS_DB (int): Redis数据库编号

    Example:
        >>> # 从环境变量加载配置
        >>> settings = Settings()
        >>> print(settings.DATABASE_URL)
        postgresql+asyncpg://user:pass@host:5432/db
    """

    # ========== 基础配置 ==========
    APP_NAME: str = "InnoLiber"
    APP_VERSION: str = "0.1.0"
    ENV: str = "development"

    # ========== API配置 ==========
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # ========== CORS配置 ==========
    """
    <hack reason="dev-convenience">
    HACK: 默认允许本地开发端口
    - localhost:5173 (Vite默认端口)
    - localhost:3000 (Create React App默认端口)
    生产环境需要明确配置实际域名
    </hack>
    """
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000"
    ]

    # ========== 数据库配置 ==========
    """
    <warning type="security">
    ⚠️ 数据库安全：
    - 默认连接字符串包含明文密码，仅供开发使用
    - 生产环境必须使用环境变量
    - 建议使用云厂商的密钥管理服务（如AWS Secrets Manager）
    </warning>
    """
    DATABASE_URL: str = "postgresql+asyncpg://innoliber:innoliber_dev_password@localhost:5432/innoliber"
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 30

    # ========== JWT配置 ==========
    """
    <warning type="security">
    ⚠️ JWT安全警告：
    - 默认密钥仅供开发，生产环境必须生成强随机密钥
    - 推荐使用: secrets.token_urlsafe(32)
    - 密钥泄露将导致所有token可被伪造
    </warning>
    """
    JWT_SECRET_KEY: str = "your_jwt_secret_key_here_please_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE: int = 86400  # 24小时

    # ========== DeepSeek API配置 ==========
    """
    <rationale>
    DeepSeek集成：
    - DEEPSEEK_API_KEY: 从环境变量读取，避免硬编码
    - 默认为空字符串，启动时检查是否配置
    - BASE_URL支持私有化部署切换
    </rationale>
    """
    DEEPSEEK_API_KEY: str = ""
    DEEPSEEK_API_BASE_URL: str = "https://api.deepseek.com"
    DEEPSEEK_DEFAULT_MODEL: str = "deepseek-chat"

    # ========== Redis配置 ==========
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    """
    Pydantic Settings配置

    <rationale>
    配置模型行为：
    - env_file: 从.env文件读取配置
    - env_file_encoding: UTF-8编码支持中文注释
    - case_sensitive: 区分大小写，环境变量必须全大写
    </rationale>
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )


"""
全局配置实例

<rationale>
单例模式：
- 应用启动时创建唯一配置实例
- 所有模块导入此实例，避免重复加载环境变量
- 配置修改立即生效（不推荐运行时修改）
</rationale>

<warning type="initialization">
⚠️ 启动时检查：
- 建议在main.py启动时验证关键配置
- 缺失DEEPSEEK_API_KEY时，AI功能无法使用
- 数据库连接失败应立即停止启动
</warning>

Usage:
    >>> from app.core.config import settings
    >>> print(settings.APP_NAME)
    InnoLiber
    >>> print(settings.DATABASE_URL)
    postgresql+asyncpg://...
"""
settings = Settings()
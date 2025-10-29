"""
应用配置管理
使用Pydantic Settings管理环境变量
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """应用配置"""

    # 基础配置
    APP_NAME: str = "InnoLiber"
    APP_VERSION: str = "0.1.0"
    ENV: str = "development"

    # API配置
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # CORS配置
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000"
    ]

    # 数据库配置
    DATABASE_URL: str = "postgresql+asyncpg://innolibr:innolibr_dev_password@localhost:5432/innolibr"
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 30

    # JWT配置
    JWT_SECRET_KEY: str = "your_jwt_secret_key_here_please_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE: int = 86400  # 24小时

    # DeepSeek API配置
    DEEPSEEK_API_KEY: str = ""
    DEEPSEEK_API_BASE_URL: str = "https://api.deepseek.com"
    DEEPSEEK_DEFAULT_MODEL: str = "deepseek-chat"

    # Redis配置
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )


# 创建全局配置实例
settings = Settings()
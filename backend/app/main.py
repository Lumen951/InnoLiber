"""
FastAPI应用主入口

<copyright>
Copyright (c) 2024-2025 InnoLiber Team
Licensed under the MIT License
</copyright>

<rationale>
架构设计：
- FastAPI: 异步高性能框架，支持OpenAPI自动文档生成
- CORS中间件: 允许前端跨域访问（开发环境配置）
- 健康检查: 提供根路径和专用health端点，便于监控和负载均衡
</rationale>

<warning type="security">
⚠️ 生产环境注意事项：
- CORS配置需要限制为特定域名，避免allow_origins=["*"]
- 需要添加认证中间件（JWT验证）
- 建议配置速率限制（如slowapi）防止滥用
- 敏感配置应从环境变量读取
</warning>

<todo priority="high">
TODO(backend-team, 2025-11-15): [P0] 生产环境部署前
- 添加API路由（/api/v1/proposals, /api/v1/auth等）
- 配置JWT认证中间件
- 添加请求日志和异常处理中间件
- 设置Sentry错误追踪
</todo>

Dependencies:
    - FastAPI 0.104+: 异步Web框架
    - uvicorn: ASGI服务器

Related:
    - app/core/config.py: 配置管理
    - app/api/v1/: API路由（待实现）
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth
from app.core.config import settings

"""
FastAPI应用实例配置

<rationale>
配置参数说明：
- title/description: 自动生成的API文档标题
- version: API版本号，建议遵循语义化版本控制
- docs_url: Swagger UI文档路径（交互式API测试）
- redoc_url: ReDoc文档路径（更适合阅读的API文档）
</rationale>

<warning type="production">
⚠️ 生产环境建议：
- 禁用docs_url和redoc_url（设为None），防止API暴露
- 或添加认证保护文档路径
</warning>
"""
app = FastAPI(
    title="InnoLiber API",
    description="智能科研基金申请助理系统 API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

"""
CORS跨域中间件配置

<rationale>
CORS配置理由：
- allow_origins: 允许前端域名访问（从配置读取）
- allow_credentials: 允许携带Cookie（JWT认证需要）
- allow_methods: 允许所有HTTP方法（GET/POST/PUT/DELETE等）
- allow_headers: 允许所有请求头（支持自定义认证头）
</rationale>

<warning type="security">
⚠️ 安全风险：
- 当前配置可能过于宽松（allow_methods=["*"]）
- 生产环境应明确指定允许的方法和头部
- 建议配合内容安全策略（CSP）使用
</warning>

<hack reason="development-convenience">
HACK: 开发环境使用宽松的CORS策略
生产环境需要严格限制：
- allow_origins: 仅包含实际部署的前端域名
- allow_methods: ["GET", "POST", "PUT", "DELETE"]
- allow_headers: ["Authorization", "Content-Type"]
</hack>
"""
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# API路由注册 (API Routes Registration)
# ============================================================================

"""
API路由注册

<rationale>
路由组织：
- prefix="/api/v1": API版本控制，便于未来升级
- include_router: 模块化路由管理
- 认证路由: /api/v1/auth/*
</rationale>
"""
app.include_router(auth.router, prefix="/api/v1")


@app.get("/")
async def root():
    """
    根路径接口 - 服务基本信息

    <rationale>
    设计目的：
    - 快速验证服务是否启动
    - 显示API版本信息
    - 负载均衡器可用作简单健康检查
    </rationale>

    Returns:
        dict: 包含服务名称、版本和状态的JSON响应

    Example:
        >>> GET /
        {
            "message": "InnoLiber API Service",
            "version": "0.1.0",
            "status": "running"
        }
    """
    return {
        "message": "InnoLiber API Service",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """
    健康检查接口 - 服务状态监控

    <rationale>
    健康检查用途：
    - Kubernetes liveness/readiness探针
    - 负载均衡器后端健康检测
    - 监控系统（如Prometheus）状态采集
    </rationale>

    <todo priority="medium">
    TODO(backend-team, 2025-11-20): [P1] 增强健康检查
    - 检查数据库连接状态
    - 检查Redis缓存可用性
    - 检查外部API（DeepSeek）连通性
    - 返回详细的组件状态和响应时间
    </todo>

    Returns:
        dict: 服务健康状态JSON响应

    Example:
        >>> GET /health
        {
            "status": "healthy",
            "service": "innoliber-backend"
        }
    """
    return {
        "status": "healthy",
        "service": "innoliber-backend"
    }
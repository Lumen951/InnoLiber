"""
标书提案相关的Pydantic模型

<copyright>
Copyright (c) 2024-2025 InnoLiber Team
Licensed under the MIT License
</copyright>

<rationale>
Schema设计原则：
- 与前端TypeScript接口保持一致（frontend/src/types/index.ts）
- 支持创建、更新、查询的不同场景
- 提供完整的数据验证和序列化
- 支持版本控制和并发编辑
</rationale>

<design-decision>
为什么分离Create/Update/Response模型？
- 安全性：Create不包含id/时间戳等敏感字段
- 灵活性：Update支持部分字段更新
- 性能：Response可以控制返回字段的粒度
- 类型安全：明确区分输入和输出数据结构
</design-decision>

Dependencies:
    - pydantic v2: 数据验证和序列化
    - typing: 类型注解支持

Related:
    - frontend/src/types/index.ts: 前端类型定义
    - app/models/proposal.py: SQLAlchemy模型
    - app/api/v1/proposals.py: API路由
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator
from enum import Enum


# ============================================================================
# 枚举类型定义 (Enum Definitions)
# ============================================================================

class ProposalStatus(str, Enum):
    """标书状态枚举"""
    DRAFT = "draft"
    REVIEWING = "reviewing"
    COMPLETED = "completed"
    SUBMITTED = "submitted"


# ============================================================================
# 结构化内容模型 (Structured Content Models)
# ============================================================================

class ProposalContent(BaseModel):
    """
    标书结构化内容模型

    对应前端ProposalDetail接口的content字段
    """
    abstract: str = Field(default="", description="项目摘要")
    background: str = Field(default="", description="研究背景")
    objectives: str = Field(default="", description="研究目标")
    methodology: str = Field(default="", description="研究方法")
    timeline: str = Field(default="", description="研究计划")
    budget: str = Field(default="", description="预算说明")
    references: str = Field(default="", description="参考文献")

    class Config:
        """Pydantic配置"""
        # 允许任意字段类型（支持HTML内容）
        arbitrary_types_allowed = True
        # JSON序列化示例
        schema_extra = {
            "example": {
                "abstract": "<p>本项目旨在研究基于深度学习的图像识别技术...</p>",
                "background": "<p>当前图像识别技术存在以下问题...</p>",
                "objectives": "<p>1. 提高识别准确率至95%以上</p>",
                "methodology": "<p>采用卷积神经网络(CNN)架构...</p>",
                "timeline": "<p><strong>第一年</strong>：理论研究</p>",
                "budget": "<p>设备费：60万元<br/>材料费：20万元</p>",
                "references": "<p>1. Smith, J. et al. Nature 2024.</p>"
            }
        }


# ============================================================================
# 请求模型 (Request Models)
# ============================================================================

class ProposalCreateRequest(BaseModel):
    """
    创建标书请求模型

    对应前端ProposalCreatePage表单数据
    """
    title: str = Field(..., min_length=1, max_length=500, description="标书标题")
    research_field: str = Field(..., description="研究领域")
    description: Optional[str] = Field(None, max_length=1000, description="简短描述")

    # 申请基本信息
    funding_agency: Optional[str] = Field("国家自然科学基金委", description="资助机构")
    funding_amount: Optional[int] = Field(None, ge=1, description="申请金额（万元）")
    project_duration: Optional[int] = Field(None, ge=1, le=60, description="项目期限（月）")
    keywords: Optional[List[str]] = Field(default_factory=list, description="关键词列表")

    class Config:
        schema_extra = {
            "example": {
                "title": "基于深度学习的图像识别与分析研究",
                "research_field": "人工智能",
                "description": "针对复杂场景下的图像识别问题进行深入研究",
                "funding_agency": "国家自然科学基金委",
                "funding_amount": 100,
                "project_duration": 36,
                "keywords": ["深度学习", "图像识别", "神经网络"]
            }
        }


class ProposalUpdateRequest(BaseModel):
    """
    更新标书请求模型

    对应前端编辑页面的保存操作
    支持部分字段更新（所有字段可选）
    """
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=1000)
    content: Optional[str] = Field(None, description="富文本内容（向后兼容）")
    structured_content: Optional[ProposalContent] = Field(None, description="结构化内容")
    word_count: Optional[int] = Field(None, ge=0, description="总字数")
    version: Optional[int] = Field(None, ge=1, description="版本号（乐观锁）")

    # 状态和评分
    status: Optional[ProposalStatus] = Field(None)
    quality_score: Optional[float] = Field(None, ge=0, le=10)
    content_score: Optional[float] = Field(None, ge=0, le=10)
    format_score: Optional[float] = Field(None, ge=0, le=10)
    innovation_score: Optional[float] = Field(None, ge=0, le=10)

    # 申请信息
    research_field: Optional[str] = None
    funding_amount: Optional[int] = Field(None, ge=1)
    project_duration: Optional[int] = Field(None, ge=1, le=60)
    keywords: Optional[List[str]] = None

    @validator('version')
    def validate_version(cls, v):
        """验证版本号"""
        if v is not None and v < 1:
            raise ValueError('版本号必须大于0')
        return v

    class Config:
        schema_extra = {
            "example": {
                "structured_content": {
                    "abstract": "<p>更新后的项目摘要...</p>",
                    "background": "<p>更新后的研究背景...</p>"
                },
                "word_count": 1250,
                "version": 2,
                "quality_score": 7.5
            }
        }


# ============================================================================
# 响应模型 (Response Models)
# ============================================================================

class ProposalResponse(BaseModel):
    """
    标书基础响应模型

    对应前端Proposal接口
    """
    id: int
    title: str
    description: Optional[str]
    status: ProposalStatus
    research_field: Optional[str]
    version: int
    word_count: Optional[int]

    # 质量评分
    quality_score: Optional[float]
    content_score: Optional[float]
    format_score: Optional[float]
    innovation_score: Optional[float]

    # 时间戳
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime]
    last_auto_save_at: Optional[datetime]

    # 申请信息
    funding_agency: Optional[str]
    funding_amount: Optional[int]
    project_duration: Optional[int]
    keywords: Optional[List[str]]

    class Config:
        from_attributes = True  # 支持从SQLAlchemy模型转换


class ProposalDetailResponse(ProposalResponse):
    """
    标书详情响应模型

    对应前端ProposalDetail接口
    包含完整的内容信息
    """
    content: Optional[str] = Field(None, description="富文本内容（向后兼容）")
    structured_content: Optional[ProposalContent] = Field(None, description="结构化内容")

    # AI分析结果
    ai_suggestions: Optional[Dict[str, Any]] = Field(None, description="AI修改建议")
    ai_analysis: Optional[Dict[str, Any]] = Field(None, description="AI分析报告")

    # 附件信息
    files: Optional[List[Dict[str, str]]] = Field(None, description="附件列表")

    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": 123,
                "title": "基于深度学习的图像识别研究",
                "status": "draft",
                "version": 2,
                "word_count": 1250,
                "quality_score": 7.5,
                "structured_content": {
                    "abstract": "<p>本研究旨在...</p>",
                    "background": "<p>当前技术背景...</p>"
                },
                "created_at": "2024-11-15T10:00:00Z",
                "updated_at": "2024-11-15T15:30:00Z"
            }
        }


class ProposalListItem(BaseModel):
    """
    标书列表项模型

    对应前端ProposalCard接口
    用于Dashboard列表展示（不包含内容详情）
    """
    id: int
    title: str
    status: ProposalStatus
    research_field: Optional[str]
    version: int
    word_count: Optional[int]

    # 质量评分（用于卡片展示）
    quality_score: Optional[float]
    content_score: Optional[float]
    format_score: Optional[float]
    innovation_score: Optional[float]

    # 时间信息
    created_at: datetime
    updated_at: datetime

    # 基本申请信息
    funding_amount: Optional[int]
    project_duration: Optional[int]

    class Config:
        from_attributes = True


# ============================================================================
# 分页和列表响应 (Pagination & List Response)
# ============================================================================

class ProposalListResponse(BaseModel):
    """
    标书列表响应模型

    对应前端PaginatedResponse<ProposalCard>
    """
    items: List[ProposalListItem]
    total: int
    page: int
    page_size: int
    total_pages: int

    class Config:
        schema_extra = {
            "example": {
                "items": [
                    {
                        "id": 123,
                        "title": "基于深度学习的图像识别研究",
                        "status": "draft",
                        "quality_score": 7.5,
                        "created_at": "2024-11-15T10:00:00Z"
                    }
                ],
                "total": 45,
                "page": 1,
                "page_size": 20,
                "total_pages": 3
            }
        }


class StatisticsResponse(BaseModel):
    """
    统计数据响应模型

    对应前端Dashboard统计卡片
    """
    total: int = Field(description="总标书数")
    draft: int = Field(description="草稿数")
    reviewing: int = Field(description="审阅中数量")
    completed: int = Field(description="已完成数量")
    submitted: int = Field(description="已提交数量")

    class Config:
        schema_extra = {
            "example": {
                "total": 45,
                "draft": 20,
                "reviewing": 15,
                "completed": 8,
                "submitted": 2
            }
        }


# ============================================================================
# 创建和更新响应 (Create & Update Response)
# ============================================================================

class ProposalCreateResponse(BaseModel):
    """
    创建标书响应模型

    对应前端创建成功后的跳转需求
    """
    proposal_id: int = Field(alias="proposalId", description="新建标书ID")
    status: str = Field(default="draft", description="初始状态")
    message: str = Field(default="标书创建成功", description="成功消息")
    created_at: datetime = Field(alias="createdAt", description="创建时间")

    class Config:
        allow_population_by_field_name = True  # 支持别名
        schema_extra = {
            "example": {
                "proposalId": 123,
                "status": "draft",
                "message": "标书创建成功",
                "createdAt": "2024-11-15T10:00:00Z"
            }
        }


class ProposalUpdateResponse(BaseModel):
    """
    更新标书响应模型

    对应前端自动保存成功反馈
    """
    success: bool = True
    message: str = Field(default="保存成功", description="操作消息")
    version: int = Field(description="更新后版本号")
    updated_at: datetime = Field(alias="updatedAt", description="更新时间")
    word_count: Optional[int] = Field(None, alias="wordCount", description="当前字数")

    class Config:
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "success": True,
                "message": "自动保存成功",
                "version": 3,
                "updatedAt": "2024-11-15T15:45:00Z",
                "wordCount": 1350
            }
        }
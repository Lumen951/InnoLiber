"""
标书提案数据模型

<copyright>
Copyright (c) 2024-2025 InnoLiber Team
Licensed under the MIT License
</copyright>

<rationale>
设计决策：
- status 字符串存储: 可读性强，便于日志和调试（vs 整数枚举）
- JSON 字段: keywords/ai_suggestions/files 使用 JSON 存储，灵活且支持嵌套结构
- 时间戳自动更新: created_at 由数据库生成，updated_at 自动触发更新
- 索引策略: id(主键), title(搜索), owner_id(外键) - 优化常见查询
</rationale>

Dependencies:
    - SQLAlchemy 2.0 (async ORM)
    - PostgreSQL 16 (pgvector 扩展用于向量搜索)

Related:
    - frontend/src/types/index.ts: Proposal 接口
    - services/spgs/: SPG-S 服务计算质量分数
    - services/ddcs/: DDC-S 服务计算合规分数
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, JSON, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base import Base


class Proposal(Base):
    """
    标书提案模型

    存储用户创建的科研基金申请标书，支持从草稿到提交的完整生命周期。

    <design-decision>
    ORM 关系设计：
    - owner (User): 多对一关系，级联删除（删除用户时删除其所有标书）
    - 使用 back_populates 而非 backref: 类型安全，IDE 自动补全友好
    </design-decision>

    <warning type="performance">
    ⚠️ 注意事项：
    - content 字段可能很大（>100KB），列表查询时使用 defer() 延迟加载
    - JSON 字段（ai_suggestions, files）使用 JSONB 类型，支持索引和查询
    - 高频查询需添加索引：CREATE INDEX idx_proposals_status_owner ON proposals(status, owner_id)
    </warning>

    Attributes:
        id (int): 主键ID，自增
        title (str): 标书标题（最大500字符，索引）
        description (str): 简短描述（可选）
        content (str): 正文内容（富文本HTML，可能很大）
        status (str): 状态（draft/reviewing/completed/submitted）
        owner_id (int): 所属用户ID（外键）
        funding_agency (str): 资助机构（如"国家自然科学基金委"）
        funding_amount (int): 申请金额（单位：万元）
        project_duration (int): 项目期限（单位：月）
        research_field (str): 研究领域（用于 K-TAS 文献匹配）
        keywords (list): 关键词数组（JSON 格式）
        quality_score (float): 综合质量分数（0-10，SPG-S 计算）
        content_score (float): 内容质量分数（0-10，权重50%）
        format_score (float): 格式规范分数（0-10，权重30%）
        innovation_score (float): 创新程度分数（0-10，权重20%）
        ai_suggestions (dict): AI 修改建议（JSON 格式）
        ai_analysis (dict): AI 分析结果（JSON 格式）
        files (list): 附件文件列表（JSON 格式）
        created_at (datetime): 创建时间（UTC，自动生成）
        updated_at (datetime): 更新时间（UTC，自动更新）
        submitted_at (datetime): 提交时间（UTC，可选）

    Relationships:
        owner (User): 所属用户（多对一）

    Example:
        >>> from sqlalchemy.ext.asyncio import AsyncSession
        >>> async def create_proposal(session: AsyncSession):
        ...     proposal = Proposal(
        ...         title="基于深度学习的图像识别研究",
        ...         owner_id=123,
        ...         status="draft",
        ...         research_field="人工智能"
        ...     )
        ...     session.add(proposal)
        ...     await session.commit()
        ...     return proposal
    """

    __tablename__ = "proposals"

    # ========== 基础字段 ==========
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False, index=True)  # 索引：支持快速搜索
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=True)  # 正文内容（富文本HTML）

    # ========== 状态信息 ==========
    status = Column(
        String(20),
        nullable=False,
        default="draft",
        comment="draft/reviewing/completed/submitted"
    )

    # ========== 用户关联 ==========
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # ========== 申请信息 ==========
    funding_agency = Column(String(200), nullable=True, comment="资助机构")
    funding_amount = Column(Integer, nullable=True, comment="申请金额（万元）")
    project_duration = Column(Integer, nullable=True, comment="项目期限（月）")
    research_field = Column(String(100), nullable=True, comment="研究领域")
    keywords = Column(JSON, nullable=True, comment="关键词数组")

    # ========== 质量评分（SPG-S 服务计算）==========
    quality_score = Column(Float, nullable=True, default=0.0, comment="综合质量 0-10")
    content_score = Column(Float, nullable=True, default=0.0, comment="内容质量 0-10")
    format_score = Column(Float, nullable=True, default=0.0, comment="格式规范 0-10")
    innovation_score = Column(Float, nullable=True, default=0.0, comment="创新程度 0-10")

    # ========== AI 分析结果 ==========
    ai_suggestions = Column(JSON, nullable=True, comment="AI 修改建议")
    ai_analysis = Column(JSON, nullable=True, comment="AI 分析报告")

    # ========== 附件管理 ==========
    files = Column(JSON, nullable=True, comment="附件列表 [{'name': '...', 'url': '...'}]")

    # ========== 时间戳 ==========
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        comment="更新时间"
    )
    submitted_at = Column(DateTime(timezone=True), nullable=True, comment="提交时间")

    # ========== ORM 关系 ==========
    owner = relationship("User", back_populates="proposals")

    def __repr__(self):
        """开发调试用的字符串表示"""
        title_preview = self.title[:50] + '...' if len(self.title) > 50 else self.title
        return f"<Proposal(id={self.id}, title='{title_preview}', status='{self.status}')>"


# 添加反向关系到 User 模型
# <rationale>
# 在此处添加而非 user.py：避免循环导入问题
# User.proposals 让我们可以通过 user.proposals 访问用户的所有标书
# </rationale>
from .user import User
User.proposals = relationship("Proposal", back_populates="owner")

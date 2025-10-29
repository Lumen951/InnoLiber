from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, JSON, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base import Base

class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False, index=True)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=True)  # 正文内容

    # 状态信息
    status = Column(String(20), nullable=False, default="draft")  # draft, reviewing, completed, submitted

    # 关联用户
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 申请信息
    funding_agency = Column(String(200), nullable=True)  # 资助机构
    funding_amount = Column(Integer, nullable=True)  # 申请金额
    project_duration = Column(Integer, nullable=True)  # 项目期限（月）
    research_field = Column(String(100), nullable=True)  # 研究领域
    keywords = Column(JSON, nullable=True)  # 关键词数组

    # 质量评分
    quality_score = Column(Float, nullable=True, default=0.0)  # 总分 0-10
    content_score = Column(Float, nullable=True, default=0.0)  # 内容质量
    format_score = Column(Float, nullable=True, default=0.0)   # 格式规范
    innovation_score = Column(Float, nullable=True, default=0.0)  # 创新程度

    # AI 分析结果
    ai_suggestions = Column(JSON, nullable=True)  # AI建议
    ai_analysis = Column(JSON, nullable=True)     # AI分析结果

    # 文件和附件
    files = Column(JSON, nullable=True)  # 附件文件列表

    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    submitted_at = Column(DateTime(timezone=True), nullable=True)

    # 关系
    owner = relationship("User", back_populates="proposals")

    def __repr__(self):
        return f"<Proposal(id={self.id}, title='{self.title[:50]}...', status='{self.status}')>"


# 添加反向关系到User模型
from .user import User
User.proposals = relationship("Proposal", back_populates="owner")
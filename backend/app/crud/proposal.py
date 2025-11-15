"""
标书提案CRUD操作服务

<copyright>
Copyright (c) 2024-2025 InnoLiber Team
Licensed under the MIT License
</copyright>

<rationale>
CRUD服务设计原则：
- 单一职责：每个函数只负责一种数据库操作
- 异步优先：所有操作都是异步的，提高并发性能
- 错误处理：明确的异常处理和日志记录
- 类型安全：完整的类型注解和返回值检查
</rationale>

<design-decision>
为什么使用Service层而非直接在API中操作数据库？
- 代码复用：多个API端点可能需要相同的数据库操作
- 测试友好：Service层可以独立测试，无需启动Web服务器
- 事务管理：复杂操作可以在Service层管理事务
- 业务逻辑：将数据库操作和业务逻辑分离
</design-decision>

Dependencies:
    - SQLAlchemy 2.0: 异步ORM操作
    - app.models.proposal: Proposal数据模型
    - app.schemas.proposal: Pydantic数据验证

Related:
    - app/api/v1/proposals.py: API路由层
    - app/db/session.py: 数据库会话管理
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_, desc
from sqlalchemy.orm import selectinload

from app.models.proposal import Proposal
from app.models.user import User
from app.schemas.proposal import (
    ProposalCreateRequest,
    ProposalUpdateRequest,
    ProposalListItem,
    StatisticsResponse,
)


# ============================================================================
# 创建操作 (Create Operations)
# ============================================================================

async def create_proposal(
    db: AsyncSession,
    proposal_data: ProposalCreateRequest,
    user_id: int
) -> Proposal:
    """
    创建新标书

    Args:
        db: 数据库会话
        proposal_data: 创建请求数据
        user_id: 用户ID

    Returns:
        Proposal: 新创建的标书对象

    Raises:
        ValueError: 如果用户不存在
    """
    # 验证用户存在
    user_exists = await db.execute(select(User).where(User.id == user_id))
    if not user_exists.scalar_one_or_none():
        raise ValueError(f"用户不存在: user_id={user_id}")

    # 创建标书对象
    proposal = Proposal(
        title=proposal_data.title,
        description=proposal_data.description,
        research_field=proposal_data.research_field,
        funding_agency=proposal_data.funding_agency,
        funding_amount=proposal_data.funding_amount,
        project_duration=proposal_data.project_duration,
        keywords=proposal_data.keywords or [],
        owner_id=user_id,
        status="draft",
        version=1,
        word_count=0,
    )

    db.add(proposal)
    await db.commit()
    await db.refresh(proposal)

    return proposal


# ============================================================================
# 查询操作 (Read Operations)
# ============================================================================

async def get_proposal_by_id(
    db: AsyncSession,
    proposal_id: int,
    user_id: Optional[int] = None
) -> Optional[Proposal]:
    """
    根据ID获取标书详情

    Args:
        db: 数据库会话
        proposal_id: 标书ID
        user_id: 用户ID（权限控制，如果提供则只能访问自己的标书）

    Returns:
        Optional[Proposal]: 标书对象，如果不存在或无权限则返回None
    """
    query = select(Proposal).where(Proposal.id == proposal_id)

    # 权限控制：只能访问自己的标书
    if user_id is not None:
        query = query.where(Proposal.owner_id == user_id)

    result = await db.execute(query)
    return result.scalar_one_or_none()


async def get_proposals(
    db: AsyncSession,
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    status: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "updated_at",
    sort_order: str = "desc"
) -> tuple[List[Proposal], int]:
    """
    获取用户的标书列表（分页）

    Args:
        db: 数据库会话
        user_id: 用户ID
        skip: 跳过的记录数
        limit: 返回的记录数
        status: 状态筛选
        search: 搜索关键词（标题和研究领域）
        sort_by: 排序字段
        sort_order: 排序方向（asc/desc）

    Returns:
        tuple: (标书列表, 总数)
    """
    # 基础查询：只返回当前用户的标书
    base_query = select(Proposal).where(Proposal.owner_id == user_id)

    # 状态筛选
    if status:
        base_query = base_query.where(Proposal.status == status)

    # 搜索功能：标题和研究领域
    if search:
        search_pattern = f"%{search}%"
        base_query = base_query.where(
            or_(
                Proposal.title.ilike(search_pattern),
                Proposal.research_field.ilike(search_pattern),
                Proposal.description.ilike(search_pattern)
            )
        )

    # 排序
    order_column = getattr(Proposal, sort_by, Proposal.updated_at)
    if sort_order.lower() == "desc":
        base_query = base_query.order_by(desc(order_column))
    else:
        base_query = base_query.order_by(order_column)

    # 获取总数
    count_query = select(func.count()).select_from(base_query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # 获取分页数据
    list_query = base_query.offset(skip).limit(limit)
    result = await db.execute(list_query)
    proposals = result.scalars().all()

    return list(proposals), total


async def get_proposal_statistics(db: AsyncSession, user_id: int) -> StatisticsResponse:
    """
    获取用户标书统计数据

    Args:
        db: 数据库会话
        user_id: 用户ID

    Returns:
        StatisticsResponse: 统计数据
    """
    # 总数查询
    total_query = select(func.count()).where(Proposal.owner_id == user_id)
    total_result = await db.execute(total_query)
    total = total_result.scalar()

    # 按状态统计
    status_query = select(
        Proposal.status,
        func.count().label('count')
    ).where(
        Proposal.owner_id == user_id
    ).group_by(Proposal.status)

    status_result = await db.execute(status_query)
    status_counts = {row.status: row.count for row in status_result}

    return StatisticsResponse(
        total=total,
        draft=status_counts.get('draft', 0),
        reviewing=status_counts.get('reviewing', 0),
        completed=status_counts.get('completed', 0),
        submitted=status_counts.get('submitted', 0),
    )


# ============================================================================
# 更新操作 (Update Operations)
# ============================================================================

async def update_proposal(
    db: AsyncSession,
    proposal_id: int,
    proposal_data: ProposalUpdateRequest,
    user_id: int
) -> Optional[Proposal]:
    """
    更新标书内容

    Args:
        db: 数据库会话
        proposal_id: 标书ID
        proposal_data: 更新数据
        user_id: 用户ID（权限控制）

    Returns:
        Optional[Proposal]: 更新后的标书对象，如果不存在或无权限则返回None

    Raises:
        ValueError: 如果版本冲突（乐观锁）
    """
    # 获取现有标书（权限检查）
    proposal = await get_proposal_by_id(db, proposal_id, user_id)
    if not proposal:
        return None

    # 版本控制（乐观锁）
    if proposal_data.version is not None:
        if proposal_data.version != proposal.version:
            raise ValueError(
                f"版本冲突：当前版本 {proposal.version}，提交版本 {proposal_data.version}"
            )

    # 更新字段（只更新非None的字段）
    update_data = proposal_data.dict(exclude_unset=True, exclude_none=True)

    for field, value in update_data.items():
        if hasattr(proposal, field):
            setattr(proposal, field, value)

    # 自动更新版本号和时间
    proposal.version = proposal.version + 1
    proposal.last_auto_save_at = datetime.utcnow()

    await db.commit()
    await db.refresh(proposal)

    return proposal


# ============================================================================
# 删除操作 (Delete Operations)
# ============================================================================

async def delete_proposal(
    db: AsyncSession,
    proposal_id: int,
    user_id: int
) -> bool:
    """
    删除标书

    Args:
        db: 数据库会话
        proposal_id: 标书ID
        user_id: 用户ID（权限控制）

    Returns:
        bool: 删除成功返回True，标书不存在或无权限返回False
    """
    # 获取标书（权限检查）
    proposal = await get_proposal_by_id(db, proposal_id, user_id)
    if not proposal:
        return False

    await db.delete(proposal)
    await db.commit()

    return True


# ============================================================================
# 字数统计工具函数 (Word Count Utilities)
# ============================================================================

def calculate_word_count(content: str) -> int:
    """
    计算富文本内容的字数

    Args:
        content: 富文本HTML内容

    Returns:
        int: 纯文本字数
    """
    import re

    # 移除HTML标签
    clean_text = re.sub(r'<[^>]+>', '', content)

    # 移除多余空白字符
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()

    return len(clean_text)


def calculate_structured_word_count(structured_content: Dict[str, Any]) -> int:
    """
    计算结构化内容的总字数

    Args:
        structured_content: 结构化内容字典

    Returns:
        int: 总字数
    """
    total_count = 0

    for section_content in structured_content.values():
        if isinstance(section_content, str):
            total_count += calculate_word_count(section_content)

    return total_count


# ============================================================================
# 批量操作 (Batch Operations)
# ============================================================================

async def duplicate_proposal(
    db: AsyncSession,
    proposal_id: int,
    user_id: int,
    new_title: Optional[str] = None
) -> Optional[Proposal]:
    """
    复制标书

    Args:
        db: 数据库会话
        proposal_id: 源标书ID
        user_id: 用户ID
        new_title: 新标书标题，如果为None则自动生成

    Returns:
        Optional[Proposal]: 新创建的标书副本
    """
    # 获取源标书
    original = await get_proposal_by_id(db, proposal_id, user_id)
    if not original:
        return None

    # 生成新标题
    if not new_title:
        new_title = f"{original.title} (副本)"

    # 创建副本
    duplicate = Proposal(
        title=new_title,
        description=original.description,
        content=original.content,
        structured_content=original.structured_content,
        research_field=original.research_field,
        funding_agency=original.funding_agency,
        funding_amount=original.funding_amount,
        project_duration=original.project_duration,
        keywords=original.keywords,
        owner_id=user_id,
        status="draft",  # 副本总是草稿状态
        version=1,       # 新版本从1开始
        word_count=original.word_count,
    )

    db.add(duplicate)
    await db.commit()
    await db.refresh(duplicate)

    return duplicate
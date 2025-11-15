"""
标书提案API路由

<copyright>
Copyright (c) 2024-2025 InnoLiber Team
Licensed under the MIT License
</copyright>

<rationale>
API设计原则：
- RESTful规范：使用标准HTTP动词和状态码
- 权限控制：所有操作都需要JWT认证，用户只能操作自己的标书
- 错误处理：统一的错误响应格式
- 性能优化：分页查询、字段选择性返回
</rationale>

<design-decision>
API路径设计：
- GET  /proposals        - 获取标书列表（支持搜索、筛选、分页）
- POST /proposals        - 创建新标书
- GET  /proposals/{id}   - 获取标书详情
- PUT  /proposals/{id}   - 更新标书（全量或部分更新）
- DELETE /proposals/{id} - 删除标书
- POST /proposals/{id}/duplicate - 复制标书
- GET  /proposals/statistics - 获取统计数据

权限设计：
- 所有端点都需要登录用户（JWT）
- 用户只能操作自己的标书（owner_id检查）
- 返回404而非403，避免信息泄露
</design-decision>

Dependencies:
    - FastAPI: Web框架和依赖注入
    - app.core.dependencies: JWT认证依赖
    - app.crud.proposal: CRUD操作服务
    - app.schemas.proposal: 请求/响应模型
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.crud import proposal as crud_proposal
from app.schemas.proposal import (
    ProposalCreateRequest,
    ProposalCreateResponse,
    ProposalUpdateRequest,
    ProposalUpdateResponse,
    ProposalDetailResponse,
    ProposalListResponse,
    ProposalListItem,
    StatisticsResponse,
)

# 创建路由器
router = APIRouter(
    prefix="/proposals",
    tags=["proposals"],
    dependencies=[Depends(get_current_user)],  # 所有端点都需要认证
)


# ============================================================================
# 标书列表和统计 (List & Statistics)
# ============================================================================

@router.get("/", response_model=ProposalListResponse)
async def get_proposals(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页大小"),
    status: Optional[str] = Query(None, description="状态筛选"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    sort_by: str = Query("updated_at", description="排序字段"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="排序方向"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取当前用户的标书列表

    支持分页、搜索、筛选和排序功能
    """
    # 计算偏移量
    skip = (page - 1) * page_size

    # 获取数据
    proposals, total = await crud_proposal.get_proposals(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=page_size,
        status=status,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order
    )

    # 计算总页数
    total_pages = (total + page_size - 1) // page_size

    # 转换为响应格式
    items = [ProposalListItem.from_orm(proposal) for proposal in proposals]

    return ProposalListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/statistics", response_model=StatisticsResponse)
async def get_statistics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取当前用户的标书统计数据

    返回各状态的标书数量统计
    """
    return await crud_proposal.get_proposal_statistics(db=db, user_id=current_user.id)


# ============================================================================
# 标书详情 (Detail)
# ============================================================================

@router.get("/{proposal_id}", response_model=ProposalDetailResponse)
async def get_proposal(
    proposal_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取标书详情

    包含完整的标书内容和AI分析结果
    """
    proposal = await crud_proposal.get_proposal_by_id(
        db=db,
        proposal_id=proposal_id,
        user_id=current_user.id
    )

    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="标书不存在"
        )

    return ProposalDetailResponse.from_orm(proposal)


# ============================================================================
# 标书创建 (Create)
# ============================================================================

@router.post("/", response_model=ProposalCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_proposal(
    proposal_data: ProposalCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    创建新标书

    创建成功后返回标书ID，前端可跳转到编辑页面
    """
    try:
        proposal = await crud_proposal.create_proposal(
            db=db,
            proposal_data=proposal_data,
            user_id=current_user.id
        )

        return ProposalCreateResponse(
            proposalId=proposal.id,
            status=proposal.status,
            message="标书创建成功",
            createdAt=proposal.created_at
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="创建标书失败，请重试"
        )


# ============================================================================
# 标书更新 (Update)
# ============================================================================

@router.put("/{proposal_id}", response_model=ProposalUpdateResponse)
async def update_proposal(
    proposal_id: int,
    proposal_data: ProposalUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    更新标书内容

    支持部分字段更新，包含版本控制防止并发冲突
    """
    try:
        # 如果包含结构化内容，计算字数
        if proposal_data.structured_content:
            content_dict = proposal_data.structured_content.dict()
            calculated_word_count = crud_proposal.calculate_structured_word_count(content_dict)

            # 如果用户没有提供字数，使用计算值
            if proposal_data.word_count is None:
                proposal_data.word_count = calculated_word_count

        proposal = await crud_proposal.update_proposal(
            db=db,
            proposal_id=proposal_id,
            proposal_data=proposal_data,
            user_id=current_user.id
        )

        if not proposal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="标书不存在"
            )

        return ProposalUpdateResponse(
            success=True,
            message="保存成功",
            version=proposal.version,
            updatedAt=proposal.updated_at,
            wordCount=proposal.word_count
        )

    except ValueError as e:
        # 版本冲突或其他业务逻辑错误
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="更新失败，请重试"
        )


# ============================================================================
# 标书删除 (Delete)
# ============================================================================

@router.delete("/{proposal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_proposal(
    proposal_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    删除标书

    软删除或硬删除，取决于业务需求
    """
    success = await crud_proposal.delete_proposal(
        db=db,
        proposal_id=proposal_id,
        user_id=current_user.id
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="标书不存在"
        )

    # 204 No Content - 成功删除，无返回内容


# ============================================================================
# 标书复制 (Duplicate)
# ============================================================================

@router.post("/{proposal_id}/duplicate", response_model=ProposalCreateResponse, status_code=status.HTTP_201_CREATED)
async def duplicate_proposal(
    proposal_id: int,
    new_title: Optional[str] = Query(None, description="新标书标题"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    复制标书

    创建现有标书的副本，状态重置为草稿
    """
    try:
        duplicate = await crud_proposal.duplicate_proposal(
            db=db,
            proposal_id=proposal_id,
            user_id=current_user.id,
            new_title=new_title
        )

        if not duplicate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="源标书不存在"
            )

        return ProposalCreateResponse(
            proposalId=duplicate.id,
            status=duplicate.status,
            message="标书复制成功",
            createdAt=duplicate.created_at
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="复制失败，请重试"
        )
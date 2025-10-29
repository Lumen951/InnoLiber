# 代码规范文档

**版本**: v1.0
**创建日期**: 2025-10-28
**适用范围**: InnoLiber全栈代码

---

## 📋 总体原则

### 代码质量标准
1. **可读性优先**: 代码是写给人看的，其次才是机器
2. **类型安全**: 全栈类型检查，减少运行时错误
3. **单一职责**: 每个函数/类只做一件事
4. **DRY原则**: Don't Repeat Yourself
5. **测试覆盖**: 核心业务逻辑测试覆盖率 > 80%

### 中文注释规范
```python
# ✅ 正确：使用中文注释说明业务逻辑
def calculate_quality_score(proposal: Proposal) -> float:
    """
    计算标书质量分数

    参数:
        proposal: 标书对象

    返回:
        float: 质量分数（0.0-1.0）

    说明:
        综合考虑内容完整性、格式规范性、创新性等指标
    """
    # 计算内容完整性得分
    completeness = assess_completeness(proposal)

    # 计算格式合规性得分
    compliance = check_format_compliance(proposal)

    return (completeness * 0.6 + compliance * 0.4)

# ❌ 错误：混用中英文或拼音
def jisuanScore(proposal):  # 不要使用拼音
    # calculate the score  # 避免英文注释
    pass
```

---

## 🐍 Python代码规范

### 基础规范（PEP 8）

#### 命名约定
```python
# 模块名：全小写，下划线分隔
# proposal_service.py, ktas_analyzer.py

# 类名：大驼峰（PascalCase）
class ProposalService:
    pass

class LLMClient:
    pass

# 函数/变量名：小写，下划线分隔（snake_case）
def generate_section_content(proposal_id: UUID, section_type: str) -> str:
    user_input = get_user_input()
    return process_content(user_input)

# 常量：全大写，下划线分隔
MAX_RETRY_TIMES = 3
DATABASE_URL = "postgresql://..."
DEFAULT_MODEL_NAME = "deepseek-chat"

# 私有属性/方法：单下划线前缀
class ProposalManager:
    def __init__(self):
        self._cache = {}  # 私有属性

    def _validate_input(self, data: dict) -> bool:  # 私有方法
        return True
```

#### 导入顺序
```python
# 1. 标准库
import os
import sys
from datetime import datetime
from typing import List, Optional, Dict

# 2. 第三方库
import torch
from fastapi import FastAPI, Depends
from sqlalchemy import select
from pydantic import BaseModel

# 3. 本地模块
from app.core.database import get_db_session
from app.models.proposal import Proposal
from app.services.ktas import KTASService
```

### 类型提示（Type Hints）
```python
from typing import List, Optional, Dict, Union
from uuid import UUID
from datetime import datetime

# ✅ 完整的类型提示
async def create_proposal(
    user_id: UUID,
    title: str,
    research_field: str,
    initial_idea: Optional[Dict[str, str]] = None
) -> Proposal:
    """创建新标书"""
    proposal = Proposal(
        user_id=user_id,
        title=title,
        research_field=research_field
    )
    await proposal.save()
    return proposal

# ✅ 复杂类型
from pydantic import BaseModel

class ProposalCreateRequest(BaseModel):
    """标书创建请求模型"""
    title: str
    research_field: str
    initial_idea: Optional[Dict[str, List[str]]] = None

# ✅ 返回多个值
def analyze_trends(topic: str) -> tuple[List[str], float]:
    """
    分析研究趋势

    返回:
        (趋势列表, 置信度)
    """
    trends = ["trend1", "trend2"]
    confidence = 0.85
    return trends, confidence
```

### Pydantic模型规范
```python
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from uuid import UUID

class ProposalBase(BaseModel):
    """标书基础模型"""
    title: str = Field(..., min_length=5, max_length=500, description="标书标题")
    research_field: str = Field(..., description="研究领域")

    @validator('title')
    def title_not_empty(cls, v: str) -> str:
        """验证标题不为空白"""
        if not v.strip():
            raise ValueError("标题不能为空")
        return v.strip()

class ProposalCreate(ProposalBase):
    """创建标书请求"""
    initial_idea: Optional[dict] = Field(None, description="初步想法")

class ProposalResponse(ProposalBase):
    """标书响应模型"""
    id: UUID
    user_id: UUID
    status: str
    created_at: datetime

    class Config:
        from_attributes = True  # SQLAlchemy兼容
```

### 异步编程规范
```python
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession

# ✅ 正确的异步函数
async def get_proposal_by_id(
    proposal_id: UUID,
    db: AsyncSession
) -> Optional[Proposal]:
    """根据ID获取标书"""
    result = await db.execute(
        select(Proposal).where(Proposal.id == proposal_id)
    )
    return result.scalar_one_or_none()

# ✅ 并发调用
async def batch_analyze(topics: List[str]) -> List[dict]:
    """批量分析主题"""
    tasks = [analyze_single_topic(topic) for topic in topics]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return results

# ✅ 异步上下文管理器
async def process_proposal(proposal_id: UUID):
    """处理标书"""
    async with get_db_session() as db:
        proposal = await get_proposal_by_id(proposal_id, db)
        await update_proposal_status(proposal, "processing")
```

### 错误处理
```python
from fastapi import HTTPException, status
import logging

logger = logging.getLogger(__name__)

# ✅ 具体的异常类型
class ProposalNotFoundError(Exception):
    """标书不存在异常"""
    pass

class InsufficientPermissionError(Exception):
    """权限不足异常"""
    pass

# ✅ 完善的错误处理
async def delete_proposal(proposal_id: UUID, user_id: UUID):
    """删除标书"""
    try:
        proposal = await get_proposal_by_id(proposal_id)

        if not proposal:
            raise ProposalNotFoundError(f"标书 {proposal_id} 不存在")

        if proposal.user_id != user_id:
            raise InsufficientPermissionError("无权删除此标书")

        await proposal.delete()
        logger.info(f"用户 {user_id} 删除了标书 {proposal_id}")

    except ProposalNotFoundError as e:
        logger.warning(str(e))
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except InsufficientPermissionError as e:
        logger.warning(f"权限错误: {e}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="您没有权限执行此操作"
        )
    except Exception as e:
        logger.error(f"删除标书失败: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="服务器内部错误"
        )
```

### 日志规范
```python
import logging
from app.core.config import settings

# 配置日志
logging.basicConfig(
    level=logging.INFO if settings.ENV == "production" else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# ✅ 日志使用示例
def generate_content(prompt: str) -> str:
    """生成内容"""
    logger.info(f"开始生成内容, prompt长度: {len(prompt)}")

    try:
        result = call_llm_api(prompt)
        logger.info(f"内容生成成功, 长度: {len(result)}")
        return result
    except Exception as e:
        logger.error(f"内容生成失败: {e}", exc_info=True)
        raise

# 日志级别使用建议:
# DEBUG: 详细的调试信息
# INFO: 正常的业务流程信息
# WARNING: 警告信息（不影响运行）
# ERROR: 错误信息（需要关注）
# CRITICAL: 严重错误（系统级问题）
```

---

## ⚛️ TypeScript/React代码规范

### 命名约定
```typescript
// 组件名：大驼峰（PascalCase）
const ProposalEditor: React.FC = () => { ... }
const UserProfile: React.FC = () => { ... }

// 函数/变量：小驼峰（camelCase）
const [proposals, setProposals] = useState<Proposal[]>([]);
const handleSubmit = () => { ... }

// 常量：全大写，下划线分隔
const API_BASE_URL = 'https://api.innolibr.com';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// 接口/类型：大驼峰，添加I或T前缀（可选）
interface IProposal {
  id: string;
  title: string;
}

type TProposalStatus = 'draft' | 'reviewing' | 'completed';

// 枚举：大驼峰
enum ProposalStatus {
  Draft = 'draft',
  Reviewing = 'reviewing',
  Completed = 'completed'
}
```

### 类型定义
```typescript
// types/proposal.ts

// ✅ 完整的类型定义
export interface Proposal {
  id: string;
  userId: string;
  title: string;
  researchField: string;
  status: ProposalStatus;
  version: number;
  content: ProposalContent;
  qualityScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalContent {
  sections: Section[];
  metadata?: Record<string, unknown>;
}

export interface Section {
  id: string;
  type: SectionType;
  title: string;
  content: string;
  wordCount: number;
}

export type SectionType =
  | 'background'
  | 'objectives'
  | 'methods'
  | 'feasibility'
  | 'foundation'
  | 'budget';

// ✅ API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  timestamp: string;
}
```

### React组件规范
```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Form, Input, message } from 'antd';
import type { Proposal, ProposalCreateRequest } from '@/types/proposal';

// ✅ 函数组件 + TypeScript
interface ProposalFormProps {
  initialValues?: Partial<Proposal>;
  onSubmit: (values: ProposalCreateRequest) => Promise<void>;
  onCancel?: () => void;
}

export const ProposalForm: React.FC<ProposalFormProps> = ({
  initialValues,
  onSubmit,
  onCancel
}) => {
  // State声明
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Effect Hooks
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  // 事件处理函数
  const handleSubmit = useCallback(async (values: ProposalCreateRequest) => {
    setLoading(true);
    try {
      await onSubmit(values);
      message.success('标书创建成功');
      form.resetFields();
    } catch (error) {
      message.error('创建失败，请重试');
      console.error('标书创建错误:', error);
    } finally {
      setLoading(false);
    }
  }, [onSubmit, form]);

  // JSX渲染
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        name="title"
        label="标书标题"
        rules={[
          { required: true, message: '请输入标书标题' },
          { min: 5, message: '标题至少5个字符' }
        ]}
      >
        <Input placeholder="请输入标书标题" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          创建标书
        </Button>
        {onCancel && (
          <Button onClick={onCancel} style={{ marginLeft: 8 }}>
            取消
          </Button>
        )}
      </Form.Item>
    </Form>
  );
};
```

### 自定义Hooks
```typescript
// hooks/useProposal.ts
import { useState, useCallback } from 'react';
import { message } from 'antd';
import { proposalApi } from '@/services/api';
import type { Proposal } from '@/types/proposal';

/**
 * 标书管理Hook
 */
export const useProposal = (proposalId?: string) => {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 获取标书详情
  const fetchProposal = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await proposalApi.getById(id);
      setProposal(data);
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      message.error('获取标书失败');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新标书
  const updateProposal = useCallback(async (
    id: string,
    updates: Partial<Proposal>
  ) => {
    setLoading(true);
    try {
      const updated = await proposalApi.update(id, updates);
      setProposal(updated);
      message.success('更新成功');
      return updated;
    } catch (err) {
      message.error('更新失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    proposal,
    loading,
    error,
    fetchProposal,
    updateProposal
  };
};
```

### API调用规范
```typescript
// services/api/proposal.ts
import axios, { AxiosInstance } from 'axios';
import type { ApiResponse, Proposal, ProposalCreateRequest } from '@/types';

class ProposalAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 请求拦截器
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        // 统一错误处理
        if (error.response?.status === 401) {
          // Token过期，跳转登录
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * 创建标书
   */
  async create(data: ProposalCreateRequest): Promise<Proposal> {
    const response = await this.client.post<ApiResponse<Proposal>>(
      '/proposals',
      data
    );
    return response.data;
  }

  /**
   * 获取标书列表
   */
  async list(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<{ items: Proposal[]; total: number }> {
    const response = await this.client.get<ApiResponse<{
      items: Proposal[];
      pagination: { total: number };
    }>>('/proposals', { params });
    return {
      items: response.data.items,
      total: response.data.pagination.total
    };
  }

  /**
   * 获取标书详情
   */
  async getById(id: string): Promise<Proposal> {
    const response = await this.client.get<ApiResponse<Proposal>>(
      `/proposals/${id}`
    );
    return response.data;
  }
}

export const proposalApi = new ProposalAPI();
```

---

## 🧪 测试规范

### Python测试（pytest）
```python
# tests/test_services/test_proposal_service.py
import pytest
from uuid import uuid4
from app.services.proposal import ProposalService
from app.models.proposal import Proposal

class TestProposalService:
    """标书服务测试"""

    @pytest.fixture
    async def service(self, db_session):
        """服务fixture"""
        return ProposalService(db_session)

    @pytest.fixture
    async def mock_user_id(self):
        """模拟用户ID"""
        return uuid4()

    async def test_create_proposal_success(self, service, mock_user_id):
        """测试成功创建标书"""
        # Arrange
        data = {
            "title": "测试标书",
            "research_field": "计算机科学"
        }

        # Act
        proposal = await service.create_proposal(mock_user_id, data)

        # Assert
        assert proposal.id is not None
        assert proposal.title == data["title"]
        assert proposal.user_id == mock_user_id
        assert proposal.status == "draft"

    async def test_create_proposal_validation_error(self, service, mock_user_id):
        """测试创建标书时的验证错误"""
        # Arrange
        invalid_data = {"title": ""}  # 空标题

        # Act & Assert
        with pytest.raises(ValueError, match="标题不能为空"):
            await service.create_proposal(mock_user_id, invalid_data)
```

### TypeScript测试（Vitest）
```typescript
// tests/hooks/useProposal.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProposal } from '@/hooks/useProposal';
import { proposalApi } from '@/services/api';

// Mock API
vi.mock('@/services/api', () => ({
  proposalApi: {
    getById: vi.fn(),
    update: vi.fn()
  }
}));

describe('useProposal Hook', () => {
  it('应该成功获取标书', async () => {
    // Arrange
    const mockProposal = {
      id: '123',
      title: '测试标书',
      status: 'draft'
    };
    vi.mocked(proposalApi.getById).mockResolvedValue(mockProposal);

    // Act
    const { result } = renderHook(() => useProposal());
    await result.current.fetchProposal('123');

    // Assert
    await waitFor(() => {
      expect(result.current.proposal).toEqual(mockProposal);
      expect(result.current.loading).toBe(false);
    });
  });
});
```

---

## 📁 文件组织规范

### 后端目录结构
```
backend/app/
├── api/                    # API路由层
│   └── v1/
│       ├── proposals.py    # 标书相关API
│       └── ktas.py         # K-TAS服务API
├── core/                   # 核心模块
│   ├── config.py           # 配置管理
│   ├── database.py         # 数据库连接
│   └── security.py         # 安全相关
├── models/                 # 数据模型
│   └── proposal.py
├── schemas/                # Pydantic模型
│   └── proposal.py
├── services/               # 业务逻辑
│   └── proposal_service.py
└── utils/                  # 工具函数
    └── logger.py
```

### 前端目录结构
```
frontend/src/
├── components/             # 通用组件
│   ├── Layout/
│   └── ProposalCard/
│       ├── index.tsx       # 组件主文件
│       ├── styles.module.css  # 样式文件
│       └── types.ts        # 类型定义
├── pages/                  # 页面组件
│   └── ProposalEditor/
├── hooks/                  # 自定义Hooks
├── services/               # API调用
├── store/                  # 状态管理
├── types/                  # 全局类型定义
└── utils/                  # 工具函数
```

---

## 📝 注释与文档

### Python Docstring
```python
def analyze_trends(
    topic: str,
    time_range: tuple[datetime, datetime],
    depth: str = "comprehensive"
) -> dict:
    """
    分析研究主题的趋势

    此函数通过分析文献数据库，识别指定主题在给定时间范围内的研究趋势，
    包括热门话题、引用增长率、研究空白等信息。

    参数:
        topic: 研究主题，例如 "大语言模型Agent"
        time_range: 时间范围，格式为 (开始时间, 结束时间)
        depth: 分析深度，可选值:
            - "quick": 快速分析（5分钟内）
            - "standard": 标准分析（15分钟）
            - "comprehensive": 全面分析（30分钟以上）

    返回:
        dict: 包含以下键的字典:
            - trending_topics: 热门话题列表
            - growth_rate: 增长率
            - research_gaps: 研究空白
            - recommendations: 建议

    抛出:
        ValueError: 当时间范围无效时
        TimeoutError: 当分析超时时

    示例:
        >>> from datetime import datetime
        >>> start = datetime(2023, 1, 1)
        >>> end = datetime(2025, 1, 1)
        >>> result = analyze_trends("LLM Agent", (start, end))
        >>> print(result['trending_topics'])
        ['Multi-Agent Collaboration', 'Tool Use', ...]

    注意:
        - 此函数是异步操作，建议在后台任务中调用
        - 深度分析可能消耗大量计算资源
    """
    pass
```

### TypeScript JSDoc
```typescript
/**
 * 标书管理API客户端
 *
 * 提供标书的增删改查功能，包括创建、更新、删除和查询标书。
 * 所有方法都需要用户认证。
 *
 * @example
 * ```ts
 * const api = new ProposalAPI();
 * const proposal = await api.create({
 *   title: '研究标书',
 *   researchField: '计算机科学'
 * });
 * ```
 */
class ProposalAPI {
  /**
   * 创建新标书
   *
   * @param data - 标书创建请求数据
   * @returns 创建成功的标书对象
   * @throws {ValidationError} 当数据验证失败时
   * @throws {AuthError} 当用户未认证时
   *
   * @example
   * ```ts
   * const proposal = await api.create({
   *   title: '基于AI的研究',
   *   researchField: '人工智能'
   * });
   * console.log(proposal.id); // "uuid-xxx"
   * ```
   */
  async create(data: ProposalCreateRequest): Promise<Proposal> {
    // ...
  }
}
```

---

## 🔧 工具配置

### Black（Python格式化）
```toml
# pyproject.toml
[tool.black]
line-length = 100
target-version = ['py311']
include = '\.pyi?$'
```

### ESLint + Prettier（TypeScript）
```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": "warn"
  }
}

// .prettierrc
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true
}
```

---

**文档状态**: ✅ 规范完成
**最后更新**: 2025-10-28
**强制执行**: 通过Pre-commit Hooks
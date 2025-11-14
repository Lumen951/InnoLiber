/**
 * @file proposalService.real.ts
 * @description 标书API服务 - 真实API实现
 *
 * <copyright>
 * Copyright (c) 2024-2025 InnoLiber Team
 * Licensed under the MIT License
 * </copyright>
 *
 * @author InnoLiber Team
 * @version 1.0.0
 */

import { apiService } from './api';
import type {
  ProposalCreateRequest,
  ProposalCreateResponse,
  Proposal,
  ProposalListResponse
} from '@/types';

/**
 * 真实标书服务类
 *
 * <rationale>
 * 设计决策：
 * - 调用真实后端API（FastAPI服务器）
 * - 使用统一的apiService，自动处理认证和错误
 * - 接口与Mock完全一致，便于无缝切换
 * </rationale>
 *
 * <warning type="dependency">
 * ⚠️ 依赖条件：
 * - 后端服务器必须运行（http://localhost:8000）
 * - API端点必须已实现（Phase 2任务）
 * - 数据库必须正常连接
 *
 * 使用前请确认：
 * - 运行 docker-compose up -d（启动PostgreSQL）
 * - 运行 cd backend && poetry run uvicorn app.main:app --reload
 * - 访问 http://localhost:8000/docs 验证API可用
 * </warning>
 */
export class RealProposalService {
  /**
   * 创建新标书
   *
   * @param data 标书创建请求数据
   * @returns Promise<ProposalCreateResponse> 创建响应
   *
   * <api-contract>
   * API端点：POST /api/proposals
   *
   * 请求示例：
   * {
   *   "title": "基于大语言模型的研究",
   *   "researchField": "人工智能",
   *   "projectType": "面上项目",
   *   "year": 2026,
   *   "institution": "XX大学",
   *   "funding": 80,
   *   "duration": 4,
   *   "keywords": ["大语言模型", "多智能体"],
   *   "abstract": "本研究针对...",
   *   "status": "draft"
   * }
   *
   * 成功响应（200）：
   * {
   *   "success": true,
   *   "data": {
   *     "proposalId": "550e8400-e29b-41d4-a716-446655440000",
   *     "status": "draft",
   *     "createdAt": "2024-11-20T10:30:00Z"
   *   },
   *   "message": "标书创建成功",
   *   "timestamp": "2024-11-20T10:30:00Z"
   * }
   * </api-contract>
   */
  async create(data: ProposalCreateRequest): Promise<ProposalCreateResponse> {
    return await apiService.post<ProposalCreateResponse>('/api/proposals', data);
  }

  /**
   * 获取标书列表（分页）
   */
  async getList(params: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<ProposalListResponse> {
    return await apiService.get<ProposalListResponse>('/api/proposals', params);
  }

  /**
   * 获取标书详情
   */
  async getById(id: string): Promise<Proposal> {
    return await apiService.get<Proposal>(`/api/proposals/${id}`);
  }

  /**
   * 更新标书
   */
  async update(id: string, data: Partial<Proposal>): Promise<Proposal> {
    return await apiService.put<Proposal>(`/api/proposals/${id}`, data);
  }

  /**
   * 删除标书
   */
  async delete(id: string): Promise<void> {
    return await apiService.delete<void>(`/api/proposals/${id}`);
  }
}

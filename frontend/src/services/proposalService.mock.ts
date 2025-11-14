/**
 * @file proposalService.mock.ts
 * @description 标书API服务 - Mock实现（临时开发用）
 *
 * 🔴 MOCK-FILE - Phase 2 删除指南
 * ==========================================
 * 删除时机：Phase 2（后端API实现完成后，预计2025-11-20）
 *
 * 删除步骤：
 *   1. 删除本文件：frontend/src/services/proposalService.mock.ts
 *   2. 修改文件：frontend/src/services/proposalService.ts
 *      - 删除Mock导入行
 *      - 删除Mock切换逻辑，直接导出RealProposalService
 *   3. 修改配置：frontend/.env.development
 *      - 修改 VITE_USE_MOCK=false
 *   4. 测试验证：运行 npm run dev，确保真实API调用正常
 *
 * 影响范围：
 *   - ProposalCreatePage.tsx（create方法）
 *   - 未来的其他页面（getList, getById, update, delete方法）
 *
 * 详细文档：docs/technical/04_phase2_mock_cleanup.md
 * ==========================================
 *
 * <copyright>
 * Copyright (c) 2024-2025 InnoLiber Team
 * Licensed under the MIT License
 * </copyright>
 *
 * @author InnoLiber Team
 * @version 1.0.0-mock
 */

import type {
  ProposalCreateRequest,
  ProposalCreateResponse,
  Proposal,
  ProposalListResponse
} from '@/types';

/**
 * Mock标书服务类
 *
 * <rationale>
 * 设计目的：
 * - 前后端并行开发，避免前端被阻塞
 * - 模拟真实API行为（网络延迟、成功/失败响应）
 * - 提供假数据支持前端UI开发和测试
 *
 * 实现特点：
 * - 模拟500ms网络延迟（真实场景为200-1000ms）
 * - 返回数据格式与真实API完全一致
 * - 支持控制台日志，方便调试
 * </rationale>
 *
 * <warning type="temporary">
 * ⚠️ 临时代码警告：
 * - 本类仅用于Phase 1前端开发
 * - 数据不会持久化，刷新页面后丢失
 * - Phase 2必须替换为真实API
 * </warning>
 */
export class MockProposalService {
  /**
   * 模拟网络延迟
   *
   * @param ms 延迟毫秒数（默认500ms）
   * @returns Promise<void>
   *
   * <rationale>
   * 模拟真实网络环境：
   * - 本地开发：~50ms
   * - 同城服务器：~200ms
   * - 跨区域服务器：~500-1000ms
   * 设置500ms是中等延迟，可测试加载状态
   * </rationale>
   */
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 创建新标书（Mock）
   *
   * @param data 标书创建请求数据
   * @returns Promise<ProposalCreateResponse> 创建响应
   *
   * <warning type="mock-behavior">
   * Mock行为说明：
   * - 不进行真实的数据验证（依赖前端Zod校验）
   * - 不保存到数据库（数据存在内存）
   * - 总是返回成功（不模拟失败场景）
   * </warning>
   *
   * @example
   * ```ts
   * const response = await mockService.create({
   *   title: '基于大语言模型的研究',
   *   researchField: '人工智能',
   *   projectType: '面上项目',
   *   year: 2026,
   *   institution: 'XX大学',
   *   funding: 80,
   *   duration: 4,
   *   keywords: ['大语言模型', '多智能体'],
   *   abstract: '本研究针对...',
   *   status: 'draft'
   * });
   * // response.data.proposalId = 'mock-1730188800000'
   * ```
   */
  async create(data: ProposalCreateRequest): Promise<ProposalCreateResponse> {
    console.log('[Mock] 创建标书请求:', data);

    // 模拟网络延迟
    await this.delay(500);

    // 生成Mock响应数据
    const response: ProposalCreateResponse = {
      success: true,
      data: {
        proposalId: 'mock-' + Date.now(),
        status: 'draft',
        createdAt: new Date().toISOString()
      },
      message: '标书创建成功（Mock模式）',
      timestamp: new Date().toISOString()
    };

    console.log('[Mock] 创建标书响应:', response);
    return response;
  }

  /**
   * 获取标书列表（Mock）
   *
   * <todo priority="medium">
   * TODO(Phase 1, 2025-11-15): [P1] 添加Mock列表数据
   * 当Dashboard需要显示列表时补充此方法
   * </todo>
   *
   * @param params 查询参数
   * @returns Promise<ProposalListResponse> 分页列表
   */
  async getList(params: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<ProposalListResponse> {
    console.log('[Mock] 获取标书列表:', params);
    await this.delay(300);

    // 返回空列表（Phase 1暂不需要）
    return {
      items: [],
      total: 0,
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      totalPages: 0
    };
  }

  /**
   * 获取标书详情（Mock）
   *
   * <todo priority="medium">
   * TODO(Phase 1, 2025-11-18): [P1] 添加Mock详情数据
   * 当ProposalDetailPage需要时补充此方法
   * </todo>
   *
   * @param id 标书ID
   * @returns Promise<Proposal> 标书详情
   */
  async getById(id: string): Promise<Proposal> {
    console.log('[Mock] 获取标书详情:', id);
    await this.delay(300);

    throw new Error('Mock方法未实现，Phase 1暂不需要');
  }

  /**
   * 更新标书（Mock）
   *
   * <todo priority="low">
   * TODO(Phase 1, 2025-11-20): [P2] 添加Mock更新逻辑
   * 当ProposalEditPage需要时补充此方法
   * </todo>
   *
   * @param id 标书ID
   * @param data 更新数据
   * @returns Promise<Proposal> 更新后的标书
   */
  async update(id: string, data: Partial<Proposal>): Promise<Proposal> {
    console.log('[Mock] 更新标书:', id, data);
    await this.delay(400);

    throw new Error('Mock方法未实现，Phase 1暂不需要');
  }

  /**
   * 删除标书（Mock）
   *
   * @param id 标书ID
   * @returns Promise<void>
   */
  async delete(id: string): Promise<void> {
    console.log('[Mock] 删除标书:', id);
    await this.delay(300);
    console.log('[Mock] 删除成功（模拟）');
  }
}

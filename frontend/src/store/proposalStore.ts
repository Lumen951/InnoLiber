/**
 * @file proposalStore.ts
 * @description Zustand 标书管理状态存储
 *
 * <copyright>
 * Copyright (c) 2024-2025 InnoLiber Team
 * Licensed under the MIT License
 * </copyright>
 *
 * @author InnoLiber Team
 * @version 1.0.0
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ProposalCard, StatisticsResponse } from '@/types';

/**
 * 标书状态管理接口
 *
 * <rationale>
 * 设计决策：
 * - 使用 Zustand 而非 Redux: 更简洁的 API，更好的 TypeScript 支持，无样板代码
 * - devtools 中间件: 开发环境支持 Redux DevTools，便于状态调试
 * - 状态扁平化: 避免嵌套状态，提高更新性能
 * </rationale>
 *
 * <warning type="performance">
 * ⚠️ 性能注意：
 * - proposals 数组可能很大（100+ 项），频繁更新会导致重渲染
 * - 解决方案：useSelector 选择性订阅，或使用 immer 优化复杂更新
 * </warning>
 *
 * <todo priority="medium">
 * TODO(frontend-team, 2025-11-30): [P1] 优化列表性能
 * Issue: #456
 * 方案：1) 使用 immer 更新 2) 实现虚拟滚动 3) 添加索引标识符
 * </todo>
 */
interface ProposalStore {
  // ========== 数据状态 ==========
  proposals: ProposalCard[];  // 标书列表
  statistics: StatisticsResponse | null;  // 统计数据
  loading: boolean;           // 加载状态
  error: string | null;       // 错误信息

  // ========== 分页状态 ==========
  currentPage: number;    // 当前页码
  pageSize: number;       // 每页数量
  total: number;          // 总记录数
  totalPages: number;     // 总页数

  // ========== 筛选状态 ==========
  statusFilter: string;   // 状态筛选
  sortBy: string;         // 排序字段
  sortOrder: 'asc' | 'desc';  // 排序方向

  // ========== Actions ==========
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setProposals: (proposals: ProposalCard[]) => void;
  setStatistics: (statistics: StatisticsResponse) => void;
  addProposal: (proposal: ProposalCard) => void;
  updateProposal: (id: string, proposal: Partial<ProposalCard>) => void;
  removeProposal: (id: string) => void;
  setPagination: (page: number, pageSize: number, total: number, totalPages: number) => void;
  setFilters: (filters: { status?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }) => void;
  reset: () => void;
}

/**
 * 标书状态管理 Hook
 *
 * <rationale>
 * Action 实现说明：
 * - setLoading/setError: 简单状态更新，直接使用 set
 * - addProposal: 使用函数式更新，新标书添加到数组开头
 * - updateProposal: 使用函数式更新 + map 查找，不改变引用
 * - setFilters: 使用 ?? 运算符保持未修改的字段值
 * </rationale>
 *
 * <warning type="security">
 * ⚠️ 并发安全：
 * - update/removeProposal 未检查版本号，可能并发更新丢失
 * - 解决方案：传入 version 字段，检查成功后再更新状态
 * </warning>
 *
 * @example
 * ```tsx
 * // 在组件中使用
 * const {
 *   proposals, loading, error,
 *   fetchProposals, deleteProposal
 * } = useProposalStore();

 * // 选择性订阅（避免不必要重渲染）
 * const proposals = useProposalStore(state => state.proposals);
 * const loading = useProposalStore(state => state.loading);
 * ```
 */
export const useProposalStore = create<ProposalStore>()(
  devtools(
    (set, get) => ({
      // ========== 初始状态 ==========
      proposals: [],
      statistics: null,
      loading: false,
      error: null,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
      statusFilter: '',
      sortBy: 'updatedAt',
      sortOrder: 'desc',

      // ========== Actions ==========

      /**
       * 设置加载状态
       * @param loading 是否加载中
       */
      setLoading: (loading) => set({ loading }),

      /**
       * 设置错误信息
       * @param error 错误信息，null 表示清除错误
       */
      setError: (error) => set({ error }),

      /**
       * 设置标书列表
       * @param proposals 标书数组
       */
      setProposals: (proposals) => set({ proposals }),

      /**
       * 设置统计数据
       * @param statistics 统计数据
       */
      setStatistics: (statistics) => set({ statistics }),

      /**
       * 添加新标书
       * <todo priority="low">
       * TODO(zhangsan, 2025-12-15): [P2] 添加位置逻辑
       * 应该添加到顶部（最新）还是根据 sortBy 决定？
       * </todo>
       * @param proposal 新标书对象
       */
      addProposal: (proposal) =>
        set((state) => ({
          proposals: [proposal, ...state.proposals]
        })),

      /**
       * 更新标书
       * <hack reason="version-check">
       * HACK: 当前未检查版本号，可能导致并发更新丢失
       * TODO: 添加版本校验逻辑
       * </hack>
       * @param id 标书ID
       * @param updatedProposal 更新数据
       */
      updateProposal: (id, updatedProposal) =>
        set((state) => ({
          proposals: state.proposals.map((p) =>
            p.id === id ? { ...p, ...updatedProposal } : p
          ),
        })),

      /**
       * 删除标书
       * @param id 标书ID
       */
      removeProposal: (id) =>
        set((state) => ({
          proposals: state.proposals.filter((p) => p.id !== id),
        })),

      /**
       * 设置分页信息
       * @param page 当前页
       * @param pageSize 每页数量
       * @param total 总记录数
       * @param totalPages 总页数
       */
      setPagination: (page, pageSize, total, totalPages) =>
        set({ currentPage: page, pageSize, total, totalPages }),

      /**
       * 设置筛选条件
       * @param filters 筛选参数
       */
      setFilters: (filters) =>
        set((state) => ({
          statusFilter: filters.status ?? state.statusFilter,
          sortBy: filters.sortBy ?? state.sortBy,
          sortOrder: filters.sortOrder ?? state.sortOrder,
        })),

      /**
       * 重置所有状态
       * 用于用户登出或清理缓存
       */
      reset: () =>
        set({
          proposals: [],
          statistics: null,
          loading: false,
          error: null,
          currentPage: 1,
          pageSize: 20,
          total: 0,
          totalPages: 0,
          statusFilter: '',
          sortBy: 'updatedAt',
          sortOrder: 'desc',
        }),
    }),
    { name: 'proposal-store' }  // Redux DevTools 中的 store 名称
  )
);
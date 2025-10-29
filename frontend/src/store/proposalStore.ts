// Zustand Store - 标书管理状态
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ProposalCard, StatisticsResponse } from '@/types';

interface ProposalStore {
  // 状态
  proposals: ProposalCard[];
  statistics: StatisticsResponse | null;
  loading: boolean;
  error: string | null;

  // 分页信息
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;

  // 筛选条件
  statusFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';

  // Actions
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

export const useProposalStore = create<ProposalStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
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

      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setProposals: (proposals) => set({ proposals }),
      setStatistics: (statistics) => set({ statistics }),
      addProposal: (proposal) =>
        set((state) => ({
          proposals: [proposal, ...state.proposals]
        })),
      updateProposal: (id, updatedProposal) =>
        set((state) => ({
          proposals: state.proposals.map((p) =>
            p.id === id ? { ...p, ...updatedProposal } : p
          ),
        })),
      removeProposal: (id) =>
        set((state) => ({
          proposals: state.proposals.filter((p) => p.id !== id),
        })),
      setPagination: (page, pageSize, total, totalPages) =>
        set({ currentPage: page, pageSize, total, totalPages }),
      setFilters: (filters) =>
        set((state) => ({
          statusFilter: filters.status ?? state.statusFilter,
          sortBy: filters.sortBy ?? state.sortBy,
          sortOrder: filters.sortOrder ?? state.sortOrder,
        })),
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
    { name: 'proposal-store' }
  )
);
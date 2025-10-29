// 数据获取Hook
import { useState, useEffect } from 'react';
import { useProposalStore } from '@/store/proposalStore';
import { proposalService } from '@/services/proposal';
import type { ProposalCard } from '@/types';

export const useProposals = () => {
  const {
    proposals,
    statistics,
    loading,
    error,
    currentPage,
    pageSize,
    total,
    totalPages,
    statusFilter,
    sortBy,
    sortOrder,
    setLoading,
    setError,
    setProposals,
    setStatistics,
    setPagination,
    setFilters,
  } = useProposalStore();

  // 获取标书列表
  const fetchProposals = async (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    sortBy?: string;
    order?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await proposalService.getProposals({
        page: params?.page || currentPage,
        pageSize: params?.pageSize || pageSize,
        status: params?.status || statusFilter,
        sortBy: params?.sortBy || sortBy,
        order: params?.order || sortOrder,
      });

      setProposals(response.data.items);
      setPagination(
        response.data.page,
        response.data.pageSize,
        response.data.total,
        response.data.totalPages
      );
    } catch (error) {
      setError('获取标书列表失败');
      console.error('Failed to fetch proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取统计信息
  const fetchStatistics = async () => {
    try {
      const response = await proposalService.getStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  // 删除标书
  const deleteProposal = async (id: string) => {
    try {
      await proposalService.deleteProposal(id);
      // 重新获取列表
      await fetchProposals();
      // 重新获取统计
      await fetchStatistics();
    } catch (error) {
      console.error('Failed to delete proposal:', error);
      throw error;
    }
  };

  // 处理页码变化
  const handlePageChange = (page: number, size?: number) => {
    fetchProposals({
      page,
      pageSize: size || pageSize,
    });
  };

  // 处理筛选变化
  const handleFilterChange = (filters: {
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    setFilters(filters);
    fetchProposals({
      ...filters,
      page: 1, // 重置到第一页
    });
  };

  // 初始加载
  useEffect(() => {
    fetchProposals();
    fetchStatistics();
  }, []);

  return {
    // 数据
    proposals,
    statistics,
    loading,
    error,
    currentPage,
    pageSize,
    total,
    totalPages,

    // 方法
    fetchProposals,
    fetchStatistics,
    deleteProposal,
    handlePageChange,
    handleFilterChange,
  };
};
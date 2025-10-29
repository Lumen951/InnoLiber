// 标书相关API服务
import { apiService } from './api';
import type { ProposalCard, ProposalListResponse, StatisticsResponse } from '@/types';

export class ProposalService {
  // 获取标书列表
  async getProposals(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    sortBy?: string;
    order?: string;
  }): Promise<ProposalListResponse> {
    return apiService.get('/proposals', params);
  }

  // 获取标书详情
  async getProposal(id: string): Promise<ProposalCard> {
    return apiService.get(`/proposals/${id}`);
  }

  // 创建标书
  async createProposal(data: {
    title: string;
    researchField: string;
    fundingProgram?: string;
    initialIdea?: Record<string, any>;
  }): Promise<ProposalCard> {
    return apiService.post('/proposals', data);
  }

  // 更新标书
  async updateProposal(id: string, data: Partial<ProposalCard>): Promise<ProposalCard> {
    return apiService.put(`/proposals/${id}`, data);
  }

  // 删除标书
  async deleteProposal(id: string): Promise<void> {
    return apiService.delete(`/proposals/${id}`);
  }

  // 获取统计信息
  async getStatistics(): Promise<StatisticsResponse> {
    return apiService.get('/proposals/statistics');
  }
}

export const proposalService = new ProposalService();
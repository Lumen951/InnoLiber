// 类型定义

export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  role: 'ecr' | 'admin';
  createdAt: string;
}

export interface Proposal {
  id: string;
  title: string;
  researchField: string;
  status: 'draft' | 'reviewing' | 'completed' | 'submitted';
  version: number;
  qualityScore?: number;
  complianceScore?: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export interface ProposalCard extends Proposal {
  wordCount?: number;
  // 质量细分评分
  contentScore?: number;
  formatScore?: number;
  innovationScore?: number;
}

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

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API服务响应
export interface ProposalListResponse extends PaginatedResponse<ProposalCard> {}

export interface StatisticsResponse {
  totalProposals: number;
  draftCount: number;
  reviewingCount: number;
  completedCount: number;
}
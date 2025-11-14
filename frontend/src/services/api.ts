/**
 * @file api.ts
 * @description API 服务层 - Axios 配置和拦截器
 *
 * <copyright>
 * Copyright (c) 2024-2025 InnoLiber Team
 * Licensed under the MIT License
 * </copyright>
 *
 * @author InnoLiber Team
 * @version 1.0.0
 */

import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { ApiResponse, ApiError } from '@/types';

/**
 * API 服务类
 *
 * <rationale>
 * 设计决策：
 * - 使用 Axios: 功能完善（拦截器、取消、并发控制），社区活跃
 * - 拦截器处理认证: 统一添加 Authorization header，避免重复代码
 * - 统一错误处理: 401 自动跳转登录，其他错误转换为 ApiError 格式
 * </rationale>
 *
 * <warning type="security">
 * ⚠️ 安全风险：
 * - localStorage 存储 token: XSS 攻击可读取，非 HttpOnly
 *   临时方案：当前使用 localStorage（快速开发）
 *   永久方案（Phase 2）：迁移到 HttpOnly Cookie + CSRF Token
 * - 静态跳转: window.location.href 会刷新页面
 *   改进：使用 React Router 的 navigate() 实现无刷新跳转
 * </warning>
 *
 * <todo priority="high">
 * TODO(frontend-team, 2025-11-25): [P0] 安全改进
 * Issue: #789
 * 1) 迁移到 HttpOnly Cookie + CSRF Token
 * 2) 实现无刷新 401 跳转
 * 3) 添加请求/响应数据压缩
 * </todo>
 *
 * <hack reason="token-storage">
 * HACK: 使用 localStorage 暂存 JWT token
 * 存在 XSS 风险，但开发速度快
 * 生产环境需使用 HttpOnly Cookie
 * </hack>
 */
class ApiService {
  private client: AxiosInstance;

  constructor() {
    /**
     * <design-decision>
     * Axios 配置说明：
     * - baseURL: 从环境变量读取，支持多环境部署
     * - timeout: 30秒，考虑 DeepSeek API 响应时间
     * - JSON header: 统一使用 application/json
     * </design-decision>
     */
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors() {
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  /**
   * 请求拦截器
   *
   * <rationale>
   * 自动添加 JWT token：
   * - 统一处理，避免每个请求都手动添加
     * - 遗免身份验证错误
   * </rationale>
   */
  private setupRequestInterceptor() {
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * 响应拦截器
   *
   * <rationale>
   * 统一处理：
   * - 401 未授权：自动跳转登录页
   * - 网络错误：转换为 ApiError 格式
   * - 服务器错误：保留原始错误信息
   * </rationale>
   */
  private setupResponseInterceptor() {
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<any>>) => {
        return response;
      },
      (error) => {
        // 401 未授权处理
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }

        // 统一错误格式转换
        const apiError: ApiError = error.response?.data || {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: '网络连接失败，请稍后重试'
          },
          timestamp: new Date().toISOString()
        };

        return Promise.reject(apiError);
      }
    );
  }

  // ========== HTTP 方法封装 ==========

  /**
   * GET 请求
   * @param url 请求路径
   * @param params 查询参数
   * @returns Promise<T> 响应数据
   *
   * @example
   * ```ts
   * const proposals = await apiService.get<ProposalListResponse>('/proposals', {
   *   page: 1,
   *   pageSize: 20
   * });
   * ```
   */
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  /**
   * POST 请求
   * @param url 请求路径
   * @param data 请求体数据
   * @returns Promise<T> 响应数据
   *
   * @example
   * ```ts
   * const newProposal = await apiService.post<Proposal>('/proposals', {
   *   title: '我的研究',
   *   researchField: '人工智能'
   * });
   * ```
   */
  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  /**
   * PUT 请求
   * @param url 请求路径
   * @param data 请求数据
   * @returns Promise<T> 响应数据
   *
   * @example
   * ```ts
   * const updated = await apiService.put<Proposal>('/proposals/123', {
   *   title: '更新后的标题'
   * });
   * ```
   */
  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  /**
   * DELETE 请求
   * @param url 请求路径
   * @returns Promise<T> 响应数据
   *
   * @example
   * ```ts
   * await apiService.delete<void>('/proposals/123');
   * ```
   */
  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data;
  }

  /**
   * 文件上传（支持进度）
   *
   * <todo priority="medium">
   * TODO(frontend-team, 2025-12-10): [P1] 文件上传功能
   * - 支持进度回调
   * - 大文件分片上传
   * - 断点续传
   * </todo>
   * @param url 上传路径
   * @param formData 表单数据
   * @param onProgress 进度回调
   * @returns Promise<T> 上传结果
   */
  async upload<T>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> {
    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    });
    return response.data;
  }
}

/**
 * 全局 API 服务实例
 * <rationale>
 * 单例模式：
 * - 避免重复创建 Axios 实例
 * - 共享拦截器配置
 * - 统一错误处理逻辑
 * </rationale>
 *
 * @example
 * ```ts
 * // 在组件中使用
 * import { apiService } from '@/services/api';
 *
 * const loadProposals = async () => {
 *   const response = await apiService.get<ProposalListResponse>('/proposals');
 *   setProposals(response.data.items);
 * };
 * ```
 */
export const apiService = new ApiService();
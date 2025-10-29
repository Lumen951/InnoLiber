// API服务配置
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type { ApiResponse, ApiError } from '@/types';

class ApiService {
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

    // 响应拦截器
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<any>>) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token过期，跳转登录
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }

        // 统一错误处理
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

  // 通用GET请求
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  // 通用POST请求
  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  // 通用PUT请求
  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  // 通用DELETE请求
  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data;
  }
}

export const apiService = new ApiService();
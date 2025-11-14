/**
 * @file authStore.ts
 * @description 用户认证状态管理（Zustand）
 * 管理登录状态、用户信息、Token持久化
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import type { User } from '../types';

/**
 * 认证状态接口
 */
interface AuthState {
  // 状态
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // 操作方法
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

/**
 * 注册数据接口
 */
export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  researchField?: string;
}

/**
 * 登录响应接口
 */
interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

/**
 * 注册响应接口
 */
interface RegisterResponse {
  success: boolean;
  data: {
    user: User;
  };
  message?: string;
}

/**
 * 认证状态管理Store
 *
 * 功能：
 * - Token持久化（localStorage）
 * - 自动设置axios请求头
 * - 登录/注册/登出
 * - 用户信息管理
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      /**
       * 用户登录
       * @param email - 邮箱
       * @param password - 密码
       * @param remember - 是否记住我（7天免登录）
       */
      login: async (email: string, password: string, remember: boolean = false) => {
        set({ isLoading: true });

        try {
          const response = await axios.post<LoginResponse>('/api/auth/login', {
            email,
            password,
          });

          const { user, token } = response.data.data;

          // 设置axios默认请求头
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // 更新状态
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          // TODO-ALIYUN: [记住我功能] - 实现7天免登录
          // 当前实现：所有登录都会持久化到localStorage
          // 未来扩展：
          //   - remember=true: 使用localStorage + 7天token有效期
          //   - remember=false: 使用sessionStorage + 24小时token有效期
          // 依赖：后端JWT支持不同过期时间
          // 预计工作量：1小时
          // 优先级：P2
          if (remember) {
            console.log('[DEV] 记住我功能已启用，token将持久化7天（待实现）');
          }
        } catch (error: any) {
          set({ isLoading: false });
          const message = error.response?.data?.error?.message || '登录失败，请检查邮箱和密码';
          throw new Error(message);
        }
      },

      /**
       * 用户注册
       * @param data - 注册数据
       */
      register: async (data: RegisterData) => {
        set({ isLoading: true });

        try {
          const response = await axios.post<RegisterResponse>('/api/auth/register', data);

          const { user } = response.data.data;

          // 注册成功后自动登录
          // 注意：实际应用中可能需要邮箱验证后才能登录
          set({
            user,
            token: null, // 注册后不自动设置token，需要用户登录
            isAuthenticated: false,
            isLoading: false,
          });

          // TODO-ALIYUN: [注册成功处理] - 显示邮箱验证提示
          // 当前实现：注册成功，允许直接登录
          // 未来扩展：
          //   1. 显示"请查收验证邮件"提示
          //   2. 跳转到邮箱验证引导页
          //   3. 提供"重发验证邮件"功能
          // 依赖：阿里云DirectMail集成
          // 预计工作量：0.5小时
          // 优先级：P1
          console.log('[DEV] 注册成功，用户可直接登录（MVP宽松策略）');
        } catch (error: any) {
          set({ isLoading: false });
          const message = error.response?.data?.error?.message || '注册失败，请稍后重试';
          throw new Error(message);
        }
      },

      /**
       * 用户登出
       */
      logout: () => {
        // 清除axios请求头
        delete axios.defaults.headers.common['Authorization'];

        // 清除状态
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      /**
       * 检查认证状态
       * 用于应用启动时验证token是否有效
       */
      checkAuth: async () => {
        const { token } = get();

        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        try {
          // 设置请求头
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // 验证token并获取用户信息
          const response = await axios.get<LoginResponse>('/api/auth/me');
          const { user } = response.data.data;

          set({
            user,
            isAuthenticated: true,
          });
        } catch (error) {
          // Token无效或过期，清除状态
          console.error('Token验证失败:', error);
          get().logout();
        }
      },

      /**
       * 更新用户信息
       * @param user - 新的用户信息
       */
      updateUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        // 只持久化这些字段
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * 初始化认证状态
 * 应用启动时调用，验证localStorage中的token
 */
export const initAuth = async () => {
  const authStore = useAuthStore.getState();
  if (authStore.token) {
    await authStore.checkAuth();
  }
};

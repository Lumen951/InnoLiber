# Zustand 状态管理深入

> **适合人群**：了解 React Hooks 的前端开发者
>
> **学习时长**：约 45-55 分钟
>
> **先修知识**：React Hooks（useState、useEffect）、TypeScript 基础、Context API 概念

---

## 📌 什么是 Zustand？

**一句话解释**：Zustand 是一个轻量级、快速的 React 状态管理库，基于 Hooks API，无需样板代码，支持 TypeScript。

**名字含义**：Zustand 在德语中是"状态"的意思。

### 为什么选择 Zustand？

**问题场景**：你要开发一个多页面应用，需要在不同组件间共享用户登录状态、标书列表数据。

**使用 Context API（传统方式）**：
```tsx
// ❌ 样板代码多、性能问题、难以调试
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email, password) => {
    // 登录逻辑...
    setUser(userData);
    setToken(tokenData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 使用时需要自定义 Hook
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

// 问题：
// ❌ 需要包裹 Provider，增加组件层级
// ❌ Context 变化会导致所有消费者重渲染
// ❌ 无法在 React 组件外使用（如 axios 拦截器）
// ❌ 难以持久化状态到 localStorage
```

**使用 Zustand（现代方式）**：
```tsx
// ✅ 简洁、高性能、易调试
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        const response = await api.login(email, password);
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
        });
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }  // 自动持久化
  )
);

// 使用：无需 Provider！
function Header() {
  const user = useAuthStore(state => state.user);  // 选择性订阅
  const logout = useAuthStore(state => state.logout);

  return <button onClick={logout}>Logout {user?.name}</button>;
}

// 优势：
// ✅ 无需 Provider，减少组件层级
// ✅ 选择性订阅，避免不必要的重渲染
// ✅ 可在 React 外使用（axios 拦截器、WebSocket）
// ✅ 内置持久化中间件
// ✅ Redux DevTools 支持
```

### 在 InnoLiber 项目中的应用

在我们的项目中，Zustand 负责：
- ✅ **用户认证**：登录状态、Token 持久化（authStore）
- ✅ **标书管理**：列表数据、分页、筛选状态（proposalStore）
- ✅ **跨组件通信**：无需 prop drilling，直接访问全局状态
- ✅ **持久化**：自动保存到 localStorage，刷新页面状态不丢失

**项目文件位置**：
- 认证状态：`frontend/src/store/authStore.ts`
- 标书状态：`frontend/src/store/proposalStore.ts`
- Hook 封装：`frontend/src/hooks/useProposals.ts`

---

## 🔑 核心概念（用日常语言理解）

### 1. create() - Store 工厂 = 状态仓库

**类比**：`create()` 就像建一个仓库，存放你的应用状态和操作方法。

**基础用法**：
```tsx
import { create } from 'zustand';

/**
 * 最简单的 Zustand Store
 * 🔑 状态 + 操作方法都在一起
 */
interface BearState {
  bears: number;           // 状态
  increase: () => void;    // 操作方法
  decrease: () => void;
}

const useBearStore = create<BearState>((set) => ({
  // 初始状态
  bears: 0,

  // 操作方法
  increase: () => set((state) => ({ bears: state.bears + 1 })),
  decrease: () => set((state) => ({ bears: state.bears - 1 })),
}));

// 在组件中使用
function BearCounter() {
  const bears = useBearStore(state => state.bears);        // 订阅 bears
  const increase = useBearStore(state => state.increase);  // 订阅 increase

  return (
    <div>
      <h1>熊的数量：{bears}</h1>
      <button onClick={increase}>增加</button>
    </div>
  );
}
```

**关键点**：
- `create()` 接收一个函数，返回一个 Hook（`useBearStore`）
- 函数参数 `set` 用于更新状态
- 状态和方法都定义在同一个对象中

---

### 2. set() - 状态更新器 = 修改仓库内容

**类比**：`set()` 就像仓库管理员，负责修改仓库里的东西。

**两种用法**：

#### **直接传对象（部分更新）**
```tsx
set({ bears: 5 })  // 只更新 bears，其他字段不变
```

#### **传函数（基于旧状态更新）**
```tsx
set((state) => ({ bears: state.bears + 1 }))  // 读取旧值，计算新值
```

**项目实例**（来自 `frontend/src/store/authStore.ts:102-107`）：
```tsx
/**
 * 登录成功后更新状态
 * 🔑 一次性更新多个字段
 */
login: async (email: string, password: string) => {
  const response = await axios.post('/api/auth/login', { email, password });
  const { user, token } = response.data.data;

  // 设置 axios 默认请求头
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  // 🔑 使用 set() 更新多个状态
  set({
    user,              // 用户信息
    token,             // JWT Token
    isAuthenticated: true,  // 登录状态
    isLoading: false,  // 加载状态
  });
}
```

---

### 3. get() - 状态读取器 = 查看仓库内容

**类比**：`get()` 就像仓库管理员的查询功能，可以随时查看仓库里有什么。

**使用场景**：在 action 中需要读取当前状态时使用。

**项目实例**（来自 `frontend/src/store/authStore.ts:184-209`）：
```tsx
/**
 * 检查认证状态
 * 🔑 使用 get() 读取当前 token
 */
checkAuth: async () => {
  const { token } = get();  // 🔑 获取当前状态中的 token

  if (!token) {
    set({ isAuthenticated: false });
    return;
  }

  try {
    // 设置请求头
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // 验证 token 并获取用户信息
    const response = await axios.get('/api/auth/me');
    const { user } = response.data.data;

    set({
      user,
      isAuthenticated: true,
    });
  } catch (error) {
    // Token 无效或过期，清除状态
    console.error('Token验证失败:', error);
    get().logout();  // 🔑 调用自己的 logout 方法
  }
}
```

**get() vs 选择器**：
- `get()`：在 Store 定义内部使用，读取完整状态
- `useStore(state => state.xxx)`：在组件中使用，选择性订阅

---

### 4. 选择性订阅 = 只听关心的消息

**类比**：就像订阅报纸，你只订阅体育版，不订阅财经版，节省开销。

**问题场景**：
```tsx
// ❌ 错误：订阅整个 store
function Header() {
  const authStore = useAuthStore();  // 任何字段变化都会重渲染

  return <div>用户：{authStore.user?.name}</div>;
}

// 问题：isLoading 变化时，Header 也会重渲染，但它根本不关心 isLoading！
```

**正确用法**：
```tsx
// ✅ 正确：选择性订阅
function Header() {
  const user = useAuthStore(state => state.user);  // 只订阅 user

  return <div>用户：{user?.name}</div>;
}

// 现在只有 user 变化时才重渲染，isLoading 变化不影响
```

**性能对比**：
```tsx
// 场景：authStore 有 user、token、isAuthenticated、isLoading 4个字段

// ❌ 订阅整个 store：4个字段任意变化都重渲染
const authStore = useAuthStore();

// ✅ 选择性订阅：只有 user 变化才重渲染
const user = useAuthStore(state => state.user);

// ✅ 订阅多个字段（浅比较）
const { user, isAuthenticated } = useAuthStore(state => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
}));
```

---

### 5. persist 中间件 = 自动保存到本地

**类比**：就像浏览器的"记住密码"功能，下次打开自动填充。

**项目实例**（来自 `frontend/src/store/authStore.ts:72-229`）：

```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 认证状态管理 Store
 * 🔑 使用 persist 中间件自动持久化
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // ... 操作方法
      login: async (email, password) => { /* ... */ },
      logout: () => { /* ... */ },
    }),
    {
      name: 'auth-storage',  // 🔑 localStorage 的 key
      partialize: (state) => ({
        // 🔑 只持久化这些字段（不保存 isLoading）
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * 初始化认证状态
 * 应用启动时调用，验证 localStorage 中的 token
 */
export const initAuth = async () => {
  const authStore = useAuthStore.getState();
  if (authStore.token) {
    await authStore.checkAuth();  // 验证 token 是否有效
  }
};
```

**persist 配置选项**：

| 选项 | 说明 | 示例 |
|------|------|------|
| `name` | localStorage 键名（必需） | `'auth-storage'` |
| `storage` | 存储引擎 | `localStorage`（默认）、`sessionStorage` |
| `partialize` | 选择持久化的字段 | `(state) => ({ user: state.user })` |
| `version` | 状态版本号（用于迁移） | `1` |
| `migrate` | 版本迁移函数 | `(persisted, version) => { ... }` |

**工作流程**：
```
1. 用户登录成功
   ↓
2. set({ user, token, isAuthenticated: true })
   ↓
3. persist 中间件自动保存到 localStorage['auth-storage']
   ↓
4. 用户刷新页面
   ↓
5. persist 中间件自动从 localStorage 读取状态
   ↓
6. 调用 initAuth() 验证 token 是否有效
   ↓
7. 恢复登录状态（无需重新登录）
```

---

### 6. devtools 中间件 = Redux DevTools 调试

**类比**：就像给汽车装了行车记录仪，可以回放状态变化过程。

**项目实例**（来自 `frontend/src/store/proposalStore.ts:101-223`）：

```tsx
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * 标书状态管理 Store
 * 🔑 使用 devtools 中间件支持 Redux DevTools
 */
export const useProposalStore = create<ProposalStore>()(
  devtools(
    (set, get) => ({
      // 状态
      proposals: [],
      statistics: null,
      loading: false,
      error: null,
      currentPage: 1,
      pageSize: 20,

      // Actions
      setLoading: (loading) => set({ loading }),
      setProposals: (proposals) => set({ proposals }),
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
    }),
    { name: 'proposal-store' }  // 🔑 DevTools 中显示的 store 名称
  )
);
```

**使用 Redux DevTools 调试**：
1. 安装浏览器扩展：Redux DevTools Extension
2. 打开浏览器开发者工具
3. 切换到"Redux"标签
4. 选择"proposal-store"
5. 查看状态历史、时间旅行调试

**DevTools 功能**：
- ✅ **状态历史**：查看每次 `set()` 调用的前后状态
- ✅ **时间旅行**：回退到任意历史状态
- ✅ **导出/导入**：导出状态快照用于测试
- ✅ **Action 追踪**：查看哪个方法触发了状态变化

---

## 💻 项目中的实际应用

### 示例 1：用户认证 Store（完整实现）

**文件位置**：`frontend/src/store/authStore.ts`（核心实现解析）

```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import type { User } from '../types';

/**
 * 认证状态接口
 * 🔑 状态字段 + 操作方法统一定义
 */
interface AuthState {
  // ========== 状态字段 ==========
  user: User | null;             // 用户信息
  token: string | null;          // JWT Token
  isAuthenticated: boolean;      // 登录状态
  isLoading: boolean;            // 加载状态

  // ========== 操作方法 ==========
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
 * 认证状态管理 Store
 *
 * 功能：
 * - Token 持久化（localStorage）
 * - 自动设置 axios 请求头
 * - 登录/注册/登出
 * - 用户信息管理
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ========== 初始状态 ==========
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
        set({ isLoading: true });  // 设置加载状态

        try {
          // 🔑 调用登录 API
          const response = await axios.post<LoginResponse>('/api/auth/login', {
            email,
            password,
          });

          const { user, token } = response.data.data;

          // 🔑 设置 axios 默认请求头（全局生效）
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // 🔑 更新状态（一次性更新多个字段）
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          // TODO: 记住我功能（7天免登录）
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

          // 注册成功后不自动登录，需要用户手动登录
          set({
            user,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });

          console.log('[DEV] 注册成功，用户可直接登录（MVP宽松策略）');
        } catch (error: any) {
          set({ isLoading: false });
          const message = error.response?.data?.error?.message || '注册失败，请稍后重试';
          throw new Error(message);
        }
      },

      /**
       * 用户登出
       * 🔑 清除状态 + 清除 axios 请求头
       */
      logout: () => {
        // 清除 axios 请求头
        delete axios.defaults.headers.common['Authorization'];

        // 清除状态（persist 会自动清除 localStorage）
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      /**
       * 检查认证状态
       * 用于应用启动时验证 token 是否有效
       * 🔑 使用 get() 读取当前状态
       */
      checkAuth: async () => {
        const { token } = get();  // 读取当前 token

        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        try {
          // 设置请求头
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // 验证 token 并获取用户信息
          const response = await axios.get<LoginResponse>('/api/auth/me');
          const { user } = response.data.data;

          set({
            user,
            isAuthenticated: true,
          });
        } catch (error) {
          // Token 无效或过期，清除状态
          console.error('Token验证失败:', error);
          get().logout();  // 调用自己的 logout 方法
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
      name: 'auth-storage',  // 🔑 localStorage 键名
      partialize: (state) => ({
        // 🔑 只持久化这些字段
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        // 不持久化 isLoading（每次加载时重置）
      }),
    }
  )
);

/**
 * 初始化认证状态
 * 应用启动时调用，验证 localStorage 中的 token
 *
 * 使用方式（在 App.tsx 中）：
 * useEffect(() => {
 *   initAuth();
 * }, []);
 */
export const initAuth = async () => {
  const authStore = useAuthStore.getState();
  if (authStore.token) {
    await authStore.checkAuth();
  }
};
```

**设计亮点分析**：
- ✅ **类型安全**：完整的 TypeScript 接口定义
- ✅ **持久化**：自动保存到 localStorage，刷新页面不丢失
- ✅ **axios 集成**：自动设置请求头，全局生效
- ✅ **错误处理**：捕获异常，统一错误信息格式
- ✅ **Token 验证**：应用启动时自动验证 token 有效性

---

### 示例 2：标书管理 Store（完整实现）

**文件位置**：`frontend/src/store/proposalStore.ts`（核心实现解析）

```tsx
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ProposalCard, StatisticsResponse } from '@/types';

/**
 * 标书状态管理接口
 *
 * 设计决策：
 * - 使用 Zustand 而非 Redux：更简洁的 API，更好的 TypeScript 支持
 * - devtools 中间件：开发环境支持 Redux DevTools，便于状态调试
 * - 状态扁平化：避免嵌套状态，提高更新性能
 */
interface ProposalStore {
  // ========== 数据状态 ==========
  proposals: ProposalCard[];            // 标书列表
  statistics: StatisticsResponse | null;  // 统计数据
  loading: boolean;                     // 加载状态
  error: string | null;                 // 错误信息

  // ========== 分页状态 ==========
  currentPage: number;    // 当前页码
  pageSize: number;       // 每页数量
  total: number;          // 总记录数
  totalPages: number;     // 总页数

  // ========== 筛选状态 ==========
  statusFilter: string;       // 状态筛选
  sortBy: string;             // 排序字段
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
 * Action 实现说明：
 * - setLoading/setError：简单状态更新，直接使用 set
 * - addProposal：使用函数式更新，新标书添加到数组开头
 * - updateProposal：使用函数式更新 + map 查找，不改变引用
 * - setFilters：使用 ?? 运算符保持未修改的字段值
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
       * 🔑 使用函数式更新，新标书添加到数组开头
       * @param proposal 新标书对象
       */
      addProposal: (proposal) =>
        set((state) => ({
          proposals: [proposal, ...state.proposals]  // 添加到开头
        })),

      /**
       * 更新标书
       * 🔑 使用 map 遍历查找，返回新数组
       * @param id 标书ID
       * @param updatedProposal 更新数据
       */
      updateProposal: (id, updatedProposal) =>
        set((state) => ({
          proposals: state.proposals.map((p) =>
            p.id === id ? { ...p, ...updatedProposal } : p  // 合并对象
          ),
        })),

      /**
       * 删除标书
       * 🔑 使用 filter 过滤掉指定 ID
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
       * 🔑 使用 ?? 运算符保持未修改的字段值
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
    { name: 'proposal-store' }  // 🔑 Redux DevTools 中的 store 名称
  )
);
```

**设计亮点分析**：
- ✅ **状态扁平化**：避免嵌套对象，提高更新性能
- ✅ **函数式更新**：使用 `set((state) => ...)` 基于旧状态计算新状态
- ✅ **不可变更新**：使用扩展运算符（...）保持不可变性
- ✅ **Redux DevTools**：开发环境可视化状态变化

---

### 示例 3：Custom Hook 封装（最佳实践）

**文件位置**：`frontend/src/hooks/useProposals.ts`（Hook 封装模式）

```tsx
import { useState, useEffect } from 'react';
import { useProposalStore } from '@/store/proposalStore';
import { proposalService } from '@/services/proposal';
import type { ProposalCard } from '@/types';

/**
 * 标书数据获取 Hook
 *
 * 设计模式：
 * - 将 Store + API 调用封装为一个 Hook
 * - 组件只需调用 Hook，无需关心数据获取细节
 * - 自动处理加载状态、错误处理、数据同步
 *
 * @returns 标书数据和操作方法
 */
export const useProposals = () => {
  // ========== 从 Store 获取状态和方法 ==========
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

  /**
   * 获取标书列表
   * 🔑 封装 API 调用 + Store 更新
   */
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

      // 🔑 调用 API 服务
      const response = await proposalService.getProposals({
        page: params?.page || currentPage,
        pageSize: params?.pageSize || pageSize,
        status: params?.status || statusFilter,
        sortBy: params?.sortBy || sortBy,
        order: params?.order || sortOrder,
      });

      // 🔑 更新 Store 状态
      setProposals(response.items);
      setPagination(
        response.page,
        response.pageSize,
        response.total,
        response.totalPages
      );
    } catch (error) {
      setError('获取标书列表失败');
      console.error('Failed to fetch proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取统计信息
   */
  const fetchStatistics = async () => {
    try {
      const response = await proposalService.getStatistics();
      setStatistics(response);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  /**
   * 删除标书
   * 🔑 删除后重新获取列表和统计
   */
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

  /**
   * 处理页码变化
   */
  const handlePageChange = (page: number, size?: number) => {
    fetchProposals({
      page,
      pageSize: size || pageSize,
    });
  };

  /**
   * 处理筛选变化
   */
  const handleFilterChange = (filters: {
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    setFilters(filters);
    fetchProposals({
      ...filters,
      page: 1,  // 🔑 筛选时重置到第一页
    });
  };

  /**
   * 初始加载
   * 🔑 组件挂载时自动获取数据
   */
  useEffect(() => {
    fetchProposals();
    fetchStatistics();
  }, []);  // 空依赖数组：只执行一次

  // ========== 返回数据和方法 ==========
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
```

**使用示例**（在 Dashboard 组件中）：
```tsx
import { useProposals } from '@/hooks/useProposals';

function Dashboard() {
  // 🔑 一行代码获取所有数据和方法
  const {
    proposals,
    statistics,
    loading,
    error,
    deleteProposal,
    handlePageChange,
    handleFilterChange,
  } = useProposals();

  return (
    <div>
      {loading ? (
        <Spin />
      ) : (
        <Row gutter={[16, 16]}>
          {proposals.map((proposal) => (
            <Col key={proposal.id} xs={24} lg={12}>
              <ProposalCard
                proposal={proposal}
                onDelete={deleteProposal}
              />
            </Col>
          ))}
        </Row>
      )}
      <Pagination
        current={currentPage}
        total={total}
        onChange={handlePageChange}
      />
    </div>
  );
}
```

**封装优势**：
- ✅ **关注点分离**：组件只关心 UI，Hook 负责数据逻辑
- ✅ **代码复用**：多个组件可共享同一个 Hook
- ✅ **易于测试**：可以单独测试 Hook 逻辑
- ✅ **类型安全**：完整的 TypeScript 支持

---

## 🎯 快速上手指南

### Step 1：安装 Zustand

```bash
cd frontend
npm install zustand
```

---

### Step 2：创建第一个 Store

```tsx
// stores/counterStore.ts
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

---

### Step 3：在组件中使用

```tsx
import { useCounterStore } from '@/stores/counterStore';

function Counter() {
  // 选择性订阅
  const count = useCounterStore(state => state.count);
  const increment = useCounterStore(state => state.increment);
  const decrement = useCounterStore(state => state.decrement);
  const reset = useCounterStore(state => state.reset);

  return (
    <div>
      <h1>计数：{count}</h1>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
      <button onClick={reset}>重置</button>
    </div>
  );
}
```

---

### Step 4：添加持久化

```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCounterStore = create<CounterState>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
    }),
    {
      name: 'counter-storage',  // localStorage 键名
    }
  )
);
```

---

### Step 5：添加 DevTools

```tsx
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useCounterStore = create<CounterState>()(
  devtools(
    persist(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
        decrement: () => set((state) => ({ count: state.count - 1 })),
        reset: () => set({ count: 0 }),
      }),
      { name: 'counter-storage' }
    ),
    { name: 'CounterStore' }  // DevTools 中显示的名称
  )
);
```

---

## ⚠️ 常见陷阱（新手必看）

### 陷阱 1：忘记选择性订阅导致性能问题

```tsx
// ❌ 错误：订阅整个 store
function Header() {
  const authStore = useAuthStore();  // 任何字段变化都会重渲染

  return <div>用户：{authStore.user?.name}</div>;
}

// 问题：isLoading、token 变化时也会重渲染，浪费性能

// ✅ 正确：选择性订阅
function Header() {
  const user = useAuthStore(state => state.user);  // 只订阅 user

  return <div>用户：{user?.name}</div>;
}
```

---

### 陷阱 2：在 set() 中直接修改状态

```tsx
// ❌ 错误：直接修改状态（违反不可变性）
addProposal: (proposal) =>
  set((state) => {
    state.proposals.push(proposal);  // ❌ 直接修改数组
    return state;  // 返回修改后的状态
  })

// 问题：React 无法检测到状态变化，不会重渲染

// ✅ 正确：创建新数组
addProposal: (proposal) =>
  set((state) => ({
    proposals: [proposal, ...state.proposals]  // ✅ 创建新数组
  }))
```

---

### 陷阱 3：TypeScript 类型推断错误

```tsx
// ❌ 错误：未指定泛型类型
const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
// TypeScript 无法推断正确类型

// ✅ 正确：使用接口定义类型
interface CounterState {
  count: number;
  increment: () => void;
}

const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// ✅ 或者使用双括号语法（支持中间件）
const useCounterStore = create<CounterState>()(
  persist(
    (set) => ({ /* ... */ }),
    { name: 'counter' }
  )
);
```

---

### 陷阱 4：在 Store 外部调用 set()

```tsx
// ❌ 错误：在组件中尝试调用 set()
function MyComponent() {
  const { set } = useCounterStore();  // ❌ Store 没有导出 set

  const handleClick = () => {
    set({ count: 10 });  // ❌ 报错
  };
}

// ✅ 正确：在 Store 内部定义 action
const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  setCount: (count: number) => set({ count }),  // ✅ 定义 action
}));

// 组件中调用 action
function MyComponent() {
  const setCount = useCounterStore(state => state.setCount);

  const handleClick = () => {
    setCount(10);  // ✅ 正确
  };
}
```

---

### 陷阱 5：persist 中间件顺序错误

```tsx
// ❌ 错误：persist 在 devtools 外层
const useStore = create<State>()(
  persist(
    devtools((set) => ({ /* ... */ })),
    { name: 'my-store' }
  )
);
// 问题：devtools 无法正常工作

// ✅ 正确：devtools 在最外层
const useStore = create<State>()(
  devtools(
    persist(
      (set) => ({ /* ... */ }),
      { name: 'my-store' }
    ),
    { name: 'MyStore' }
  )
);
```

**中间件顺序规则**：
```
devtools(        ← 最外层（调试）
  persist(       ← 中间层（持久化）
    immer(       ← 内层（不可变更新）
      (set) => ({ ... })  ← 核心 Store
    )
  )
)
```

---

### 陷阱 6：忘记清理订阅

```tsx
// ❌ 错误：在 useEffect 中订阅但没有清理
useEffect(() => {
  useAuthStore.subscribe((state) => {
    console.log('State changed:', state);
  });
}, []);
// 问题：组件卸载后订阅仍然存在，导致内存泄漏

// ✅ 正确：返回清理函数
useEffect(() => {
  const unsubscribe = useAuthStore.subscribe((state) => {
    console.log('State changed:', state);
  });

  return () => {
    unsubscribe();  // 组件卸载时清理订阅
  };
}, []);
```

---

## 📚 学习资源

### 官方资源
- **Zustand 官方文档**：https://github.com/pmndrs/zustand
- **Context7 查询结果**：`/pmndrs/zustand` (已查询)
- **Zustand 示例**：https://github.com/pmndrs/zustand/tree/main/examples

### 项目中的参考文件
- **认证 Store**：`frontend/src/store/authStore.ts` - 完整的持久化 Store
- **标书 Store**：`frontend/src/store/proposalStore.ts` - DevTools 集成
- **Hook 封装**：`frontend/src/hooks/useProposals.ts` - 最佳实践模式
- **类型定义**：`frontend/src/types/index.ts` - Store 接口定义

### 进阶学习主题
- **Immer 中间件**：简化嵌套状态更新
- **Computed Values**：计算派生状态
- **Slices 模式**：大型 Store 拆分
- **Testing**：Zustand Store 单元测试

---

## 🎯 实践练习建议

### 练习 1：创建 Theme Store
管理应用主题（亮色/暗色），支持持久化：
```tsx
interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}
```

### 练习 2：创建 Notification Store
管理全局通知消息，支持自动清除：
```tsx
interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}
```

### 练习 3：封装 useTheme Hook
将 Theme Store 封装为 Hook，提供更友好的 API。

---

## ✅ 学习检查清单

完成以下任务，说明你已经掌握 Zustand 状态管理：

- [ ] **理解 Zustand 优势**：能解释为什么选择 Zustand 而非 Redux
- [ ] **掌握 create() 用法**：能创建基本的 Store
- [ ] **理解 set() 和 get()**：知道如何更新和读取状态
- [ ] **会选择性订阅**：避免不必要的重渲染
- [ ] **使用 persist 中间件**：实现状态持久化
- [ ] **使用 devtools 中间件**：集成 Redux DevTools 调试
- [ ] **封装 Custom Hook**：将 Store + API 封装为 Hook
- [ ] **理解不可变更新**：正确更新数组和对象
- [ ] **避免常见陷阱**：订阅整个 Store、直接修改状态等
- [ ] **读懂项目代码**：理解 authStore 和 proposalStore 的实现

---

## 🎓 下一步学习

完成本文档后，建议继续学习：

1. **路由管理**：`09_react_router_navigation.md` - React Router 导航
2. **容器化部署**：`10_docker_basics.md` - Docker 基础
3. **项目实战**：尝试创建一个新的 Store（如 notificationStore）

---

## 🚀 实际项目应用

**在 InnoLiber 项目中的使用场景**：

1. **用户认证**：登录状态、Token 管理、自动验证（authStore）
2. **标书管理**：列表数据、分页、筛选、CRUD 操作（proposalStore）
3. **跨组件通信**：无需 prop drilling，全局状态访问
4. **持久化**：刷新页面状态不丢失（persist 中间件）

**项目特色实现**：
- ✅ 完整的 TypeScript 类型定义
- ✅ persist 中间件实现自动持久化
- ✅ devtools 中间件支持调试
- ✅ Custom Hook 封装最佳实践
- ✅ axios 全局请求头集成

**常用模式速查**：
```tsx
// 创建 Store
const useStore = create<State>((set, get) => ({ /* ... */ }));

// 选择性订阅
const value = useStore(state => state.value);

// 函数式更新
set((state) => ({ count: state.count + 1 }));

// 持久化
persist((set) => ({ /* ... */ }), { name: 'storage-key' });

// DevTools
devtools((set) => ({ /* ... */ }), { name: 'StoreName' });

// 获取状态（非 React 组件）
const state = useStore.getState();

// 订阅变化（非 React 组件）
const unsubscribe = useStore.subscribe((state) => { /* ... */ });
```

---

**文档版本**：v1.0
**最后更新**：2025-11-15
**维护者**：InnoLiber Team
**参考来源**：Context7 - Zustand 官方文档

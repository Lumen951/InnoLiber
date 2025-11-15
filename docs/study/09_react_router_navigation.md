# React Router 路由导航详解

> **适合人群**：了解 React 基础的前端开发者
>
> **学习时长**：约 40-50 分钟
>
> **先修知识**：React Hooks、TypeScript 基础、组件化概念

---

## 📌 什么是 React Router？

**一句话解释**：React Router 是 React 的官方路由库，让你的单页应用（SPA）能够像多页应用一样，根据 URL 显示不同的内容。

### 为什么需要路由？

**问题场景**：你要开发一个多页面应用，需要实现登录页、首页、详情页等不同页面的切换。

**不使用路由（传统方式）**：
```jsx
// ❌ 手动管理页面状态，代码混乱
function App() {
  const [currentPage, setCurrentPage] = useState('home');

  if (currentPage === 'home') return <HomePage />;
  if (currentPage === 'login') return <LoginPage />;
  if (currentPage === 'dashboard') return <Dashboard />;

  // 问题：
  // ❌ 无法使用浏览器前进/后退按钮
  // ❌ 无法分享链接（URL不变）
  // ❌ 无法直接访问特定页面
  // ❌ 代码难以维护
}
```

**使用 React Router（现代方式）**：
```jsx
// ✅ 声明式路由，简洁清晰
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

// 优势：
// ✅ URL 和页面自动同步
// ✅ 浏览器历史记录自动管理
// ✅ 支持链接分享和书签
// ✅ 支持动态路由参数
```

### 在 InnoLiber 项目中的应用

在我们的项目中，React Router 负责：
- ✅ **页面路由**：登录、注册、首页、标书管理等页面切换
- ✅ **动态路由**：标书详情页（`/proposals/:id`）、编辑页（`/proposals/:id/edit`）
- ✅ **重定向**：未登录跳转到登录页、默认重定向到首页
- ✅ **404 处理**：未匹配路由显示 404 页面

**项目文件位置**：
- 路由配置：`frontend/src/App.tsx`
- 路由初始化：`frontend/src/main.tsx`

---

## 🔑 核心概念（用日常语言理解）

### 1. BrowserRouter = 路由的"大管家"

**类比**：BrowserRouter 就像房子的地址系统，管理所有房间（页面）的位置信息。

**项目实例**（来自 `frontend/src/main.tsx:36-46`）：

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';

/**
 * 🔑 BrowserRouter 初始化
 * 必须包裹整个应用，提供路由上下文
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider locale={zhCN}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

**关键点**：
- BrowserRouter 使用 HTML5 History API（`pushState`、`replaceState`）
- URL 形式：`http://example.com/dashboard`（干净的 URL，无 `#` 符号）
- 必须在应用的最顶层使用一次

---

### 2. Routes 和 Route = 路由规则表

**类比**：Routes 就像目录表，Route 是目录中的每一条记录。

**项目实例**（来自 `frontend/src/App.tsx:15-50`）：

```tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProposalCreatePage from './pages/ProposalCreatePage';

function App() {
  return (
    <Routes>
      {/* 🔑 默认重定向 */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 🔑 公开页面 - 无需登录 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 🔑 主要应用页面 */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* 🔑 标书管理页面 - 动态路由 */}
      <Route path="/proposals/new" element={<ProposalCreatePage />} />
      <Route
        path="/proposals/:id/edit"
        element={<div>标书编辑页面 - 开发中</div>}
      />
      <Route
        path="/proposals/:id"
        element={<div>标书详情页面 - 开发中</div>}
      />

      {/* 🔑 其他功能页面 */}
      <Route path="/analysis" element={<div>数据分析页面 - 开发中</div>} />
      <Route path="/library" element={<div>文献库页面 - 开发中</div>} />
      <Route path="/settings" element={<div>设置页面 - 开发中</div>} />

      {/* 🔑 404 处理 */}
      <Route path="*" element={<div>404 - 页面未找到</div>} />
    </Routes>
  );
}
```

**路由匹配规则**：
- **精确匹配**：`/dashboard` 只匹配 `/dashboard`
- **动态参数**：`/proposals/:id` 匹配 `/proposals/123`、`/proposals/abc`
- **通配符**：`*` 匹配所有未匹配的路径（404 页面）

---

### 3. Navigate = 声明式重定向

**类比**：Navigate 就像自动门，当你走到某个位置时，自动把你送到另一个位置。

**项目实例**（来自 `frontend/src/App.tsx:18`）：

```tsx
/**
 * 🔑 默认重定向到首页
 * replace 属性：替换历史记录而非添加
 */
<Route path="/" element={<Navigate to="/dashboard" replace />} />
```

**Navigate vs 编程式导航**：
- **Navigate 组件**：渲染时自动重定向（声明式）
- **useNavigate Hook**：在事件处理器中手动导航（命令式）

```tsx
// 声明式：路由匹配时自动执行
<Route path="/" element={<Navigate to="/dashboard" />} />

// 命令式：用户点击按钮时执行
const navigate = useNavigate();
<button onClick={() => navigate('/dashboard')}>去首页</button>
```

---

### 4. Link 和 NavLink = 页面跳转链接

**类比**：Link 就像超链接，点击后跳转到新页面，但不会刷新整个页面。

**基础用法**：

```tsx
import { Link, NavLink } from 'react-router-dom';

/**
 * 🔑 Link - 基础导航链接
 * 优势：客户端路由，不会刷新页面
 */
<Link to="/dashboard">返回首页</Link>

/**
 * 🔑 NavLink - 带激活状态的导航链接
 * 自动添加 active 类名，适合导航菜单
 */
<NavLink
  to="/dashboard"
  className={({ isActive }) => isActive ? 'active' : ''}
>
  首页
</NavLink>
```

**Link vs a 标签**：
- `<Link>`：客户端路由，无页面刷新，保持应用状态
- `<a>`：传统链接，会重新加载整个页面，丢失应用状态

---

### 5. useNavigate = 编程式导航

**类比**：useNavigate 就像遥控器，让你在代码中控制页面跳转。

**使用场景**：
- 表单提交后跳转
- 认证失败后重定向
- 多步骤流程的下一步

**项目实例**：

```tsx
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password, data.remember);
      // 🔑 登录成功后跳转到首页
      navigate('/dashboard');
    } catch (error) {
      message.error('登录失败');
    }
  };

  return (
    <Form onFinish={handleSubmit(onSubmit)}>
      {/* 表单内容 */}
    </Form>
  );
}
```

**常用导航方法**：

```tsx
const navigate = useNavigate();

// 跳转到指定路径
navigate('/dashboard');

// 跳转并传递状态
navigate('/dashboard', { state: { from: '/login' } });

// 替换当前历史记录（不能回退）
navigate('/dashboard', { replace: true });

// 后退（等同于浏览器返回按钮）
navigate(-1);

// 前进
navigate(1);
```

---

### 6. useParams = 获取路由参数

**类比**：useParams 就像快递单上的收件人信息，从 URL 中提取关键数据。

**动态路由示例**：

```tsx
import { useParams } from 'react-router-dom';

/**
 * 路由定义：/proposals/:id
 * URL 示例：/proposals/123
 */
function ProposalDetailPage() {
  const { id } = useParams();  // 🔑 提取路由参数

  // 使用参数获取数据
  useEffect(() => {
    fetchProposalById(id);
  }, [id]);

  return <div>标书详情：{id}</div>;
}
```

**多参数路由**：

```tsx
/**
 * 路由定义：/users/:userId/posts/:postId
 * URL 示例：/users/123/posts/456
 */
function PostDetail() {
  const { userId, postId } = useParams();

  return (
    <div>
      <p>用户 ID: {userId}</p>
      <p>文章 ID: {postId}</p>
    </div>
  );
}
```

---

### 7. useSearchParams = 管理 URL 查询参数

**类比**：useSearchParams 就像 URL 的"备注栏"，存储筛选条件、排序方式等临时状态。

**使用场景**：
- 搜索关键词：`/search?q=React`
- 分页状态：`/dashboard?page=2`
- 筛选条件：`/proposals?status=draft&sort=date`

**实际应用示例**：

```tsx
import { useSearchParams } from 'react-router-dom';

function ProposalList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // 🔑 读取查询参数
  const currentPage = parseInt(searchParams.get('page') || '1');
  const status = searchParams.get('status') || 'all';

  // 🔑 更新查询参数
  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString(), status });
  };

  const handleStatusFilter = (newStatus: string) => {
    setSearchParams({ page: '1', status: newStatus });
  };

  return (
    <div>
      <p>当前页码：{currentPage}</p>
      <p>筛选状态：{status}</p>
      <button onClick={() => handlePageChange(2)}>下一页</button>
      <button onClick={() => handleStatusFilter('draft')}>只看草稿</button>
    </div>
  );
}
```

---

### 8. useLocation = 获取当前路由信息

**类比**：useLocation 就像 GPS，告诉你当前在哪里。

**useLocation 返回的信息**：

```tsx
import { useLocation } from 'react-router-dom';

function MyComponent() {
  const location = useLocation();

  console.log(location);
  // {
  //   pathname: '/dashboard',       // 当前路径
  //   search: '?page=2',             // 查询字符串
  //   hash: '#section1',             // 哈希值
  //   state: { from: '/login' },     // 导航时传递的状态
  //   key: 'default'                 // 唯一标识
  // }
}
```

**实际应用场景**：

```tsx
/**
 * 场景1：记住用户来源，登录后返回原页面
 */
function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from || '/dashboard';

  const handleLoginSuccess = () => {
    navigate(from, { replace: true });  // 登录后回到来源页面
  };
}

/**
 * 场景2：根据当前路径高亮导航菜单
 */
function Sidebar() {
  const location = useLocation();

  return (
    <nav>
      <Link
        to="/dashboard"
        className={location.pathname === '/dashboard' ? 'active' : ''}
      >
        首页
      </Link>
    </nav>
  );
}
```

---

## 💻 项目中的实际应用

### 示例 1：完整的路由配置

**文件位置**：`frontend/src/App.tsx`（完整解析）

```tsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// 🔑 页面组件导入
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProposalCreatePage from './pages/ProposalCreatePage';
import { initAuth } from './store/authStore';

function App() {
  /**
   * 🔑 应用启动时初始化认证状态
   * 验证 localStorage 中的 token 是否有效
   */
  useEffect(() => {
    initAuth();
  }, []);

  return (
    <Routes>
      {/* ========== 默认路由 ========== */}
      {/*
        🔑 重定向根路径到首页
        replace: 替换历史记录，避免用户点击后退时回到 /
      */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* ========== 认证相关页面 ========== */}
      {/*
        🔑 公开访问页面
        无需登录即可访问
      */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ========== 主要应用页面 ========== */}
      {/*
        🔑 首页/仪表板
        显示用户的标书列表和统计信息
      */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* ========== 标书管理页面 ========== */}
      {/*
        🔑 新建标书页面
        静态路由
      */}
      <Route path="/proposals/new" element={<ProposalCreatePage />} />

      {/*
        🔑 标书编辑页面
        动态路由：:id 是路由参数
        URL 示例：/proposals/123/edit
      */}
      <Route
        path="/proposals/:id/edit"
        element={<div>标书编辑页面 - 开发中</div>}
      />

      {/*
        🔑 标书详情页面
        动态路由：:id 是路由参数
        URL 示例：/proposals/123
      */}
      <Route
        path="/proposals/:id"
        element={<div>标书详情页面 - 开发中</div>}
      />

      {/* ========== 其他功能页面 ========== */}
      {/*
        🔑 占位页面
        未来将实现完整功能
      */}
      <Route path="/analysis" element={<div>数据分析页面 - 开发中</div>} />
      <Route path="/library" element={<div>文献库页面 - 开发中</div>} />
      <Route path="/settings" element={<div>设置页面 - 开发中</div>} />

      {/* ========== 404 处理 ========== */}
      {/*
        🔑 Catch-all 路由
        path="*" 匹配所有未定义的路径
        必须放在最后
      */}
      <Route path="*" element={<div>404 - 页面未找到</div>} />
    </Routes>
  );
}

export default App;
```

**设计亮点分析**：
- ✅ **分层路由**：公开页面、主要页面、动态页面分类清晰
- ✅ **404 处理**：通配符路由放在最后，捕获所有未匹配路径
- ✅ **认证初始化**：应用启动时验证 token，确保登录状态正确
- ✅ **replace 重定向**：避免用户后退时回到中间页面

---

### 示例 2：编程式导航（登录后跳转）

**实际应用场景**：用户登录成功后跳转到首页

```tsx
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useAuthStore } from '@/store/authStore';

function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  /**
   * 🔑 表单提交处理
   * 登录成功后使用 navigate 跳转
   */
  const onSubmit = async (data: LoginFormData) => {
    try {
      // 调用登录 API
      await login(data.email, data.password, data.remember);

      // 显示成功提示
      message.success('登录成功！');

      // 🔑 跳转到首页
      navigate('/dashboard');
    } catch (error: any) {
      // 显示错误信息
      message.error(error.message || '登录失败');
    }
  };

  return (
    <Form onFinish={handleSubmit(onSubmit)}>
      {/* 邮箱输入 */}
      <Form.Item label="邮箱" name="email">
        <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
      </Form.Item>

      {/* 密码输入 */}
      <Form.Item label="密码" name="password">
        <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
      </Form.Item>

      {/* 提交按钮 */}
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading} block>
          登录
        </Button>
      </Form.Item>
    </Form>
  );
}
```

---

### 示例 3：动态路由参数（标书详情页）

**使用 useParams 提取路由参数**：

```tsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { proposalService } from '@/services/proposal';
import type { Proposal } from '@/types';

/**
 * 标书详情页
 * 路由：/proposals/:id
 * URL 示例：/proposals/123
 */
function ProposalDetailPage() {
  // 🔑 提取路由参数
  const { id } = useParams<{ id: string }>();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔑 根据 ID 获取标书数据
  useEffect(() => {
    const fetchProposal = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const data = await proposalService.getProposalById(id);
        setProposal(data);
      } catch (error) {
        message.error('获取标书详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [id]);  // 🔑 id 变化时重新获取

  if (loading) return <Spin />;
  if (!proposal) return <Empty description="标书不存在" />;

  return (
    <div>
      <h1>{proposal.title}</h1>
      <p>研究领域：{proposal.researchField}</p>
      <p>状态：{proposal.status}</p>
      {/* 其他内容 */}
    </div>
  );
}
```

---

### 示例 4：查询参数管理（分页和筛选）

**使用 useSearchParams 管理 URL 查询参数**：

```tsx
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

function ProposalList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { proposals, loading, fetchProposals } = useProposalStore();

  // 🔑 读取查询参数
  const page = parseInt(searchParams.get('page') || '1');
  const status = searchParams.get('status') || '';
  const sortBy = searchParams.get('sortBy') || 'updatedAt';

  // 🔑 参数变化时重新获取数据
  useEffect(() => {
    fetchProposals({ page, status, sortBy });
  }, [page, status, sortBy]);

  /**
   * 🔑 处理页码变化
   * 更新 URL 查询参数
   */
  const handlePageChange = (newPage: number) => {
    setSearchParams({
      page: newPage.toString(),
      status,
      sortBy,
    });
  };

  /**
   * 🔑 处理状态筛选
   * 重置到第一页
   */
  const handleStatusFilter = (newStatus: string) => {
    setSearchParams({
      page: '1',
      status: newStatus,
      sortBy,
    });
  };

  return (
    <div>
      {/* 筛选器 */}
      <Select value={status} onChange={handleStatusFilter}>
        <Select.Option value="">全部</Select.Option>
        <Select.Option value="draft">草稿</Select.Option>
        <Select.Option value="reviewing">审阅中</Select.Option>
        <Select.Option value="completed">已完成</Select.Option>
      </Select>

      {/* 列表 */}
      {loading ? <Spin /> : (
        <Row gutter={[16, 16]}>
          {proposals.map(proposal => (
            <Col key={proposal.id} xs={24} lg={12}>
              <ProposalCard proposal={proposal} />
            </Col>
          ))}
        </Row>
      )}

      {/* 分页 */}
      <Pagination
        current={page}
        total={100}
        onChange={handlePageChange}
      />
    </div>
  );
}
```

**查询参数的优势**：
- ✅ **URL 可分享**：复制链接后包含筛选条件
- ✅ **浏览器历史**：前进/后退按钮保留筛选状态
- ✅ **书签友好**：收藏后下次打开状态一致

---

### 示例 5：受保护的路由（需要登录才能访问）

**实现思路**：创建 ProtectedRoute 组件，检查登录状态

```tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/**
 * 🔑 受保护的路由组件
 * 未登录用户重定向到登录页
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // 正在检查认证状态
  if (isLoading) {
    return <Spin fullscreen />;
  }

  // 未登录，重定向到登录页
  if (!isAuthenticated) {
    // 🔑 记住当前位置，登录后返回
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 已登录，渲染子组件
  return <>{children}</>;
}

/**
 * 在 App.tsx 中使用
 */
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* 🔑 需要登录才能访问的页面 */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/proposals/new"
        element={
          <ProtectedRoute>
            <ProposalCreatePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

---

## 🎯 快速上手指南

### Step 1：安装 React Router

```bash
cd frontend
npm install react-router-dom
```

### Step 2：配置 BrowserRouter

```tsx
// main.tsx
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

### Step 3：定义路由

```tsx
// App.tsx
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/users/:id" element={<UserDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

### Step 4：添加导航链接

```tsx
import { Link, NavLink } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      <Link to="/">首页</Link>
      <NavLink
        to="/about"
        className={({ isActive }) => isActive ? 'active' : ''}
      >
        关于
      </NavLink>
    </nav>
  );
}
```

### Step 5：编程式导航

```tsx
import { useNavigate } from 'react-router-dom';

function MyButton() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate('/about')}>
      去关于页面
    </button>
  );
}
```

---

## ⚠️ 常见陷阱（新手必看）

### 陷阱 1：忘记包裹 BrowserRouter

```tsx
// ❌ 错误：直接使用 Routes
import { Routes, Route } from 'react-router-dom';

ReactDOM.createRoot(root).render(
  <Routes>  {/* 报错：useNavigate 必须在 Router 内部使用 */}
    <Route path="/" element={<Home />} />
  </Routes>
);

// ✅ 正确：必须先包裹 BrowserRouter
import { BrowserRouter, Routes, Route } from 'react-router-dom';

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  </BrowserRouter>
);
```

---

### 陷阱 2：404 路由位置错误

```tsx
// ❌ 错误：404 路由在前面，会捕获所有路径
<Routes>
  <Route path="*" element={<NotFound />} />  {/* 其他路由永远不会匹配 */}
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
</Routes>

// ✅ 正确：404 路由必须放在最后
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="*" element={<NotFound />} />  {/* 捕获所有未匹配的路径 */}
</Routes>
```

---

### 陷阱 3：useParams 类型不安全

```tsx
// ❌ 错误：未指定类型，id 可能为 undefined
function UserDetail() {
  const { id } = useParams();  // id: string | undefined

  // TypeScript 报错：id 可能为 undefined
  const userId = parseInt(id);
}

// ✅ 正确：指定类型并处理 undefined
function UserDetail() {
  const { id } = useParams<{ id: string }>();

  // 安全检查
  if (!id) {
    return <div>用户 ID 不存在</div>;
  }

  const userId = parseInt(id);
}
```

---

### 陷阱 4：navigate 在 useEffect 中导致无限循环

```tsx
// ❌ 错误：每次渲染都会触发 navigate
function MyComponent() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/home');  // 导致无限循环
  });  // 缺少依赖数组
}

// ✅ 正确：添加空依赖数组，只执行一次
function MyComponent() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/home');
  }, []);  // 只在组件挂载时执行一次
}
```

---

### 陷阱 5：Link 的 to 属性拼写错误

```tsx
// ❌ 错误：href 是 HTML <a> 标签的属性
<Link href="/about">关于</Link>  {/* 不会跳转 */}

// ✅ 正确：React Router 使用 to 属性
<Link to="/about">关于</Link>
```

---

### 陷阱 6：动态路由参数命名冲突

```tsx
// ❌ 错误：路由参数名称重复
<Routes>
  <Route path="/users/:id" element={<User />} />
  <Route path="/posts/:id" element={<Post />} />  {/* :id 重名 */}
</Routes>

// 在 User 组件中：
const { id } = useParams();  // id 是哪个？用户 ID 还是文章 ID？

// ✅ 正确：使用不同的参数名
<Routes>
  <Route path="/users/:userId" element={<User />} />
  <Route path="/posts/:postId" element={<Post />} />
</Routes>

// 在组件中：
const { userId } = useParams();  // 清晰明确
const { postId } = useParams();
```

---

## 📚 学习资源

### 官方资源
- **React Router 官方文档**：https://reactrouter.com/
- **Context7 查询结果**：`/remix-run/react-router` (已查询)
- **React Router GitHub**：https://github.com/remix-run/react-router

### 项目中的参考文件
- **路由配置**：`frontend/src/App.tsx` - 完整路由结构
- **路由初始化**：`frontend/src/main.tsx` - BrowserRouter 配置
- **页面组件**：`frontend/src/pages/` - 各页面实现

### 进阶学习主题
- **嵌套路由**：Outlet 组件和子路由
- **懒加载**：React.lazy + Suspense 优化性能
- **路由守卫**：认证检查和权限控制
- **数据预加载**：loader 和 action（React Router v7 新特性）

---

## 🎯 实践练习建议

### 练习 1：创建简单的多页面应用

```tsx
// 创建 3 个页面：Home、About、Contact
// 使用 Link 组件在页面间跳转
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="/contact" element={<Contact />} />
</Routes>
```

### 练习 2：实现动态用户详情页

```tsx
// 路由：/users/:userId
// 使用 useParams 获取用户 ID
// 根据 ID 显示不同的用户信息
function UserDetail() {
  const { userId } = useParams();
  return <div>用户 ID：{userId}</div>;
}
```

### 练习 3：实现搜索功能

```tsx
// 使用 useSearchParams 管理搜索关键词
// URL 示例：/search?q=React
// 支持分享和书签
```

---

## ✅ 学习检查清单

完成以下任务，说明你已经掌握 React Router 路由导航：

- [ ] **理解路由概念**：能解释为什么需要路由
- [ ] **会配置 BrowserRouter**：知道在哪里初始化路由
- [ ] **会定义路由**：使用 Routes 和 Route 组件
- [ ] **会使用 Link**：创建导航链接，理解与 a 标签的区别
- [ ] **会使用 useNavigate**：编程式导航，表单提交后跳转
- [ ] **会使用 useParams**：提取动态路由参数
- [ ] **会使用 useSearchParams**：管理 URL 查询参数
- [ ] **理解 Navigate**：声明式重定向，默认路由
- [ ] **会处理 404**：使用通配符路由捕获未匹配路径
- [ ] **能避免常见陷阱**：BrowserRouter 包裹、404 路由位置、useParams 类型安全

---

## 🎓 下一步学习

完成本文档后，建议继续学习：

1. **容器化部署**：`10_docker_basics.md` - Docker 基础
2. **多服务编排**：`11_docker_compose_multi_service.md` - Docker Compose
3. **项目实战**：尝试为项目添加新的路由页面

---

## 🚀 实际项目应用

**在 InnoLiber 项目中的使用场景**：

1. **页面路由**：登录、注册、首页、标书管理等 9 个页面
2. **动态路由**：标书详情页（`/proposals/:id`）、编辑页（`/proposals/:id/edit`）
3. **认证流程**：未登录重定向到登录页，登录后返回原页面
4. **查询参数**：分页、筛选、排序状态保存在 URL 中

**项目特色实现**：
- ✅ 声明式路由配置（App.tsx 中集中管理）
- ✅ 认证状态初始化（应用启动时验证 token）
- ✅ 404 处理（通配符路由捕获未匹配路径）
- ✅ 默认重定向（根路径自动跳转到首页）

**常用模式速查**：
```tsx
// 路由配置
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/users/:id" element={<User />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>

// 导航链接
<Link to="/about">关于</Link>
<NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
  关于
</NavLink>

// 编程式导航
const navigate = useNavigate();
navigate('/dashboard');
navigate(-1);  // 后退

// 路由参数
const { id } = useParams();

// 查询参数
const [searchParams, setSearchParams] = useSearchParams();
const page = searchParams.get('page');
setSearchParams({ page: '2' });

// 当前路由信息
const location = useLocation();
```

---

**文档版本**：v1.0
**最后更新**：2025-11-15
**维护者**：InnoLiber Team
**参考来源**：Context7 - React Router 官方文档

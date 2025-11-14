# InnoLiber 组件开发规范

**版本**: v1.0
**创建日期**: 2025-10-30
**适用项目**: InnoLiber Frontend
**技术栈**: React 18 + TypeScript 5 + Ant Design 5

---

## 📁 目录结构规范

### 推荐的组件目录结构

```
frontend/src/
├── components/              # 可复用组件
│   ├── ProposalCard/
│   │   ├── index.tsx       # 组件主文件
│   │   ├── ProposalCard.module.css  # 样式文件
│   │   ├── types.ts        # 类型定义
│   │   └── __tests__/      # 测试文件
│   │       └── ProposalCard.test.tsx
│   ├── StatusTag/
│   └── ...
├── pages/                   # 页面组件
│   ├── Dashboard/
│   ├── LoginPage/
│   └── ...
├── hooks/                   # 自定义Hooks
├── store/                   # 状态管理
├── services/                # API服务
├── types/                   # 全局类型定义
├── utils/                   # 工具函数
└── styles/                  # 全局样式
```

---

## 🏗️ 组件开发流程

### 1. 创建组件前

#### 1.1 检查是否可以复用现有组件
- 查看 `components/` 目录
- 查看 Ant Design 组件库
- 考虑组合而非重写

#### 1.2 确定组件类型

**展示组件（Presentational Component）**
- 只负责UI呈现
- 不包含业务逻辑
- 通过Props接收数据
- 可复用性高

```tsx
// ✅ 好的展示组件
function StatusTag({ status }: { status: ProposalStatus }) {
  const config = statusConfig[status];
  return <Tag color={config.color}>{config.label}</Tag>;
}
```

**容器组件（Container Component）**
- 负责数据获取和状态管理
- 包含业务逻辑
- 渲染展示组件

```tsx
// ✅ 好的容器组件
function ProposalList() {
  const { proposals, loading } = useProposals();

  if (loading) return <Spin />;

  return (
    <>
      {proposals.map(p => <ProposalCard key={p.id} proposal={p} />)}
    </>
  );
}
```

### 2. 命名规范

#### 2.1 文件命名
- **组件文件**: PascalCase（大驼峰）
  - `ProposalCard.tsx`
  - `StatusTag.tsx`
  - `QualityScore.tsx`

- **样式文件**: 与组件同名
  - `ProposalCard.module.css`
  - `ProposalCard.styles.ts` (styled-components)

- **类型文件**: `types.ts`
- **测试文件**: `*.test.tsx` 或 `*.spec.tsx`

#### 2.2 组件命名
```tsx
// ✅ 使用命名导出
export function ProposalCard() { }

// ✅ 或默认导出
export default function ProposalCard() { }

// ❌ 避免匿名组件
export default function() { }  // 不好
```

#### 2.3 变量命名
- **组件**: PascalCase
- **函数/变量**: camelCase
- **常量**: UPPER_SNAKE_CASE
- **私有变量**: 以下划线开头 `_privateVar`

```tsx
// 常量
const MAX_PROPOSALS = 100;
const API_BASE_URL = 'https://api.innoliber.com';

// 组件
function ProposalCard() { }

// 函数
function handleSubmit() { }

// 变量
const proposalList = [];
const isLoading = false;
```

---

## 📝 TypeScript 类型规范

### 1. Props类型定义

#### 1.1 基础Props定义
```tsx
// types.ts
export interface ProposalCardProps {
  proposal: Proposal;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

// ProposalCard.tsx
import { ProposalCardProps } from './types';

export function ProposalCard({
  proposal,
  onEdit,
  onDelete,
  className,
  style
}: ProposalCardProps) {
  // ...
}
```

#### 1.2 Children类型
```tsx
interface ContainerProps {
  children: React.ReactNode;  // 任何可渲染内容
}

interface LayoutProps {
  children: React.ReactElement;  // 单个React元素
}

interface ListProps {
  children: React.ReactElement[];  // React元素数组
}
```

#### 1.3 事件处理器类型
```tsx
interface ButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onChange?: (value: string) => void;
  onSubmit?: (data: FormData) => Promise<void>;
}
```

### 2. 组件泛型

```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <>
      {items.map(item => (
        <div key={keyExtractor(item)}>
          {renderItem(item)}
        </div>
      ))}
    </>
  );
}

// 使用
<List<Proposal>
  items={proposals}
  renderItem={p => <ProposalCard proposal={p} />}
  keyExtractor={p => p.id}
/>
```

### 3. Hooks类型

```tsx
// 返回类型推断
function useProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);

  return { proposals, loading, setProposals };
}

// 使用时自动推断
const { proposals, loading } = useProposals();
//    ^Proposal[]  ^boolean

// 泛型Hook
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  return [value, setValue] as const;
}
```

---

## 🎨 样式编写规范

### 1. CSS Modules（推荐）

#### 优势
- 局部作用域，避免样式冲突
- 类型安全（TypeScript支持）
- 与Ant Design兼容

#### 使用示例
```css
/* ProposalCard.module.css */
.card {
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 12px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}
```

```tsx
// ProposalCard.tsx
import styles from './ProposalCard.module.css';

export function ProposalCard({ proposal }: ProposalCardProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{proposal.title}</h3>
      <div className={styles.actions}>
        <Button>编辑</Button>
        <Button>删除</Button>
      </div>
    </div>
  );
}
```

### 2. 内联样式（少量动态样式）

```tsx
// ✅ 适用场景：动态计算的样式
<div style={{
  width: `${progress}%`,
  backgroundColor: progress > 80 ? '#10B981' : '#F59E0B'
}}>
  {progress}%
</div>

// ❌ 避免：大量静态样式
<div style={{
  padding: '24px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  // ... 更多样式
}}>
</div>
```

### 3. Ant Design 主题定制

```tsx
// main.tsx
import { ConfigProvider } from 'antd';

<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1E3A8A',
      colorSuccess: '#10B981',
      colorWarning: '#F59E0B',
      colorError: '#EF4444',
      colorInfo: '#3B82F6',
      borderRadius: 8,
      fontSize: 14,
    },
    components: {
      Button: {
        controlHeight: 40,
        borderRadius: 6,
      },
      Input: {
        controlHeight: 40,
      }
    }
  }}
>
  <App />
</ConfigProvider>
```

### 4. 响应式样式

```css
/* 移动端优先 */
.container {
  padding: 16px;
}

/* 平板及以上 */
@media (min-width: 768px) {
  .container {
    padding: 24px;
  }
}

/* 桌面端 */
@media (min-width: 1200px) {
  .container {
    padding: 32px;
    max-width: 1440px;
    margin: 0 auto;
  }
}
```

---

## ♿ 可访问性（ARIA）规范

### 1. 语义化HTML

```tsx
// ✅ 使用语义化标签
<nav>
  <ul>
    <li><a href="/dashboard">首页</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>标书标题</h1>
    <p>内容...</p>
  </article>
</main>

// ❌ 避免无意义的div
<div>
  <div>
    <div>首页</div>
  </div>
</div>
```

### 2. ARIA属性

```tsx
// 按钮
<button
  aria-label="删除标书"
  aria-pressed={isActive}
  disabled={isDisabled}
>
  <DeleteOutlined />
</button>

// 输入框
<input
  aria-label="搜索标书"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby="email-error"
/>
{hasError && (
  <span id="email-error" role="alert">
    请输入有效的邮箱地址
  </span>
)}

// 对话框
<Modal
  open={visible}
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">确认删除</h2>
  <p id="modal-description">此操作不可撤销</p>
</Modal>
```

### 3. 键盘导航

```tsx
function Tabs() {
  const [activeTab, setActiveTab] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowLeft' && index > 0) {
      setActiveTab(index - 1);
    } else if (e.key === 'ArrowRight' && index < tabs.length - 1) {
      setActiveTab(index + 1);
    }
  };

  return (
    <div role="tablist">
      {tabs.map((tab, index) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={activeTab === index}
          tabIndex={activeTab === index ? 0 : -1}
          onKeyDown={(e) => handleKeyDown(e, index)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

---

## 🔄 状态管理规范

### 1. 本地状态（useState）

适用场景：
- UI状态（展开/折叠、显示/隐藏）
- 表单输入
- 临时数据

```tsx
function Accordion() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button onClick={() => setExpanded(!expanded)}>
        {expanded ? '折叠' : '展开'}
      </button>
      {expanded && <div>内容</div>}
    </div>
  );
}
```

### 2. 全局状态（Zustand）

适用场景：
- 跨组件共享的数据
- 用户信息
- 应用配置

```typescript
// store/proposalStore.ts
import { create } from 'zustand';

interface ProposalStore {
  proposals: Proposal[];
  loading: boolean;
  fetchProposals: () => Promise<void>;
  addProposal: (proposal: Proposal) => void;
}

export const useProposalStore = create<ProposalStore>((set) => ({
  proposals: [],
  loading: false,

  fetchProposals: async () => {
    set({ loading: true });
    const data = await api.get('/proposals');
    set({ proposals: data, loading: false });
  },

  addProposal: (proposal) =>
    set((state) => ({
      proposals: [...state.proposals, proposal]
    }))
}));
```

### 3. 服务器状态（React Query）- 可选

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';

function ProposalList() {
  // 查询
  const { data, isLoading, error } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => api.get('/proposals')
  });

  // 变更
  const mutation = useMutation({
    mutationFn: (newProposal) => api.post('/proposals', newProposal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    }
  });

  return (
    // ...
  );
}
```

---

## 🧪 测试规范

### 1. 单元测试（Vitest）

```tsx
// ProposalCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProposalCard } from './ProposalCard';

describe('ProposalCard', () => {
  const mockProposal = {
    id: '1',
    title: 'Test Proposal',
    status: 'draft',
    score: 8.5
  };

  it('renders proposal title', () => {
    render(<ProposalCard proposal={mockProposal} />);
    expect(screen.getByText('Test Proposal')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const handleEdit = vi.fn();
    render(
      <ProposalCard
        proposal={mockProposal}
        onEdit={handleEdit}
      />
    );

    fireEvent.click(screen.getByText('编辑'));
    expect(handleEdit).toHaveBeenCalledWith('1');
  });
});
```

### 2. 组件快照测试

```tsx
it('matches snapshot', () => {
  const { container } = render(<ProposalCard proposal={mockProposal} />);
  expect(container.firstChild).toMatchSnapshot();
});
```

---

## 📦 性能优化规范

### 1. 避免不必要的重渲染

#### 使用 React.memo
```tsx
import { memo } from 'react';

export const ProposalCard = memo(function ProposalCard({
  proposal
}: ProposalCardProps) {
  return (
    // ...
  );
});
```

#### 使用 useMemo
```tsx
function ExpensiveComponent({ data }: { data: number[] }) {
  const sortedData = useMemo(() => {
    return data.sort((a, b) => b - a);
  }, [data]);

  return <div>{sortedData.join(', ')}</div>;
}
```

#### 使用 useCallback
```tsx
function Parent() {
  const [count, setCount] = useState(0);

  // ✅ 使用useCallback避免子组件重渲染
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <Child onClick={handleClick} />;
}
```

### 2. 代码分割

```tsx
import { lazy, Suspense } from 'react';

// 懒加载组件
const ProposalEditPage = lazy(() => import('./pages/ProposalEditPage'));

function App() {
  return (
    <Suspense fallback={<Spin />}>
      <ProposalEditPage />
    </Suspense>
  );
}
```

### 3. 列表优化

```tsx
// ✅ 使用key
{proposals.map(p => (
  <ProposalCard key={p.id} proposal={p} />
))}

// ❌ 避免使用index作为key（数据会变化时）
{proposals.map((p, index) => (
  <ProposalCard key={index} proposal={p} />
))}
```

---

## 📋 组件开发检查清单

### 开发前
- [ ] 确认组件是否已存在
- [ ] 确定组件类型（展示/容器）
- [ ] 设计Props接口
- [ ] 确定状态管理方案

### 开发中
- [ ] 遵循命名规范
- [ ] 完善TypeScript类型
- [ ] 编写响应式样式
- [ ] 添加ARIA属性
- [ ] 处理加载和错误状态
- [ ] 添加注释说明

### 开发后
- [ ] 编写单元测试
- [ ] 检查性能优化
- [ ] 测试响应式布局
- [ ] 测试可访问性
- [ ] 代码审查
- [ ] 更新文档

---

## 📚 参考资源

### React最佳实践
- [React官方文档](https://react.dev/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### Ant Design
- [Ant Design组件库](https://ant.design/components/overview-cn/)
- [Ant Design Pro](https://pro.ant.design/)

### 可访问性
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)

---

**文档版本**: v1.0
**最后更新**: 2025-10-30
**维护者**: InnoLiber Team

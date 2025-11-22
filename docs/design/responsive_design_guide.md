# InnoLiber 响应式设计指南

**版本**: v2.0 - Rams Edition
**创建日期**: 2025-10-30
**更新日期**: 2025-11-22
**适用项目**: InnoLiber Frontend
**技术栈**: React 18 + Ant Design 5
**设计理念**: Less but Better（简化断点系统）

---

## 📐 断点系统（简化版）

### ⚠️ 重要变更：从 6 个断点简化为 3 个

基于 Dieter Rams "尽可能少"的设计原则，我们简化了响应式断点系统：

**旧版（6个断点）**:
```typescript
// ❌ 过于复杂，维护成本高
xs: 0, sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1600
```

**新版（3个断点）**:
```typescript
// ✅ Rams Edition - 简化后
const breakpoints = {
  mobile: 0,      // < 768px   (手机)
  tablet: 768,    // 768-1023px (平板)
  desktop: 1024   // ≥ 1024px  (桌面)
};
```

### 简化后的设备策略

| 设备类型 | 断点范围 | 主要布局策略 | 导航方式 |
|---------|---------|-------------|---------|
| **手机** | < 768px | 单列布局 | 抽屉导航 |
| **平板** | 768-1023px | 双列布局 | 侧边栏可折叠 |
| **桌面** | ≥ 1024px | 三列布局 | 固定侧边栏 |

**设计思考**:
- ✅ **减少维护成本**: 从维护6个断点减少到3个
- ✅ **覆盖主流设备**: 手机、平板、桌面三类设备占用户98%+
- ✅ **更清晰的决策**: 开发者无需纠结 sm/md 或 lg/xl 的差异
- ✅ **符合Rams原则**: "Less but Better"

### Ant Design 断点映射

| InnoLiber概念 | Ant Design断点 | 说明 |
|-------------|---------------|------|
| mobile | `xs` | < 768px |
| tablet | `md` | 768-1023px |
| desktop | `xl` (≥ 1200px) | 我们设定为 ≥ 1024px |

**注意**: 我们使用 Ant Design 的 `xs`, `md`, `xl` 对应我们的 3 个断点

---

## 🎨 响应式布局实现

### 1. Grid 系统使用

#### 基础用法
```tsx
import { Row, Col } from 'antd';

<Row gutter={[16, 16]}>
  {/* 移动端占满12列，平板占6列，桌面占4列 */}
  <Col xs={24} md={12} xl={8}>
    <ProposalCard />
  </Col>
</Row>
```

#### 常见布局模式

##### 1.1 左右布局（登录页）
```tsx
<Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
  {/* 左侧品牌展示 - 移动端隐藏 */}
  <Col xs={0} sm={0} md={12} lg={12} xl={12}>
    <BrandSection />
  </Col>

  {/* 右侧表单 */}
  <Col xs={22} sm={20} md={12} lg={10} xl={8}>
    <LoginForm />
  </Col>
</Row>
```

##### 1.2 侧边栏+内容区（主布局）
```tsx
<Row>
  {/* 侧边栏 - 移动端隐藏 */}
  <Col xs={0} sm={0} md={0} lg={4} xl={4}>
    <Sidebar />
  </Col>

  {/* 内容区 */}
  <Col xs={24} sm={24} md={24} lg={20} xl={20}>
    <Content />
  </Col>
</Row>
```

##### 1.3 三列布局（编辑页）
```tsx
<Row>
  {/* 左侧章节导航 - 移动端使用抽屉 */}
  <Col xs={0} sm={0} md={6} lg={5} xl={4}>
    <ChapterNav />
  </Col>

  {/* 中间编辑器 */}
  <Col xs={24} sm={24} md={18} lg={14} xl={16}>
    <Editor />
  </Col>

  {/* 右侧AI助手 - 移动端使用浮动按钮 */}
  <Col xs={0} sm={0} md={0} lg={5} xl={4}>
    <AIAssistant />
  </Col>
</Row>
```

### 2. 使用 useBreakpoint Hook

```tsx
import { Grid } from 'antd';

function MyComponent() {
  const screens = Grid.useBreakpoint();

  // screens = { xs: true, sm: false, md: false, lg: false, xl: false }

  return (
    <>
      {screens.xs && <MobileLayout />}
      {screens.lg && <DesktopLayout />}
      {screens.xl && <DesktopLayoutWide />}
    </>
  );
}
```

#### 实际应用示例：导航栏

```tsx
import { Layout, Drawer, Menu } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Grid } from 'antd';

function NavigationBar() {
  const screens = Grid.useBreakpoint();
  const [drawerVisible, setDrawerVisible] = useState(false);

  // 移动端：显示汉堡菜单
  if (screens.xs || screens.sm) {
    return (
      <>
        <MenuOutlined onClick={() => setDrawerVisible(true)} />
        <Drawer
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          placement="left"
        >
          <Menu items={menuItems} />
        </Drawer>
      </>
    );
  }

  // 桌面端：固定侧边栏
  return (
    <Layout.Sider width={200}>
      <Menu items={menuItems} />
    </Layout.Sider>
  );
}
```

---

## 📱 移动端优化指南

### 1. 触摸目标尺寸

**最小触摸目标**: 44×44px (iOS) / 48×48px (Material Design)

```css
/* 按钮最小尺寸 */
.mobile-button {
  min-height: 44px;
  padding: 12px 24px;
}

/* 输入框最小高度 */
.mobile-input {
  height: 48px;
}
```

#### Ant Design 移动端配置
```tsx
import { ConfigProvider } from 'antd';

<ConfigProvider
  theme={{
    token: {
      // 移动端增大控件尺寸
      controlHeight: 48,
      fontSize: 16, // 防止iOS自动缩放
    }
  }}
>
  <App />
</ConfigProvider>
```

### 2. 文字大小

```css
/* 基础文字 */
body {
  font-size: 14px; /* 桌面端 */
}

/* 移动端 */
@media (max-width: 767px) {
  body {
    font-size: 16px; /* 防止iOS自动缩放 */
  }

  h1 { font-size: 24px; }
  h2 { font-size: 20px; }
  h3 { font-size: 18px; }
}
```

### 3. 间距调整

```css
/* 桌面端 */
.container {
  padding: 32px;
  gap: 24px;
}

/* 平板 */
@media (max-width: 991px) {
  .container {
    padding: 24px;
    gap: 16px;
  }
}

/* 移动端 */
@media (max-width: 767px) {
  .container {
    padding: 16px;
    gap: 12px;
  }
}
```

### 4. 导航模式

#### 4.1 桌面端：固定侧边栏
```tsx
<Layout>
  <Layout.Sider width={200} style={{ position: 'fixed', height: '100vh' }}>
    <Menu items={menuItems} />
  </Layout.Sider>
  <Layout.Content style={{ marginLeft: 200 }}>
    {children}
  </Layout.Content>
</Layout>
```

#### 4.2 移动端：抽屉导航
```tsx
const [visible, setVisible] = useState(false);

<>
  <Button icon={<MenuOutlined />} onClick={() => setVisible(true)} />
  <Drawer
    open={visible}
    onClose={() => setVisible(false)}
    placement="left"
    width="80%"
  >
    <Menu items={menuItems} />
  </Drawer>
</>
```

### 5. 表单布局

#### 5.1 桌面端：多列布局
```tsx
<Form layout="horizontal">
  <Row gutter={16}>
    <Col span={12}>
      <Form.Item label="姓名" name="name">
        <Input />
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item label="邮箱" name="email">
        <Input />
      </Form.Item>
    </Col>
  </Row>
</Form>
```

#### 5.2 移动端：单列布局
```tsx
<Form layout="vertical">
  <Form.Item label="姓名" name="name">
    <Input size="large" />
  </Form.Item>
  <Form.Item label="邮箱" name="email">
    <Input size="large" />
  </Form.Item>
</Form>
```

#### 5.3 响应式表单
```tsx
const screens = Grid.useBreakpoint();

<Form layout={screens.md ? 'horizontal' : 'vertical'}>
  <Row gutter={16}>
    <Col xs={24} md={12}>
      <Form.Item label="姓名" name="name">
        <Input size={screens.xs ? 'large' : 'middle'} />
      </Form.Item>
    </Col>
    <Col xs={24} md={12}>
      <Form.Item label="邮箱" name="email">
        <Input size={screens.xs ? 'large' : 'middle'} />
      </Form.Item>
    </Col>
  </Row>
</Form>
```

### 6. 表格处理

#### 6.1 移动端：卡片模式
```tsx
const screens = Grid.useBreakpoint();

if (screens.xs || screens.sm) {
  // 移动端：使用卡片
  return (
    <List
      dataSource={proposals}
      renderItem={(item) => (
        <Card>
          <h3>{item.title}</h3>
          <p>{item.field}</p>
          <Button>查看详情</Button>
        </Card>
      )}
    />
  );
}

// 桌面端：使用表格
return (
  <Table
    dataSource={proposals}
    columns={columns}
  />
);
```

#### 6.2 桌面端：横向滚动
```tsx
<Table
  dataSource={data}
  columns={columns}
  scroll={{ x: 'max-content' }} // 自动横向滚动
/>
```

### 7. 编辑器适配

#### 7.1 桌面端：完整编辑器
```tsx
const toolbarModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'header': [1, 2, 3, false] }],
    ['link', 'image'],
    ['clean']
  ]
};
```

#### 7.2 移动端：简化工具栏
```tsx
const screens = Grid.useBreakpoint();

const mobileToolbar = {
  toolbar: [
    ['bold', 'italic'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ]
};

<ReactQuill
  modules={screens.xs ? mobileToolbar : toolbarModules}
/>
```

---

## 🎯 组件响应式最佳实践

### 1. SidebarLayout 组件

```tsx
import { Layout, Drawer, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Grid } from 'antd';

function SidebarLayout({ children }: { children: React.ReactNode }) {
  const screens = Grid.useBreakpoint();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const isMobile = screens.xs || screens.sm;

  if (isMobile) {
    return (
      <Layout>
        <Layout.Header>
          <Button
            icon={<MenuOutlined />}
            onClick={() => setDrawerVisible(true)}
          />
          <span>InnoLiber</span>
        </Layout.Header>
        <Drawer
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          placement="left"
          width="80%"
        >
          <Sidebar />
        </Drawer>
        <Layout.Content>
          {children}
        </Layout.Content>
      </Layout>
    );
  }

  return (
    <Layout>
      <Layout.Sider width={200}>
        <Sidebar />
      </Layout.Sider>
      <Layout>
        <Layout.Header>
          <span>InnoLiber</span>
        </Layout.Header>
        <Layout.Content>
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
```

### 2. ProposalCard 组件

```tsx
function ProposalCard({ proposal }: { proposal: Proposal }) {
  const screens = Grid.useBreakpoint();

  return (
    <Card
      style={{
        marginBottom: screens.xs ? 12 : 16
      }}
      bodyStyle={{
        padding: screens.xs ? 12 : 24
      }}
    >
      <h3 style={{
        fontSize: screens.xs ? 16 : 18,
        marginBottom: screens.xs ? 8 : 12
      }}>
        {proposal.title}
      </h3>

      <Space
        direction={screens.xs ? 'vertical' : 'horizontal'}
        size={screens.xs ? 8 : 16}
      >
        <Button size={screens.xs ? 'middle' : 'small'}>
          编辑
        </Button>
        <Button size={screens.xs ? 'middle' : 'small'}>
          分析
        </Button>
      </Space>
    </Card>
  );
}
```

### 3. Dashboard 页面

```tsx
function Dashboard() {
  const screens = Grid.useBreakpoint();

  return (
    <div style={{ padding: screens.xs ? 16 : 24 }}>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        {statistics.map(stat => (
          <Col xs={12} sm={12} md={6} lg={6} xl={6} key={stat.key}>
            <StatCard {...stat} />
          </Col>
        ))}
      </Row>

      {/* 标书列表 */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {proposals.map(proposal => (
          <Col xs={24} sm={24} md={12} lg={8} xl={6} key={proposal.id}>
            <ProposalCard proposal={proposal} />
          </Col>
        ))}
      </Row>
    </div>
  );
}
```

---

## 🔧 实用工具

### 1. 响应式Hook

```typescript
// hooks/useResponsive.ts
import { Grid } from 'antd';

export function useResponsive() {
  const screens = Grid.useBreakpoint();

  return {
    isMobile: screens.xs || screens.sm,
    isTablet: screens.md,
    isDesktop: screens.lg || screens.xl,
    isLargeScreen: screens.xxl,
    screens
  };
}
```

使用示例：
```tsx
import { useResponsive } from '@/hooks/useResponsive';

function MyComponent() {
  const { isMobile, isDesktop } = useResponsive();

  return (
    <>
      {isMobile && <MobileView />}
      {isDesktop && <DesktopView />}
    </>
  );
}
```

### 2. 响应式容器尺寸

```typescript
// hooks/useContainerSize.ts
import { Grid } from 'antd';

export function useContainerSize() {
  const screens = Grid.useBreakpoint();

  if (screens.xs) return { padding: 16, gutter: 12 };
  if (screens.sm) return { padding: 20, gutter: 16 };
  if (screens.md) return { padding: 24, gutter: 16 };
  return { padding: 32, gutter: 24 };
}
```

### 3. 响应式字体大小

```typescript
// utils/responsive.ts
export function getResponsiveFontSize(
  baseSize: number,
  screens: Record<string, boolean>
) {
  if (screens.xs) return baseSize * 0.875;  // 14px
  if (screens.sm) return baseSize;           // 16px
  if (screens.md) return baseSize * 1.125;   // 18px
  return baseSize * 1.25;                    // 20px
}
```

---

## 📋 响应式检查清单

### 开发阶段检查

- [ ] 所有页面使用 Grid 系统布局
- [ ] 关键组件支持 xs, md, xl 三个断点
- [ ] 移动端使用抽屉导航
- [ ] 表单在移动端切换为垂直布局
- [ ] 按钮和输入框在移动端尺寸≥44px
- [ ] 文字大小在移动端≥14px
- [ ] 表格在移动端使用卡片或横向滚动

### 测试阶段检查

#### 移动端 (xs: < 576px)
- [ ] 单列布局正常显示
- [ ] 抽屉导航可正常打开/关闭
- [ ] 触摸目标足够大（≥44px）
- [ ] 文字清晰可读
- [ ] 表单输入方便
- [ ] 图片和图表自适应

#### 平板 (md: 768-991px)
- [ ] 双列布局正常显示
- [ ] 侧边栏可正常折叠
- [ ] 表格显示完整或横向滚动
- [ ] 卡片间距合理

#### 桌面 (xl: ≥ 1200px)
- [ ] 三列布局正常显示
- [ ] 侧边栏固定显示
- [ ] 内容不会过宽（最大宽度限制）
- [ ] 所有功能正常访问

---

## 🚀 性能优化建议

### 1. 按需加载

```tsx
import { lazy, Suspense } from 'react';

// 移动端组件按需加载
const MobileLayout = lazy(() => import('./MobileLayout'));
const DesktopLayout = lazy(() => import('./DesktopLayout'));

function App() {
  const { isMobile } = useResponsive();

  return (
    <Suspense fallback={<Spin />}>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
    </Suspense>
  );
}
```

### 2. 图片响应式

```tsx
<Image
  src={proposal.cover}
  preview={false}
  style={{
    width: '100%',
    height: 'auto'
  }}
  // 移动端使用缩略图
  alt={proposal.title}
/>
```

### 3. 减少重渲染

```tsx
import { memo } from 'react';

const ProposalCard = memo(({ proposal }: { proposal: Proposal }) => {
  const { isMobile } = useResponsive();

  // 避免每次都重新计算
  const cardStyle = useMemo(() => ({
    padding: isMobile ? 12 : 24
  }), [isMobile]);

  return <Card style={cardStyle}>...</Card>;
});
```

---

## 📚 参考资源

### 官方文档
- [Ant Design Grid](https://ant.design/components/grid-cn)
- [Ant Design Layout](https://ant.design/components/layout-cn)
- [useBreakpoint Hook](https://ant.design/components/grid-cn#components-grid-demo-usebreakpoint)

### 设计规范
- [Material Design - Layout](https://material.io/design/layout)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

### 测试工具
- Chrome DevTools - Device Mode
- [Responsively App](https://responsively.app/)
- [BrowserStack](https://www.browserstack.com/)

---

**文档版本**: v1.0
**最后更新**: 2025-10-30
**维护者**: InnoLiber Team

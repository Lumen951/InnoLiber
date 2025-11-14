/**
 * @file SidebarLayout.tsx
 * @description 侧边栏导航布局组件 - InnoLiber 主要导航界面
 *
 * <copyright>
 * Copyright (c) 2024-2025 InnoLiber Team
 * Licensed under the MIT License
 * </copyright>
 *
 * @author InnoLiber Team
 * @version 1.0.0
 */

import React from 'react';
import { Menu, Layout, Avatar, Button, Space } from 'antd';
import {
  FileTextOutlined,
  BarChartOutlined,
  BookOutlined,
  SettingOutlined,
  PlusCircleOutlined,
  UserOutlined,
  BellOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider, Header } = Layout;

/**
 * 侧边栏布局组件属性接口
 *
 * <rationale>
 * 简单包装设计：
 * - children 传递内容区域，保持布局组件职责单一
 * - 布局组件不处理具体业务逻辑，仅提供导航和框架
 * </rationale>
 *
 * @property {React.ReactNode} children - 主内容区域组件
 */
interface SidebarLayoutProps {
  children: React.ReactNode;
}

/**
 * 侧边栏布局组件 - 统一的应用导航框架
 *
 * <rationale>
 * Ant Design Layout结构：
 * - 固定侧边栏 + 顶部工具栏 + 主内容区域
 * - 使用React Router实现路由高亮和导航
 * - 布局固定宽度200px，适合4个主要功能模块
 * </rationale>
 *
 * <warning type="responsive">
 * ⚠️ 当前布局为桌面端设计，移动端需要适配
 * TODO: 添加响应式断点，移动端使用Drawer抽屉导航
 * </warning>
 *
 * @param props - 组件属性
 * @returns React布局组件
 */
const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * 导航菜单配置
   *
   * <rationale>
   * key值设计：
   * - 直接使用路由路径作为key，便于selectedKeys匹配
   * - 图标选择与功能语义对应（文档、图表、书籍、设置）
   * </rationale>
   */
  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <FileTextOutlined />,
      label: '标书管理',
    },
    {
      key: '/analysis',
      icon: <BarChartOutlined />,
      label: '数据分析',
    },
    {
      key: '/library',
      icon: <BookOutlined />,
      label: '文献库',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
  ];

  /**
   * 菜单点击导航处理
   * @param key - 路由路径
   */
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  /**
   * 新建标书操作
   *
   * <rationale>
   * 快速访问设计：
   * - 新建按钮放在顶部Header，全局可见
   * - 核心功能入口，用户最高频操作之一
   * </rationale>
   */
  const handleNewProposal = () => {
    navigate('/proposals/new');
  };

  /**
   * 用户登出处理
   *
   * <hack reason="localStorage-auth">
   * HACK: 使用 localStorage 存储认证信息
   * - 清除本地token和用户信息
   * - 生产环境应使用 HttpOnly Cookie + 服务端清除
   * </hack>
   */
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏导航区域 */}
      <Sider width={200} className="site-layout-background">
        {/*
         * Logo区域
         * <rationale>
         * 品牌展示位置：
         * - 固定在侧边栏顶部，建立视觉锚点
         * - 蓝色主题色 (#1E3A8A) 与设计规范一致
         * </rationale>
         */}
        <div className="logo" style={{
          padding: '16px',
          textAlign: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <h2 style={{ color: '#1E3A8A', margin: 0, fontSize: '18px' }}>InnoLiber</h2>
        </div>

        {/*
         * 主导航菜单
         * <rationale>
         * selectedKeys 路由同步：
         * - 使用 location.pathname 实现路由高亮
         * - 用户始终知道当前所在页面
         * </rationale>
         */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ height: 'calc(100vh - 64px)', borderRight: 0 }}
        />
      </Sider>

      <Layout>
        {/*
         * 顶部工具栏
         * <rationale>
         * 双侧布局：
         * - 左侧: 核心操作（新建标书）
         * - 右侧: 用户信息和系统操作（通知、退出）
         * - 保持界面平衡和操作便利性
         * </rationale>
         */}
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* 左侧：核心操作区 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={handleNewProposal}
            >
              新建标书
            </Button>
          </div>

          {/* 右侧：用户信息区 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <BellOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />

            <Space>
              <Avatar size="small" icon={<UserOutlined />} />
              <span>张三</span>
            </Space>

            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              退出
            </Button>
          </div>
        </Header>

        {/*
         * 主内容区域
         * <rationale>
         * 内容布局：
         * - 24px 外边距提供视觉呼吸空间
         * - 浅灰背景 (#f5f5f5) 与白色卡片形成层次对比
         * - calc() 计算精确高度，避免滚动条
         * </rationale>
         */}
        <Layout.Content style={{
          margin: '24px',
          background: '#f5f5f5',
          minHeight: 'calc(100vh - 88px)'
        }}>
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default SidebarLayout;
// 侧边栏导航组件
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

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 菜单项配置
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

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // 处理新建标书
  const handleNewProposal = () => {
    navigate('/proposals/new');
  };

  // 处理退出登录
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider width={200} className="site-layout-background">
        <div className="logo" style={{
          padding: '16px',
          textAlign: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <h2 style={{ color: '#1E3A8A', margin: 0, fontSize: '18px' }}>InnoLiber</h2>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ height: 'calc(100vh - 64px)', borderRight: 0 }}
        />
      </Sider>

      {/* 顶部栏 */}
      <Layout>
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={handleNewProposal}
            >
              新建标书
            </Button>
          </div>

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

        {/* 主内容区 */}
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
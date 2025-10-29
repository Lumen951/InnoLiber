import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './styles/global.css';

// Ant Design 主题配置
const theme = {
  token: {
    colorPrimary: '#1E3A8A', // 主色：深蓝
    colorSuccess: '#10B981',  // 成功色：绿色
    colorWarning: '#F59E0B',  // 警告色：金色
    colorError: '#EF4444',    // 错误色：红色
    colorInfo: '#3B82F6',     // 信息色：天蓝
    borderRadius: 8,          // 圆角
    fontSize: 14,             // 基础字体大小
  },
  components: {
    Button: {
      borderRadius: 6,
    },
    Card: {
      borderRadius: 8,
    },
    Input: {
      borderRadius: 6,
    },
    Select: {
      borderRadius: 6,
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider
        locale={zhCN}
        theme={theme}
      >
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);

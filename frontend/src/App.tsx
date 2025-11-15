import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProposalCreatePage from './pages/ProposalCreatePage';
import ProposalEditPage from './pages/ProposalEditPage';
import ProposalDetailPage from './pages/ProposalDetailPage';
import { initAuth } from './store/authStore';

function App() {
  // 初始化认证状态（验证localStorage中的token）
  useEffect(() => {
    initAuth();
  }, []);

  return (
    <Routes>
      {/* 默认重定向到首页 */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 认证页面（公开访问） */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 首页 */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* 标书相关页面 */}
      <Route path="/proposals/new" element={<ProposalCreatePage />} />
      <Route path="/proposals/:id/edit" element={<ProposalEditPage />} />
      <Route path="/proposals/:id" element={<ProposalDetailPage />} />

      {/* TODO: 其他页面 */}
      <Route path="/analysis" element={<div>数据分析页面 - 开发中</div>} />
      <Route path="/library" element={<div>文献库页面 - 开发中</div>} />
      <Route path="/settings" element={<div>设置页面 - 开发中</div>} />

      {/* TODO-ALIYUN: [邮箱验证] - 添加邮箱验证成功页面路由
          <Route path="/verify-email" element={<EmailVerifySuccessPage />} />
          依赖：阿里云DirectMail集成
          优先级：P1 */}

      {/* TODO: [忘记密码] - 添加密码重置页面路由
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          依赖：阿里云DirectMail集成
          优先级：P2 */}

      {/* 404页面 */}
      <Route path="*" element={<div>404 - 页面未找到</div>} />
    </Routes>
  );
}

export default App;

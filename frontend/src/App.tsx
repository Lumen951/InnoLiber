import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Routes>
      {/* 默认重定向到首页 */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 首页 */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* TODO: 添加其他路由 */}
      <Route path="/proposals/new" element={<div>新建标书页面 - 开发中</div>} />
      <Route path="/proposals/:id" element={<div>标书详情页面 - 开发中</div>} />
      <Route path="/analysis" element={<div>数据分析页面 - 开发中</div>} />
      <Route path="/library" element={<div>文献库页面 - 开发中</div>} />
      <Route path="/settings" element={<div>设置页面 - 开发中</div>} />
    </Routes>
  );
}

export default App;

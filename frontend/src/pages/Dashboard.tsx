/**
 * @file Dashboard.tsx
 * @description 首页仪表板 - 标书管理主界面
 *
 * <copyright>
 * Copyright (c) 2024-2025 InnoLiber Team
 * Licensed under the MIT License
 * </copyright>
 *
 * @author InnoLiber Team
 * @version 1.0.0
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button, Input, Select, Pagination, Empty, Spin } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import type { MenuProps } from 'antd';
import SidebarLayout from '@/components/SidebarLayout';
import ProposalCard from '@/components/ProposalCard';
import { useProposals } from '@/hooks/useProposals';
import type { ProposalCard as ProposalCardType } from '@/types';

const { Option } = Select;

/**
 * Dashboard 首页组件 - 标书管理中心
 *
 * <rationale>
 * 布局设计：
 * - 四个统计卡片：总数、草稿、审阅中、已完成（状态概览）
 * - 操作栏：搜索、筛选、新建（核心功能入口）
 * - 标书列表：响应式网格，桌面端2列，移动端1列
 * - 分页：支持跳转和页大小调整
 * </rationale>
 *
 * <warning type="performance">
 * ⚠️ 大数据量考虑：
 * - 当标书超过1000个时，需要添加虚拟滚动
 * - 搜索功能应该防抖，避免频繁API调用
 * - 统计数据可以缓存5分钟，减少服务器压力
 * </warning>
 *
 * @returns Dashboard 首页组件
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // 标书数据管理（来自自定义Hook）
  const {
    proposals,
    statistics,
    loading,
    error,
    currentPage,
    pageSize,
    total,
    totalPages,
    fetchProposals,
    deleteProposal,
    handlePageChange,
    handleFilterChange,
  } = useProposals();

  // 本地状态管理
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  /**
   * 防抖搜索功能实现
   *
   * <rationale>
   * 使用lodash.debounce实现：
   * - 延迟300ms，平衡用户体验和性能
   * - 避免每次输入都触发API请求
   * - 支持标题、研究领域搜索
   * </rationale>
   */
  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      console.log('执行搜索:', searchValue);
      handleFilterChange({
        search: searchValue || undefined,
        status: statusFilter || undefined,
      });
    }, 300),
    [handleFilterChange, statusFilter]
  );

  /**
   * 搜索文本变化处理
   */
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  /**
   * 搜索功能处理（按回车）
   */
  const handleSearch = useCallback(() => {
    debouncedSearch.cancel(); // 取消防抖，立即执行
    handleFilterChange({
      search: searchText || undefined,
      status: statusFilter || undefined,
    });
  }, [debouncedSearch, handleFilterChange, searchText, statusFilter]);

  /**
   * 状态筛选处理
   * @param value - 选中的状态值
   */
  const handleStatusFilter = useCallback((value: string) => {
    setStatusFilter(value);
    handleFilterChange({
      search: searchText || undefined,
      status: value || undefined,
    });
  }, [handleFilterChange, searchText]);

  // ========== 标书操作事件处理器 ==========

  /**
   * 编辑标书操作
   */
  const handleEditProposal = useCallback((proposal: ProposalCardType) => {
    navigate(`/proposals/${proposal.id}/edit`);
  }, [navigate]);

  /**
   * 删除标书操作
   * @param proposal - 待删除的标书对象
   */
  const handleDeleteProposal = async (proposal: ProposalCardType) => {
    try {
      await deleteProposal(proposal.id);
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  /**
   * 质量分析操作
   *
   * <todo priority="medium">
   * TODO(frontend-team, 2025-11-20): [P1] 导航到分析页面
   * - 触发SPG-S服务进行质量分析
   * - 显示分析进度和结果
   * </todo>
   */
  const handleAnalyzeProposal = (proposal: ProposalCardType) => {
    console.log('分析标书:', proposal.id);
    // TODO: 导航到分析页面
  };

  /**
   * 导出标书操作
   *
   * <todo priority="medium">
   * TODO(frontend-team, 2025-11-25): [P1] 实现导出功能
   * - 支持PDF、Word、LaTeX格式导出
   * - 显示导出进度
   * - 下载完成后提示用户
   * </todo>
   */
  const handleExportProposal = (proposal: ProposalCardType) => {
    console.log('导出标书:', proposal.id);
    // TODO: 实现导出功能
  };

  /**
   * 查看标书详情
   */
  const handleViewProposal = useCallback((proposal: ProposalCardType) => {
    navigate(`/proposals/${proposal.id}`);
  }, [navigate]);

  return (
    <SidebarLayout>
      <div className="dashboard">
        {/*
         * 统计信息概览区域
         * <rationale>
         * 4×6布局设计：
         * - 总数（深蓝色）：主要KPI，用户关注的核心指标
         * - 草稿（蓝色）：待完成工作量，提醒用户继续编辑
         * - 审阅中（橙色）：进行中状态，关注AI处理进度
         * - 已完成（绿色）：成果数量，给用户成就感
         * </rationale>
         */}
        {statistics && (
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            {/* 总数统计卡片 */}
            <Col span={6}>
              <div style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h2 style={{ color: '#1E3A8A', margin: 0 }}>
                  {statistics.totalProposals}
                </h2>
                <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                  标书总数
                </p>
              </div>
            </Col>
            {/* 草稿统计卡片 */}
            <Col span={6}>
              <div style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h2 style={{ color: '#3B82F6', margin: 0 }}>
                  {statistics.draftCount}
                </h2>
                <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                  草稿
                </p>
              </div>
            </Col>
            {/* 审阅中统计卡片 */}
            <Col span={6}>
              <div style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h2 style={{ color: '#F59E0B', margin: 0 }}>
                  {statistics.reviewingCount}
                </h2>
                <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                  审阅中
                </p>
              </div>
            </Col>
            {/* 已完成统计卡片 */}
            <Col span={6}>
              <div style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h2 style={{ color: '#10B981', margin: 0 }}>
                  {statistics.completedCount}
                </h2>
                <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                  已完成
                </p>
              </div>
            </Col>
          </Row>
        )}

        {/*
         * 操作栏 - 搜索、筛选、新建
         * <rationale>
         * 布局分离：
         * - 左侧：查询功能（搜索输入框 + 状态筛选）
         * - 右侧：创建功能（新建按钮）
         * - 保持功能分组清晰，符合用户习惯
         * </rationale>
         */}
        <div style={{
          background: '#fff',
          padding: '16px 24px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* 左侧：搜索和筛选 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Input
              placeholder="搜索标书..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={handleSearchChange}
              onPressEnter={handleSearch}
              style={{ width: 300 }}
            />
            <Select
              placeholder="状态筛选"
              value={statusFilter}
              onChange={handleStatusFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="draft">草稿</Option>
              <Option value="reviewing">审阅中</Option>
              <Option value="completed">已完成</Option>
              <Option value="submitted">已提交</Option>
            </Select>
          </div>

          {/* 右侧：新建按钮 */}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/proposals/new')}
          >
            新建标书
          </Button>
        </div>

        {/*
         * 标书列表展示区域
         * <rationale>
         * 状态分支渲染：
         * - loading: 显示加载动画，给用户反馈
         * - error: 显示错误信息，引导用户重试
         * - empty: 引导用户创建第一个标书
         * - normal: 响应式网格布局（移动端1列，桌面端2列）
         * </rationale>
         */}
        <div style={{ minHeight: '400px' }}>
          {loading ? (
            // 加载状态
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <Spin size="large" />
            </div>
          ) : error ? (
            // 错误状态
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <Empty description={error} />
            </div>
          ) : proposals.length === 0 ? (
            // 空状态 - 引导用户创建
            <Empty
              description="暂无标书"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" icon={<PlusOutlined />}>
                创建第一个标书
              </Button>
            </Empty>
          ) : (
            // 正常列表展示
            <Row gutter={[16, 16]}>
              {proposals.map((proposal) => (
                <Col key={proposal.id} xs={24} lg={12}>
                  <ProposalCard
                    proposal={proposal}
                    onEdit={handleEditProposal}
                    onDelete={handleDeleteProposal}
                    onAnalyze={handleAnalyzeProposal}
                    onExport={handleExportProposal}
                    onView={handleViewProposal}
                  />
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/*
         * 分页组件
         * <rationale>
         * 分页配置：
         * - showSizeChanger: 允许用户调整每页显示数量
         * - showQuickJumper: 支持快速跳转到指定页码
         * - showTotal: 显示数据范围和总数，用户了解数据规模
         * - 居中显示：符合用户浏览习惯
         * </rationale>
         */}
        {proposals.length > 0 && (
          <div style={{
            marginTop: '24px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <Pagination
              current={currentPage}
              total={total}
              pageSize={pageSize}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
              }
              onChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
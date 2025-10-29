// 首页组件
import React, { useState } from 'react';
import { Row, Col, Button, Input, Select, Pagination, Empty, Spin } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import SidebarLayout from '@/components/SidebarLayout';
import ProposalCard from '@/components/ProposalCard';
import { useProposals } from '@/hooks/useProposals';
import type { ProposalCard as ProposalCardType } from '@/types';

const { Option } = Select;

const Dashboard: React.FC = () => {
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

  // 状态
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // 处理搜索
  const handleSearch = () => {
    // TODO: 实现搜索功能
    console.log('搜索:', searchText);
  };

  // 处理状态筛选
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    handleFilterChange({
      status: value || undefined,
    });
  };

  // 处理标书操作
  const handleEditProposal = (proposal: ProposalCardType) => {
    console.log('编辑标书:', proposal.id);
    // TODO: 导航到编辑页面
  };

  const handleDeleteProposal = async (proposal: ProposalCardType) => {
    try {
      await deleteProposal(proposal.id);
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const handleAnalyzeProposal = (proposal: ProposalCardType) => {
    console.log('分析标书:', proposal.id);
    // TODO: 导航到分析页面
  };

  const handleExportProposal = (proposal: ProposalCardType) => {
    console.log('导出标书:', proposal.id);
    // TODO: 实现导出功能
  };

  const handleViewProposal = (proposal: ProposalCardType) => {
    console.log('查看标书:', proposal.id);
    // TODO: 导航到详情页面
  };

  return (
    <SidebarLayout>
      <div className="dashboard">
        {/* 统计信息 */}
        {statistics && (
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
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

        {/* 操作栏 */}
        <div style={{
          background: '#fff',
          padding: '16px 24px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Input
              placeholder="搜索标书..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
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

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => console.log('新建标书')}
          >
            新建标书
          </Button>
        </div>

        {/* 标书列表 */}
        <div style={{ minHeight: '400px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <Spin size="large" />
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <Empty description={error} />
            </div>
          ) : proposals.length === 0 ? (
            <Empty
              description="暂无标书"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" icon={<PlusOutlined />}>
                创建第一个标书
              </Button>
            </Empty>
          ) : (
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

        {/* 分页 */}
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
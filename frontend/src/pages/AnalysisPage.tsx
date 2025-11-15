/**
 * @file AnalysisPage.tsx
 * @description 数据分析页面 - 展示标书质量分析和统计数据
 *
 * <copyright>
 * Copyright (c) 2024-2025 InnoLiber Team
 * Licensed under the MIT License
 * </copyright>
 *
 * @author InnoLiber Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Statistic,
  Progress,
  Table,
  Select,
  DatePicker,
  Space,
  Tag,
  Spin,
  Empty,
  Tooltip,
  Button,
} from 'antd';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrophyOutlined,
  RiseOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import SidebarLayout from '@/components/SidebarLayout';
import StatusTag from '@/components/StatusTag';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

/**
 * AnalysisPage 数据分析页面组件
 *
 * <rationale>
 * 功能设计：
 * - 整体统计概览：展示关键KPI数据
 * - 质量分析趋势：时间序列图表展示质量变化
 * - 分数分布：展示各个维度的分数分布情况
 * - 标书列表：按质量分数排序的标书详情
 * </rationale>
 *
 * <warning type="performance">
 * ⚠️ 图表性能优化：
 * - 大数据量时使用虚拟化渲染
 * - 图表数据按需加载，避免一次性加载全部数据
 * - 使用React.memo优化重复渲染
 * </warning>
 *
 * @returns AnalysisPage 数据分析页面组件
 */
const AnalysisPage: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);
  const [timeRange, setTimeRange] = useState<string>('30d');

  // Mock数据 - 实际项目中应该从API获取
  const [overviewData, setOverviewData] = useState({
    totalProposals: 45,
    avgQuality: 7.2,
    completedCount: 12,
    improvementRate: 15.6,
  });

  const [qualityTrendData, setQualityTrendData] = useState([
    { date: '2024-10-15', quality: 6.5, content: 6.2, format: 7.1, innovation: 6.3 },
    { date: '2024-10-22', quality: 6.8, content: 6.5, format: 7.3, innovation: 6.6 },
    { date: '2024-10-29', quality: 7.1, content: 6.9, format: 7.5, innovation: 6.9 },
    { date: '2024-11-05', quality: 7.3, content: 7.2, format: 7.6, innovation: 7.1 },
    { date: '2024-11-12', quality: 7.2, content: 7.0, format: 7.4, innovation: 7.2 },
  ]);

  const [scoreDistributionData, setScoreDistributionData] = useState([
    { name: '优秀(8-10)', value: 12, color: '#52C41A' },
    { name: '良好(6-8)', value: 28, color: '#1890FF' },
    { name: '一般(4-6)', value: 5, color: '#FA8C16' },
    { name: '待改进(<4)', value: 0, color: '#FF4D4F' },
  ]);

  const [proposalRankingData, setProposalRankingData] = useState([
    {
      key: '1',
      title: '基于深度学习的医学影像分析研究',
      qualityScore: 8.7,
      contentScore: 8.5,
      formatScore: 9.2,
      innovationScore: 8.4,
      status: 'completed',
      lastUpdated: '2024-11-15',
      researchField: '人工智能',
    },
    {
      key: '2',
      title: '量子计算在密码学中的应用研究',
      qualityScore: 8.3,
      contentScore: 8.6,
      formatScore: 8.1,
      innovationScore: 8.2,
      status: 'reviewing',
      lastUpdated: '2024-11-14',
      researchField: '计算机科学',
    },
    {
      key: '3',
      title: '新型纳米材料的环境应用研究',
      qualityScore: 7.9,
      contentScore: 7.7,
      formatScore: 8.3,
      innovationScore: 7.7,
      status: 'completed',
      lastUpdated: '2024-11-13',
      researchField: '材料科学',
    },
    {
      key: '4',
      title: '可再生能源系统优化算法研究',
      qualityScore: 7.6,
      contentScore: 7.4,
      formatScore: 7.9,
      innovationScore: 7.5,
      status: 'draft',
      lastUpdated: '2024-11-12',
      researchField: '能源工程',
    },
    {
      key: '5',
      title: '生物信息学在基因组分析中的应用',
      qualityScore: 7.2,
      contentScore: 7.0,
      formatScore: 7.6,
      innovationScore: 7.0,
      status: 'draft',
      lastUpdated: '2024-11-11',
      researchField: '生物信息学',
    },
  ]);

  // 模拟数据加载
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      setLoading(false);
    };

    loadData();
  }, [dateRange, timeRange]);

  // 时间范围变化处理
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    const now = dayjs();

    switch (value) {
      case '7d':
        setDateRange([now.subtract(7, 'days'), now]);
        break;
      case '30d':
        setDateRange([now.subtract(30, 'days'), now]);
        break;
      case '90d':
        setDateRange([now.subtract(90, 'days'), now]);
        break;
      case '1y':
        setDateRange([now.subtract(1, 'year'), now]);
        break;
    }
  };

  // 表格列定义
  const tableColumns = [
    {
      title: '标书标题',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (text: string) => (
        <Text strong style={{ fontSize: '14px' }}>
          {text}
        </Text>
      ),
    },
    {
      title: '研究领域',
      dataIndex: 'researchField',
      key: 'researchField',
      width: 120,
      render: (field: string) => (
        <Tag color="blue">{field}</Tag>
      ),
    },
    {
      title: '综合质量',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      width: 100,
      sorter: (a: any, b: any) => a.qualityScore - b.qualityScore,
      render: (score: number) => (
        <Space>
          <Progress
            type="circle"
            size={40}
            percent={score * 10}
            format={() => score.toFixed(1)}
            strokeColor={score >= 8 ? '#52C41A' : score >= 6 ? '#1890FF' : '#FA8C16'}
          />
        </Space>
      ),
    },
    {
      title: '内容质量',
      dataIndex: 'contentScore',
      key: 'contentScore',
      width: 80,
      render: (score: number) => (
        <Tooltip title="内容质量评分">
          <Text type={score >= 8 ? 'success' : score >= 6 ? undefined : 'warning'}>
            {score.toFixed(1)}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: '格式规范',
      dataIndex: 'formatScore',
      key: 'formatScore',
      width: 80,
      render: (score: number) => (
        <Tooltip title="格式规范评分">
          <Text type={score >= 8 ? 'success' : score >= 6 ? undefined : 'warning'}>
            {score.toFixed(1)}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: '创新程度',
      dataIndex: 'innovationScore',
      key: 'innovationScore',
      width: 80,
      render: (score: number) => (
        <Tooltip title="创新程度评分">
          <Text type={score >= 8 ? 'success' : score >= 6 ? undefined : 'warning'}>
            {score.toFixed(1)}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 120,
      render: (date: string) => dayjs(date).format('MM-DD'),
    },
  ];

  if (loading) {
    return (
      <SidebarLayout>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text type="secondary">正在加载数据分析...</Text>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="analysis-page">
        {/* 页面标题和操作栏 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <Title level={2} style={{ margin: 0 }}>
            📊 数据分析
          </Title>
          <Space>
            <Select
              value={timeRange}
              onChange={handleTimeRangeChange}
              style={{ width: 120 }}
            >
              <Select.Option value="7d">近7天</Select.Option>
              <Select.Option value="30d">近30天</Select.Option>
              <Select.Option value="90d">近90天</Select.Option>
              <Select.Option value="1y">近一年</Select.Option>
            </Select>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              format="YYYY-MM-DD"
            />
            <Button type="primary" icon={<DownloadOutlined />}>
              导出报告
            </Button>
          </Space>
        </div>

        {/* 统计概览卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="标书总数"
                value={overviewData.totalProposals}
                prefix={<FileTextOutlined style={{ color: '#1890FF' }} />}
                valueStyle={{ color: '#1890FF' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="平均质量分"
                value={overviewData.avgQuality}
                precision={1}
                prefix={<TrophyOutlined style={{ color: '#52C41A' }} />}
                suffix="/ 10"
                valueStyle={{ color: '#52C41A' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="已完成标书"
                value={overviewData.completedCount}
                prefix={<CheckCircleOutlined style={{ color: '#FA8C16' }} />}
                valueStyle={{ color: '#FA8C16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="质量提升率"
                value={overviewData.improvementRate}
                precision={1}
                prefix={<RiseOutlined style={{ color: '#722ED1' }} />}
                suffix="%"
                valueStyle={{ color: '#722ED1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 图表区域 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          {/* 质量趋势图 */}
          <Col xs={24} lg={16}>
            <Card title="质量分析趋势" style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={qualityTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => dayjs(value).format('MM-DD')}
                  />
                  <YAxis domain={[0, 10]} />
                  <RechartsTooltip
                    labelFormatter={(value) => `日期: ${dayjs(value).format('YYYY-MM-DD')}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="quality"
                    name="综合质量"
                    stroke="#1890FF"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="content"
                    name="内容质量"
                    stroke="#52C41A"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="format"
                    name="格式规范"
                    stroke="#FA8C16"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="innovation"
                    name="创新程度"
                    stroke="#722ED1"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* 分数分布饼图 */}
          <Col xs={24} lg={8}>
            <Card title="质量分数分布" style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={scoreDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {scoreDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* 标书质量排行榜 */}
        <Card title="标书质量排行榜" style={{ marginBottom: '24px' }}>
          <Table
            columns={tableColumns}
            dataSource={proposalRankingData}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </div>
    </SidebarLayout>
  );
};

export default AnalysisPage;
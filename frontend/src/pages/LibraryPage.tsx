/**
 * @file LibraryPage.tsx
 * @description 文献库页面 - K-TAS文献分析和趋势识别
 *
 * <copyright>
 * Copyright (c) 2024-2025 InnoLiber Team
 * Licensed under the MIT License
 * </copyright>
 *
 * @author InnoLiber Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Button,
  Table,
  Tag,
  Space,
  Typography,
  Drawer,
  Descriptions,
  Badge,
  Tooltip,
  Pagination,
  Empty,
  Spin,
  Divider,
  Alert,
  Progress,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  LinkOutlined,
  CalendarOutlined,
  UserOutlined,
  BookOutlined,
  RiseOutlined,
  DownloadOutlined,
  HeartOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { debounce } from 'lodash';
import SidebarLayout from '@/components/SidebarLayout';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

/**
 * LibraryPage 文献库页面组件
 *
 * <rationale>
 * K-TAS服务设计：
 * - 文献检索：支持标题、关键词、作者多维度搜索
 * - 智能筛选：按研究领域、发表时间、引用次数筛选
 * - 趋势分析：热点关键词、研究方向发展趋势
 * - 文献详情：完整的元数据展示和相关推荐
 * </rationale>
 *
 * <warning type="performance">
 * ⚠️ 大数据量处理：
 * - arXiv数据量巨大，需要分页和虚拟滚动
 * - 搜索功能防抖，避免频繁API调用
 * - 图表数据使用缓存，提升渲染性能
 * </warning>
 *
 * @returns LibraryPage 文献库页面组件
 */
const LibraryPage: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedField, setSelectedField] = useState<string>('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('1y');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Mock数据 - 实际项目中从K-TAS服务API获取
  const [literatureData, setLiteratureData] = useState([
    {
      id: '2024.11001',
      title: 'Deep Learning Approaches for Medical Image Analysis: A Comprehensive Survey',
      authors: ['Zhang, Wei', 'Li, Ming', 'Wang, Jun'],
      abstract: 'This survey provides a comprehensive overview of deep learning techniques applied to medical image analysis, covering recent advances in computer vision, natural language processing, and their applications in medical diagnosis...',
      publishDate: '2024-11-10',
      venue: 'arXiv:2411.1234',
      category: 'Computer Science > Computer Vision',
      citations: 15,
      keywords: ['Deep Learning', 'Medical Imaging', 'Computer Vision', 'AI Healthcare'],
      doi: '10.48550/arXiv.2411.1234',
      pdfUrl: 'https://arxiv.org/pdf/2411.1234.pdf',
      relevanceScore: 95,
      trendingScore: 88,
      field: 'Computer Science',
    },
    {
      id: '2024.10987',
      title: 'Quantum Computing Applications in Cryptography and Security',
      authors: ['Chen, Yifan', 'Liu, Xiaoming', 'Zhou, Hao'],
      abstract: 'We present a systematic analysis of quantum computing applications in modern cryptography, discussing both opportunities and challenges in post-quantum cryptographic systems...',
      publishDate: '2024-11-08',
      venue: 'arXiv:2411.0987',
      category: 'Computer Science > Cryptography',
      citations: 23,
      keywords: ['Quantum Computing', 'Cryptography', 'Security', 'Post-quantum'],
      doi: '10.48550/arXiv.2411.0987',
      pdfUrl: 'https://arxiv.org/pdf/2411.0987.pdf',
      relevanceScore: 92,
      trendingScore: 94,
      field: 'Computer Science',
    },
    {
      id: '2024.10876',
      title: 'Novel Nanomaterials for Environmental Remediation: Synthesis and Applications',
      authors: ['Wang, Mei', 'Xu, Lin', 'Yang, Qing', 'Ma, Feng'],
      abstract: 'This work describes the synthesis of novel nanomaterials with enhanced properties for environmental applications, including water purification and air pollution control...',
      publishDate: '2024-11-05',
      venue: 'arXiv:2411.0876',
      category: 'Physics > Applied Physics',
      citations: 8,
      keywords: ['Nanomaterials', 'Environmental Science', 'Water Treatment', 'Sustainability'],
      doi: '10.48550/arXiv.2411.0876',
      pdfUrl: 'https://arxiv.org/pdf/2411.0876.pdf',
      relevanceScore: 87,
      trendingScore: 79,
      field: 'Materials Science',
    },
    {
      id: '2024.10765',
      title: 'Renewable Energy Systems Optimization Using Machine Learning',
      authors: ['Li, Gang', 'Zhang, Rui', 'Sun, Yan'],
      abstract: 'We propose machine learning algorithms for optimizing renewable energy systems, focusing on solar and wind power prediction and grid integration challenges...',
      publishDate: '2024-11-02',
      venue: 'arXiv:2411.0765',
      category: 'Electrical Engineering > Systems',
      citations: 12,
      keywords: ['Renewable Energy', 'Machine Learning', 'Optimization', 'Smart Grid'],
      doi: '10.48550/arXiv.2411.0765',
      pdfUrl: 'https://arxiv.org/pdf/2411.0765.pdf',
      relevanceScore: 84,
      trendingScore: 85,
      field: 'Engineering',
    },
    {
      id: '2024.10654',
      title: 'Bioinformatics Approaches for Genomic Data Analysis in Precision Medicine',
      authors: ['Zhao, Lei', 'Wu, Ping', 'Huang, Jie'],
      abstract: 'This paper presents novel bioinformatics approaches for analyzing large-scale genomic data, with applications in precision medicine and personalized treatment strategies...',
      publishDate: '2024-10-28',
      venue: 'arXiv:2410.0654',
      category: 'Quantitative Biology > Genomics',
      citations: 19,
      keywords: ['Bioinformatics', 'Genomics', 'Precision Medicine', 'Data Analysis'],
      doi: '10.48550/arXiv.2410.0654',
      pdfUrl: 'https://arxiv.org/pdf/2410.0654.pdf',
      relevanceScore: 89,
      trendingScore: 76,
      field: 'Biology',
    },
  ]);

  const [trendingTopics, setTrendingTopics] = useState([
    { keyword: 'Deep Learning', count: 1245, growth: 23.5, color: '#FF6B6B' },
    { keyword: 'Quantum Computing', count: 987, growth: 45.2, color: '#4ECDC4' },
    { keyword: 'Machine Learning', count: 2341, growth: 18.7, color: '#45B7D1' },
    { keyword: 'AI Healthcare', count: 756, growth: 67.3, color: '#96CEB4' },
    { keyword: 'Nanomaterials', count: 432, growth: 31.4, color: '#FECA57' },
    { keyword: 'Renewable Energy', count: 654, growth: 28.9, color: '#FF9FF3' },
    { keyword: 'Bioinformatics', count: 789, growth: 22.1, color: '#54A0FF' },
    { keyword: 'Computer Vision', count: 1123, growth: 35.6, color: '#5F27CD' },
  ]);

  // 防抖搜索
  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      console.log('执行搜索:', searchValue);
      handleSearch(searchValue);
    }, 300),
    []
  );

  // 搜索处理
  const handleSearch = async (searchValue?: string) => {
    setLoading(true);

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 600));

    // 这里应该调用K-TAS服务API进行文献搜索
    // const results = await literatureService.search({
    //   query: searchValue || searchText,
    //   field: selectedField,
    //   timeRange: selectedTimeRange,
    //   sortBy,
    //   page: currentPage,
    //   pageSize
    // });

    setLoading(false);
  };

  // 输入框变化处理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  // 查看文献详情
  const handleViewPaper = (paper: any) => {
    setSelectedPaper(paper);
    setDrawerVisible(true);
  };

  // 页面变化处理
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
    handleSearch();
  };

  // 表格列定义
  const columns = [
    {
      title: '文献信息',
      key: 'info',
      width: '50%',
      render: (_, record: any) => (
        <div style={{ padding: '8px 0' }}>
          <div style={{ marginBottom: '8px' }}>
            <Text strong style={{ fontSize: '14px', display: 'block', lineHeight: '1.4' }}>
              {record.title}
            </Text>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.authors.slice(0, 3).join(', ')}
              {record.authors.length > 3 && `, 等 ${record.authors.length - 3} 人`}
            </Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.abstract.substring(0, 120)}...
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: '发表信息',
      key: 'publish',
      width: '20%',
      render: (_, record: any) => (
        <Space direction="vertical" size="small">
          <div>
            <CalendarOutlined style={{ color: '#666', marginRight: '4px' }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.publishDate}
            </Text>
          </div>
          <div>
            <BookOutlined style={{ color: '#666', marginRight: '4px' }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.venue}
            </Text>
          </div>
          <Tag color="blue" style={{ fontSize: '11px' }}>
            {record.field}
          </Tag>
        </Space>
      ),
    },
    {
      title: '热度指标',
      key: 'metrics',
      width: '15%',
      render: (_, record: any) => (
        <Space direction="vertical" size="small">
          <div>
            <Text type="secondary" style={{ fontSize: '11px' }}>相关度</Text>
            <Progress
              percent={record.relevanceScore}
              size="small"
              showInfo={false}
              strokeColor="#52C41A"
            />
            <Text style={{ fontSize: '11px' }}>{record.relevanceScore}%</Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: '11px' }}>趋势度</Text>
            <Progress
              percent={record.trendingScore}
              size="small"
              showInfo={false}
              strokeColor="#1890FF"
            />
            <Text style={{ fontSize: '11px' }}>{record.trendingScore}%</Text>
          </div>
          <div>
            <Badge count={record.citations} color="#FA8C16" />
            <Text type="secondary" style={{ fontSize: '11px', marginLeft: '4px' }}>
              引用
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: '15%',
      render: (_, record: any) => (
        <Space direction="vertical" size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewPaper(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<LinkOutlined />}
            href={record.pdfUrl}
            target="_blank"
          >
            PDF
          </Button>
          <Space size="small">
            <Button type="text" size="small" icon={<HeartOutlined />} />
            <Button type="text" size="small" icon={<ShareAltOutlined />} />
          </Space>
        </Space>
      ),
    },
  ];

  // 初始化数据
  useEffect(() => {
    setTotal(literatureData.length);
  }, [literatureData]);

  return (
    <SidebarLayout>
      <div className="library-page">
        {/* 页面标题和说明 */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0, marginBottom: '8px' }}>
            📚 文献库 (K-TAS)
          </Title>
          <Text type="secondary">
            知识趋势分析服务 - 基于arXiv数据的文献检索与趋势识别
          </Text>
        </div>

        {/* 热门话题卡片 */}
        <Card
          title={
            <Space>
              <RiseOutlined style={{ color: '#FF6B6B' }} />
              热门研究话题
            </Space>
          }
          style={{ marginBottom: '24px' }}
        >
          <Row gutter={[8, 8]}>
            {trendingTopics.map((topic, index) => (
              <Col key={index} xs={12} sm={8} md={6} lg={3}>
                <Card
                  size="small"
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderColor: topic.color,
                    transition: 'all 0.3s'
                  }}
                  bodyStyle={{ padding: '12px 8px' }}
                  hoverable
                  onClick={() => setSearchText(topic.keyword)}
                >
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: topic.color }}>
                    {topic.keyword}
                  </div>
                  <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                    {topic.count} 篇
                  </div>
                  <div style={{ fontSize: '10px', color: '#52C41A', marginTop: '2px' }}>
                    ↑ {topic.growth}%
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* 搜索和筛选栏 */}
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12}>
              <Input
                placeholder="搜索文献标题、关键词、作者..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={handleInputChange}
                onPressEnter={() => handleSearch()}
                size="large"
              />
            </Col>
            <Col xs={12} md={3}>
              <Select
                placeholder="研究领域"
                value={selectedField}
                onChange={setSelectedField}
                style={{ width: '100%' }}
                allowClear
              >
                <Option value="cs">计算机科学</Option>
                <Option value="physics">物理学</Option>
                <Option value="math">数学</Option>
                <Option value="bio">生物学</Option>
                <Option value="econ">经济学</Option>
              </Select>
            </Col>
            <Col xs={12} md={3}>
              <Select
                value={selectedTimeRange}
                onChange={setSelectedTimeRange}
                style={{ width: '100%' }}
              >
                <Option value="1w">最近一周</Option>
                <Option value="1m">最近一月</Option>
                <Option value="3m">最近三月</Option>
                <Option value="1y">最近一年</Option>
                <Option value="all">全部时间</Option>
              </Select>
            </Col>
            <Col xs={12} md={3}>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: '100%' }}
              >
                <Option value="relevance">相关度</Option>
                <Option value="date">发表时间</Option>
                <Option value="citations">引用次数</Option>
                <Option value="trending">热度</Option>
              </Select>
            </Col>
            <Col xs={12} md={3}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => handleSearch()}
                style={{ width: '100%' }}
                loading={loading}
              >
                搜索
              </Button>
            </Col>
          </Row>
        </Card>

        {/* 搜索结果提示 */}
        {searchText && (
          <Alert
            message={`搜索 "${searchText}" 的结果`}
            description={`共找到 ${total} 篇相关文献`}
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
            closable
            onClose={() => setSearchText('')}
          />
        )}

        {/* 文献列表 */}
        <Card title={`搜索结果 (${total})`}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: '16px' }}>
                <Text type="secondary">正在检索文献...</Text>
              </div>
            </div>
          ) : literatureData.length === 0 ? (
            <Empty
              description="未找到相关文献"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <>
              <Table
                columns={columns}
                dataSource={literatureData}
                rowKey="id"
                pagination={false}
                size="small"
              />
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
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
            </>
          )}
        </Card>

        {/* 文献详情抽屉 */}
        <Drawer
          title="文献详情"
          width={600}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          extra={
            <Space>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                href={selectedPaper?.pdfUrl}
                target="_blank"
              >
                下载PDF
              </Button>
            </Space>
          }
        >
          {selectedPaper && (
            <div>
              <Title level={4} style={{ marginBottom: '16px' }}>
                {selectedPaper.title}
              </Title>

              <Descriptions column={1} bordered size="small" style={{ marginBottom: '16px' }}>
                <Descriptions.Item label="作者">
                  {selectedPaper.authors.join(', ')}
                </Descriptions.Item>
                <Descriptions.Item label="发表日期">
                  {selectedPaper.publishDate}
                </Descriptions.Item>
                <Descriptions.Item label="发表期刊/会议">
                  {selectedPaper.venue}
                </Descriptions.Item>
                <Descriptions.Item label="分类">
                  {selectedPaper.category}
                </Descriptions.Item>
                <Descriptions.Item label="DOI">
                  <a href={`https://doi.org/${selectedPaper.doi}`} target="_blank" rel="noopener noreferrer">
                    {selectedPaper.doi}
                  </a>
                </Descriptions.Item>
                <Descriptions.Item label="引用次数">
                  <Badge count={selectedPaper.citations} color="#FA8C16" />
                </Descriptions.Item>
              </Descriptions>

              <Divider orientation="left">摘要</Divider>
              <Paragraph style={{ textAlign: 'justify', lineHeight: '1.6' }}>
                {selectedPaper.abstract}
              </Paragraph>

              <Divider orientation="left">关键词</Divider>
              <Space wrap>
                {selectedPaper.keywords.map((keyword: string, index: number) => (
                  <Tag
                    key={index}
                    color="blue"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSearchText(keyword)}
                  >
                    {keyword}
                  </Tag>
                ))}
              </Space>
            </div>
          )}
        </Drawer>
      </div>
    </SidebarLayout>
  );
};

export default LibraryPage;
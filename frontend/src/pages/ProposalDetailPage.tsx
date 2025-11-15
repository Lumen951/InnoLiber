/**
 * @file ProposalDetailPage.tsx
 * @description 标书详情页面 - 只读展示标书内容和分析结果
 *
 * <copyright>
 * Copyright (c) 2024-2025 InnoLiber Team
 * Licensed under the MIT License
 * </copyright>
 *
 * <rationale>
 * 设计目的：
 * - 只读方式展示标书完整内容
 * - 显示AI质量分析和建议
 * - 提供导出和分享功能
 * - 展示版本历史和修改记录
 *
 * 与编辑页面的区别：
 * - 无编辑功能，纯展示页面
 * - 重点展示分析结果和质量评分
 * - 导出功能更完善（PDF/Word/LaTeX）
 * - 分享和协作功能
 * </rationale>
 *
 * <design-decision>
 * 为什么单独做详情页而不复用编辑页？
 * - 用户体验：查看和编辑是不同的使用场景
 * - 性能优化：只读页面不需要加载编辑器
 * - 功能差异：详情页重点是展示分析，编辑页重点是内容修改
 * - 权限控制：未来可能有只读权限用户
 * </design-decision>
 *
 * @author InnoLiber Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Typography,
  Space,
  Button,
  Spin,
  Alert,
  Statistic,
  Divider,
  Tag,
  Tooltip,
  Progress,
  Descriptions,
  Tabs,
} from 'antd';
import {
  EditOutlined,
  ArrowLeftOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  PrinterOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import SidebarLayout from '@/components/SidebarLayout';
import QualityScore from '@/components/QualityScore';
import StatusTag from '@/components/StatusTag';
import { proposalService } from '@/services/proposalService';
import type { ProposalDetail } from '@/types';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// ============================================================================
// 类型定义 (Type Definitions)
// ============================================================================

/**
 * AI分析结果
 */
interface AnalysisResult {
  overallScore: number;        // 综合评分
  contentScore: number;        // 内容质量
  formatScore: number;         // 格式规范
  innovationScore: number;     // 创新程度
  suggestions: string[];       // 改进建议
  strengths: string[];         // 优势点
  weaknesses: string[];        // 不足点
  complianceIssues: string[];  // 格式问题
}

/**
 * 页面状态
 */
interface DetailState {
  proposal: ProposalDetail | null;
  analysis: AnalysisResult | null;
}

// ============================================================================
// 主组件 (Main Component)
// ============================================================================

const ProposalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ============================================================================
  // 状态管理 (State Management)
  // ============================================================================

  const [state, setState] = useState<DetailState>({
    proposal: null,
    analysis: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // API 调用函数 (API Functions)
  // ============================================================================

  /**
   * 加载标书数据
   */
  const loadProposal = useCallback(async () => {
    if (!id) {
      setError('标书ID不存在');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await proposalService.getById(id);

      if (response.success && response.data) {
        const proposal = response.data as ProposalDetail;

        // Mock AI分析结果
        const mockAnalysis: AnalysisResult = {
          overallScore: proposal.qualityScore || 7.5,
          contentScore: proposal.qualityScore || 7.5,
          formatScore: proposal.complianceScore || 8.2,
          innovationScore: (proposal.qualityScore || 7.5) + 0.3,
          suggestions: [
            '建议在研究背景部分增加更多国外相关研究的对比分析',
            '研究方法部分可以添加更详细的实验设计方案',
            '预算分配需要更加合理，设备费占比可以适当减少',
            '参考文献应该包含更多近三年的顶级期刊论文'
          ],
          strengths: [
            '研究问题定义清晰，具有重要的理论和实践意义',
            '技术路线合理，方法选择恰当',
            '团队结构合理，研究基础扎实',
            '预期成果明确，可操作性强'
          ],
          weaknesses: [
            '创新点阐述不够突出',
            '风险分析和应对措施较为简单',
            '国际合作部分有待加强',
            '部分技术细节描述不够详细'
          ],
          complianceIssues: [
            '摘要字数超出限制（当前350字，建议控制在300字以内）',
            '参考文献格式不完全符合NSFC要求',
            '图表标题格式需要统一'
          ]
        };

        setState(prev => ({
          ...prev,
          proposal,
          analysis: mockAnalysis,
        }));
      } else {
        throw new Error('加载标书数据失败');
      }
    } catch (err) {
      console.error('加载标书失败:', err);
      setError('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ============================================================================
  // 事件处理函数 (Event Handlers)
  // ============================================================================

  /**
   * 返回列表
   */
  const handleGoBack = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  /**
   * 编辑标书
   */
  const handleEdit = useCallback(() => {
    if (!id) return;
    navigate(`/proposals/${id}/edit`);
  }, [navigate, id]);

  /**
   * 分享标书
   */
  const handleShare = useCallback(() => {
    // TODO: 实现分享功能
    console.log('分享标书');
  }, []);

  /**
   * 导出标书
   */
  const handleExport = useCallback(() => {
    // TODO: 实现导出功能
    console.log('导出标书');
  }, []);

  /**
   * 打印标书
   */
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ============================================================================
  // 生命周期 (Lifecycle)
  // ============================================================================

  useEffect(() => {
    loadProposal();
  }, [loadProposal]);

  // ============================================================================
  // 渲染函数 (Render Functions)
  // ============================================================================

  /**
   * 渲染质量分析卡片
   */
  const renderAnalysisCard = () => {
    if (!state.analysis) return null;

    return (
      <Card title="AI质量分析" style={{ marginBottom: 24 }}>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="综合评分"
                value={state.analysis.overallScore}
                precision={1}
                suffix="/10"
                valueStyle={{
                  color: state.analysis.overallScore >= 7 ? '#3f8600' : '#cf1322'
                }}
              />
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <Statistic
                title="内容质量"
                value={state.analysis.contentScore}
                precision={1}
                suffix="/10"
                valueStyle={{
                  color: state.analysis.contentScore >= 7 ? '#3f8600' : '#cf1322'
                }}
              />
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <Statistic
                title="格式规范"
                value={state.analysis.formatScore}
                precision={1}
                suffix="/10"
                valueStyle={{
                  color: state.analysis.formatScore >= 8 ? '#3f8600' : '#cf1322'
                }}
              />
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <Statistic
                title="创新程度"
                value={state.analysis.innovationScore}
                precision={1}
                suffix="/10"
                valueStyle={{
                  color: state.analysis.innovationScore >= 7 ? '#3f8600' : '#cf1322'
                }}
              />
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="suggestions">
          <TabPane tab="改进建议" key="suggestions">
            <ul>
              {state.analysis.suggestions.map((suggestion, index) => (
                <li key={index} style={{ marginBottom: 8 }}>
                  <ExclamationCircleOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
                  {suggestion}
                </li>
              ))}
            </ul>
          </TabPane>

          <TabPane tab="优势分析" key="strengths">
            <ul>
              {state.analysis.strengths.map((strength, index) => (
                <li key={index} style={{ marginBottom: 8 }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  {strength}
                </li>
              ))}
            </ul>
          </TabPane>

          <TabPane tab="不足分析" key="weaknesses">
            <ul>
              {state.analysis.weaknesses.map((weakness, index) => (
                <li key={index} style={{ marginBottom: 8 }}>
                  <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                  {weakness}
                </li>
              ))}
            </ul>
          </TabPane>

          <TabPane tab="格式问题" key="compliance">
            <ul>
              {state.analysis.complianceIssues.map((issue, index) => (
                <li key={index} style={{ marginBottom: 8 }}>
                  <ExclamationCircleOutlined style={{ color: '#fa541c', marginRight: 8 }} />
                  {issue}
                </li>
              ))}
            </ul>
          </TabPane>
        </Tabs>
      </Card>
    );
  };

  /**
   * 渲染标书内容
   */
  const renderProposalContent = () => {
    if (!state.proposal) return null;

    const sections = [
      { title: '项目摘要', content: state.proposal.content.abstract },
      { title: '研究背景', content: state.proposal.content.background },
      { title: '研究目标', content: state.proposal.content.objectives },
      { title: '研究方法', content: state.proposal.content.methodology },
      { title: '研究计划', content: state.proposal.content.timeline },
      { title: '预算说明', content: state.proposal.content.budget },
      { title: '参考文献', content: state.proposal.content.references },
    ];

    return (
      <Card title="标书内容" style={{ marginBottom: 24 }}>
        {sections.map((section, index) => (
          <div key={index}>
            <Title level={3}>{section.title}</Title>
            <div
              dangerouslySetInnerHTML={{ __html: section.content }}
              style={{
                marginBottom: 32,
                padding: '16px',
                backgroundColor: '#fafafa',
                borderRadius: '6px',
                lineHeight: 1.8
              }}
            />
          </div>
        ))}
      </Card>
    );
  };

  // ============================================================================
  // 主渲染 (Main Render)
  // ============================================================================

  if (loading) {
    return (
      <SidebarLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Spin size="large" />
        </div>
      </SidebarLayout>
    );
  }

  if (error) {
    return (
      <SidebarLayout>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          action={
            <Button size="small" onClick={loadProposal}>
              重试
            </Button>
          }
        />
      </SidebarLayout>
    );
  }

  if (!state.proposal) {
    return (
      <SidebarLayout>
        <Alert message="标书不存在" type="warning" />
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div style={{ padding: '24px' }}>
        {/* 页面标题和操作栏 */}
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
          <Col flex="auto">
            <Space size="middle">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleGoBack}
                style={{ border: 'none', boxShadow: 'none' }}
              >
                返回
              </Button>
              <Divider type="vertical" />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  {state.proposal.title}
                </Title>
                <Space style={{ marginTop: 8 }}>
                  <StatusTag status={state.proposal.status} />
                  <Tag>v{state.proposal.version}</Tag>
                  <QualityScore score={state.proposal.qualityScore || 0} size="small" />
                  <Text type="secondary">
                    创建于 {new Date(state.proposal.createdAt).toLocaleDateString()}
                  </Text>
                </Space>
              </div>
            </Space>
          </Col>

          <Col>
            <Space>
              <Tooltip title="编辑标书">
                <Button icon={<EditOutlined />} onClick={handleEdit}>
                  编辑
                </Button>
              </Tooltip>

              <Tooltip title="分享标书">
                <Button icon={<ShareAltOutlined />} onClick={handleShare}>
                  分享
                </Button>
              </Tooltip>

              <Tooltip title="导出文档">
                <Button icon={<DownloadOutlined />} onClick={handleExport}>
                  导出
                </Button>
              </Tooltip>

              <Tooltip title="打印标书">
                <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                  打印
                </Button>
              </Tooltip>

              <Tooltip title="版本历史">
                <Button icon={<HistoryOutlined />}>
                  历史
                </Button>
              </Tooltip>
            </Space>
          </Col>
        </Row>

        {/* 基本信息 */}
        <Card title="基本信息" style={{ marginBottom: 24 }}>
          <Descriptions column={3}>
            <Descriptions.Item label="研究领域">
              {state.proposal.researchField}
            </Descriptions.Item>
            <Descriptions.Item label="项目状态">
              <StatusTag status={state.proposal.status} />
            </Descriptions.Item>
            <Descriptions.Item label="版本号">
              v{state.proposal.version}
            </Descriptions.Item>
            <Descriptions.Item label="字数统计">
              {state.proposal.wordCount} 字
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(state.proposal.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(state.proposal.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* AI质量分析 */}
        {renderAnalysisCard()}

        {/* 标书内容 */}
        {renderProposalContent()}
      </div>
    </SidebarLayout>
  );
};

export default ProposalDetailPage;
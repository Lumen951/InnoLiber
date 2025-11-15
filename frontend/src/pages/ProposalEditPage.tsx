/**
 * @file ProposalEditPage.tsx
 * @description 标书编辑页面 - 富文本编辑器和实时保存功能
 *
 * <copyright>
 * Copyright (c) 2024-2025 InnoLiber Team
 * Licensed under the MIT License
 * </copyright>
 *
 * <rationale>
 * 设计目的：
 * - 提供富文本编辑器编辑标书内容
 * - 实时自动保存防止数据丢失
 * - 字数统计和格式检查
 * - 支持版本管理和协作编辑
 *
 * 技术选择：
 * - reactjs-tiptap-editor: 现代富文本编辑器，React 19兼容
 * - lodash.debounce: 防抖自动保存，避免频繁API调用
 * - useParams: 获取标书ID
 * - useEffect: 加载初始数据和设置定时保存
 * </rationale>
 *
 * <design-decision>
 * 为什么选择reactjs-tiptap-editor而非react-quill？
 * - React 19兼容：原生支持最新React版本
 * - 现代架构：基于ProseMirror，扩展性强
 * - 学术友好：支持表格、公式等NSFC需要的功能
 * - 性能优秀：虚拟滚动，大文档编辑流畅
 * - TypeScript：完整类型支持，开发体验好
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
  message,
  Spin,
  Alert,
  Statistic,
  Divider,
  Tag,
  Tooltip,
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  HistoryOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import RichTextEditor from 'reactjs-tiptap-editor';
import { BaseKit } from 'reactjs-tiptap-editor';
import 'reactjs-tiptap-editor/style.css';
import { debounce } from 'lodash';
import SidebarLayout from '@/components/SidebarLayout';
import { proposalService } from '@/services/proposalService';
import type { ProposalDetail } from '@/types';

const { Title, Text } = Typography;

// ============================================================================
// 类型定义 (Type Definitions)
// ============================================================================

/**
 * 标书详细内容
 *
 * <rationale>
 * content字段设计：
 * - 使用富文本HTML格式存储，支持格式化
 * - JSON结构化存储不同章节，便于后续AI分析
 * - version字段用于乐观锁，避免并发编辑冲突
 * </rationale>
 */
interface ProposalDetail extends Proposal {
  content: {
    abstract: string;           // 摘要
    background: string;         // 研究背景
    objectives: string;         // 研究目标
    methodology: string;        // 研究方法
    timeline: string;           // 研究计划
    budget: string;             // 预算说明
    references: string;         // 参考文献
  };
  wordCount: number;            // 总字数
  lastAutoSaveAt?: string;      // 最后自动保存时间
}

/**
 * 编辑页面状态
 */
interface EditState {
  proposal: ProposalDetail | null;
  content: string;              // 当前编辑内容
  wordCount: number;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  lastSaveTime: Date | null;
}

// ============================================================================
// TipTap 编辑器配置 (TipTap Editor Configuration)
// ============================================================================

/**
 * TipTap编辑器扩展配置
 *
 * <rationale>
 * 扩展选择原则：
 * - 学术写作友好：支持标题、列表、引用等学术格式
 * - NSFC规范兼容：支持表格、公式等科研必需功能
 * - 避免过度格式化：限制花哨功能，保持专业性
 * - 性能优先：只启用必要扩展，保证编辑流畅
 * </rationale>
 */
const extensions = [
  BaseKit.configure({
    // 占位符配置
    placeholder: {
      showOnlyCurrent: true,
      placeholder: '开始编写您的标书内容...'
    },

    // 字数统计配置
    characterCount: {
      limit: 50000, // NSFC标书建议字数上限
    },
  }),
];

// ============================================================================
// 主组件 (Main Component)
// ============================================================================

const ProposalEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ============================================================================
  // 状态管理 (State Management)
  // ============================================================================

  const [state, setState] = useState<EditState>({
    proposal: null,
    content: '',
    wordCount: 0,
    isSaving: false,
    hasUnsavedChanges: false,
    lastSaveTime: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // 工具函数 (Utility Functions)
  // ============================================================================

  /**
   * 计算纯文本字数（去除HTML标签）
   */
  const getWordCount = useCallback((html: string): number => {
    const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return text.length;
  }, []);

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

        // 构建初始内容（将JSON结构转换为HTML）
        const initialContent = `
          <h1>项目摘要</h1>
          ${proposal.content?.abstract || '<p>请输入项目摘要...</p>'}

          <h1>研究背景</h1>
          ${proposal.content?.background || '<p>请输入研究背景...</p>'}

          <h1>研究目标</h1>
          ${proposal.content?.objectives || '<p>请输入研究目标...</p>'}

          <h1>研究方法</h1>
          ${proposal.content?.methodology || '<p>请输入研究方法...</p>'}

          <h1>研究计划</h1>
          ${proposal.content?.timeline || '<p>请输入研究计划...</p>'}

          <h1>预算说明</h1>
          ${proposal.content?.budget || '<p>请输入预算说明...</p>'}

          <h1>参考文献</h1>
          ${proposal.content?.references || '<p>请输入参考文献...</p>'}
        `.trim();

        setState(prev => ({
          ...prev,
          proposal,
          content: initialContent,
          wordCount: getWordCount(initialContent),
          hasUnsavedChanges: false,
        }));
      } else {
        throw new Error('加载标书数据失败');
      }
    } catch (err) {
      console.error('加载标书失败:', err);
      setError('加载失败，请重试');
      message.error('加载标书失败');
    } finally {
      setLoading(false);
    }
  }, [id, getWordCount]);

  /**
   * 保存标书内容
   */
  const saveProposal = useCallback(async (content: string, showMessage = true) => {
    if (!id || !state.proposal) return;

    try {
      setState(prev => ({ ...prev, isSaving: true }));

      // TODO: 解析content回JSON结构
      const updateData = {
        content: {
          abstract: content, // 简化版，实际需要解析HTML
          background: '',
          objectives: '',
          methodology: '',
          timeline: '',
          budget: '',
          references: '',
        },
        wordCount: getWordCount(content),
        version: state.proposal.version + 1,
      };

      const response = await proposalService.update(id, updateData);

      if (response.success) {
        setState(prev => ({
          ...prev,
          hasUnsavedChanges: false,
          lastSaveTime: new Date(),
          proposal: prev.proposal ? {
            ...prev.proposal,
            version: updateData.version,
            updatedAt: new Date().toISOString(),
          } : null,
        }));

        if (showMessage) {
          message.success('保存成功');
        }
      } else {
        throw new Error('保存失败');
      }
    } catch (err) {
      console.error('保存失败:', err);
      if (showMessage) {
        message.error('保存失败，请重试');
      }
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [id, state.proposal, getWordCount]);

  // ============================================================================
  // 防抖自动保存 (Debounced Auto Save)
  // ============================================================================

  /**
   * 防抖自动保存函数
   *
   * <rationale>
   * - 防抖延迟2秒：平衡用户体验和服务器压力
   * - 仅当有未保存更改时才保存
   * - 静默保存：不显示成功消息，避免干扰用户
   * </rationale>
   */
  const debouncedAutoSave = useCallback(
    debounce(async (content: string) => {
      if (state.hasUnsavedChanges) {
        await saveProposal(content, false); // 静默保存
      }
    }, 2000),
    [saveProposal, state.hasUnsavedChanges]
  );

  // ============================================================================
  // 事件处理函数 (Event Handlers)
  // ============================================================================

  /**
   * 处理内容变化
   */
  const handleContentChange = useCallback((value: string) => {
    const wordCount = getWordCount(value);

    setState(prev => ({
      ...prev,
      content: value,
      wordCount,
      hasUnsavedChanges: true,
    }));

    // 触发自动保存
    debouncedAutoSave(value);
  }, [getWordCount, debouncedAutoSave]);

  /**
   * 手动保存
   */
  const handleManualSave = useCallback(async () => {
    await saveProposal(state.content, true);
  }, [saveProposal, state.content]);

  /**
   * 返回列表
   */
  const handleGoBack = useCallback(() => {
    if (state.hasUnsavedChanges) {
      // TODO: 添加确认对话框
      const confirmed = window.confirm('有未保存的更改，确定要离开吗？');
      if (!confirmed) return;
    }
    navigate('/dashboard');
  }, [navigate, state.hasUnsavedChanges]);

  /**
   * 预览标书
   */
  const handlePreview = useCallback(() => {
    if (!id) return;
    navigate(`/proposals/${id}`);
  }, [navigate, id]);

  // ============================================================================
  // 生命周期 (Lifecycle)
  // ============================================================================

  useEffect(() => {
    loadProposal();
  }, [loadProposal]);

  // 页面离开前检查未保存更改
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '有未保存的更改，确定要离开吗？';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.hasUnsavedChanges]);

  // ============================================================================
  // 渲染 (Render)
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
                <Text type="secondary">
                  最后保存: {state.lastSaveTime ? state.lastSaveTime.toLocaleString() : '未保存'}
                  {state.hasUnsavedChanges && <Tag color="orange" style={{ marginLeft: 8 }}>未保存</Tag>}
                </Text>
              </div>
            </Space>
          </Col>

          <Col>
            <Space>
              <Tooltip title="预览标书">
                <Button icon={<EyeOutlined />} onClick={handlePreview}>
                  预览
                </Button>
              </Tooltip>

              <Tooltip title="版本历史">
                <Button icon={<HistoryOutlined />}>
                  历史
                </Button>
              </Tooltip>

              <Button
                type="primary"
                icon={state.isSaving ? <CloudUploadOutlined /> : <SaveOutlined />}
                loading={state.isSaving}
                onClick={handleManualSave}
              >
                {state.isSaving ? '保存中' : '保存'}
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 统计信息 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总字数"
                value={state.wordCount}
                suffix="字"
                valueStyle={{ color: state.wordCount >= 8000 ? '#3f8600' : '#cf1322' }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                建议: 8000-10000字
              </Text>
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <Statistic
                title="版本号"
                value={state.proposal.version}
                prefix="v"
              />
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <Statistic
                title="质量评分"
                value={state.proposal.qualityScore || 0}
                precision={1}
                suffix="/10"
                valueStyle={{
                  color: (state.proposal.qualityScore || 0) >= 7 ? '#3f8600' : '#cf1322'
                }}
              />
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <Statistic
                title="格式规范"
                value={state.proposal.complianceScore || 0}
                precision={1}
                suffix="/10"
                valueStyle={{
                  color: (state.proposal.complianceScore || 0) >= 8 ? '#3f8600' : '#cf1322'
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* TipTap富文本编辑器 */}
        <Card title="标书内容" style={{ minHeight: '60vh' }}>
          <RichTextEditor
            output="html"
            content={state.content}
            onChangeContent={handleContentChange}
            extensions={extensions}
            minHeight="500px"
            maxHeight="600px"
            contentClass="proposal-content"
          />
        </Card>

        {/* 自动保存提示 */}
        {state.hasUnsavedChanges && (
          <Alert
            message="文档已修改"
            description="内容将在2秒后自动保存，或点击保存按钮立即保存。"
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </div>
    </SidebarLayout>
  );
};

export default ProposalEditPage;
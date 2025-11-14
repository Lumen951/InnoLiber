/**
 * @file ProposalCreatePage.tsx
 * @description 新建标书页面 - 创建NSFC申请书的入口页面
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
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Card,
  Typography,
  Space,
  message,
  Divider,
} from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SidebarLayout from '@/components/SidebarLayout';
import {
  RESEARCH_FIELD_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  YEAR_OPTIONS,
  FUNDING_OPTIONS_BY_TYPE,
  DEFAULT_FUNDING_OPTIONS,
  DURATION_OPTIONS_BY_TYPE,
  DEFAULT_DURATION_OPTIONS,
  getRecommendedFunding,
  getRecommendedDuration,
} from '@/constants/options';
import { proposalService } from '@/services/proposalService';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ============================================================================
// 表单验证模式 (Form Validation Schema)
// ============================================================================

/**
 * 新建标书表单验证规则
 *
 * <rationale>
 * 验证规则基于NSFC申请书要求：
 * - 标题长度：10-100字符（中文标题通常20-50字）
 * - 摘要长度：200-300字（NSFC要求）
 * - 关键词：最多5个（NSFC标准）
 * - 金额和周期：根据项目类型动态验证
 * </rationale>
 */
const proposalCreateSchema = z.object({
  title: z
    .string()
    .min(10, '标题至少10个字符')
    .max(100, '标题最多100个字符'),
  field: z.string().min(1, '请选择研究领域'),
  type: z.enum(['面上项目', '青年项目', '重点项目'], {
    errorMap: () => ({ message: '请选择项目类型' }),
  }),
  year: z.number({ invalid_type_error: '请选择申请年度' }),
  institution: z.string().min(2, '请输入申请单位'),
  funding: z.number().positive('金额必须大于0'),
  duration: z.number().min(1, '周期至少1年').max(5, '周期最多5年'),
  keywords: z.string().min(1, '请输入研究关键词'),
  abstract: z
    .string()
    .min(200, '摘要至少200个字符')
    .max(300, '摘要最多300个字符'),
});

type ProposalCreateFormData = z.infer<typeof proposalCreateSchema>;

// ============================================================================
// 组件定义 (Component Definition)
// ============================================================================

const ProposalCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedProjectType, setSelectedProjectType] = useState<string>('');

  // React Hook Form 初始化
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProposalCreateFormData>({
    resolver: zodResolver(proposalCreateSchema),
    defaultValues: {
      year: YEAR_OPTIONS[0]?.value as number,
      funding: 80,
      duration: 4,
    },
  });

  // 监听项目类型变化
  const projectType = watch('type');

  useEffect(() => {
    if (projectType && projectType !== selectedProjectType) {
      setSelectedProjectType(projectType);
      // 自动设置推荐金额和周期
      setValue('funding', getRecommendedFunding(projectType));
      setValue('duration', getRecommendedDuration(projectType));
    }
  }, [projectType, selectedProjectType, setValue]);

  // 获取当前项目类型对应的金额选项
  const fundingOptions =
    selectedProjectType && FUNDING_OPTIONS_BY_TYPE[selectedProjectType]
      ? FUNDING_OPTIONS_BY_TYPE[selectedProjectType]
      : DEFAULT_FUNDING_OPTIONS;

  // 获取当前项目类型对应的周期选项
  const durationOptions =
    selectedProjectType && DURATION_OPTIONS_BY_TYPE[selectedProjectType]
      ? DURATION_OPTIONS_BY_TYPE[selectedProjectType]
      : DEFAULT_DURATION_OPTIONS;

  /**
   * 处理表单提交
   */
  const onSubmit = async (data: ProposalCreateFormData) => {
    setLoading(true);
    try {
      // 处理关键词（将空格分隔的字符串转换为数组）
      const keywordsArray = data.keywords
        .split(/\s+/)
        .filter((k) => k.length > 0)
        .slice(0, 5);

      if (keywordsArray.length === 0) {
        message.error('请至少输入一个关键词');
        setLoading(false);
        return;
      }

      // 调用API创建标书
      const requestData: import('@/types').ProposalCreateRequest = {
        title: data.title,
        researchField: data.field,
        projectType: data.type,
        year: data.year,
        institution: data.institution,
        funding: data.funding,
        duration: data.duration,
        keywords: keywordsArray,
        abstract: data.abstract,
        status: 'draft', // 新建标书默认为草稿状态
      };

      const response = await proposalService.create(requestData);

      if (response.success) {
        message.success(response.message || '标书创建成功！');
        // 跳转到编辑页面
        navigate(`/proposals/${response.data.proposalId}/edit`);
      } else {
        throw new Error('创建失败');
      }
    } catch (error) {
      console.error('创建标书失败:', error);
      message.error('创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理取消操作
   */
  const handleCancel = () => {
    navigate('/');
  };

  /**
   * AI辅助生成摘要（占位功能）
   */
  const handleAIGenerate = () => {
    message.info('AI辅助生成功能即将上线，敬请期待！');
  };

  return (
    <SidebarLayout>
      <div style={{ padding: '24px' }}>
        {/* 页面标题 */}
        <Title level={2}>新建申请书</Title>
        <Divider />

        {/* 表单容器 */}
        <Card style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
            {/* 基本信息标题 */}
            <Title level={4}>基本信息</Title>

            {/* 标书标题 */}
            <Form.Item
              label="标书标题"
              required
              validateStatus={errors.title ? 'error' : ''}
              help={errors.title?.message}
            >
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="请输入标书标题（建议20-50字）"
                    size="large"
                    count={{ show: true, max: 100 }}
                  />
                )}
              />
            </Form.Item>

            {/* 第一行：研究领域、项目类型、申请年度 */}
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  label="研究领域"
                  required
                  validateStatus={errors.field ? 'error' : ''}
                  help={errors.field?.message}
                >
                  <Controller
                    name="field"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="请选择研究领域"
                        size="large"
                        options={RESEARCH_FIELD_OPTIONS}
                      />
                    )}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  label="项目类型"
                  required
                  validateStatus={errors.type ? 'error' : ''}
                  help={errors.type?.message}
                >
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="请选择项目类型"
                        size="large"
                        options={PROJECT_TYPE_OPTIONS}
                      />
                    )}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  label="申请年度"
                  required
                  validateStatus={errors.year ? 'error' : ''}
                  help={errors.year?.message}
                >
                  <Controller
                    name="year"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="请选择申请年度"
                        size="large"
                        options={YEAR_OPTIONS}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* 第二行：申请单位、申请金额、项目周期 */}
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  label="申请单位"
                  validateStatus={errors.institution ? 'error' : ''}
                  help={errors.institution?.message}
                >
                  <Controller
                    name="institution"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="输入单位名称"
                        size="large"
                      />
                    )}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  label="申请金额"
                  validateStatus={errors.funding ? 'error' : ''}
                  help={errors.funding?.message}
                >
                  <Controller
                    name="funding"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="请选择金额"
                        size="large"
                        options={fundingOptions}
                      />
                    )}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  label="项目周期"
                  validateStatus={errors.duration ? 'error' : ''}
                  help={errors.duration?.message}
                >
                  <Controller
                    name="duration"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="请选择周期"
                        size="large"
                        options={durationOptions}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* 研究关键词 */}
            <Form.Item
              label="研究关键词（用空格分隔，最多5个）"
              required
              validateStatus={errors.keywords ? 'error' : ''}
              help={errors.keywords?.message}
            >
              <Controller
                name="keywords"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="例如: 大语言模型 多智能体 协作框架"
                    size="large"
                  />
                )}
              />
            </Form.Item>

            {/* 研究摘要 */}
            <Form.Item
              label="研究摘要（200-300字）"
              required
              validateStatus={errors.abstract ? 'error' : ''}
              help={errors.abstract?.message}
            >
              <Controller
                name="abstract"
                control={control}
                render={({ field }) => (
                  <TextArea
                    {...field}
                    rows={6}
                    placeholder="请简要描述您的研究内容、目标和意义..."
                    showCount
                    maxLength={300}
                  />
                )}
              />
              <Button
                type="link"
                onClick={handleAIGenerate}
                style={{ marginTop: 8 }}
              >
                ✨ AI辅助生成摘要
              </Button>
            </Form.Item>

            {/* 提示信息 */}
            <div
              style={{
                padding: 16,
                background: '#f0f8ff',
                borderRadius: 4,
                marginBottom: 24,
              }}
            >
              <Text type="secondary">
                💡 提示：填写基本信息后，系统将为您创建标书框架并提供智能建议
              </Text>
            </div>

            {/* 操作按钮 */}
            <Form.Item>
              <Space size="middle">
                <Button size="large" onClick={handleCancel}>
                  取消
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                >
                  创建标书
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </SidebarLayout>
  );
};

export default ProposalCreatePage;

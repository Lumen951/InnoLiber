/**
 * @file StatusTag.tsx
 * @description 标书状态标签组件 - 可视化标书生命周期状态
 *
 * <copyright>
 * Copyright (c) 2024-2025 InnoLiber Team
 * Licensed under the MIT License
 * </copyright>
 *
 * @author InnoLiber Team
 * @version 1.0.0
 */

import React from 'react';
import { Tag } from 'antd';
import type { TagProps } from 'antd';
import { ClockCircleOutlined, EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';

/**
 * 状态标签组件属性接口
 *
 * <rationale>
 * 状态枚举设计：
 * - draft: 草稿编辑阶段
 * - reviewing: AI分析处理中（锁定状态）
 * - completed: 分析完成，可查看报告
 * - submitted: 已提交NSFC，流程结束
 * </rationale>
 *
 * @property {string} status - 标书状态（严格枚举类型）
 */
interface StatusTagProps {
  status: 'draft' | 'reviewing' | 'completed' | 'submitted';
}

/**
 * 状态配置映射表
 *
 * <rationale>
 * 配置驱动设计：
 * - 集中管理状态的视觉表现（颜色、文本、图标）
 * - 便于状态系统扩展和视觉风格调整
 * - color 使用 Ant Design 预设颜色，保持设计系统一致性
 * </rationale>
 *
 * <warning type="design">
 * ⚠️ 颜色语义说明：
 * - default(灰色): 初始/未完成状态
 * - processing(蓝色): 进行中状态
 * - success(绿色): 完成状态
 * - warning(橙色): 已提交但需注意（不可逆）
 * </warning>
 */
const statusConfig: Record<string, { color: TagProps['color']; text: string; icon?: React.ReactNode }> = {
  draft: {
    color: 'default',
    text: '草稿中',
    icon: <ClockCircleOutlined />,
  },
  reviewing: {
    color: 'processing',
    text: '审阅中',
    icon: <EyeOutlined />,
  },
  completed: {
    color: 'success',
    text: '已完成',
    icon: <CheckCircleOutlined />,
  },
  submitted: {
    color: 'warning',
    text: '已提交',
    icon: <CheckCircleOutlined />,
  },
};

/**
 * 状态标签组件 - 标书状态可视化指示器
 *
 * <rationale>
 * 容错设计：
 * - 使用 fallback 机制（|| statusConfig.draft），防止无效状态导致崩溃
 * - 保证在任何情况下都有合理的UI表现
 * </rationale>
 *
 * @param props - 组件属性
 * @returns 状态标签组件
 *
 * @example
 * ```tsx
 * // 不同状态的使用示例
 * <StatusTag status="draft" />     // 灰色-草稿中
 * <StatusTag status="reviewing" /> // 蓝色-审阅中
 * <StatusTag status="completed" /> // 绿色-已完成
 * <StatusTag status="submitted" /> // 橙色-已提交
 * ```
 */
export const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  // 状态配置查找，带容错机制
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Tag color={config.color} icon={config.icon}>
      {config.text}
    </Tag>
  );
};

export default StatusTag;
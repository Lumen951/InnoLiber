// 状态标签组件
import React from 'react';
import { Tag } from 'antd';
import type { TagProps } from 'antd';
import { ClockCircleOutlined, EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';

interface StatusTagProps {
  status: 'draft' | 'reviewing' | 'completed' | 'submitted';
}

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

export const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Tag color={config.color} icon={config.icon}>
      {config.text}
    </Tag>
  );
};

export default StatusTag;
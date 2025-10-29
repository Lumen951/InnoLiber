// 标书卡片组件
import React from 'react';
import { Card, Button, Space, Tooltip } from 'antd';
import {
  EditOutlined,
  BarChartOutlined,
  ExportOutlined,
  DeleteOutlined,
  DownloadOutlined,
  HistoryOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ProposalCard as ProposalCardType } from '@/types';
import StatusTag from './StatusTag';
import QualityScore from './QualityScore';

interface ProposalCardProps {
  proposal: ProposalCardType;
  onEdit?: (proposal: ProposalCardType) => void;
  onDelete?: (proposal: ProposalCardType) => void;
  onAnalyze?: (proposal: ProposalCardType) => void;
  onExport?: (proposal: ProposalCardType) => void;
  onView?: (proposal: ProposalCardType) => void;
}

const ProposalCardComponent: React.FC<ProposalCardProps> = ({
  proposal,
  onEdit,
  onDelete,
  onAnalyze,
  onExport,
  onView,
}) => {
  // 根据状态显示不同的操作按钮
  const renderActions = () => {
    const actions = [];

    if (proposal.status === 'draft') {
      actions.push(
        <Tooltip title="继续编辑" key="edit">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit?.(proposal)}
          >
            继续编辑
          </Button>
        </Tooltip>,
        <Tooltip title="质量分析" key="analyze">
          <Button
            icon={<BarChartOutlined />}
            onClick={() => onAnalyze?.(proposal)}
          >
            质量分析
          </Button>
        </Tooltip>
      );
    }

    if (proposal.status === 'reviewing') {
      actions.push(
        <Tooltip title="查看详情" key="view">
          <Button icon={<EyeOutlined />} onClick={() => onView?.(proposal)}>
            查看详情
          </Button>
        </Tooltip>
      );
    }

    if (proposal.status === 'completed' || proposal.status === 'submitted') {
      actions.push(
        <Tooltip title="下载PDF" key="download">
          <Button icon={<DownloadOutlined />} onClick={() => onExport?.(proposal)}>
            下载PDF
          </Button>
        </Tooltip>
      );
    }

    // 通用操作
    if (proposal.status !== 'submitted') {
      actions.push(
        <Tooltip title="导出" key="export">
          <Button icon={<ExportOutlined />} onClick={() => onExport?.(proposal)}>
            导出
          </Button>
        </Tooltip>
      );

      if (proposal.status === 'draft') {
        actions.push(
          <Tooltip title="删除" key="delete">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete?.(proposal)}
            >
              删除
            </Button>
          </Tooltip>
        );
      }
    }

    return actions;
  };

  return (
    <Card
      className="proposal-card"
      size="default"
      title={
        <div className="card-title">
          <span>{proposal.title}</span>
          <StatusTag status={proposal.status} />
        </div>
      }
      extra={
        <QualityScore
          score={proposal.qualityScore}
          contentScore={proposal.contentScore}
          formatScore={proposal.formatScore}
          innovationScore={proposal.innovationScore}
        />
      }
    >
      <div className="card-content">
        <div className="meta-info">
          <p>
            <strong>研究领域:</strong> {proposal.researchField}
          </p>
          <p>
            <strong>创建时间:</strong> {new Date(proposal.createdAt).toLocaleDateString('zh-CN')}
          </p>
          {proposal.updatedAt !== proposal.createdAt && (
            <p>
              <strong>最后编辑:</strong> {new Date(proposal.updatedAt).toLocaleDateString('zh-CN')}
            </p>
          )}
          {proposal.submittedAt && (
            <p>
              <strong>提交时间:</strong> {new Date(proposal.submittedAt).toLocaleDateString('zh-CN')}
            </p>
          )}
        </div>

        <div className="card-actions">
          <Space wrap>{renderActions()}</Space>
        </div>
      </div>
    </Card>
  );
};

export default ProposalCardComponent;
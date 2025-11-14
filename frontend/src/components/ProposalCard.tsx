/**
 * @file ProposalCard.tsx
 * @description 标书卡片组件 - 状态感知的标书操作界面
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

/**
 * 标书卡片组件属性接口
 *
 * <rationale>
 * 可选回调设计：
 * - 父组件决定支持哪些操作（不是所有场景都需要删除功能）
 * - 避免空操作按钮显示，提升用户体验
 * </rationale>
 *
 * @property {ProposalCardType} proposal - 标书数据（包含状态和评分）
 * @property {function} [onEdit] - 编辑回调（草稿状态）
 * @property {function} [onDelete] - 删除回调（仅草稿）
 * @property {function} [onAnalyze] - AI分析回调（触发质量评估）
 * @property {function} [onExport] - 导出回调（支持多格式）
 * @property {function} [onView] - 查看回调（审阅中的只读模式）
 */
interface ProposalCardProps {
  proposal: ProposalCardType;
  onEdit?: (proposal: ProposalCardType) => void;
  onDelete?: (proposal: ProposalCardType) => void;
  onAnalyze?: (proposal: ProposalCardType) => void;
  onExport?: (proposal: ProposalCardType) => void;
  onView?: (proposal: ProposalCardType) => void;
}

/**
 * 标书卡片组件 - 状态驱动的操作界面
 *
 * <rationale>
 * 状态驱动设计：
 * - 每种标书状态显示对应操作按钮，防止无效操作
 * - draft: 编辑+分析+删除；reviewing: 仅查看；completed/submitted: 下载+导出
 * - 避免用户困惑，明确当前可执行的操作
 * </rationale>
 *
 * <warning type="UX">
 * ⚠️ submitted状态严格只读：已提交NSFC的标书禁止再次编辑或删除
 * </warning>
 *
 * @param props - 组件属性
 * @returns React组件
 */
const ProposalCardComponent: React.FC<ProposalCardProps> = ({
  proposal,
  onEdit,
  onDelete,
  onAnalyze,
  onExport,
  onView,
}) => {
  /**
   * 状态感知的动作按钮渲染
   *
   * <rationale>
   * 条件渲染逻辑：
   * - 避免显示无效按钮（如对submitted状态显示"删除"）
   * - 主要操作在前（编辑按钮使用primary样式）
   * - 危险操作有视觉区分（删除按钮danger样式）
   * </rationale>
   *
   * @returns 动态操作按钮数组
   */
  const renderActions = () => {
    const actions = [];

    // 草稿状态：主要编辑操作
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

    // 审阅中状态：只允许查看
    if (proposal.status === 'reviewing') {
      actions.push(
        <Tooltip title="查看详情" key="view">
          <Button icon={<EyeOutlined />} onClick={() => onView?.(proposal)}>
            查看详情
          </Button>
        </Tooltip>
      );
    }

    // 完成/已提交：下载功能
    if (proposal.status === 'completed' || proposal.status === 'submitted') {
      actions.push(
        <Tooltip title="下载PDF" key="download">
          <Button icon={<DownloadOutlined />} onClick={() => onExport?.(proposal)}>
            下载PDF
          </Button>
        </Tooltip>
      );
    }

    // 通用操作（排除已提交状态）
    if (proposal.status !== 'submitted') {
      actions.push(
        <Tooltip title="导出" key="export">
          <Button icon={<ExportOutlined />} onClick={() => onExport?.(proposal)}>
            导出
          </Button>
        </Tooltip>
      );

      // 危险操作：仅草稿可删除
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
        /**
         * 质量评分组件
         * <rationale>
         * 放在Card.extra位置：
         * - 视觉上与标题平齐，重要信息突出显示
         * - 避免与操作按钮竞争注意力
         * </rationale>
         */
        <QualityScore
          score={proposal.qualityScore}
          contentScore={proposal.contentScore}
          formatScore={proposal.formatScore}
          innovationScore={proposal.innovationScore}
        />
      }
    >
      <div className="card-content">
        {/* 元数据信息区域 */}
        <div className="meta-info">
          <p>
            <strong>研究领域:</strong> {proposal.researchField}
          </p>
          <p>
            <strong>创建时间:</strong> {new Date(proposal.createdAt).toLocaleDateString('zh-CN')}
          </p>
          {/* 条件显示：避免创建时间重复 */}
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

        {/* 动态操作按钮区域 */}
        <div className="card-actions">
          <Space wrap>{renderActions()}</Space>
        </div>
      </div>
    </Card>
  );
};

export default ProposalCardComponent;
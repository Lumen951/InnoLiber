/**
 * @file QualityScore.tsx
 * @description 质量评分组件 - 多维度质量指标可视化显示
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
import { Card, Progress } from 'antd';
import { StarFilled } from '@ant-design/icons';

/**
 * 质量评分组件属性接口
 *
 * <rationale>
 * 可选属性设计：
 * - score: 综合质量分数（SPG-S服务计算）
 * - 三个细分分数：内容50% + 格式30% + 创新20%（权重计算）
 * - 默认值0：防止未评分状态显示异常
 * </rationale>
 *
 * <warning type="data">
 * ⚠️ 分数范围：所有分数应在 0-10 之间
 * 前端需要验证数据有效性，防止显示错误的进度条百分比
 * </warning>
 *
 * @property {number} [score] - 综合质量分数（0-10）
 * @property {number} [contentScore] - 内容质量分数（0-10）
 * @property {number} [formatScore] - 格式规范分数（0-10）
 * @property {number} [innovationScore] - 创新程度分数（0-10）
 */
interface QualityScoreProps {
  score?: number;
  contentScore?: number;
  formatScore?: number;
  innovationScore?: number;
}

/**
 * 质量评分组件 - 星级评分 + 进度条详细分析
 *
 * <rationale>
 * 双重显示设计：
 * - 星级评分：直观的等级感知（5星制，对应10分制）
 * - 进度条详情：三个维度的精确百分比显示
 * - 不同颜色区分维度：橙色(内容) + 蓝色(格式) + 绿色(创新)
 * </rationale>
 *
 * @param props - 组件属性
 * @returns 质量评分可视化组件
 */
const QualityScore: React.FC<QualityScoreProps> = ({
  score,
  contentScore = 0,
  formatScore = 0,
  innovationScore = 0,
}) => {
  /**
   * 星级评分渲染函数
   *
   * <rationale>
   * 5星制映射：
   * - 10分制转5星制：score/2（如8.5分 = 4.25星）
   * - 半星处理：余数≥0.5显示半透明星星
   * - 空星用灰色填充：提供完整的5星框架参考
   * </rationale>
   *
   * @param score - 分数值（0-10）
   * @returns 星星图标数组
   */
  const renderStars = (score: number) => {
    const stars = [];
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;

    // 渲染5颗星星（满星 + 半星 + 空星）
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        // 满星：金黄色
        stars.push(
          <StarFilled key={i} style={{ color: '#F59E0B', fontSize: '14px' }} />
        );
      } else if (i === fullStars && hasHalfStar) {
        // 半星：半透明效果
        stars.push(
          <StarFilled key={i} style={{ color: '#F59E0B', fontSize: '14px', opacity: 0.5 }} />
        );
      } else {
        // 空星：灰色
        stars.push(
          <StarFilled key={i} style={{ color: '#D1D5DB', fontSize: '14px' }} />
        );
      }
    }
    return stars;
  };

  return (
    <div className="quality-score">
      {/*
       * 综合评分显示区域
       * <rationale>
       * 显示逻辑：
       * - 星级评分：10分制除以2转为5星制，便于用户理解
       * - 数值显示：保留1位小数，精确反映质量等级
       * - 容错处理：未评分时显示"0.0/10"而非空白
       * </rationale>
       */}
      <div className="score-display">
        <div className="stars">
          {renderStars((score || 0) / 2)}
        </div>
        <span className="score-text">{score?.toFixed(1) || '0.0'}/10</span>
      </div>

      {/*
       * 详细分数分解区域
       * <rationale>
       * 三维度评分：
       * - 内容质量：文献引用、逻辑结构、创新性论述（权重50%）
       * - 格式规范：NSFC格式要求、排版规范、图表标准（权重30%）
       * - 创新程度：研究新颖性、方法创新、预期突破（权重20%）
       * - 颜色语义：橙色(内容-温暖) + 蓝色(格式-理性) + 绿色(创新-希望)
       * </rationale>
       */}
      <div className="score-details">
        {/* 内容质量 - 橙色主题 */}
        <div className="score-item">
          <span className="label">内容</span>
          <Progress
            percent={contentScore}
            size="small"
            strokeColor={{
              '0%': '#F59E0B',
              '100%': '#F59E0B',
            }}
          />
        </div>
        {/* 格式规范 - 蓝色主题 */}
        <div className="score-item">
          <span className="label">格式</span>
          <Progress
            percent={formatScore}
            size="small"
            strokeColor={{
              '0%': '#1E3A8A',
              '100%': '#1E3A8A',
            }}
          />
        </div>
        {/* 创新程度 - 绿色主题 */}
        <div className="score-item">
          <span className="label">创新</span>
          <Progress
            percent={innovationScore}
            size="small"
            strokeColor={{
              '0%': '#10B981',
              '100%': '#10B981',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default QualityScore;
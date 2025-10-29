// 质量评分组件
import React from 'react';
import { Card, Progress } from 'antd';
import { StarFilled } from '@ant-design/icons';

interface QualityScoreProps {
  score?: number;
  contentScore?: number;
  formatScore?: number;
  innovationScore?: number;
}

const QualityScore: React.FC<QualityScoreProps> = ({
  score,
  contentScore = 0,
  formatScore = 0,
  innovationScore = 0,
}) => {
  // 生成星星显示
  const renderStars = (score: number) => {
    const stars = [];
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarFilled key={i} style={{ color: '#F59E0B', fontSize: '14px' }} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <StarFilled key={i} style={{ color: '#F59E0B', fontSize: '14px', opacity: 0.5 }} />
        );
      } else {
        stars.push(
          <StarFilled key={i} style={{ color: '#D1D5DB', fontSize: '14px' }} />
        );
      }
    }
    return stars;
  };

  return (
    <div className="quality-score">
      <div className="score-display">
        <div className="stars">
          {renderStars((score || 0) / 2)}
        </div>
        <span className="score-text">{score?.toFixed(1) || '0.0'}/10</span>
      </div>

      <div className="score-details">
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
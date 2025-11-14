/**
 * @file PasswordStrength.tsx
 * @description 密码强度可视化指示器组件
 * 显示密码强度等级和颜色提示
 */

import React from 'react';
import { Progress } from 'antd';
import {
  calculatePasswordStrength,
  PasswordStrength as PasswordStrengthEnum,
  PASSWORD_STRENGTH_TEXT,
  PASSWORD_STRENGTH_COLOR,
} from '../utils/validators';

interface PasswordStrengthProps {
  password: string;
  showText?: boolean;
}

/**
 * 密码强度指示器组件
 *
 * 功能：
 * - 实时计算密码强度（0-4级）
 * - 显示进度条和文字提示
 * - 根据强度显示不同颜色
 *
 * @param password - 密码值
 * @param showText - 是否显示文字提示（默认true）
 */
export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  showText = true,
}) => {
  // 计算密码强度
  const strength = calculatePasswordStrength(password);

  // 转换为百分比（0-100）
  const percent = (strength / 4) * 100;

  // 获取对应颜色
  const color = PASSWORD_STRENGTH_COLOR[strength];

  // 获取对应文字
  const text = PASSWORD_STRENGTH_TEXT[strength];

  // 如果密码为空，不显示
  if (!password) {
    return null;
  }

  return (
    <div style={{ marginTop: 8 }}>
      <Progress
        percent={percent}
        strokeColor={color}
        showInfo={false}
        size="small"
      />
      {showText && (
        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            color: color,
          }}
        >
          密码强度：{text}
        </div>
      )}
    </div>
  );
};

export default PasswordStrength;

/**
 * @file CaptchaPlaceholder.tsx
 * @description 验证码组件占位符（预留阿里云滑动拼图验证）
 * MVP阶段不启用，Phase 3.5集成阿里云验证码2.0
 */

import React from 'react';
import { Alert } from 'antd';

interface CaptchaPlaceholderProps {
  onVerify?: (token: string) => void;
}

/**
 * 验证码占位组件
 *
 * TODO-ALIYUN: [滑动拼图验证] - 集成阿里云验证码2.0
 * 依赖：
 *   1. 阿里云账号开通验证码2.0服务
 *   2. 创建验证配置（场景：注册、登录）
 *   3. 安装SDK: npm install @alicloud/captcha-sdk
 *   4. 获取AppKey和SecretKey
 *   5. 前端集成滑动拼图UI
 *   6. 后端验证逻辑实现
 * 预计工作量：2-3小时
 * 优先级：P1
 * 参考文档：https://help.aliyun.com/product/28308.html
 *
 * 实现步骤：
 * 1. 安装SDK并引入组件
 * 2. 替换此占位符为实际验证码组件
 * 3. 处理验证成功回调
 * 4. 集成到注册/登录流程
 *
 * 使用示例（未来实现）：
 * ```tsx
 * import { AliCaptcha } from '@alicloud/captcha-sdk';
 *
 * <AliCaptcha
 *   appKey={import.meta.env.VITE_ALIYUN_CAPTCHA_APP_KEY}
 *   scene="register"
 *   onVerify={(token) => {
 *     console.log('验证成功:', token);
 *     onVerify?.(token);
 *   }}
 * />
 * ```
 */
export const CaptchaPlaceholder: React.FC<CaptchaPlaceholderProps> = ({ onVerify }) => {
  // MVP阶段：显示提示信息
  return (
    <Alert
      message="人机验证"
      description="MVP阶段暂未启用验证码，Phase 3.5将集成阿里云滑动拼图验证"
      type="info"
      showIcon
      style={{ marginBottom: 16 }}
    />
  );

  // 未来实现（取消注释）：
  // return (
  //   <div style={{ marginBottom: 16 }}>
  //     <AliCaptcha
  //       appKey={import.meta.env.VITE_ALIYUN_CAPTCHA_APP_KEY}
  //       scene="register"
  //       onVerify={(token) => {
  //         console.log('验证成功:', token);
  //         onVerify?.(token);
  //       }}
  //       onError={(error) => {
  //         console.error('验证失败:', error);
  //       }}
  //     />
  //   </div>
  // );
};

export default CaptchaPlaceholder;

/**
 * @file LoginPage.tsx
 * @description 用户登录页面
 * 左右分栏布局（桌面端）/ 单列布局（移动端）
 */

import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, message, Row, Col, Grid } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import { isValidEmail } from '../utils/validators';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

/**
 * 登录表单验证Schema
 */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, '请输入邮箱')
    .refine((val) => isValidEmail(val), '邮箱格式不正确'),
  password: z.string().min(1, '请输入密码'),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * 登录页面组件
 *
 * 功能：
 * - 邮箱+密码登录
 * - 记住我功能（7天免登录）
 * - 响应式布局
 * - 表单验证
 */
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  /**
   * 处理登录提交
   */
  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await login(data.email, data.password, data.remember);
      message.success('登录成功！');
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  // 判断是否为移动端
  const isMobile = !screens.md;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: '#f0f2f5',
      }}
    >
      <Row style={{ width: '100%', margin: 0 }}>
        {/* 左侧品牌展示区（仅桌面端） */}
        {!isMobile && (
          <Col
            xs={0}
            md={12}
            style={{
              background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 48,
              color: 'white',
            }}
          >
            <Title level={1} style={{ color: 'white', marginBottom: 16 }}>
              InnoLiber
            </Title>
            <Title level={3} style={{ color: 'white', fontWeight: 'normal' }}>
              科研基金申请智能助理系统
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 24, fontSize: 16 }}>
              AI驱动的NSFC申请书智能优化平台
            </Text>
          </Col>
        )}

        {/* 右侧登录表单区 */}
        <Col
          xs={24}
          md={12}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isMobile ? 24 : 48,
          }}
        >
          <div style={{ width: '100%', maxWidth: 400 }}>
            {/* 移动端显示Logo */}
            {isMobile && (
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <Title level={2}>InnoLiber</Title>
                <Text type="secondary">科研基金申请智能助理</Text>
              </div>
            )}

            <Title level={2} style={{ marginBottom: 8 }}>
              登录
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 32 }}>
              欢迎回来，请登录您的账户
            </Text>

            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
              {/* 邮箱输入 */}
              <Form.Item
                label="邮箱"
                validateStatus={errors.email ? 'error' : ''}
                help={errors.email?.message}
              >
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      prefix={<MailOutlined />}
                      placeholder="请输入邮箱"
                      size="large"
                      autoComplete="email"
                    />
                  )}
                />
              </Form.Item>

              {/* 密码输入 */}
              <Form.Item
                label="密码"
                validateStatus={errors.password ? 'error' : ''}
                help={errors.password?.message}
              >
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      prefix={<LockOutlined />}
                      placeholder="请输入密码"
                      size="large"
                      autoComplete="current-password"
                    />
                  )}
                />
              </Form.Item>

              {/* 记住我 & 忘记密码 */}
              <Form.Item>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Controller
                    name="remember"
                    control={control}
                    render={({ field }) => (
                      <Checkbox checked={field.value} onChange={field.onChange}>
                        记住我
                      </Checkbox>
                    )}
                  />
                  {/* TODO-ALIYUN: [忘记密码] - 实现密码重置功能
                      依赖：阿里云DirectMail邮件服务
                      预计工作量：1小时
                      优先级：P2 */}
                  <Link to="/forgot-password" style={{ color: '#1E3A8A' }}>
                    忘记密码？
                  </Link>
                </div>
              </Form.Item>

              {/* 登录按钮 */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  block
                  style={{ background: '#1E3A8A', borderColor: '#1E3A8A' }}
                >
                  登录
                </Button>
              </Form.Item>

              {/* 注册链接 */}
              <Form.Item style={{ marginBottom: 0 }}>
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary">还没有账户？ </Text>
                  <Link to="/register" style={{ color: '#1E3A8A', fontWeight: 500 }}>
                    立即注册
                  </Link>
                </div>
              </Form.Item>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage;

/**
 * @file RegisterPage.tsx
 * @description 用户注册页面
 * 支持邮箱注册、教育邮箱检测、密码强度显示
 */

import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  message,
  Row,
  Col,
  Grid,
  Select,
  Tooltip,
} from 'antd';
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import type { RegisterData } from '../store/authStore';
import {
  isValidEmail,
  isEduEmail,
  validatePassword,
  getEduEmailTip,
} from '../utils/validators';
import PasswordStrength from '../components/PasswordStrength';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Option } = Select;

/**
 * 注册表单验证Schema
 */
const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, '请输入邮箱')
      .refine((val) => isValidEmail(val), '邮箱格式不正确'),
    password: z
      .string()
      .min(8, '密码长度至少为8位')
      .superRefine((val, ctx) => {
        const result = validatePassword(val);
        if (!result.valid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: result.message || '密码不符合要求',
          });
        }
      }),
    confirmPassword: z.string().min(1, '请确认密码'),
    fullName: z.string().min(1, '请输入姓名').max(50, '姓名长度不能超过50字符'),
    researchField: z.string().optional(),
    agreement: z.boolean().refine((val) => val === true, '请阅读并同意用户协议'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * 研究方向选项
 */
const RESEARCH_FIELDS = [
  '人工智能',
  '机器学习',
  '计算机视觉',
  '自然语言处理',
  '数据挖掘',
  '软件工程',
  '计算机网络',
  '信息安全',
  '数据库',
  '其他',
];

/**
 * 注册页面组件
 */
export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const { register: registerUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');

  // React Hook Form
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      researchField: undefined,
      agreement: false,
    },
  });

  // 监听邮箱和密码变化
  const email = watch('email');
  const password = watch('password');

  React.useEffect(() => {
    setEmailValue(email);
    setPasswordValue(password);
  }, [email, password]);

  /**
   * 处理注册提交
   */
  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const registerData: RegisterData = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        researchField: data.researchField,
      };

      await registerUser(registerData);
      message.success('注册成功！请登录您的账户');
      navigate('/login');
    } catch (error: any) {
      message.error(error.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  // 判断是否为移动端
  const isMobile = !screens.md;

  // 获取教育邮箱提示
  const eduEmailTip = getEduEmailTip(emailValue);
  const isEdu = isEduEmail(emailValue);

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
            <div style={{ marginTop: 32, textAlign: 'left', maxWidth: 400 }}>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, display: 'block', marginBottom: 16 }}>
                <CheckCircleOutlined /> AI驱动的内容生成
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, display: 'block', marginBottom: 16 }}>
                <CheckCircleOutlined /> 智能文献趋势分析
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, display: 'block' }}>
                <CheckCircleOutlined /> 格式合规自动检查
              </Text>
            </div>
          </Col>
        )}

        {/* 右侧注册表单区 */}
        <Col
          xs={24}
          md={12}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isMobile ? 24 : 48,
            overflowY: 'auto',
          }}
        >
          <div style={{ width: '100%', maxWidth: 400 }}>
            {/* 移动端显示Logo */}
            {isMobile && (
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={2}>InnoLiber</Title>
                <Text type="secondary">科研基金申请智能助理</Text>
              </div>
            )}

            <Title level={2} style={{ marginBottom: 8 }}>
              注册账户
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
              创建您的InnoLiber账户
            </Text>

            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
              {/* 邮箱输入 */}
              <Form.Item
                label={
                  <span>
                    邮箱{' '}
                    <Tooltip title="建议使用教育邮箱注册，享受优先服务">
                      <InfoCircleOutlined style={{ color: '#1E3A8A' }} />
                    </Tooltip>
                  </span>
                }
                validateStatus={errors.email ? 'error' : isEdu ? 'success' : ''}
                help={errors.email?.message || eduEmailTip}
                hasFeedback={isEdu}
              >
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      prefix={<MailOutlined />}
                      suffix={isEdu ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : null}
                      placeholder="请输入邮箱"
                      size="large"
                      autoComplete="email"
                    />
                  )}
                />
              </Form.Item>

              {/* 姓名输入 */}
              <Form.Item
                label="姓名"
                validateStatus={errors.fullName ? 'error' : ''}
                help={errors.fullName?.message}
              >
                <Controller
                  name="fullName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      prefix={<UserOutlined />}
                      placeholder="请输入真实姓名"
                      size="large"
                      autoComplete="name"
                    />
                  )}
                />
              </Form.Item>

              {/* 研究方向选择 */}
              <Form.Item label="研究方向（可选）">
                <Controller
                  name="researchField"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="选择您的研究方向"
                      size="large"
                      suffixIcon={<ExperimentOutlined />}
                      allowClear
                    >
                      {RESEARCH_FIELDS.map((field) => (
                        <Option key={field} value={field}>
                          {field}
                        </Option>
                      ))}
                    </Select>
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
                    <>
                      <Input.Password
                        {...field}
                        prefix={<LockOutlined />}
                        placeholder="请输入密码（至少8位，包含字母和数字）"
                        size="large"
                        autoComplete="new-password"
                      />
                      <PasswordStrength password={passwordValue} />
                    </>
                  )}
                />
              </Form.Item>

              {/* 确认密码 */}
              <Form.Item
                label="确认密码"
                validateStatus={errors.confirmPassword ? 'error' : ''}
                help={errors.confirmPassword?.message}
              >
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      prefix={<LockOutlined />}
                      placeholder="请再次输入密码"
                      size="large"
                      autoComplete="new-password"
                    />
                  )}
                />
              </Form.Item>

              {/* 用户协议 */}
              <Form.Item validateStatus={errors.agreement ? 'error' : ''} help={errors.agreement?.message}>
                <Controller
                  name="agreement"
                  control={control}
                  render={({ field }) => (
                    <Checkbox checked={field.value} onChange={field.onChange}>
                      我已阅读并同意{' '}
                      <Link to="/terms" target="_blank" style={{ color: '#1E3A8A' }}>
                        用户协议
                      </Link>{' '}
                      和{' '}
                      <Link to="/privacy" target="_blank" style={{ color: '#1E3A8A' }}>
                        隐私政策
                      </Link>
                    </Checkbox>
                  )}
                />
              </Form.Item>

              {/* TODO-ALIYUN: [验证码] - 集成阿里云滑动拼图验证
                  当前实现：不显示验证码（MVP宽松策略）
                  未来位置：在注册按钮上方插入CaptchaPlaceholder组件 */}

              {/* 注册按钮 */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  block
                  style={{ background: '#1E3A8A', borderColor: '#1E3A8A' }}
                >
                  注册
                </Button>
              </Form.Item>

              {/* 登录链接 */}
              <Form.Item style={{ marginBottom: 0 }}>
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary">已有账户？ </Text>
                  <Link to="/login" style={{ color: '#1E3A8A', fontWeight: 500 }}>
                    立即登录
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

export default RegisterPage;

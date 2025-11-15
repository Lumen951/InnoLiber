/**
 * @file SettingsPage.tsx
 * @description 设置页面 - 用户配置和系统设置
 *
 * <copyright>
 * Copyright (c) 2024-2025 InnoLiber Team
 * Licensed under the MIT License
 * </copyright>
 *
 * @author InnoLiber Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Upload,
  Avatar,
  Typography,
  Divider,
  Space,
  Row,
  Col,
  message,
  Modal,
  Alert,
  Tabs,
  Slider,
  Radio,
  Tooltip,
  Progress,
} from 'antd';
import {
  UserOutlined,
  UploadOutlined,
  LockOutlined,
  BellOutlined,
  SettingOutlined,
  SaveOutlined,
  ExclamationCircleOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  InfoCircleOutlined,
  SecurityScanOutlined,
  MailOutlined,
  MobileOutlined,
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SidebarLayout from '@/components/SidebarLayout';
import PasswordStrength from '@/components/PasswordStrength';
import { useAuthStore } from '@/store/authStore';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

/**
 * SettingsPage 设置页面组件
 *
 * <rationale>
 * 设置分类设计：
 * - 个人信息：头像、昵称、联系方式等基础信息
 * - 安全设置：密码修改、两步验证、登录安全
 * - 通知偏好：邮件通知、系统提醒、推送设置
 * - 系统偏好：界面主题、语言、显示设置
 * </rationale>
 *
 * <warning type="security">
 * ⚠️ 安全注意事项：
 * - 密码修改需要验证原密码
 * - 敏感操作需要二次确认
 * - 个人信息修改需要验证身份
 * </warning>
 *
 * @returns SettingsPage 设置页面组件
 */
const SettingsPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // 表单验证模式
  const profileSchema = z.object({
    nickname: z.string().min(2, '昵称至少2个字符').max(20, '昵称最多20个字符'),
    email: z.string().email('请输入有效的邮箱地址'),
    phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码').optional().or(z.literal('')),
    bio: z.string().max(200, '个人简介最多200个字符').optional(),
  });

  const passwordSchema = z.object({
    currentPassword: z.string().min(1, '请输入当前密码'),
    newPassword: z.string()
      .min(8, '密码至少8个字符')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字'),
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

  // 表单控制
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: user?.nickname || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // 系统设置状态
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    systemNotifications: true,
    proposalReminders: true,
    qualityAlerts: true,
    weeklyReport: false,
  });

  const [systemPreferences, setSystemPreferences] = useState({
    theme: 'light',
    language: 'zh-CN',
    pageSize: 20,
    autoSave: true,
    autoSaveInterval: 30,
    showTutorial: true,
  });

  // 保存个人信息
  const handleProfileSave = async (data: any) => {
    setLoading(true);
    try {
      // 这里应该调用API更新用户信息
      console.log('保存个人信息:', data);

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      message.success('个人信息已更新');
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 修改密码
  const handlePasswordChange = async (data: any) => {
    setLoading(true);
    try {
      // 这里应该调用API修改密码
      console.log('修改密码:', data);

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      message.success('密码已修改，请重新登录');
      passwordForm.reset();

      // 延迟跳转到登录页
      setTimeout(() => {
        logout();
      }, 1500);
    } catch (error) {
      message.error('密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  // 头像上传
  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      // 这里应该调用API上传头像
      console.log('上传头像:', file);

      // 模拟上传
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      message.success('头像已更新');
    } catch (error) {
      message.error('头像上传失败');
    }
  };

  // 保存通知设置
  const handleNotificationSave = () => {
    message.success('通知设置已保存');
  };

  // 保存系统偏好
  const handlePreferencesSave = () => {
    message.success('系统偏好已保存');
  };

  // 账户注销确认
  const handleAccountDelete = () => {
    Modal.confirm({
      title: '确认注销账户',
      icon: <ExclamationCircleOutlined />,
      content: '注销账户将永久删除您的所有数据，此操作不可恢复。请确认您要继续吗？',
      okText: '确认注销',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        console.log('账户注销');
        message.warning('账户注销功能开发中');
      },
    });
  };

  return (
    <SidebarLayout>
      <div className="settings-page">
        <Title level={2} style={{ marginBottom: '24px' }}>
          ⚙️ 设置
        </Title>

        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
            {/* 个人信息标签页 */}
            <TabPane
              tab={
                <Space>
                  <UserOutlined />
                  个人信息
                </Space>
              }
              key="profile"
            >
              <Row gutter={24}>
                <Col xs={24} lg={8}>
                  <Card title="头像设置" size="small">
                    <div style={{ textAlign: 'center' }}>
                      <Avatar
                        size={120}
                        src={avatarUrl || user?.avatar}
                        icon={<UserOutlined />}
                        style={{ marginBottom: '16px' }}
                      />
                      <div>
                        <Upload
                          accept="image/*"
                          showUploadList={false}
                          beforeUpload={(file) => {
                            handleAvatarUpload(file);
                            return false;
                          }}
                        >
                          <Button icon={<UploadOutlined />} size="small">
                            上传头像
                          </Button>
                        </Upload>
                      </div>
                      <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
                        支持 JPG、PNG 格式，建议尺寸 200x200px
                      </Text>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} lg={16}>
                  <Card title="基本信息" size="small">
                    <Form
                      layout="vertical"
                      onFinish={profileForm.handleSubmit(handleProfileSave)}
                    >
                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label="昵称"
                            validateStatus={profileForm.formState.errors.nickname ? 'error' : ''}
                            help={profileForm.formState.errors.nickname?.message}
                          >
                            <Controller
                              name="nickname"
                              control={profileForm.control}
                              render={({ field }) => (
                                <Input {...field} placeholder="请输入昵称" />
                              )}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label="邮箱地址"
                            validateStatus={profileForm.formState.errors.email ? 'error' : ''}
                            help={profileForm.formState.errors.email?.message}
                          >
                            <Controller
                              name="email"
                              control={profileForm.control}
                              render={({ field }) => (
                                <Input {...field} prefix={<MailOutlined />} placeholder="请输入邮箱" />
                              )}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item
                        label="手机号码"
                        validateStatus={profileForm.formState.errors.phone ? 'error' : ''}
                        help={profileForm.formState.errors.phone?.message}
                      >
                        <Controller
                          name="phone"
                          control={profileForm.control}
                          render={({ field }) => (
                            <Input {...field} prefix={<MobileOutlined />} placeholder="请输入手机号码" />
                          )}
                        />
                      </Form.Item>

                      <Form.Item
                        label="个人简介"
                        validateStatus={profileForm.formState.errors.bio ? 'error' : ''}
                        help={profileForm.formState.errors.bio?.message}
                      >
                        <Controller
                          name="bio"
                          control={profileForm.control}
                          render={({ field }) => (
                            <Input.TextArea
                              {...field}
                              rows={3}
                              placeholder="简单介绍一下自己..."
                              showCount
                              maxLength={200}
                            />
                          )}
                        />
                      </Form.Item>

                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                          icon={<SaveOutlined />}
                        >
                          保存信息
                        </Button>
                      </Form.Item>
                    </Form>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            {/* 安全设置标签页 */}
            <TabPane
              tab={
                <Space>
                  <SecurityScanOutlined />
                  安全设置
                </Space>
              }
              key="security"
            >
              <Row gutter={24}>
                <Col xs={24} lg={12}>
                  <Card title="密码修改" size="small">
                    <Form
                      layout="vertical"
                      onFinish={passwordForm.handleSubmit(handlePasswordChange)}
                    >
                      <Form.Item
                        label="当前密码"
                        validateStatus={passwordForm.formState.errors.currentPassword ? 'error' : ''}
                        help={passwordForm.formState.errors.currentPassword?.message}
                      >
                        <Controller
                          name="currentPassword"
                          control={passwordForm.control}
                          render={({ field }) => (
                            <Input.Password {...field} placeholder="请输入当前密码" />
                          )}
                        />
                      </Form.Item>

                      <Form.Item
                        label="新密码"
                        validateStatus={passwordForm.formState.errors.newPassword ? 'error' : ''}
                        help={passwordForm.formState.errors.newPassword?.message}
                      >
                        <Controller
                          name="newPassword"
                          control={passwordForm.control}
                          render={({ field }) => (
                            <div>
                              <Input.Password {...field} placeholder="请输入新密码" />
                              <PasswordStrength password={field.value} style={{ marginTop: '8px' }} />
                            </div>
                          )}
                        />
                      </Form.Item>

                      <Form.Item
                        label="确认新密码"
                        validateStatus={passwordForm.formState.errors.confirmPassword ? 'error' : ''}
                        help={passwordForm.formState.errors.confirmPassword?.message}
                      >
                        <Controller
                          name="confirmPassword"
                          control={passwordForm.control}
                          render={({ field }) => (
                            <Input.Password {...field} placeholder="请再次输入新密码" />
                          )}
                        />
                      </Form.Item>

                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                          icon={<LockOutlined />}
                          danger
                        >
                          修改密码
                        </Button>
                      </Form.Item>
                    </Form>
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card title="账户安全" size="small">
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                      <div>
                        <Text strong>两步验证</Text>
                        <div style={{ marginTop: '8px' }}>
                          <Switch
                            checked={false}
                            disabled
                            style={{ marginRight: '8px' }}
                          />
                          <Text type="secondary">暂未启用</Text>
                          <Tooltip title="开发中功能">
                            <InfoCircleOutlined style={{ marginLeft: '8px', color: '#999' }} />
                          </Tooltip>
                        </div>
                      </div>

                      <div>
                        <Text strong>登录设备管理</Text>
                        <div style={{ marginTop: '8px' }}>
                          <Button size="small" disabled>
                            查看登录设备
                          </Button>
                          <Tooltip title="开发中功能">
                            <InfoCircleOutlined style={{ marginLeft: '8px', color: '#999' }} />
                          </Tooltip>
                        </div>
                      </div>

                      <Divider />

                      <div>
                        <Text strong type="danger">危险操作</Text>
                        <div style={{ marginTop: '8px' }}>
                          <Button
                            danger
                            size="small"
                            onClick={handleAccountDelete}
                          >
                            注销账户
                          </Button>
                          <Text type="secondary" style={{ display: 'block', marginTop: '4px', fontSize: '12px' }}>
                            注销后将无法恢复
                          </Text>
                        </div>
                      </div>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            {/* 通知设置标签页 */}
            <TabPane
              tab={
                <Space>
                  <BellOutlined />
                  通知设置
                </Space>
              }
              key="notifications"
            >
              <Card title="通知偏好设置" size="small">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>邮件通知</Text>
                      <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                        接收重要操作和系统更新的邮件通知
                      </Text>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>系统通知</Text>
                      <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                        页面内的消息提醒和状态通知
                      </Text>
                    </div>
                    <Switch
                      checked={notificationSettings.systemNotifications}
                      onChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, systemNotifications: checked }))
                      }
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>标书提醒</Text>
                      <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                        标书审核、修改建议等相关提醒
                      </Text>
                    </div>
                    <Switch
                      checked={notificationSettings.proposalReminders}
                      onChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, proposalReminders: checked }))
                      }
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>质量预警</Text>
                      <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                        当标书质量分数较低时发送提醒
                      </Text>
                    </div>
                    <Switch
                      checked={notificationSettings.qualityAlerts}
                      onChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, qualityAlerts: checked }))
                      }
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>周报推送</Text>
                      <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                        每周发送使用情况和成果总结
                      </Text>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyReport}
                      onChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, weeklyReport: checked }))
                      }
                    />
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <Button type="primary" onClick={handleNotificationSave}>
                      保存设置
                    </Button>
                  </div>
                </Space>
              </Card>
            </TabPane>

            {/* 系统偏好标签页 */}
            <TabPane
              tab={
                <Space>
                  <SettingOutlined />
                  系统偏好
                </Space>
              }
              key="preferences"
            >
              <Card title="界面和系统设置" size="small">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div>
                    <Text strong style={{ display: 'block', marginBottom: '8px' }}>界面主题</Text>
                    <Radio.Group
                      value={systemPreferences.theme}
                      onChange={(e) =>
                        setSystemPreferences(prev => ({ ...prev, theme: e.target.value }))
                      }
                    >
                      <Radio value="light">浅色主题</Radio>
                      <Radio value="dark" disabled>深色主题 (开发中)</Radio>
                    </Radio.Group>
                  </div>

                  <div>
                    <Text strong style={{ display: 'block', marginBottom: '8px' }}>语言设置</Text>
                    <Select
                      value={systemPreferences.language}
                      onChange={(value) =>
                        setSystemPreferences(prev => ({ ...prev, language: value }))
                      }
                      style={{ width: 200 }}
                    >
                      <Select.Option value="zh-CN">简体中文</Select.Option>
                      <Select.Option value="en-US" disabled>English (开发中)</Select.Option>
                    </Select>
                  </div>

                  <div>
                    <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                      每页显示数量: {systemPreferences.pageSize}
                    </Text>
                    <Slider
                      min={10}
                      max={50}
                      step={5}
                      value={systemPreferences.pageSize}
                      onChange={(value) =>
                        setSystemPreferences(prev => ({ ...prev, pageSize: value }))
                      }
                      marks={{
                        10: '10',
                        20: '20',
                        30: '30',
                        40: '40',
                        50: '50',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>自动保存</Text>
                      <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                        编辑标书时自动保存草稿
                      </Text>
                    </div>
                    <Switch
                      checked={systemPreferences.autoSave}
                      onChange={(checked) =>
                        setSystemPreferences(prev => ({ ...prev, autoSave: checked }))
                      }
                    />
                  </div>

                  {systemPreferences.autoSave && (
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                        自动保存间隔: {systemPreferences.autoSaveInterval} 秒
                      </Text>
                      <Slider
                        min={10}
                        max={120}
                        step={10}
                        value={systemPreferences.autoSaveInterval}
                        onChange={(value) =>
                          setSystemPreferences(prev => ({ ...prev, autoSaveInterval: value }))
                        }
                        marks={{
                          10: '10s',
                          30: '30s',
                          60: '1m',
                          120: '2m',
                        }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>显示新手引导</Text>
                      <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                        为新功能显示操作提示
                      </Text>
                    </div>
                    <Switch
                      checked={systemPreferences.showTutorial}
                      onChange={(checked) =>
                        setSystemPreferences(prev => ({ ...prev, showTutorial: checked }))
                      }
                    />
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <Button type="primary" onClick={handlePreferencesSave}>
                      保存设置
                    </Button>
                  </div>
                </Space>
              </Card>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </SidebarLayout>
  );
};

export default SettingsPage;
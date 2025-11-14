/**
 * 邮箱和密码验证工具函数
 * 用于表单验证和用户输入检查
 */

/**
 * 教育邮箱域名列表
 * 支持中国、美国、英国、日本等国家的教育邮箱
 */
const EDU_EMAIL_DOMAINS = [
  '.edu.cn',    // 中国教育邮箱
  '.edu',       // 美国教育邮箱
  '.ac.uk',     // 英国学术邮箱
  '.ac.jp',     // 日本学术邮箱
  '.edu.au',    // 澳大利亚教育邮箱
  '.ac.kr',     // 韩国学术邮箱
];

/**
 * 检查是否为教育邮箱
 * @param email - 邮箱地址
 * @returns true表示是教育邮箱
 */
export const isEduEmail = (email: string): boolean => {
  if (!email) return false;
  const lowerEmail = email.toLowerCase();
  return EDU_EMAIL_DOMAINS.some(domain => lowerEmail.endsWith(domain));
};

/**
 * 验证邮箱格式（RFC 5322标准）
 * @param email - 邮箱地址
 * @returns true表示格式有效
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;

  // RFC 5322标准的简化版正则表达式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 密码强度等级
 */
export const PasswordStrength = {
  VERY_WEAK: 0,  // 非常弱
  WEAK: 1,       // 弱
  MEDIUM: 2,     // 中等
  STRONG: 3,     // 强
  VERY_STRONG: 4 // 非常强
} as const;

export type PasswordStrength = typeof PasswordStrength[keyof typeof PasswordStrength];

/**
 * 密码强度文本映射
 */
export const PASSWORD_STRENGTH_TEXT: Record<PasswordStrength, string> = {
  [PasswordStrength.VERY_WEAK]: '非常弱',
  [PasswordStrength.WEAK]: '弱',
  [PasswordStrength.MEDIUM]: '中等',
  [PasswordStrength.STRONG]: '强',
  [PasswordStrength.VERY_STRONG]: '非常强',
};

/**
 * 密码强度颜色映射
 */
export const PASSWORD_STRENGTH_COLOR: Record<PasswordStrength, string> = {
  [PasswordStrength.VERY_WEAK]: '#ff4d4f',  // 红色
  [PasswordStrength.WEAK]: '#ff7a45',       // 橙红色
  [PasswordStrength.MEDIUM]: '#ffa940',     // 橙色
  [PasswordStrength.STRONG]: '#52c41a',     // 绿色
  [PasswordStrength.VERY_STRONG]: '#13c2c2', // 青色
};

/**
 * 计算密码强度
 * @param password - 密码
 * @returns 密码强度等级 (0-4)
 */
export const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) return PasswordStrength.VERY_WEAK;

  let strength = 0;

  // 长度检查
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // 包含小写字母
  if (/[a-z]/.test(password)) strength++;

  // 包含大写字母
  if (/[A-Z]/.test(password)) strength++;

  // 包含数字
  if (/\d/.test(password)) strength++;

  // 包含特殊字符
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

  // 根据累计分数返回强度等级
  if (strength <= 1) return PasswordStrength.VERY_WEAK;
  if (strength === 2) return PasswordStrength.WEAK;
  if (strength === 3) return PasswordStrength.MEDIUM;
  if (strength === 4) return PasswordStrength.STRONG;
  return PasswordStrength.VERY_STRONG;
};

/**
 * 验证密码是否满足最低要求
 * @param password - 密码
 * @returns 验证结果对象 {valid: boolean, message?: string}
 */
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (!password) {
    return { valid: false, message: '密码不能为空' };
  }

  if (password.length < 8) {
    return { valid: false, message: '密码长度至少为8位' };
  }

  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: '密码必须包含字母' };
  }

  if (!/\d/.test(password)) {
    return { valid: false, message: '密码必须包含数字' };
  }

  return { valid: true };
};

/**
 * 获取教育邮箱提示文本
 * @param email - 邮箱地址
 * @returns 提示文本
 */
export const getEduEmailTip = (email: string): string | null => {
  if (!email || !isValidEmail(email)) return null;

  if (isEduEmail(email)) {
    return '已识别为教育邮箱，享受优先服务';
  }

  return '建议使用教育邮箱注册，享受更多功能';
};

// ============================================================================
// 标书创建表单验证Schema (Proposal Creation Validation)
// ============================================================================

import { z } from 'zod';

/**
 * 标书创建表单Zod验证Schema
 *
 * <rationale>
 * 验证设计原则：
 * - 前端验证：快速反馈，提升用户体验
 * - 后端验证：安全边界，防止恶意数据
 * - 规则对齐：前后端验证规则完全一致
 *
 * Zod优势：
 * - 类型推断：自动生成TypeScript类型
 * - 链式API：可读性强，易于维护
 * - 错误消息：支持中文自定义错误
 * - 组合验证：refine支持跨字段验证
 * </rationale>
 *
 * <warning type="validation">
 * ⚠️ 验证规则修改影响：
 * - 前端：ProposalCreatePage.tsx表单行为
 * - 后端：POST /api/proposals请求验证
 * - 文档：API规范文档需同步更新
 * 修改规则需前后端同步，避免不一致
 * </warning>
 */
export const proposalCreateSchema = z.object({
  /**
   * 标书标题验证
   *
   * <rationale>
   * 规则设计：
   * - 最小10字符：确保标题完整性（中文5字+英文5字）
   * - 最大100字符：避免过长影响展示（数据库VARCHAR(255)）
   * - 去除首尾空格：提升数据质量
   * - 禁止纯空格：防止无效数据
   *
   * NSFC要求：
   * - 标题应简洁明了，概括研究核心
   * - 推荐20-50字
   * </rationale>
   */
  title: z
    .string({ message: '标书标题不能为空' })
    .min(10, '标题至少10个字符')
    .max(100, '标题最多100个字符')
    .refine((val) => val.trim().length > 0, '标题不能为纯空格')
    .refine((val) => !/^\s|\s$/.test(val), '标题首尾不能有空格'),

  /**
   * 研究领域验证
   */
  researchField: z
    .string({ message: '请选择研究领域' })
    .min(1, '请选择研究领域'),

  /**
   * 项目类型验证
   */
  projectType: z.enum(['面上项目', '青年项目', '重点项目'] as const, {
    message: '请选择有效的项目类型',
  }),

  /**
   * 申请年度验证
   */
  year: z
    .number({ message: '请选择申请年度' })
    .int('年度必须是整数')
    .min(2025, '年度不能早于2025')
    .max(2030, '年度不能晚于2030'),

  /**
   * 申请单位验证
   */
  institution: z
    .string({ message: '申请单位不能为空' })
    .min(2, '单位名称至少2个字符')
    .max(100, '单位名称最多100个字符')
    .refine((val) => val.trim().length > 0, '单位名称不能为纯空格'),

  /**
   * 申请金额验证
   */
  funding: z
    .number({ message: '请输入申请金额' })
    .positive('金额必须大于0')
    .int('金额必须是整数（单位：万元）')
    .min(1, '金额至少1万元')
    .max(1000, '金额不能超过1000万元'),

  /**
   * 项目周期验证
   */
  duration: z
    .number({ message: '请选择项目周期' })
    .int('周期必须是整数（单位：年）')
    .min(1, '周期至少1年')
    .max(5, '周期最多5年'),

  /**
   * 研究关键词验证
   */
  keywords: z
    .array(z.string(), { message: '请至少填写1个关键词' })
    .min(1, '至少填写1个关键词')
    .max(5, '最多填写5个关键词')
    .refine(
      (arr) => arr.every((kw) => kw.length >= 2 && kw.length <= 20),
      '每个关键词应为2-20个字符'
    )
    .refine((arr) => new Set(arr).size === arr.length, '关键词不能重复'),

  /**
   * 研究摘要验证
   */
  abstract: z
    .string({ message: '研究摘要不能为空' })
    .min(200, '摘要至少200字')
    .max(300, '摘要最多300字')
    .refine((val) => val.trim().length >= 200, '摘要有效内容至少200字')
    .refine((val) => !/^\s|\s$/.test(val), '摘要首尾不能有空格'),
});

/**
 * 从Schema推断表单数据类型
 */
export type ProposalCreateFormData = z.infer<typeof proposalCreateSchema>;

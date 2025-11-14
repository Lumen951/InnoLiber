/**
 * @file options.ts
 * @description 下拉选项常量定义
 *
 * <copyright>
 * Copyright (c) 2024-2025 InnoLiber Team
 * Licensed under the MIT License
 * </copyright>
 *
 * @author InnoLiber Team
 * @version 1.0.0
 */

import type { SelectOption } from '@/types/proposal';

// ============================================================================
// 研究领域选项 (Research Field Options)
// ============================================================================

/**
 * 研究领域选项列表
 *
 * <rationale>
 * 数据来源：
 * - NSFC学科分类（2024版）
 * - 常见ECR研究领域统计
 * - 优先展示高频领域
 *
 * 维护建议：
 * - 每年根据NSFC分类更新
 * - 添加新领域需同步后端验证规则
 * </rationale>
 *
 * <todo priority="medium">
 * TODO(frontend-team, 2026-01-01): [P2] 更新2026年NSFC学科分类
 * 参考文档：https://www.nsfc.gov.cn/publish/portal0/tab434/
 * </todo>
 */
export const RESEARCH_FIELD_OPTIONS: SelectOption[] = [
  { label: '计算机科学', value: '计算机科学' },
  { label: '人工智能', value: '人工智能' },
  { label: '数据科学', value: '数据科学' },
  { label: '软件工程', value: '软件工程' },
  { label: '网络与信息安全', value: '网络与信息安全' },
  { label: '生物信息学', value: '生物信息学' },
  { label: '数学', value: '数学' },
  { label: '物理学', value: '物理学' },
  { label: '化学', value: '化学' },
  { label: '材料科学', value: '材料科学' },
  { label: '机械工程', value: '机械工程' },
  { label: '电子工程', value: '电子工程' },
  { label: '自动化', value: '自动化' },
  { label: '管理科学', value: '管理科学' },
  { label: '经济学', value: '经济学' },
  { label: '其他', value: '其他' },
];

// ============================================================================
// 项目类型选项 (Project Type Options)
// ============================================================================

/**
 * 项目类型选项列表
 *
 * <rationale>
 * NSFC主要项目类型：
 * - 面上项目：资助强度高，申请门槛较高
 * - 青年项目：针对青年科研人员，ECR主要目标
 * - 重点项目：资助力度最大，竞争最激烈
 *
 * 其他类型（未列入）：
 * - 地区科学基金（区域性）
 * - 国际合作项目（需合作方）
 * </rationale>
 *
 * <warning type="policy">
 * ⚠️ 申请资格要求：
 * - 青年项目：男性≤35岁，女性≤40岁
 * - 面上项目：已获博士学位
 * - 重点项目：需有重要研究基础
 * 前端不做资格验证，仅提供选项
 * </warning>
 */
export const PROJECT_TYPE_OPTIONS: SelectOption[] = [
  { label: '面上项目', value: '面上项目' },
  { label: '青年项目', value: '青年项目' },
  { label: '重点项目', value: '重点项目' },
];

// ============================================================================
// 申请年度选项 (Year Options)
// ============================================================================

/**
 * 生成申请年度选项（动态）
 *
 * <rationale>
 * 动态生成逻辑：
 * - 当前年度：允许申请下一年度
 * - 范围：当前年+1 到 当前年+5（5年规划）
 * - 例：2024年可申请2025-2029
 *
 * 不使用静态数组的原因：
 * - 避免每年手动更新代码
 * - 自动适应当前时间
 * </rationale>
 *
 * @returns {SelectOption[]} 年度选项数组
 *
 * @example
 * ```ts
 * // 2024年调用
 * const years = generateYearOptions();
 * // 返回: [2025, 2026, 2027, 2028, 2029]
 * ```
 */
export const generateYearOptions = (): SelectOption[] => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear + 1; // 申请下一年度
  const endYear = startYear + 4; // 5年范围

  const options: SelectOption[] = [];
  for (let year = startYear; year <= endYear; year++) {
    options.push({ label: `${year}`, value: year });
  }
  return options;
};

/**
 * 申请年度选项（预生成）
 *
 * <rationale>
 * 提前生成避免每次渲染重新计算
 * </rationale>
 */
export const YEAR_OPTIONS: SelectOption[] = generateYearOptions();

// ============================================================================
// 申请金额选项 (Funding Options)
// ============================================================================

/**
 * 申请金额选项（按项目类型）
 *
 * <rationale>
 * NSFC资助强度（2024）：
 * - 青年项目：20-30万元（3年）
 * - 面上项目：50-80万元（4年）
 * - 重点项目：200-300万元（5年）
 *
 * 数据来源：
 * - NSFC资助强度标准（2024版）
 * - 统计数据显示：80%申请书在推荐金额范围
 * </rationale>
 *
 * <warning type="policy">
 * ⚠️ 金额限制：
 * - 超出范围可能影响评审
 * - 需在申请书中说明理由
 * - 最终金额由NSFC确定
 * </warning>
 */
export const FUNDING_OPTIONS_BY_TYPE: Record<string, SelectOption[]> = {
  '青年项目': [
    { label: '20万元', value: 20 },
    { label: '25万元', value: 25 },
    { label: '30万元', value: 30 },
  ],
  '面上项目': [
    { label: '50万元', value: 50 },
    { label: '60万元', value: 60 },
    { label: '70万元', value: 70 },
    { label: '80万元', value: 80 },
  ],
  '重点项目': [
    { label: '200万元', value: 200 },
    { label: '250万元', value: 250 },
    { label: '300万元', value: 300 },
  ],
};

/**
 * 默认申请金额选项（未选择项目类型时）
 *
 * <rationale>
 * 覆盖常见金额范围：20-300万元
 * </rationale>
 */
export const DEFAULT_FUNDING_OPTIONS: SelectOption[] = [
  { label: '20万元', value: 20 },
  { label: '30万元', value: 30 },
  { label: '50万元', value: 50 },
  { label: '60万元', value: 60 },
  { label: '70万元', value: 70 },
  { label: '80万元', value: 80 },
  { label: '100万元', value: 100 },
  { label: '150万元', value: 150 },
  { label: '200万元', value: 200 },
  { label: '250万元', value: 250 },
  { label: '300万元', value: 300 },
  { label: '自定义', value: 0 }, // 0表示自定义输入
];

// ============================================================================
// 项目周期选项 (Duration Options)
// ============================================================================

/**
 * 项目周期选项（按项目类型）
 *
 * <rationale>
 * NSFC项目周期标准（2024）：
 * - 青年项目：固定3年
 * - 面上项目：3-5年（推荐4年）
 * - 重点项目：固定5年
 *
 * 数据来源：
 * - NSFC项目管理办法
 * - 统计：90%面上项目选择4年
 * </rationale>
 */
export const DURATION_OPTIONS_BY_TYPE: Record<string, SelectOption[]> = {
  '青年项目': [{ label: '3年', value: 3 }],
  '面上项目': [
    { label: '3年', value: 3 },
    { label: '4年', value: 4 },
    { label: '5年', value: 5 },
  ],
  '重点项目': [{ label: '5年', value: 5 }],
};

/**
 * 默认项目周期选项（未选择项目类型时）
 *
 * <rationale>
 * 覆盖所有可能周期：1-5年
 * </rationale>
 */
export const DEFAULT_DURATION_OPTIONS: SelectOption[] = [
  { label: '1年', value: 1 },
  { label: '2年', value: 2 },
  { label: '3年', value: 3 },
  { label: '4年', value: 4 },
  { label: '5年', value: 5 },
];

// ============================================================================
// 辅助函数 (Helper Functions)
// ============================================================================

/**
 * 根据项目类型获取推荐金额
 *
 * <rationale>
 * 自动填充推荐值，提升用户体验
 * </rationale>
 *
 * @param projectType 项目类型
 * @returns {number} 推荐金额（万元）
 *
 * @example
 * ```ts
 * getRecommendedFunding('青年项目'); // 25
 * getRecommendedFunding('面上项目'); // 80
 * getRecommendedFunding('重点项目'); // 250
 * ```
 */
export const getRecommendedFunding = (projectType: string): number => {
  const recommendations: Record<string, number> = {
    '青年项目': 25,
    '面上项目': 80,
    '重点项目': 250,
  };
  return recommendations[projectType] || 50;
};

/**
 * 根据项目类型获取推荐周期
 *
 * @param projectType 项目类型
 * @returns {number} 推荐周期（年）
 *
 * @example
 * ```ts
 * getRecommendedDuration('青年项目'); // 3
 * getRecommendedDuration('面上项目'); // 4
 * getRecommendedDuration('重点项目'); // 5
 * ```
 */
export const getRecommendedDuration = (projectType: string): number => {
  const recommendations: Record<string, number> = {
    '青年项目': 3,
    '面上项目': 4,
    '重点项目': 5,
  };
  return recommendations[projectType] || 4;
};

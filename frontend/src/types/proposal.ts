/**
 * @file proposal.ts
 * @description 标书相关类型定义
 *
 * <copyright>
 * Copyright (c) 2024-2025 InnoLiber Team
 * Licensed under the MIT License
 * </copyright>
 *
 * @author InnoLiber Team
 * @version 1.0.0
 */

// ============================================================================
// 标书创建相关类型 (Proposal Creation Types)
// ============================================================================

/**
 * 新建标书表单数据类型
 *
 * <rationale>
 * 设计决策：
 * - 与后端API对齐，避免字段不匹配
 * - 必填字段明确类型，可选字段使用optional
 * - keywords使用数组，方便处理和验证
 * - 金额单位统一使用"万元"
 * </rationale>
 *
 * <warning type="api-contract">
 * ⚠️ 字段修改影响：
 * - 前端：ProposalCreatePage.tsx表单字段
 * - 后端：POST /api/proposals请求体
 * - 验证：validators.ts中的Zod Schema
 * 修改字段需三端同步更新
 * </warning>
 *
 * @property {string} title - 标书标题（10-100字符）
 * @property {string} researchField - 研究领域（从预设选项中选择）
 * @property {string} projectType - 项目类型（面上/青年/重点）
 * @property {number} year - 申请年度（2025-2030）
 * @property {string} institution - 申请单位（2-100字符）
 * @property {number} funding - 申请金额（单位：万元，1-1000）
 * @property {number} duration - 项目周期（单位：年，1-5）
 * @property {string[]} keywords - 研究关键词（1-5个，每个2-20字符）
 * @property {string} abstract - 研究摘要（200-300字）
 *
 * @example
 * ```ts
 * const formData: ProposalCreateFormData = {
 *   title: '基于大语言模型的智能科研助理系统研究',
 *   researchField: '计算机科学',
 *   projectType: '面上项目',
 *   year: 2026,
 *   institution: 'XX大学计算机学院',
 *   funding: 80,
 *   duration: 4,
 *   keywords: ['大语言模型', '多智能体', '协作框架'],
 *   abstract: '本研究针对职业早期科研人员（ECR）在NSFC申请中面临的困难...'
 * };
 * ```
 */
export interface ProposalCreateFormData {
  title: string;
  researchField: string;
  projectType: string;
  year: number;
  institution: string;
  funding: number;
  duration: number;
  keywords: string[];
  abstract: string;
}

/**
 * 新建标书API请求类型
 *
 * <rationale>
 * 扩展FormData：
 * - 新建时status固定为draft
 * - 后端自动生成id、createdAt、updatedAt
 * - version字段后端初始化为1
 * </rationale>
 *
 * <api-contract>
 * API端点：POST /api/proposals
 * Content-Type: application/json
 *
 * 请求体示例：
 * {
 *   "title": "基于大语言模型的研究",
 *   "researchField": "计算机科学",
 *   "projectType": "面上项目",
 *   "year": 2026,
 *   "institution": "XX大学",
 *   "funding": 80,
 *   "duration": 4,
 *   "keywords": ["大语言模型", "多智能体"],
 *   "abstract": "本研究针对...",
 *   "status": "draft"
 * }
 * </api-contract>
 */
export interface ProposalCreateRequest extends ProposalCreateFormData {
  status: 'draft';
}

/**
 * 新建标书API响应类型
 *
 * <rationale>
 * 响应设计：
 * - 只返回必要信息（id、status、创建时间）
 * - 完整数据由后续GET请求获取
 * - 包含timestamp便于调试和日志记录
 * </rationale>
 *
 * <api-contract>
 * 成功响应（200 OK）：
 * {
 *   "success": true,
 *   "data": {
 *     "proposalId": "550e8400-e29b-41d4-a716-446655440000",
 *     "status": "draft",
 *     "createdAt": "2024-11-20T10:30:00Z"
 *   },
 *   "message": "标书创建成功",
 *   "timestamp": "2024-11-20T10:30:00Z"
 * }
 *
 * 错误响应（400 Bad Request）：
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "请求参数验证失败",
 *     "details": {
 *       "title": ["标题不能为空"],
 *       "funding": ["金额必须大于0"]
 *     }
 *   },
 *   "timestamp": "2024-11-20T10:30:00Z"
 * }
 * </api-contract>
 *
 * @property {boolean} success - 请求是否成功
 * @property {object} data - 响应数据
 * @property {string} data.proposalId - 新创建的标书ID
 * @property {'draft'} data.status - 标书状态（固定为draft）
 * @property {string} data.createdAt - 创建时间（ISO 8601 UTC）
 * @property {string} [message] - 成功消息
 * @property {string} timestamp - 响应时间戳（ISO 8601 UTC）
 */
export interface ProposalCreateResponse {
  success: boolean;
  data: {
    proposalId: string;
    status: 'draft';
    createdAt: string;
  };
  message?: string;
  timestamp: string;
}

// ============================================================================
// 下拉选项类型 (Select Options Types)
// ============================================================================

/**
 * 下拉选项接口
 *
 * <rationale>
 * 标准Ant Design Select选项格式：
 * - label：用户看到的文本
 * - value：实际提交的值
 * - disabled：可选的禁用状态
 * </rationale>
 *
 * @property {string} label - 显示文本
 * @property {string | number} value - 选项值
 * @property {boolean} [disabled] - 是否禁用
 */
export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

/**
 * 分组下拉选项接口
 *
 * <rationale>
 * 用于复杂场景：
 * - 研究领域按学科分组
 * - 资助金额按项目类型分组
 * </rationale>
 *
 * @property {string} label - 分组名称
 * @property {SelectOption[]} options - 分组内选项
 */
export interface GroupedSelectOption {
  label: string;
  options: SelectOption[];
}

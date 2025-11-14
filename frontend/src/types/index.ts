/**
 * @file index.ts
 * @description InnoLiber 核心类型定义（用户、标书、API通信、统计）
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
// 用户相关类型 (User Types)
// ============================================================================

/**
 * 用户数据模型
 *
 * <rationale>
 * - id 使用 string: 避免 JS Number 精度丢失（>2^53），便于迁移到 UUID
 * - role 字面量类型: 便于序列化，未来可扩展为 reviewer/mentor
 * </rationale>
 *
 * <warning type="breaking-change">
 * 修改 role 需同步更新: backend/app/models/user.py, auth.ts, PrivateRoute.tsx
 * </warning>
 *
 * @property {string} id - 唯一标识符（PostgreSQL SERIAL 转 string）
 * @property {string} email - 邮箱（用于登录，RFC 5322 格式，唯一）
 * @property {string} username - 用户名（3-50字符，唯一）
 * @property {string} [fullName] - 真实姓名（可选，用于标书作者）
 * @property {'ecr' | 'admin'} role - 角色（ecr: 研究者, admin: 管理员）
 * @property {string} createdAt - 创建时间（ISO 8601 UTC）
 *
 * @example
 * ```ts
 * const user: User = {
 *   id: "12345",
 *   email: "researcher@university.edu",
 *   username: "zhangsan",
 *   role: "ecr",
 *   createdAt: "2024-10-29T12:34:56Z"
 * };
 * ```
 */
export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  role: 'ecr' | 'admin';
  createdAt: string;
}

// ============================================================================
// 标书相关类型 (Proposal Types)
// ============================================================================

/**
 * 标书提案核心数据模型
 *
 * <rationale>
 * - status 字符串枚举: 可读性强，调试友好，类型安全
 * - qualityScore 可选: draft/reviewing 状态下尚未评分
 * - version 字段: 乐观锁防止并发冲突（UPDATE WHERE id=? AND version=?）
 * </rationale>
 *
 * <warning type="breaking-change">
 * 修改会影响 3 个系统：
 * - 前端: Dashboard.tsx, ProposalEditPage.tsx, AnalysisPage.tsx
 * - 后端: K-TAS, SPG-S, DDC-S 三大服务
 * - 数据库: proposals 表 + Alembic 迁移脚本
 * 需提前 2 周通知并使用 API 版本控制（/v2/proposals）
 * </warning>
 *
 * @property {string} id - 唯一标识符
 * @property {string} title - 标题（1-500字符）
 * @property {string} researchField - 研究领域（用于 K-TAS 文献匹配）
 * @property {'draft' | 'reviewing' | 'completed' | 'submitted'} status - 状态
 *   - draft: 草稿，可编辑
 *   - reviewing: AI审阅中（30-60秒），锁定编辑
 *   - completed: 审阅完成，可查看分析报告
 *   - submitted: 已提交 NSFC，只读
 * @property {number} version - 版本号（用于乐观锁，初始值1）
 * @property {number} [qualityScore] - 综合质量分数（0-10，SPG-S计算）
 * @property {number} [complianceScore] - 格式合规分数（0-10，DDC-S计算）
 * @property {string} createdAt - 创建时间（不可变）
 * @property {string} updatedAt - 最后更新时间
 * @property {string} [submittedAt] - 提交时间（仅 submitted 状态）
 *
 * @example
 * ```ts
 * // 草稿状态
 * const draft: Proposal = {
 *   id: "123",
 *   title: "基于 Transformer 的中文文本摘要",
 *   researchField: "人工智能",
 *   status: "draft",
 *   version: 1,
 *   createdAt: "2024-10-29T10:00:00Z",
 *   updatedAt: "2024-10-29T10:30:00Z"
 * };
 *
 * // 已完成状态
 * const completed: Proposal = {
 *   ...draft,
 *   status: "completed",
 *   version: 3,
 *   qualityScore: 8.7,
 *   complianceScore: 9.2
 * };
 * ```
 */
export interface Proposal {
  id: string;
  title: string;
  researchField: string;
  status: 'draft' | 'reviewing' | 'completed' | 'submitted';
  version: number;
  qualityScore?: number;
  complianceScore?: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

/**
 * 标书卡片展示模型（扩展 Proposal）
 *
 * <rationale>
 * - extends Proposal: 复用类型定义，支持里氏替换原则
 * - wordCount: 实时显示字数（NSFC限制 8000-10000字）
 * - 细分分数: 用于雷达图和改进建议（内容50% + 格式30% + 创新20%）
 * </rationale>
 *
 * <warning type="performance">
 * ⚠️ 列表视图避免加载细分分数（100条 +20KB）
 * 建议：列表用 Proposal，详情页用 ProposalCard
 * </warning>
 *
 * @property {number} [wordCount] - 正文字数（去除HTML标签）
 * @property {number} [contentScore] - 内容质量（0-10，权重50%）
 * @property {number} [formatScore] - 格式规范（0-10，权重30%）
 * @property {number} [innovationScore] - 创新程度（0-10，权重20%）
 */
export interface ProposalCard extends Proposal {
  wordCount?: number;
  contentScore?: number;
  formatScore?: number;
  innovationScore?: number;
}

// ============================================================================
// API 通信类型 (API Communication Types)
// ============================================================================

/**
 * 标准 API 成功响应模型
 *
 * <rationale>
 * - 统一响应格式: 便于错误处理和扩展
 * - 泛型 T: 类型安全 + IDE 智能提示
 * - message 可选: 部分操作需提示（如"保存成功"）
 * </rationale>
 *
 * @template T - 响应数据类型
 * @property {boolean} success - 固定为 true
 * @property {T} data - 响应数据
 * @property {string} [message] - 可选提示消息
 * @property {string} timestamp - 响应时间（ISO 8601 UTC）
 *
 * @example
 * ```ts
 * const response: ApiResponse<Proposal> = {
 *   success: true,
 *   data: { id: "123", title: "...", ... },
 *   timestamp: "2024-10-29T12:34:56Z"
 * };
 * ```
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * 标准 API 错误响应模型
 *
 * <rationale>
 * - success 固定 false: 类型守卫（if ('error' in response)）
 * - code/message 分离: code 机器可读，message 人类可读（便于国际化）
 * - details 字段: 字段级验证错误（如 title: ["不能为空", "超长"]）
 * </rationale>
 *
 * <warning type="security">
 * ⚠️ 避免泄露敏感信息：禁止包含 SQL、文件路径、IP、密码
 * 生产环境使用通用错误消息，详细信息记录到服务器日志
 * </warning>
 *
 * @property {false} success - 固定为 false
 * @property {object} error - 错误详情
 * @property {string} error.code - 错误代码（VALIDATION_ERROR, NOT_FOUND, UNAUTHORIZED, etc.）
 * @property {string} error.message - 人类可读错误描述
 * @property {Record<string, string[]>} [error.details] - 字段级验证错误
 * @property {string} timestamp - 错误时间
 *
 * @example
 * ```ts
 * const error: ApiError = {
 *   success: false,
 *   error: {
 *     code: "VALIDATION_ERROR",
 *     message: "请求参数验证失败",
 *     details: { "title": ["不能为空"], "email": ["格式不正确"] }
 *   },
 *   timestamp: "2024-10-29T12:34:56Z"
 * };
 * ```
 */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  timestamp: string;
}

/**
 * 分页响应模型
 *
 * <rationale>
 * - totalPages: 后端计算更可靠（避免前端精度问题）
 * - page 从 1 开始: 用户习惯 + URL 友好（/proposals?page=1）
 * </rationale>
 *
 * @template T - 列表项类型
 * @property {T[]} items - 当前页数据（长度 ≤ pageSize）
 * @property {number} total - 总记录数
 * @property {number} page - 当前页码（从1开始）
 * @property {number} pageSize - 每页记录数（默认20）
 * @property {number} totalPages - 总页数（Math.ceil(total / pageSize)）
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 标书列表分页响应（ProposalCard 专用）
 *
 * <rationale>
 * 类型别名: 语义化 + 便于重构 + IDE 友好
 * </rationale>
 */
export interface ProposalListResponse extends PaginatedResponse<ProposalCard> {}

// ============================================================================
// 统计数据类型 (Statistics Types)
// ============================================================================

/**
 * 标书统计数据响应模型
 *
 * <rationale>
 * - 分状态统计: 用户需要了解"待完成草稿数"
 * - totalProposals: 虽可计算，但直接返回更方便（后端可能有其他状态如 deleted）
 * </rationale>
 *
 * <warning type="performance">
 * ⚠️ 当标书 >10K 时，COUNT(*) 查询需 1-2秒
 * 优化方案: Redis 缓存（5分钟）或物化视图
 * </warning>
 *
 * @property {number} totalProposals - 标书总数
 * @property {number} draftCount - 草稿数量
 * @property {number} reviewingCount - 审阅中数量
 * @property {number} completedCount - 已完成数量
 */
export interface StatisticsResponse {
  totalProposals: number;
  draftCount: number;
  reviewingCount: number;
  completedCount: number;
}

// ============================================================================
// 导出其他模块类型 (Export Module Types)
// ============================================================================

/**
 * 导出标书相关类型
 * 包括：创建表单、API请求/响应、下拉选项等
 */
export * from './proposal';

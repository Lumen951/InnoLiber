/**
 * @file proposalService.ts
 * @description 标书API服务 - 统一导出（Mock/Real切换）
 *
 * 🟡 MOCK-CODE - Phase 2 修改指南
 * ==========================================
 * 修改时机：Phase 2（后端API上线后，预计2025-11-20）
 *
 * 修改步骤：
 *   1. 删除第30行：import { MockProposalService } from './proposalService.mock';
 *   2. 删除第77-81行：Mock切换逻辑
 *   3. 改为直接导出：export const proposalService = new RealProposalService();
 *   4. 删除文件：proposalService.mock.ts
 *
 * 修改前：
 *   const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
 *   export const proposalService = USE_MOCK
 *     ? new MockProposalService()
 *     : new RealProposalService();
 *
 * 修改后：
 *   export const proposalService = new RealProposalService();
 *
 * 验证方法：
 *   1. 启动后端：cd backend && poetry run uvicorn app.main:app --reload
 *   2. 访问API文档：http://localhost:8000/docs
 *   3. 前端测试：创建标书并检查数据库
 * ==========================================
 *
 * <copyright>
 * Copyright (c) 2024-2025 InnoLiber Team
 * Licensed under the MIT License
 * </copyright>
 *
 * @author InnoLiber Team
 * @version 1.0.0
 */

import { MockProposalService } from './proposalService.mock';  // 🔴 Phase 2: 删除此行
import { RealProposalService } from './proposalService.real';

/**
 * 标书服务实例（Mock/Real自动切换）
 *
 * <rationale>
 * 设计决策：
 * - 使用环境变量控制Mock/Real切换
 * - 前端代码无需修改，只需改配置
 * - 开发环境默认Mock，生产环境强制Real
 *
 * 环境变量：
 * - VITE_USE_MOCK=true  -> MockProposalService（开发阶段）
 * - VITE_USE_MOCK=false -> RealProposalService（生产环境）
 * </rationale>
 *
 * <warning type="configuration">
 * ⚠️ 配置注意事项：
 * - .env.development: VITE_USE_MOCK=true（本地开发）
 * - .env.production: VITE_USE_MOCK=false（生产环境）
 * - 环境变量修改后需重启 npm run dev
 * </warning>
 *
 * @example
 * ```ts
 * // 在任何组件中使用
 * import { proposalService } from '@/services/proposalService';
 *
 * // 根据环境变量自动选择Mock或Real
 * const response = await proposalService.create(data);
 * ```
 */

// 🟡 MOCK-CODE - Phase 2 删除以下5行，改为直接导出RealProposalService
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const proposalService = USE_MOCK
  ? new MockProposalService()   // 🔴 Phase 2: 删除此行
  : new RealProposalService();  // ✅ Phase 2: 保留此行

// ✅ Phase 2 最终代码：
// export const proposalService = new RealProposalService();

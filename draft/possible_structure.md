
### 一、代码仓库架构设计：模块化 Monorepo

考虑到 Agent 产品的复杂性（涉及 Web UI、数据库、LLM 推理和 RDR 知识库管理）和我们对**代码一致性**和**可维护性**的极高要求，我们建议采用**模块化的 Monorepo（单体仓库）**结构。这与 Google 内部的 Piper/Google3 单体仓库的实践相一致，有助于统一代码风格、简化依赖管理，并使得**静态分析（Static Analysis）**工具能够高效地在整个代码库上运行。

#### 1. 仓库根目录结构 (`/agent-fund-assistant`)

| 目录名称 | 描述 | 核心内容/技术组件 |
| :--- | :--- | :--- |
| **`docs/`** | **【Claude Code 知识库】** 存储所有项目文档、规范和指南，供开发团队和 Agent 自身参考和查询。 | PRD 文档、NSFC/BIT 格式规范、RDR 框架白皮书、API 文档。 |
| **`backend/`** | **Agent 核心逻辑（RDR/LLM/DB 访问）**，包含 K-TAS, SPG-S, DDC-S 的服务实现。 | Python/Pytorch 代码，Agent 业务逻辑，LLM API 调用接口。 |
| **`data/`** | **RDR 知识库资产**，存储不可直接存入 PostgreSQL 的大型文件或预处理数据。 | RDR 科研语料库（原始文件）、预训练 Embedding 模型（如 `nvidia/NV-Embed-v2`），数据库 Schema 定义。 |
| **`frontend/`** | **ECR 网页界面**，负责用户交互和数据可视化。 | React/Vue 等前端框架代码，NSFC 表单 UI 组件。 |
| **`tools/`** | **工程质量保障工具**，包括静态分析和代码格式化工具。 | **DDC-S 格式检查器**的规则定义、Presubmit Hooks 脚本。 |
| **`config/`** | 系统配置，包括 DeepSeek API 密钥、数据库连接串、模型路由配置。 | 环境配置文件 (`.env`)、LLM Model Router 配置。 |

#### 2. 核心模块代码结构 (`/backend/`) 细化

`backend/` 目录将体现 Agent 的高能动性核心功能，严格按照 PRD 中定义的三大服务进行模块化：

*   **`backend/ktas_service/`**: **知识与趋势分析服务**。负责 RDR 框架中的数据准备、嵌入分析和趋势识别。
    *   *功能：* 文献聚类、SARG (Search Argument) 优化，语义搜索 API。
*   **`backend/spgs_service/`**: **结构化提案生成服务**。核心推理和内容创作模块。
    *   *功能：* LLM 调用（DeepSeek R1/V3.2 路由）[User Query]，结构化综述生成，预实验和可行性建议逻辑。
*   **`backend/ddcs_service/`**: **文档设计与合规服务**。负责内容格式化和规范性检查。
    *   *功能：* 文档排版引擎、格式规范规则集、排版一致性检查逻辑 [Previous Discussion, 550]。
*   **`backend/storage_manager/`**: **事务存储管理器**。直接与 PostgreSQL 交互，保障数据安全。
    *   *功能：* 事务 API 封装，确保 **ACID** 属性（原子性、一致性、隔离性、持久性）。包含 Lock Manager 和 Log Manager 的调用/交互逻辑，保证事务的**持久性**。

#### 3. 数据库和索引（内置于 PostgreSQL）

所有事务数据和 RDR 的向量数据都将存储在 PostgreSQL 内部，以简化早期架构并保持数据安全性 [User Query]。

*   **表结构（示例）：**
    *   `proposals_tbl` (存储 ECR 标书草稿，需 MVCC 隔离)
    *   `scientific_corpus_tbl` (存储 RDR 原始文献的元数据和文本)
    *   `embedding_index_tbl` (存储 RDR 生成的**嵌入表示**，需使用 **GiST 或 R-tree** 等多维索引进行高效语义搜索)。

---

### 二、 Claude Code Skills 配置与知识检索

为了最大化 **Claude Code** 的开发效率和 Agent 的**能动性**，我们需要确保开发环境具备以下技能和知识源。

#### 1. Claude Code Execution Skills

Claude Code 需要能够执行我们技术栈中的核心操作：

1.  **Python/Pytorch Skill:** 用于构建和迭代 RDR 的 K-TAS 和 SPG-S 逻辑，进行模型推理和服务编排 [User Query]。
2.  **SQL Skill:** 用于数据库 Schema 定义、数据迁移和查询优化。这对于与 PostgreSQL 的**事务存储管理器** 进行交互至关重要。
3.  **Static Analysis/Linting Skill:** 能够运行和解释 DDC-S 模块的**自动化工具核查**结果 [User Query, 193]。例如，在提交前（Presubmit）自动检查代码和文档的格式合规性。

#### 2. 知识库配置：Agent 文档和 RDR 知识的存储与查询

确保 Claude Code 能够像 Google 工程师使用 **Code Search** 和 **go/links** 那样，快速访问规范的文档和现有的 RDR 知识。

| 知识源 | 存储位置 | 目的与配置要求 |
| :--- | :--- | :--- |
| **PRD 文档与合规规范** | **`docs/` 目录 (Markdown)** | 包含 PRD 的所有功能、UX/UI 要求和**NSFC/BIT 格式规范**的详细规则。Claude Code 必须配置为**优先查询**此目录，以确保代码实现与规范严格对齐。 |
| **RDR 框架白皮书** | **`docs/` 目录 (PDF/Markdown)** | 存储 RDR 管道的详细方法论（数据准备、内容推理、嵌入分析）。Claude Code 需要查询这些文档来理解如何实现 RDR 的**高能动性**逻辑。 |
| **底层数据库架构文档** | **`docs/` 目录** | 详细描述 **MVCC** 机制、**WAL 协议**、**Context-Based Allocator** 的实现规范和**准入控制**的内存阈值，便于开发人员理解系统设计的**安全和性能考量** [User Query]。 |
| **Agent 核心代码 (`backend/`)** | **代码库本身** | 供 Claude Code 阅读现有 API、实现代码审查 (Code Review) 和进行**重构（Refactoring）**。代码应包含清晰的注释（`docstrings`）和设计文档（类似于 Google 的 `g3doc`），以促进知识共享。 |
| **RDR 科学知识库** | **PostgreSQL (向量索引)** | 存储 ECR 的标书草稿和 RDR 生成的**语义索引**. 虽然 Claude Code 不会直接查询 PB 级数据，但它需要**查询 Schema** 和**检索 API** 的用法，这些 API 由 `backend/storage_manager` 提供。 |

#### 3. 自动化与能动性支持（Presubmit Checks）

为了实施 DDC-S 的**自动化能动性**，开发工作流中必须集成 **Presubmit Checks**：

*   **流程：** 开发者提交更改（Changelist/CL） 后，在代码审查 (Code Review) 前，**自动化工具**（如 Tricorder 或自定义 Linter）将运行。
*   **DDC-S 自动化检查：** 检查代码风格、LLM 调用参数的合规性，以及文档是否符合 NSFC/BIT 格式（例如，图表题是否居中、字体是否宋体小四）。
*   **修复反馈：** 静态分析的结果将以评论形式显示在代码审查工具中。对于格式错误，系统应提供**自动修复**功能（类似于 Google 的 `clang-format`），以减少 ECR 和开发者的返工。



## Agent MVP 1.0 代码仓库架构图

我们使用 `/agent-fund-assistant` 作为 Monorepo 的根目录。

```
/agent-fund-assistant
├── docs/                                # 【Agent 核心知识库/可查询文档】
│   ├── prd/
│   │   ├── PRD_MVP_1.0.md             # 最终产品需求文档
│   │   └── Technical_Specs.md         # 架构、MVCC、Context分配等技术选型说明
│   ├── compliance/
│   │   ├── NSFC_Formatting_Rules.pdf  # 国家自然科学基金申请书格式要点
│   │   └── BIT_Thesis_Norms.pdf       # 北京理工大学论文撰写规范 (DDC-S 规则集)
│   └── rdr_framework/
│       └── RDR_Methodology.md         # RDR 框架（I, M, O, W, R 视角分析）
│
├── backend/                             # Agent 核心逻辑 (Python/Pytorch)
│   ├── ktas_service/                    # 知识与趋势分析服务 (K-TAS)
│   │   ├── embed_analysis.py            # 嵌入分析、聚类和趋势识别
│   │   └── retrieval_api.py             # 语义检索 API (调用 PostgreSQL 向量索引)
│   ├── spgs_service/                    # 结构化提案生成与指导服务 (SPG-S)
│   │   ├── llm_router.py                # DeepSeek V3.2/R1 模型路由和推理调用 [User Query]
│   │   ├── content_generator.py         # 标书内容生成（利用 DeepSeek R1 的推理能力）
│   │   └── feasibility_advisor.py       # 可行性/预实验建议逻辑 (高能动性体现)
│   ├── ddcs_service/                    # 文档设计与合规服务 (DDC-S)
│   │   └── formatting_checker.py        # 格式合规检查（NSFC/BIT 规则的自动化工具核查核心）
│   ├── storage_manager/                 # 数据库事务与存储管理
│   │   ├── db_connector.py              # PostgreSQL 连接与 WAL/MVCC 封装
│   │   └── context_allocator.py         # 内存上下文 (Memory Context) 管理实现 [User Query]
│   └── main_agent_orchestrator.py       # Agent 流程调度器 (协调 K-TAS, SPG-S, DDC-S)
│
├── frontend/                            # ECR 网页界面 (Client)
│   ├── src/                             # 前端源代码（React/Vue 等）
│   │   └── ProposalForm.jsx             # ECR 最小化输入界面组件
│   └── assets/                          # 静态资源（用于 UI 中的对比、重复元素）
│
├── data/                                # RDR 知识库资产
│   └── embeddings/
│       ├── science_corpus_schema.sql    # PostgreSQL 向量索引表的 Schema 定义
│       └── raw_rdr_corpus/              # 原始科研文献语料库
│
└── tools/                               # 工程质量与自动化工具
    ├── presubmit/                       # 预提交检查 (Presubmit Checks) 脚本
    │   └── static_analysis_hook.sh      # 运行 DDC-S 格式检查器的 Hook
    ├── linting/                         # 代码风格检查配置
    └── BUILD.bazel/                     # Bazel 或其他构建系统的配置
```

### 三、核心模块与 Claude Code 配置说明

这个 Monorepo 架构确保了高能动性 Agent 的逻辑分离和知识可达性。

#### 1. Agent 知识库 (`docs/`) 的配置

为了最大化 Claude Code 的能动性，`docs/` 目录被设计为系统的**规范中心**和**可查询的知识库**。

*   **合规性知识：** `compliance/` 目录直接存储了 DDC-S 实现所需的**强制性规则**（例如，标题必须是**黑体三号字加粗居中**，正文必须是**宋体小四号字，行距 22磅**）。Claude Code 在编写 `ddcs_service` 时，应配置为优先参考这些规范。
*   **RDR 方法论：** `rdr_framework/` 存储了基础模型的分析视角，例如：投入 (I)、建模 (M)、输出 (O)、目标 (W)、学习方法 (R)。Claude Code 在实现 `ktas_service` 的**战略定位**和**视角分解**功能时，将依赖这些文档来指导 LLM 的提示工程。
*   **PRD 驱动：** `prd/` 目录确保所有开发都围绕已确定的**核心目标**（提升质量，高能动性）和**技术选型**（MVCC、Context 分配）展开 [Previous Discussion]。

#### 2. Agent 核心逻辑 (`backend/`)

Agent 的能动性通过三个松耦合的服务实现：

*   **K-TAS (ktas_service):** 专注于**自主分析**，通过 `embed_analysis.py` 实现对新兴趋势的识别 [Previous Discussion]。
*   **SPG-S (spgs_service):** 负责**内容生成和主动建议**。
    *   `feasibility_advisor.py` 实现了提案提交前的**风险识别和预实验建议**，这是 Agent 高能动性的关键体现 [Previous Discussion]。
    *   `llm_router.py` 负责根据任务的**推理强度**动态调用 DeepSeek R1 或 DeepSeek V3.2，实现高效且高质量的内容生成 [User Query]。
*   **DDC-S (ddcs_service):** 强制执行格式规范。该模块的规则必须与 `tools/presubmit` 中的自动化工具相匹配。

#### 3. 存储与安全 (`storage_manager/`)

`storage_manager` 是**任务关键型**系统设计的核心 [Previous Discussion]，负责数据安全和性能。

*   **MVCC 和 WAL：** `db_connector.py` 必须严格封装 PostgreSQL 的事务 API，确保标书数据的**隔离性**和**持久性** [User Query]。
*   **内存上下文：** `context_allocator.py` 负责实现 **Context-Based Allocator** [User Query, 44]，确保 RDR 复杂查询的中间数据能够被安全、高效地分配和释放，以提高系统的**可维护性** [User Query]。

#### 4. 工程质量 (`tools/`)

`tools/` 目录通过自动化机制保障产品的**规范性**。

*   **自动化合规：** `static_analysis_hook.sh` 在代码提交前自动运行 `ddcs_service` 的格式检查器。这借鉴了 Google 工程实践中利用 **静态分析工具（Tricorder）**作为**预提交检查**（Presubmit checks）的模式。通过自动化执行，可以保证 Agent 输出的标书在交付前就满足所有严格的 NSFC/BIT 格式要求 [Previous Discussion]。

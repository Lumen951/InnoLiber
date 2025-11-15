# InnoLiber 项目架构全景图

> **适合人群**：希望理解大型项目架构设计的开发者
>
> **学习时长**：约 50-60 分钟
>
> **先修知识**：软件工程基础、MVC 模式概念、微服务概念

---

## 📌 什么是 InnoLiber？

**一句话解释**：InnoLiber 是一个 AI 驱动的科研标书申请助手系统，专门帮助早期职业研究者（ECR）提高 NSFC（国家自然科学基金委）申请质量。

### 项目愿景

**问题背景**：科研人员在申请 NSFC 基金时面临诸多挑战：

```
传统申请流程的痛点：
❌ 文献调研耗时费力，难以把握研究前沿
❌ 标书撰写缺乏经验，格式合规性差
❌ 研究方案设计不够完善，可行性分析不足
❌ 缺少专业指导，申请成功率低

InnoLiber 的解决方案：
✅ AI 驱动的文献趋势分析，快速把握研究前沿
✅ 智能化的标书内容生成，结构化写作指导
✅ 自动化的格式合规检查，确保提交质量
✅ 全流程的申请助手，提升申请成功率
```

### 在软件架构中的定位

InnoLiber 采用现代化的**三层架构 + 微服务设计**，结合 AI 大模型能力：

**架构特色**：
- ✅ **Monorepo 结构**：前后端代码统一管理，提高开发效率
- ✅ **微服务架构**：三大核心服务独立部署，高内聚低耦合
- ✅ **AI 原生设计**：深度集成 DeepSeek LLM，提供智能化功能
- ✅ **容器化部署**：Docker + Docker Compose，环境一致性保证

---

## 🏗️ 项目整体架构（俯视图）

### 1. 架构层次图 = 摩天大楼的设计蓝图

**类比**：InnoLiber 就像一栋现代化的智能办公楼，每一层都有明确的功能定位。

```
┌─────────────────────────────────────────────────────────────┐
│                   InnoLiber 系统架构图                      │
└─────────────────────────────────────────────────────────────┘

📱 前端展示层 (Presentation Layer)
├─────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Ant Design                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   登录注册   │ │   仪表板     │ │   标书管理   │          │
│  │  LoginPage  │ │  Dashboard  │ │ Proposals   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   数据分析   │ │   文献库     │ │   系统设置   │          │
│  │  Analysis   │ │  Library    │ │  Settings   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤

🔗 API 网关层 (API Gateway Layer)
├─────────────────────────────────────────────────────────────┤
│  FastAPI 0.118.2 + JWT 认证 + CORS                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              统一 API 入口                               │ │
│  │  /api/v1/auth/*    - 认证授权                          │ │
│  │  /api/v1/proposals/* - 标书管理                        │ │
│  │  /api/v1/k-tas/*   - 知识趋势分析                      │ │
│  │  /api/v1/spg-s/*   - 结构化方案生成                    │ │
│  │  /api/v1/ddc-s/*   - 文档合规检查                      │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤

⚡ 业务逻辑层 (Business Logic Layer)
├─────────────────────────────────────────────────────────────┤
│                     三大核心服务                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │    K-TAS    │ │   SPG-S     │ │   DDC-S     │          │
│  │ 知识趋势分析 │ │ 结构化方案  │ │ 文档合规    │          │
│  │   服务       │ │  生成服务   │ │  检查服务   │          │
│  │             │ │             │ │             │          │
│  │ • 文献爬取   │ │ • DeepSeek  │ │ • 格式规则  │          │
│  │ • 向量聚类   │ │   LLM 集成  │ │   引擎     │          │
│  │ • 趋势分析   │ │ • 模板生成  │ │ • 自动检查  │          │
│  │ • 语义搜索   │ │ • 可行性    │ │ • 修改建议  │          │
│  │             │ │   分析     │ │             │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤

💾 数据持久层 (Data Persistence Layer)
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ PostgreSQL  │ │    Redis    │ │  文件存储   │          │
│  │  + pgvector │ │             │ │             │          │
│  │             │ │ • Session   │ │ • 上传文件  │          │
│  │ • 用户数据   │ │   缓存     │ │ • 模板文档  │          │
│  │ • 标书内容   │ │ • 任务队列  │ │ • 生成报告  │          │
│  │ • 向量嵌入   │ │ • 热点数据  │ │             │          │
│  │ • 文献语料   │ │             │ │             │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘

🔄 外部集成层 (External Integration Layer)
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ DeepSeek    │ │    arXiv    │ │  阿里云     │          │
│  │    LLM      │ │    API      │ │   服务     │          │
│  │             │ │             │ │             │          │
│  │ • 内容生成   │ │ • 文献爬取  │ │ • 邮件推送  │          │
│  │ • 智能分析   │ │ • 数据获取  │ │ • 对象存储  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

**项目文件位置**：`docs/technical/00_development_plan.md:1-50`（完整架构描述）

---

## 🎯 三大核心服务详解

### 2. K-TAS：知识趋势分析服务 = 智能图书管理员

**类比**：K-TAS 就像一位博学的图书管理员，能够快速帮你找到相关文献，分析研究趋势。

**核心功能架构**：

```python
# 项目实例（来自 docs/technical/00_development_plan.md:180-220）

class KnowledgeTrendAnalysisService:
    """
    K-TAS 服务架构设计

    功能模块：
    - 文献数据爬取与预处理
    - 向量化嵌入与语义搜索
    - 聚类分析与趋势识别
    - 研究热点与发展方向分析
    """

    def __init__(self):
        self.arxiv_crawler = ArxivDataCrawler()      # arXiv 数据爬虫
        self.vector_engine = VectorSearchEngine()    # 向量搜索引擎
        self.cluster_analyzer = ClusterAnalyzer()    # 聚类分析器
        self.trend_detector = TrendDetector()        # 趋势检测器

    async def analyze_research_trend(self, field: str, timespan: str):
        """
        🔑 核心方法：研究趋势分析
        """
        # 1. 数据获取
        papers = await self.arxiv_crawler.fetch_papers(field, timespan)

        # 2. 向量化处理
        embeddings = await self.vector_engine.embed_papers(papers)

        # 3. 聚类分析
        clusters = await self.cluster_analyzer.cluster_papers(embeddings)

        # 4. 趋势识别
        trends = await self.trend_detector.detect_trends(clusters)

        return {
            "hot_topics": trends.hot_topics,
            "emerging_fields": trends.emerging_fields,
            "research_gaps": trends.research_gaps
        }
```

**技术架构特点**：
- ✅ **PyTorch 2.5.1**：深度学习框架，用于文本嵌入和聚类分析
- ✅ **pgvector**：PostgreSQL 向量扩展，高效的向量相似度搜索
- ✅ **异步处理**：asyncio + aiohttp，支持大规模并发数据获取

**数据流程**：
```
arXiv 论文 → 数据清洗 → 文本嵌入 → 向量存储 → 聚类分析 → 趋势识别 → 可视化展示
```

---

### 3. SPG-S：结构化方案生成服务 = 智能写作助手

**类比**：SPG-S 就像一位经验丰富的科研导师，能够指导你撰写高质量的标书申请。

**核心功能架构**：

**项目实例**（来自 `docs/technical/00_development_plan.md:220-260`）：

```python
class StructuredProposalGenerationService:
    """
    SPG-S 服务架构设计

    功能模块：
    - DeepSeek LLM 集成与调用
    - 结构化模板管理
    - 智能内容生成与优化
    - 可行性分析与建议
    """

    def __init__(self):
        self.llm_client = DeepSeekLLMClient()        # DeepSeek LLM 客户端
        self.template_manager = TemplateManager()     # 模板管理器
        self.content_generator = ContentGenerator()   # 内容生成器
        self.feasibility_analyzer = FeasibilityAnalyzer()  # 可行性分析器

    async def generate_proposal_section(self, section_type: str, context: dict):
        """
        🔑 核心方法：结构化内容生成
        """
        # 1. 获取模板
        template = await self.template_manager.get_template(section_type)

        # 2. 构建提示词
        prompt = self._build_prompt(template, context)

        # 3. LLM 内容生成
        content = await self.llm_client.generate(
            prompt=prompt,
            max_tokens=2000,
            temperature=0.7
        )

        # 4. 内容后处理
        processed_content = await self.content_generator.post_process(content)

        # 5. 可行性评估
        feasibility_score = await self.feasibility_analyzer.analyze(processed_content)

        return {
            "content": processed_content,
            "feasibility_score": feasibility_score,
            "suggestions": feasibility_score.suggestions
        }
```

**DeepSeek LLM 集成模式**：

```python
# 项目实例（来自 backend/app/core/config.py:45-60）

class DeepSeekLLMClient:
    """
    DeepSeek LLM API 客户端封装
    支持流式响应和批量处理
    """

    def __init__(self):
        self.api_key = settings.DEEPSEEK_API_KEY
        self.base_url = "https://api.deepseek.com/v1"
        self.client = AsyncOpenAI(
            api_key=self.api_key,
            base_url=self.base_url
        )

    async def generate_structured_content(self, template: str, data: dict):
        """
        结构化内容生成
        """
        messages = [
            {
                "role": "system",
                "content": "你是一位资深的 NSFC 申请专家，擅长撰写高质量的标书申请。"
            },
            {
                "role": "user",
                "content": f"请根据模板生成内容：\n模板：{template}\n数据：{data}"
            }
        ]

        response = await self.client.chat.completions.create(
            model="deepseek-chat",
            messages=messages,
            max_tokens=2000,
            temperature=0.7
        )

        return response.choices[0].message.content
```

**技术架构特点**：
- ✅ **OpenAI SDK 兼容**：使用标准 OpenAI API 接口，便于切换模型
- ✅ **异步流式处理**：支持大文本生成的流式响应
- ✅ **模板化生成**：结构化的提示词模板，确保输出质量

---

### 4. DDC-S：文档合规检查服务 = 智能校对员

**类比**：DDC-S 就像一位严谨的文档校对员，能够自动检查格式规范，提出修改建议。

**核心功能架构**：

**项目实例**（来自 `docs/technical/00_development_plan.md:260-300`）：

```python
class DocumentComplianceCheckingService:
    """
    DDC-S 服务架构设计

    功能模块：
    - NSFC 格式规则引擎
    - 文档结构分析与验证
    - 自动化合规检查
    - 修改建议与格式标准化
    """

    def __init__(self):
        self.rule_engine = NSFCRuleEngine()          # NSFC 规则引擎
        self.document_parser = DocumentParser()      # 文档解析器
        self.compliance_checker = ComplianceChecker() # 合规检查器
        self.suggestion_generator = SuggestionGenerator() # 建议生成器

    async def check_document_compliance(self, document: UploadedFile):
        """
        🔑 核心方法：文档合规检查
        """
        # 1. 文档解析
        parsed_doc = await self.document_parser.parse(document)

        # 2. 规则加载
        rules = await self.rule_engine.load_nsfc_rules()

        # 3. 合规性检查
        compliance_result = await self.compliance_checker.check(parsed_doc, rules)

        # 4. 生成修改建议
        suggestions = await self.suggestion_generator.generate(
            compliance_result.violations
        )

        return {
            "compliance_score": compliance_result.score,
            "violations": compliance_result.violations,
            "suggestions": suggestions,
            "auto_fix_available": compliance_result.auto_fixable
        }
```

**NSFC 规则引擎设计**：

```python
# 项目实例（规则引擎架构设计）

class NSFCRuleEngine:
    """
    NSFC 格式规则引擎
    基于规则驱动架构，支持动态规则更新
    """

    def __init__(self):
        self.rules = {}
        self.rule_loader = RuleLoader()

    async def load_nsfc_rules(self):
        """
        加载 NSFC 格式规则
        """
        # 页面格式规则
        page_format_rules = {
            "page_margin": {"top": 2.5, "bottom": 2.5, "left": 2.0, "right": 2.0},
            "font_family": ["Times New Roman", "宋体"],
            "font_size": {"title": 14, "body": 12, "footnote": 10},
            "line_spacing": 1.5,
            "page_limit": {"total": 60, "main_content": 50}
        }

        # 内容结构规则
        content_structure_rules = {
            "required_sections": [
                "项目摘要", "立项依据", "研究内容", "研究方案",
                "可行性分析", "预期成果", "参考文献"
            ],
            "section_order": ["摘要", "依据", "内容", "方案", "分析", "成果", "文献"],
            "word_limits": {
                "摘要": 400,
                "立项依据": 8000,
                "研究内容": 6000
            }
        }

        # 引用格式规则
        citation_rules = {
            "format": "GB/T 7714-2015",
            "numbering": "sequential",
            "in_text_format": "[数字]"
        }

        return {
            "page_format": page_format_rules,
            "content_structure": content_structure_rules,
            "citation": citation_rules
        }
```

**技术架构特点**：
- ✅ **规则驱动架构**：灵活的规则配置，支持不同申请类型
- ✅ **文档解析引擎**：支持 Word、PDF 等多种格式
- ✅ **自动修复能力**：部分格式错误可自动修正

---

## 🏢 Monorepo 项目结构解析

### 5. 目录结构 = 企业组织架构图

**类比**：Monorepo 就像一个大企业的组织架构，每个部门职责明确，但协作紧密。

**项目实例**（来自项目根目录）：

```bash
# ============================================================================
# InnoLiber Monorepo 结构（实际项目目录）
# ============================================================================

InnoLiber/                              # 🏢 企业总部
├── backend/                            # 🏭 后端开发部门
│   ├── app/                           # 核心应用代码
│   │   ├── main.py                    # FastAPI 应用入口
│   │   ├── core/                      # 核心模块
│   │   │   ├── config.py              # 配置管理
│   │   │   ├── security.py            # 安全认证
│   │   │   └── dependencies.py        # 依赖注入
│   │   ├── api/                       # API 路由层
│   │   │   └── v1/                    # v1 版本 API
│   │   │       ├── auth.py            # 认证 API
│   │   │       ├── proposals.py       # 标书管理 API
│   │   │       ├── k_tas.py           # K-TAS 服务 API
│   │   │       ├── spg_s.py           # SPG-S 服务 API
│   │   │       └── ddc_s.py           # DDC-S 服务 API
│   │   ├── models/                    # 数据模型层
│   │   │   ├── user.py                # 用户模型
│   │   │   ├── proposal.py            # 标书模型
│   │   │   └── corpus.py              # 语料模型
│   │   ├── schemas/                   # Pydantic 模式
│   │   ├── crud/                      # 数据访问层
│   │   └── services/                  # 业务逻辑层
│   │       ├── k_tas_service.py       # K-TAS 业务逻辑
│   │       ├── spg_s_service.py       # SPG-S 业务逻辑
│   │       └── ddc_s_service.py       # DDC-S 业务逻辑
│   ├── alembic/                       # 数据库迁移
│   ├── Dockerfile                     # 后端容器化配置
│   ├── pyproject.toml                 # Poetry 依赖管理
│   └── poetry.lock                    # 依赖锁定文件
│
├── frontend/                           # 🎨 前端设计部门
│   ├── src/                           # 源代码目录
│   │   ├── pages/                     # 页面组件
│   │   │   ├── Dashboard.tsx          # 仪表板页面
│   │   │   ├── LoginPage.tsx          # 登录页面
│   │   │   ├── RegisterPage.tsx       # 注册页面
│   │   │   ├── ProposalCreatePage.tsx # 标书创建页面
│   │   │   ├── ProposalEditPage.tsx   # 标书编辑页面
│   │   │   ├── AnalysisPage.tsx       # 数据分析页面
│   │   │   ├── LibraryPage.tsx        # 文献库页面
│   │   │   └── SettingsPage.tsx       # 设置页面
│   │   ├── components/                # 通用组件
│   │   │   ├── SidebarLayout.tsx      # 侧边栏布局
│   │   │   ├── ProposalCard.tsx       # 标书卡片组件
│   │   │   └── StatusTag.tsx          # 状态标签组件
│   │   ├── store/                     # Zustand 状态管理
│   │   │   ├── authStore.ts           # 认证状态
│   │   │   └── proposalStore.ts       # 标书状态
│   │   ├── services/                  # API 服务层
│   │   │   ├── api.ts                 # API 基础配置
│   │   │   └── proposalService.ts     # 标书服务
│   │   ├── types/                     # TypeScript 类型定义
│   │   ├── hooks/                     # 自定义 Hooks
│   │   ├── utils/                     # 工具函数
│   │   ├── App.tsx                    # 主应用组件
│   │   └── main.tsx                   # 应用入口
│   ├── public/                        # 静态资源
│   ├── Dockerfile                     # 前端容器化配置
│   ├── nginx.conf                     # Nginx 配置
│   ├── package.json                   # npm 依赖管理
│   └── vite.config.ts                 # Vite 构建配置
│
├── data/                              # 📚 数据资源部门
│   ├── external/                      # 外部数据（用户提供）
│   │   ├── nsfc_samples/              # NSFC 样本文档
│   │   └── bit_guidelines/            # BIT 格式规范
│   ├── corpus/                        # 文献语料库
│   │   ├── arxiv_papers/              # arXiv 论文数据
│   │   └── processed/                 # 处理后数据
│   └── templates/                     # 模板文件
│       ├── nsfc_templates/            # NSFC 申请模板
│       └── proposal_templates/        # 标书模板
│
├── docs/                              # 📖 文档管理部门
│   ├── technical/                     # 技术文档
│   │   ├── 00_development_plan.md     # 开发计划
│   │   ├── 02_database_design.md      # 数据库设计
│   │   └── 03_api_specification.md    # API 规范
│   ├── design/                        # 设计文档
│   │   └── frontend_pages_complete.md # 前端设计
│   └── study/                         # 学习文档（本目录）
│       ├── README.md                  # 学习中心首页
│       ├── 01_fastapi_basics.md       # FastAPI 基础
│       └── ... (其他技术学习文档)
│
├── tools/                             # 🔧 工程工具部门
│   ├── scripts/                       # 自动化脚本
│   │   ├── setup_env.py               # 环境配置脚本
│   │   └── data_migration.py          # 数据迁移脚本
│   └── ci_cd/                         # CI/CD 配置
│
├── docker-compose.yml                 # 🐳 开发环境编排
├── docker-compose.prod.yml            # 🐳 生产环境编排
├── .env.example                       # 环境变量模板
├── .gitignore                         # Git 忽略规则
└── README.md                          # 项目说明文档
```

**Monorepo 架构优势**：

```python
# 项目管理优势对比

# ❌ 多仓库（Multi-repo）问题：
problems = [
    "版本同步困难：前后端版本不一致导致 API 兼容性问题",
    "依赖管理复杂：跨仓库依赖更新需要手动协调",
    "CI/CD 流程分散：需要为每个仓库单独配置",
    "代码重用困难：类型定义、工具函数难以共享",
    "协作效率低：开发者需要切换多个仓库"
]

# ✅ Monorepo 解决方案：
solutions = [
    "统一版本管理：前后端同步发布，避免兼容性问题",
    "共享依赖配置：类型定义在 frontend/src/types 中统一管理",
    "集成 CI/CD：一次提交触发前后端完整测试流程",
    "代码复用简单：工具函数、常量在 tools/ 目录共享",
    "开发体验优化：一个 Git 仓库包含完整项目上下文"
]
```

---

## 🔄 数据流架构解析

### 6. 数据流向 = 城市交通系统

**类比**：InnoLiber 的数据流就像一个智慧城市的交通系统，数据像车辆一样在各个"站点"间流转。

**完整数据流图**：

```
┌─────────────────────────────────────────────────────────────┐
│                    InnoLiber 数据流架构图                    │
└─────────────────────────────────────────────────────────────┘

🌐 用户交互层
   │
   ▼
┌─────────────────────────────────────────────────────────────┐
│  📱 前端应用 (React + TypeScript)                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ 用户登录     │ │ 创建标书     │ │ 数据分析     │          │
│  │ authStore   │ │ proposalStore│ │ 可视化图表   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
   │ HTTP/HTTPS + JSON
   ▼
┌─────────────────────────────────────────────────────────────┐
│  🔗 API 网关 (FastAPI)                                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │               请求路由与认证                             │ │
│  │  JWT Token 验证 → 权限检查 → 业务路由                   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
   │
   ▼ 分发到三大服务
┌─────────────────────────────────────────────────────────────┐
│  ⚡ 业务服务层                                              │
│                                                               │
│  📊 K-TAS 数据流：                                          │
│  arXiv API → 数据清洗 → 文本嵌入 → 向量存储 → 聚类分析      │
│                                                               │
│  🤖 SPG-S 数据流：                                          │
│  用户输入 → 模板加载 → DeepSeek LLM → 内容生成 → 后处理      │
│                                                               │
│  📝 DDC-S 数据流：                                          │
│  上传文档 → 解析内容 → 规则检查 → 合规评分 → 修改建议        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
   │
   ▼ 数据持久化
┌─────────────────────────────────────────────────────────────┐
│  💾 数据持久层                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ PostgreSQL  │ │    Redis    │ │  文件系统   │          │
│  │ + pgvector  │ │             │ │             │          │
│  │             │ │             │ │             │          │
│  │ • 用户表     │ │ • 会话缓存  │ │ • 上传文件  │          │
│  │ • 标书表     │ │ • 任务队列  │ │ • 生成报告  │          │
│  │ • 向量表     │ │ • 热点数据  │ │ • 模板库   │          │
│  │ • 语料表     │ │             │ │             │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

**核心数据实体设计**（来自 `docs/technical/02_database_design.md:50-120`）：

```sql
-- ============================================================================
-- 核心数据模型（PostgreSQL + pgvector）
-- ============================================================================

-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    research_field VARCHAR(255),
    institution VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 标书表
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    research_field VARCHAR(255),
    funding_amount DECIMAL(12, 2),
    duration_months INTEGER,
    status proposal_status DEFAULT 'draft',
    content JSONB,  -- 🔑 结构化内容存储
    ai_analysis JSONB,  -- K-TAS 分析结果
    compliance_score DECIMAL(3, 2),  -- DDC-S 评分
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 科研语料表
CREATE TABLE scientific_corpus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    arxiv_id VARCHAR(50) UNIQUE,
    title TEXT NOT NULL,
    abstract TEXT,
    authors TEXT[],
    categories TEXT[],
    published_at DATE,
    citation_count INTEGER DEFAULT 0,
    full_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 向量嵌入表（支持语义搜索）
CREATE TABLE embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID,  -- 关联 proposals 或 scientific_corpus
    content_type VARCHAR(50),  -- 'proposal' 或 'paper'
    embedding vector(1536),  -- 🔑 pgvector 向量类型
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 向量相似度搜索索引
CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops);
```

**数据流处理模式**：

```python
# 项目实例：典型的数据处理流水线

class ProposalDataFlow:
    """
    标书数据流处理示例
    展示数据在系统中的完整流转过程
    """

    async def create_proposal_workflow(self, user_id: str, proposal_data: dict):
        """
        🔑 标书创建的完整数据流
        """
        # 1. 用户输入验证（前端 → API）
        validated_data = ProposalCreateSchema(**proposal_data)

        # 2. K-TAS 趋势分析（API → K-TAS Service）
        trend_analysis = await self.k_tas_service.analyze_research_trend(
            field=validated_data.research_field,
            keywords=validated_data.keywords
        )

        # 3. SPG-S 内容生成（API → SPG-S Service → DeepSeek LLM）
        generated_content = await self.spg_s_service.generate_proposal_content(
            template=validated_data.template_type,
            context={
                "user_input": validated_data.content,
                "trend_analysis": trend_analysis,
                "field": validated_data.research_field
            }
        )

        # 4. 数据持久化（Service → Database）
        proposal = await self.proposal_crud.create(
            user_id=user_id,
            title=validated_data.title,
            content=generated_content,
            ai_analysis=trend_analysis
        )

        # 5. 向量化存储（Database → Vector Store）
        await self.vector_service.store_proposal_embedding(
            proposal_id=proposal.id,
            text_content=generated_content.get("main_content", "")
        )

        # 6. 缓存热点数据（Database → Redis）
        await self.redis_client.cache_proposal_summary(
            proposal_id=proposal.id,
            summary_data={
                "title": proposal.title,
                "field": proposal.research_field,
                "status": proposal.status
            }
        )

        return proposal
```

**异步任务处理**：

```python
# 项目实例：Celery 异步任务架构

class BackgroundTaskFlow:
    """
    后台任务数据流
    处理耗时的 AI 分析任务
    """

    @celery_app.task
    async def process_paper_analysis(paper_ids: List[str]):
        """
        🔑 异步处理论文分析任务
        """
        # 1. 从数据库获取论文数据
        papers = await corpus_crud.get_papers(paper_ids)

        # 2. 批量向量化处理
        embeddings = await vector_service.batch_embed_papers(papers)

        # 3. 聚类分析
        clusters = await ml_service.cluster_papers(embeddings)

        # 4. 更新数据库
        await corpus_crud.update_paper_clusters(paper_ids, clusters)

        # 5. 通知前端任务完成
        await websocket_service.notify_analysis_complete(
            task_id=task_id,
            results=clusters
        )
```

---

## 🔧 技术栈集成模式

### 7. 技术组合 = 乐队协奏

**类比**：InnoLiber 的技术栈就像一个交响乐团，每种技术都是不同的乐器，和谐协作演奏出完美的乐章。

**前端技术栈协作模式**：

**项目实例**（来自 `frontend/src/App.tsx:15-50`）：

```tsx
// ============================================================================
// 前端技术栈集成示例
// ============================================================================

import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';  // 🎵 路由管理
import { ConfigProvider } from 'antd';                        // 🎵 UI 组件库
import zhCN from 'antd/locale/zh_CN';

// 🎵 状态管理（Zustand）
import { useAuthStore } from './store/authStore';
import { useProposalStore } from './store/proposalStore';

// 🎵 页面组件（React + TypeScript）
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProposalCreatePage from './pages/ProposalCreatePage';

/**
 * 🔑 主应用组件
 * 集成 React Router + Ant Design + Zustand
 */
function App() {
  const { initAuth } = useAuthStore();  // Zustand 状态管理

  // 🔑 应用启动时初始化认证状态
  useEffect(() => {
    initAuth();  // 验证 localStorage 中的 token
  }, []);

  return (
    // 🎵 Ant Design 配置提供者
    <ConfigProvider locale={zhCN}>
      <Routes>
        {/* 🎵 React Router 路由配置 */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/proposals/new" element={<ProposalCreatePage />} />
        <Route path="*" element={<div>404 - 页面未找到</div>} />
      </Routes>
    </ConfigProvider>
  );
}

export default App;
```

**后端技术栈集成模式**：

**项目实例**（来自 `backend/app/main.py:1-50`）：

```python
# ============================================================================
# 后端技术栈集成示例
# ============================================================================

from fastapi import FastAPI, Depends                   # 🎵 Web 框架
from fastapi.middleware.cors import CORSMiddleware    # 🎵 跨域中间件
from sqlalchemy.ext.asyncio import AsyncSession      # 🎵 异步数据库
import redis.asyncio as redis                         # 🎵 缓存系统

from app.core.config import settings                  # 🎵 配置管理
from app.core.security import get_current_user        # 🎵 认证系统
from app.api.v1 import auth, proposals, k_tas, spg_s, ddc_s  # 🎵 API 路由
from app.db.database import get_async_session         # 🎵 数据库会话

# 🔑 FastAPI 应用实例
app = FastAPI(
    title="InnoLiber API",
    description="AI-Powered Research Grant Application Assistant",
    version="0.1.0",
    docs_url="/docs",  # 自动生成的 API 文档
    redoc_url="/redoc"
)

# 🎵 CORS 中间件配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 前端开发服务器
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🎵 API 路由注册
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(proposals.router, prefix="/api/v1/proposals", tags=["Proposals"])
app.include_router(k_tas.router, prefix="/api/v1/k-tas", tags=["Knowledge Analysis"])
app.include_router(spg_s.router, prefix="/api/v1/spg-s", tags=["Proposal Generation"])
app.include_router(ddc_s.router, prefix="/api/v1/ddc-s", tags=["Compliance Checking"])

# 🔑 依赖注入示例
@app.get("/api/v1/user/profile")
async def get_user_profile(
    current_user: User = Depends(get_current_user),     # 🎵 认证依赖
    db: AsyncSession = Depends(get_async_session),      # 🎵 数据库依赖
    redis_client: redis.Redis = Depends(get_redis_client)  # 🎵 缓存依赖
):
    """
    获取用户档案
    展示多层依赖注入的协作模式
    """
    # 1. 从缓存获取用户信息
    cached_profile = await redis_client.get(f"user_profile:{current_user.id}")
    if cached_profile:
        return json.loads(cached_profile)

    # 2. 从数据库查询
    profile = await user_crud.get_user_profile(db, current_user.id)

    # 3. 更新缓存
    await redis_client.setex(
        f"user_profile:{current_user.id}",
        3600,  # 1小时过期
        json.dumps(profile.dict())
    )

    return profile

# 🎵 健康检查端点
@app.get("/health")
async def health_check():
    """
    系统健康检查
    供 Docker 容器健康检查使用
    """
    return {
        "status": "healthy",
        "service": "InnoLiber API",
        "version": "0.1.0"
    }
```

**数据层技术栈协作**：

**项目实例**（来自 `backend/app/db/database.py:20-60`）：

```python
# ============================================================================
# 数据库技术栈集成
# ============================================================================

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession  # 🎵 异步 ORM
from sqlalchemy.orm import sessionmaker                               # 🎵 会话管理
import redis.asyncio as redis                                         # 🎵 缓存层
from pgvector.sqlalchemy import Vector                               # 🎵 向量扩展

# 🔑 异步数据库引擎
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,           # 开发环境打印 SQL
    pool_size=20,                  # 连接池大小
    max_overflow=30,               # 最大溢出连接
    pool_pre_ping=True,            # 连接预检查
)

# 🔑 异步会话工厂
AsyncSessionLocal = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# 🎵 Redis 连接池
redis_pool = redis.ConnectionPool.from_url(
    settings.REDIS_URL,
    max_connections=20,
    decode_responses=True
)
redis_client = redis.Redis(connection_pool=redis_pool)

# 🔑 数据库会话依赖
async def get_async_session() -> AsyncSession:
    """
    FastAPI 依赖注入：异步数据库会话
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# 🔑 向量搜索集成
class VectorSearchService:
    """
    PostgreSQL + pgvector 向量搜索服务
    """

    async def similarity_search(
        self,
        query_vector: List[float],
        limit: int = 10,
        threshold: float = 0.8
    ):
        """
        🎵 多技术协作：SQLAlchemy + pgvector + 向量计算
        """
        async with AsyncSessionLocal() as session:
            # 🔑 向量相似度查询
            result = await session.execute(
                select(
                    Embedding.content_id,
                    Embedding.metadata,
                    Embedding.embedding.cosine_distance(query_vector).label("distance")
                )
                .where(Embedding.embedding.cosine_distance(query_vector) < (1 - threshold))
                .order_by(Embedding.embedding.cosine_distance(query_vector))
                .limit(limit)
            )
            return result.fetchall()
```

**容器化技术栈协作**：

**项目实例**（来自 `docker-compose.yml:1-50`）：

```yaml
# ============================================================================
# Docker 技术栈编排
# ============================================================================

version: '3.8'

services:
  # 🎵 数据库服务（PostgreSQL + pgvector）
  postgres:
    image: pgvector/pgvector:pg16
    container_name: innoliber_postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-innoliber}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-password}
      POSTGRES_DB: ${POSTGRES_DB:-innoliber}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - innoliber_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-innoliber}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 🎵 缓存服务（Redis）
  redis:
    image: redis:7-alpine
    container_name: innoliber_redis
    volumes:
      - redis_data:/data
    networks:
      - innoliber_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]

  # 🎵 后端服务（FastAPI）
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: innoliber_backend
    depends_on:
      postgres:
        condition: service_healthy  # 🔑 等待数据库就绪
      redis:
        condition: service_healthy  # 🔑 等待缓存就绪
    environment:
      DATABASE_URL: "postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"
      REDIS_HOST: redis
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
    ports:
      - "${BACKEND_PORT:-8000}:8000"
    networks:
      - innoliber_network

  # 🎵 前端服务（React + Nginx）
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: innoliber_frontend
    depends_on:
      - backend  # 🔑 等待后端就绪
    ports:
      - "${FRONTEND_PORT:-3000}:80"
    networks:
      - innoliber_network

# 🔑 数据卷定义
volumes:
  postgres_data:
  redis_data:

# 🔑 网络定义
networks:
  innoliber_network:
    driver: bridge
```

**技术栈协作优势**：

| 协作层面 | 技术组合 | 协作效果 | 项目体现 |
|---------|---------|---------|---------|
| **前端协作** | React + Zustand + Ant Design | 状态管理 + UI 组件 + 路由 | 统一的用户界面和交互体验 |
| **后端协作** | FastAPI + SQLAlchemy + Pydantic | API + ORM + 数据验证 | 类型安全的 API 开发 |
| **数据协作** | PostgreSQL + pgvector + Redis | 关系数据 + 向量搜索 + 缓存 | 高性能的数据存储和检索 |
| **部署协作** | Docker + Compose + Nginx | 容器化 + 编排 + 负载均衡 | 一致性的部署环境 |

---

## 🎯 快速上手指南

### Step 1：理解架构全貌

```bash
# 1. 下载项目
git clone https://github.com/your-org/InnoLiber.git
cd InnoLiber

# 2. 查看项目结构
tree -L 2
# 理解 backend/, frontend/, docs/, data/ 四个核心目录

# 3. 阅读架构文档
cat docs/technical/00_development_plan.md
cat docs/technical/02_database_design.md
```

### Step 2：搭建开发环境

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入必要配置

# 2. 启动基础服务
docker-compose up -d postgres redis

# 3. 启动后端开发环境
cd backend
poetry install
poetry run uvicorn app.main:app --reload

# 4. 启动前端开发环境
cd frontend
npm install
npm run dev
```

### Step 3：理解数据流

```bash
# 1. 查看 API 文档
open http://localhost:8000/docs

# 2. 测试基础 API
curl -X GET "http://localhost:8000/health"

# 3. 查看前端界面
open http://localhost:3000
```

### Step 4：深入核心服务

```python
# 理解三大服务的工作原理
# 1. K-TAS：查看 backend/app/services/k_tas_service.py
# 2. SPG-S：查看 backend/app/services/spg_s_service.py
# 3. DDC-S：查看 backend/app/services/ddc_s_service.py
```

---

## ⚠️ 架构设计陷阱（新手必看）

### 陷阱 1：忽略服务边界导致耦合过紧

```python
# ❌ 错误：K-TAS 直接调用 SPG-S 内部方法
class KTASService:
    def analyze_trend(self, field: str):
        # 直接调用 SPG-S 的内部实现
        spg_service = SPGSService()
        return spg_service._internal_llm_call(prompt)  # 违反封装

# ✅ 正确：通过定义良好的接口通信
class KTASService:
    def __init__(self, spg_client: SPGSClient):
        self.spg_client = spg_client

    def analyze_trend(self, field: str):
        # 通过 API 接口通信
        context = self._prepare_analysis_context(field)
        return self.spg_client.generate_content(context)
```

---

### 陷阱 2：数据层抽象不当

```python
# ❌ 错误：业务逻辑直接写 SQL
async def get_user_proposals(user_id: str):
    query = "SELECT * FROM proposals WHERE user_id = %s"
    result = await database.execute(query, user_id)  # 违反分层

# ✅ 正确：使用 Repository 模式
class ProposalRepository:
    async def get_by_user_id(self, user_id: str) -> List[Proposal]:
        return await self.session.execute(
            select(Proposal).where(Proposal.user_id == user_id)
        )

# 业务服务层
class ProposalService:
    def __init__(self, repo: ProposalRepository):
        self.repo = repo

    async def get_user_proposals(self, user_id: str):
        return await self.repo.get_by_user_id(user_id)
```

---

### 陷阱 3：忽略异步编程一致性

```python
# ❌ 错误：混用同步和异步代码
async def process_proposal(proposal_id: str):
    proposal = sync_db.get_proposal(proposal_id)      # 同步调用
    analysis = await async_ai_service.analyze(proposal)  # 异步调用
    sync_db.update_proposal(proposal_id, analysis)    # 同步调用

# ✅ 正确：保持异步一致性
async def process_proposal(proposal_id: str):
    async with AsyncSessionLocal() as session:
        proposal = await proposal_crud.get(session, proposal_id)
        analysis = await ai_service.analyze(proposal)
        await proposal_crud.update(session, proposal_id, analysis)
        await session.commit()
```

---

### 陷阱 4：缺乏错误处理和监控

```python
# ❌ 错误：缺少错误处理
async def generate_proposal_content(data: dict):
    result = await deepseek_client.generate(data)  # 可能失败
    return result  # 没有错误处理

# ✅ 正确：完整的错误处理
async def generate_proposal_content(data: dict):
    try:
        result = await deepseek_client.generate(data)

        # 记录成功日志
        logger.info(f"Successfully generated content for {data.get('title', 'Unknown')}")

        return result

    except DeepSeekAPIError as e:
        # API 级别错误
        logger.error(f"DeepSeek API error: {e}")
        raise APIException(f"Content generation failed: {e.message}")

    except Exception as e:
        # 未预期错误
        logger.exception(f"Unexpected error in content generation: {e}")
        raise InternalServerError("Content generation service unavailable")
```

---

### 陷阱 5：前端状态管理混乱

```tsx
// ❌ 错误：组件直接操作全局状态
function ProposalCard({ proposalId }: Props) {
  const proposals = useProposalStore(state => state.proposals);

  const handleDelete = () => {
    // 直接修改全局状态，无错误处理
    useProposalStore.setState(state => ({
      proposals: state.proposals.filter(p => p.id !== proposalId)
    }));
  };
}

// ✅ 正确：使用 action 方法和错误处理
function ProposalCard({ proposalId }: Props) {
  const { removeProposal, isLoading, error } = useProposals();

  const handleDelete = async () => {
    try {
      await removeProposal(proposalId);  // 调用封装的 action
      message.success('标书删除成功');
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };
}
```

---

## 📚 架构学习资源

### 官方资源
- **系统架构设计**：Context7 查询结果 `/websites/refactoring_guru-design-patterns`
- **FastAPI 架构模式**：Context7 查询结果 `/websites/fastapi_tiangolo`
- **微服务架构**：Martin Fowler - Microservices Pattern
- **领域驱动设计**：Eric Evans - Domain-Driven Design

### 项目中的参考文件
- **整体架构**：`docs/technical/00_development_plan.md` - 完整项目架构
- **数据库设计**：`docs/technical/02_database_design.md` - 数据模型设计
- **API 规范**：`docs/technical/03_api_specification.md` - 接口设计
- **前端架构**：`docs/design/frontend_pages_complete.md` - UI 架构

### 进阶学习主题
- **CQRS 模式**：命令查询责任分离
- **事件驱动架构**：异步消息处理
- **DDD 战术设计**：聚合、实体、值对象
- **微服务通信**：同步 vs 异步通信模式

---

## 🎯 实践练习建议

### 练习 1：绘制服务依赖图
```
任务：绘制 InnoLiber 三大服务的依赖关系图
要求：
- 标注每个服务的输入输出
- 识别服务间的通信方式
- 分析数据流向和时序
```

### 练习 2：设计新服务
```
任务：设计一个 "NTI-S" (Notification and Task Integration Service)
要求：
- 定义服务职责边界
- 设计 API 接口
- 规划数据模型
- 考虑与现有服务的集成
```

### 练习 3：架构重构分析
```
任务：分析如何将 InnoLiber 从 Monorepo 拆分为微服务
要求：
- 识别服务边界
- 分析数据一致性挑战
- 设计服务间通信协议
- 考虑部署和运维复杂性
```

---

## ✅ 学习检查清单

完成以下任务，说明你已经掌握 InnoLiber 项目架构：

- [ ] **理解整体架构**：能够解释四层架构的作用和关系
- [ ] **掌握三大服务**：理解 K-TAS、SPG-S、DDC-S 的功能和实现
- [ ] **理解数据流**：知道数据在系统中的完整流转过程
- [ ] **掌握技术栈协作**：理解各技术栈如何协同工作
- [ ] **理解 Monorepo 结构**：能够解释项目目录组织原则
- [ ] **掌握容器化架构**：理解 Docker Compose 服务编排
- [ ] **理解异步编程模式**：掌握 FastAPI + SQLAlchemy 异步模式
- [ ] **理解前端架构**：掌握 React + Zustand + Ant Design 集成
- [ ] **避免架构陷阱**：识别常见的设计问题和解决方案
- [ ] **读懂项目代码**：能够在代码中找到架构设计的体现

---

## 🎓 下一步学习

完成本文档后，建议继续学习：

1. **开发工作流**：`13_development_workflow.md` - 完整开发实践
2. **深入某个服务**：选择感兴趣的服务深入研究源码
3. **项目实战**：尝试为项目添加新的微服务

---

## 🚀 实际项目应用

**在 InnoLiber 项目中的体现**：

1. **清晰的架构分层**：展示层、API层、业务层、数据层职责明确
2. **微服务设计原则**：三大核心服务高内聚、低耦合
3. **现代化技术栈**：React 18、FastAPI、PostgreSQL、Docker 集成
4. **异步编程模式**：全链路异步处理，支持高并发
5. **容器化部署**：Docker Compose 环境一致性

**架构设计亮点**：
- ✅ 三层架构 + 微服务混合模式，平衡复杂性和可扩展性
- ✅ 领域驱动设计，业务逻辑清晰
- ✅ 依赖注入模式，提高代码可测试性
- ✅ 事件驱动的异步处理，提升用户体验
- ✅ Monorepo 管理，简化开发协作

**常用架构模式速查**：
```python
# 依赖注入
@app.get("/endpoint")
async def handler(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
): pass

# Repository 模式
class ProposalRepository:
    async def create(self, data: ProposalCreate): pass

# 服务层模式
class ProposalService:
    def __init__(self, repo: ProposalRepository): pass

# 工厂模式
class ServiceFactory:
    @staticmethod
    def create_k_tas_service(): pass
```

---

**文档版本**：v1.0
**最后更新**：2025-11-15
**维护者**：InnoLiber Team
**参考来源**：Context7 - 软件架构设计模式、FastAPI 架构文档
# 数据库设计文档

**版本**: v1.0
**创建日期**: 2025-10-28
**数据库**: PostgreSQL 16 + pgvector

---

## 📋 设计原则

### 核心设计目标
1. **MVCC支持**: 多版本并发控制，满足PRD要求
2. **数据隔离**: 不同用户标书数据完全隔离
3. **向量检索**: 高效的语义搜索能力
4. **审计跟踪**: 关键操作全程记录
5. **扩展性**: 支持未来功能扩展

### ACID保证
- **原子性**: 事务要么全部成功，要么全部失败
- **一致性**: 数据始终满足完整性约束
- **隔离性**: MVCC确保事务隔离
- **持久性**: WAL日志保证数据持久化

---

## 🗄️ 数据库Schema

### ER关系图（UTF-8字符）

```
┌─────────────────┐         ┌──────────────────┐
│     users       │────1:N──│   proposals      │
│                 │         │                  │
│ • id (PK)       │         │ • id (PK)        │
│ • email         │         │ • user_id (FK)   │
│ • password_hash │         │ • title          │
│ • created_at    │         │ • content        │
└─────────────────┘         │ • status         │
                            │ • version        │
                            └──────────────────┘
                                     │
                                     │1:N
                                     ▼
                            ┌──────────────────┐
                            │ proposal_sections│
                            │                  │
                            │ • id (PK)        │
                            │ • proposal_id(FK)│
                            │ • section_type   │
                            │ • content        │
                            └──────────────────┘


┌──────────────────┐         ┌──────────────────┐
│ scientific_corpus│────1:N──│   embeddings     │
│                  │         │                  │
│ • id (PK)        │         │ • id (PK)        │
│ • title          │         │ • corpus_id (FK) │
│ • authors        │         │ • embedding      │
│ • abstract       │         │   (vector[1536]) │
│ • published_date │         │ • created_at     │
│ • source         │         └──────────────────┘
└──────────────────┘
        │
        │N:M
        ▼
┌──────────────────┐
│   references     │
│                  │
│ • proposal_id(FK)│
│ • corpus_id (FK) │
│ • relevance_score│
└──────────────────┘
```

---

## 📊 核心表设计

### 1. users - 用户表
```sql
CREATE TABLE users (
    -- 主键与标识
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- 认证信息
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,

    -- 用户资料
    full_name VARCHAR(255),
    institution VARCHAR(255),  -- 所属机构
    research_field TEXT[],     -- 研究领域（数组）

    -- 权限与状态
    role VARCHAR(50) NOT NULL DEFAULT 'ecr',  -- ecr, admin
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,

    -- 审计字段
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,

    -- 软删除
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- 索引优化
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- 索引
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- 更新时间触发器
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**设计说明**:
- 使用UUID避免ID猜测攻击
- 支持软删除（deleted_at）
- 研究领域使用PostgreSQL数组类型
- 邮箱格式校验约束

---

### 2. proposals - 标书主表
```sql
CREATE TABLE proposals (
    -- 主键与关联
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- 基本信息
    title VARCHAR(500) NOT NULL,
    research_field VARCHAR(100),  -- 所属学科
    funding_program VARCHAR(100) DEFAULT 'NSFC',  -- 资助项目类型

    -- 状态管理
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    -- draft（草稿）, generating（生成中）, reviewing（审阅中）,
    -- completed（已完成）, submitted（已提交）

    -- 版本控制（MVCC支持）
    version INTEGER NOT NULL DEFAULT 1,
    parent_version_id UUID REFERENCES proposals(id),  -- 指向上一版本

    -- 内容存储
    content JSONB,  -- 完整内容JSON存储
    metadata JSONB,  -- 元数据（如生成参数）

    -- 质量评估
    quality_score DECIMAL(3,2),  -- 0.00-1.00
    compliance_score DECIMAL(3,2),  -- DDC-S评分

    -- 审计字段
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,

    -- 软删除
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- 约束
    CONSTRAINT status_check CHECK (status IN ('draft', 'generating', 'reviewing', 'completed', 'submitted')),
    CONSTRAINT quality_score_range CHECK (quality_score >= 0 AND quality_score <= 1),
    CONSTRAINT version_positive CHECK (version > 0)
);

-- 索引设计
CREATE INDEX idx_proposals_user_id ON proposals(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_proposals_status ON proposals(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_proposals_created_at ON proposals(created_at DESC);
CREATE INDEX idx_proposals_version ON proposals(user_id, version DESC);  -- 版本查询优化

-- GIN索引用于JSONB查询
CREATE INDEX idx_proposals_content ON proposals USING GIN(content);
CREATE INDEX idx_proposals_metadata ON proposals USING GIN(metadata);

-- 更新时间触发器
CREATE TRIGGER update_proposals_updated_at
    BEFORE UPDATE ON proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**设计亮点**:
- **MVCC版本控制**: parent_version_id实现版本链
- **JSONB存储**: 灵活存储结构化内容，支持高效查询
- **状态机管理**: 清晰的标书生命周期
- **软删除**: 保留历史数据

---

### 3. proposal_sections - 标书章节表
```sql
CREATE TABLE proposal_sections (
    -- 主键与关联
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,

    -- 章节信息
    section_type VARCHAR(100) NOT NULL,
    -- 'background'（立项依据）, 'objectives'（研究目标）,
    -- 'methods'（研究方案）, 'feasibility'（可行性分析）,
    -- 'foundation'（工作基础）, 'budget'（预算）

    section_title VARCHAR(255),
    section_order INTEGER NOT NULL,  -- 排序

    -- 内容
    content TEXT NOT NULL,
    word_count INTEGER,

    -- 生成信息
    generated_by VARCHAR(50),  -- 'user', 'k-tas', 'spg-s', 'ddcs'
    generation_params JSONB,   -- 生成参数记录

    -- 质量评估
    quality_score DECIMAL(3,2),

    -- 审计字段
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- 约束
    CONSTRAINT section_type_check CHECK (section_type IN (
        'background', 'objectives', 'methods', 'feasibility',
        'foundation', 'budget', 'custom'
    )),
    CONSTRAINT order_positive CHECK (section_order > 0),
    UNIQUE(proposal_id, section_order)
);

-- 索引
CREATE INDEX idx_sections_proposal_id ON proposal_sections(proposal_id, section_order);
CREATE INDEX idx_sections_type ON proposal_sections(section_type);

-- 全文检索
CREATE INDEX idx_sections_content_fts ON proposal_sections USING GIN(to_tsvector('chinese', content));
```

**设计说明**:
- 支持中文全文检索（to_tsvector）
- 记录生成来源（generated_by）
- 灵活的章节排序

---

### 4. scientific_corpus - 科研文献语料库
```sql
CREATE TABLE scientific_corpus (
    -- 主键
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- 文献标识
    arxiv_id VARCHAR(50),
    doi VARCHAR(255),
    external_id VARCHAR(255),  -- 其他来源ID

    -- 基本信息
    title TEXT NOT NULL,
    authors TEXT[] NOT NULL,  -- 作者数组
    abstract TEXT,

    -- 内容
    full_text TEXT,  -- 全文（可选）
    keywords TEXT[],

    -- 元数据
    published_date DATE,
    source VARCHAR(100) NOT NULL,  -- 'arxiv', 'nsfc', 'cnki', 'pubmed'
    journal VARCHAR(255),
    volume VARCHAR(50),
    pages VARCHAR(50),

    -- 影响力指标
    citation_count INTEGER DEFAULT 0,
    impact_factor DECIMAL(5,2),

    -- 分类
    primary_category VARCHAR(100),    -- 主要学科
    secondary_categories TEXT[],      -- 次要学科

    -- RDR分析结果
    rdr_analysis JSONB,  -- 存储I, M, O, W, R视角分析

    -- 审计字段
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    indexed_at TIMESTAMP WITH TIME ZONE,  -- 向量化时间

    -- 唯一性约束
    UNIQUE(arxiv_id),
    UNIQUE(doi)
);

-- 索引
CREATE INDEX idx_corpus_source ON scientific_corpus(source);
CREATE INDEX idx_corpus_category ON scientific_corpus(primary_category);
CREATE INDEX idx_corpus_published ON scientific_corpus(published_date DESC);
CREATE INDEX idx_corpus_citation ON scientific_corpus(citation_count DESC);

-- 全文检索索引
CREATE INDEX idx_corpus_title_fts ON scientific_corpus USING GIN(to_tsvector('english', title));
CREATE INDEX idx_corpus_abstract_fts ON scientific_corpus USING GIN(to_tsvector('english', abstract));

-- GIN索引用于数组查询
CREATE INDEX idx_corpus_keywords ON scientific_corpus USING GIN(keywords);
CREATE INDEX idx_corpus_authors ON scientific_corpus USING GIN(authors);

-- JSONB索引
CREATE INDEX idx_corpus_rdr_analysis ON scientific_corpus USING GIN(rdr_analysis);
```

**设计亮点**:
- 支持多数据源（arXiv、NSFC、知网）
- 数组类型存储作者和关键词
- RDR分析结果JSON存储
- 多语言全文检索支持

---

### 5. embeddings - 向量索引表（核心）
```sql
-- 确保pgvector扩展已安装
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE embeddings (
    -- 主键
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- 关联
    corpus_id UUID NOT NULL REFERENCES scientific_corpus(id) ON DELETE CASCADE,

    -- 向量存储
    embedding vector(1536) NOT NULL,  -- nvidia/NV-Embed-v2维度

    -- 向量类型
    embedding_type VARCHAR(50) NOT NULL DEFAULT 'abstract',
    -- 'abstract'（摘要）, 'full_text'（全文）, 'title'（标题）

    -- 模型信息
    model_name VARCHAR(255) NOT NULL DEFAULT 'nvidia/NV-Embed-v2',
    model_version VARCHAR(50),

    -- 审计
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- 约束
    UNIQUE(corpus_id, embedding_type),
    CONSTRAINT embedding_type_check CHECK (embedding_type IN ('abstract', 'full_text', 'title'))
);

-- 向量索引（关键性能优化）
-- IVFFlat索引：快速近似搜索
CREATE INDEX idx_embeddings_vector_cosine
    ON embeddings
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);  -- lists参数根据数据量调整

-- HNSW索引（可选，更高精度）
-- CREATE INDEX idx_embeddings_vector_hnsw
--     ON embeddings
--     USING hnsw (embedding vector_cosine_ops)
--     WITH (m = 16, ef_construction = 64);

-- 常规索引
CREATE INDEX idx_embeddings_corpus_id ON embeddings(corpus_id);
CREATE INDEX idx_embeddings_type ON embeddings(embedding_type);
```

**向量检索示例**:
```sql
-- 余弦相似度检索（前10个最相似）
SELECT
    c.title,
    c.authors,
    1 - (e.embedding <=> :query_vector) AS similarity_score
FROM embeddings e
JOIN scientific_corpus c ON e.corpus_id = c.id
WHERE e.embedding_type = 'abstract'
ORDER BY e.embedding <=> :query_vector
LIMIT 10;
```

---

### 6. references - 引用关联表（多对多）
```sql
CREATE TABLE references (
    -- 联合主键
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    corpus_id UUID NOT NULL REFERENCES scientific_corpus(id) ON DELETE CASCADE,

    -- 关联信息
    relevance_score DECIMAL(3,2),  -- 相关性得分
    citation_context TEXT,         -- 引用上下文
    section_type VARCHAR(100),     -- 引用所在章节

    -- 审计
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),  -- 'user', 'k-tas'（系统推荐）

    -- 主键
    PRIMARY KEY (proposal_id, corpus_id)
);

-- 索引
CREATE INDEX idx_references_proposal ON references(proposal_id);
CREATE INDEX idx_references_corpus ON references(corpus_id);
CREATE INDEX idx_references_score ON references(relevance_score DESC);
```

---

### 7. audit_logs - 审计日志表
```sql
CREATE TABLE audit_logs (
    -- 主键
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- 关联
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,

    -- 操作信息
    action VARCHAR(100) NOT NULL,  -- 'create', 'update', 'delete', 'generate'
    resource_type VARCHAR(50) NOT NULL,  -- 'proposal', 'section', 'user'
    resource_id UUID,

    -- 详细信息
    description TEXT,
    changes JSONB,  -- 变更详情

    -- 请求信息
    ip_address INET,
    user_agent TEXT,

    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_proposal_id ON audit_logs(proposal_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- 分区策略（大数据量时）
-- 按月分区
-- CREATE TABLE audit_logs_y2025m01 PARTITION OF audit_logs
--     FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

---

## 🔧 辅助函数和触发器

### 自动更新updated_at函数
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 版本控制触发器
```sql
CREATE OR REPLACE FUNCTION increment_proposal_version()
RETURNS TRIGGER AS $$
BEGIN
    -- 如果内容有重大变更，自动增加版本号
    IF NEW.content IS DISTINCT FROM OLD.content THEN
        NEW.version = OLD.version + 1;
        NEW.parent_version_id = OLD.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER proposal_version_control
    BEFORE UPDATE ON proposals
    FOR EACH ROW
    WHEN (OLD.content IS DISTINCT FROM NEW.content)
    EXECUTE FUNCTION increment_proposal_version();
```

---

## 📈 查询优化

### MVCC隔离级别配置
```sql
-- 标书操作使用REPEATABLE READ隔离级别
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- 防止脏读和不可重复读
SELECT * FROM proposals WHERE id = :proposal_id FOR UPDATE;

COMMIT;
```

### 连接池配置
```python
# SQLAlchemy配置
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,           # 基础连接池大小
    max_overflow=30,        # 最大溢出连接
    pool_pre_ping=True,     # 连接健康检查
    pool_recycle=3600,      # 1小时回收连接
    echo=False,             # 生产环境关闭SQL日志
    isolation_level="REPEATABLE READ"  # 默认隔离级别
)
```

---

## 🔍 性能监控

### 关键查询索引
```sql
-- 查看慢查询
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- 检查未使用的索引
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## 📦 数据迁移策略

### Alembic版本管理
```python
# alembic/env.py配置
from app.models import Base

target_metadata = Base.metadata

# 迁移命令
# alembic revision --autogenerate -m "初始化数据库"
# alembic upgrade head
# alembic downgrade -1
```

### 初始数据填充
```sql
-- seeds/001_initial_users.sql
INSERT INTO users (email, username, password_hash, role)
VALUES
    ('admin@innoliber.com', 'admin', '$2b$12$...', 'admin'),
    ('demo@innoliber.com', 'demo_user', '$2b$12$...', 'ecr');
```

---

## 🔐 安全考虑

### 行级安全策略（RLS）
```sql
-- 启用RLS
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的标书
CREATE POLICY proposals_isolation ON proposals
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- 管理员可以访问所有标书
CREATE POLICY proposals_admin_access ON proposals
    FOR ALL
    TO admin_role
    USING (true);
```

### 敏感数据加密
```sql
-- 使用pgcrypto扩展
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 敏感字段加密示例
-- INSERT时: pgp_sym_encrypt('sensitive_data', :encryption_key)
-- SELECT时: pgp_sym_decrypt(encrypted_column, :encryption_key)
```

---

## 📊 容量规划

### 存储估算
```
用户表: 100KB × 10,000用户 = 1GB
标书表: 500KB × 50,000标书 = 25GB
文献表: 2KB × 1,000,000篇 = 2GB
向量表: 6KB × 1,000,000向量 = 6GB
审计日志: 1KB × 10,000,000条 = 10GB

总计: ~44GB（不含备份）
```

### 备份策略
```bash
# 每日全量备份
pg_dump -Fc innoliber > backup_$(date +%Y%m%d).dump

# 每小时增量备份（WAL归档）
archive_command = 'cp %p /backup/wal_archive/%f'
```

---

**文档状态**: ✅ 设计完成
**最后更新**: 2025-10-28
**待实现**: Alembic迁移脚本
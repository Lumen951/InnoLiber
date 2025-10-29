-- 初始化数据库脚本

-- 创建pgvector扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 创建uuid扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建pgcrypto扩展（用于加密）
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 创建中文全文检索配置
-- CREATE TEXT SEARCH CONFIGURATION chinese (COPY = simple);

-- 输出初始化完成信息
DO $$
BEGIN
  RAISE NOTICE 'InnoLiber database initialized successfully!';
  RAISE NOTICE 'Extensions created: vector, uuid-ossp, pgcrypto';
END$$;
-- 修复 score_category 类型不兼容问题
-- 将 PostgreSQL ENUM 改为 VARCHAR，以兼容 JPA @Enumerated(EnumType.STRING)

-- 1. 修改 category 字段为 VARCHAR
ALTER TABLE score_records 
    ALTER COLUMN category TYPE VARCHAR(20) USING category::text;

-- 2. 添加 CHECK 约束确保数据完整性
ALTER TABLE score_records
    ADD CONSTRAINT check_score_category 
    CHECK (category IN ('intelligence', 'physical', 'moral', 'hygiene', 'handcraft'));

-- 3. 删除旧的 ENUM 类型（如果没有其他表使用）
DROP TYPE IF EXISTS score_category;

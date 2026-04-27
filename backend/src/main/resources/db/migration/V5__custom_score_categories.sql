-- V5: 添加自定义积分维度表
-- 允许家庭自定义积分维度，包括名称和图标

CREATE TABLE IF NOT EXISTS custom_score_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_family_category_name UNIQUE (family_id, name)
);

CREATE INDEX idx_custom_categories_family ON custom_score_categories(family_id);

-- 为 score_records 表添加自定义维度字段（可为空）
-- 如果 custom_category_id 不为空，则使用自定义维度；否则使用 category 枚举
ALTER TABLE score_records ADD COLUMN IF NOT EXISTS custom_category_id UUID REFERENCES custom_score_categories(id) ON DELETE SET NULL;

CREATE INDEX idx_score_records_custom_category ON score_records(custom_category_id);

COMMENT ON TABLE custom_score_categories IS '家庭自定义积分维度表';
COMMENT ON COLUMN custom_score_categories.family_id IS '所属家庭ID';
COMMENT ON COLUMN custom_score_categories.name IS '维度名称';
COMMENT ON COLUMN custom_score_categories.icon IS '维度图标（emoji或图标标识）';
COMMENT ON COLUMN score_records.custom_category_id IS '自定义维度ID（可选，优先于category字段）';

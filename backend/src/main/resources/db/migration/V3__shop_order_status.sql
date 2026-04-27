-- V3: 商城订单状态管理 + 商品可购买孩子限制

-- 1. 为 purchase_records 添加订单状态字段
ALTER TABLE purchase_records
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    ADD COLUMN completed_at TIMESTAMP;

-- 2. 添加状态约束
ALTER TABLE purchase_records
    ADD CONSTRAINT chk_purchase_status CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED'));

-- 3. 为现有记录设置 completed_at（历史数据视为已完成）
UPDATE purchase_records
SET completed_at = purchased_at
WHERE status = 'COMPLETED' AND completed_at IS NULL;

-- 4. 创建索引优化订单状态查询
CREATE INDEX idx_purchase_records_status ON purchase_records(status);
CREATE INDEX idx_purchase_records_child_status ON purchase_records(child_id, status);

-- 5. 创建商品-孩子关联表（限制哪些孩子可以购买某商品）
CREATE TABLE shop_item_allowed_children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_item_id UUID NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (shop_item_id, child_id)
);

CREATE INDEX idx_shop_item_allowed_children_item ON shop_item_allowed_children(shop_item_id);
CREATE INDEX idx_shop_item_allowed_children_child ON shop_item_allowed_children(child_id);

COMMENT ON TABLE shop_item_allowed_children IS '商品可购买孩子限制表（空=所有孩子可买，有记录=仅限指定孩子）';
COMMENT ON COLUMN purchase_records.status IS '订单状态：PENDING=待确认(暂扣积分), COMPLETED=已完成(真实扣除), CANCELLED=已取消(返还积分)';

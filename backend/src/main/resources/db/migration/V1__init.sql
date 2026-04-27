-- 海底世界 数据库初始化脚本

-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    avatar_url VARCHAR(500),
    role VARCHAR(20) NOT NULL DEFAULT 'parent' CHECK (role IN ('parent', 'child', 'admin')),
    email_verified BOOLEAN NOT NULL DEFAULT false,
    email_verify_token VARCHAR(255),
    email_verify_expire TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 家庭表
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL DEFAULT '我的家庭',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 家庭成员表（支持多家长）
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'member')),
    joined_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (family_id, user_id)
);

CREATE INDEX idx_family_members_family ON family_members(family_id);
CREATE INDEX idx_family_members_user ON family_members(user_id);

-- 孩子表
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    nickname VARCHAR(100),
    avatar_url VARCHAR(500),
    birth_date DATE,
    total_score INT NOT NULL DEFAULT 0,
    available_score INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_children_family ON children(family_id);

-- 积分分类枚举类型
CREATE TYPE score_category AS ENUM ('intelligence', 'physical', 'moral', 'hygiene', 'handcraft');

-- 积分记录表
CREATE TABLE score_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES users(id),
    score INT NOT NULL CHECK (score BETWEEN -10 AND 10 AND score != 0),
    category score_category NOT NULL,
    reason VARCHAR(500) NOT NULL,
    raw_voice_text VARCHAR(1000),
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_score_records_child ON score_records(child_id);
CREATE INDEX idx_score_records_date ON score_records(child_id, record_date);
CREATE INDEX idx_score_records_category ON score_records(child_id, category);

-- 商城商品表
CREATE TABLE shop_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    image_url VARCHAR(500),
    price INT NOT NULL DEFAULT 0,
    rarity VARCHAR(20) NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 购买记录表
CREATE TABLE purchase_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES shop_items(id),
    cost INT NOT NULL,
    purchased_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_purchase_records_child ON purchase_records(child_id);

-- 孩子已购商品关联表
CREATE TABLE children_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES shop_items(id),
    nickname VARCHAR(100),
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    acquired_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (child_id, item_id)
);

CREATE INDEX idx_children_items_child ON children_items(child_id);

-- 邀请码表（可选功能）
CREATE TABLE invite_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    created_by UUID REFERENCES users(id),
    used_by UUID REFERENCES users(id),
    is_used BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    used_at TIMESTAMP
);

CREATE INDEX idx_invite_codes_code ON invite_codes(code);

-- 每日注册计数表
CREATE TABLE daily_register_count (
    register_date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
    count INT NOT NULL DEFAULT 0
);

-- Refresh Token 表
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- 初始商品数据
INSERT INTO shop_items (name, description, image_url, price, rarity, sort_order) VALUES
('小蓝鲸', '温柔的蓝色大鲸鱼，免费领养', '/assets/pets/whale.png', 0, 'common', 1),
('小海龟', '慢悠悠的可爱小海龟', '/assets/pets/turtle.png', 10, 'common', 2),
('小海马', '优雅的海中骑士', '/assets/pets/seahorse.png', 20, 'rare', 3),
('小章鱼', '聪明的八爪小精灵', '/assets/pets/octopus.png', 30, 'rare', 4),
('小海豚', '活泼好动的海洋明星', '/assets/pets/dolphin.png', 50, 'epic', 5),
('小美人鱼', '神秘美丽的海底公主', '/assets/pets/mermaid.png', 100, 'legendary', 6);

-- 创建管理员账号（密码需要在应用启动时通过 bcrypt 加密设置）

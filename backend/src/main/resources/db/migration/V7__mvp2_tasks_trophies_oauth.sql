-- MVP2: 任务模板表（按年级推荐）
CREATE TABLE task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    points INT NOT NULL DEFAULT 5,
    icon VARCHAR(50) DEFAULT '📋',
    trophy_name VARCHAR(100),
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_task_templates_grade ON task_templates(grade);

-- MVP2: 自定义任务表
CREATE TABLE child_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    points INT NOT NULL DEFAULT 5,
    icon VARCHAR(50) DEFAULT '📋',
    trophy_name VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    completed_at TIMESTAMP,
    version INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_child_tasks_child ON child_tasks(child_id);
CREATE INDEX idx_child_tasks_family ON child_tasks(family_id);
CREATE INDEX idx_child_tasks_status ON child_tasks(status);

-- MVP2: 奖杯表
CREATE TABLE trophies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    task_id UUID REFERENCES child_tasks(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    points INT NOT NULL DEFAULT 0,
    icon VARCHAR(50) DEFAULT '🏆',
    earned_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_trophies_child ON trophies(child_id);

-- MVP2: 多家长 - families 加 share_code 和 description
ALTER TABLE families ADD COLUMN share_code VARCHAR(20) UNIQUE;
ALTER TABLE families ADD COLUMN description VARCHAR(200);

-- MVP2: 多家长 - family_members 加 status
ALTER TABLE family_members ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING'));

-- MVP2: 乐观锁 - children 加 version
ALTER TABLE children ADD COLUMN version INT NOT NULL DEFAULT 0;

-- MVP2: 第三方登录 - users 加 provider/provider_id
ALTER TABLE users ADD COLUMN provider VARCHAR(20);
ALTER TABLE users ADD COLUMN provider_id VARCHAR(255);
-- 第三方登录用户密码可为空
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
-- 第三方登录用户邮箱可为空
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
-- 但普通注册用户邮箱仍需唯一，对 null 不生效
CREATE UNIQUE INDEX idx_users_email_unique ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_provider ON users(provider, provider_id);

-- 为 families 的 share_code 创建函数生成唯一码
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.share_code IS NULL THEN
        NEW.share_code := upper(substr(md5(random()::text), 1, 8));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_families_share_code
    BEFORE INSERT ON families
    FOR EACH ROW
    EXECUTE FUNCTION generate_share_code();

-- 已有家庭生成 share_code
UPDATE families SET share_code = upper(substr(md5(random()::text || id::text), 1, 8)) WHERE share_code IS NULL;

-- 任务模板种子数据
INSERT INTO task_templates (grade, name, description, points, icon, trophy_name, sort_order) VALUES
('preschool', '自己穿衣服', '早上自己穿好衣服', 5, '👕', '自理小能手', 1),
('preschool', '整理玩具', '玩完玩具自己收拾好', 5, '🧸', '整理小达人', 2),
('preschool', '刷牙洗脸', '早晚自己刷牙洗脸', 5, '🪥', '清洁小卫士', 3),
('preschool', '按时睡觉', '晚上9点前上床睡觉', 5, '😴', '作息小标兵', 4),
('grade1', '完成作业', '放学后先完成作业', 10, '📚', '作业小能手', 1),
('grade1', '阅读20分钟', '每天阅读课外书20分钟', 10, '📖', '阅读小达人', 2),
('grade1', '整理书包', '自己整理好第二天要用的书包', 5, '🎒', '整理小能手', 3),
('grade1', '帮助做家务', '主动帮助做一件家务', 10, '🧹', '家务小帮手', 4),
('grade2', '完成作业', '放学后先完成作业', 10, '📚', '作业小能手', 1),
('grade2', '阅读30分钟', '每天阅读课外书30分钟', 10, '📖', '阅读之星', 2),
('grade2', '练字15分钟', '每天练字15分钟', 10, '✏️', '书写小达人', 3),
('grade2', '帮助做家务', '主动帮助做一件家务', 10, '🧹', '家务小帮手', 4),
('grade3', '完成作业', '放学后先完成作业', 10, '📚', '作业小能手', 1),
('grade3', '阅读30分钟', '每天阅读课外书30分钟', 10, '📖', '阅读之星', 2),
('grade3', '英语打卡', '每天英语朗读或单词打卡', 10, '🔤', '英语小达人', 3),
('grade3', '运动30分钟', '每天户外运动30分钟', 15, '⚽', '运动小健将', 4),
('grade4', '自主完成作业', '独立完成所有作业并检查', 15, '📚', '自主学习之星', 1),
('grade4', '阅读40分钟', '每天阅读课外书40分钟', 10, '📖', '阅读达人', 2),
('grade4', '英语打卡', '每天英语朗读或单词打卡', 10, '🔤', '英语小达人', 3),
('grade4', '运动30分钟', '每天户外运动30分钟', 15, '⚽', '运动小健将', 4),
('grade5', '自主完成作业', '独立完成所有作业并检查', 15, '📚', '自主学习之星', 1),
('grade5', '阅读40分钟', '每天阅读课外书40分钟', 10, '📖', '阅读达人', 2),
('grade5', '英语/数学练习', '额外英语或数学练习题', 15, '🧮', '学习小标兵', 3),
('grade5', '运动40分钟', '每天户外运动40分钟', 15, '⚽', '运动小健将', 4),
('grade6', '自主完成作业', '独立完成所有作业并检查', 15, '📚', '自主学习之星', 1),
('grade6', '阅读60分钟', '每天阅读课外书60分钟', 15, '📖', '阅读大师', 2),
('grade6', '学习计划', '制定并执行每日学习计划', 15, '📋', '规划小能手', 3),
('grade6', '运动40分钟', '每天户外运动40分钟', 15, '⚽', '运动小健将', 4);

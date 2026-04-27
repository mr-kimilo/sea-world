-- 测试数据设置脚本
-- 用于创建已验证的测试用户和测试家庭

-- 1. 插入已验证的测试用户（密码是 Test123456 的bcrypt哈希）
-- bcrypt hash for 'Test123456' with cost factor 10
INSERT INTO users (id, email, password, name, role, email_verified, created_at)
VALUES (
    'a1111111-1111-1111-1111-111111111111'::uuid,
    'testuser@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Test123456
    'Test User',
    'parent',
    true,
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    email_verified = true;

-- 2. 创建测试家庭
INSERT INTO families (id, name, created_by, created_at)
VALUES (
    'f1111111-1111-1111-1111-111111111111'::uuid,
    '测试家庭',
    'a1111111-1111-1111-1111-111111111111'::uuid,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. 添加家庭成员关系
INSERT INTO family_members (family_id, user_id, role, joined_at)
VALUES (
    'f1111111-1111-1111-1111-111111111111'::uuid,
    'a1111111-1111-1111-1111-111111111111'::uuid,
    'owner',
    NOW()
) ON CONFLICT (family_id, user_id) DO NOTHING;

-- 4. 验证刚注册的用户（如果存在）
UPDATE users SET email_verified = true WHERE email = 'testapi@example.com';

-- 查询验证结果
SELECT id, email, name, role, email_verified FROM users WHERE email IN ('testuser@example.com', 'testapi@example.com');
SELECT f.id, f.name, f.created_by, fm.user_id, fm.role FROM families f 
JOIN family_members fm ON f.id = fm.family_id 
WHERE f.id = 'f1111111-1111-1111-1111-111111111111'::uuid;

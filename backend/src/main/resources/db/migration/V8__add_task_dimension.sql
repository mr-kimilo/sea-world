-- MVP2 UI优化: 任务模版添加维度字段
ALTER TABLE task_templates ADD COLUMN dimension VARCHAR(50);

-- 自定义任务添加维度字段
ALTER TABLE child_tasks ADD COLUMN dimension VARCHAR(50);

-- 为现有模板数据设置维度
-- intelligence: 智力/学习, physical: 体能/运动, moral: 品德/习惯, hygiene: 卫生/生活, handcraft: 手工/整理
UPDATE task_templates SET dimension = 'hygiene' WHERE name IN ('自己穿衣服', '刷牙洗脸');
UPDATE task_templates SET dimension = 'handcraft' WHERE name IN ('整理玩具', '整理书包');
UPDATE task_templates SET dimension = 'moral' WHERE name IN ('按时睡觉', '帮助做家务');
UPDATE task_templates SET dimension = 'intelligence' WHERE name IN (
    '完成作业', '阅读20分钟', '阅读30分钟', '阅读40分钟', '阅读60分钟',
    '练字15分钟', '英语打卡', '英语/数学练习', '学习计划',
    '自主完成作业'
);
UPDATE task_templates SET dimension = 'physical' WHERE name IN ('运动30分钟', '运动40分钟');

CREATE INDEX idx_task_templates_dimension ON task_templates(dimension);
CREATE INDEX idx_child_tasks_dimension ON child_tasks(dimension);

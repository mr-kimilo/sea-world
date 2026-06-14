-- Fix: 历史数据中 totalScore 小于 availableScore 的问题
-- Bug 5 修复前完成任务只增加了 availableScore，未更新 totalScore
UPDATE children SET total_score = available_score WHERE total_score < available_score;
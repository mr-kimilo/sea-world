-- V6: allow 'custom' as score category
-- Custom score categories use score_records.custom_category_id, and store category as 'custom'.

ALTER TABLE score_records
    DROP CONSTRAINT IF EXISTS check_score_category;

ALTER TABLE score_records
    ADD CONSTRAINT check_score_category
    CHECK (category IN ('intelligence', 'physical', 'moral', 'hygiene', 'handcraft', 'custom'));


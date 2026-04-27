-- Remove old seed shop items (pet/decoration data) that are no longer relevant.
-- These were inserted in V1__init.sql as placeholder data.
-- Real products (activities, food, toys) will be added by parents via the admin UI.

DELETE FROM children_items WHERE item_id IN (
    SELECT id FROM shop_items WHERE image_url LIKE '/assets/pets/%'
);

DELETE FROM purchase_records WHERE item_id IN (
    SELECT id FROM shop_items WHERE image_url LIKE '/assets/pets/%'
);

DELETE FROM shop_item_allowed_children WHERE shop_item_id IN (
    SELECT id FROM shop_items WHERE image_url LIKE '/assets/pets/%'
);

DELETE FROM shop_items WHERE image_url LIKE '/assets/pets/%';

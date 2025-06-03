-- Simple POI Creation Fix
-- Run this in your Supabase SQL editor

-- 1. Drop the poi_items table completely (if it still exists)
DROP TABLE IF EXISTS poi_items CASCADE;

-- 2. Drop any triggers that might reference poi_items
DROP TRIGGER IF EXISTS trigger_poi_items_update ON pois;
DROP TRIGGER IF EXISTS update_poi_items_count ON pois;
DROP TRIGGER IF EXISTS sync_poi_items_trigger ON pois;
DROP TRIGGER IF EXISTS poi_items_sync_trigger ON pois;

-- 3. Drop any functions that might reference poi_items
DROP FUNCTION IF EXISTS update_poi_items_count();
DROP FUNCTION IF EXISTS sync_poi_items();
DROP FUNCTION IF EXISTS update_poi_items_count_function();
DROP FUNCTION IF EXISTS sync_poi_items_function();

-- 4. Drop any views that might reference poi_items
DROP VIEW IF EXISTS poi_items_view;
DROP VIEW IF EXISTS poi_with_items;
DROP VIEW IF EXISTS pois_with_items;

-- 5. Verify poi_items is completely gone
SELECT COUNT(*) as remaining_poi_items_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%poi_items%';

-- If the above returns 0, poi_items is completely removed
SELECT 'POI creation should now work!' as status; 
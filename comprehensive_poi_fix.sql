-- Comprehensive POI Creation Fix
-- Run this in your Supabase SQL editor

-- 1. First, check what's causing the poi_items reference
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'pois'
AND (qual LIKE '%poi_items%' OR with_check LIKE '%poi_items%');

-- 2. Drop any RLS policies on pois table that reference poi_items
DROP POLICY IF EXISTS "poi_items_policy" ON pois;
DROP POLICY IF EXISTS "Enable read access for poi_items" ON pois;
DROP POLICY IF EXISTS "Users can view poi_items" ON pois;

-- 3. Drop the poi_items table completely (if it still exists)
DROP TABLE IF EXISTS poi_items CASCADE;

-- 4. Drop any triggers that might reference poi_items
DROP TRIGGER IF EXISTS trigger_poi_items_update ON pois;
DROP TRIGGER IF EXISTS update_poi_items_count ON pois;
DROP TRIGGER IF EXISTS sync_poi_items_trigger ON pois;
DROP TRIGGER IF EXISTS poi_items_sync_trigger ON pois;
DROP TRIGGER IF EXISTS manage_poi_items ON pois;
DROP TRIGGER IF EXISTS poi_items_trigger ON pois;

-- 5. Drop any functions that might reference poi_items (comprehensive list)
DROP FUNCTION IF EXISTS update_poi_items_count();
DROP FUNCTION IF EXISTS sync_poi_items();
DROP FUNCTION IF EXISTS update_poi_items_count_function();
DROP FUNCTION IF EXISTS sync_poi_items_function();
DROP FUNCTION IF EXISTS manage_poi_items();
DROP FUNCTION IF EXISTS handle_poi_items();
DROP FUNCTION IF EXISTS poi_items_handler();

-- 6. Drop any views that might reference poi_items
DROP VIEW IF EXISTS poi_items_view;
DROP VIEW IF EXISTS poi_with_items;
DROP VIEW IF EXISTS pois_with_items;
DROP VIEW IF EXISTS poi_items_summary;

-- 7. Check for any remaining references in the database
SELECT 'Checking for remaining poi_items references...' as status;

-- 8. Final verification
SELECT COUNT(*) as remaining_poi_items_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%poi_items%';

SELECT 'POI creation fix completed!' as final_status; 
-- Fix POI Creation Error - Remove poi_items references
-- Run this in your Supabase SQL editor

-- Drop any triggers that might reference poi_items
DROP TRIGGER IF EXISTS trigger_poi_items_update ON pois;
DROP TRIGGER IF EXISTS update_poi_items_count ON pois;

-- Drop any functions that might reference poi_items
DROP FUNCTION IF EXISTS update_poi_items_count();
DROP FUNCTION IF EXISTS sync_poi_items();

-- Check for and drop any remaining constraints that reference poi_items
DO $$ 
DECLARE
    constraint_name text;
BEGIN
    FOR constraint_name IN 
        SELECT conname 
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        JOIN pg_namespace n ON t.relnamespace = n.oid
        WHERE n.nspname = 'public'
        AND (c.conname LIKE '%poi_items%' OR c.consrc LIKE '%poi_items%')
    LOOP
        EXECUTE 'ALTER TABLE IF EXISTS ' || constraint_name || ' DROP CONSTRAINT IF EXISTS ' || constraint_name;
    END LOOP;
END $$;

-- Ensure poi_items table is completely removed
DROP TABLE IF EXISTS poi_items CASCADE;

-- Verify no remaining references
SELECT 
    schemaname,
    tablename,
    attname as column_name
FROM pg_stats 
WHERE schemaname = 'public' 
AND (tablename LIKE '%poi_items%' OR attname LIKE '%poi_items%');

-- If the above query returns any results, those need to be manually addressed

-- Check for views that might reference poi_items
SELECT viewname, definition 
FROM pg_views 
WHERE schemaname = 'public' 
AND definition LIKE '%poi_items%';

-- Check for any remaining functions that reference poi_items
SELECT proname, prosrc 
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND prosrc LIKE '%poi_items%'; 
-- Debug POI Creation Issues
-- Run this in your Supabase SQL editor to find what's causing poi_items reference

-- 1. Check all RLS policies on pois table
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
AND tablename = 'pois';

-- 2. Check all triggers on pois table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_schema = 'public' 
AND event_object_table = 'pois';

-- 3. Check all functions that might be called by triggers
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_definition LIKE '%poi_items%';

-- 4. Check pois table structure to ensure it's correct
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'pois'
ORDER BY ordinal_position;

-- 5. Try a simple insert to see if it works at database level
INSERT INTO pois (
    title, 
    description, 
    poi_type_id, 
    created_by, 
    map_type, 
    coordinates_x, 
    coordinates_y, 
    privacy_level
) VALUES (
    'Test POI',
    'Test Description',
    (SELECT id FROM poi_types LIMIT 1),
    (SELECT id FROM profiles LIMIT 1),
    'hagga_basin',
    100,
    100,
    'global'
) RETURNING id;

-- If the above insert works, the issue is not in the database
-- If it fails, we'll see the exact error

-- 6. Check for any computed columns or generated columns
SELECT 
    column_name,
    generation_expression
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'pois'
AND generation_expression IS NOT NULL; 
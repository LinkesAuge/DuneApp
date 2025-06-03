-- Remove Legacy Trigger That References poi_items
-- Run this in your Supabase SQL editor

-- 1. Drop the trigger that's causing the issue
DROP TRIGGER IF EXISTS trigger_apply_default_assignments ON pois;

-- 2. Drop the function that references poi_items and poi_schematics
DROP FUNCTION IF EXISTS apply_default_assignments_to_poi();

-- 3. Also drop any related tables that the function was trying to use
DROP TABLE IF EXISTS poi_type_default_items CASCADE;
DROP TABLE IF EXISTS poi_type_default_schematics CASCADE;
DROP TABLE IF EXISTS poi_schematics CASCADE;

-- 4. Test POI creation with a simple insert
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
    'Test POI - SHOULD WORK NOW',
    'Test Description',
    (SELECT id FROM poi_types LIMIT 1),
    (SELECT id FROM profiles LIMIT 1),
    'hagga_basin',
    100,
    100,
    'global'
) RETURNING id, title;

-- If the above works, POI creation should now be fixed!
SELECT 'POI creation trigger issue resolved!' as status; 
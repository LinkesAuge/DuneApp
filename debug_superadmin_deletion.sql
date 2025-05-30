-- Debug script to investigate SuperAdmin1 user and preview data preservation

-- 1. Find the SuperAdmin1 user in profiles
SELECT id, username, email, role, created_at, discord_id, rank_id
FROM profiles 
WHERE username = 'SuperAdmin1';

-- 2. Preview POIs that will be preserved (set created_by to null)
SELECT id, title, description, created_by, created_at
FROM pois 
WHERE created_by = (SELECT id FROM profiles WHERE username = 'SuperAdmin1')
ORDER BY created_at DESC;

-- 3. Preview grid squares that will be preserved (set uploaded_by to null)
SELECT coordinate, uploaded_by, uploaded_at
FROM grid_squares 
WHERE uploaded_by = (SELECT id FROM profiles WHERE username = 'SuperAdmin1')
ORDER BY uploaded_at DESC;

-- 4. Preview comments that will be preserved (set user_id to null)
SELECT id, content, user_id, created_at
FROM comments 
WHERE user_id = (SELECT id FROM profiles WHERE username = 'SuperAdmin1')
ORDER BY created_at DESC;

-- 5. Preview custom icons that will be preserved (set user_id to null)
SELECT id, name, image_url, user_id, created_at
FROM custom_icons 
WHERE user_id = (SELECT id FROM profiles WHERE username = 'SuperAdmin1')
ORDER BY created_at DESC;

-- 6. Preview POI types that will be preserved (set created_by to null)
SELECT id, name, created_by, created_at
FROM poi_types 
WHERE created_by = (SELECT id FROM profiles WHERE username = 'SuperAdmin1')
ORDER BY created_at DESC;

-- 7. Summary counts of data to be preserved
SELECT 
    (SELECT COUNT(*) FROM pois WHERE created_by = (SELECT id FROM profiles WHERE username = 'SuperAdmin1')) as pois_count,
    (SELECT COUNT(*) FROM grid_squares WHERE uploaded_by = (SELECT id FROM profiles WHERE username = 'SuperAdmin1')) as grid_squares_count,
    (SELECT COUNT(*) FROM comments WHERE user_id = (SELECT id FROM profiles WHERE username = 'SuperAdmin1')) as comments_count,
    (SELECT COUNT(*) FROM custom_icons WHERE user_id = (SELECT id FROM profiles WHERE username = 'SuperAdmin1')) as custom_icons_count,
    (SELECT COUNT(*) FROM poi_types WHERE created_by = (SELECT id FROM profiles WHERE username = 'SuperAdmin1')) as poi_types_count;

-- 8. Check foreign key constraints on profiles table
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name = 'profiles' OR ccu.table_name = 'profiles');

-- 9. Check if user exists in auth.users (this requires service role access)
-- This query might not work from SQL editor but helps understand the structure
-- SELECT id, email, created_at FROM auth.users WHERE id = (SELECT id FROM profiles WHERE username = 'SuperAdmin1'); 
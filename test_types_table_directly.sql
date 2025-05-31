-- Direct Test of Types Table - Verify Permissions Are Working
-- Date: January 29, 2025

-- Test 1: Basic SELECT (should work now)
SELECT COUNT(*) as total_types FROM types;

-- Test 2: Test the exact query that was failing
-- This should return 0 rows but NOT give a 406 error
SELECT id FROM types 
WHERE name = 'test weapon type' 
AND category_id = '71bbb56a-d44b-4f82-9b54-c25bbff84762';

-- Test 3: Insert a test type (if you want to test INSERT)
-- Uncomment to test:
/*
INSERT INTO types (
    id, 
    name, 
    category_id, 
    icon_image_id, 
    icon_fallback, 
    description, 
    created_by, 
    is_global
) VALUES (
    gen_random_uuid(),
    'Test Type - DELETE ME',
    '71bbb56a-d44b-4f82-9b54-c25bbff84762',
    null,
    '🔧',
    'Test type for permission verification',
    auth.uid(),
    false
);
*/

-- Test 4: Check current user context
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role;

-- Test 5: Verify policies are active
SELECT 
    tablename, 
    policyname, 
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'types'
ORDER BY cmd, policyname; 
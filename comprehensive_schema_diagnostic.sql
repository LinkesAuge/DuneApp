-- Comprehensive Schema Diagnostic for Items & Schematics System
-- Date: January 29, 2025
-- Purpose: Identify root cause of HTTP 406 errors in TypeManager

-- ========================================
-- PART 1: COMPLETE SCHEMA INSPECTION
-- ========================================

SELECT 'SCHEMA INSPECTION STARTING...' as status;

-- Check all tables exist
SELECT 'CHECKING TABLE EXISTENCE...' as step;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tiers', 'categories', 'types', 'field_definitions', 'dropdown_groups', 'dropdown_options', 'items', 'schematics')
ORDER BY table_name;

-- ========================================
-- PART 2: DETAILED COLUMN INSPECTION
-- ========================================

SELECT 'CHECKING TYPES TABLE STRUCTURE...' as step;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    udt_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'types'
ORDER BY ordinal_position;

SELECT 'CHECKING CATEGORIES TABLE STRUCTURE...' as step;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    udt_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'categories'
ORDER BY ordinal_position;

SELECT 'CHECKING TIERS TABLE STRUCTURE...' as step;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    udt_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tiers'
ORDER BY ordinal_position;

-- ========================================
-- PART 3: CRITICAL COLUMN VALIDATION
-- ========================================

SELECT 'VALIDATING CRITICAL COLUMNS...' as step;

-- Check if parent_type_id exists and has correct type
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'types' 
            AND column_name = 'parent_type_id' 
            AND data_type = 'uuid'
        ) THEN '✓ types.parent_type_id exists (UUID)'
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'types' 
            AND column_name = 'parent_type_id'
        ) THEN '⚠ types.parent_type_id exists but wrong type'
        ELSE '✗ types.parent_type_id MISSING'
    END as parent_type_id_status;

-- Check icon columns
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'types' 
            AND column_name = 'icon_image_id' 
            AND data_type = 'uuid'
        ) THEN '✓ types.icon_image_id exists (UUID)'
        ELSE '✗ types.icon_image_id issue'
    END as icon_image_id_status;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'types' 
            AND column_name = 'icon_fallback' 
            AND data_type = 'text'
        ) THEN '✓ types.icon_fallback exists (TEXT)'
        ELSE '✗ types.icon_fallback issue'
    END as icon_fallback_status;

-- Check updated_by columns across all tables
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = t.table_name
            AND column_name = 'updated_by' 
            AND data_type = 'uuid'
        ) THEN '✓ updated_by exists (UUID)'
        ELSE '✗ updated_by MISSING or wrong type'
    END as updated_by_status
FROM (VALUES 
    ('tiers'), 
    ('categories'), 
    ('types'), 
    ('field_definitions'), 
    ('dropdown_groups'), 
    ('dropdown_options')
) t(table_name);

-- ========================================
-- PART 4: FOREIGN KEY CONSTRAINTS
-- ========================================

SELECT 'CHECKING FOREIGN KEY CONSTRAINTS...' as step;

SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
AND tc.table_name IN ('tiers', 'categories', 'types', 'field_definitions', 'dropdown_groups', 'dropdown_options', 'items', 'schematics')
AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_name;

-- ========================================
-- PART 5: INDEXES VERIFICATION
-- ========================================

SELECT 'CHECKING INDEXES...' as step;

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('tiers', 'categories', 'types', 'field_definitions', 'dropdown_groups', 'dropdown_options', 'items', 'schematics')
ORDER BY tablename, indexname;

-- ========================================
-- PART 6: RLS POLICIES VERIFICATION
-- ========================================

SELECT 'CHECKING RLS POLICIES...' as step;

SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('tiers', 'categories', 'types', 'field_definitions', 'dropdown_groups', 'dropdown_options', 'items', 'schematics')
ORDER BY tablename, policyname;

-- ========================================
-- PART 7: SAMPLE DATA VERIFICATION
-- ========================================

SELECT 'CHECKING SAMPLE DATA...' as step;

-- Count records in each table
SELECT 'types' as table_name, COUNT(*) as record_count FROM types
UNION ALL
SELECT 'categories' as table_name, COUNT(*) as record_count FROM categories
UNION ALL
SELECT 'tiers' as table_name, COUNT(*) as record_count FROM tiers
UNION ALL
SELECT 'field_definitions' as table_name, COUNT(*) as record_count FROM field_definitions
UNION ALL
SELECT 'dropdown_groups' as table_name, COUNT(*) as record_count FROM dropdown_groups
UNION ALL
SELECT 'dropdown_options' as table_name, COUNT(*) as record_count FROM dropdown_options
UNION ALL
SELECT 'items' as table_name, COUNT(*) as record_count FROM items
UNION ALL
SELECT 'schematics' as table_name, COUNT(*) as record_count FROM schematics
ORDER BY table_name;

-- Sample types data
SELECT 'SAMPLE TYPES DATA:' as info;
SELECT 
    id,
    name,
    category_id,
    parent_type_id,
    icon_image_id,
    icon_fallback,
    created_at,
    updated_by
FROM types 
LIMIT 5;

-- ========================================
-- PART 8: SPECIFIC TYPE QUERY TEST
-- ========================================

SELECT 'TESTING SPECIFIC QUERIES THAT ARE FAILING...' as step;

-- Test the exact query pattern that's failing
BEGIN;

-- Try to simulate the failing query
SELECT 'Testing name equality query...' as test;
SELECT id, name, category_id 
FROM types 
WHERE name = 'test weapon type' 
AND category_id = '71bbb56a-d44b-4f82-9b54-c25bbff84762'::uuid;

-- Test URL decoding issues
SELECT 'Testing URL encoding variations...' as test;
SELECT id, name, category_id 
FROM types 
WHERE name ILIKE '%test%weapon%type%';

ROLLBACK;

-- ========================================
-- PART 9: ERROR DIAGNOSIS
-- ========================================

SELECT 'DIAGNOSING POTENTIAL ISSUES...' as step;

-- Check for data type mismatches
SELECT 
    'Data Type Issues' as category,
    CASE 
        WHEN (SELECT data_type FROM information_schema.columns WHERE table_name = 'types' AND column_name = 'id') != 'uuid'
        THEN 'ERROR: types.id should be UUID but is ' || (SELECT data_type FROM information_schema.columns WHERE table_name = 'types' AND column_name = 'id')
        ELSE 'OK: types.id is UUID'
    END as diagnosis
UNION ALL
SELECT 
    'Schema Completeness' as category,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'types' AND column_name = 'parent_type_id')
        THEN 'ERROR: types.parent_type_id column missing'
        ELSE 'OK: types.parent_type_id exists'
    END as diagnosis;

-- ========================================
-- PART 10: RECOMMENDED FIXES
-- ========================================

SELECT 'GENERATING RECOMMENDED FIXES...' as step;

-- Check what needs to be fixed
DO $$
DECLARE
    missing_cols text[] := ARRAY[]::text[];
    fix_script text := '';
BEGIN
    -- Check for missing parent_type_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'types' AND column_name = 'parent_type_id'
    ) THEN
        missing_cols := array_append(missing_cols, 'parent_type_id');
        fix_script := fix_script || 'ALTER TABLE types ADD COLUMN parent_type_id UUID REFERENCES types(id) ON DELETE SET NULL;' || E'\n';
    END IF;
    
    -- Check for missing updated_by in types
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'types' AND column_name = 'updated_by'
    ) THEN
        missing_cols := array_append(missing_cols, 'updated_by');
        fix_script := fix_script || 'ALTER TABLE types ADD COLUMN updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL;' || E'\n';
    END IF;
    
    IF array_length(missing_cols, 1) > 0 THEN
        RAISE NOTICE 'MISSING COLUMNS DETECTED: %', array_to_string(missing_cols, ', ');
        RAISE NOTICE 'RECOMMENDED FIX SCRIPT:';
        RAISE NOTICE '%', fix_script;
    ELSE
        RAISE NOTICE 'ALL REQUIRED COLUMNS PRESENT';
    END IF;
END $$;

SELECT 'SCHEMA DIAGNOSTIC COMPLETE!' as status; 
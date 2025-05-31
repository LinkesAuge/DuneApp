-- Debug Types Table Permissions - Diagnose HTTP 406 Errors
-- Date: January 29, 2025

-- Check if RLS is enabled on types table
SELECT schemaname, tablename, rowsecurity, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'types';

-- Check table permissions for authenticated role
SELECT 
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'types' 
AND grantee = 'authenticated';

-- Check if the table exists and its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'types' 
ORDER BY ordinal_position;

-- Check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'types';

-- Test a simple select to see if it works at database level
-- (This should work if permissions are correct)
SELECT COUNT(*) as total_types FROM types;

-- Check if there are any other restrictive policies
SELECT 
    pol.policyname,
    pol.permissive,
    pol.roles,
    pol.cmd,
    pol.qual,
    pol.with_check
FROM pg_policy pol
JOIN pg_class pc ON pol.polrelid = pc.oid
WHERE pc.relname = 'types';

-- Check if the authenticated role exists and has proper setup
SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb, rolcanlogin
FROM pg_roles 
WHERE rolname IN ('authenticated', 'anon', 'service_role'); 
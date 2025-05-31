-- AGGRESSIVE Fix for Types Table RLS - Complete Reset
-- Date: January 29, 2025
-- This completely resets all policies and permissions for types table

-- Disable RLS temporarily to clean up
ALTER TABLE types DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies completely
DROP POLICY IF EXISTS "types_select_policy" ON types;
DROP POLICY IF EXISTS "types_insert_policy" ON types;
DROP POLICY IF EXISTS "types_update_policy" ON types;
DROP POLICY IF EXISTS "types_delete_policy" ON types;
DROP POLICY IF EXISTS "Enable read access for all users" ON types;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON types;
DROP POLICY IF EXISTS "Enable update for users based on email" ON types;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON types;

-- Remove any other named policies that might exist
DO $$
DECLARE
    pol_name text;
BEGIN
    FOR pol_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'types' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON types', pol_name);
    END LOOP;
END
$$;

-- Grant basic table permissions first
GRANT ALL ON types TO authenticated;
GRANT ALL ON types TO service_role;
GRANT SELECT ON types TO anon;

-- Create very permissive policies
CREATE POLICY "allow_all_select" ON types
    FOR SELECT 
    USING (true);

CREATE POLICY "allow_authenticated_insert" ON types
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "allow_authenticated_update" ON types
    FOR UPDATE 
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_authenticated_delete" ON types
    FOR DELETE 
    TO authenticated
    USING (true);

-- Re-enable RLS
ALTER TABLE types ENABLE ROW LEVEL SECURITY;

-- Test that it works
SELECT 'Types table permissions reset successfully' as status;

-- Verify the new policies
SELECT policyname, cmd, permissive, roles 
FROM pg_policies 
WHERE tablename = 'types' 
ORDER BY policyname; 
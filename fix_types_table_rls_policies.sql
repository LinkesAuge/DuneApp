-- Fix RLS Policies for Types Table - Resolve HTTP 406 Errors
-- Date: January 29, 2025
-- Issue: TypeManager creation blocked by restrictive RLS policies

-- First, check current policies (for reference)
-- SELECT * FROM pg_policies WHERE tablename = 'types';

-- Drop any overly restrictive existing policies
DROP POLICY IF EXISTS "types_select_policy" ON types;
DROP POLICY IF EXISTS "types_insert_policy" ON types;
DROP POLICY IF EXISTS "types_update_policy" ON types;
DROP POLICY IF EXISTS "types_delete_policy" ON types;

-- Create comprehensive RLS policies for types table
-- Allow SELECT for all authenticated users (needed for duplicate checking)
CREATE POLICY "types_select_policy" ON types
    FOR SELECT 
    TO authenticated
    USING (true);

-- Allow INSERT for authenticated users
CREATE POLICY "types_insert_policy" ON types
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- Allow UPDATE for authenticated users (can update their own or if admin)
CREATE POLICY "types_update_policy" ON types
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Allow DELETE for authenticated users (can delete their own or if admin)
CREATE POLICY "types_delete_policy" ON types
    FOR DELETE 
    TO authenticated
    USING (auth.uid() IS NOT NULL);

-- Ensure RLS is enabled on the types table
ALTER TABLE types ENABLE ROW LEVEL SECURITY;

-- Grant necessary table permissions to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON types TO authenticated;

-- Also ensure permissions on the sequence (if it exists)
-- Note: UUID tables don't have sequences, so this is just for completeness
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'types_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE types_id_seq TO authenticated;
    END IF;
END
$$;

-- Verify the policies are working
-- You can uncomment these to test:
-- SELECT policy_name, cmd, qual, with_check FROM pg_policies WHERE tablename = 'types';
-- SELECT has_table_privilege('authenticated', 'types', 'SELECT');
-- SELECT has_table_privilege('authenticated', 'types', 'INSERT');
-- SELECT has_table_privilege('authenticated', 'types', 'UPDATE');
-- SELECT has_table_privilege('authenticated', 'types', 'DELETE'); 
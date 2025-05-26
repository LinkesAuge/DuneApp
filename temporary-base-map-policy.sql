-- Temporary: Allow any authenticated user to upload base maps (for testing)
-- Run this in your Supabase SQL Editor
-- WARNING: This is more permissive than production settings

-- Drop the restrictive admin policy temporarily
DROP POLICY IF EXISTS "Admin full access to base maps" ON hagga_basin_base_maps;

-- Create a temporary policy that allows any authenticated user to manage base maps
CREATE POLICY "Temporary: Authenticated users can manage base maps" ON hagga_basin_base_maps
FOR ALL USING (auth.uid() IS NOT NULL);

-- Keep the public read policy
-- (The public read access policy should already exist)

SELECT 'Temporary base map policy created - any authenticated user can now upload base maps!' AS status;

-- TO RESTORE ADMIN-ONLY ACCESS LATER, run this:
-- DROP POLICY IF EXISTS "Temporary: Authenticated users can manage base maps" ON hagga_basin_base_maps;
-- CREATE POLICY "Admin full access to base maps" ON hagga_basin_base_maps
-- FOR ALL USING (
--   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
-- ); 
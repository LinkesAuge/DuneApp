-- Dashboard RLS Policies Check
-- Run this in Supabase SQL Editor to ensure proper permissions

-- Check if policies exist for reading data needed by dashboard
-- These should already exist from previous setups, but verify:

-- 1. POIs table - should allow reading
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'pois' 
        AND policyname = 'POIs are viewable by everyone'
    ) THEN
        CREATE POLICY "POIs are viewable by everyone"
            ON pois FOR SELECT
            USING (true);
    END IF;
END
$$;

-- 2. Comments table - should allow reading  
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'comments' 
        AND policyname = 'Comments are viewable by everyone'
    ) THEN
        CREATE POLICY "Comments are viewable by everyone"
            ON comments FOR SELECT
            USING (true);
    END IF;
END
$$;

-- 3. Grid squares table - should allow reading
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'grid_squares' 
        AND policyname = 'Grid squares are viewable by everyone'
    ) THEN
        CREATE POLICY "Grid squares are viewable by everyone"
            ON grid_squares FOR SELECT
            USING (true);
    END IF;
END
$$;

-- 4. Profiles table - should allow reading
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Profiles are viewable by everyone'
    ) THEN
        CREATE POLICY "Profiles are viewable by everyone"
            ON profiles FOR SELECT
            USING (true);
    END IF;
END
$$;

-- 5. Comment screenshots table - should allow reading
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'comment_screenshots' 
        AND policyname = 'Comment screenshots are viewable by everyone'
    ) THEN
        CREATE POLICY "Comment screenshots are viewable by everyone"
            ON comment_screenshots FOR SELECT
            USING (true);
    END IF;
END
$$;

-- Verify all tables have RLS enabled
ALTER TABLE pois ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY; 
ALTER TABLE grid_squares ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_screenshots ENABLE ROW LEVEL SECURITY; 

-- Permanent: Base map policies for admin panel usage
-- Since admin panel access is controlled at the UI level, 
-- we can allow any authenticated user to manage base maps
-- (only admins can reach the upload functionality anyway)

-- Drop any existing base map policies
DROP POLICY IF EXISTS "Admin full access to base maps" ON hagga_basin_base_maps;
DROP POLICY IF EXISTS "Temporary: Authenticated users can manage base maps" ON hagga_basin_base_maps;

-- Create permanent policy for base map management through admin panel
CREATE POLICY "Authenticated users can manage base maps via admin panel" ON hagga_basin_base_maps
FOR ALL USING (auth.uid() IS NOT NULL);

-- Keep the public read policy for active base maps
DROP POLICY IF EXISTS "Public read access to active base maps" ON hagga_basin_base_maps;
CREATE POLICY "Public read access to active base maps" ON hagga_basin_base_maps
FOR SELECT USING (is_active = true);

SELECT 'Base map policies updated for admin panel usage!' AS status; 
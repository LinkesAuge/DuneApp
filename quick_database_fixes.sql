-- Quick Database Fixes for Entity Icons System
-- Run this in your Supabase SQL Editor

-- 1. Create the get_image_display_info function
CREATE OR REPLACE FUNCTION get_image_display_info(
  p_icon_image_id UUID DEFAULT NULL,
  p_icon_fallback TEXT DEFAULT NULL
) RETURNS TABLE (
  image_url TEXT,
  is_image BOOLEAN,
  display_value TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If icon_image_id is provided, try to get the shared image
  IF p_icon_image_id IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      si.image_url::TEXT,
      true::BOOLEAN as is_image,
      si.filename::TEXT as display_value
    FROM shared_images si
    WHERE si.id = p_icon_image_id 
      AND si.is_active = true
    LIMIT 1;
    
    -- If we found a record, return it
    IF FOUND THEN
      RETURN;
    END IF;
  END IF;
  
  -- Fallback to text icon
  RETURN QUERY
  SELECT 
    NULL::TEXT as image_url,
    false::BOOLEAN as is_image,
    COALESCE(p_icon_fallback, '')::TEXT as display_value;
END;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_image_display_info(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_image_display_info(UUID, TEXT) TO anon;

-- 2. Add missing shared_images table if not exists (safety check)
CREATE TABLE IF NOT EXISTS shared_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  image_url TEXT NOT NULL,
  uploaded_by UUID,
  image_type TEXT DEFAULT 'general',
  file_size INTEGER DEFAULT 0,
  mime_type TEXT DEFAULT 'image/webp',
  width INTEGER DEFAULT 64,
  height INTEGER DEFAULT 64,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID
);

-- 3. Enable RLS on shared_images
ALTER TABLE shared_images ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for shared_images (if not exist)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'shared_images' AND policyname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users" ON shared_images
      FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'shared_images' AND policyname = 'Enable insert for authenticated users only'
  ) THEN
    CREATE POLICY "Enable insert for authenticated users only" ON shared_images
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- Quick Database Fixes - Remove poi_items references
-- Run this in your Supabase SQL editor

-- 1. Drop the poi_items table completely (if it still exists)
DROP TABLE IF EXISTS poi_items CASCADE;

-- 2. Drop any triggers that might reference poi_items
DROP TRIGGER IF EXISTS trigger_poi_items_update ON pois;
DROP TRIGGER IF EXISTS update_poi_items_count ON pois;
DROP TRIGGER IF EXISTS sync_poi_items_trigger ON pois;
DROP TRIGGER IF EXISTS poi_items_sync_trigger ON pois;

-- 3. Drop any functions that might reference poi_items
DROP FUNCTION IF EXISTS update_poi_items_count();
DROP FUNCTION IF EXISTS sync_poi_items();
DROP FUNCTION IF EXISTS update_poi_items_count_function();
DROP FUNCTION IF EXISTS sync_poi_items_function();

-- 4. Check if any views reference poi_items (will show results if any exist)
SELECT viewname, definition 
FROM pg_views 
WHERE schemaname = 'public' 
AND definition LIKE '%poi_items%';

-- 5. Check for any remaining functions that reference poi_items
SELECT proname as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND pg_get_functiondef(p.oid) LIKE '%poi_items%';

-- 6. Verify poi_items is completely gone
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%poi_items%';

-- 7. If the above query returns any results, run:
-- DROP TABLE IF EXISTS [table_name] CASCADE;

-- This should resolve the POI creation error
SELECT 'Database cleanup completed successfully' as status; 
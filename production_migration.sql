-- Production Migration Script for Hagga Basin System
-- Apply this script in your Supabase Dashboard SQL Editor

-- Part 1: Fix missing email column in profiles table
-- First check if email column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'email'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
        
        -- Populate email from auth.users for existing profiles
        UPDATE profiles 
        SET email = auth_users.email 
        FROM auth.users auth_users 
        WHERE profiles.id = auth_users.id;
        
        -- Make email column NOT NULL after population
        ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;
        
        -- Add unique constraint on email
        ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
    END IF;
END $$;

-- Part 2: Hagga Basin Interactive Map System
-- Extend existing pois table for multi-map support
DO $$
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pois' AND column_name = 'map_type'
    ) THEN
        ALTER TABLE pois 
        ADD COLUMN map_type TEXT CHECK (map_type IN ('deep_desert', 'hagga_basin')) DEFAULT 'deep_desert',
        ADD COLUMN coordinates_x INTEGER,
        ADD COLUMN coordinates_y INTEGER,
        ADD COLUMN privacy_level TEXT CHECK (privacy_level IN ('global', 'private', 'shared')) DEFAULT 'global';
    END IF;
END $$;

-- Migrate existing POIs to Deep Desert map type
UPDATE pois SET map_type = 'deep_desert' WHERE map_type IS NULL;

-- Add constraints for coordinate validation (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'pois_map_type_consistency'
    ) THEN
        ALTER TABLE pois 
        ADD CONSTRAINT pois_map_type_consistency CHECK (
          (map_type = 'deep_desert' AND grid_square_id IS NOT NULL AND coordinates_x IS NULL AND coordinates_y IS NULL) OR
          (map_type = 'hagga_basin' AND grid_square_id IS NULL AND coordinates_x IS NOT NULL AND coordinates_y IS NOT NULL)
        );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'pois_coordinates_bounds'
    ) THEN
        ALTER TABLE pois 
        ADD CONSTRAINT pois_coordinates_bounds CHECK (
          (coordinates_x IS NULL AND coordinates_y IS NULL) OR
          (coordinates_x >= 0 AND coordinates_x <= 4000 AND coordinates_y >= 0 AND coordinates_y <= 4000)
        );
    END IF;
END $$;

-- Create Hagga Basin base maps table
CREATE TABLE IF NOT EXISTS hagga_basin_base_maps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create Hagga Basin overlays table
CREATE TABLE IF NOT EXISTS hagga_basin_overlays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  opacity DECIMAL(3,2) DEFAULT 1.0 CHECK (opacity >= 0.0 AND opacity <= 1.0),
  display_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  can_toggle BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create POI collections table
CREATE TABLE IF NOT EXISTS poi_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create POI collection items table
CREATE TABLE IF NOT EXISTS poi_collection_items (
  collection_id UUID REFERENCES poi_collections(id) ON DELETE CASCADE,
  poi_id UUID REFERENCES pois(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (collection_id, poi_id)
);

-- Create POI sharing table
CREATE TABLE IF NOT EXISTS poi_shares (
  poi_id UUID REFERENCES pois(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (poi_id, shared_with_user_id)
);

-- Create custom icons table
CREATE TABLE IF NOT EXISTS custom_icons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_pois_map_type ON pois(map_type);
CREATE INDEX IF NOT EXISTS idx_pois_coordinates ON pois(coordinates_x, coordinates_y) WHERE map_type = 'hagga_basin';
CREATE INDEX IF NOT EXISTS idx_pois_privacy_level ON pois(privacy_level);
CREATE INDEX IF NOT EXISTS idx_pois_created_by ON pois(created_by);
CREATE INDEX IF NOT EXISTS idx_hagga_overlays_order ON hagga_basin_overlays(display_order);
CREATE INDEX IF NOT EXISTS idx_poi_collections_created_by ON poi_collections(created_by);
CREATE INDEX IF NOT EXISTS idx_poi_collections_public ON poi_collections(is_public);
CREATE INDEX IF NOT EXISTS idx_custom_icons_user_id ON custom_icons(user_id);

-- Enable Row Level Security
ALTER TABLE hagga_basin_base_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE hagga_basin_overlays ENABLE ROW LEVEL SECURITY;
ALTER TABLE poi_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE poi_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE poi_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_icons ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (drop if exists first)
-- Base maps policies
DROP POLICY IF EXISTS "Admin full access to base maps" ON hagga_basin_base_maps;
DROP POLICY IF EXISTS "Public read access to active base maps" ON hagga_basin_base_maps;

CREATE POLICY "Admin full access to base maps" ON hagga_basin_base_maps
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read access to active base maps" ON hagga_basin_base_maps
FOR SELECT USING (is_active = true);

-- Overlays policies
DROP POLICY IF EXISTS "Admin full access to overlays" ON hagga_basin_overlays;
DROP POLICY IF EXISTS "Public read access to active overlays" ON hagga_basin_overlays;

CREATE POLICY "Admin full access to overlays" ON hagga_basin_overlays
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read access to active overlays" ON hagga_basin_overlays
FOR SELECT USING (is_active = true);

-- Collections policies
DROP POLICY IF EXISTS "Users can manage their own collections" ON poi_collections;
DROP POLICY IF EXISTS "Public read access to public collections" ON poi_collections;

CREATE POLICY "Users can manage their own collections" ON poi_collections
FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Public read access to public collections" ON poi_collections
FOR SELECT USING (is_public = true OR created_by = auth.uid());

-- Collection items policies
DROP POLICY IF EXISTS "Collection owners can manage items" ON poi_collection_items;
DROP POLICY IF EXISTS "Public read access to public collection items" ON poi_collection_items;

CREATE POLICY "Collection owners can manage items" ON poi_collection_items
FOR ALL USING (
  EXISTS (SELECT 1 FROM poi_collections WHERE id = collection_id AND created_by = auth.uid())
);

CREATE POLICY "Public read access to public collection items" ON poi_collection_items
FOR SELECT USING (
  EXISTS (SELECT 1 FROM poi_collections WHERE id = collection_id AND (is_public = true OR created_by = auth.uid()))
);

-- POI shares policies
DROP POLICY IF EXISTS "POI owners can share their POIs" ON poi_shares;
DROP POLICY IF EXISTS "Users can view their received shares" ON poi_shares;
DROP POLICY IF EXISTS "POI owners can delete their shares" ON poi_shares;

CREATE POLICY "POI owners can share their POIs" ON poi_shares
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM pois WHERE id = poi_id AND created_by = auth.uid())
);

CREATE POLICY "Users can view their received shares" ON poi_shares
FOR SELECT USING (shared_with_user_id = auth.uid() OR shared_by_user_id = auth.uid());

CREATE POLICY "POI owners can delete their shares" ON poi_shares
FOR DELETE USING (shared_by_user_id = auth.uid());

-- Custom icons policies
DROP POLICY IF EXISTS "Users can manage their own custom icons" ON custom_icons;
DROP POLICY IF EXISTS "Custom icons user limit" ON custom_icons;

CREATE POLICY "Users can manage their own custom icons" ON custom_icons
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Custom icons user limit" ON custom_icons
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  (SELECT COUNT(*) FROM custom_icons WHERE user_id = auth.uid()) < 10
);

-- Update POI visibility policy
DROP POLICY IF EXISTS "POI visibility with privacy levels" ON pois;

CREATE POLICY "POI visibility with privacy levels" ON pois
FOR SELECT USING (
  privacy_level = 'global' OR
  created_by = auth.uid() OR
  (privacy_level = 'shared' AND id IN (
    SELECT poi_id FROM poi_shares WHERE shared_with_user_id = auth.uid()
  ))
);

-- Create function for collection timestamp updates
CREATE OR REPLACE FUNCTION update_collection_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE poi_collections 
  SET updated_at = NOW() 
  WHERE id = NEW.collection_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop if exists first)
DROP TRIGGER IF EXISTS trigger_update_collection_timestamp ON poi_collection_items;

CREATE TRIGGER trigger_update_collection_timestamp
  AFTER INSERT OR DELETE ON poi_collection_items
  FOR EACH ROW
  EXECUTE FUNCTION update_collection_updated_at();

-- Grant permissions
GRANT SELECT ON hagga_basin_base_maps TO authenticated, anon;
GRANT SELECT ON hagga_basin_overlays TO authenticated, anon;
GRANT ALL ON poi_collections TO authenticated;
GRANT ALL ON poi_collection_items TO authenticated;
GRANT ALL ON poi_shares TO authenticated;
GRANT ALL ON custom_icons TO authenticated;
GRANT SELECT ON poi_collections TO anon;
GRANT SELECT ON poi_collection_items TO anon;

-- Add helpful comments
COMMENT ON TABLE hagga_basin_base_maps IS 'Admin-uploadable base maps for Hagga Basin interactive map';
COMMENT ON TABLE hagga_basin_overlays IS 'Admin-managed overlay layers with opacity and ordering controls';
COMMENT ON TABLE poi_collections IS 'User-created collections for organizing and sharing POIs';
COMMENT ON TABLE poi_collection_items IS 'Many-to-many relationship between collections and POIs';
COMMENT ON TABLE poi_shares IS 'Individual POI sharing permissions between users';
COMMENT ON TABLE custom_icons IS 'User-uploaded custom icons (max 10 per user, 1MB PNG)';

-- Migration completed successfully!
SELECT 'Hagga Basin system migration completed successfully!' AS status; 
-- Hagga Basin Interactive Map System Migration
-- This migration extends the existing POI system to support both Deep Desert (grid-based) 
-- and Hagga Basin (coordinate-based) mapping with privacy controls and collections

-- Step 1: Extend existing pois table for multi-map support
ALTER TABLE pois 
ADD COLUMN map_type TEXT CHECK (map_type IN ('deep_desert', 'hagga_basin')) DEFAULT 'deep_desert',
ADD COLUMN coordinates_x INTEGER, -- Pixel coordinates (0-4000) for Hagga Basin POIs
ADD COLUMN coordinates_y INTEGER, -- Pixel coordinates (0-4000) for Hagga Basin POIs
ADD COLUMN privacy_level TEXT CHECK (privacy_level IN ('global', 'private', 'shared')) DEFAULT 'global';

-- Step 2: Migrate existing POIs to Deep Desert map type
UPDATE pois SET map_type = 'deep_desert' WHERE map_type IS NULL;

-- Step 3: Add constraints for coordinate validation
-- Deep Desert POIs must have grid_square_id, Hagga Basin POIs must have coordinates
ALTER TABLE pois 
ADD CONSTRAINT pois_map_type_consistency CHECK (
  (map_type = 'deep_desert' AND grid_square_id IS NOT NULL AND coordinates_x IS NULL AND coordinates_y IS NULL) OR
  (map_type = 'hagga_basin' AND grid_square_id IS NULL AND coordinates_x IS NOT NULL AND coordinates_y IS NOT NULL)
);

-- Step 4: Add coordinate bounds validation for Hagga Basin POIs
ALTER TABLE pois 
ADD CONSTRAINT pois_coordinates_bounds CHECK (
  (coordinates_x IS NULL AND coordinates_y IS NULL) OR
  (coordinates_x >= 0 AND coordinates_x <= 4000 AND coordinates_y >= 0 AND coordinates_y <= 4000)
);

-- Step 5: Create Hagga Basin base maps table
CREATE TABLE hagga_basin_base_maps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Step 6: Create Hagga Basin overlays table
CREATE TABLE hagga_basin_overlays (
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

-- Step 7: Create POI collections table
CREATE TABLE poi_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 8: Create POI collection items table (many-to-many relationship)
CREATE TABLE poi_collection_items (
  collection_id UUID REFERENCES poi_collections(id) ON DELETE CASCADE,
  poi_id UUID REFERENCES pois(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (collection_id, poi_id)
);

-- Step 9: Create POI sharing table
CREATE TABLE poi_shares (
  poi_id UUID REFERENCES pois(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (poi_id, shared_with_user_id)
);

-- Step 10: Create custom icons table
CREATE TABLE custom_icons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 11: Add indexes for performance
CREATE INDEX idx_pois_map_type ON pois(map_type);
CREATE INDEX idx_pois_coordinates ON pois(coordinates_x, coordinates_y) WHERE map_type = 'hagga_basin';
CREATE INDEX idx_pois_privacy_level ON pois(privacy_level);
CREATE INDEX idx_pois_created_by ON pois(created_by);
CREATE INDEX idx_hagga_overlays_order ON hagga_basin_overlays(display_order);
CREATE INDEX idx_poi_collections_created_by ON poi_collections(created_by);
CREATE INDEX idx_poi_collections_public ON poi_collections(is_public);
CREATE INDEX idx_custom_icons_user_id ON custom_icons(user_id);

-- Step 12: Enable Row Level Security on all new tables
ALTER TABLE hagga_basin_base_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE hagga_basin_overlays ENABLE ROW LEVEL SECURITY;
ALTER TABLE poi_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE poi_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE poi_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_icons ENABLE ROW LEVEL SECURITY;

-- Step 13: Create RLS policies for Hagga Basin base maps (admin only)
CREATE POLICY "Admin full access to base maps" ON hagga_basin_base_maps
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read access to active base maps" ON hagga_basin_base_maps
FOR SELECT USING (is_active = true);

-- Step 14: Create RLS policies for Hagga Basin overlays (admin manage, users view)
CREATE POLICY "Admin full access to overlays" ON hagga_basin_overlays
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read access to active overlays" ON hagga_basin_overlays
FOR SELECT USING (is_active = true);

-- Step 15: Create RLS policies for POI collections
CREATE POLICY "Users can manage their own collections" ON poi_collections
FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Public read access to public collections" ON poi_collections
FOR SELECT USING (is_public = true OR created_by = auth.uid());

-- Step 16: Create RLS policies for POI collection items
CREATE POLICY "Collection owners can manage items" ON poi_collection_items
FOR ALL USING (
  EXISTS (SELECT 1 FROM poi_collections WHERE id = collection_id AND created_by = auth.uid())
);

CREATE POLICY "Public read access to public collection items" ON poi_collection_items
FOR SELECT USING (
  EXISTS (SELECT 1 FROM poi_collections WHERE id = collection_id AND (is_public = true OR created_by = auth.uid()))
);

-- Step 17: Create RLS policies for POI sharing
CREATE POLICY "POI owners can share their POIs" ON poi_shares
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM pois WHERE id = poi_id AND created_by = auth.uid())
);

CREATE POLICY "Users can view their received shares" ON poi_shares
FOR SELECT USING (shared_with_user_id = auth.uid() OR shared_by_user_id = auth.uid());

CREATE POLICY "POI owners can delete their shares" ON poi_shares
FOR DELETE USING (shared_by_user_id = auth.uid());

-- Step 18: Create RLS policies for custom icons
CREATE POLICY "Users can manage their own custom icons" ON custom_icons
FOR ALL USING (user_id = auth.uid());

-- Enforce 10 custom icons per user limit
CREATE POLICY "Custom icons user limit" ON custom_icons
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  (SELECT COUNT(*) FROM custom_icons WHERE user_id = auth.uid()) < 10
);

-- Step 19: Update POI visibility policy to include privacy levels
DROP POLICY IF EXISTS "Users can view relevant POIs" ON pois;

CREATE POLICY "POI visibility with privacy levels" ON pois
FOR SELECT USING (
  privacy_level = 'global' OR
  created_by = auth.uid() OR
  (privacy_level = 'shared' AND id IN (
    SELECT poi_id FROM poi_shares WHERE shared_with_user_id = auth.uid()
  ))
);

-- Step 20: Create function to automatically update collection updated_at timestamp
CREATE OR REPLACE FUNCTION update_collection_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE poi_collections 
  SET updated_at = NOW() 
  WHERE id = NEW.collection_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 21: Create trigger for collection timestamp updates
CREATE TRIGGER trigger_update_collection_timestamp
  AFTER INSERT OR DELETE ON poi_collection_items
  FOR EACH ROW
  EXECUTE FUNCTION update_collection_updated_at();

-- Step 22: Grant necessary permissions to authenticated users
GRANT SELECT ON hagga_basin_base_maps TO authenticated;
GRANT SELECT ON hagga_basin_overlays TO authenticated;
GRANT ALL ON poi_collections TO authenticated;
GRANT ALL ON poi_collection_items TO authenticated;
GRANT ALL ON poi_shares TO authenticated;
GRANT ALL ON custom_icons TO authenticated;

-- Step 23: Grant permissions to anonymous users for public access
GRANT SELECT ON hagga_basin_base_maps TO anon;
GRANT SELECT ON hagga_basin_overlays TO anon;
GRANT SELECT ON poi_collections TO anon;
GRANT SELECT ON poi_collection_items TO anon;

-- Step 24: Add comments for documentation
COMMENT ON TABLE hagga_basin_base_maps IS 'Admin-uploadable base maps for Hagga Basin interactive map';
COMMENT ON TABLE hagga_basin_overlays IS 'Admin-managed overlay layers with opacity and ordering controls';
COMMENT ON TABLE poi_collections IS 'User-created collections for organizing and sharing POIs';
COMMENT ON TABLE poi_collection_items IS 'Many-to-many relationship between collections and POIs';
COMMENT ON TABLE poi_shares IS 'Individual POI sharing permissions between users';
COMMENT ON TABLE custom_icons IS 'User-uploaded custom icons (max 10 per user, 1MB PNG)';

COMMENT ON COLUMN pois.map_type IS 'Identifies which map system the POI belongs to';
COMMENT ON COLUMN pois.coordinates_x IS 'Pixel X coordinate (0-4000) for Hagga Basin POIs';
COMMENT ON COLUMN pois.coordinates_y IS 'Pixel Y coordinate (0-4000) for Hagga Basin POIs';
COMMENT ON COLUMN pois.privacy_level IS 'Visibility level: global (all users), private (owner only), shared (specific users)';

-- Migration complete 
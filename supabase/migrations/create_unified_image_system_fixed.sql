-- =====================================================
-- Unified Image Management System Migration (FIXED)
-- Removes old screenshot systems and creates unified approach
-- =====================================================

-- Step 1: Remove old POI screenshot fields
ALTER TABLE pois DROP COLUMN IF EXISTS screenshots;
ALTER TABLE pois DROP COLUMN IF EXISTS screenshot_url;

-- Step 2: Remove old comment screenshot fields
ALTER TABLE comments DROP COLUMN IF EXISTS screenshot_url;
ALTER TABLE comments DROP COLUMN IF EXISTS screenshots;

-- Step 3: Drop old poi_screenshots table if it exists
DROP TABLE IF EXISTS poi_screenshots CASCADE;

-- Step 4: Create unified managed_images table
CREATE TABLE managed_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_url TEXT NOT NULL,           -- Always the unprocessed original in storage
    processed_url TEXT NULL,              -- Cropped/processed version if exists
    crop_details JSONB NULL,              -- Crop data from react-image-crop
    image_type TEXT NOT NULL,             -- 'poi_screenshot', 'comment_image', 'profile_avatar'
    file_size INTEGER,                    -- File size in bytes
    dimensions JSONB,                     -- {width: 1920, height: 1080}
    mime_type TEXT,                       -- 'image/jpeg', 'image/png'
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Create POI image links table
CREATE TABLE poi_image_links (
    poi_id UUID REFERENCES pois(id) ON DELETE CASCADE,
    image_id UUID REFERENCES managed_images(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (poi_id, image_id)
);

-- Step 6: Create comment image links table
CREATE TABLE comment_image_links (
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    image_id UUID REFERENCES managed_images(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (comment_id, image_id)
);

-- Step 7: Create item image links table
CREATE TABLE item_image_links (
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    image_id UUID REFERENCES managed_images(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (entity_id, image_id)
);

-- Step 8: Create schematic image links table  
CREATE TABLE schematic_image_links (
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    image_id UUID REFERENCES managed_images(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (entity_id, image_id)
);

-- Step 9: Create indexes for performance
CREATE INDEX idx_managed_images_type ON managed_images(image_type);
CREATE INDEX idx_managed_images_uploaded_by ON managed_images(uploaded_by);
CREATE INDEX idx_managed_images_created_at ON managed_images(created_at);
CREATE INDEX idx_poi_image_links_poi ON poi_image_links(poi_id);
CREATE INDEX idx_poi_image_links_display_order ON poi_image_links(poi_id, display_order);
CREATE INDEX idx_comment_image_links_comment ON comment_image_links(comment_id);
CREATE INDEX idx_item_image_links_entity ON item_image_links(entity_id);
CREATE INDEX idx_item_image_links_display_order ON item_image_links(entity_id, display_order);
CREATE INDEX idx_schematic_image_links_entity ON schematic_image_links(entity_id);
CREATE INDEX idx_schematic_image_links_display_order ON schematic_image_links(entity_id, display_order);

-- Step 10: Create constraints
ALTER TABLE managed_images ADD CONSTRAINT valid_image_type 
    CHECK (image_type IN ('poi_screenshot', 'comment_image', 'profile_avatar', 'custom_icon', 'item_screenshot', 'schematic_screenshot'));

-- Step 11: Add RLS policies for managed_images
ALTER TABLE managed_images ENABLE ROW LEVEL SECURITY;

-- Users can view images they uploaded or images linked to public/shared content
CREATE POLICY "Users can view relevant images" ON managed_images
    FOR SELECT USING (
        uploaded_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM poi_image_links pil 
            JOIN pois p ON p.id = pil.poi_id 
            WHERE pil.image_id = managed_images.id 
            AND (p.privacy_level = 'public' OR p.created_by = auth.uid() OR
                EXISTS (SELECT 1 FROM poi_shares ps WHERE ps.poi_id = p.id AND ps.shared_with_user_id = auth.uid()))
        ) OR
        EXISTS (
            SELECT 1 FROM comment_image_links cil 
            JOIN comments c ON c.id = cil.comment_id 
            WHERE cil.image_id = managed_images.id 
            AND c.created_by = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM item_image_links iil 
            WHERE iil.image_id = managed_images.id
        ) OR
        EXISTS (
            SELECT 1 FROM schematic_image_links sil 
            WHERE sil.image_id = managed_images.id
        )
    );

-- Users can insert their own images
CREATE POLICY "Users can upload images" ON managed_images
    FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- Users can update their own images
CREATE POLICY "Users can update their own images" ON managed_images
    FOR UPDATE USING (uploaded_by = auth.uid());

-- Users can delete their own images
CREATE POLICY "Users can delete their own images" ON managed_images
    FOR DELETE USING (uploaded_by = auth.uid());

-- Step 12: Add RLS policies for link tables
ALTER TABLE poi_image_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_image_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_image_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE schematic_image_links ENABLE ROW LEVEL SECURITY;

-- POI image links: follow POI privacy rules
CREATE POLICY "Users can view POI image links" ON poi_image_links
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pois p 
            WHERE p.id = poi_id 
            AND (p.privacy_level = 'public' OR p.created_by = auth.uid() OR
                EXISTS (SELECT 1 FROM poi_shares ps WHERE ps.poi_id = p.id AND ps.shared_with_user_id = auth.uid()))
        )
    );

CREATE POLICY "Users can manage POI image links" ON poi_image_links
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pois p 
            WHERE p.id = poi_id 
            AND p.created_by = auth.uid()
        )
    );

-- Comment image links: users can manage their own comment images
CREATE POLICY "Users can view comment image links" ON comment_image_links
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM comments c 
            WHERE c.id = comment_id 
            AND c.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can manage comment image links" ON comment_image_links
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM comments c 
            WHERE c.id = comment_id 
            AND c.created_by = auth.uid()
        )
    );

-- Item image links: items are public, anyone can view but only authenticated users can manage
CREATE POLICY "Users can view item image links" ON item_image_links
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage item image links" ON item_image_links
    FOR ALL TO authenticated USING (true);

-- Schematic image links: schematics are public, anyone can view but only authenticated users can manage  
CREATE POLICY "Users can view schematic image links" ON schematic_image_links
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage schematic image links" ON schematic_image_links
    FOR ALL TO authenticated USING (true);

-- Step 13: Create updated_at trigger for managed_images
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_managed_images_updated_at 
    BEFORE UPDATE ON managed_images 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 14: Add comments
COMMENT ON TABLE managed_images IS 'Centralized image management for all uploaded images with original/processed tracking';
COMMENT ON TABLE poi_image_links IS 'Links POIs to their associated images';
COMMENT ON TABLE comment_image_links IS 'Links comments to their associated images';
COMMENT ON TABLE item_image_links IS 'Links items (entities) to their associated screenshots';
COMMENT ON TABLE schematic_image_links IS 'Links schematics (entities) to their associated screenshots';

COMMENT ON COLUMN managed_images.original_url IS 'URL to the original, unprocessed image file';
COMMENT ON COLUMN managed_images.processed_url IS 'URL to processed version (cropped, resized, etc.)';
COMMENT ON COLUMN managed_images.crop_details IS 'JSON crop data from react-image-crop for recreating crops';
COMMENT ON COLUMN managed_images.image_type IS 'Type of image for categorization and processing rules'; 
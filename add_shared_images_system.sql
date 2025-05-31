-- Shared Images System Migration for Items & Schematics
-- This migration adds a comprehensive shared image library system
-- allowing users to upload and share images for categories, types, subtypes, and tiers
-- ALL IMAGES ARE AVAILABLE FOR ALL USES - no restrictions

-- Step 1: Create shared_images table
CREATE TABLE shared_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    image_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES profiles(id),
    image_type TEXT CHECK (image_type IN ('category', 'type', 'tier', 'general')) DEFAULT 'general',
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif')),
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    tags TEXT[], -- Array of tags for searching/filtering
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- Step 2: Add indexes for performance
CREATE INDEX idx_shared_images_type ON shared_images(image_type);
CREATE INDEX idx_shared_images_active ON shared_images(is_active);
CREATE INDEX idx_shared_images_uploaded_by ON shared_images(uploaded_by);
CREATE INDEX idx_shared_images_usage_count ON shared_images(usage_count DESC);
CREATE INDEX idx_shared_images_tags ON shared_images USING GIN(tags);
CREATE INDEX idx_shared_images_created_at ON shared_images(created_at DESC);

-- Step 3: Add image reference columns to existing tables
-- Categories - add image reference while keeping text icon as fallback
ALTER TABLE categories ADD COLUMN icon_image_id UUID REFERENCES shared_images(id);
ALTER TABLE categories ADD COLUMN icon_fallback TEXT; -- Store current icon as fallback

-- Update existing categories to use icon_fallback
UPDATE categories SET icon_fallback = icon WHERE icon IS NOT NULL AND icon != '';

-- Types - add image support
ALTER TABLE types ADD COLUMN icon_image_id UUID REFERENCES shared_images(id);
ALTER TABLE types ADD COLUMN icon_fallback TEXT;

-- Subtypes - add image support  
ALTER TABLE subtypes ADD COLUMN icon_image_id UUID REFERENCES shared_images(id);
ALTER TABLE subtypes ADD COLUMN icon_fallback TEXT;

-- Tiers - add image support
ALTER TABLE tiers ADD COLUMN icon_image_id UUID REFERENCES shared_images(id);
ALTER TABLE tiers ADD COLUMN icon_fallback TEXT;

-- Step 4: Create updated_at trigger for shared_images
CREATE TRIGGER update_shared_images_updated_at 
    BEFORE UPDATE ON shared_images 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Create RLS policies for shared_images

-- Allow all authenticated users to read active images (NO TYPE RESTRICTIONS)
CREATE POLICY "Everyone can view active shared images" ON shared_images
    FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');

-- Allow authenticated users to upload images (NO TYPE RESTRICTIONS)
CREATE POLICY "Authenticated users can upload images" ON shared_images
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND uploaded_by = auth.uid());

-- Allow users to update their own uploaded images
CREATE POLICY "Users can update own uploaded images" ON shared_images
    FOR UPDATE USING (uploaded_by = auth.uid());

-- Allow admins to manage all images
CREATE POLICY "Admins can manage all shared images" ON shared_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin')
        )
    );

-- Enable RLS
ALTER TABLE shared_images ENABLE ROW LEVEL SECURITY;

-- Step 6: Create usage tracking function
CREATE OR REPLACE FUNCTION increment_image_usage(image_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE shared_images 
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = image_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create function to get image display info
CREATE OR REPLACE FUNCTION get_image_display_info(
    p_icon_image_id UUID DEFAULT NULL,
    p_icon_fallback TEXT DEFAULT NULL
)
RETURNS TABLE(
    image_url TEXT,
    is_image BOOLEAN,
    display_value TEXT
) AS $$
BEGIN
    -- If we have an image ID, return image info
    IF p_icon_image_id IS NOT NULL THEN
        RETURN QUERY
        SELECT 
            si.image_url,
            true as is_image,
            si.filename as display_value
        FROM shared_images si
        WHERE si.id = p_icon_image_id 
        AND si.is_active = true;
        
        -- If image found, we're done
        IF FOUND THEN
            RETURN;
        END IF;
    END IF;
    
    -- Fall back to text icon
    RETURN QUERY
    SELECT 
        NULL::TEXT as image_url,
        false as is_image,
        p_icon_fallback as display_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Add comments for documentation
COMMENT ON TABLE shared_images IS 'Central repository for all shared images - available for use across all categories, types, tiers, etc.';
COMMENT ON COLUMN shared_images.image_type IS 'Organizational hint for image browsing - does NOT restrict usage, all images available everywhere';
COMMENT ON COLUMN shared_images.usage_count IS 'Tracks how many times this image is referenced across the system';
COMMENT ON COLUMN shared_images.tags IS 'Array of tags for searching and filtering images - helps users find relevant images';
COMMENT ON COLUMN shared_images.is_active IS 'Admin control - inactive images are hidden from selection but existing references remain';

COMMENT ON COLUMN categories.icon_image_id IS 'Reference to any shared image for category icon';
COMMENT ON COLUMN categories.icon_fallback IS 'Text icon fallback when no image is selected';

COMMENT ON COLUMN types.icon_image_id IS 'Reference to any shared image for type icon';
COMMENT ON COLUMN types.icon_fallback IS 'Text icon fallback when no image is selected';

COMMENT ON COLUMN subtypes.icon_image_id IS 'Reference to any shared image for subtype icon';
COMMENT ON COLUMN subtypes.icon_fallback IS 'Text icon fallback when no image is selected';

COMMENT ON COLUMN tiers.icon_image_id IS 'Reference to any shared image for tier icon';
COMMENT ON COLUMN tiers.icon_fallback IS 'Text icon fallback when no image is selected';

-- Step 9: Seed with diverse starter images (available for ALL uses)
INSERT INTO shared_images (filename, storage_path, image_url, image_type, file_size, mime_type, width, height, tags, description) VALUES
-- Weapons (usable for categories, types, tiers, anything)
('sword-icon.png', 'shared-images/sword-icon.png', '', 'general', 2048, 'image/png', 64, 64, ARRAY['weapon', 'sword', 'melee', 'blade'], 'Sword icon - great for weapons, melee types, or any sharp/cutting themes'),
('gun-icon.png', 'shared-images/gun-icon.png', '', 'general', 1920, 'image/png', 64, 64, ARRAY['weapon', 'gun', 'ranged', 'firearm'], 'Gun icon - perfect for weapons, ranged categories, or modern tech'),
('bow-icon.png', 'shared-images/bow-icon.png', '', 'general', 1856, 'image/png', 64, 64, ARRAY['weapon', 'bow', 'ranged', 'archery'], 'Bow icon - ideal for ranged weapons, traditional tech, or hunting themes'),

-- Tools & Utilities
('hammer-icon.png', 'shared-images/hammer-icon.png', '', 'general', 1984, 'image/png', 64, 64, ARRAY['tool', 'hammer', 'crafting', 'utility'], 'Hammer icon - excellent for tools, crafting, utility, or construction themes'),
('wrench-icon.png', 'shared-images/wrench-icon.png', '', 'general', 1792, 'image/png', 64, 64, ARRAY['tool', 'wrench', 'utility', 'mechanical'], 'Wrench icon - great for utilities, mechanical items, or repair themes'),
('gear-icon.png', 'shared-images/gear-icon.png', '', 'general', 2240, 'image/png', 64, 64, ARRAY['utility', 'gear', 'mechanical', 'system'], 'Gear icon - versatile for utilities, systems, mechanical themes, or tech tiers'),

-- Resources & Materials
('ore-icon.png', 'shared-images/ore-icon.png', '', 'general', 2112, 'image/png', 64, 64, ARRAY['resource', 'ore', 'material', 'mining'], 'Ore icon - perfect for resources, raw materials, or mining themes'),
('crystal-icon.png', 'shared-images/crystal-icon.png', '', 'general', 2304, 'image/png', 64, 64, ARRAY['crystal', 'resource', 'magic', 'energy'], 'Crystal icon - ideal for rare resources, energy sources, or magical themes'),
('wood-icon.png', 'shared-images/wood-icon.png', '', 'general', 1664, 'image/png', 64, 64, ARRAY['resource', 'wood', 'material', 'natural'], 'Wood icon - great for natural resources, crafting materials, or basic tiers'),

-- Consumables & Potions
('potion-icon.png', 'shared-images/potion-icon.png', '', 'general', 1856, 'image/png', 64, 64, ARRAY['consumable', 'potion', 'healing', 'liquid'], 'Potion icon - excellent for consumables, healing items, or chemical themes'),
('food-icon.png', 'shared-images/food-icon.png', '', 'general', 1728, 'image/png', 64, 64, ARRAY['consumable', 'food', 'nutrition', 'survival'], 'Food icon - perfect for consumables, survival items, or nutrition themes'),

-- Tech & Schematics
('blueprint-icon.png', 'shared-images/blueprint-icon.png', '', 'general', 1984, 'image/png', 64, 64, ARRAY['schematic', 'blueprint', 'knowledge', 'design'], 'Blueprint icon - ideal for schematics, knowledge items, or design themes'),
('circuit-icon.png', 'shared-images/circuit-icon.png', '', 'general', 2176, 'image/png', 64, 64, ARRAY['technology', 'circuit', 'electronic', 'advanced'], 'Circuit icon - great for advanced tech, electronics, or high-tier items'),

-- Armor & Protection
('shield-icon.png', 'shared-images/shield-icon.png', '', 'general', 2048, 'image/png', 64, 64, ARRAY['armor', 'shield', 'protection', 'defense'], 'Shield icon - excellent for armor, protection, or defensive themes'),
('helmet-icon.png', 'shared-images/helmet-icon.png', '', 'general', 1920, 'image/png', 64, 64, ARRAY['armor', 'helmet', 'protection', 'head'], 'Helmet icon - perfect for armor, head protection, or safety themes'),

-- Abstract & Tier Indicators
('star-icon.png', 'shared-images/star-icon.png', '', 'general', 1536, 'image/png', 64, 64, ARRAY['tier', 'quality', 'rating', 'special'], 'Star icon - versatile for tiers, quality levels, or special designations'),
('diamond-icon.png', 'shared-images/diamond-icon.png', '', 'general', 1792, 'image/png', 64, 64, ARRAY['tier', 'precious', 'rare', 'valuable'], 'Diamond icon - ideal for high tiers, rare items, or valuable designations');

-- Note: The image_url field will be populated when actual images are uploaded to storage
-- All images are available for use in any context - categories, types, tiers, etc.

-- Step 10: Create view for easy image browsing with usage stats
CREATE VIEW shared_images_with_stats AS
SELECT 
    si.*,
    p.username as uploaded_by_username,
    COUNT(DISTINCT cat.id) + COUNT(DISTINCT t.id) + COUNT(DISTINCT st.id) + COUNT(DISTINCT tier.id) as active_usage_count
FROM shared_images si
LEFT JOIN profiles p ON si.uploaded_by = p.id
LEFT JOIN categories cat ON cat.icon_image_id = si.id
LEFT JOIN types t ON t.icon_image_id = si.id  
LEFT JOIN subtypes st ON st.icon_image_id = si.id
LEFT JOIN tiers tier ON tier.icon_image_id = si.id
GROUP BY si.id, p.username;

COMMENT ON VIEW shared_images_with_stats IS 'Enhanced view of shared images with uploader info and real-time usage statistics across all entity types';

\echo 'Shared Images System migration completed successfully!';
\echo 'New features added:';
\echo '- shared_images table for central image repository';
\echo '- Image reference columns added to categories, types, subtypes, tiers';
\echo '- ALL IMAGES AVAILABLE FOR ALL USES - no restrictions by type';
\echo '- Usage tracking and admin management capabilities';
\echo '- Backward compatibility with text icon fallbacks';
\echo '- Seeded with diverse starter images for all themes';
\echo '- RLS policies for proper access control'; 
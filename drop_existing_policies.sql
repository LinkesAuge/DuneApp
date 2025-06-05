-- Drop existing policies safely before creating new ones
DO $$
BEGIN
    -- Drop managed_images policies
    DROP POLICY IF EXISTS "Users can view relevant images" ON managed_images;
    DROP POLICY IF EXISTS "Users can upload images" ON managed_images;
    DROP POLICY IF EXISTS "Users can update their own images" ON managed_images;
    DROP POLICY IF EXISTS "Users can delete their own images" ON managed_images;
    
    -- Drop poi_image_links policies
    DROP POLICY IF EXISTS "Users can view POI image links" ON poi_image_links;
    DROP POLICY IF EXISTS "Users can manage POI image links" ON poi_image_links;
    
    -- Drop comment_image_links policies
    DROP POLICY IF EXISTS "Users can view comment image links" ON comment_image_links;
    DROP POLICY IF EXISTS "Users can manage comment image links" ON comment_image_links;
    
    -- Drop item_image_links policies
    DROP POLICY IF EXISTS "Users can view item image links" ON item_image_links;
    DROP POLICY IF EXISTS "Users can manage item image links" ON item_image_links;
    
    -- Drop schematic_image_links policies
    DROP POLICY IF EXISTS "Users can view schematic image links" ON schematic_image_links;
    DROP POLICY IF EXISTS "Users can manage schematic image links" ON schematic_image_links;
END $$; 
-- ==========================================
-- POI-Item Integration Migration
-- Adds support for linking POIs to Items and Schematics
-- ==========================================

-- Create poi_item_links table
CREATE TABLE IF NOT EXISTS poi_item_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poi_id UUID NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
    item_id UUID NULL REFERENCES items(id) ON DELETE CASCADE,
    schematic_id UUID NULL REFERENCES schematics(id) ON DELETE CASCADE,
    link_type TEXT NOT NULL CHECK (link_type IN ('found_here', 'crafted_here', 'required_for', 'material_source')),
    quantity INTEGER NULL CHECK (quantity > 0),
    notes TEXT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT check_item_or_schematic CHECK (
        (item_id IS NOT NULL AND schematic_id IS NULL) OR 
        (item_id IS NULL AND schematic_id IS NOT NULL)
    ),
    CONSTRAINT unique_poi_item_link UNIQUE (poi_id, item_id, schematic_id, link_type)
);

-- Add comments for documentation
COMMENT ON TABLE poi_item_links IS 'Links POIs to Items and Schematics with relationship types';
COMMENT ON COLUMN poi_item_links.link_type IS 'Type of relationship: found_here, crafted_here, required_for, material_source';
COMMENT ON COLUMN poi_item_links.quantity IS 'Optional quantity for recipe requirements';
COMMENT ON CONSTRAINT check_item_or_schematic ON poi_item_links IS 'Ensures exactly one of item_id or schematic_id is set';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_poi_item_links_poi_id ON poi_item_links(poi_id);
CREATE INDEX IF NOT EXISTS idx_poi_item_links_item_id ON poi_item_links(item_id) WHERE item_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_poi_item_links_schematic_id ON poi_item_links(schematic_id) WHERE schematic_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_poi_item_links_link_type ON poi_item_links(link_type);
CREATE INDEX IF NOT EXISTS idx_poi_item_links_created_by ON poi_item_links(created_by);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_poi_item_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at
DROP TRIGGER IF EXISTS update_poi_item_links_updated_at_trigger ON poi_item_links;
CREATE TRIGGER update_poi_item_links_updated_at_trigger
    BEFORE UPDATE ON poi_item_links
    FOR EACH ROW
    EXECUTE FUNCTION update_poi_item_links_updated_at();

-- ==========================================
-- RLS Policies for poi_item_links
-- ==========================================

-- Enable RLS
ALTER TABLE poi_item_links ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all poi_item_links
CREATE POLICY "Allow authenticated users to read poi_item_links" ON poi_item_links
    FOR SELECT TO authenticated
    USING (true);

-- Allow authenticated users to create poi_item_links
CREATE POLICY "Allow authenticated users to create poi_item_links" ON poi_item_links
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own poi_item_links or admins to update any
CREATE POLICY "Allow users to update own poi_item_links or admins all" ON poi_item_links
    FOR UPDATE TO authenticated
    USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin')
        )
    )
    WITH CHECK (
        auth.uid() = updated_by OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin')
        )
    );

-- Allow users to delete their own poi_item_links or admins to delete any
CREATE POLICY "Allow users to delete own poi_item_links or admins all" ON poi_item_links
    FOR DELETE TO authenticated
    USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin')
        )
    );

-- ==========================================
-- Sample Data for Testing
-- ==========================================

-- Add some sample POI-Item links (only if sample data doesn't exist)
DO $$
DECLARE
    sample_poi_id UUID;
    sample_item_id UUID;
    sample_schematic_id UUID;
    admin_user_id UUID;
BEGIN
    -- Get a sample POI (any existing POI)
    SELECT id INTO sample_poi_id FROM pois LIMIT 1;
    
    -- Get sample item and schematic
    SELECT id INTO sample_item_id FROM items LIMIT 1;
    SELECT id INTO sample_schematic_id FROM schematics LIMIT 1;
    
    -- Get an admin user
    SELECT id INTO admin_user_id FROM profiles WHERE role = 'admin' LIMIT 1;
    
    -- Only add sample data if we have the required entities
    IF sample_poi_id IS NOT NULL AND sample_item_id IS NOT NULL AND admin_user_id IS NOT NULL THEN
        -- Insert sample item link (item found at POI)
        INSERT INTO poi_item_links (poi_id, item_id, link_type, quantity, notes, created_by)
        VALUES (
            sample_poi_id,
            sample_item_id,
            'found_here',
            1,
            'Sample item location link for testing',
            admin_user_id
        )
        ON CONFLICT (poi_id, item_id, schematic_id, link_type) DO NOTHING;
        
        RAISE NOTICE 'Sample POI-Item link created';
    END IF;
    
    -- Add schematic link if available
    IF sample_poi_id IS NOT NULL AND sample_schematic_id IS NOT NULL AND admin_user_id IS NOT NULL THEN
        -- Insert sample schematic link (schematic crafted at POI)
        INSERT INTO poi_item_links (poi_id, schematic_id, link_type, quantity, notes, created_by)
        VALUES (
            sample_poi_id,
            sample_schematic_id,
            'crafted_here',
            NULL,
            'Sample schematic crafting location for testing',
            admin_user_id
        )
        ON CONFLICT (poi_id, item_id, schematic_id, link_type) DO NOTHING;
        
        RAISE NOTICE 'Sample POI-Schematic link created';
    END IF;
END $$;

-- ==========================================
-- Verification Queries
-- ==========================================

-- Check table creation
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'poi_item_links' 
ORDER BY ordinal_position;

-- Check constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'poi_item_links';

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'poi_item_links';

-- Check RLS policies
SELECT 
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'poi_item_links';

-- Check sample data
SELECT 
    COUNT(*) as link_count,
    link_type,
    COUNT(DISTINCT poi_id) as unique_pois,
    COUNT(DISTINCT item_id) as unique_items,
    COUNT(DISTINCT schematic_id) as unique_schematics
FROM poi_item_links 
GROUP BY link_type;

RAISE NOTICE 'POI-Item Integration Migration completed successfully!'; 
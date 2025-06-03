-- POI Entity Links Schema Cleanup Migration
-- Date: January 30, 2025
-- Purpose: Remove unnecessary fields and add proper audit trail to poi_entity_links table

BEGIN;

-- First, let's check if poi_entity_links table exists and create/modify it
-- Drop unnecessary columns if they exist
DO $$ 
BEGIN
    -- Remove assignment_source column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'poi_entity_links' AND column_name = 'assignment_source') THEN
        ALTER TABLE poi_entity_links DROP COLUMN assignment_source;
        RAISE NOTICE 'Dropped assignment_source column';
    END IF;

    -- Remove notes column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'poi_entity_links' AND column_name = 'notes') THEN
        ALTER TABLE poi_entity_links DROP COLUMN notes;
        RAISE NOTICE 'Dropped notes column';
    END IF;

    -- Add updated_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'poi_entity_links' AND column_name = 'updated_by') THEN
        ALTER TABLE poi_entity_links ADD COLUMN updated_by UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Added updated_by column';
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'poi_entity_links' AND column_name = 'updated_at') THEN
        ALTER TABLE poi_entity_links ADD COLUMN updated_at TIMESTAMPTZ;
        RAISE NOTICE 'Added updated_at column';
    END IF;
END $$;

-- Create or replace trigger function for updated_at
CREATE OR REPLACE FUNCTION update_poi_entity_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS poi_entity_links_updated_at_trigger ON poi_entity_links;

-- Create trigger for automatic updated_at and updated_by
CREATE TRIGGER poi_entity_links_updated_at_trigger
    BEFORE UPDATE ON poi_entity_links
    FOR EACH ROW
    EXECUTE FUNCTION update_poi_entity_links_updated_at();

-- Add comments to document the schema
COMMENT ON TABLE poi_entity_links IS 'Links between POIs and entities (items/schematics) with quantities';
COMMENT ON COLUMN poi_entity_links.poi_id IS 'Foreign key to pois table';
COMMENT ON COLUMN poi_entity_links.entity_id IS 'Foreign key to entities table';
COMMENT ON COLUMN poi_entity_links.quantity IS 'Quantity of the entity found at this POI';
COMMENT ON COLUMN poi_entity_links.added_by IS 'User who created this link';
COMMENT ON COLUMN poi_entity_links.added_at IS 'When this link was created';
COMMENT ON COLUMN poi_entity_links.updated_by IS 'User who last updated this link';
COMMENT ON COLUMN poi_entity_links.updated_at IS 'When this link was last updated';

-- Ensure proper RLS policies exist
DROP POLICY IF EXISTS "Users can view poi entity links" ON poi_entity_links;
DROP POLICY IF EXISTS "Users can insert poi entity links" ON poi_entity_links;
DROP POLICY IF EXISTS "Users can update poi entity links" ON poi_entity_links;
DROP POLICY IF EXISTS "Users can delete poi entity links" ON poi_entity_links;

-- Enable RLS
ALTER TABLE poi_entity_links ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view poi entity links" ON poi_entity_links
    FOR SELECT USING (true); -- All users can view all links

CREATE POLICY "Authenticated users can insert poi entity links" ON poi_entity_links
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own links or global POI links" ON poi_entity_links
    FOR UPDATE USING (
        added_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM pois 
            WHERE pois.id = poi_entity_links.poi_id 
            AND pois.privacy_level = 'global'
        )
    );

CREATE POLICY "Users can delete their own links or global POI links" ON poi_entity_links
    FOR DELETE USING (
        added_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM pois 
            WHERE pois.id = poi_entity_links.poi_id 
            AND pois.privacy_level = 'global'
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_poi_entity_links_poi_id ON poi_entity_links(poi_id);
CREATE INDEX IF NOT EXISTS idx_poi_entity_links_entity_id ON poi_entity_links(entity_id);
CREATE INDEX IF NOT EXISTS idx_poi_entity_links_added_by ON poi_entity_links(added_by);
CREATE INDEX IF NOT EXISTS idx_poi_entity_links_added_at ON poi_entity_links(added_at);

-- Show final table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'poi_entity_links' 
ORDER BY ordinal_position;

COMMIT; 
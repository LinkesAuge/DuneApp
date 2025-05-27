-- Add updated_at column to pois table
-- This migration adds tracking for when POIs are last updated

-- Add the updated_at column with a default value of the current timestamp
ALTER TABLE pois 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Set updated_at to created_at for existing records
UPDATE pois 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Make the column NOT NULL now that all records have values
ALTER TABLE pois 
ALTER COLUMN updated_at SET NOT NULL;

-- Create or replace the function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_poi_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at when a POI is modified
DROP TRIGGER IF EXISTS update_pois_updated_at ON pois;
CREATE TRIGGER update_pois_updated_at
    BEFORE UPDATE ON pois
    FOR EACH ROW
    EXECUTE FUNCTION update_poi_updated_at();

-- Add comment to document the new column
COMMENT ON COLUMN pois.updated_at IS 'Timestamp when the POI was last updated'; 
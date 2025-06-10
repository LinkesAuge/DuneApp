-- Add visibility and map availability settings to poi_types table
ALTER TABLE poi_types 
ADD COLUMN IF NOT EXISTS default_visible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS available_on_deep_desert BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS available_on_hagga_basin BOOLEAN DEFAULT true;

-- Add comments to document the new columns
COMMENT ON COLUMN poi_types.default_visible IS 'Whether this POI category should be visible by default when users first load the map';
COMMENT ON COLUMN poi_types.available_on_deep_desert IS 'Whether this POI category is available/shown on the Deep Desert map';
COMMENT ON COLUMN poi_types.available_on_hagga_basin IS 'Whether this POI category is available/shown on the Hagga Basin map';

-- Update existing POI types to have sensible defaults
-- All existing categories will be visible by default and available on both maps
UPDATE poi_types 
SET 
    default_visible = true,
    available_on_deep_desert = true,
    available_on_hagga_basin = true
WHERE 
    default_visible IS NULL 
    OR available_on_deep_desert IS NULL 
    OR available_on_hagga_basin IS NULL; 
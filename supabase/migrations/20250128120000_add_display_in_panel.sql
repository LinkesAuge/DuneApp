-- Add display_in_panel field to poi_types table
-- This determines if a category should appear in the main POI filter panel sections
-- vs being grouped under "Other Types"

ALTER TABLE poi_types 
ADD COLUMN display_in_panel boolean DEFAULT false;

-- Set current base categories to display in panel
UPDATE poi_types 
SET display_in_panel = true 
WHERE category IN ('Base', 'Resources', 'Locations', 'NPCs', 'Trainer');

-- Add comment for documentation
COMMENT ON COLUMN poi_types.display_in_panel IS 'Determines if POI types of this category appear in main filter sections or under "Other Types"'; 
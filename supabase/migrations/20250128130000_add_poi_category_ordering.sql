-- Add category display ordering to poi_types table
-- This allows admins to control the order and column placement of categories in map controls

-- Add display order and column preference
ALTER TABLE poi_types 
ADD COLUMN category_display_order INTEGER DEFAULT 0,
ADD COLUMN category_column_preference INTEGER DEFAULT 1 CHECK (category_column_preference IN (1, 2));

-- Set initial ordering for existing categories
-- Left column (1): Base, NPCs, test
UPDATE poi_types SET category_display_order = 1, category_column_preference = 1 WHERE category = 'Base';
UPDATE poi_types SET category_display_order = 3, category_column_preference = 1 WHERE category = 'NPCs';
UPDATE poi_types SET category_display_order = 5, category_column_preference = 1 WHERE category = 'test';

-- Right column (2): Locations, Resources, Trainer  
UPDATE poi_types SET category_display_order = 2, category_column_preference = 2 WHERE category = 'Locations';
UPDATE poi_types SET category_display_order = 4, category_column_preference = 2 WHERE category = 'Resources';
UPDATE poi_types SET category_display_order = 6, category_column_preference = 2 WHERE category = 'Trainer';

-- Add comments for documentation
COMMENT ON COLUMN poi_types.category_display_order IS 'Controls the order in which categories appear in map control panels (lower numbers first)';
COMMENT ON COLUMN poi_types.category_column_preference IS 'Which column the category should appear in: 1=left, 2=right'; 
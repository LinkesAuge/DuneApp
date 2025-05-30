-- Apply category ordering fields to database
-- This script adds the ordering columns and sets initial values

-- Check if columns exist, if not add them
DO $$ 
BEGIN 
    -- Add category_display_order if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'poi_types' AND column_name = 'category_display_order'
    ) THEN
        ALTER TABLE poi_types ADD COLUMN category_display_order INTEGER DEFAULT 0;
    END IF;
    
    -- Add category_column_preference if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'poi_types' AND column_name = 'category_column_preference'
    ) THEN
        ALTER TABLE poi_types ADD COLUMN category_column_preference INTEGER DEFAULT 1;
        ALTER TABLE poi_types ADD CONSTRAINT poi_types_column_preference_check 
        CHECK (category_column_preference IN (1, 2));
    END IF;
END $$;

-- Set initial ordering for existing categories
-- Left column (1): Base, NPCs, test
UPDATE poi_types SET category_display_order = 1, category_column_preference = 1 WHERE category = 'Base';
UPDATE poi_types SET category_display_order = 3, category_column_preference = 1 WHERE category = 'NPCs';
UPDATE poi_types SET category_display_order = 5, category_column_preference = 1 WHERE category = 'test';

-- Right column (2): Locations, Resources, Trainer  
UPDATE poi_types SET category_display_order = 2, category_column_preference = 2 WHERE category = 'Locations';
UPDATE poi_types SET category_display_order = 4, category_column_preference = 2 WHERE category = 'Resources';
UPDATE poi_types SET category_display_order = 6, category_column_preference = 2 WHERE category = 'Trainer';

-- Verify the changes
SELECT DISTINCT category, category_display_order, category_column_preference 
FROM poi_types 
WHERE category_display_order > 0
ORDER BY category_display_order; 
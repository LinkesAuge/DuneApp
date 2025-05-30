-- Fix display_in_panel column issue
-- This script will add the column if it doesn't exist and set proper values

-- Check if column exists, if not add it
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'poi_types' AND column_name = 'display_in_panel'
    ) THEN
        ALTER TABLE poi_types ADD COLUMN display_in_panel boolean DEFAULT false;
    END IF;
END $$;

-- Set display_in_panel = true for main categories
UPDATE poi_types 
SET display_in_panel = true 
WHERE category IN ('Base', 'Resources', 'Locations', 'NPCs', 'Trainer');

-- Verify the update
SELECT category, display_in_panel, COUNT(*) as count
FROM poi_types 
GROUP BY category, display_in_panel 
ORDER BY category; 
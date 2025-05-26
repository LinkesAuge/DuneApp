-- Add missing description column to hagga_basin_base_maps table
-- Run this in your Supabase SQL Editor

ALTER TABLE hagga_basin_base_maps 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add a comment for documentation
COMMENT ON COLUMN hagga_basin_base_maps.description IS 'Optional description of the base map showing its features and purpose';

-- Update the table comment to reflect the new column
COMMENT ON TABLE hagga_basin_base_maps IS 'Admin-uploadable base maps for Hagga Basin interactive map with optional descriptions';

SELECT 'Description column added successfully!' AS status; 
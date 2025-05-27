-- Fix Deep Desert POI Constraint - Allow Optional Coordinates
-- This fixes the constraint that was preventing Deep Desert POIs from having coordinates
-- for placement on grid screenshots.

-- Drop the old constraint that was too restrictive
ALTER TABLE pois 
DROP CONSTRAINT IF EXISTS pois_map_type_consistency;

-- Add the corrected constraint that allows Deep Desert POIs to have optional coordinates
ALTER TABLE pois 
ADD CONSTRAINT pois_map_type_consistency CHECK (
  (map_type = 'deep_desert' AND grid_square_id IS NOT NULL) OR
  (map_type = 'hagga_basin' AND grid_square_id IS NULL AND coordinates_x IS NOT NULL AND coordinates_y IS NOT NULL)
);

-- This new constraint allows:
-- - Deep Desert POIs: MUST have grid_square_id, MAY have coordinates (for screenshot placement)
-- - Hagga Basin POIs: MUST have coordinates, MUST NOT have grid_square_id 
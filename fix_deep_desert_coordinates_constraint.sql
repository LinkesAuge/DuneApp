-- Fix coordinates constraint for unified pixel-based system
-- Both map types now use pixel coordinates:
-- Hagga Basin: 0-4000 pixels (4000x4000 maps)
-- Deep Desert: 0-2000 pixels (2000x2000 screenshots)

-- Drop the existing constraint
ALTER TABLE pois DROP CONSTRAINT IF EXISTS pois_coordinates_bounds;

-- Add updated constraint for pixel coordinates
ALTER TABLE pois ADD CONSTRAINT pois_coordinates_bounds CHECK (
  (coordinates_x IS NULL AND coordinates_y IS NULL) OR
  (coordinates_x >= 0 AND coordinates_x <= 4000 AND coordinates_y >= 0 AND coordinates_y <= 4000)
);

-- Update column comments to reflect the new unified system
COMMENT ON COLUMN pois.coordinates_x IS 'X coordinate in pixels: 0-4000 for Hagga Basin, 0-2000 for Deep Desert';
COMMENT ON COLUMN pois.coordinates_y IS 'Y coordinate in pixels: 0-4000 for Hagga Basin, 0-2000 for Deep Desert'; 
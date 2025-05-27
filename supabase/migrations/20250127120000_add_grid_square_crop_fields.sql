-- Migration: Add crop-related fields to grid_squares table
-- This allows storing both original and cropped screenshots with crop metadata

-- Add columns for crop functionality
ALTER TABLE grid_squares 
ADD COLUMN IF NOT EXISTS original_screenshot_url TEXT NULL,
ADD COLUMN IF NOT EXISTS crop_x INTEGER NULL,
ADD COLUMN IF NOT EXISTS crop_y INTEGER NULL, 
ADD COLUMN IF NOT EXISTS crop_width INTEGER NULL,
ADD COLUMN IF NOT EXISTS crop_height INTEGER NULL,
ADD COLUMN IF NOT EXISTS crop_created_at TIMESTAMP WITH TIME ZONE NULL;

-- Comment the new columns
COMMENT ON COLUMN grid_squares.original_screenshot_url IS 'URL of the original uploaded screenshot before cropping';
COMMENT ON COLUMN grid_squares.crop_x IS 'X coordinate of crop selection on original image (pixels)';
COMMENT ON COLUMN grid_squares.crop_y IS 'Y coordinate of crop selection on original image (pixels)'; 
COMMENT ON COLUMN grid_squares.crop_width IS 'Width of crop selection on original image (pixels)';
COMMENT ON COLUMN grid_squares.crop_height IS 'Height of crop selection on original image (pixels)';
COMMENT ON COLUMN grid_squares.crop_created_at IS 'When the crop was last applied';

-- Update existing records to use screenshot_url as both original and current (for records that have screenshots)
UPDATE grid_squares 
SET original_screenshot_url = screenshot_url 
WHERE screenshot_url IS NOT NULL AND original_screenshot_url IS NULL;

-- Create index for performance on crop queries
CREATE INDEX IF NOT EXISTS idx_grid_squares_has_crop 
ON grid_squares (id) 
WHERE crop_x IS NOT NULL; 
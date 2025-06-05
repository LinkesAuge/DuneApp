-- Add original_url and crop_details columns to comment_screenshots table
-- This enables support for separate original and cropped comment screenshot storage

-- Add original_url column to store the uncropped/original version of the screenshot
ALTER TABLE comment_screenshots 
ADD COLUMN IF NOT EXISTS original_url TEXT;

-- Add crop_details column to store the crop information (JSON format)
-- This will store the crop coordinates and dimensions for reproducing the crop
ALTER TABLE comment_screenshots 
ADD COLUMN IF NOT EXISTS crop_details JSONB;

-- Add updated_by and updated_at columns for audit trail when screenshots are re-cropped
ALTER TABLE comment_screenshots 
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Add comments to document the new columns
COMMENT ON COLUMN comment_screenshots.original_url IS 'URL of the original uncropped screenshot file';
COMMENT ON COLUMN comment_screenshots.crop_details IS 'JSON object containing crop coordinates and dimensions for the displayed version';
COMMENT ON COLUMN comment_screenshots.updated_by IS 'User who last updated/re-cropped this screenshot';
COMMENT ON COLUMN comment_screenshots.updated_at IS 'Timestamp when this screenshot was last updated/re-cropped';

-- Create index on updated_by for performance
CREATE INDEX IF NOT EXISTS idx_comment_screenshots_updated_by ON comment_screenshots(updated_by);

-- Add RLS policies to ensure proper access control for the new columns
-- Users can see original URLs for screenshots they have access to
-- Users can update screenshots they uploaded or have edit permissions for the parent comment 
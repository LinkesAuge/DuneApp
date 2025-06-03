-- Entities Table Integration with Shared Images System
-- Adds shared images support to the unified entities table
-- Following the established pattern from categories and types tables

-- Add shared images fields to entities table
ALTER TABLE entities 
  ADD COLUMN icon_image_id UUID REFERENCES shared_images(id) ON DELETE SET NULL,
  ADD COLUMN icon_fallback VARCHAR(50);

-- Migrate existing icon data to fallback field
UPDATE entities 
SET icon_fallback = icon 
WHERE icon IS NOT NULL AND icon != '';

-- Add index for performance
CREATE INDEX idx_entities_icon_image_id ON entities(icon_image_id);

-- Add column comments for documentation
COMMENT ON COLUMN entities.icon_image_id IS 'Reference to shared image for entity icon';
COMMENT ON COLUMN entities.icon_fallback IS 'Fallback text/emoji icon when no image is selected';

-- Verify the integration
SELECT 
  COUNT(*) as total_entities,
  COUNT(icon_fallback) as entities_with_fallback_icons,
  COUNT(icon_image_id) as entities_with_shared_images
FROM entities;

-- Show sample of migrated data
SELECT 
  name, 
  category, 
  icon_fallback, 
  icon_image_id,
  CASE 
    WHEN icon_image_id IS NOT NULL THEN 'Shared Image'
    WHEN icon_fallback IS NOT NULL THEN 'Fallback Icon'
    ELSE 'No Icon'
  END as icon_status
FROM entities 
LIMIT 10; 
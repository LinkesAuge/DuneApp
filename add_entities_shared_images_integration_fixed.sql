-- Fixed Entities Table Integration with Shared Images System
-- Handles icon field length issues by using appropriate VARCHAR size

-- Step 1: First check if columns already exist (for reruns)
DO $$
BEGIN
    -- Check if icon_image_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'entities' AND column_name = 'icon_image_id'
    ) THEN
        -- Add shared images fields to entities table with larger VARCHAR for icon_fallback
        ALTER TABLE entities 
          ADD COLUMN icon_image_id UUID REFERENCES shared_images(id) ON DELETE SET NULL,
          ADD COLUMN icon_fallback VARCHAR(255); -- Increased from 50 to 255 characters
          
        RAISE NOTICE 'Added icon_image_id and icon_fallback columns to entities table';
    ELSE
        RAISE NOTICE 'Columns already exist - skipping ALTER TABLE';
    END IF;
END
$$;

-- Step 2: Migrate existing icon data to fallback field with length handling
UPDATE entities 
SET icon_fallback = CASE 
    WHEN LENGTH(icon) <= 255 THEN icon
    ELSE LEFT(icon, 252) || '...'  -- Truncate long icons with ellipsis
END
WHERE icon IS NOT NULL 
  AND icon != '' 
  AND (icon_fallback IS NULL OR icon_fallback = '');

-- Step 3: Add index for performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_entities_icon_image_id ON entities(icon_image_id);

-- Step 4: Add column comments for documentation
COMMENT ON COLUMN entities.icon_image_id IS 'Reference to shared image for entity icon';
COMMENT ON COLUMN entities.icon_fallback IS 'Fallback text/emoji icon when no image is selected (max 255 chars)';

-- Step 5: Verify the integration and show results
DO $$
DECLARE
    total_entities INTEGER;
    entities_with_fallback INTEGER;
    entities_with_shared_images INTEGER;
    entities_with_long_icons INTEGER;
BEGIN
    SELECT 
        COUNT(*),
        COUNT(icon_fallback),
        COUNT(icon_image_id),
        COUNT(CASE WHEN LENGTH(icon_fallback) > 100 THEN 1 END)
    INTO total_entities, entities_with_fallback, entities_with_shared_images, entities_with_long_icons
    FROM entities;
    
    RAISE NOTICE '=== MIGRATION VERIFICATION ===';
    RAISE NOTICE 'Total entities: %', total_entities;
    RAISE NOTICE 'Entities with fallback icons: %', entities_with_fallback;
    RAISE NOTICE 'Entities with shared images: %', entities_with_shared_images;
    RAISE NOTICE 'Entities with long fallback icons (>100 chars): %', entities_with_long_icons;
    RAISE NOTICE '=== MIGRATION COMPLETE ===';
END
$$;

-- Step 6: Show sample of migrated data
SELECT 
  name, 
  category, 
  LENGTH(icon_fallback) as fallback_length,
  icon_fallback,
  icon_image_id,
  CASE 
    WHEN icon_image_id IS NOT NULL THEN 'Shared Image'
    WHEN icon_fallback IS NOT NULL THEN 'Fallback Icon'
    ELSE 'No Icon'
  END as icon_status
FROM entities 
WHERE icon_fallback IS NOT NULL
ORDER BY LENGTH(icon_fallback) DESC
LIMIT 10; 
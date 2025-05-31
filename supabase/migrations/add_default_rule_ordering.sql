-- Add display_order columns to default assignment tables
-- This enables custom ordering of rules within each POI type

-- Add display_order to poi_type_default_items
ALTER TABLE poi_type_default_items 
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Add display_order to poi_type_default_schematics  
ALTER TABLE poi_type_default_schematics
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Create indexes for efficient ordering queries
CREATE INDEX idx_poi_type_default_items_order ON poi_type_default_items(poi_type_id, display_order);
CREATE INDEX idx_poi_type_default_schematics_order ON poi_type_default_schematics(poi_type_id, display_order);

-- Initialize display_order for existing records based on creation order
UPDATE poi_type_default_items 
SET display_order = (
  SELECT ROW_NUMBER() OVER (PARTITION BY poi_type_id ORDER BY created_at) - 1
  FROM poi_type_default_items pdi 
  WHERE pdi.id = poi_type_default_items.id
);

UPDATE poi_type_default_schematics
SET display_order = (
  SELECT ROW_NUMBER() OVER (PARTITION BY poi_type_id ORDER BY created_at) - 1  
  FROM poi_type_default_schematics pds
  WHERE pds.id = poi_type_default_schematics.id
);

-- Function to get next display_order for a POI type (items)
CREATE OR REPLACE FUNCTION get_next_item_display_order(poi_type_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_order INTEGER;
BEGIN
  SELECT COALESCE(MAX(display_order), -1) + 1
  INTO next_order
  FROM poi_type_default_items
  WHERE poi_type_id = poi_type_uuid AND is_active = true;
  
  RETURN next_order;
END;
$$;

-- Function to get next display_order for a POI type (schematics)
CREATE OR REPLACE FUNCTION get_next_schematic_display_order(poi_type_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql  
SECURITY DEFINER
AS $$
DECLARE
  next_order INTEGER;
BEGIN
  SELECT COALESCE(MAX(display_order), -1) + 1
  INTO next_order
  FROM poi_type_default_schematics
  WHERE poi_type_id = poi_type_uuid AND is_active = true;
  
  RETURN next_order;
END;
$$;

-- Function to reorder default items within a POI type
CREATE OR REPLACE FUNCTION reorder_default_items(
  rule_uuid UUID,
  new_order INTEGER,
  poi_type_uuid UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_order INTEGER;
  temp_order INTEGER = -999999;
BEGIN
  -- Get current order
  SELECT display_order INTO old_order
  FROM poi_type_default_items
  WHERE id = rule_uuid AND poi_type_id = poi_type_uuid;
  
  IF old_order IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- If no change needed
  IF old_order = new_order THEN
    RETURN TRUE;
  END IF;
  
  -- Use temporary order to avoid conflicts
  UPDATE poi_type_default_items
  SET display_order = temp_order
  WHERE id = rule_uuid;
  
  -- Shift other items
  IF old_order < new_order THEN
    -- Moving down: shift items up
    UPDATE poi_type_default_items
    SET display_order = display_order - 1
    WHERE poi_type_id = poi_type_uuid 
      AND display_order > old_order 
      AND display_order <= new_order
      AND is_active = true;
  ELSE
    -- Moving up: shift items down  
    UPDATE poi_type_default_items
    SET display_order = display_order + 1
    WHERE poi_type_id = poi_type_uuid
      AND display_order >= new_order
      AND display_order < old_order
      AND is_active = true;
  END IF;
  
  -- Set final order
  UPDATE poi_type_default_items
  SET display_order = new_order
  WHERE id = rule_uuid;
  
  RETURN TRUE;
END;
$$;

-- Function to reorder default schematics within a POI type
CREATE OR REPLACE FUNCTION reorder_default_schematics(
  rule_uuid UUID,
  new_order INTEGER,
  poi_type_uuid UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  
AS $$
DECLARE
  old_order INTEGER;
  temp_order INTEGER = -999999;
BEGIN
  -- Get current order
  SELECT display_order INTO old_order
  FROM poi_type_default_schematics
  WHERE id = rule_uuid AND poi_type_id = poi_type_uuid;
  
  IF old_order IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- If no change needed
  IF old_order = new_order THEN
    RETURN TRUE;
  END IF;
  
  -- Use temporary order to avoid conflicts
  UPDATE poi_type_default_schematics
  SET display_order = temp_order
  WHERE id = rule_uuid;
  
  -- Shift other items
  IF old_order < new_order THEN
    -- Moving down: shift items up
    UPDATE poi_type_default_schematics
    SET display_order = display_order - 1
    WHERE poi_type_id = poi_type_uuid 
      AND display_order > old_order 
      AND display_order <= new_order
      AND is_active = true;
  ELSE
    -- Moving up: shift items down
    UPDATE poi_type_default_schematics  
    SET display_order = display_order + 1
    WHERE poi_type_id = poi_type_uuid
      AND display_order >= new_order
      AND display_order < old_order
      AND is_active = true;
  END IF;
  
  -- Set final order
  UPDATE poi_type_default_schematics
  SET display_order = new_order
  WHERE id = rule_uuid;
  
  RETURN TRUE;
END;
$$;

-- Add comments explaining the new fields
COMMENT ON COLUMN poi_type_default_items.display_order IS 'Order in which this item rule appears in UI (0-based)';
COMMENT ON COLUMN poi_type_default_schematics.display_order IS 'Order in which this schematic rule appears in UI (0-based)'; 
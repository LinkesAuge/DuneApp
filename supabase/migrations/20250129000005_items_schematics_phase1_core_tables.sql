-- Items & Schematics System - Phase 1: Core Infrastructure
-- Migration 5: Core Items and Schematics Tables
-- Purpose: Create main entity tables for items and schematics
-- Estimated completion time: 4-5 hours

-- Step 1: Create items table
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Hierarchical references (category required, others optional)
  category_id UUID NOT NULL REFERENCES categories(id),
  type_id UUID REFERENCES types(id),
  subtype_id UUID REFERENCES subtypes(id),
  tier_id UUID REFERENCES tiers(id),
  
  -- Icon system integration
  icon_url TEXT,
  
  -- Dynamic field values
  field_values JSONB DEFAULT '{}',
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validation constraints
  CHECK (category_id IS NOT NULL),
  CHECK (
    (type_id IS NULL AND subtype_id IS NULL) OR
    (type_id IS NOT NULL)
  )
);

-- Step 2: Create schematics table (identical structure to items)
CREATE TABLE schematics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Hierarchical references (same structure as items)
  category_id UUID NOT NULL REFERENCES categories(id),
  type_id UUID REFERENCES types(id),
  subtype_id UUID REFERENCES subtypes(id),
  tier_id UUID REFERENCES tiers(id),
  
  -- Icon system integration
  icon_url TEXT,
  
  -- Dynamic field values
  field_values JSONB DEFAULT '{}',
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Same validation constraints as items
  CHECK (category_id IS NOT NULL),
  CHECK (
    (type_id IS NULL AND subtype_id IS NULL) OR
    (type_id IS NOT NULL)
  )
);

-- Step 3: Create case-insensitive unique name constraints
CREATE UNIQUE INDEX items_name_unique ON items (LOWER(name));
CREATE UNIQUE INDEX schematics_name_unique ON schematics (LOWER(name));

-- Step 4: Add table comments for documentation
COMMENT ON TABLE items IS 'Game items with dynamic fields and hierarchical categorization';
COMMENT ON COLUMN items.name IS 'Display name for the item (must be unique)';
COMMENT ON COLUMN items.description IS 'Optional description of the item';
COMMENT ON COLUMN items.category_id IS 'Required reference to category (e.g., Weapons, Armor)';
COMMENT ON COLUMN items.type_id IS 'Optional reference to type within category (e.g., Sidearms within Weapons)';
COMMENT ON COLUMN items.subtype_id IS 'Optional reference to subtype within type (e.g., Pistols within Sidearms)';
COMMENT ON COLUMN items.tier_id IS 'Optional reference to tech tier (e.g., Makeshift, Copper)';
COMMENT ON COLUMN items.icon_url IS 'Optional icon URL or identifier';
COMMENT ON COLUMN items.field_values IS 'JSON object storing dynamic field values based on category/type';
COMMENT ON COLUMN items.is_global IS 'Whether this item is available to all users or just the creator';

COMMENT ON TABLE schematics IS 'Game schematics/blueprints with dynamic fields and hierarchical categorization';
COMMENT ON COLUMN schematics.name IS 'Display name for the schematic (must be unique)';
COMMENT ON COLUMN schematics.description IS 'Optional description of the schematic';
COMMENT ON COLUMN schematics.category_id IS 'Required reference to category (e.g., Blueprints, Crafting)';
COMMENT ON COLUMN schematics.type_id IS 'Optional reference to type within category';
COMMENT ON COLUMN schematics.subtype_id IS 'Optional reference to subtype within type';
COMMENT ON COLUMN schematics.tier_id IS 'Optional reference to tech tier';
COMMENT ON COLUMN schematics.icon_url IS 'Optional icon URL or identifier';
COMMENT ON COLUMN schematics.field_values IS 'JSON object storing dynamic field values based on category/type';
COMMENT ON COLUMN schematics.is_global IS 'Whether this schematic is available to all users or just the creator';

-- Step 5: Create indexes for performance
-- Items indexes
CREATE INDEX idx_items_category_type ON items(category_id, type_id);
CREATE INDEX idx_items_tier ON items(tier_id);
CREATE INDEX idx_items_created_by ON items(created_by);
CREATE INDEX idx_items_is_global ON items(is_global);
CREATE INDEX idx_items_field_values_gin ON items USING GIN(field_values);
CREATE INDEX idx_items_name_lower ON items(LOWER(name));

-- Schematics indexes
CREATE INDEX idx_schematics_category_type ON schematics(category_id, type_id);
CREATE INDEX idx_schematics_tier ON schematics(tier_id);
CREATE INDEX idx_schematics_created_by ON schematics(created_by);
CREATE INDEX idx_schematics_is_global ON schematics(is_global);
CREATE INDEX idx_schematics_field_values_gin ON schematics USING GIN(field_values);
CREATE INDEX idx_schematics_name_lower ON schematics(LOWER(name));

-- Step 6: Create screenshot tables for items and schematics
CREATE TABLE item_screenshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  original_url TEXT,
  crop_details JSONB,
  uploaded_by UUID REFERENCES profiles(id),
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sort_order INTEGER DEFAULT 0,
  file_size INTEGER,
  file_name TEXT
);

CREATE TABLE schematic_screenshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schematic_id UUID NOT NULL REFERENCES schematics(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  original_url TEXT,
  crop_details JSONB,
  uploaded_by UUID REFERENCES profiles(id),
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sort_order INTEGER DEFAULT 0,
  file_size INTEGER,
  file_name TEXT
);

-- Step 7: Add screenshot table comments
COMMENT ON TABLE item_screenshots IS 'Screenshots associated with items';
COMMENT ON COLUMN item_screenshots.original_url IS 'Original uncropped image URL';
COMMENT ON COLUMN item_screenshots.crop_details IS 'Crop information from react-image-crop';
COMMENT ON COLUMN item_screenshots.sort_order IS 'Order for displaying screenshots (lower = first)';

COMMENT ON TABLE schematic_screenshots IS 'Screenshots associated with schematics';
COMMENT ON COLUMN schematic_screenshots.original_url IS 'Original uncropped image URL';
COMMENT ON COLUMN schematic_screenshots.crop_details IS 'Crop information from react-image-crop';
COMMENT ON COLUMN schematic_screenshots.sort_order IS 'Order for displaying screenshots (lower = first)';

-- Step 8: Create screenshot table indexes
CREATE INDEX idx_item_screenshots_item_id ON item_screenshots(item_id);
CREATE INDEX idx_item_screenshots_uploaded_by ON item_screenshots(uploaded_by);
CREATE INDEX idx_item_screenshots_sort_order ON item_screenshots(sort_order);

CREATE INDEX idx_schematic_screenshots_schematic_id ON schematic_screenshots(schematic_id);
CREATE INDEX idx_schematic_screenshots_uploaded_by ON schematic_screenshots(uploaded_by);
CREATE INDEX idx_schematic_screenshots_sort_order ON schematic_screenshots(sort_order);

-- Step 9: Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE schematics ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE schematic_screenshots ENABLE ROW LEVEL SECURITY;

-- Step 10: Create RLS policies for items
CREATE POLICY "Public read access to global items" ON items 
  FOR SELECT USING (is_global = true);

CREATE POLICY "Users can read their own items" ON items 
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Authenticated users can create items" ON items 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own items or admins can update all" ON items 
  FOR UPDATE USING (
    created_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can delete own items or admins can delete all" ON items 
  FOR DELETE USING (
    created_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Step 11: Create RLS policies for schematics (identical to items)
CREATE POLICY "Public read access to global schematics" ON schematics 
  FOR SELECT USING (is_global = true);

CREATE POLICY "Users can read their own schematics" ON schematics 
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Authenticated users can create schematics" ON schematics 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own schematics or admins can update all" ON schematics 
  FOR UPDATE USING (
    created_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can delete own schematics or admins can delete all" ON schematics 
  FOR DELETE USING (
    created_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Step 12: Create RLS policies for item screenshots
CREATE POLICY "Users can view screenshots for viewable items" ON item_screenshots 
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM items 
      WHERE id = item_id 
      AND (is_global = true OR created_by = auth.uid())
    )
  );

CREATE POLICY "Users can manage screenshots for their items" ON item_screenshots 
  FOR ALL USING (
    EXISTS(
      SELECT 1 FROM items 
      WHERE id = item_id 
      AND (created_by = auth.uid() OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- Step 13: Create RLS policies for schematic screenshots
CREATE POLICY "Users can view screenshots for viewable schematics" ON schematic_screenshots 
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM schematics 
      WHERE id = schematic_id 
      AND (is_global = true OR created_by = auth.uid())
    )
  );

CREATE POLICY "Users can manage screenshots for their schematics" ON schematic_screenshots 
  FOR ALL USING (
    EXISTS(
      SELECT 1 FROM schematics 
      WHERE id = schematic_id 
      AND (created_by = auth.uid() OR EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- Step 14: Create triggers for updated_at timestamp
CREATE TRIGGER handle_items_updated_at 
  BEFORE UPDATE ON items 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_schematics_updated_at 
  BEFORE UPDATE ON schematics 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

-- Step 15: Create validation functions
CREATE OR REPLACE FUNCTION validate_item_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
  category_applies_to TEXT[];
  type_category_id UUID;
  subtype_type_id UUID;
BEGIN
  -- Validate that category applies to items
  SELECT applies_to INTO category_applies_to 
  FROM categories 
  WHERE id = NEW.category_id;
  
  IF NOT ('items' = ANY(category_applies_to)) THEN
    RAISE EXCEPTION 'Category does not apply to items';
  END IF;
  
  -- Validate type belongs to category if specified
  IF NEW.type_id IS NOT NULL THEN
    SELECT category_id INTO type_category_id 
    FROM types 
    WHERE id = NEW.type_id;
    
    IF type_category_id != NEW.category_id THEN
      RAISE EXCEPTION 'Type does not belong to the specified category';
    END IF;
  END IF;
  
  -- Validate subtype belongs to type if specified
  IF NEW.subtype_id IS NOT NULL THEN
    SELECT type_id INTO subtype_type_id 
    FROM subtypes 
    WHERE id = NEW.subtype_id;
    
    IF subtype_type_id != NEW.type_id THEN
      RAISE EXCEPTION 'Subtype does not belong to the specified type';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_schematic_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
  category_applies_to TEXT[];
  type_category_id UUID;
  subtype_type_id UUID;
BEGIN
  -- Validate that category applies to schematics
  SELECT applies_to INTO category_applies_to 
  FROM categories 
  WHERE id = NEW.category_id;
  
  IF NOT ('schematics' = ANY(category_applies_to)) THEN
    RAISE EXCEPTION 'Category does not apply to schematics';
  END IF;
  
  -- Validate type belongs to category if specified
  IF NEW.type_id IS NOT NULL THEN
    SELECT category_id INTO type_category_id 
    FROM types 
    WHERE id = NEW.type_id;
    
    IF type_category_id != NEW.category_id THEN
      RAISE EXCEPTION 'Type does not belong to the specified category';
    END IF;
  END IF;
  
  -- Validate subtype belongs to type if specified
  IF NEW.subtype_id IS NOT NULL THEN
    SELECT type_id INTO subtype_type_id 
    FROM subtypes 
    WHERE id = NEW.subtype_id;
    
    IF subtype_type_id != NEW.type_id THEN
      RAISE EXCEPTION 'Subtype does not belong to the specified type';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 16: Create validation triggers
CREATE TRIGGER validate_item_hierarchy_trigger
  BEFORE INSERT OR UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION validate_item_hierarchy();

CREATE TRIGGER validate_schematic_hierarchy_trigger
  BEFORE INSERT OR UPDATE ON schematics
  FOR EACH ROW
  EXECUTE FUNCTION validate_schematic_hierarchy();

-- Step 17: Insert sample data for testing
-- Insert a sample weapon item
WITH weapons_category AS (
  SELECT id FROM categories WHERE name = 'Weapons' AND is_global = true
), sidearms_type AS (
  SELECT id FROM types t
  JOIN categories c ON t.category_id = c.id
  WHERE t.name = 'Sidearms' AND c.name = 'Weapons' AND t.is_global = true
), makeshift_tier AS (
  SELECT id FROM tiers WHERE name = 'Makeshift'
)
INSERT INTO items (name, description, category_id, type_id, tier_id, field_values, is_global)
SELECT 
  'Makeshift Pistol',
  'A crude but functional sidearm crafted from scavenged materials',
  weapons_category.id,
  sidearms_type.id,
  makeshift_tier.id,
  '{"damage": 15, "range": 25, "accuracy": 65, "rarity": "common"}',
  true
FROM weapons_category, sidearms_type, makeshift_tier;

-- Insert a sample crafting schematic
WITH crafting_category AS (
  SELECT id FROM categories WHERE name = 'Crafting' AND is_global = true
), copper_tier AS (
  SELECT id FROM tiers WHERE name = 'Copper'
)
INSERT INTO schematics (name, description, category_id, tier_id, field_values, is_global)
SELECT 
  'Copper Sword Blueprint',
  'Schematic for crafting a basic copper sword',
  crafting_category.id,
  copper_tier.id,
  '{"rarity": "common", "required_materials": "Copper Ingot x3, Wood Handle x1"}',
  true
FROM crafting_category, copper_tier;

-- Step 18: Grant necessary permissions
GRANT SELECT ON items TO authenticated;
GRANT INSERT ON items TO authenticated;
GRANT UPDATE ON items TO authenticated;
GRANT DELETE ON items TO authenticated;

GRANT SELECT ON schematics TO authenticated;
GRANT INSERT ON schematics TO authenticated;
GRANT UPDATE ON schematics TO authenticated;
GRANT DELETE ON schematics TO authenticated;

GRANT SELECT ON item_screenshots TO authenticated;
GRANT INSERT ON item_screenshots TO authenticated;
GRANT UPDATE ON item_screenshots TO authenticated;
GRANT DELETE ON item_screenshots TO authenticated;

GRANT SELECT ON schematic_screenshots TO authenticated;
GRANT INSERT ON schematic_screenshots TO authenticated;
GRANT UPDATE ON schematic_screenshots TO authenticated;
GRANT DELETE ON schematic_screenshots TO authenticated; 
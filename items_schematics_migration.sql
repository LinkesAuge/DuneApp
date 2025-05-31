-- Items & Schematics System - Complete Migration Script
-- Safe to execute in Supabase Dashboard SQL Editor
-- This creates all new tables without affecting existing data

-- ============================================
-- STEP 1: Create Updated Timestamp Function
-- ============================================

CREATE OR REPLACE FUNCTION handle_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 2: Create Tiers Table
-- ============================================

CREATE TABLE tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  level INTEGER NOT NULL UNIQUE,
  color TEXT DEFAULT '#6B7280',
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tiers table indexes
CREATE INDEX idx_tiers_level ON tiers(level);
CREATE INDEX idx_tiers_created_by ON tiers(created_by);
CREATE INDEX idx_tiers_name_lower ON tiers(LOWER(name));

-- Tiers RLS policies
ALTER TABLE tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to tiers" ON tiers 
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tiers" ON tiers 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own tiers or admins can update all" ON tiers 
  FOR UPDATE USING (
    created_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can delete own tiers or admins can delete all" ON tiers 
  FOR DELETE USING (
    created_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Tiers updated_at trigger
CREATE TRIGGER handle_tiers_updated_at 
  BEFORE UPDATE ON tiers 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- STEP 3: Create Categories Table
-- ============================================

CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  applies_to TEXT[] NOT NULL DEFAULT ARRAY['items', 'schematics'],
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validation: applies_to must contain valid values
  CONSTRAINT valid_applies_to CHECK (
    applies_to <@ ARRAY['items', 'schematics'] AND
    array_length(applies_to, 1) > 0
  )
);

-- Categories unique constraint for global categories
CREATE UNIQUE INDEX idx_categories_name_global ON categories (LOWER(name)) WHERE is_global = true;

-- Categories table indexes
CREATE INDEX idx_categories_created_by ON categories(created_by);
CREATE INDEX idx_categories_applies_to ON categories USING GIN(applies_to);
CREATE INDEX idx_categories_is_global ON categories(is_global);
CREATE INDEX idx_categories_name_lower ON categories(LOWER(name));

-- Categories RLS policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to global categories" ON categories 
  FOR SELECT USING (is_global = true);

CREATE POLICY "Users can read their own categories" ON categories 
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Authenticated users can create categories" ON categories 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own categories or admins can update all" ON categories 
  FOR UPDATE USING (
    created_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can delete own categories or admins can delete all" ON categories 
  FOR DELETE USING (
    created_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Categories updated_at trigger
CREATE TRIGGER handle_categories_updated_at 
  BEFORE UPDATE ON categories 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- STEP 4: Create Types Table
-- ============================================

CREATE TABLE types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validation: name must be unique within category
  UNIQUE(name, category_id)
);

-- Types table indexes
CREATE INDEX idx_types_category_id ON types(category_id);
CREATE INDEX idx_types_created_by ON types(created_by);
CREATE INDEX idx_types_is_global ON types(is_global);
CREATE INDEX idx_types_name_lower ON types(LOWER(name));

-- Types RLS policies
ALTER TABLE types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to global types" ON types 
  FOR SELECT USING (is_global = true);

CREATE POLICY "Users can read their own types" ON types 
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Authenticated users can create types" ON types 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own types or admins can update all" ON types 
  FOR UPDATE USING (
    created_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can delete own types or admins can delete all" ON types 
  FOR DELETE USING (
    created_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Types updated_at trigger
CREATE TRIGGER handle_types_updated_at 
  BEFORE UPDATE ON types 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- STEP 5: Create SubTypes Table
-- ============================================

CREATE TABLE subtypes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type_id UUID NOT NULL REFERENCES types(id) ON DELETE CASCADE,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validation: name must be unique within type
  UNIQUE(name, type_id)
);

-- SubTypes table indexes
CREATE INDEX idx_subtypes_type_id ON subtypes(type_id);
CREATE INDEX idx_subtypes_created_by ON subtypes(created_by);
CREATE INDEX idx_subtypes_is_global ON subtypes(is_global);
CREATE INDEX idx_subtypes_name_lower ON subtypes(LOWER(name));

-- SubTypes RLS policies
ALTER TABLE subtypes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to global subtypes" ON subtypes 
  FOR SELECT USING (is_global = true);

CREATE POLICY "Users can read their own subtypes" ON subtypes 
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Authenticated users can create subtypes" ON subtypes 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own subtypes or admins can update all" ON subtypes 
  FOR UPDATE USING (
    created_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can delete own subtypes or admins can delete all" ON subtypes 
  FOR DELETE USING (
    created_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- SubTypes updated_at trigger
CREATE TRIGGER handle_subtypes_updated_at 
  BEFORE UPDATE ON subtypes 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- STEP 6: Create Dropdown Groups Table
-- ============================================

CREATE TABLE dropdown_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dropdown groups indexes
CREATE INDEX idx_dropdown_groups_created_by ON dropdown_groups(created_by);
CREATE INDEX idx_dropdown_groups_name_lower ON dropdown_groups(LOWER(name));

-- Dropdown groups RLS policies
ALTER TABLE dropdown_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to dropdown groups" ON dropdown_groups 
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create dropdown groups" ON dropdown_groups 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own groups or admins can update all" ON dropdown_groups 
  FOR UPDATE USING (
    created_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can delete own groups or admins can delete all" ON dropdown_groups 
  FOR DELETE USING (
    created_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Dropdown groups updated_at trigger
CREATE TRIGGER handle_dropdown_groups_updated_at 
  BEFORE UPDATE ON dropdown_groups 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- STEP 7: Create Dropdown Options Table
-- ============================================

CREATE TABLE dropdown_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES dropdown_groups(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  display_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(group_id, value)
);

-- Dropdown options indexes
CREATE INDEX idx_dropdown_options_group_id ON dropdown_options(group_id);
CREATE INDEX idx_dropdown_options_sort_order ON dropdown_options(sort_order);
CREATE INDEX idx_dropdown_options_is_active ON dropdown_options(is_active);

-- Dropdown options RLS policies
ALTER TABLE dropdown_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to dropdown options" ON dropdown_options 
  FOR SELECT USING (true);

CREATE POLICY "Users can manage options for their groups" ON dropdown_options 
  FOR ALL USING (
    EXISTS(SELECT 1 FROM dropdown_groups WHERE id = group_id AND created_by = auth.uid()) OR
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- STEP 8: Create Field Definitions Table
-- ============================================

CREATE TABLE field_definitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'dropdown')),
  
  -- Scope definition (flexible inheritance)
  scope_type TEXT NOT NULL CHECK (scope_type IN ('global', 'category', 'type')),
  scope_id UUID,
  
  -- Field properties
  is_required BOOLEAN DEFAULT false,
  default_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  -- Dropdown configuration
  dropdown_group_id UUID REFERENCES dropdown_groups(id),
  
  -- Validation rules
  validation_rules JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(name, scope_type, scope_id),
  CHECK (
    (scope_type = 'global' AND scope_id IS NULL) OR
    (scope_type IN ('category', 'type') AND scope_id IS NOT NULL)
  ),
  CHECK (
    (field_type = 'dropdown' AND dropdown_group_id IS NOT NULL) OR
    (field_type != 'dropdown' AND dropdown_group_id IS NULL)
  )
);

-- Field definitions indexes
CREATE INDEX idx_field_definitions_scope ON field_definitions(scope_type, scope_id);
CREATE INDEX idx_field_definitions_display_order ON field_definitions(display_order);
CREATE INDEX idx_field_definitions_field_type ON field_definitions(field_type);
CREATE INDEX idx_field_definitions_created_by ON field_definitions(created_by);
CREATE INDEX idx_field_definitions_dropdown_group ON field_definitions(dropdown_group_id);

-- Field definitions RLS policies
ALTER TABLE field_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to field definitions" ON field_definitions 
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create field definitions" ON field_definitions 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own definitions or admins can update all" ON field_definitions 
  FOR UPDATE USING (
    created_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can delete own definitions or admins can delete all" ON field_definitions 
  FOR DELETE USING (
    created_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Field definitions updated_at trigger
CREATE TRIGGER handle_field_definitions_updated_at 
  BEFORE UPDATE ON field_definitions 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- STEP 9: Create Items Table
-- ============================================

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

-- Items case-insensitive unique name constraint
CREATE UNIQUE INDEX items_name_unique ON items (LOWER(name));

-- Items table indexes
CREATE INDEX idx_items_category_type ON items(category_id, type_id);
CREATE INDEX idx_items_tier ON items(tier_id);
CREATE INDEX idx_items_created_by ON items(created_by);
CREATE INDEX idx_items_is_global ON items(is_global);
CREATE INDEX idx_items_field_values_gin ON items USING GIN(field_values);
CREATE INDEX idx_items_name_lower ON items(LOWER(name));

-- Items RLS policies
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

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

-- Items updated_at trigger
CREATE TRIGGER handle_items_updated_at 
  BEFORE UPDATE ON items 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- STEP 10: Create Schematics Table
-- ============================================

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

-- Schematics case-insensitive unique name constraint
CREATE UNIQUE INDEX schematics_name_unique ON schematics (LOWER(name));

-- Schematics table indexes
CREATE INDEX idx_schematics_category_type ON schematics(category_id, type_id);
CREATE INDEX idx_schematics_tier ON schematics(tier_id);
CREATE INDEX idx_schematics_created_by ON schematics(created_by);
CREATE INDEX idx_schematics_is_global ON schematics(is_global);
CREATE INDEX idx_schematics_field_values_gin ON schematics USING GIN(field_values);
CREATE INDEX idx_schematics_name_lower ON schematics(LOWER(name));

-- Schematics RLS policies
ALTER TABLE schematics ENABLE ROW LEVEL SECURITY;

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

-- Schematics updated_at trigger
CREATE TRIGGER handle_schematics_updated_at 
  BEFORE UPDATE ON schematics 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- STEP 11: Create Screenshot Tables
-- ============================================

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

-- Screenshot table indexes
CREATE INDEX idx_item_screenshots_item_id ON item_screenshots(item_id);
CREATE INDEX idx_item_screenshots_uploaded_by ON item_screenshots(uploaded_by);
CREATE INDEX idx_item_screenshots_sort_order ON item_screenshots(sort_order);

CREATE INDEX idx_schematic_screenshots_schematic_id ON schematic_screenshots(schematic_id);
CREATE INDEX idx_schematic_screenshots_uploaded_by ON schematic_screenshots(uploaded_by);
CREATE INDEX idx_schematic_screenshots_sort_order ON schematic_screenshots(sort_order);

-- Screenshot RLS policies
ALTER TABLE item_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE schematic_screenshots ENABLE ROW LEVEL SECURITY;

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

-- ============================================
-- STEP 12: Create Validation Functions
-- ============================================

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

-- Create validation triggers
CREATE TRIGGER validate_item_hierarchy_trigger
  BEFORE INSERT OR UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION validate_item_hierarchy();

CREATE TRIGGER validate_schematic_hierarchy_trigger
  BEFORE INSERT OR UPDATE ON schematics
  FOR EACH ROW
  EXECUTE FUNCTION validate_schematic_hierarchy();

-- ============================================
-- STEP 13: Create Inheritance Resolution Function
-- ============================================

CREATE OR REPLACE FUNCTION resolve_inherited_fields(
  p_category_id UUID DEFAULT NULL,
  p_type_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  display_name TEXT,
  field_type TEXT,
  scope_type TEXT,
  scope_id UUID,
  is_required BOOLEAN,
  default_visible BOOLEAN,
  display_order INTEGER,
  dropdown_group_id UUID,
  validation_rules JSONB,
  inheritance_level INTEGER
) AS $$
BEGIN
  RETURN QUERY
  -- Global fields (inheritance level 1)
  SELECT 
    fd.id,
    fd.name,
    fd.display_name,
    fd.field_type,
    fd.scope_type,
    fd.scope_id,
    fd.is_required,
    fd.default_visible,
    fd.display_order,
    fd.dropdown_group_id,
    fd.validation_rules,
    1 as inheritance_level
  FROM field_definitions fd
  WHERE fd.scope_type = 'global'
  
  UNION ALL
  
  -- Category fields (inheritance level 2) if category_id provided
  SELECT 
    fd.id,
    fd.name,
    fd.display_name,
    fd.field_type,
    fd.scope_type,
    fd.scope_id,
    fd.is_required,
    fd.default_visible,
    fd.display_order,
    fd.dropdown_group_id,
    fd.validation_rules,
    2 as inheritance_level
  FROM field_definitions fd
  WHERE fd.scope_type = 'category' 
    AND fd.scope_id = p_category_id
    AND p_category_id IS NOT NULL
  
  UNION ALL
  
  -- Type fields (inheritance level 3) if type_id provided
  SELECT 
    fd.id,
    fd.name,
    fd.display_name,
    fd.field_type,
    fd.scope_type,
    fd.scope_id,
    fd.is_required,
    fd.default_visible,
    fd.display_order,
    fd.dropdown_group_id,
    fd.validation_rules,
    3 as inheritance_level
  FROM field_definitions fd
  WHERE fd.scope_type = 'type' 
    AND fd.scope_id = p_type_id
    AND p_type_id IS NOT NULL
  
  ORDER BY inheritance_level, display_order, name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 14: Insert Your Custom Tiers Data
-- ============================================

INSERT INTO tiers (name, level, color, description) VALUES
('Makeshift', 1, '#9b7f6f', 'Makeshift tier'),
('Copper', 2, '#F59E0B', 'Copper tier'),
('Iron', 3, '#525456', 'Iron tier'),
('Steel', 4, '#374151', 'Steel tier'),
('Aluminum', 5, '#67a3b9', 'Aluminum tier'),
('Duraluminum', 6, '#8baf1e', 'Duraluminum tier'),
('Plastanium', 7, '#69465e', 'Plastanium tier');

-- ============================================
-- STEP 15: Insert Your Custom Categories Data
-- ============================================

INSERT INTO categories (name, icon, applies_to, description, is_global) VALUES
('Weapon', '⚔️', ARRAY['items'], 'Weapons and combat equipment', true),
('Ammunition', '⚔️', ARRAY['items'], 'Ammunition for weapons', true),
('Garment', '🛡️', ARRAY['items'], 'Protective armor and gear', true),
('Utility', '🔧', ARRAY['items'], 'Utility tools and equipment', true),
('Fuel', '⚒️', ARRAY['items'], 'Fuel', true),
('Component', '⚒️', ARRAY['items'], 'Crafting components', true),
('Refined Resource', '⚒️', ARRAY['items'], 'Refined Resources', true),
('Raw Resource', '⛏️', ARRAY['items'], 'Raw materials', true),
('Consumable', '🧪', ARRAY['items'], 'Consumable items and supplies', true),
('Schematic', '⚙️', ARRAY['schematics'], 'Unique Schematics', true);

-- ============================================
-- STEP 16: Insert Sample Types for Weapons
-- ============================================

WITH weapon_category AS (
  SELECT id FROM categories WHERE name = 'Weapon' AND is_global = true
)
INSERT INTO types (name, category_id, description, is_global)
SELECT 
  type_name,
  weapon_category.id,
  type_description,
  true
FROM weapon_category,
(VALUES 
  ('Sidearms', 'Personal defense weapons and pistols'),
  ('Rifles', 'Long-range weapons and assault rifles'),
  ('Melee', 'Close combat weapons and blades'),
  ('Heavy', 'Heavy weapons and artillery')
) AS type_data(type_name, type_description);

-- ============================================
-- STEP 17: Insert Sample Dropdown Groups
-- ============================================

INSERT INTO dropdown_groups (name, description) VALUES
('Rarity Levels', 'Item rarity classifications'),
('Damage Types', 'Types of damage weapons can inflict');

-- Insert rarity level options
WITH rarity_group AS (
  SELECT id FROM dropdown_groups WHERE name = 'Rarity Levels'
)
INSERT INTO dropdown_options (group_id, value, display_text, sort_order)
SELECT 
  rarity_group.id,
  option_value,
  option_display,
  option_order
FROM rarity_group,
(VALUES 
  ('common', 'Common', 1),
  ('uncommon', 'Uncommon', 2),
  ('rare', 'Rare', 3),
  ('epic', 'Epic', 4),
  ('legendary', 'Legendary', 5)
) AS options(option_value, option_display, option_order);

-- ============================================
-- STEP 18: Insert Global Field Definitions
-- ============================================

INSERT INTO field_definitions (name, display_name, field_type, scope_type, is_required, default_visible, display_order) VALUES
('description', 'Description', 'text', 'global', false, true, 1),
('notes', 'Notes', 'text', 'global', false, false, 2),
('weight', 'Weight', 'number', 'global', false, true, 3),
('value', 'Value', 'number', 'global', false, true, 4);

-- Insert rarity field with dropdown
WITH rarity_group AS (
  SELECT id FROM dropdown_groups WHERE name = 'Rarity Levels'
)
INSERT INTO field_definitions (name, display_name, field_type, scope_type, dropdown_group_id, is_required, default_visible, display_order)
SELECT 'rarity', 'Rarity', 'dropdown', 'global', rarity_group.id, false, true, 5
FROM rarity_group;

-- ============================================
-- STEP 19: Insert Sample Items and Schematics
-- ============================================

-- Insert a sample weapon item
WITH weapon_category AS (
  SELECT id FROM categories WHERE name = 'Weapon' AND is_global = true
), sidearms_type AS (
  SELECT t.id FROM types t
  JOIN categories c ON t.category_id = c.id
  WHERE t.name = 'Sidearms' AND c.name = 'Weapon' AND t.is_global = true
), makeshift_tier AS (
  SELECT id FROM tiers WHERE name = 'Makeshift'
)
INSERT INTO items (name, description, category_id, type_id, tier_id, field_values, is_global)
SELECT 
  'Makeshift Pistol',
  'A crude but functional sidearm crafted from scavenged materials',
  weapon_category.id,
  sidearms_type.id,
  makeshift_tier.id,
  '{"rarity": "common", "weight": 2.5, "value": 45}',
  true
FROM weapon_category, sidearms_type, makeshift_tier;

-- Insert a sample schematic
WITH schematic_category AS (
  SELECT id FROM categories WHERE name = 'Schematic' AND is_global = true
), copper_tier AS (
  SELECT id FROM tiers WHERE name = 'Copper'
)
INSERT INTO schematics (name, description, category_id, tier_id, field_values, is_global)
SELECT 
  'Copper Sword Blueprint',
  'Schematic for crafting a basic copper sword',
  schematic_category.id,
  copper_tier.id,
  '{"rarity": "common", "required_materials": "Copper Ingot x3, Wood Handle x1"}',
  true
FROM schematic_category, copper_tier;

-- ============================================
-- STEP 20: Grant Permissions
-- ============================================

GRANT SELECT ON tiers TO authenticated;
GRANT INSERT ON tiers TO authenticated;
GRANT UPDATE ON tiers TO authenticated;
GRANT DELETE ON tiers TO authenticated;

GRANT SELECT ON categories TO authenticated;
GRANT INSERT ON categories TO authenticated;
GRANT UPDATE ON categories TO authenticated;
GRANT DELETE ON categories TO authenticated;

GRANT SELECT ON types TO authenticated;
GRANT INSERT ON types TO authenticated;
GRANT UPDATE ON types TO authenticated;
GRANT DELETE ON types TO authenticated;

GRANT SELECT ON subtypes TO authenticated;
GRANT INSERT ON subtypes TO authenticated;
GRANT UPDATE ON subtypes TO authenticated;
GRANT DELETE ON subtypes TO authenticated;

GRANT SELECT ON dropdown_groups TO authenticated;
GRANT INSERT ON dropdown_groups TO authenticated;
GRANT UPDATE ON dropdown_groups TO authenticated;
GRANT DELETE ON dropdown_groups TO authenticated;

GRANT SELECT ON dropdown_options TO authenticated;
GRANT INSERT ON dropdown_options TO authenticated;
GRANT UPDATE ON dropdown_options TO authenticated;
GRANT DELETE ON dropdown_options TO authenticated;

GRANT SELECT ON field_definitions TO authenticated;
GRANT INSERT ON field_definitions TO authenticated;
GRANT UPDATE ON field_definitions TO authenticated;
GRANT DELETE ON field_definitions TO authenticated;

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

-- Grant execute permission on the inheritance function
GRANT EXECUTE ON FUNCTION resolve_inherited_fields TO authenticated;

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================

-- Verify installation
SELECT 
  'Migration completed successfully!' as status,
  (SELECT COUNT(*) FROM tiers) as tiers_count,
  (SELECT COUNT(*) FROM categories) as categories_count,
  (SELECT COUNT(*) FROM items) as items_count,
  (SELECT COUNT(*) FROM schematics) as schematics_count; 
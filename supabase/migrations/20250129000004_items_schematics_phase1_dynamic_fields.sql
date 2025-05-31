-- Items & Schematics System - Phase 1: Core Infrastructure
-- Migration 4: Dynamic Field System
-- Purpose: Create flexible field definition system with inheritance
-- Estimated completion time: 6-8 hours

-- Step 1: Create dropdown groups table
CREATE TABLE dropdown_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create dropdown options table
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

-- Step 3: Create field definitions table
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

-- Step 4: Add table comments for documentation
COMMENT ON TABLE dropdown_groups IS 'Groups for organizing dropdown field options';
COMMENT ON COLUMN dropdown_groups.name IS 'Unique name for the dropdown group';
COMMENT ON COLUMN dropdown_groups.description IS 'Optional description of the dropdown group';

COMMENT ON TABLE dropdown_options IS 'Individual options within dropdown groups';
COMMENT ON COLUMN dropdown_options.group_id IS 'Reference to parent dropdown group';
COMMENT ON COLUMN dropdown_options.value IS 'Internal value stored in field_values';
COMMENT ON COLUMN dropdown_options.display_text IS 'User-facing text displayed in UI';
COMMENT ON COLUMN dropdown_options.sort_order IS 'Order for displaying options (lower = higher priority)';
COMMENT ON COLUMN dropdown_options.is_active IS 'Whether this option is currently available';

COMMENT ON TABLE field_definitions IS 'Flexible field definitions with inheritance (global → category → type)';
COMMENT ON COLUMN field_definitions.name IS 'Internal name for the field (e.g., "weapon_damage")';
COMMENT ON COLUMN field_definitions.display_name IS 'User-facing display name (e.g., "Weapon Damage")';
COMMENT ON COLUMN field_definitions.field_type IS 'Type of field: text, number, or dropdown';
COMMENT ON COLUMN field_definitions.scope_type IS 'Inheritance scope: global, category, or type';
COMMENT ON COLUMN field_definitions.scope_id IS 'ID of category or type (NULL for global)';
COMMENT ON COLUMN field_definitions.is_required IS 'Whether this field is mandatory';
COMMENT ON COLUMN field_definitions.default_visible IS 'Whether this field is visible by default';
COMMENT ON COLUMN field_definitions.display_order IS 'Order for displaying fields (lower = higher priority)';
COMMENT ON COLUMN field_definitions.validation_rules IS 'JSON object containing validation rules';

-- Step 5: Create indexes for performance
-- Dropdown groups indexes
CREATE INDEX idx_dropdown_groups_created_by ON dropdown_groups(created_by);
CREATE INDEX idx_dropdown_groups_name_lower ON dropdown_groups(LOWER(name));

-- Dropdown options indexes
CREATE INDEX idx_dropdown_options_group_id ON dropdown_options(group_id);
CREATE INDEX idx_dropdown_options_sort_order ON dropdown_options(sort_order);
CREATE INDEX idx_dropdown_options_is_active ON dropdown_options(is_active);

-- Field definitions indexes
CREATE INDEX idx_field_definitions_scope ON field_definitions(scope_type, scope_id);
CREATE INDEX idx_field_definitions_display_order ON field_definitions(display_order);
CREATE INDEX idx_field_definitions_field_type ON field_definitions(field_type);
CREATE INDEX idx_field_definitions_created_by ON field_definitions(created_by);
CREATE INDEX idx_field_definitions_dropdown_group ON field_definitions(dropdown_group_id);

-- Step 6: Enable Row Level Security
ALTER TABLE dropdown_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropdown_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_definitions ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for dropdown groups
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

-- Step 8: Create RLS policies for dropdown options
CREATE POLICY "Public read access to dropdown options" ON dropdown_options 
  FOR SELECT USING (true);

CREATE POLICY "Users can manage options for their groups" ON dropdown_options 
  FOR ALL USING (
    EXISTS(SELECT 1 FROM dropdown_groups WHERE id = group_id AND created_by = auth.uid()) OR
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Step 9: Create RLS policies for field definitions
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

-- Step 10: Create triggers for updated_at timestamp
CREATE TRIGGER handle_dropdown_groups_updated_at 
  BEFORE UPDATE ON dropdown_groups 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_field_definitions_updated_at 
  BEFORE UPDATE ON field_definitions 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

-- Step 11: Create function for field inheritance resolution
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

-- Step 12: Insert initial dropdown groups and options
INSERT INTO dropdown_groups (name, description) VALUES
('Weapon Types', 'Classification of weapon types'),
('Rarity Levels', 'Item rarity classifications'),
('Material Types', 'Types of materials and substances'),
('Damage Types', 'Types of damage weapons can inflict');

-- Insert weapon type options
WITH weapon_types_group AS (
  SELECT id FROM dropdown_groups WHERE name = 'Weapon Types'
)
INSERT INTO dropdown_options (group_id, value, display_text, sort_order)
SELECT 
  weapon_types_group.id,
  option_value,
  option_display,
  option_order
FROM weapon_types_group,
(VALUES 
  ('sidearm', 'Sidearm', 1),
  ('rifle', 'Rifle', 2),
  ('melee', 'Melee', 3),
  ('heavy', 'Heavy Weapon', 4)
) AS options(option_value, option_display, option_order);

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

-- Step 13: Insert initial global field definitions
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

-- Step 14: Insert weapon-specific field definitions
WITH weapons_category AS (
  SELECT id FROM categories WHERE name = 'Weapons' AND is_global = true
)
INSERT INTO field_definitions (name, display_name, field_type, scope_type, scope_id, is_required, default_visible, display_order)
SELECT 
  field_name,
  field_display,
  field_type,
  'category',
  weapons_category.id,
  field_required,
  field_visible,
  field_order
FROM weapons_category,
(VALUES 
  ('damage', 'Damage', 'number', true, true, 10),
  ('range', 'Range', 'number', false, true, 11),
  ('accuracy', 'Accuracy', 'number', false, true, 12),
  ('durability', 'Durability', 'number', false, true, 13)
) AS field_data(field_name, field_display, field_type, field_required, field_visible, field_order);

-- Step 15: Grant necessary permissions
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

-- Grant execute permission on the inheritance function
GRANT EXECUTE ON FUNCTION resolve_inherited_fields TO authenticated; 
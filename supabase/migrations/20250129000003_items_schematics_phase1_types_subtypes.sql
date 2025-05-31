-- Items & Schematics System - Phase 1: Core Infrastructure
-- Migration 3: Types and SubTypes Tables
-- Purpose: Create hierarchical organization within categories
-- Estimated completion time: 3-4 hours

-- Step 1: Create types table
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

-- Step 2: Create subtypes table
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

-- Step 3: Add table comments for documentation
COMMENT ON TABLE types IS 'Types within categories for finer organization (e.g., Sidearms within Weapons)';
COMMENT ON COLUMN types.name IS 'Display name for the type';
COMMENT ON COLUMN types.category_id IS 'Reference to parent category';
COMMENT ON COLUMN types.description IS 'Optional description of the type';
COMMENT ON COLUMN types.is_global IS 'Whether this type is available to all users or just the creator';

COMMENT ON TABLE subtypes IS 'SubTypes within types for finest level organization';
COMMENT ON COLUMN subtypes.name IS 'Display name for the subtype';
COMMENT ON COLUMN subtypes.type_id IS 'Reference to parent type';
COMMENT ON COLUMN subtypes.description IS 'Optional description of the subtype';
COMMENT ON COLUMN subtypes.is_global IS 'Whether this subtype is available to all users or just the creator';

-- Step 4: Create indexes for performance
-- Types indexes
CREATE INDEX idx_types_category_id ON types(category_id);
CREATE INDEX idx_types_created_by ON types(created_by);
CREATE INDEX idx_types_is_global ON types(is_global);
CREATE INDEX idx_types_name_lower ON types(LOWER(name));

-- SubTypes indexes
CREATE INDEX idx_subtypes_type_id ON subtypes(type_id);
CREATE INDEX idx_subtypes_created_by ON subtypes(created_by);
CREATE INDEX idx_subtypes_is_global ON subtypes(is_global);
CREATE INDEX idx_subtypes_name_lower ON subtypes(LOWER(name));

-- Step 5: Enable Row Level Security
ALTER TABLE types ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtypes ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for types
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

-- Step 7: Create RLS policies for subtypes
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

-- Step 8: Create triggers for updated_at timestamp
CREATE TRIGGER handle_types_updated_at 
  BEFORE UPDATE ON types 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_subtypes_updated_at 
  BEFORE UPDATE ON subtypes 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

-- Step 9: Insert initial type data for weapons category
WITH weapons_category AS (
  SELECT id FROM categories WHERE name = 'Weapons' AND is_global = true
)
INSERT INTO types (name, category_id, description, is_global)
SELECT 
  type_name,
  weapons_category.id,
  type_description,
  true
FROM weapons_category,
(VALUES 
  ('Sidearms', 'Personal defense weapons and pistols'),
  ('Rifles', 'Long-range weapons and assault rifles'),
  ('Melee', 'Close combat weapons and blades'),
  ('Heavy', 'Heavy weapons and artillery')
) AS type_data(type_name, type_description);

-- Step 10: Insert initial type data for armor category
WITH armor_category AS (
  SELECT id FROM categories WHERE name = 'Armor' AND is_global = true
)
INSERT INTO types (name, category_id, description, is_global)
SELECT 
  type_name,
  armor_category.id,
  type_description,
  true
FROM armor_category,
(VALUES 
  ('Light', 'Light armor for mobility and stealth'),
  ('Medium', 'Balanced armor for general protection'),
  ('Heavy', 'Heavy armor for maximum protection'),
  ('Accessories', 'Armor accessories and modifications')
) AS type_data(type_name, type_description);

-- Step 11: Insert initial type data for tools category
WITH tools_category AS (
  SELECT id FROM categories WHERE name = 'Tools' AND is_global = true
)
INSERT INTO types (name, category_id, description, is_global)
SELECT 
  type_name,
  tools_category.id,
  type_description,
  true
FROM tools_category,
(VALUES 
  ('Harvesting', 'Tools for gathering resources'),
  ('Construction', 'Building and construction tools'),
  ('Repair', 'Maintenance and repair equipment'),
  ('Utility', 'General utility and survival tools')
) AS type_data(type_name, type_description);

-- Step 12: Insert initial type data for resources category
WITH resources_category AS (
  SELECT id FROM categories WHERE name = 'Resources' AND is_global = true
)
INSERT INTO types (name, category_id, description, is_global)
SELECT 
  type_name,
  resources_category.id,
  type_description,
  true
FROM resources_category,
(VALUES 
  ('Metals', 'Metal ores and refined materials'),
  ('Organic', 'Organic materials and components'),
  ('Rare', 'Rare and exotic materials'),
  ('Components', 'Crafted components and parts')
) AS type_data(type_name, type_description);

-- Step 13: Insert sample subtype data for sidearms
WITH sidearms_type AS (
  SELECT t.id 
  FROM types t
  JOIN categories c ON t.category_id = c.id
  WHERE t.name = 'Sidearms' AND c.name = 'Weapons' AND t.is_global = true
)
INSERT INTO subtypes (name, type_id, description, is_global)
SELECT 
  subtype_name,
  sidearms_type.id,
  subtype_description,
  true
FROM sidearms_type,
(VALUES 
  ('Pistols', 'Standard pistols and handguns'),
  ('SMGs', 'Submachine guns and automatic pistols'),
  ('Energy', 'Energy-based sidearms')
) AS subtype_data(subtype_name, subtype_description);

-- Step 14: Grant necessary permissions
GRANT SELECT ON types TO authenticated;
GRANT INSERT ON types TO authenticated;
GRANT UPDATE ON types TO authenticated;
GRANT DELETE ON types TO authenticated;

GRANT SELECT ON subtypes TO authenticated;
GRANT INSERT ON subtypes TO authenticated;
GRANT UPDATE ON subtypes TO authenticated;
GRANT DELETE ON subtypes TO authenticated; 
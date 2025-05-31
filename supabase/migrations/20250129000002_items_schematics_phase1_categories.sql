-- Items & Schematics System - Phase 1: Core Infrastructure
-- Migration 2: Categories Table
-- Purpose: Create shared categories for both items and schematics
-- Estimated completion time: 2-3 hours

-- Step 1: Create categories table
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

-- Step 2: Add unique constraint for name within applies_to scope
-- Note: PostgreSQL doesn't support multi-dimensional unique constraints with arrays directly
-- We'll implement this via triggers or application-level validation
CREATE UNIQUE INDEX idx_categories_name_global ON categories (LOWER(name)) WHERE is_global = true;

-- Step 3: Add table comments for documentation
COMMENT ON TABLE categories IS 'Shared categories for organizing items and schematics (e.g., Weapons, Armor, Tools)';
COMMENT ON COLUMN categories.name IS 'Display name for the category';
COMMENT ON COLUMN categories.icon IS 'Icon identifier or URL for visual representation';
COMMENT ON COLUMN categories.applies_to IS 'Array indicating whether category applies to items, schematics, or both';
COMMENT ON COLUMN categories.description IS 'Optional description of the category';
COMMENT ON COLUMN categories.is_global IS 'Whether this category is available to all users or just the creator';

-- Step 4: Create indexes for performance
CREATE INDEX idx_categories_created_by ON categories(created_by);
CREATE INDEX idx_categories_applies_to ON categories USING GIN(applies_to);
CREATE INDEX idx_categories_is_global ON categories(is_global);
CREATE INDEX idx_categories_name_lower ON categories(LOWER(name));

-- Step 5: Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
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

-- Step 7: Create trigger for updated_at timestamp
CREATE TRIGGER handle_categories_updated_at 
  BEFORE UPDATE ON categories 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

-- Step 8: Create function to validate category name uniqueness within applies_to scope
CREATE OR REPLACE FUNCTION validate_category_name_uniqueness()
RETURNS TRIGGER AS $$
DECLARE
  existing_count INTEGER;
BEGIN
  -- Check for name conflicts within the same applies_to scope
  SELECT COUNT(*) INTO existing_count
  FROM categories 
  WHERE LOWER(name) = LOWER(NEW.name)
    AND applies_to && NEW.applies_to  -- Arrays overlap
    AND id != COALESCE(NEW.id, gen_random_uuid())  -- Exclude self for updates
    AND is_global = NEW.is_global;  -- Same global scope
  
  IF existing_count > 0 THEN
    RAISE EXCEPTION 'Category name "%" already exists in this scope', NEW.name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create trigger for name validation
CREATE TRIGGER validate_category_name_before_insert_or_update
  BEFORE INSERT OR UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION validate_category_name_uniqueness();

-- Step 10: Insert initial category data
INSERT INTO categories (name, icon, applies_to, description, is_global) VALUES
('Weapons', '⚔️', ARRAY['items'], 'Weapons and combat equipment', true),
('Armor', '🛡️', ARRAY['items'], 'Protective armor and gear', true),
('Tools', '🔧', ARRAY['items'], 'Utility tools and equipment', true),
('Resources', '⛏️', ARRAY['items'], 'Raw materials and crafting components', true),
('Consumables', '🧪', ARRAY['items'], 'Consumable items and supplies', true),
('Blueprints', '📋', ARRAY['schematics'], 'Construction and building blueprints', true),
('Crafting', '⚒️', ARRAY['schematics'], 'Item crafting recipes and schematics', true),
('Equipment', '⚙️', ARRAY['schematics'], 'Equipment upgrade and modification schematics', true);

-- Step 11: Grant necessary permissions
GRANT SELECT ON categories TO authenticated;
GRANT INSERT ON categories TO authenticated;
GRANT UPDATE ON categories TO authenticated;
GRANT DELETE ON categories TO authenticated; 
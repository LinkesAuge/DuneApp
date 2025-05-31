-- ============================================
-- POI-Items Integration System Migration
-- ============================================
-- This migration creates the database tables and relationships needed for 
-- the Default Assignment Manager and POI-Items/Schematics integration system.

-- ============================================
-- STEP 1: Create POI-Items Association Table
-- ============================================

CREATE TABLE poi_items (
  poi_id UUID NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  notes TEXT,
  assignment_source TEXT NOT NULL CHECK (assignment_source IN ('default', 'manual')),
  assigned_by_rule_id UUID, -- Will reference poi_type_default_items(id) after that table is created
  added_by UUID REFERENCES profiles(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (poi_id, item_id)
);

-- Create indexes for performance
CREATE INDEX idx_poi_items_poi_id ON poi_items(poi_id);
CREATE INDEX idx_poi_items_item_id ON poi_items(item_id);
CREATE INDEX idx_poi_items_assignment_source ON poi_items(assignment_source);
CREATE INDEX idx_poi_items_assigned_by_rule_id ON poi_items(assigned_by_rule_id);
CREATE INDEX idx_poi_items_added_by ON poi_items(added_by);

-- ============================================
-- STEP 2: Create POI-Schematics Association Table
-- ============================================

CREATE TABLE poi_schematics (
  poi_id UUID NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
  schematic_id UUID NOT NULL REFERENCES schematics(id) ON DELETE CASCADE,
  notes TEXT,
  assignment_source TEXT NOT NULL CHECK (assignment_source IN ('default', 'manual')),
  assigned_by_rule_id UUID, -- Will reference poi_type_default_schematics(id) after that table is created
  added_by UUID REFERENCES profiles(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (poi_id, schematic_id)
);

-- Create indexes for performance
CREATE INDEX idx_poi_schematics_poi_id ON poi_schematics(poi_id);
CREATE INDEX idx_poi_schematics_schematic_id ON poi_schematics(schematic_id);
CREATE INDEX idx_poi_schematics_assignment_source ON poi_schematics(assignment_source);
CREATE INDEX idx_poi_schematics_assigned_by_rule_id ON poi_schematics(assigned_by_rule_id);
CREATE INDEX idx_poi_schematics_added_by ON poi_schematics(added_by);

-- ============================================
-- STEP 3: Create Default Assignment Rules for Items
-- ============================================

CREATE TABLE poi_type_default_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poi_type_id UUID NOT NULL REFERENCES poi_types(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  default_quantity INTEGER DEFAULT 1 CHECK (default_quantity > 0),
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true, -- For rule versioning
  created_by UUID REFERENCES profiles(id),
  
  -- Only one active rule per POI type + item combination
  UNIQUE(poi_type_id, item_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Create indexes for performance
CREATE INDEX idx_poi_type_default_items_poi_type_id ON poi_type_default_items(poi_type_id);
CREATE INDEX idx_poi_type_default_items_item_id ON poi_type_default_items(item_id);
CREATE INDEX idx_poi_type_default_items_is_active ON poi_type_default_items(is_active);
CREATE INDEX idx_poi_type_default_items_created_by ON poi_type_default_items(created_by);

-- ============================================
-- STEP 4: Create Default Assignment Rules for Schematics
-- ============================================

CREATE TABLE poi_type_default_schematics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poi_type_id UUID NOT NULL REFERENCES poi_types(id) ON DELETE CASCADE,
  schematic_id UUID NOT NULL REFERENCES schematics(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true, -- For rule versioning
  created_by UUID REFERENCES profiles(id),
  
  -- Only one active rule per POI type + schematic combination
  UNIQUE(poi_type_id, schematic_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Create indexes for performance
CREATE INDEX idx_poi_type_default_schematics_poi_type_id ON poi_type_default_schematics(poi_type_id);
CREATE INDEX idx_poi_type_default_schematics_schematic_id ON poi_type_default_schematics(schematic_id);
CREATE INDEX idx_poi_type_default_schematics_is_active ON poi_type_default_schematics(is_active);
CREATE INDEX idx_poi_type_default_schematics_created_by ON poi_type_default_schematics(created_by);

-- ============================================
-- STEP 5: Add Foreign Key Constraints After All Tables Exist
-- ============================================

-- Add foreign key constraint from poi_items to poi_type_default_items
ALTER TABLE poi_items 
ADD CONSTRAINT fk_poi_items_assigned_by_rule 
FOREIGN KEY (assigned_by_rule_id) REFERENCES poi_type_default_items(id) ON DELETE SET NULL;

-- Add foreign key constraint from poi_schematics to poi_type_default_schematics  
ALTER TABLE poi_schematics 
ADD CONSTRAINT fk_poi_schematics_assigned_by_rule 
FOREIGN KEY (assigned_by_rule_id) REFERENCES poi_type_default_schematics(id) ON DELETE SET NULL;

-- ============================================
-- STEP 6: Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE poi_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE poi_schematics ENABLE ROW LEVEL SECURITY;
ALTER TABLE poi_type_default_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE poi_type_default_schematics ENABLE ROW LEVEL SECURITY;

-- poi_items policies
CREATE POLICY "POI items are viewable by everyone" ON poi_items
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add items to POIs" ON poi_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update items they added or POI owners can update" ON poi_items
  FOR UPDATE USING (
    added_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM pois WHERE id = poi_id AND created_by = auth.uid()) OR
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Users can delete items they added or POI owners can delete" ON poi_items
  FOR DELETE USING (
    added_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM pois WHERE id = poi_id AND created_by = auth.uid()) OR
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- poi_schematics policies
CREATE POLICY "POI schematics are viewable by everyone" ON poi_schematics
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add schematics to POIs" ON poi_schematics
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update schematics they added or POI owners can update" ON poi_schematics
  FOR UPDATE USING (
    added_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM pois WHERE id = poi_id AND created_by = auth.uid()) OR
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Users can delete schematics they added or POI owners can delete" ON poi_schematics
  FOR DELETE USING (
    added_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM pois WHERE id = poi_id AND created_by = auth.uid()) OR
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- poi_type_default_items policies
CREATE POLICY "Default item rules are viewable by everyone" ON poi_type_default_items
  FOR SELECT USING (true);

CREATE POLICY "Admins and editors can manage default item rules" ON poi_type_default_items
  FOR ALL USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- poi_type_default_schematics policies
CREATE POLICY "Default schematic rules are viewable by everyone" ON poi_type_default_schematics
  FOR SELECT USING (true);

CREATE POLICY "Admins and editors can manage default schematic rules" ON poi_type_default_schematics
  FOR ALL USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- ============================================
-- STEP 7: Create Helper Functions
-- ============================================

-- Function to apply default assignments when a new POI is created
CREATE OR REPLACE FUNCTION apply_default_assignments_to_poi()
RETURNS TRIGGER AS $$
BEGIN
  -- Apply default items
  INSERT INTO poi_items (poi_id, item_id, quantity, assignment_source, assigned_by_rule_id, added_by)
  SELECT 
    NEW.id,
    ptdi.item_id,
    ptdi.default_quantity,
    'default',
    ptdi.id,
    NEW.created_by
  FROM poi_type_default_items ptdi
  WHERE ptdi.poi_type_id = NEW.poi_type_id 
    AND ptdi.is_active = true;

  -- Apply default schematics
  INSERT INTO poi_schematics (poi_id, schematic_id, assignment_source, assigned_by_rule_id, added_by)
  SELECT 
    NEW.id,
    ptds.schematic_id,
    'default',
    ptds.id,
    NEW.created_by
  FROM poi_type_default_schematics ptds
  WHERE ptds.poi_type_id = NEW.poi_type_id 
    AND ptds.is_active = true;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically apply default assignments
CREATE TRIGGER trigger_apply_default_assignments
  AFTER INSERT ON pois
  FOR EACH ROW
  EXECUTE FUNCTION apply_default_assignments_to_poi();

-- ============================================
-- STEP 8: Add Comments for Documentation
-- ============================================

COMMENT ON TABLE poi_items IS 'Many-to-many relationship between POIs and items with quantity and assignment tracking';
COMMENT ON TABLE poi_schematics IS 'Many-to-many relationship between POIs and schematics with assignment tracking';
COMMENT ON TABLE poi_type_default_items IS 'Default item assignment rules for POI types';
COMMENT ON TABLE poi_type_default_schematics IS 'Default schematic assignment rules for POI types';

COMMENT ON COLUMN poi_items.assignment_source IS 'Tracks whether the assignment came from default rules or manual addition';
COMMENT ON COLUMN poi_items.assigned_by_rule_id IS 'Reference to the default rule that created this assignment (if applicable)';
COMMENT ON COLUMN poi_schematics.assignment_source IS 'Tracks whether the assignment came from default rules or manual addition';
COMMENT ON COLUMN poi_schematics.assigned_by_rule_id IS 'Reference to the default rule that created this assignment (if applicable)';

COMMENT ON COLUMN poi_type_default_items.is_active IS 'Allows for rule versioning - only one active rule per POI type + item combination';
COMMENT ON COLUMN poi_type_default_schematics.is_active IS 'Allows for rule versioning - only one active rule per POI type + schematic combination';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Summary of what was created:
-- 1. poi_items table: POI-Item associations with quantities and assignment tracking
-- 2. poi_schematics table: POI-Schematic associations with assignment tracking
-- 3. poi_type_default_items table: Default item assignment rules for POI types
-- 4. poi_type_default_schematics table: Default schematic assignment rules for POI types
-- 5. Proper foreign key relationships between all tables
-- 6. Comprehensive RLS policies for security
-- 7. Automatic trigger to apply default assignments to new POIs
-- 8. Performance indexes on all relevant columns 
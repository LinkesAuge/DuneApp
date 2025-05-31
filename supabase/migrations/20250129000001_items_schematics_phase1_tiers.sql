-- Items & Schematics System - Phase 1: Core Infrastructure
-- Migration 1: Tier System Table
-- Purpose: Create the tech level system (Makeshift, Copper, Iron, Steel, etc.)
-- Estimated completion time: 2-3 hours

-- Step 1: Create tiers table
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

-- Step 2: Add table comments for documentation
COMMENT ON TABLE tiers IS 'Tech level system for items and schematics (Makeshift, Copper, Iron, Steel, etc.)';
COMMENT ON COLUMN tiers.name IS 'Display name for the tier (e.g., "Makeshift", "Copper")';
COMMENT ON COLUMN tiers.level IS 'Numeric level for ordering (1=lowest, higher numbers=higher tiers)';
COMMENT ON COLUMN tiers.color IS 'Hex color code for UI display';
COMMENT ON COLUMN tiers.description IS 'Optional description of the tier';

-- Step 3: Create indexes for performance
CREATE INDEX idx_tiers_level ON tiers(level);
CREATE INDEX idx_tiers_created_by ON tiers(created_by);
CREATE INDEX idx_tiers_name_lower ON tiers(LOWER(name));

-- Step 4: Enable Row Level Security
ALTER TABLE tiers ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
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

-- Step 6: Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_tiers_updated_at 
  BEFORE UPDATE ON tiers 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

-- Step 7: Insert initial tier data
INSERT INTO tiers (name, level, color, description) VALUES
('Makeshift', 1, '#8B5CF6', 'Basic crafted items using primitive materials'),
('Copper', 2, '#F59E0B', 'Copper-tier equipment and components'),
('Iron', 3, '#6B7280', 'Iron-tier equipment with improved durability'),
('Steel', 4, '#374151', 'Steel-tier equipment with superior strength'),
('Alloy', 5, '#1E40AF', 'Advanced alloy items with specialized properties');

-- Step 8: Grant necessary permissions
GRANT SELECT ON tiers TO authenticated;
GRANT INSERT ON tiers TO authenticated;
GRANT UPDATE ON tiers TO authenticated;
GRANT DELETE ON tiers TO authenticated; 
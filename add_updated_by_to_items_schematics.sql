-- Add updated_by columns to items and schematics tables
-- This migration adds audit trail tracking for who last updated items and schematics

-- Add updated_by column to items table
ALTER TABLE items 
ADD COLUMN updated_by UUID REFERENCES profiles(id);

-- Add updated_by column to schematics table  
ALTER TABLE schematics 
ADD COLUMN updated_by UUID REFERENCES profiles(id);

-- Create indexes for better query performance
CREATE INDEX idx_items_updated_by ON items(updated_by);
CREATE INDEX idx_schematics_updated_by ON schematics(updated_by);

-- Set initial updated_by values to created_by for existing records
UPDATE items SET updated_by = created_by WHERE updated_by IS NULL;
UPDATE schematics SET updated_by = created_by WHERE updated_by IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN items.updated_by IS 'User who last updated this item';
COMMENT ON COLUMN schematics.updated_by IS 'User who last updated this schematic'; 
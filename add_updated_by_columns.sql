-- Migration: Add updated_by columns to Categories, Types, and SubTypes tables
-- This tracks who last modified each entity for better audit trails

BEGIN;

-- Add updated_by column to categories table
ALTER TABLE categories 
ADD COLUMN updated_by UUID REFERENCES profiles(id);

-- Add updated_by column to types table
ALTER TABLE types 
ADD COLUMN updated_by UUID REFERENCES profiles(id);

-- Add updated_by column to subtypes table
ALTER TABLE subtypes 
ADD COLUMN updated_by UUID REFERENCES profiles(id);

-- Create indexes for the new columns for better query performance
CREATE INDEX idx_categories_updated_by ON categories(updated_by);
CREATE INDEX idx_types_updated_by ON types(updated_by);
CREATE INDEX idx_subtypes_updated_by ON subtypes(updated_by);

-- Initialize updated_by to created_by for existing records
UPDATE categories 
SET updated_by = created_by 
WHERE updated_by IS NULL;

UPDATE types 
SET updated_by = created_by 
WHERE updated_by IS NULL;

UPDATE subtypes 
SET updated_by = created_by 
WHERE updated_by IS NULL;

COMMIT;

-- SQL completed successfully 
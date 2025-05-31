-- Add source type and filter fields to dropdown_groups table
-- This enables dropdown groups to dynamically pull options from database entities
-- Uses conditional column additions to avoid errors if columns already exist

-- Add source_type column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dropdown_groups' AND column_name = 'source_type') THEN
        ALTER TABLE dropdown_groups ADD COLUMN source_type TEXT DEFAULT 'custom' CHECK (source_type IN ('custom', 'categories', 'types', 'tiers', 'items', 'schematics'));
    END IF;
END $$;

-- Add source_category_id column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dropdown_groups' AND column_name = 'source_category_id') THEN
        ALTER TABLE dropdown_groups ADD COLUMN source_category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add source_type_id column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dropdown_groups' AND column_name = 'source_type_id') THEN
        ALTER TABLE dropdown_groups ADD COLUMN source_type_id UUID REFERENCES types(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add source_tier_id column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dropdown_groups' AND column_name = 'source_tier_id') THEN
        ALTER TABLE dropdown_groups ADD COLUMN source_tier_id UUID REFERENCES tiers(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add applies_to column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dropdown_groups' AND column_name = 'applies_to') THEN
        ALTER TABLE dropdown_groups ADD COLUMN applies_to TEXT CHECK (applies_to IN ('items', 'schematics', 'both'));
    END IF;
END $$;

-- Add updated_by column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dropdown_groups' AND column_name = 'updated_by') THEN
        ALTER TABLE dropdown_groups ADD COLUMN updated_by UUID REFERENCES profiles(id);
    END IF;
END $$;

-- Add indexes for the new columns (only if they don't exist)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'dropdown_groups' AND indexname = 'idx_dropdown_groups_source_type') THEN
        CREATE INDEX idx_dropdown_groups_source_type ON dropdown_groups(source_type);
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'dropdown_groups' AND indexname = 'idx_dropdown_groups_source_category_id') THEN
        CREATE INDEX idx_dropdown_groups_source_category_id ON dropdown_groups(source_category_id);
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'dropdown_groups' AND indexname = 'idx_dropdown_groups_source_type_id') THEN
        CREATE INDEX idx_dropdown_groups_source_type_id ON dropdown_groups(source_type_id);
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'dropdown_groups' AND indexname = 'idx_dropdown_groups_source_tier_id') THEN
        CREATE INDEX idx_dropdown_groups_source_tier_id ON dropdown_groups(source_tier_id);
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'dropdown_groups' AND indexname = 'idx_dropdown_groups_updated_by') THEN
        CREATE INDEX idx_dropdown_groups_updated_by ON dropdown_groups(updated_by);
    END IF;
END $$;

-- Update existing groups to have default source_type = 'custom' (only if the column exists and has NULL values)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'dropdown_groups' AND column_name = 'source_type') THEN
        UPDATE dropdown_groups SET source_type = 'custom' WHERE source_type IS NULL;
    END IF;
END $$;

-- Add comments on the new columns (safe to run multiple times)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'dropdown_groups' AND column_name = 'source_type') THEN
        COMMENT ON COLUMN dropdown_groups.source_type IS 'How options are populated: custom (manual), categories, types, tiers, items, or schematics';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'dropdown_groups' AND column_name = 'source_category_id') THEN
        COMMENT ON COLUMN dropdown_groups.source_category_id IS 'Filter by category when source_type is types, items, or schematics';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'dropdown_groups' AND column_name = 'source_type_id') THEN
        COMMENT ON COLUMN dropdown_groups.source_type_id IS 'Filter by type when source_type is items or schematics';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'dropdown_groups' AND column_name = 'source_tier_id') THEN
        COMMENT ON COLUMN dropdown_groups.source_tier_id IS 'Filter by tier when source_type is items or schematics';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'dropdown_groups' AND column_name = 'applies_to') THEN
        COMMENT ON COLUMN dropdown_groups.applies_to IS 'Filter categories/types by what they apply to (items, schematics, both)';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'dropdown_groups' AND column_name = 'updated_by') THEN
        COMMENT ON COLUMN dropdown_groups.updated_by IS 'User who last updated this dropdown group';
    END IF;
END $$; 
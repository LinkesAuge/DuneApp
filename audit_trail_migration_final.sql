-- Complete Audit Trail Migration for Items & Schematics System
-- FINAL VERSION - No UNION statements, completely safe
-- This migration adds updated_by and updated_at columns to all tables missing them

-- Step 1: Check current column state
\echo 'Step 1: Checking current column state...'

\echo 'Tiers table columns:'
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tiers' 
  AND column_name IN ('created_by', 'updated_by', 'created_at', 'updated_at')
ORDER BY ordinal_position;

\echo 'Field_definitions table columns:'
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'field_definitions' 
  AND column_name IN ('created_by', 'updated_by', 'created_at', 'updated_at')
ORDER BY ordinal_position;

\echo 'Dropdown_groups table columns:'
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'dropdown_groups' 
  AND column_name IN ('created_by', 'updated_by', 'created_at', 'updated_at')
ORDER BY ordinal_position;

\echo 'Dropdown_options table columns:'
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'dropdown_options' 
  AND column_name IN ('created_by', 'updated_by', 'created_at', 'updated_at')
ORDER BY ordinal_position;

-- Step 2: Add missing columns safely
\echo 'Step 2: Adding missing columns...'

DO $$
BEGIN
    -- Add updated_by to tiers if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tiers' AND column_name = 'updated_by'
    ) THEN
        ALTER TABLE tiers ADD COLUMN updated_by UUID REFERENCES profiles(id);
        RAISE NOTICE 'Added updated_by column to tiers table';
    ELSE
        RAISE NOTICE 'updated_by column already exists in tiers table';
    END IF;
    
    -- Add updated_by to field_definitions if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'field_definitions' AND column_name = 'updated_by'
    ) THEN
        ALTER TABLE field_definitions ADD COLUMN updated_by UUID REFERENCES profiles(id);
        RAISE NOTICE 'Added updated_by column to field_definitions table';
    ELSE
        RAISE NOTICE 'updated_by column already exists in field_definitions table';
    END IF;
    
    -- Add updated_by to dropdown_groups if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dropdown_groups' AND column_name = 'updated_by'
    ) THEN
        ALTER TABLE dropdown_groups ADD COLUMN updated_by UUID REFERENCES profiles(id);
        RAISE NOTICE 'Added updated_by column to dropdown_groups table';
    ELSE
        RAISE NOTICE 'updated_by column already exists in dropdown_groups table';
    END IF;
    
    -- Add updated_at to dropdown_options if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dropdown_options' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE dropdown_options ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to dropdown_options table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in dropdown_options table';
    END IF;
    
    -- Add updated_by to dropdown_options if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dropdown_options' AND column_name = 'updated_by'
    ) THEN
        ALTER TABLE dropdown_options ADD COLUMN updated_by UUID REFERENCES profiles(id);
        RAISE NOTICE 'Added updated_by column to dropdown_options table';
    ELSE
        RAISE NOTICE 'updated_by column already exists in dropdown_options table';
    END IF;
END $$;

-- Step 3: Create performance indexes
\echo 'Step 3: Creating indexes for performance...'

DO $$
BEGIN
    -- Index for tiers.updated_by
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tiers' AND column_name = 'updated_by'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_tiers_updated_by ON tiers(updated_by);
        RAISE NOTICE 'Created index on tiers.updated_by';
    END IF;
    
    -- Index for field_definitions.updated_by
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'field_definitions' AND column_name = 'updated_by'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_field_definitions_updated_by ON field_definitions(updated_by);
        RAISE NOTICE 'Created index on field_definitions.updated_by';
    END IF;
    
    -- Index for dropdown_groups.updated_by
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dropdown_groups' AND column_name = 'updated_by'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_dropdown_groups_updated_by ON dropdown_groups(updated_by);
        RAISE NOTICE 'Created index on dropdown_groups.updated_by';
    END IF;
    
    -- Indexes for dropdown_options
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dropdown_options' AND column_name = 'updated_by'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_dropdown_options_updated_by ON dropdown_options(updated_by);
        RAISE NOTICE 'Created index on dropdown_options.updated_by';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dropdown_options' AND column_name = 'updated_at'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_dropdown_options_updated_at ON dropdown_options(updated_at);
        RAISE NOTICE 'Created index on dropdown_options.updated_at';
    END IF;
END $$;

-- Step 4: Initialize existing records
\echo 'Step 4: Initializing existing records...'

DO $$
BEGIN
    -- Update tiers - copy created_by to updated_by for existing records
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tiers' AND column_name = 'updated_by'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tiers' AND column_name = 'created_by'
    ) THEN
        UPDATE tiers SET updated_by = created_by WHERE updated_by IS NULL;
        RAISE NOTICE 'Updated existing tiers records with updated_by values';
    END IF;
    
    -- Update field_definitions - copy created_by to updated_by for existing records
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'field_definitions' AND column_name = 'updated_by'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'field_definitions' AND column_name = 'created_by'
    ) THEN
        UPDATE field_definitions SET updated_by = created_by WHERE updated_by IS NULL;
        RAISE NOTICE 'Updated existing field_definitions records with updated_by values';
    END IF;
    
    -- Update dropdown_groups - copy created_by to updated_by for existing records
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dropdown_groups' AND column_name = 'updated_by'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dropdown_groups' AND column_name = 'created_by'
    ) THEN
        UPDATE dropdown_groups SET updated_by = created_by WHERE updated_by IS NULL;
        RAISE NOTICE 'Updated existing dropdown_groups records with updated_by values';
    END IF;
    
    -- Note: dropdown_options doesn't have created_by, so updated_by will remain NULL for existing records
    RAISE NOTICE 'Skipped dropdown_options update - table does not have created_by column';
END $$;

-- Step 5: Add documentation comments
\echo 'Step 5: Adding documentation comments...'

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tiers' AND column_name = 'updated_by'
    ) THEN
        COMMENT ON COLUMN tiers.updated_by IS 'User who last updated this tier';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'field_definitions' AND column_name = 'updated_by'
    ) THEN
        COMMENT ON COLUMN field_definitions.updated_by IS 'User who last updated this field definition';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dropdown_groups' AND column_name = 'updated_by'
    ) THEN
        COMMENT ON COLUMN dropdown_groups.updated_by IS 'User who last updated this dropdown group';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dropdown_options' AND column_name = 'updated_at'
    ) THEN
        COMMENT ON COLUMN dropdown_options.updated_at IS 'When this dropdown option was last updated';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dropdown_options' AND column_name = 'updated_by'
    ) THEN
        COMMENT ON COLUMN dropdown_options.updated_by IS 'User who last updated this dropdown option';
    END IF;
END $$;

-- Step 6: Final verification
\echo 'Step 6: Final verification of all tables...'

\echo 'Tiers table final state:'
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tiers' 
  AND column_name IN ('updated_by', 'updated_at', 'created_by', 'created_at')
ORDER BY ordinal_position;

\echo 'Field_definitions table final state:'
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'field_definitions' 
  AND column_name IN ('updated_by', 'updated_at', 'created_by', 'created_at')
ORDER BY ordinal_position;

\echo 'Dropdown_groups table final state:'
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'dropdown_groups' 
  AND column_name IN ('updated_by', 'updated_at', 'created_by', 'created_at')
ORDER BY ordinal_position;

\echo 'Dropdown_options table final state:'
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'dropdown_options' 
  AND column_name IN ('updated_by', 'updated_at', 'created_at')
ORDER BY ordinal_position;

\echo 'Migration completed successfully!'
\echo 'All tables now have proper audit trail columns with indexes and documentation.' 
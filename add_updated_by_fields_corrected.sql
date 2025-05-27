-- Add updated_by fields to track who made edits
-- This migration adds updated_by tracking to relevant tables that actually exist

-- Add updated_by to pois table
ALTER TABLE pois ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add updated_by to comments table  
ALTER TABLE comments ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add updated_by to poi_collections table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'poi_collections') THEN
        ALTER TABLE poi_collections ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add updated_by to grid_squares table for screenshot edits
ALTER TABLE grid_squares ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create function to automatically update updated_at and updated_by when records are modified
CREATE OR REPLACE FUNCTION update_updated_at_and_by()
RETURNS TRIGGER AS $$
BEGIN
    -- Update updated_at timestamp
    NEW.updated_at = CURRENT_TIMESTAMP;
    
    -- Only update updated_by if it's explicitly set in the UPDATE statement
    -- This allows the application to control who is recorded as the updater
    IF TG_OP = 'UPDATE' AND OLD.updated_by IS DISTINCT FROM NEW.updated_by THEN
        -- updated_by was explicitly changed, keep the new value
        NULL; -- Do nothing, keep NEW.updated_by as set by the application
    ELSIF TG_OP = 'UPDATE' THEN
        -- updated_by wasn't explicitly changed, keep the old value
        NEW.updated_by = OLD.updated_by;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist (to avoid conflicts)
DROP TRIGGER IF EXISTS trigger_update_pois_updated_at ON pois;
DROP TRIGGER IF EXISTS trigger_update_comments_updated_at ON comments;
DROP TRIGGER IF EXISTS trigger_update_poi_collections_updated_at ON poi_collections;
DROP TRIGGER IF EXISTS trigger_update_grid_squares_updated_at ON grid_squares;

-- Apply the trigger to relevant tables (only for tables that already have updated_at)
CREATE TRIGGER trigger_update_pois_updated_at
    BEFORE UPDATE ON pois
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_and_by();

CREATE TRIGGER trigger_update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_and_by();

-- Create trigger for poi_collections if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'poi_collections') THEN
        EXECUTE 'CREATE TRIGGER trigger_update_poi_collections_updated_at
            BEFORE UPDATE ON poi_collections
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_and_by()';
    END IF;
END $$;

-- Create trigger for grid_squares if it has updated_at column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'grid_squares' 
        AND column_name = 'updated_at'
    ) THEN
        EXECUTE 'CREATE TRIGGER trigger_update_grid_squares_updated_at
            BEFORE UPDATE ON grid_squares
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_and_by()';
    END IF;
END $$;

-- Display summary of changes
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Added updated_by columns to: pois, comments, grid_squares';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'poi_collections') THEN
        RAISE NOTICE 'Added updated_by column to: poi_collections';
    ELSE
        RAISE NOTICE 'Table poi_collections does not exist - skipped';
    END IF;
    
    RAISE NOTICE 'Created triggers for automatic timestamp and editor tracking';
    RAISE NOTICE 'Screenshots are stored as JSON arrays in main tables, no separate screenshot tables needed';
END $$; 
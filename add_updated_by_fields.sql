-- Add updated_by fields to track who made edits
-- This migration adds updated_by tracking to relevant tables

-- Add updated_by to pois table
ALTER TABLE pois ADD COLUMN updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add updated_by to comments table  
ALTER TABLE comments ADD COLUMN updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add updated_by to poi_collections table
ALTER TABLE poi_collections ADD COLUMN updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add updated_by to grid_squares table for screenshot edits
ALTER TABLE grid_squares ADD COLUMN updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add updated_by to poi_screenshots table for screenshot edits
ALTER TABLE poi_screenshots ADD COLUMN updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE poi_screenshots ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add updated_by to comment_screenshots table for screenshot edits
ALTER TABLE comment_screenshots ADD COLUMN updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE comment_screenshots ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

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

-- Apply the trigger to relevant tables (only for tables that already have updated_at)
CREATE TRIGGER trigger_update_pois_updated_at
    BEFORE UPDATE ON pois
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_and_by();

CREATE TRIGGER trigger_update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_and_by();

CREATE TRIGGER trigger_update_poi_collections_updated_at
    BEFORE UPDATE ON poi_collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_and_by();

-- For screenshot tables, create simpler triggers since they don't have existing updated_at triggers
CREATE OR REPLACE FUNCTION update_screenshot_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_poi_screenshots_updated_at
    BEFORE UPDATE ON poi_screenshots
    FOR EACH ROW
    EXECUTE FUNCTION update_screenshot_updated_at();

CREATE TRIGGER trigger_update_comment_screenshots_updated_at
    BEFORE UPDATE ON comment_screenshots
    FOR EACH ROW
    EXECUTE FUNCTION update_screenshot_updated_at(); 
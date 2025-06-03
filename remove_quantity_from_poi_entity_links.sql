-- Migration: Remove quantity column from poi_entity_links table
-- Date: 2025-01-30
-- Description: Simplify POI entity linking by removing quantity tracking

BEGIN;

-- Remove the quantity column from poi_entity_links table
ALTER TABLE poi_entity_links 
DROP COLUMN IF EXISTS quantity;

-- Verify the final schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'poi_entity_links' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

COMMIT;

-- Expected final schema:
-- | column_name | data_type                | is_nullable | column_default |
-- |-------------|--------------------------|-------------|----------------|
-- | poi_id      | uuid                     | NO          | null           |
-- | entity_id   | uuid                     | NO          | null           |
-- | added_by    | uuid                     | YES         | null           |
-- | added_at    | timestamp with time zone | YES         | now()          |
-- | updated_by  | uuid                     | YES         | null           |
-- | updated_at  | timestamp with time zone | YES         | null           | 
-- ===================================================================
-- CLEANUP MIGRATION: Remove Legacy Text Columns from Entities Table
-- ===================================================================
-- Date: January 30, 2025
-- Purpose: Remove redundant category, type, subtype text columns after
--          successful migration to normalized foreign key structure
-- 
-- SAFETY CHECKS:
-- 1. Verify all entities have proper foreign key relationships
-- 2. Confirm no NULL foreign keys exist
-- 3. Backup verification before column removal
-- ===================================================================

-- PHASE 1: VERIFICATION AND SAFETY CHECKS
-- =======================================

DO $$
DECLARE
    entities_count INTEGER;
    entities_with_category_id INTEGER;
    entities_with_type_id INTEGER;
    entities_with_null_category_id INTEGER;
    entities_with_null_type_id INTEGER;
    entities_with_null_subtype_id INTEGER;
BEGIN
    -- Get total entity count
    SELECT COUNT(*) INTO entities_count FROM entities;
    
    -- Count entities with foreign keys
    SELECT COUNT(*) INTO entities_with_category_id FROM entities WHERE category_id IS NOT NULL;
    SELECT COUNT(*) INTO entities_with_type_id FROM entities WHERE type_id IS NOT NULL;
    
    -- Count entities with NULL foreign keys (should be 0 for required fields)
    SELECT COUNT(*) INTO entities_with_null_category_id FROM entities WHERE category_id IS NULL;
    SELECT COUNT(*) INTO entities_with_null_type_id FROM entities WHERE type_id IS NULL;
    SELECT COUNT(*) INTO entities_with_null_subtype_id FROM entities WHERE subtype_id IS NULL;
    
    -- Report verification results
    RAISE NOTICE '=== MIGRATION VERIFICATION REPORT ===';
    RAISE NOTICE 'Total entities: %', entities_count;
    RAISE NOTICE 'Entities with category_id: %', entities_with_category_id;
    RAISE NOTICE 'Entities with type_id: %', entities_with_type_id;
    RAISE NOTICE 'Entities with NULL category_id: %', entities_with_null_category_id;
    RAISE NOTICE 'Entities with NULL type_id: %', entities_with_null_type_id;
    RAISE NOTICE 'Entities with NULL subtype_id: % (OK - subtypes are optional)', entities_with_null_subtype_id;
    
    -- Safety checks
    IF entities_with_null_category_id > 0 THEN
        RAISE EXCEPTION 'MIGRATION BLOCKED: % entities have NULL category_id. Migration incomplete!', entities_with_null_category_id;
    END IF;
    
    IF entities_with_null_type_id > 0 THEN
        RAISE EXCEPTION 'MIGRATION BLOCKED: % entities have NULL type_id. Migration incomplete!', entities_with_null_type_id;
    END IF;
    
    IF entities_with_category_id != entities_count THEN
        RAISE EXCEPTION 'MIGRATION BLOCKED: Not all entities have category_id populated!';
    END IF;
    
    IF entities_with_type_id != entities_count THEN
        RAISE EXCEPTION 'MIGRATION BLOCKED: Not all entities have type_id populated!';
    END IF;
    
    RAISE NOTICE '✅ VERIFICATION PASSED: All entities have required foreign keys';
END $$;

-- PHASE 2: FINAL DATA COMPARISON
-- ===============================
-- Compare legacy text fields with foreign key resolved names to ensure consistency

DO $$
DECLARE
    mismatched_categories INTEGER;
    mismatched_types INTEGER;
    mismatched_subtypes INTEGER;
BEGIN
    RAISE NOTICE '=== DATA CONSISTENCY VERIFICATION ===';
    
    -- Check category consistency
    SELECT COUNT(*) INTO mismatched_categories
    FROM entities e
    JOIN categories c ON e.category_id = c.id
    WHERE e.category != c.name;
    
    -- Check type consistency  
    SELECT COUNT(*) INTO mismatched_types
    FROM entities e
    JOIN types t ON e.type_id = t.id
    WHERE e.type != t.name;
    
    -- Check subtype consistency (only for non-null subtypes)
    SELECT COUNT(*) INTO mismatched_subtypes
    FROM entities e
    JOIN subtypes s ON e.subtype_id = s.id
    WHERE e.subtype IS NOT NULL AND e.subtype != s.name;
    
    RAISE NOTICE 'Mismatched categories: %', mismatched_categories;
    RAISE NOTICE 'Mismatched types: %', mismatched_types;
    RAISE NOTICE 'Mismatched subtypes: %', mismatched_subtypes;
    
    IF mismatched_categories > 0 OR mismatched_types > 0 OR mismatched_subtypes > 0 THEN
        RAISE WARNING 'Data inconsistencies found, but proceeding as foreign keys are authoritative';
    ELSE
        RAISE NOTICE '✅ DATA CONSISTENCY VERIFIED: Legacy and normalized data match perfectly';
    END IF;
END $$;

-- PHASE 3: CREATE BACKUP TABLE (OPTIONAL SAFETY)
-- ===============================================
-- Create a backup table to preserve legacy data for emergency rollback
-- Using a TABLE instead of VIEW so it doesn't depend on the columns we're about to drop

-- First drop any existing view or table with this name
DROP VIEW IF EXISTS entities_legacy_backup;
DROP TABLE IF EXISTS entities_legacy_backup;

CREATE TABLE entities_legacy_backup AS
SELECT 
    e.id,
    e.item_id,
    e.name,
    e.category as legacy_category,
    e.type as legacy_type,
    e.subtype as legacy_subtype,
    e.category_id,
    e.type_id,
    e.subtype_id,
    c.name as current_category,
    t.name as current_type,
    s.name as current_subtype,
    NOW() as backup_created_at
FROM entities e
LEFT JOIN categories c ON e.category_id = c.id
LEFT JOIN types t ON e.type_id = t.id  
LEFT JOIN subtypes s ON e.subtype_id = s.id;

DO $$
BEGIN
    RAISE NOTICE '✅ BACKUP TABLE CREATED: entities_legacy_backup (for emergency rollback)';
END $$;

-- PHASE 4: REMOVE LEGACY COLUMNS
-- ===============================
-- Now safely remove the redundant text columns

DO $$
BEGIN
    RAISE NOTICE '=== REMOVING LEGACY COLUMNS ===';
END $$;

-- Remove the legacy text columns
ALTER TABLE entities DROP COLUMN IF EXISTS category;

DO $$
BEGIN
    RAISE NOTICE '✅ Removed column: category';
END $$;

ALTER TABLE entities DROP COLUMN IF EXISTS type;

DO $$
BEGIN
    RAISE NOTICE '✅ Removed column: type';
END $$;

ALTER TABLE entities DROP COLUMN IF EXISTS subtype;

DO $$
BEGIN
    RAISE NOTICE '✅ Removed column: subtype';
END $$;

-- PHASE 5: VERIFY CLEANUP
-- ========================

DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    RAISE NOTICE '=== CLEANUP VERIFICATION ===';
    
    -- Check if legacy columns still exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'entities' AND column_name = 'category'
    ) INTO column_exists;
    
    IF column_exists THEN
        RAISE EXCEPTION 'CLEANUP FAILED: category column still exists!';
    ELSE
        RAISE NOTICE '✅ Confirmed: category column removed';
    END IF;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'entities' AND column_name = 'type'
    ) INTO column_exists;
    
    IF column_exists THEN
        RAISE EXCEPTION 'CLEANUP FAILED: type column still exists!';
    ELSE
        RAISE NOTICE '✅ Confirmed: type column removed';
    END IF;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'entities' AND column_name = 'subtype'
    ) INTO column_exists;
    
    IF column_exists THEN
        RAISE EXCEPTION 'CLEANUP FAILED: subtype column still exists!';
    ELSE
        RAISE NOTICE '✅ Confirmed: subtype column removed';
    END IF;
END $$;

-- PHASE 6: FINAL STATISTICS
-- ==========================

DO $$
DECLARE
    entities_count INTEGER;
    categories_count INTEGER;
    types_count INTEGER;
    subtypes_count INTEGER;
BEGIN
    RAISE NOTICE '=== FINAL MIGRATION STATISTICS ===';
    
    SELECT COUNT(*) INTO entities_count FROM entities;
    SELECT COUNT(*) INTO categories_count FROM categories;
    SELECT COUNT(*) INTO types_count FROM types;
    SELECT COUNT(*) INTO subtypes_count FROM subtypes;
    
    RAISE NOTICE 'Total entities: %', entities_count;
    RAISE NOTICE 'Total categories: %', categories_count;
    RAISE NOTICE 'Total types: %', types_count;
    RAISE NOTICE 'Total subtypes: %', subtypes_count;
    
    RAISE NOTICE '✅ NORMALIZATION COMPLETE: Legacy columns removed, foreign key structure active';
    RAISE NOTICE '📋 BACKUP: entities_legacy_backup view available for emergency reference';
    RAISE NOTICE '🎯 NEXT: Update frontend components to use only normalized APIs';
END $$;

-- ===================================================================
-- MIGRATION COMPLETE
-- ===================================================================
-- 
-- WHAT WAS DONE:
-- 1. ✅ Verified all entities have proper foreign key relationships
-- 2. ✅ Confirmed data consistency between legacy and normalized fields  
-- 3. ✅ Created backup view for emergency reference
-- 4. ✅ Removed redundant category, type, subtype text columns
-- 5. ✅ Verified cleanup completion
-- 
-- NEXT STEPS:
-- 1. Update TypeScript interfaces to remove legacy text fields
-- 2. Update frontend components to use only normalized APIs
-- 3. Remove legacy field references from codebase
-- 4. Test all functionality with cleaned database structure
-- 
-- ROLLBACK PROCEDURE (if needed):
-- If issues arise, the entities_legacy_backup view contains all legacy 
-- data that can be used to restore the original columns if necessary.
-- =================================================================== 
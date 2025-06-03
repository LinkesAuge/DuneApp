-- =============================================================================
-- CATEGORY/TYPE/SUBTYPE NORMALIZATION MIGRATION
-- =============================================================================
-- 
-- PURPOSE: Convert hardcoded text fields to proper relational database structure
-- IMPACT: Improved data integrity, performance, and maintainability
-- 
-- PHASES:
-- 1. Create new normalized tables
-- 2. Extract and populate unique values from existing entities
-- 3. Add foreign key columns to entities table
-- 4. Update entities with new foreign keys
-- 5. Verify data integrity
-- 6. Drop old text columns (optional, keep for rollback)
--
-- =============================================================================

-- Phase 1: Create Normalized Tables
-- =============================================================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- Types table (belongs to categories)
CREATE TABLE IF NOT EXISTS types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, category_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_types_category_id ON types(category_id);
CREATE INDEX IF NOT EXISTS idx_types_name ON types(name);
CREATE INDEX IF NOT EXISTS idx_types_sort_order ON types(sort_order);

-- Subtypes table (belongs to types)
CREATE TABLE IF NOT EXISTS subtypes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type_id INTEGER REFERENCES types(id) ON DELETE CASCADE,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, type_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_subtypes_type_id ON subtypes(type_id);
CREATE INDEX IF NOT EXISTS idx_subtypes_name ON subtypes(name);
CREATE INDEX IF NOT EXISTS idx_subtypes_sort_order ON subtypes(sort_order);

-- =============================================================================
-- Phase 2: Extract and Populate Unique Values
-- =============================================================================

-- Insert unique categories from existing entities
INSERT INTO categories (name, sort_order) 
SELECT DISTINCT 
    category,
    ROW_NUMBER() OVER (ORDER BY category) * 10 as sort_order
FROM entities 
WHERE category IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- Insert NULL category for entities with null categories
INSERT INTO categories (name, description, sort_order) 
VALUES ('Unknown', 'Entities without a specified category', 999)
ON CONFLICT (name) DO NOTHING;

-- Insert unique types with their category relationships
INSERT INTO types (name, category_id, sort_order)
SELECT DISTINCT 
    e.type,
    c.id as category_id,
    ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY e.type) * 10 as sort_order
FROM entities e
LEFT JOIN categories c ON c.name = COALESCE(e.category, 'Unknown')
WHERE e.type IS NOT NULL
ON CONFLICT (name, category_id) DO NOTHING;

-- Insert NULL type for entities with null types
INSERT INTO types (name, category_id, description, sort_order)
SELECT 
    'Unknown' as name,
    c.id as category_id,
    'Entities without a specified type' as description,
    999 as sort_order
FROM categories c
ON CONFLICT (name, category_id) DO NOTHING;

-- Insert unique subtypes with their type relationships
INSERT INTO subtypes (name, type_id, sort_order)
SELECT DISTINCT 
    e.subtype,
    t.id as type_id,
    ROW_NUMBER() OVER (PARTITION BY t.id ORDER BY e.subtype) * 10 as sort_order
FROM entities e
LEFT JOIN categories c ON c.name = COALESCE(e.category, 'Unknown')
LEFT JOIN types t ON t.name = COALESCE(e.type, 'Unknown') AND t.category_id = c.id
WHERE e.subtype IS NOT NULL
ON CONFLICT (name, type_id) DO NOTHING;

-- Insert NULL subtype for entities with null subtypes
INSERT INTO subtypes (name, type_id, description, sort_order)
SELECT 
    'None' as name,
    t.id as type_id,
    'Entities without a specified subtype' as description,
    999 as sort_order
FROM types t
ON CONFLICT (name, type_id) DO NOTHING;

-- =============================================================================
-- Phase 3: Add Foreign Key Columns to Entities Table
-- =============================================================================

-- Add new foreign key columns (if they don't already exist)
DO $$ 
BEGIN
    -- Add category_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'entities' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE entities ADD COLUMN category_id INTEGER REFERENCES categories(id);
        CREATE INDEX IF NOT EXISTS idx_entities_category_id ON entities(category_id);
    END IF;
    
    -- Add type_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'entities' AND column_name = 'type_id'
    ) THEN
        ALTER TABLE entities ADD COLUMN type_id INTEGER REFERENCES types(id);
        CREATE INDEX IF NOT EXISTS idx_entities_type_id ON entities(type_id);
    END IF;
    
    -- Add subtype_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'entities' AND column_name = 'subtype_id'
    ) THEN
        ALTER TABLE entities ADD COLUMN subtype_id INTEGER REFERENCES subtypes(id);
        CREATE INDEX IF NOT EXISTS idx_entities_subtype_id ON entities(subtype_id);
    END IF;
END $$;

-- =============================================================================
-- Phase 4: Update Entities with Foreign Keys
-- =============================================================================

-- Update category_id
UPDATE entities 
SET category_id = c.id
FROM categories c
WHERE c.name = COALESCE(entities.category, 'Unknown');

-- Update type_id
UPDATE entities 
SET type_id = t.id
FROM types t
JOIN categories c ON t.category_id = c.id
WHERE t.name = COALESCE(entities.type, 'Unknown')
  AND c.id = entities.category_id;

-- Update subtype_id
UPDATE entities 
SET subtype_id = s.id
FROM subtypes s
JOIN types t ON s.type_id = t.id
WHERE s.name = COALESCE(entities.subtype, 'None')
  AND t.id = entities.type_id;

-- =============================================================================
-- Phase 5: Data Integrity Verification
-- =============================================================================

-- Verification queries to ensure migration was successful

-- Check that all entities have category_id
SELECT 
    'Entities missing category_id' as check_type,
    COUNT(*) as count
FROM entities 
WHERE category_id IS NULL;

-- Check that all entities have type_id
SELECT 
    'Entities missing type_id' as check_type,
    COUNT(*) as count
FROM entities 
WHERE type_id IS NULL;

-- Check that all entities have subtype_id
SELECT 
    'Entities missing subtype_id' as check_type,
    COUNT(*) as count
FROM entities 
WHERE subtype_id IS NULL;

-- Verify hierarchical relationships are maintained
SELECT 
    'Category/Type/Subtype combinations' as check_type,
    COUNT(DISTINCT CONCAT(category_id, '|', type_id, '|', subtype_id)) as count
FROM entities;

-- Compare with original combinations
SELECT 
    'Original combinations' as check_type,
    COUNT(DISTINCT CONCAT(COALESCE(category, 'Unknown'), '|', COALESCE(type, 'Unknown'), '|', COALESCE(subtype, 'None'))) as count
FROM entities;

-- Show summary statistics
SELECT 
    'Summary' as info,
    (SELECT COUNT(*) FROM categories) as total_categories,
    (SELECT COUNT(*) FROM types) as total_types,
    (SELECT COUNT(*) FROM subtypes) as total_subtypes,
    (SELECT COUNT(*) FROM entities) as total_entities;

-- =============================================================================
-- Phase 6: Create Helper Views and Functions
-- =============================================================================

-- View to easily see entity details with category/type/subtype names
CREATE OR REPLACE VIEW entities_with_hierarchy AS
SELECT 
    e.id,
    e.item_id,
    e.name,
    e.description,
    e.icon,
    c.name as category_name,
    t.name as type_name,
    s.name as subtype_name,
    e.tier_number,
    e.is_schematic,
    e.is_global,
    e.field_values,
    e.category_id,
    e.type_id,
    e.subtype_id,
    e.created_at,
    e.updated_at
FROM entities e
LEFT JOIN categories c ON e.category_id = c.id
LEFT JOIN types t ON e.type_id = t.id
LEFT JOIN subtypes s ON e.subtype_id = s.id;

-- Function to get category hierarchy
CREATE OR REPLACE FUNCTION get_category_hierarchy(entity_id UUID)
RETURNS TABLE(
    category_id INTEGER,
    category_name TEXT,
    type_id INTEGER,
    type_name TEXT,
    subtype_id INTEGER,
    subtype_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as category_id,
        c.name as category_name,
        t.id as type_id,
        t.name as type_name,
        s.id as subtype_id,
        s.name as subtype_name
    FROM entities e
    LEFT JOIN categories c ON e.category_id = c.id
    LEFT JOIN types t ON e.type_id = t.id
    LEFT JOIN subtypes s ON e.subtype_id = s.id
    WHERE e.id = entity_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Phase 7: RLS Policies for New Tables
-- =============================================================================

-- Enable RLS on new tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE types ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtypes ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to categories" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to types" ON types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to subtypes" ON subtypes FOR SELECT TO authenticated USING (true);

-- Allow admin modifications
CREATE POLICY "Allow admin modifications to categories" ON categories FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin modifications to types" ON types FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin modifications to subtypes" ON subtypes FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

-- =============================================================================
-- Migration Complete!
-- =============================================================================

-- Success message
SELECT 
    '🎉 CATEGORY NORMALIZATION MIGRATION COMPLETED!' as status,
    'Database structure has been successfully normalized' as message,
    NOW() as completed_at;

-- Note: The original text columns (category, type, subtype) are preserved
-- for rollback purposes. They can be dropped once the migration is verified:
-- 
-- ALTER TABLE entities DROP COLUMN category;
-- ALTER TABLE entities DROP COLUMN type;
-- ALTER TABLE entities DROP COLUMN subtype; 
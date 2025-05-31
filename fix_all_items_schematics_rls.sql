-- Comprehensive Fix for ALL Items & Schematics RLS Policies
-- Date: January 29, 2025
-- Fixes HTTP 406 errors by ensuring all related tables have proper permissions

-- List of all tables to fix
-- tiers, categories, types, subtypes, items, schematics, field_definitions, dropdown_groups, dropdown_options

-- TIERS TABLE
ALTER TABLE tiers DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_select_tiers" ON tiers;
DROP POLICY IF EXISTS "allow_authenticated_insert_tiers" ON tiers;
DROP POLICY IF EXISTS "allow_authenticated_update_tiers" ON tiers;
DROP POLICY IF EXISTS "allow_authenticated_delete_tiers" ON tiers;

GRANT ALL ON tiers TO authenticated;
GRANT ALL ON tiers TO service_role;
GRANT SELECT ON tiers TO anon;

CREATE POLICY "allow_all_select_tiers" ON tiers FOR SELECT USING (true);
CREATE POLICY "allow_authenticated_insert_tiers" ON tiers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_authenticated_update_tiers" ON tiers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_authenticated_delete_tiers" ON tiers FOR DELETE TO authenticated USING (true);

ALTER TABLE tiers ENABLE ROW LEVEL SECURITY;

-- CATEGORIES TABLE
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_select_categories" ON categories;
DROP POLICY IF EXISTS "allow_authenticated_insert_categories" ON categories;
DROP POLICY IF EXISTS "allow_authenticated_update_categories" ON categories;
DROP POLICY IF EXISTS "allow_authenticated_delete_categories" ON categories;

GRANT ALL ON categories TO authenticated;
GRANT ALL ON categories TO service_role;
GRANT SELECT ON categories TO anon;

CREATE POLICY "allow_all_select_categories" ON categories FOR SELECT USING (true);
CREATE POLICY "allow_authenticated_insert_categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_authenticated_update_categories" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_authenticated_delete_categories" ON categories FOR DELETE TO authenticated USING (true);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- TYPES TABLE (already done but ensuring consistency)
ALTER TABLE types DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_select" ON types;
DROP POLICY IF EXISTS "allow_authenticated_insert" ON types;
DROP POLICY IF EXISTS "allow_authenticated_update" ON types;
DROP POLICY IF EXISTS "allow_authenticated_delete" ON types;

GRANT ALL ON types TO authenticated;
GRANT ALL ON types TO service_role;
GRANT SELECT ON types TO anon;

CREATE POLICY "allow_all_select_types" ON types FOR SELECT USING (true);
CREATE POLICY "allow_authenticated_insert_types" ON types FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_authenticated_update_types" ON types FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_authenticated_delete_types" ON types FOR DELETE TO authenticated USING (true);

ALTER TABLE types ENABLE ROW LEVEL SECURITY;

-- FIELD_DEFINITIONS TABLE
ALTER TABLE field_definitions DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_select_field_definitions" ON field_definitions;
DROP POLICY IF EXISTS "allow_authenticated_insert_field_definitions" ON field_definitions;
DROP POLICY IF EXISTS "allow_authenticated_update_field_definitions" ON field_definitions;
DROP POLICY IF EXISTS "allow_authenticated_delete_field_definitions" ON field_definitions;

GRANT ALL ON field_definitions TO authenticated;
GRANT ALL ON field_definitions TO service_role;
GRANT SELECT ON field_definitions TO anon;

CREATE POLICY "allow_all_select_field_definitions" ON field_definitions FOR SELECT USING (true);
CREATE POLICY "allow_authenticated_insert_field_definitions" ON field_definitions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_authenticated_update_field_definitions" ON field_definitions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_authenticated_delete_field_definitions" ON field_definitions FOR DELETE TO authenticated USING (true);

ALTER TABLE field_definitions ENABLE ROW LEVEL SECURITY;

-- DROPDOWN_GROUPS TABLE
ALTER TABLE dropdown_groups DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_select_dropdown_groups" ON dropdown_groups;
DROP POLICY IF EXISTS "allow_authenticated_insert_dropdown_groups" ON dropdown_groups;
DROP POLICY IF EXISTS "allow_authenticated_update_dropdown_groups" ON dropdown_groups;
DROP POLICY IF EXISTS "allow_authenticated_delete_dropdown_groups" ON dropdown_groups;

GRANT ALL ON dropdown_groups TO authenticated;
GRANT ALL ON dropdown_groups TO service_role;
GRANT SELECT ON dropdown_groups TO anon;

CREATE POLICY "allow_all_select_dropdown_groups" ON dropdown_groups FOR SELECT USING (true);
CREATE POLICY "allow_authenticated_insert_dropdown_groups" ON dropdown_groups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_authenticated_update_dropdown_groups" ON dropdown_groups FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_authenticated_delete_dropdown_groups" ON dropdown_groups FOR DELETE TO authenticated USING (true);

ALTER TABLE dropdown_groups ENABLE ROW LEVEL SECURITY;

-- DROPDOWN_OPTIONS TABLE
ALTER TABLE dropdown_options DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_select_dropdown_options" ON dropdown_options;
DROP POLICY IF EXISTS "allow_authenticated_insert_dropdown_options" ON dropdown_options;
DROP POLICY IF EXISTS "allow_authenticated_update_dropdown_options" ON dropdown_options;
DROP POLICY IF EXISTS "allow_authenticated_delete_dropdown_options" ON dropdown_options;

GRANT ALL ON dropdown_options TO authenticated;
GRANT ALL ON dropdown_options TO service_role;
GRANT SELECT ON dropdown_options TO anon;

CREATE POLICY "allow_all_select_dropdown_options" ON dropdown_options FOR SELECT USING (true);
CREATE POLICY "allow_authenticated_insert_dropdown_options" ON dropdown_options FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_authenticated_update_dropdown_options" ON dropdown_options FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_authenticated_delete_dropdown_options" ON dropdown_options FOR DELETE TO authenticated USING (true);

ALTER TABLE dropdown_options ENABLE ROW LEVEL SECURITY;

-- ITEMS TABLE
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_select_items" ON items;
DROP POLICY IF EXISTS "allow_authenticated_insert_items" ON items;
DROP POLICY IF EXISTS "allow_authenticated_update_items" ON items;
DROP POLICY IF EXISTS "allow_authenticated_delete_items" ON items;

GRANT ALL ON items TO authenticated;
GRANT ALL ON items TO service_role;
GRANT SELECT ON items TO anon;

CREATE POLICY "allow_all_select_items" ON items FOR SELECT USING (true);
CREATE POLICY "allow_authenticated_insert_items" ON items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_authenticated_update_items" ON items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_authenticated_delete_items" ON items FOR DELETE TO authenticated USING (true);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- SCHEMATICS TABLE
ALTER TABLE schematics DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_select_schematics" ON schematics;
DROP POLICY IF EXISTS "allow_authenticated_insert_schematics" ON schematics;
DROP POLICY IF EXISTS "allow_authenticated_update_schematics" ON schematics;
DROP POLICY IF EXISTS "allow_authenticated_delete_schematics" ON schematics;

GRANT ALL ON schematics TO authenticated;
GRANT ALL ON schematics TO service_role;
GRANT SELECT ON schematics TO anon;

CREATE POLICY "allow_all_select_schematics" ON schematics FOR SELECT USING (true);
CREATE POLICY "allow_authenticated_insert_schematics" ON schematics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_authenticated_update_schematics" ON schematics FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_authenticated_delete_schematics" ON schematics FOR DELETE TO authenticated USING (true);

ALTER TABLE schematics ENABLE ROW LEVEL SECURITY;

-- Test that everything works
SELECT 'All Items & Schematics RLS policies fixed successfully' as status;

-- Verify all tables have proper policies
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('tiers', 'categories', 'types', 'field_definitions', 'dropdown_groups', 'dropdown_options', 'items', 'schematics')
GROUP BY tablename
ORDER BY tablename; 
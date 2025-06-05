-- Check POI entity links in the database
-- This helps diagnose why LinkedItemsSection might not be showing data

-- 1. Check if poi_entity_links table has data
SELECT 'Total POI entity links:' as info, COUNT(*) as count FROM poi_entity_links;

-- 2. Check sample poi_entity_links data
SELECT 
  pel.poi_id,
  pel.entity_id,
  p.title as poi_title,
  e.name as entity_name,
  e.is_schematic
FROM poi_entity_links pel
LEFT JOIN pois p ON pel.poi_id = p.id
LEFT JOIN entities e ON pel.entity_id = e.id
LIMIT 10;

-- 3. Check POIs that have entity links
SELECT 
  p.id,
  p.title,
  COUNT(pel.entity_id) as entity_count
FROM pois p
LEFT JOIN poi_entity_links pel ON p.id = pel.poi_id
WHERE pel.poi_id IS NOT NULL
GROUP BY p.id, p.title
ORDER BY entity_count DESC
LIMIT 10;

-- 4. Check entities table structure
SELECT 
  'Total entities:' as info, 
  COUNT(*) as count,
  COUNT(CASE WHEN is_schematic = true THEN 1 END) as schematics_count,
  COUNT(CASE WHEN is_schematic = false THEN 1 END) as items_count
FROM entities; 
-- Check current icon field lengths in entities table
-- This will help us determine the appropriate VARCHAR size for icon_fallback

-- Check icon field lengths and content
SELECT 
  LENGTH(icon) as icon_length,
  icon,
  name,
  category
FROM entities 
WHERE icon IS NOT NULL AND icon != ''
ORDER BY LENGTH(icon) DESC
LIMIT 20;

-- Get statistics on icon lengths
SELECT 
  COUNT(*) as total_with_icons,
  MIN(LENGTH(icon)) as min_length,
  MAX(LENGTH(icon)) as max_length,
  AVG(LENGTH(icon))::INTEGER as avg_length,
  COUNT(CASE WHEN LENGTH(icon) > 50 THEN 1 END) as over_50_chars,
  COUNT(CASE WHEN LENGTH(icon) > 100 THEN 1 END) as over_100_chars,
  COUNT(CASE WHEN LENGTH(icon) > 255 THEN 1 END) as over_255_chars
FROM entities 
WHERE icon IS NOT NULL AND icon != '';

-- Show some example long icons
SELECT 
  name,
  category,
  LENGTH(icon) as length,
  LEFT(icon, 100) as icon_preview
FROM entities 
WHERE icon IS NOT NULL AND LENGTH(icon) > 50
ORDER BY LENGTH(icon) DESC
LIMIT 10; 
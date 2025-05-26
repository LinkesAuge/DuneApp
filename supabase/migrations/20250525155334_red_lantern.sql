/*
  # Update resource icons to be more distinct and thematic
  
  1. Changes
    - Make resource icons more visually distinct
    - Use symbols that better reflect their properties
    - Maintain sci-fi aesthetic while improving clarity
*/

-- Update Resources category icons with more distinct symbols
UPDATE poi_types 
SET icon = '✨'  -- Sparkles for the most valuable resource
WHERE name = 'Spice';

UPDATE poi_types 
SET icon = '🟣'  -- Purple circle for purple crystal
WHERE name = 'Erythrite Crystal';

UPDATE poi_types 
SET icon = '⬡'  -- Hexagon for basic metal
WHERE name = 'Aluminum Ore';

UPDATE poi_types 
SET icon = '🔷'  -- Blue diamond for blue crystal
WHERE name = 'Jasmium Crystal';

UPDATE poi_types 
SET icon = '⬢'  -- Filled hexagon for premium metal
WHERE name = 'Titanium Ore';

UPDATE poi_types 
SET icon = '⚡'  -- Lightning for energy mineral
WHERE name = 'Stravidium Mass';

UPDATE poi_types 
SET icon = '⬤'  -- Filled circle for carbon
WHERE name = 'Carbon Ore';

UPDATE poi_types 
SET icon = '🌿'  -- Leaf for medicinal plant
WHERE name = 'Brittle Bush';

UPDATE poi_types 
SET icon = '❋'  -- Flower for alchemical plant
WHERE name = 'Primrose Field';

UPDATE poi_types 
SET icon = '🔋'  -- Battery for power source
WHERE name = 'Fuel Cell';

UPDATE poi_types 
SET icon = '⚙️'  -- Gear for mechanical parts
WHERE name = 'Salvaged Metal';

UPDATE poi_types 
SET icon = '◈'  -- Diamond with center for hard stone
WHERE name = 'Granite Stone';

UPDATE poi_types 
SET icon = '🟧'  -- Orange square for copper
WHERE name = 'Copper Ore';

UPDATE poi_types 
SET icon = '⬣'  -- Hexagon for basic metal
WHERE name = 'Iron Ore';

UPDATE poi_types 
SET icon = '⬟'  -- Pentagon for volcanic stone
WHERE name = 'Basalt Stone';

UPDATE poi_types 
SET icon = '◇'  -- Diamond outline for fine sand
WHERE name = 'Flour Sand';
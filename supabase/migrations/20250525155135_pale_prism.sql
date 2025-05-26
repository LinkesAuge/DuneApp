/*
  # Update POI icons with Dune-themed symbols
  
  1. Changes
    - Update all POI type icons to better match Dune aesthetic
    - Use more sci-fi and desert-themed symbols
    - Maintain clear categorization while improving visual cohesion
  
  2. Categories
    - Base: Military and settlement icons
    - Resources: Resource gathering and processing
    - Locations: Strategic and structural points
    - NPCs: Character and faction representatives
*/

-- Update Base category icons
UPDATE poi_types 
SET icon = '🔰'  -- Shield for main base
WHERE name = 'Guild Base';

UPDATE poi_types 
SET icon = '🛡️'  -- Shield alt for outpost
WHERE name = 'Guild Outpost';

UPDATE poi_types 
SET icon = '⚔️'  -- Crossed swords for enemy
WHERE name = 'Enemy Base';

UPDATE poi_types 
SET icon = '🔹'  -- Blue diamond for friendly
WHERE name = 'Friendly Base';

UPDATE poi_types 
SET icon = '🔸'  -- Orange diamond for neutral
WHERE name = 'Neutral Base';

-- Update Resources category icons
UPDATE poi_types 
SET icon = '🌟'  -- Glowing star for spice
WHERE name = 'Spice';

UPDATE poi_types 
SET icon = '🔮'  -- Crystal ball for crystals
WHERE name = 'Erythrite Crystal';

UPDATE poi_types 
SET icon = '🔷'  -- Large blue diamond for ore
WHERE name = 'Aluminum Ore';

UPDATE poi_types 
SET icon = '🔮'  -- Crystal ball for crystals
WHERE name = 'Jasmium Crystal';

UPDATE poi_types 
SET icon = '🔶'  -- Large orange diamond for premium ore
WHERE name = 'Titanium Ore';

UPDATE poi_types 
SET icon = '⚡'  -- Lightning for energy
WHERE name = 'Stravidium Mass';

UPDATE poi_types 
SET icon = '💠'  -- Diamond with dot for carbon
WHERE name = 'Carbon Ore';

UPDATE poi_types 
SET icon = '🌿'  -- Plant for desert flora
WHERE name = 'Brittle Bush';

UPDATE poi_types 
SET icon = '🌱'  -- Sprout for desert flora
WHERE name = 'Primrose Field';

UPDATE poi_types 
SET icon = '🔋'  -- Battery for power
WHERE name = 'Fuel Cell';

UPDATE poi_types 
SET icon = '🔘'  -- Circle for salvage
WHERE name = 'Salvaged Metal';

UPDATE poi_types 
SET icon = '🔹'  -- Blue diamond for stone
WHERE name = 'Granite Stone';

UPDATE poi_types 
SET icon = '🔸'  -- Orange diamond for copper
WHERE name = 'Copper Ore';

UPDATE poi_types 
SET icon = '🔷'  -- Large blue diamond for iron
WHERE name = 'Iron Ore';

UPDATE poi_types 
SET icon = '🔶'  -- Large orange diamond for stone
WHERE name = 'Basalt Stone';

UPDATE poi_types 
SET icon = '💠'  -- Diamond with dot for sand
WHERE name = 'Flour Sand';

-- Update Locations category icons
UPDATE poi_types 
SET icon = '🎯'  -- Target for control points
WHERE name = 'Control Point';

UPDATE poi_types 
SET icon = '🔲'  -- Black square for cave
WHERE name = 'Cave';

UPDATE poi_types 
SET icon = '🏗️'  -- Construction for wreck
WHERE name = 'Shipwreck';

UPDATE poi_types 
SET icon = '🔬'  -- Microscope for research
WHERE name = 'Imperial Testing Station';

UPDATE poi_types 
SET icon = '💱'  -- Currency exchange
WHERE name = 'Trading Post';

UPDATE poi_types 
SET icon = '🔹'  -- Blue diamond for friendly
WHERE name = 'NPC Camp';

UPDATE poi_types 
SET icon = '🔷'  -- Large blue diamond for outpost
WHERE name = 'NPC Outpost';

UPDATE poi_types 
SET icon = '🔷'  -- Blue theme for Atreides
WHERE name = 'Atreides Fortress';

UPDATE poi_types 
SET icon = '🔶'  -- Orange theme for Harkonnen
WHERE name = 'Harkonnen Fortress';

UPDATE poi_types 
SET icon = '⛏️'  -- Pick for mining
WHERE name = 'Mining Facility';

UPDATE poi_types 
SET icon = '🔲'  -- Black square for landmark
WHERE name = 'Landmark';

-- Update NPCs category icons
UPDATE poi_types 
SET icon = '💱'  -- Currency exchange for vendor
WHERE name = 'Vendor';

UPDATE poi_types 
SET icon = '💠'  -- Diamond for official
WHERE name = 'Tax Collector';

UPDATE poi_types 
SET icon = '⚔️'  -- Swords for combat
WHERE name = 'Swordmaster Trainer';

UPDATE poi_types 
SET icon = '🛡️'  -- Shield for military
WHERE name = 'Trooper Trainer';

UPDATE poi_types 
SET icon = '🔮'  -- Crystal ball for mental powers
WHERE name = 'Mentat Trainer';

UPDATE poi_types 
SET icon = '🌟'  -- Star for mystical
WHERE name = 'Bene Gesserit Trainer';

UPDATE poi_types 
SET icon = '🔬'  -- Science for ecology
WHERE name = 'Planetologist Trainer';

UPDATE poi_types 
SET icon = '👑'  -- Crown for nobility
WHERE name = 'House Representative';
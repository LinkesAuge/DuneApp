-- Update Base category icons
UPDATE poi_types 
SET icon = '🏛️'  -- More architectural/formal
WHERE name = 'Guild Base';

UPDATE poi_types 
SET icon = '🗿'  -- More mysterious/imposing
WHERE name = 'Guild Outpost';

UPDATE poi_types 
SET icon = '⚔️'  -- Keep combat symbol
WHERE name = 'Enemy Base';

UPDATE poi_types 
SET icon = '🤝'  -- Keep alliance symbol
WHERE name = 'Friendly Base';

UPDATE poi_types 
SET icon = '⚖️'  -- Justice/balance symbol
WHERE name = 'Neutral Base';

-- Update Resources category icons
UPDATE poi_types 
SET icon = '⭐'  -- Star for spice
WHERE name = 'Spice';

UPDATE poi_types 
SET icon = '💠'  -- Diamond for crystals
WHERE name = 'Erythrite Crystal';

UPDATE poi_types 
SET icon = '⬢'  -- Hexagon for ore
WHERE name = 'Aluminum Ore';

UPDATE poi_types 
SET icon = '💠'  -- Diamond for crystals
WHERE name = 'Jasmium Crystal';

UPDATE poi_types 
SET icon = '⬡'  -- Hollow hexagon for premium ore
WHERE name = 'Titanium Ore';

UPDATE poi_types 
SET icon = '⚡'  -- Keep energy symbol
WHERE name = 'Stravidium Mass';

UPDATE poi_types 
SET icon = '◆'  -- Diamond for carbon
WHERE name = 'Carbon Ore';

UPDATE poi_types 
SET icon = '❋'  -- Flower for plants
WHERE name = 'Brittle Bush';

UPDATE poi_types 
SET icon = '✿'  -- Different flower for variety
WHERE name = 'Primrose Field';

UPDATE poi_types 
SET icon = '▣'  -- Box for cells
WHERE name = 'Fuel Cell';

UPDATE poi_types 
SET icon = '◈'  -- Diamond with dot for metal
WHERE name = 'Salvaged Metal';

UPDATE poi_types 
SET icon = '◇'  -- Diamond outline for stone
WHERE name = 'Granite Stone';

UPDATE poi_types 
SET icon = '⬗'  -- Angled shape for copper
WHERE name = 'Copper Ore';

UPDATE poi_types 
SET icon = '⬘'  -- Different angle for iron
WHERE name = 'Iron Ore';

UPDATE poi_types 
SET icon = '◈'  -- Diamond with dot for stone
WHERE name = 'Basalt Stone';

UPDATE poi_types 
SET icon = '◇'  -- Diamond outline for sand
WHERE name = 'Flour Sand';

-- Update Locations category icons
UPDATE poi_types 
SET icon = '◎'  -- Target symbol
WHERE name = 'Control Point';

UPDATE poi_types 
SET icon = '▣'  -- Box for cave
WHERE name = 'Cave';

UPDATE poi_types 
SET icon = '◪'  -- Partial square for wreck
WHERE name = 'Shipwreck';

UPDATE poi_types 
SET icon = '⬡'  -- Hexagon for tech
WHERE name = 'Imperial Testing Station';

UPDATE poi_types 
SET icon = '◈'  -- Diamond with dot for trade
WHERE name = 'Trading Post';

UPDATE poi_types 
SET icon = '◇'  -- Diamond outline for camp
WHERE name = 'NPC Camp';

UPDATE poi_types 
SET icon = '⬢'  -- Filled hexagon for outpost
WHERE name = 'NPC Outpost';

UPDATE poi_types 
SET icon = '⬡'  -- Hexagon for fortress
WHERE name = 'Atreides Fortress';

UPDATE poi_types 
SET icon = '⬢'  -- Filled hexagon for fortress
WHERE name = 'Harkonnen Fortress';

UPDATE poi_types 
SET icon = '⬗'  -- Angled shape for mining
WHERE name = 'Mining Facility';

UPDATE poi_types 
SET icon = '◊'  -- Diamond for landmark
WHERE name = 'Landmark';

-- Update NPCs category icons
UPDATE poi_types 
SET icon = '◈'  -- Diamond with dot for vendor
WHERE name = 'Vendor';

UPDATE poi_types 
SET icon = '⬡'  -- Hexagon for official
WHERE name = 'Tax Collector';

UPDATE poi_types 
SET icon = '⚔️'  -- Keep combat symbol
WHERE name = 'Swordmaster Trainer';

UPDATE poi_types 
SET icon = '⬢'  -- Filled hexagon for military
WHERE name = 'Trooper Trainer';

UPDATE poi_types 
SET icon = '◆'  -- Filled diamond for mental
WHERE name = 'Mentat Trainer';

UPDATE poi_types 
SET icon = '◈'  -- Diamond with dot for mystic
WHERE name = 'Bene Gesserit Trainer';

UPDATE poi_types 
SET icon = '⬡'  -- Hexagon for science
WHERE name = 'Planetologist Trainer';

UPDATE poi_types 
SET icon = '◊'  -- Diamond for nobility
WHERE name = 'House Representative';
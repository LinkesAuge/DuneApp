-- Update trainer POI types to use the "Trainer" category
-- This will move trainer types from "NPCs" to their own dedicated category

UPDATE poi_types 
SET category = 'Trainer'
WHERE name IN (
    'Swordmaster Trainer',
    'Trooper Trainer', 
    'Mentat Trainer',
    'Bene Gesserit Trainer',
    'Planetologist Trainer'
);

-- Verify the update
SELECT name, category FROM poi_types WHERE category = 'Trainer' ORDER BY name; 
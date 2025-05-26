/*
  # Seed POI Types

  1. Purpose
    - Populate the poi_types table with predefined categories and types
    - Define icons, colors, and default descriptions for each POI type

  2. Categories
    - Base
    - Resources
    - Locations
    - NPCs
*/

-- Base category
INSERT INTO poi_types (name, icon, color, category, default_description)
VALUES
  ('Guild Base', '🏰', '#8B5CF6', 'Base', 'Main operational base for a guild.'),
  ('Guild Outpost', '🏕️', '#8B5CF6', 'Base', 'Secondary guild operation point.'),
  ('Enemy Base', '⚔️', '#EF4444', 'Base', 'Hostile faction base. Approach with caution.'),
  ('Friendly Base', '🤝', '#10B981', 'Base', 'Allied faction base.'),
  ('Neutral Base', '🏳️', '#6B7280', 'Base', 'Neutral faction or independent settlement.');

-- Resources category
INSERT INTO poi_types (name, icon, color, category, default_description)
VALUES
  ('Spice', '🟠', '#F97316', 'Resources', 'Valuable spice deposit.'),
  ('Erythrite Crystal', '💎', '#8B5CF6', 'Resources', 'Rare purple crystal formation.'),
  ('Aluminum Ore', '🪨', '#9CA3AF', 'Resources', 'Common metal ore deposit.'),
  ('Jasmium Crystal', '💎', '#3B82F6', 'Resources', 'Valuable blue crystal formation.'),
  ('Titanium Ore', '🪨', '#6B7280', 'Resources', 'High-quality metal ore deposit.'),
  ('Stravidium Mass', '⚡', '#FBBF24', 'Resources', 'Energy-rich mineral deposit.'),
  ('Carbon Ore', '⬛', '#1F2937', 'Resources', 'Carbon-rich resource deposit.'),
  ('Brittle Bush', '🌵', '#10B981', 'Resources', 'Desert plant with medicinal properties.'),
  ('Primrose Field', '🌸', '#EC4899', 'Resources', 'Flowering desert plants with alchemical uses.'),
  ('Fuel Cell', '🔋', '#3B82F6', 'Resources', 'Salvaged power source.'),
  ('Salvaged Metal', '🔩', '#6B7280', 'Resources', 'Scrap metal from wrecks or ruins.'),
  ('Granite Stone', '🪨', '#9CA3AF', 'Resources', 'High-quality stone for construction.'),
  ('Copper Ore', '🪨', '#F59E0B', 'Resources', 'Common conductive metal deposit.'),
  ('Iron Ore', '🪨', '#6B7280', 'Resources', 'Basic metal ore deposit.'),
  ('Basalt Stone', '🪨', '#4B5563', 'Resources', 'Volcanic stone used for construction.'),
  ('Flour Sand', '🏜️', '#D97706', 'Resources', 'Fine sand used in manufacturing.');

-- Locations category
INSERT INTO poi_types (name, icon, color, category, default_description)
VALUES
  ('Control Point', '🎯', '#DC2626', 'Locations', 'Strategic location that can be captured.'),
  ('Cave', '🕳️', '#6B7280', 'Locations', 'Natural cave formation. May contain resources.'),
  ('Shipwreck', '🚢', '#9CA3AF', 'Locations', 'Crashed or abandoned vehicle. Good for salvage.'),
  ('Imperial Testing Station', '🔬', '#3B82F6', 'Locations', 'Abandoned imperial research facility.'),
  ('Trading Post', '💰', '#F59E0B', 'Locations', 'Merchant location for buying and selling goods.'),
  ('NPC Camp', '⛺', '#10B981', 'Locations', 'Small settlement of non-player characters.'),
  ('NPC Outpost', '🏕️', '#10B981', 'Locations', 'Fortified settlement of non-player characters.'),
  ('Atreides Fortress', '🦅', '#3B82F6', 'Locations', 'Major House Atreides stronghold.'),
  ('Harkonnen Fortress', '🦁', '#DC2626', 'Locations', 'Major House Harkonnen stronghold.'),
  ('Mining Facility', '⛏️', '#6B7280', 'Locations', 'Resource extraction operation.'),
  ('Landmark', '🗿', '#8B5CF6', 'Locations', 'Notable desert feature or structure.');

-- NPCs category
INSERT INTO poi_types (name, icon, color, category, default_description)
VALUES
  ('Vendor', '🛒', '#F59E0B', 'NPCs', 'Merchant selling goods and services.'),
  ('Tax Collector', '💼', '#6B7280', 'NPCs', 'Imperial representative collecting taxes.'),
  ('Swordmaster Trainer', '⚔️', '#DC2626', 'NPCs', 'Combat instructor specializing in melee weapons.'),
  ('Trooper Trainer', '🛡️', '#3B82F6', 'NPCs', 'Military tactics and weapons instructor.'),
  ('Mentat Trainer', '🧠', '#8B5CF6', 'NPCs', 'Logic and computation skills instructor.'),
  ('Bene Gesserit Trainer', '👁️', '#EC4899', 'NPCs', 'Instructor in Bene Gesserit techniques.'),
  ('Planetologist Trainer', '🌡️', '#10B981', 'NPCs', 'Desert survival and ecology instructor.'),
  ('House Representative', '👑', '#F59E0B', 'NPCs', 'Official representing one of the Great Houses.');
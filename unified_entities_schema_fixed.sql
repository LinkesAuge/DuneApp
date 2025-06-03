-- Unified Entities Schema Migration - Phase 2 Only (FIXED)
-- Handles existing tables gracefully with DROP IF EXISTS

-- Phase 2: Create new unified schema
-- Drop existing tables if they exist
DROP TABLE IF EXISTS poi_entity_links CASCADE;
DROP TABLE IF EXISTS recipe_outputs CASCADE;
DROP TABLE IF EXISTS recipe_ingredients CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS entities CASCADE;
DROP TABLE IF EXISTS tiers CASCADE;

-- Create tiers table
CREATE TABLE tiers (
  tier_number integer PRIMARY KEY,
  tier_name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create unified entities table
CREATE TABLE entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id text UNIQUE NOT NULL,  -- Secondary ID from Excel
  name text NOT NULL,
  description text,
  icon text,  -- Filename only, stored in Supabase storage
  category text NOT NULL,
  type text NOT NULL,
  subtype text,
  tier_number integer REFERENCES tiers(tier_number),
  is_global boolean DEFAULT false,
  is_schematic boolean DEFAULT false,
  field_values jsonb DEFAULT '{}',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create recipes table
CREATE TABLE recipes (
  recipe_id text PRIMARY KEY,
  produces_item_id text NOT NULL REFERENCES entities(item_id),
  crafting_time integer,
  water_amount numeric,
  created_at timestamptz DEFAULT now()
);

-- Create recipe ingredients table
CREATE TABLE recipe_ingredients (
  recipe_id text REFERENCES recipes(recipe_id) ON DELETE CASCADE,
  ingredient_item_id text REFERENCES entities(item_id),
  quantity integer NOT NULL DEFAULT 1,
  PRIMARY KEY (recipe_id, ingredient_item_id)
);

-- Create recipe outputs table
CREATE TABLE recipe_outputs (
  recipe_id text REFERENCES recipes(recipe_id) ON DELETE CASCADE,
  output_item_id text REFERENCES entities(item_id),
  quantity integer NOT NULL DEFAULT 1,
  PRIMARY KEY (recipe_id, output_item_id)
);

-- Create unified POI entity links table
CREATE TABLE poi_entity_links (
  poi_id uuid REFERENCES pois(id) ON DELETE CASCADE,
  entity_id uuid REFERENCES entities(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  notes text,
  assignment_source text,
  added_by uuid REFERENCES profiles(id),
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (poi_id, entity_id)
);

-- Create indexes for performance
CREATE INDEX idx_entities_item_id ON entities(item_id);
CREATE INDEX idx_entities_category ON entities(category);
CREATE INDEX idx_entities_type ON entities(type);
CREATE INDEX idx_entities_tier_number ON entities(tier_number);
CREATE INDEX idx_entities_is_schematic ON entities(is_schematic);
CREATE INDEX idx_entities_is_global ON entities(is_global);
CREATE INDEX idx_recipes_produces_item_id ON recipes(produces_item_id);
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient_item_id ON recipe_ingredients(ingredient_item_id);
CREATE INDEX idx_recipe_outputs_recipe_id ON recipe_outputs(recipe_id);
CREATE INDEX idx_recipe_outputs_output_item_id ON recipe_outputs(output_item_id);
CREATE INDEX idx_poi_entity_links_poi_id ON poi_entity_links(poi_id);
CREATE INDEX idx_poi_entity_links_entity_id ON poi_entity_links(entity_id);

-- Add RLS policies
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE poi_entity_links ENABLE ROW LEVEL SECURITY;

-- Entities policies
CREATE POLICY "Public entities are viewable by everyone" ON entities
  FOR SELECT USING (is_global = true);

CREATE POLICY "Users can view their own entities" ON entities
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create entities" ON entities
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own entities" ON entities
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own entities" ON entities
  FOR DELETE USING (created_by = auth.uid());

-- Recipes policies (inherit from entities)
CREATE POLICY "Users can view recipes for entities they can see" ON recipes
  FOR SELECT USING (
    produces_item_id IN (
      SELECT item_id FROM entities 
      WHERE is_global = true OR created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create recipes for their entities" ON recipes
  FOR INSERT WITH CHECK (
    produces_item_id IN (
      SELECT item_id FROM entities 
      WHERE created_by = auth.uid()
    )
  );

-- Recipe ingredients policies
CREATE POLICY "Users can view recipe ingredients they have access to" ON recipe_ingredients
  FOR SELECT USING (
    recipe_id IN (
      SELECT recipe_id FROM recipes r
      JOIN entities e ON r.produces_item_id = e.item_id
      WHERE e.is_global = true OR e.created_by = auth.uid()
    )
  );

-- Recipe outputs policies  
CREATE POLICY "Users can view recipe outputs they have access to" ON recipe_outputs
  FOR SELECT USING (
    recipe_id IN (
      SELECT recipe_id FROM recipes r
      JOIN entities e ON r.produces_item_id = e.item_id
      WHERE e.is_global = true OR e.created_by = auth.uid()
    )
  );

-- POI entity links policies (FIXED: using privacy_level instead of is_public)
CREATE POLICY "Users can view POI entity links for POIs they can see" ON poi_entity_links
  FOR SELECT USING (
    poi_id IN (
      SELECT id FROM pois 
      WHERE privacy_level = 'global'  -- FIXED: was is_public = true
      OR created_by = auth.uid()      -- FIXED: was user_id = auth.uid()
      OR poi_id IN (
        SELECT poi_id FROM poi_shares 
        WHERE shared_with_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create POI entity links for their POIs" ON poi_entity_links
  FOR INSERT WITH CHECK (
    poi_id IN (
      SELECT id FROM pois WHERE created_by = auth.uid()  -- FIXED: was user_id = auth.uid()
    )
  );

-- Enable access for authenticated users to tiers (read-only)
CREATE POLICY "Tiers are viewable by everyone" ON tiers
  FOR SELECT TO authenticated USING (true); 
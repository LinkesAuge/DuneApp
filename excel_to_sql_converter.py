import pandas as pd
import pandas as pd
import json
import uuid
from datetime import datetime


def generate_uuid():
    return str(uuid.uuid4())


def escape_sql_string(value):
    if pd.isna(value) or value is None:
        return "NULL"
    return f"'{str(value).replace(chr(39), chr(39) + chr(39))}'"


def get_safe_name(row):
    """Get a safe name value, using fallbacks if name is null"""
    if pd.notna(row.get("name")) and row["name"]:
        return escape_sql_string(row["name"])

    # Fallback 1: Use item_id if name is null
    if pd.notna(row.get("item_id")) and row["item_id"]:
        return escape_sql_string(f"Item {row['item_id']}")

    # Fallback 2: Use description first 50 chars if available
    if pd.notna(row.get("description")) and row["description"]:
        desc = str(row["description"])[:50]
        return escape_sql_string(f"{desc}...")

    # Fallback 3: Generic name
    return "'Unknown Item'"


def generate_migration_sql():
    """Generate complete SQL migration for unified entities system"""

    sql_parts = []

    # 1. Drop existing tables
    sql_parts.append("""
-- Phase 1: Drop existing tables
DROP TABLE IF EXISTS poi_items CASCADE;
DROP TABLE IF EXISTS poi_schematics CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS schematics CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS types CASCADE;
DROP TABLE IF EXISTS subtypes CASCADE;
DROP TABLE IF EXISTS poi_type_default_items CASCADE;
DROP TABLE IF EXISTS poi_type_default_schematics CASCADE;
""")

    # 2. Create new schema
    sql_parts.append("""
-- Phase 2: Create new unified schema
CREATE TABLE entities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id text UNIQUE NOT NULL,
    name text NOT NULL,
    description text,
    icon text,
    category text,
    type text,
    subtype text,
    tier_number integer,
    is_global boolean DEFAULT false,
    is_schematic boolean DEFAULT false,
    field_values jsonb DEFAULT '{}',
    created_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE tiers (
    tier_number integer PRIMARY KEY,
    tier_name text NOT NULL
);

CREATE TABLE recipes (
    recipe_id text PRIMARY KEY,
    produces_item_id text REFERENCES entities(item_id),
    crafting_time integer,
    water_amount decimal
);

CREATE TABLE recipe_ingredients (
    recipe_id text REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    ingredient_item_id text REFERENCES entities(item_id),
    quantity integer,
    PRIMARY KEY (recipe_id, ingredient_item_id)
);

CREATE TABLE recipe_outputs (
    recipe_id text REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    output_item_id text REFERENCES entities(item_id),
    quantity integer,
    PRIMARY KEY (recipe_id, output_item_id)
);

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

-- Create indexes
CREATE INDEX idx_entities_item_id ON entities(item_id);
CREATE INDEX idx_entities_category ON entities(category);
CREATE INDEX idx_entities_type ON entities(type);
CREATE INDEX idx_entities_is_schematic ON entities(is_schematic);
CREATE INDEX idx_entities_tier_number ON entities(tier_number);
CREATE INDEX idx_poi_entity_links_poi_id ON poi_entity_links(poi_id);
CREATE INDEX idx_poi_entity_links_entity_id ON poi_entity_links(entity_id);
""")

    # 3. Insert tiers data (filter out null tier names)
    tiers_df = pd.read_excel("resources/TiersReworkDb.xlsx")
    # Filter out rows with null tier_name
    tiers_df = tiers_df.dropna(subset=["tier_name"])
    sql_parts.append("\n-- Phase 3: Insert tiers data")
    sql_parts.append(
        f"-- Found {len(tiers_df)} valid tiers (filtered out null tier names)"
    )
    for _, row in tiers_df.iterrows():
        sql_parts.append(
            f"INSERT INTO tiers (tier_number, tier_name) VALUES ({row['tier_number']}, {escape_sql_string(row['tier_name'])});"
        )

    # 4. Insert entities data
    items_df = pd.read_excel("resources/ItemsDbRework.xlsx")  # Use full version
    sql_parts.append("\n-- Phase 4: Insert entities data")

    # Check for data quality issues
    null_names = items_df[items_df["name"].isna()]
    if len(null_names) > 0:
        sql_parts.append(
            f"-- WARNING: Found {len(null_names)} rows with null names, will use fallback names"
        )

    for _, row in items_df.iterrows():
        entity_id = generate_uuid()
        safe_name = get_safe_name(row)

        sql_parts.append(f"""INSERT INTO entities (
            id, item_id, name, description, icon, category, type, subtype, 
            tier_number, is_global, is_schematic, field_values
        ) VALUES (
            '{entity_id}',
            {escape_sql_string(row["item_id"])},
            {safe_name},
            {escape_sql_string(row.get("description", ""))},
            {escape_sql_string(row.get("icon", ""))},
            {escape_sql_string(row["category"])},
            {escape_sql_string(row["type"])},
            {escape_sql_string(row.get("subtype", ""))},
            {row.get("tier_number", 0)},
            {str(row.get("is_global", False)).lower()},
            {str(row.get("is_schematic", False)).lower()},
            '{{}}'
        );""")

    # 5. Insert recipes data
    try:
        recipes_df = pd.read_excel("resources/RecipesReworkDb.xlsx")
        sql_parts.append("\n-- Phase 5: Insert recipes data")
        for _, row in recipes_df.iterrows():
            water_amount = (
                "NULL" if pd.isna(row.get("water_amount")) else str(row["water_amount"])
            )
            sql_parts.append(f"""INSERT INTO recipes (
                recipe_id, produces_item_id, crafting_time, water_amount
            ) VALUES (
                {escape_sql_string(row["recipe_id"])},
                {escape_sql_string(row["produces_item_id"])},
                {row["crafting_time"]},
                {water_amount}
            );""")
    except FileNotFoundError:
        sql_parts.append("\n-- Phase 5: Recipes file not found, skipping")

    # 6. Insert recipe ingredients
    try:
        ingredients_df = pd.read_excel("resources/RecipeIngredientsReworkDb.xlsx")
        sql_parts.append("\n-- Phase 6: Insert recipe ingredients")
        for _, row in ingredients_df.iterrows():
            sql_parts.append(f"""INSERT INTO recipe_ingredients (
                recipe_id, ingredient_item_id, quantity
            ) VALUES (
                {escape_sql_string(row["recipe_id"])},
                {escape_sql_string(row["ingredient_item_id"])},
                {row["quantity"]}
            );""")
    except FileNotFoundError:
        sql_parts.append("\n-- Phase 6: Recipe ingredients file not found, skipping")

    # 7. Insert recipe outputs
    try:
        outputs_df = pd.read_excel("resources/RecipeOutputsReworkDb.xlsx")
        sql_parts.append("\n-- Phase 7: Insert recipe outputs")
        for _, row in outputs_df.iterrows():
            sql_parts.append(f"""INSERT INTO recipe_outputs (
                recipe_id, output_item_id, quantity
            ) VALUES (
                {escape_sql_string(row["recipe_id"])},
                {escape_sql_string(row["output_item_id"])},
                {row["quantity"]}
            );""")
    except FileNotFoundError:
        sql_parts.append("\n-- Phase 7: Recipe outputs file not found, skipping")

    return "\n".join(sql_parts)


if __name__ == "__main__":
    print("Generating unified entities migration SQL...")
    sql_content = generate_migration_sql()

    with open("unified_entities_migration.sql", "w", encoding="utf-8") as f:
        f.write(sql_content)

    print("Migration SQL generated: unified_entities_migration.sql")
    print("\nNext steps:")
    print("1. Review the generated SQL")
    print("2. Run it against your database")
    print("3. Update frontend TypeScript interfaces")
    print("4. Update API endpoints")
    print("5. Update frontend components")

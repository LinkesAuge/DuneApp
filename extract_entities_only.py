import pandas as pd
import uuid


def generate_uuid():
    return str(uuid.uuid4())


def safe_get_value(row, column, default=""):
    """Safely get a value from a row, handling all pandas nan variations"""
    value = row.get(column, default)

    # Handle all variations of pandas NaN
    if pd.isna(value) or value is None:
        return None

    # Convert to string and check for string representations of NaN
    str_value = str(value)
    if str_value.lower() in ["nan", "null", "none", ""]:
        return None

    return str_value


def escape_sql_string(value):
    """Safely escape SQL strings, handling all null variations"""
    if value is None:
        return "NULL"
    return f"'{str(value).replace(chr(39), chr(39) + chr(39))}'"


def get_safe_name(row):
    """Get a safe name value, using fallbacks if name is null"""
    name_val = safe_get_value(row, "name")
    if name_val:
        return escape_sql_string(name_val)

    # Fallback 1: Use item_id if name is null
    item_id = safe_get_value(row, "item_id")
    if item_id:
        return escape_sql_string(f"Item {item_id}")

    # Fallback 2: Use description first 50 chars if available
    desc_val = safe_get_value(row, "description")
    if desc_val:
        desc = desc_val[:50]
        return escape_sql_string(f"{desc}...")

    # Fallback 3: Generic name
    return "'Unknown Item'"


def get_safe_tier_number(row):
    """Safely get tier number as integer"""
    tier_val = safe_get_value(row, "tier_number", 0)
    if tier_val is None:
        return 0
    try:
        return int(float(tier_val))
    except (ValueError, TypeError):
        return 0


def get_safe_boolean(row, column):
    """Safely get boolean value"""
    val = safe_get_value(row, column, False)
    if val is None:
        return False
    if isinstance(val, bool):
        return val
    return str(val).lower() in ["true", "1", "yes", "on"]


def generate_entities_sql():
    """Generate only the entities insertion SQL with comprehensive null handling"""

    sql_parts = []

    # Insert entities data
    items_df = pd.read_excel("resources/ItemsDbRework.xlsx")
    sql_parts.append(
        "-- Insert entities data with comprehensive null handling and UPSERT"
    )

    # Check for data quality issues
    null_names = items_df[items_df["name"].isna()]
    if len(null_names) > 0:
        sql_parts.append(
            f"-- WARNING: Found {len(null_names)} rows with null names, will use fallback names"
        )

    sql_parts.append(f"-- Total entities to insert: {len(items_df)}")
    sql_parts.append("-- Using UPSERT to handle existing entries")
    sql_parts.append("")

    for i, (_, row) in enumerate(items_df.iterrows()):
        entity_id = generate_uuid()

        # Safely extract all values
        item_id = safe_get_value(row, "item_id")
        name = get_safe_name(row)
        description = safe_get_value(row, "description")
        icon = safe_get_value(row, "icon")
        category = safe_get_value(row, "category")
        type_val = safe_get_value(row, "type")
        subtype = safe_get_value(row, "subtype")
        tier_number = get_safe_tier_number(row)
        is_global = get_safe_boolean(row, "is_global")
        is_schematic = get_safe_boolean(row, "is_schematic")

        # Generate SQL with all properly escaped values
        sql_parts.append(f"""INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '{entity_id}',
    {escape_sql_string(item_id)},
    {name},
    {escape_sql_string(description)},
    {escape_sql_string(icon)},
    {escape_sql_string(category)},
    {escape_sql_string(type_val)},
    {escape_sql_string(subtype)},
    {tier_number},
    {str(is_global).lower()},
    {str(is_schematic).lower()},
    '{{}}'
) ON CONFLICT (item_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    type = EXCLUDED.type,
    subtype = EXCLUDED.subtype,
    tier_number = EXCLUDED.tier_number,
    is_global = EXCLUDED.is_global,
    is_schematic = EXCLUDED.is_schematic,
    field_values = EXCLUDED.field_values,
    updated_at = now();""")

        # Progress indicator
        if (i + 1) % 100 == 0:
            sql_parts.append(f"-- Progress: {i + 1}/{len(items_df)} entities processed")

    sql_parts.append(
        f"\n-- Completed: {len(items_df)} entities processed successfully (inserted or updated)"
    )

    return "\n".join(sql_parts)


if __name__ == "__main__":
    print("Generating entities-only SQL with comprehensive null handling...")
    sql_content = generate_entities_sql()

    with open("unified_entities.sql", "w", encoding="utf-8") as f:
        f.write(sql_content)

    print("Entities SQL generated: unified_entities.sql")
    print("This file contains UPSERT statements with comprehensive null handling.")

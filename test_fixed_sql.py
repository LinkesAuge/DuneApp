import pandas as pd
import uuid


def generate_uuid():
    return str(uuid.uuid4())


def escape_sql_string(value):
    """Safely escape SQL strings, handling pandas nan values"""
    if pd.isna(value) or value is None or str(value).lower() == "nan":
        return "NULL"
    return f"'{str(value).replace(chr(39), chr(39) + chr(39))}'"


def get_safe_name(row):
    """Get a safe name value, using fallbacks if name is null"""
    name_val = row.get("name")
    if pd.notna(name_val) and name_val and str(name_val).lower() != "nan":
        return escape_sql_string(name_val)

    # Fallback 1: Use item_id if name is null
    if pd.notna(row.get("item_id")) and row["item_id"]:
        return escape_sql_string(f"Item {row['item_id']}")

    # Fallback 2: Use description first 50 chars if available
    desc_val = row.get("description")
    if pd.notna(desc_val) and desc_val and str(desc_val).lower() != "nan":
        desc = str(desc_val)[:50]
        return escape_sql_string(f"{desc}...")

    # Fallback 3: Generic name
    return "'Unknown Item'"


def test_problematic_rows():
    """Test the specific rows that were causing issues"""

    # Load full data
    items_df = pd.read_excel("resources/ItemsDbRework.xlsx")

    # Find the problematic rows
    null_names = items_df[items_df["name"].isna()]
    print(f"Found {len(null_names)} rows with null names")

    print("\n" + "=" * 60)
    print("TESTING PROBLEMATIC ROWS:")
    print("=" * 60)

    for i, (idx, row) in enumerate(null_names.head(5).iterrows()):
        print(f"\n--- Row {i + 1} (item_id: {row.get('item_id')}) ---")
        print(f"Original name: {repr(row.get('name'))}")
        print(f"Description: {repr(row.get('description'))}")

        # Test the fixes
        safe_name = get_safe_name(row)
        print(f"Safe name: {safe_name}")

        # Generate sample SQL
        entity_id = generate_uuid()
        sample_sql = f"""INSERT INTO entities (
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
    updated_at = now();"""

        print("Generated SQL (first few lines):")
        print(sample_sql.split("\n")[0:8])

        # Check for "nan" in the SQL
        if "nan," in sample_sql or "nan\n" in sample_sql:
            print("❌ ERROR: Found 'nan' in SQL!")
        else:
            print("✅ No 'nan' found in SQL - looks good!")


if __name__ == "__main__":
    test_problematic_rows()

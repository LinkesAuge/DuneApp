import pandas as pd
import uuid


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


def test_specific_rows():
    """Test specific rows around 522 that were causing issues"""

    items_df = pd.read_excel("resources/ItemsDbRework.xlsx")

    # Test rows around 522 (0-indexed, so 521, 522, 523)
    test_indices = [520, 521, 522, 523, 524]

    print("TESTING ROWS AROUND 522:")
    print("=" * 60)

    for idx in test_indices:
        if idx < len(items_df):
            row = items_df.iloc[idx]
            print(f"\n--- Row {idx + 1} (item_id: {row.get('item_id')}) ---")

            # Test all fields individually
            fields_to_test = [
                "item_id",
                "name",
                "description",
                "icon",
                "category",
                "type",
                "subtype",
                "tier_number",
                "is_global",
                "is_schematic",
            ]

            for field in fields_to_test:
                raw_value = row.get(field)
                safe_value = safe_get_value(row, field)
                escaped_value = escape_sql_string(safe_value)

                print(
                    f"  {field:12}: {repr(raw_value):20} -> {repr(safe_value):15} -> {escaped_value}"
                )

                # Check for problematic values
                if "nan" in str(escaped_value).lower() and escaped_value != "NULL":
                    print(f"    ❌ PROBLEM: 'nan' found in {field}")

            # Test the full SQL generation
            entity_id = str(uuid.uuid4())
            item_id = safe_get_value(row, "item_id")
            name = (
                escape_sql_string(safe_get_value(row, "name"))
                if safe_get_value(row, "name")
                else escape_sql_string(f"Item {item_id}")
            )
            description = escape_sql_string(safe_get_value(row, "description"))
            icon = escape_sql_string(safe_get_value(row, "icon"))
            category = escape_sql_string(safe_get_value(row, "category"))
            type_val = escape_sql_string(safe_get_value(row, "type"))
            subtype = escape_sql_string(safe_get_value(row, "subtype"))

            tier_val = safe_get_value(row, "tier_number", 0)
            tier_number = 0
            if tier_val is not None:
                try:
                    tier_number = int(float(tier_val))
                except:
                    tier_number = 0

            is_global_val = safe_get_value(row, "is_global", False)
            is_global = False
            if is_global_val:
                is_global = str(is_global_val).lower() in ["true", "1", "yes", "on"]

            is_schematic_val = safe_get_value(row, "is_schematic", False)
            is_schematic = False
            if is_schematic_val:
                is_schematic = str(is_schematic_val).lower() in [
                    "true",
                    "1",
                    "yes",
                    "on",
                ]

            sample_sql = f"""INSERT INTO entities (
    id, item_id, name, description, icon, category, type, subtype, 
    tier_number, is_global, is_schematic, field_values
) VALUES (
    '{entity_id}',
    {escape_sql_string(item_id)},
    {name},
    {description},
    {icon},
    {category},
    {type_val},
    {subtype},
    {tier_number},
    {str(is_global).lower()},
    {str(is_schematic).lower()},
    '{{}}'
);"""

            # Check for issues in the SQL
            if "nan," in sample_sql or "\nnan" in sample_sql or " nan," in sample_sql:
                print("    ❌ ERROR: Found 'nan' in generated SQL!")
                print("    SQL preview:")
                for i, line in enumerate(sample_sql.split("\n")[:15], 1):
                    print(f"    {i:2}: {line}")
            else:
                print("    ✅ SQL looks good - no 'nan' found")


if __name__ == "__main__":
    test_specific_rows()

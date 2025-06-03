import pandas as pd


def check_data_quality():
    """Check for data quality issues in Excel files"""

    print("=" * 50)
    print("DATA QUALITY REPORT")
    print("=" * 50)

    # Check Items data
    try:
        items_df = pd.read_excel("resources/ItemsDbRework.xlsx")
        print(f"\n📊 ITEMS DATA (Total rows: {len(items_df)})")
        print("-" * 30)

        # Check for null names
        null_names = items_df[items_df["name"].isna()]
        print(f"❌ Null names: {len(null_names)} rows")
        if len(null_names) > 0:
            print("  Sample null name rows:")
            for idx, row in null_names.head(5).iterrows():
                print(
                    f"    - item_id: {row.get('item_id', 'N/A')}, description: {str(row.get('description', 'N/A'))[:50]}..."
                )

        # Check for null item_ids
        null_ids = items_df[items_df["item_id"].isna()]
        print(f"❌ Null item_ids: {len(null_ids)} rows")

        # Check for null categories
        null_categories = items_df[items_df["category"].isna()]
        print(f"❌ Null categories: {len(null_categories)} rows")

        # Check for null types
        null_types = items_df[items_df["type"].isna()]
        print(f"❌ Null types: {len(null_types)} rows")

        # Show data summary
        print(f"\n📈 DATA SUMMARY:")
        print(f"  - Unique categories: {items_df['category'].nunique()}")
        print(f"  - Unique types: {items_df['type'].nunique()}")
        print(f"  - Items vs Schematics:")
        print(f"    * Items: {len(items_df[items_df['is_schematic'] == False])}")
        print(f"    * Schematics: {len(items_df[items_df['is_schematic'] == True])}")

    except FileNotFoundError:
        print("❌ ItemsDbRework.xlsx not found!")
    except Exception as e:
        print(f"❌ Error reading items: {e}")

    # Check Tiers data
    try:
        tiers_df = pd.read_excel("resources/TiersReworkDb.xlsx")
        print(f"\n📊 TIERS DATA (Total rows: {len(tiers_df)})")
        print("-" * 30)

        null_tier_names = tiers_df[tiers_df["tier_name"].isna()]
        print(f"❌ Null tier names: {len(null_tier_names)} rows")

        print("✅ Valid tiers:")
        valid_tiers = tiers_df.dropna(subset=["tier_name"])
        for _, tier in valid_tiers.iterrows():
            print(f"    - Tier {tier['tier_number']}: {tier['tier_name']}")

    except FileNotFoundError:
        print("❌ TiersReworkDb.xlsx not found!")
    except Exception as e:
        print(f"❌ Error reading tiers: {e}")

    print(f"\n" + "=" * 50)
    print("RECOMMENDATIONS:")
    print("=" * 50)

    if len(null_names) > 0:
        print(
            "🔧 Fix null names: The script will automatically generate fallback names"
        )
        print("   - Pattern: 'Item {item_id}' or use description")

    if len(null_categories) > 0 or len(null_types) > 0:
        print("🔧 Consider cleaning null categories/types in Excel before import")

    print("✅ The updated SQL generator handles these issues automatically!")


if __name__ == "__main__":
    check_data_quality()

import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()


def verify_entities_data():
    """Verify the entities were loaded correctly"""

    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

    print("VERIFYING ENTITIES DATA:")
    print("=" * 40)

    try:
        # Get total count
        count_result = supabase.table("entities").select("*", count="exact").execute()
        total_count = count_result.count
        print(f"✅ Total entities: {total_count}")

        # Get items vs schematics count
        items_result = (
            supabase.table("entities")
            .select("*", count="exact")
            .eq("is_schematic", False)
            .execute()
        )
        schematics_result = (
            supabase.table("entities")
            .select("*", count="exact")
            .eq("is_schematic", True)
            .execute()
        )

        print(f"✅ Items: {items_result.count}")
        print(f"✅ Schematics: {schematics_result.count}")

        # Sample data
        print(f"\n📊 SAMPLE ENTITIES:")
        entities = (
            supabase.table("entities")
            .select("item_id, name, category, type, is_schematic")
            .limit(10)
            .execute()
        )

        for entity in entities.data:
            entity_type = "Schematic" if entity["is_schematic"] else "Item"
            print(
                f"  {entity['item_id']:10}: {entity['name'][:30]:30} ({entity['category']}) [{entity_type}]"
            )

        # Check categories
        print(f"\n📁 CATEGORIES:")
        categories = (
            supabase.table("entities").select("category", count="exact").execute()
        )
        category_counts = {}
        for entity in categories.data:
            cat = entity["category"]
            category_counts[cat] = category_counts.get(cat, 0) + 1

        for category, count in sorted(category_counts.items()):
            print(f"  {category:20}: {count:4} entities")

        # Check tiers
        print(f"\n🏆 TIERS:")
        tiers_result = supabase.table("tiers").select("*").execute()
        for tier in tiers_result.data:
            print(f"  Tier {tier['tier_number']}: {tier['tier_name']}")

        print(f"\n✅ Data verification completed successfully!")

    except Exception as e:
        print(f"❌ Error verifying data: {e}")


if __name__ == "__main__":
    verify_entities_data()

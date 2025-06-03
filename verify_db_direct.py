import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()


def verify_entities_data():
    """Verify the entities were loaded correctly using direct DB connection"""

    try:
        # Connect to database
        if os.getenv("SUPABASE_DB_HOST"):
            conn = psycopg2.connect(
                host=os.getenv("SUPABASE_DB_HOST"),
                port=os.getenv("SUPABASE_DB_PORT", "5432"),
                database=os.getenv("SUPABASE_DB_NAME"),
                user=os.getenv("SUPABASE_DB_USER"),
                password=os.getenv("SUPABASE_DB_PASSWORD"),
            )
        else:
            conn = psycopg2.connect(os.getenv("SUPABASE_DB_CONNECTION_STRING"))

        cursor = conn.cursor()

        print("VERIFYING ENTITIES DATA:")
        print("=" * 40)

        # Get total count
        cursor.execute("SELECT COUNT(*) FROM entities;")
        total_count = cursor.fetchone()[0]
        print(f"✅ Total entities: {total_count}")

        # Get items vs schematics count
        cursor.execute("SELECT COUNT(*) FROM entities WHERE is_schematic = false;")
        items_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM entities WHERE is_schematic = true;")
        schematics_count = cursor.fetchone()[0]

        print(f"✅ Items: {items_count}")
        print(f"✅ Schematics: {schematics_count}")

        # Sample data
        print(f"\n📊 SAMPLE ENTITIES:")
        cursor.execute(
            "SELECT item_id, name, category, type, is_schematic FROM entities LIMIT 10;"
        )
        entities = cursor.fetchall()

        for entity in entities:
            entity_type = "Schematic" if entity[4] else "Item"
            name = entity[1][:30] if entity[1] else "No Name"
            print(f"  {entity[0]:10}: {name:30} ({entity[2]}) [{entity_type}]")

        # Check categories
        print(f"\n📁 CATEGORIES:")
        cursor.execute(
            "SELECT category, COUNT(*) FROM entities GROUP BY category ORDER BY category;"
        )
        categories = cursor.fetchall()

        for category, count in categories:
            print(f"  {category:20}: {count:4} entities")

        # Check tiers
        print(f"\n🏆 TIERS:")
        cursor.execute("SELECT tier_number, tier_name FROM tiers ORDER BY tier_number;")
        tiers = cursor.fetchall()
        for tier in tiers:
            print(f"  Tier {tier[0]}: {tier[1]}")

        # Check for any issues
        print(f"\n🔍 DATA QUALITY CHECK:")
        cursor.execute("SELECT COUNT(*) FROM entities WHERE name IS NULL;")
        null_names = cursor.fetchone()[0]
        print(f"  Entities with null names: {null_names}")

        cursor.execute("SELECT COUNT(*) FROM entities WHERE item_id IS NULL;")
        null_ids = cursor.fetchone()[0]
        print(f"  Entities with null item_ids: {null_ids}")

        cursor.execute("SELECT COUNT(*) FROM entities WHERE category IS NULL;")
        null_categories = cursor.fetchone()[0]
        print(f"  Entities with null categories: {null_categories}")

        print(f"\n✅ Data verification completed successfully!")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"❌ Error verifying data: {e}")


if __name__ == "__main__":
    verify_entities_data()

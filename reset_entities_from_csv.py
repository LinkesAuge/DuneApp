#!/usr/bin/env python3
"""
Reset Entities Database Script
=============================

This script resets the entities, categories, and types tables in the Supabase database
with new data from CSV files in the resources/db/ directory.

CSV Files Required:
- resources/db/categories.csv
- resources/db/types.csv
- resources/db/entities.csv

The script will:
1. Delete all existing data from entities, types, and categories tables
2. Import new data from CSV files
3. Generate missing columns for entities (id, timestamps, etc.)
4. Handle data quality issues and type conversions

Usage:
    python reset_entities_from_csv.py
"""

import psycopg2
import pandas as pd
import os
import uuid
from datetime import datetime
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()


def get_database_connection():
    """Establish connection to Supabase database"""

    # Try individual parameters first
    DB_HOST = os.getenv("SUPABASE_DB_HOST")
    DB_PORT = os.getenv("SUPABASE_DB_PORT", "5432")
    DB_NAME = os.getenv("SUPABASE_DB_NAME")
    DB_USER = os.getenv("SUPABASE_DB_USER")
    DB_PASSWORD = os.getenv("SUPABASE_DB_PASSWORD")

    try:
        if DB_HOST and DB_NAME and DB_USER and DB_PASSWORD:
            conn = psycopg2.connect(
                host=DB_HOST,
                port=DB_PORT,
                database=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD,
            )
        else:
            # Use connection string if individual params not provided
            CONNECTION_STRING = os.getenv("SUPABASE_DB_CONNECTION_STRING")
            if not CONNECTION_STRING:
                raise ValueError(
                    "Database connection parameters not found in environment variables"
                )
            conn = psycopg2.connect(CONNECTION_STRING)

        print("✅ Connected to database successfully")
        return conn

    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise


def read_csv_files():
    """Read and validate CSV files"""

    csv_files = {
        "categories": "resources/db/categories.csv",
        "types": "resources/db/types.csv",
        "entities": "resources/db/entities.csv",
    }

    data = {}

    for table_name, file_path in csv_files.items():
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"CSV file not found: {file_path}")

        print(f"📖 Reading {file_path}...")

        # Read CSV with semicolon delimiter
        df = pd.read_csv(file_path, delimiter=";", dtype=str)

        # Clean up any extra whitespace
        df = df.applymap(lambda x: x.strip() if isinstance(x, str) else x)

        # Handle NULL strings
        df = df.replace(["NULL", "null", ""], None)

        print(f"   Found {len(df)} rows")
        data[table_name] = df

    return data


def validate_and_transform_data(data):
    """Validate and transform the CSV data for database insertion"""

    print("🔍 Validating and transforming data...")

    # Transform categories
    categories_df = data["categories"].copy()
    print(f"   Categories: {len(categories_df)} rows")

    # Transform types
    types_df = data["types"].copy()
    print(f"   Types: {len(types_df)} rows")

    # Transform entities (most complex)
    entities_df = data["entities"].copy()

    # Remove empty rows
    entities_df = entities_df.dropna(subset=["item_id", "name"])

    # Generate missing columns for entities
    current_timestamp = datetime.now().isoformat()

    # Add missing required columns
    entities_df["id"] = [str(uuid.uuid4()) for _ in range(len(entities_df))]
    entities_df["icon_image_id"] = None
    entities_df["icon_fallback"] = entities_df["icon"]  # Use icon as fallback
    entities_df["field_values"] = "{}"  # Empty JSON object
    entities_df["created_by"] = None  # System import
    entities_df["created_at"] = current_timestamp
    entities_df["updated_at"] = current_timestamp

    # Convert data types
    entities_df["category_id"] = pd.to_numeric(
        entities_df["category_id"], errors="coerce"
    ).astype("Int64")
    entities_df["type_id"] = pd.to_numeric(
        entities_df["type_id"], errors="coerce"
    ).astype("Int64")
    entities_df["tier_number"] = pd.to_numeric(
        entities_df["tier_number"], errors="coerce"
    ).astype("Int64")

    # Convert boolean fields
    entities_df["is_schematic"] = entities_df["is_schematic"].map(
        {"TRUE": True, "FALSE": False, True: True, False: False}
    )
    entities_df["is_global"] = entities_df["is_global"].map(
        {"TRUE": True, "FALSE": False, True: True, False: False}
    )

    # Fill any NaN boolean values with False
    entities_df["is_schematic"] = entities_df["is_schematic"].fillna(False)
    entities_df["is_global"] = entities_df["is_global"].fillna(False)

    print(f"   Entities: {len(entities_df)} rows (after cleaning)")

    # Validate required fields
    missing_item_id = entities_df["item_id"].isna().sum()
    missing_name = entities_df["name"].isna().sum()
    missing_category = entities_df["category_id"].isna().sum()
    missing_type = entities_df["type_id"].isna().sum()

    if missing_item_id > 0:
        print(f"⚠️  Warning: {missing_item_id} entities missing item_id")
    if missing_name > 0:
        print(f"⚠️  Warning: {missing_name} entities missing name")
    if missing_category > 0:
        print(f"⚠️  Warning: {missing_category} entities missing category_id")
    if missing_type > 0:
        print(f"⚠️  Warning: {missing_type} entities missing type_id")

    return {"categories": categories_df, "types": types_df, "entities": entities_df}


def clear_existing_data(conn):
    """Clear existing data from tables in correct order and remove subtype structure"""

    print("🗑️  Clearing existing data and removing subtype structure...")

    cursor = conn.cursor()

    try:
        # Delete data in order to respect foreign key constraints
        tables = ["entities", "types", "categories"]

        for table in tables:
            print(f"   Deleting from {table}...")
            cursor.execute(f"DELETE FROM {table}")
            deleted_count = cursor.rowcount
            print(f"   Deleted {deleted_count} rows from {table}")

        # Remove subtype structure entirely
        print("🔧 Removing subtype structure...")

        # Drop subtypes table if it exists
        cursor.execute("DROP TABLE IF EXISTS subtypes CASCADE")
        print("   Dropped subtypes table")

        # Remove subtype_id column from entities table if it exists
        cursor.execute("""
            ALTER TABLE entities 
            DROP COLUMN IF EXISTS subtype_id CASCADE
        """)
        print("   Removed subtype_id column from entities table")

        print("✅ All existing data cleared and subtype structure removed")

    except Exception as e:
        print(f"❌ Error clearing data: {e}")
        raise
    finally:
        cursor.close()


def insert_categories(conn, categories_df):
    """Insert categories data"""

    print("📥 Inserting categories...")

    cursor = conn.cursor()

    try:
        insert_sql = """
        INSERT INTO categories (id, name, icon, sort_order, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        """

        current_timestamp = datetime.now().isoformat()

        for _, row in categories_df.iterrows():
            cursor.execute(
                insert_sql,
                (
                    int(row["id"]),
                    row["name"],
                    row["icon"],
                    int(row["sort_order"]),
                    current_timestamp,
                    current_timestamp,
                ),
            )

        print(f"✅ Inserted {len(categories_df)} categories")

    except Exception as e:
        print(f"❌ Error inserting categories: {e}")
        raise
    finally:
        cursor.close()


def insert_types(conn, types_df):
    """Insert types data"""

    print("📥 Inserting types...")

    cursor = conn.cursor()

    try:
        insert_sql = """
        INSERT INTO types (id, name, category_id, icon, sort_order, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """

        current_timestamp = datetime.now().isoformat()

        for _, row in types_df.iterrows():
            cursor.execute(
                insert_sql,
                (
                    int(row["id"]),
                    row["name"],
                    int(row["category_id"]),
                    row["icon"],
                    int(row["sort_order"]),
                    current_timestamp,
                    current_timestamp,
                ),
            )

        print(f"✅ Inserted {len(types_df)} types")

    except Exception as e:
        print(f"❌ Error inserting types: {e}")
        raise
    finally:
        cursor.close()


def insert_entities(conn, entities_df):
    """Insert entities data"""

    print("📥 Inserting entities...")

    cursor = conn.cursor()

    try:
        insert_sql = """
        INSERT INTO entities (
            id, item_id, name, description, icon, icon_image_id, icon_fallback,
            category_id, type_id, tier_number, is_global, is_schematic,
            field_values, created_by, created_at, updated_at
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
        """

        batch_size = 100
        total_rows = len(entities_df)

        for i in range(0, total_rows, batch_size):
            batch_df = entities_df.iloc[i : i + batch_size]

            for _, row in batch_df.iterrows():
                cursor.execute(
                    insert_sql,
                    (
                        row["id"],
                        row["item_id"],
                        row["name"],
                        row["description"],
                        row["icon"],
                        row["icon_image_id"],
                        row["icon_fallback"],
                        int(row["category_id"])
                        if pd.notna(row["category_id"])
                        else None,
                        int(row["type_id"]) if pd.notna(row["type_id"]) else None,
                        int(row["tier_number"])
                        if pd.notna(row["tier_number"])
                        else None,
                        bool(row["is_global"]),
                        bool(row["is_schematic"]),
                        row["field_values"],
                        row["created_by"],
                        row["created_at"],
                        row["updated_at"],
                    ),
                )

            print(
                f"   Inserted batch {i // batch_size + 1}/{(total_rows + batch_size - 1) // batch_size} ({min(i + batch_size, total_rows)}/{total_rows} rows)"
            )

        print(f"✅ Inserted {total_rows} entities")

    except Exception as e:
        print(f"❌ Error inserting entities: {e}")
        raise
    finally:
        cursor.close()


def verify_import(conn):
    """Verify the import was successful"""

    print("🔍 Verifying import...")

    cursor = conn.cursor()

    try:
        # Count records in each table
        tables = ["categories", "types", "entities"]

        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"   {table}: {count} rows")

        # Sample some data
        cursor.execute(
            "SELECT name, category_id, type_id, tier_number FROM entities LIMIT 5"
        )
        sample_entities = cursor.fetchall()

        print("\n📊 Sample entities:")
        for entity in sample_entities:
            print(
                f"   {entity[0]} (category: {entity[1]}, type: {entity[2]}, tier: {entity[3]})"
            )

        print("✅ Import verification completed")

    except Exception as e:
        print(f"❌ Error during verification: {e}")
        raise
    finally:
        cursor.close()


def main():
    """Main execution function"""

    print("🚀 Starting Entity Database Reset")
    print("=" * 50)

    try:
        # Read CSV files
        data = read_csv_files()

        # Validate and transform data
        transformed_data = validate_and_transform_data(data)

        # Get database connection
        conn = get_database_connection()

        try:
            # Start transaction
            conn.autocommit = False

            # Clear existing data
            clear_existing_data(conn)

            # Insert new data in correct order
            insert_categories(conn, transformed_data["categories"])
            insert_types(conn, transformed_data["types"])
            insert_entities(conn, transformed_data["entities"])

            # Verify import
            verify_import(conn)

            # Commit transaction
            conn.commit()
            print("\n🎉 Database reset completed successfully!")

        except Exception as e:
            # Rollback on error
            conn.rollback()
            print(f"\n❌ Transaction rolled back due to error: {e}")
            raise

        finally:
            conn.close()
            print("🔌 Database connection closed")

    except Exception as e:
        print(f"\n💥 Script failed: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())

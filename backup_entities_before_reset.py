#!/usr/bin/env python3
"""
Backup Entities Database Script
===============================

This script creates a backup of the current entities, categories, and types tables
before performing a reset operation.

The backup will be saved as CSV files with timestamps in the backups/ directory.

Usage:
    python backup_entities_before_reset.py
"""

import psycopg2
import pandas as pd
import os
from datetime import datetime
from dotenv import load_dotenv

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


def create_backup_directory():
    """Create backup directory if it doesn't exist"""

    backup_dir = "backups"
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
        print(f"📁 Created backup directory: {backup_dir}")
    else:
        print(f"📁 Using existing backup directory: {backup_dir}")

    return backup_dir


def backup_table(conn, table_name, backup_dir, timestamp):
    """Backup a single table to CSV"""

    print(f"💾 Backing up {table_name}...")

    cursor = conn.cursor()

    try:
        # Get all data from table
        cursor.execute(f"SELECT * FROM {table_name}")

        # Get column names
        columns = [desc[0] for desc in cursor.description]

        # Fetch all data
        data = cursor.fetchall()

        if not data:
            print(f"⚠️  Table {table_name} is empty, creating empty backup file")
            data = []

        # Create DataFrame
        df = pd.DataFrame(data, columns=columns)

        # Create backup filename
        filename = f"{table_name}_backup_{timestamp}.csv"
        filepath = os.path.join(backup_dir, filename)

        # Save to CSV
        df.to_csv(filepath, index=False, sep=";")

        print(f"   Saved {len(df)} rows to {filepath}")
        return filepath

    except Exception as e:
        print(f"❌ Error backing up {table_name}: {e}")
        raise
    finally:
        cursor.close()


def create_restore_script(backup_files, timestamp):
    """Create a restore script for the backup"""

    restore_script = f"""#!/usr/bin/env python3
'''
Restore Script for Backup {timestamp}
====================================

This script restores the database from backup files created on {timestamp}.

Backup files:
{chr(10).join([f"- {os.path.basename(f)}" for f in backup_files])}

To restore:
1. Ensure your .env file has the correct database credentials
2. Run: python restore_from_backup_{timestamp.replace(":", "-").replace(" ", "_")}.py

WARNING: This will delete all current data and restore from backup!
'''

import psycopg2
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

def get_database_connection():
    DB_HOST = os.getenv("SUPABASE_DB_HOST")
    DB_PORT = os.getenv("SUPABASE_DB_PORT", "5432")
    DB_NAME = os.getenv("SUPABASE_DB_NAME")
    DB_USER = os.getenv("SUPABASE_DB_USER")
    DB_PASSWORD = os.getenv("SUPABASE_DB_PASSWORD")
    
    if DB_HOST and DB_NAME and DB_USER and DB_PASSWORD:
        return psycopg2.connect(
            host=DB_HOST, port=DB_PORT, database=DB_NAME,
            user=DB_USER, password=DB_PASSWORD
        )
    else:
        CONNECTION_STRING = os.getenv("SUPABASE_DB_CONNECTION_STRING")
        return psycopg2.connect(CONNECTION_STRING)

def main():
    print("🔄 Restoring from backup {timestamp}")
    
    conn = get_database_connection()
    
    try:
        conn.autocommit = False
        cursor = conn.cursor()
        
        # Clear existing data
        print("🗑️  Clearing existing data...")
        cursor.execute("DELETE FROM entities")
        cursor.execute("DELETE FROM types")
        cursor.execute("DELETE FROM categories")
        
        # Restore in order
        backup_files = {backup_files}
        
        for table, file in backup_files.items():
            print(f"📥 Restoring {{table}}...")
            df = pd.read_csv(file, sep=';')
            
            if len(df) > 0:
                # Build INSERT statement based on table
                columns = df.columns.tolist()
                placeholders = ', '.join(['%s'] * len(columns))
                insert_sql = f"INSERT INTO {{table}} ({{', '.join(columns)}}) VALUES ({{placeholders}})"
                
                for _, row in df.iterrows():
                    cursor.execute(insert_sql, tuple(row))
            
            print(f"   Restored {{len(df)}} rows")
        
        conn.commit()
        print("✅ Restore completed successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Restore failed: {{e}}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    main()
"""

    script_filename = (
        f"restore_from_backup_{timestamp.replace(':', '-').replace(' ', '_')}.py"
    )

    with open(script_filename, "w") as f:
        f.write(restore_script)

    print(f"📜 Created restore script: {script_filename}")
    return script_filename


def main():
    """Main execution function"""

    print("💾 Starting Entity Database Backup")
    print("=" * 50)

    try:
        # Create timestamp for backup
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        print(f"🕒 Backup timestamp: {timestamp}")

        # Create backup directory
        backup_dir = create_backup_directory()

        # Get database connection
        conn = get_database_connection()

        try:
            # Backup each table
            tables = ["categories", "types", "entities"]
            backup_files = {}

            for table in tables:
                filepath = backup_table(conn, table, backup_dir, timestamp)
                backup_files[table] = filepath

            # Create restore script
            restore_script = create_restore_script(backup_files, timestamp)

            print("\n🎉 Backup completed successfully!")
            print(f"\nBackup files created:")
            for table, filepath in backup_files.items():
                print(f"  - {filepath}")
            print(f"\nRestore script: {restore_script}")

            print(f"\n📝 To restore this backup later:")
            print(f"   python {restore_script}")

        finally:
            conn.close()
            print("🔌 Database connection closed")

    except Exception as e:
        print(f"\n💥 Backup failed: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())

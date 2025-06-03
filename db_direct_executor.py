import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def execute_sql_file(file_path):
    """Execute a SQL file directly against Supabase database"""

    # Database connection parameters
    # You'll need to set these in your .env file or modify directly
    DB_HOST = os.getenv("SUPABASE_DB_HOST")
    DB_PORT = os.getenv("SUPABASE_DB_PORT", "5432")
    DB_NAME = os.getenv("SUPABASE_DB_NAME")
    DB_USER = os.getenv("SUPABASE_DB_USER")
    DB_PASSWORD = os.getenv("SUPABASE_DB_PASSWORD")

    # Alternative: Direct connection string
    # CONNECTION_STRING = os.getenv('SUPABASE_DB_CONNECTION_STRING')

    try:
        # Connect to database
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

        print(f"Connected to database successfully")

        # Read SQL file
        print(f"Reading SQL file: {file_path}")
        with open(file_path, "r", encoding="utf-8") as file:
            sql_content = file.read()

        # Execute SQL
        cursor = conn.cursor()
        print("Executing SQL...")

        # Split by semicolons and execute each statement
        statements = [stmt.strip() for stmt in sql_content.split(";") if stmt.strip()]

        for i, statement in enumerate(statements):
            try:
                cursor.execute(statement)
                if i % 100 == 0:  # Progress indicator every 100 statements
                    print(f"Executed {i + 1}/{len(statements)} statements...")
            except Exception as e:
                print(f"Error on statement {i + 1}: {e}")
                print(f"Statement: {statement[:100]}...")
                # Decide whether to continue or stop
                response = input("Continue? (y/n): ")
                if response.lower() != "y":
                    break

        # Commit changes
        conn.commit()
        print("All statements executed successfully!")

        # Close connections
        cursor.close()
        conn.close()
        print("Database connection closed")

    except Exception as e:
        print(f"Error: {e}")
        if "conn" in locals():
            conn.rollback()
            conn.close()


def get_connection_info():
    """Helper to show how to get Supabase connection details"""
    print("""
To get your Supabase connection details:

1. Go to your Supabase dashboard
2. Navigate to Settings > Database
3. Look for "Connection parameters" or "Connection string"

You'll need either:
Option A - Individual parameters:
- Host: Usually something like db.xxxxxxxxxxxxx.supabase.co
- Port: 5432
- Database: postgres
- User: postgres
- Password: Your database password

Option B - Connection string:
- Full connection string like: postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

Add these to your .env file as:
SUPABASE_DB_HOST=your_host
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your_password

OR

SUPABASE_DB_CONNECTION_STRING=postgresql://postgres:password@host:5432/postgres
""")


if __name__ == "__main__":
    print("Supabase Direct SQL Executor")
    print("=" * 30)

    # Check if .env exists
    if not os.path.exists(".env"):
        print("No .env file found!")
        get_connection_info()
        exit(1)

    # Check if SQL file exists
    sql_file = "unified_entities.sql"
    if not os.path.exists(sql_file):
        print(f"SQL file '{sql_file}' not found!")
        print("Available SQL files:")
        for file in os.listdir("."):
            if file.endswith(".sql"):
                print(f"  - {file}")

        sql_file = input("Enter SQL file name: ").strip()
        if not os.path.exists(sql_file):
            print(f"File '{sql_file}' not found!")
            exit(1)

    # Execute the SQL file
    execute_sql_file(sql_file)

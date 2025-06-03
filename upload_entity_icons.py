"""
Script to upload entity icons to Supabase storage.
Run this after placing all icon files in the public/assets/entity-icons/ directory.
"""

import os
import mimetypes
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def upload_entity_icons():
    """Upload all entity icons from local directory to Supabase storage"""

    # Initialize Supabase client
    supabase_url = os.getenv("VITE_SUPABASE_URL")
    supabase_key = os.getenv(
        "VITE_SUPABASE_ANON_KEY"
    )  # Use service role key for admin operations

    if not supabase_url or not supabase_key:
        print(
            "Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env file"
        )
        return

    supabase: Client = create_client(supabase_url, supabase_key)

    # Directory containing the icons
    icons_dir = "public/assets/entity-icons"

    if not os.path.exists(icons_dir):
        print(f"Error: Icons directory {icons_dir} not found")
        print("Please place your entity icon files in public/assets/entity-icons/")
        return

    uploaded_count = 0
    failed_count = 0

    # Upload each icon file
    for filename in os.listdir(icons_dir):
        if filename.lower().endswith((".png", ".jpg", ".jpeg", ".webp", ".svg")):
            file_path = os.path.join(icons_dir, filename)

            try:
                # Read the file
                with open(file_path, "rb") as f:
                    file_data = f.read()

                # Determine content type
                content_type, _ = mimetypes.guess_type(filename)
                if not content_type:
                    content_type = "application/octet-stream"

                # Upload to Supabase storage
                storage_path = f"entity-icons/{filename}"

                response = supabase.storage.from_("screenshots").upload(
                    path=storage_path,
                    file=file_data,
                    file_options={
                        "content-type": content_type,
                        "upsert": True,  # Overwrite if exists
                    },
                )

                if response:
                    print(f"✅ Uploaded: {filename}")
                    uploaded_count += 1
                else:
                    print(f"❌ Failed to upload: {filename}")
                    failed_count += 1

            except Exception as e:
                print(f"❌ Error uploading {filename}: {str(e)}")
                failed_count += 1

    print(f"\n📊 Upload Summary:")
    print(f"   ✅ Successfully uploaded: {uploaded_count} files")
    print(f"   ❌ Failed uploads: {failed_count} files")

    if uploaded_count > 0:
        print(f"\n🔗 Icons are now available at:")
        print(
            f"   {supabase_url}/storage/v1/object/public/screenshots/entity-icons/[filename]"
        )


if __name__ == "__main__":
    print("🚀 Starting entity icons upload to Supabase storage...")
    upload_entity_icons()
    print("✨ Upload process completed!")

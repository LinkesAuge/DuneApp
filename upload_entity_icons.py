#!/usr/bin/env python3
"""
Entity Icons Upload Script
Uploads entity icons from public/assets/entity-icons/ to Supabase Storage
via the shared_images system and updates entity records to reference them.
"""

import os
import sys
import json
from pathlib import Path
from supabase import create_client, Client
from typing import Dict, List, Optional
import uuid
from datetime import datetime

# Supabase configuration
SUPABASE_URL = "https://urgmimdahjhaecwepsov.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZ21pbWRhaGpoYWVjd2Vwc292Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTQxMjU2NCwiZXhwIjoyMDUwOTg4NTY0fQ.Aqq1c2hSfj_cjwvM7T_Y1bZ1N8RJzRPNNHrCqyOw-Es"  # Service role key needed for storage upload

# Storage configuration
STORAGE_BUCKET = "screenshots"  # Use existing bucket
STORAGE_PATH = "shared-images/"  # Shared images subfolder
LOCAL_ICONS_PATH = "public/assets/entity-icons/"


def init_supabase() -> Client:
    """Initialize Supabase client"""
    try:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"❌ Failed to initialize Supabase client: {e}")
        sys.exit(1)


def get_local_icons() -> Dict[str, str]:
    """Get list of local icon files"""
    icons_path = Path(LOCAL_ICONS_PATH)
    if not icons_path.exists():
        print(f"❌ Icons directory not found: {LOCAL_ICONS_PATH}")
        sys.exit(1)

    icons = {}
    for file_path in icons_path.glob("*.webp"):
        icons[file_path.name] = str(file_path)

    print(f"📁 Found {len(icons)} icon files in {LOCAL_ICONS_PATH}")
    return icons


def get_entities_with_icons(supabase: Client) -> List[Dict]:
    """Get entities that have icon column values"""
    try:
        response = (
            supabase.table("entities")
            .select("id, name, icon, category, type, is_schematic, icon_image_id")
            .neq("icon", None)
            .execute()
        )
        entities = response.data
        print(f"🗄️  Found {len(entities)} entities with icon references")
        return entities
    except Exception as e:
        print(f"❌ Failed to fetch entities: {e}")
        return []


def check_existing_shared_image(supabase: Client, filename: str) -> Optional[str]:
    """Check if shared image already exists for this filename"""
    try:
        response = (
            supabase.table("shared_images")
            .select("id")
            .eq("filename", filename)
            .eq("is_active", True)
            .execute()
        )
        if response.data and len(response.data) > 0:
            return response.data[0]["id"]
        return None
    except Exception as e:
        print(f"❌ Error checking existing shared image: {e}")
        return None


def upload_as_shared_image(
    supabase: Client, local_path: str, filename: str
) -> Optional[str]:
    """Upload icon as shared image and return the shared image ID"""
    try:
        # Generate unique storage path
        timestamp = int(datetime.now().timestamp())
        random_suffix = str(uuid.uuid4())[:8]
        file_ext = filename.split(".")[-1]
        storage_filename = f"{timestamp}-{random_suffix}.{file_ext}"
        storage_path = f"{STORAGE_PATH}{storage_filename}"

        # Read file
        with open(local_path, "rb") as f:
            file_data = f.read()

        # Upload to storage
        upload_result = supabase.storage.from_(STORAGE_BUCKET).upload(
            path=storage_path,
            file=file_data,
            file_options={"content-type": "image/webp"},
        )

        if not upload_result:
            print(f"❌ Failed to upload {storage_path}")
            return None

        # Get public URL
        public_url_data = supabase.storage.from_(STORAGE_BUCKET).get_public_url(
            storage_path
        )
        public_url = public_url_data

        # Get file size
        file_size = len(file_data)

        # Create shared_images record
        shared_image_data = {
            "filename": filename,
            "storage_path": storage_path,
            "image_url": public_url,
            "image_type": "entity-icon",
            "file_size": file_size,
            "mime_type": "image/webp",
            "width": None,  # We don't have image dimensions
            "height": None,
            "tags": ["entity", "icon", "game-asset"],
            "description": f"Entity icon: {filename}",
            "is_active": True,
        }

        response = supabase.table("shared_images").insert(shared_image_data).execute()

        if response.data and len(response.data) > 0:
            return response.data[0]["id"]
        else:
            print(f"❌ Failed to create shared image record for {filename}")
            return None

    except Exception as e:
        print(f"❌ Upload error for {filename}: {e}")
        return None


def update_entity_icon_reference(
    supabase: Client, entity_id: str, shared_image_id: str
) -> bool:
    """Update entity record with shared image ID"""
    try:
        response = (
            supabase.table("entities")
            .update({"icon_image_id": shared_image_id})
            .eq("id", entity_id)
            .execute()
        )

        return len(response.data) > 0
    except Exception as e:
        print(f"❌ Failed to update entity {entity_id}: {e}")
        return False


def main():
    print("🚀 Starting Entity Icons Upload to Shared Images System")
    print("=" * 60)

    # Initialize
    supabase = init_supabase()
    local_icons = get_local_icons()
    entities = get_entities_with_icons(supabase)

    if not entities:
        print("❌ No entities found with icon references")
        return

    # Track results
    uploaded_count = 0
    updated_count = 0
    skipped_existing = 0
    failed_uploads = []
    failed_updates = []

    print(f"\n📤 Starting upload process...")

    for entity in entities:
        entity_id = entity["id"]
        icon_filename = entity["icon"]
        entity_name = entity["name"]
        existing_icon_id = entity.get("icon_image_id")

        print(f"\n🔄 Processing: {entity_name}")
        print(f"   Icon file: {icon_filename}")

        # Skip if entity already has an icon_image_id
        if existing_icon_id:
            print(f"   ⏭️  Already has icon_image_id: {existing_icon_id}")
            skipped_existing += 1
            continue

        # Check if local icon exists
        if icon_filename not in local_icons:
            print(f"   ⚠️  Local icon file not found: {icon_filename}")
            continue

        # Check if shared image already exists for this filename
        existing_shared_id = check_existing_shared_image(supabase, icon_filename)

        shared_image_id = None

        if existing_shared_id:
            print(f"   ♻️  Using existing shared image: {existing_shared_id}")
            shared_image_id = existing_shared_id
        else:
            # Upload as new shared image
            local_path = local_icons[icon_filename]
            print(f"   📤 Uploading as shared image...")
            shared_image_id = upload_as_shared_image(
                supabase, local_path, icon_filename
            )

            if shared_image_id:
                uploaded_count += 1
                print(f"   ✅ Created shared image: {shared_image_id}")
            else:
                failed_uploads.append(entity_name)
                print(f"   ❌ Upload failed")
                continue

        # Update entity record
        if shared_image_id:
            if update_entity_icon_reference(supabase, entity_id, shared_image_id):
                updated_count += 1
                print(f"   ✅ Updated entity record")
            else:
                failed_updates.append(entity_name)
                print(f"   ❌ Failed to update entity record")

    # Summary
    print("\n" + "=" * 60)
    print("📊 UPLOAD SUMMARY")
    print("=" * 60)
    print(f"✅ New shared images created: {uploaded_count}")
    print(f"✅ Entities updated: {updated_count}")
    print(f"⏭️  Entities already had icons: {skipped_existing}")
    print(f"❌ Failed uploads: {len(failed_uploads)}")
    print(f"❌ Failed updates: {len(failed_updates)}")

    if failed_uploads:
        print(f"\n❌ Failed uploads:")
        for name in failed_uploads:
            print(f"   - {name}")

    if failed_updates:
        print(f"\n❌ Failed updates:")
        for name in failed_updates:
            print(f"   - {name}")

    print(f"\n🎉 Entity icons upload completed!")
    print(f"Icons are now available through the shared images system!")


if __name__ == "__main__":
    main()

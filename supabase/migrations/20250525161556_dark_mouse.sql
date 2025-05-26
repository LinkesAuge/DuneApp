/*
  # Create POI Icons Storage Bucket

  1. Storage Setup
    - Creates 'poi-icons' storage bucket for storing POI type icons
    - Sets up public access policy for reading icons
    - Sets up authenticated access policy for uploading icons

  2. Security
    - Enables public read access to all files in the bucket
    - Restricts write access to authenticated users only
    - Sets maximum file size to 1MB
*/

-- Enable storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "storage";

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('poi-icons', 'poi-icons', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy for public read access
CREATE POLICY "POI icons are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'poi-icons');

-- Set up storage policy for authenticated uploads
CREATE POLICY "Authenticated users can upload POI icons"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'poi-icons' 
  AND length(decode(CASE WHEN octet_length("storage"."objects"."content") > 0 THEN "storage"."objects"."content"
    ELSE '' END, 'base64')) <= 1048576 -- 1MB file size limit
);

-- Set up storage policy for authenticated users to update their own uploads
CREATE POLICY "Authenticated users can update their POI icons"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'poi-icons')
WITH CHECK (bucket_id = 'poi-icons');

-- Set up storage policy for authenticated users to delete their own uploads
CREATE POLICY "Authenticated users can delete their POI icons"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'poi-icons');
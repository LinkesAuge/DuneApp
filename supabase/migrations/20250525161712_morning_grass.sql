/*
  # Create storage bucket for POI icons
  
  1. Changes
    - Create storage bucket for POI icons
    - Set up public read access
    - Allow authenticated users to upload/manage icons
    
  2. Security
    - Public read access to all icons
    - Authenticated users can upload and manage icons
    - File type and size restrictions
*/

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
  AND (LOWER(storage.extension(name)) IN ('png', 'jpg', 'jpeg', 'webp'))
  AND (LENGTH(name) < 255)
);

-- Set up storage policy for authenticated users to update their own uploads
CREATE POLICY "Authenticated users can update their POI icons"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'poi-icons' AND owner = auth.uid())
WITH CHECK (bucket_id = 'poi-icons' AND owner = auth.uid());

-- Set up storage policy for authenticated users to delete their own uploads
CREATE POLICY "Authenticated users can delete their POI icons"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'poi-icons' AND owner = auth.uid());
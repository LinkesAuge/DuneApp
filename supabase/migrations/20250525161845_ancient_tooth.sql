/*
  # Set up storage bucket for POI icons
  
  1. Changes
    - Create storage bucket for POI icons if it doesn't exist
    - Set up public read access policy
    - Set up authenticated user upload policy
    - Set up policies for updating and deleting own uploads
    
  2. Security
    - Public read access to all icons
    - Authenticated users can upload icons
    - Users can only modify their own uploads
*/

-- Create the storage bucket if it doesn't exist
DO $$ 
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('poi-icons', 'poi-icons', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "POI icons are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload POI icons" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their POI icons" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their POI icons" ON storage.objects;

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
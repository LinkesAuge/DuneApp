/*
  # Add storage bucket for POI type icons
  
  1. Changes
    - Create new storage bucket for POI icons
    - Add policies for public read access
    - Add policies for admin upload/delete access
    
  2. Security
    - Public read access to all icons
    - Only admins can upload/delete icons
    - File type restrictions (PNG, JPG, WebP)
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('poi-icons', 'poi-icons', true);

-- Policy to allow public read access to all files
CREATE POLICY "POI Icons Public Read Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'poi-icons');

-- Policy to allow admins to upload files
CREATE POLICY "POI Icons Admin Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'poi-icons'
  AND (LOWER(storage.extension(name)) IN ('png', 'jpg', 'jpeg', 'webp'))
  AND (LENGTH(name) < 255)
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy to allow admins to delete files
CREATE POLICY "POI Icons Admin Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'poi-icons'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
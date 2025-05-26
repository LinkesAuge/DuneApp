/*
  # Create storage bucket for screenshots

  1. New Storage
    - Creates a public storage bucket named 'screenshots'
    
  2. Security
    - Allows public read access to all files in the bucket
    - Allows authenticated users to upload image files
    - Allows users to delete their own uploaded files
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true);

-- Policy to allow public read access to all files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'screenshots');

-- Policy to allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'screenshots'
  AND (LOWER(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif'))
  AND (LENGTH(name) < 255)
);

-- Policy to allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'screenshots'
  AND owner = auth.uid()
);
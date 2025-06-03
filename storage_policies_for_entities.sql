-- Storage policies for entity icons in Supabase
-- Run this after creating the main unified entities migration

-- Ensure entity-icons folder exists in screenshots bucket
-- (The folder will be created automatically when first file is uploaded)

-- Create policy for public read access to entity icons
DROP POLICY IF EXISTS "Entity icons are publicly accessible" ON storage.objects;
CREATE POLICY "Entity icons are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'screenshots' AND (storage.foldername(name))[1] = 'entity-icons');

-- Create policy for authenticated users to upload entity icons (for admin panel)
DROP POLICY IF EXISTS "Authenticated users can upload entity icons" ON storage.objects;
CREATE POLICY "Authenticated users can upload entity icons"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'screenshots' AND (storage.foldername(name))[1] = 'entity-icons');

-- Create policy for authenticated users to update entity icons (for admin panel)
DROP POLICY IF EXISTS "Authenticated users can update entity icons" ON storage.objects;
CREATE POLICY "Authenticated users can update entity icons"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'screenshots' AND (storage.foldername(name))[1] = 'entity-icons');

-- Create policy for authenticated users to delete entity icons (for admin panel)
DROP POLICY IF EXISTS "Authenticated users can delete entity icons" ON storage.objects;
CREATE POLICY "Authenticated users can delete entity icons"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'screenshots' AND (storage.foldername(name))[1] = 'entity-icons'); 
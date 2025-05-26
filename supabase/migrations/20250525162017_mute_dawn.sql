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

-- Set up storage policy for admin access
CREATE POLICY "Admin users can manage POI icons"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'poi-icons'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.role = 'editor')
  )
)
WITH CHECK (
  bucket_id = 'poi-icons'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.role = 'editor')
  )
);
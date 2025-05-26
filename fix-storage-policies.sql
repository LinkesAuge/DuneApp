-- Fix storage bucket policies for base map uploads
-- Run this in your Supabase SQL Editor
-- Security approach: UI-level access control (admin panel restricts access)

-- Check current storage policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage';

-- First, ensure RLS is enabled on storage.objects (it should be by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might conflict
DROP POLICY IF EXISTS "Authenticated users can upload screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Public can read screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to screenshots bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to screenshots bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin uploads to base-maps bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin updates to base-maps bucket" ON storage.objects;

-- Screenshots bucket: Allow all authenticated users
-- (for POI screenshots AND base map uploads via admin panel)
CREATE POLICY "Allow authenticated uploads to screenshots bucket" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'screenshots' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Allow authenticated updates to screenshots bucket" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'screenshots' AND 
  auth.uid() IS NOT NULL
);

-- Public read access to screenshots bucket (for viewing uploaded content)
CREATE POLICY "Public read access to screenshots bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'screenshots');

-- Ensure the screenshots bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('screenshots', 'screenshots', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

SELECT 'Storage policies fixed: all authenticated users can upload to screenshots bucket!' AS status; 
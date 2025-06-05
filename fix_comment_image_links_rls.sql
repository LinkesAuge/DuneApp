-- Fix RLS policies for comment_image_links table
-- This addresses the same issue we had with poi_image_links

-- First, let's see current policies
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'comment_image_links';

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can manage their own comment image links" ON comment_image_links;
DROP POLICY IF EXISTS "Users can view their own comment image links" ON comment_image_links;
DROP POLICY IF EXISTS "Users can insert their own comment image links" ON comment_image_links;

-- Create comprehensive policies that actually work

-- Policy 1: Allow users to view comment image links for comments they can access
CREATE POLICY "Users can view comment image links" ON comment_image_links
FOR SELECT 
TO authenticated
USING (
  comment_id IN (
    SELECT id FROM comments 
    WHERE user_id = auth.uid() 
    OR poi_id IN (
      SELECT id FROM pois 
      WHERE privacy_level = 'public' 
      OR created_by = auth.uid()
      OR id IN (
        SELECT poi_id FROM poi_shares WHERE shared_with_user_id = auth.uid()
      )
    )
  )
);

-- Policy 2: Allow users to insert comment image links for their own comments
CREATE POLICY "Users can insert comment image links" ON comment_image_links
FOR INSERT 
TO authenticated
WITH CHECK (
  comment_id IN (
    SELECT id FROM comments WHERE user_id = auth.uid()
  )
);

-- Policy 3: Allow users to delete comment image links for their own comments
CREATE POLICY "Users can delete comment image links" ON comment_image_links
FOR DELETE 
TO authenticated
USING (
  comment_id IN (
    SELECT id FROM comments WHERE user_id = auth.uid()
  )
);

-- Policy 4: Allow admins to manage all comment image links
CREATE POLICY "Admins can manage all comment image links" ON comment_image_links
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'editor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'editor')
  )
);

-- Verify policies were created
SELECT policyname, cmd, permissive
FROM pg_policies 
WHERE tablename = 'comment_image_links'
ORDER BY policyname; 
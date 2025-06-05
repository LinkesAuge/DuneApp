-- Check current RLS policies on poi_image_links table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'poi_image_links';

-- Check if RLS is enabled on the table
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'poi_image_links';

-- Create missing RLS policies for poi_image_links table
-- Policy for INSERT: Allow users to link images to POIs they created or have edit access to
CREATE POLICY "Users can link images to their POIs" ON poi_image_links
  FOR INSERT
  TO public
  WITH CHECK (
    -- Check if the POI belongs to the current user or is public/shared
    EXISTS (
      SELECT 1 FROM pois 
      WHERE pois.id = poi_image_links.poi_id 
      AND (
        pois.created_by = auth.uid() OR 
        pois.privacy_level = 'public' OR
        (pois.privacy_level = 'shared' AND EXISTS (
          SELECT 1 FROM poi_shares 
          WHERE poi_shares.poi_id = pois.id 
          AND poi_shares.shared_with = auth.uid()
        ))
      )
    )
  );

-- Policy for SELECT: Allow users to view image links for POIs they can access
CREATE POLICY "Users can view image links for accessible POIs" ON poi_image_links
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM pois 
      WHERE pois.id = poi_image_links.poi_id 
      AND (
        pois.created_by = auth.uid() OR 
        pois.privacy_level = 'public' OR
        (pois.privacy_level = 'shared' AND EXISTS (
          SELECT 1 FROM poi_shares 
          WHERE poi_shares.poi_id = pois.id 
          AND poi_shares.shared_with = auth.uid()
        ))
      )
    )
  );

-- Policy for UPDATE: Allow users to update display order for their POIs
CREATE POLICY "Users can update image links for their POIs" ON poi_image_links
  FOR UPDATE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM pois 
      WHERE pois.id = poi_image_links.poi_id 
      AND (
        pois.created_by = auth.uid() OR 
        pois.privacy_level = 'public' OR
        (pois.privacy_level = 'shared' AND EXISTS (
          SELECT 1 FROM poi_shares 
          WHERE poi_shares.poi_id = pois.id 
          AND poi_shares.shared_with = auth.uid()
        ))
      )
    )
  );

-- Policy for DELETE: Allow users to delete image links for their POIs
CREATE POLICY "Users can delete image links for their POIs" ON poi_image_links
  FOR DELETE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM pois 
      WHERE pois.id = poi_image_links.poi_id 
      AND (
        pois.created_by = auth.uid() OR 
        pois.privacy_level = 'public' OR
        (pois.privacy_level = 'shared' AND EXISTS (
          SELECT 1 FROM poi_shares 
          WHERE poi_shares.poi_id = pois.id 
          AND poi_shares.shared_with = auth.uid()
        ))
      )
    )
  );

-- Enable RLS on the table if not already enabled
ALTER TABLE poi_image_links ENABLE ROW LEVEL SECURITY; 
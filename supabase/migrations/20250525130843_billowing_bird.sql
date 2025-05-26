/*
  # Fix grid square permissions for member uploads
  
  1. Changes
    - Allow members to upload to empty grid squares
    - Maintain ability to update their own uploads
    - Keep admin/editor privileges unchanged
  
  2. Security
    - Members can upload to squares with no existing screenshot
    - Members can update squares they previously uploaded
    - Admins and editors retain full update privileges
*/

-- Drop existing update policies
DROP POLICY IF EXISTS "Members can update their own grid squares" ON grid_squares;
DROP POLICY IF EXISTS "Admins and editors can update any grid square" ON grid_squares;

-- Create new update policies
CREATE POLICY "Members can update empty or own grid squares"
ON grid_squares FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'member'
    AND (
      -- Allow update if square has no screenshot or was uploaded by the user
      (grid_squares.screenshot_url IS NULL AND grid_squares.uploaded_by IS NULL)
      OR grid_squares.uploaded_by = auth.uid()
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'member'
    AND (
      (grid_squares.screenshot_url IS NULL AND grid_squares.uploaded_by IS NULL)
      OR grid_squares.uploaded_by = auth.uid()
    )
  )
);

CREATE POLICY "Admins and editors can update any grid square"
ON grid_squares FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.role = 'editor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.role = 'editor')
  )
);
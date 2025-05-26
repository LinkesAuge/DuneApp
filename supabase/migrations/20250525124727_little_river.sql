/*
  # Update grid squares policies for member role
  
  1. Changes
    - Drop existing update policies for grid squares
    - Add new policy that only allows members to update their own grid squares
    - Maintain admin/editor ability to update any grid square
  
  2. Security
    - Members can only update grid squares they uploaded
    - Admins and editors retain full update privileges
*/

-- Drop existing update policies
DROP POLICY IF EXISTS "Non-pending users can update grid squares" ON grid_squares;
DROP POLICY IF EXISTS "Admins and editors can update any grid square" ON grid_squares;

-- Create new update policies
CREATE POLICY "Members can update their own grid squares"
ON grid_squares FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'member'
    AND uploaded_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'member'
    AND uploaded_by = auth.uid()
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
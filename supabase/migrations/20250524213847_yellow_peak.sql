/*
  # Fix grid square permissions

  1. Changes
    - Drop existing grid square policies
    - Add new policies for proper permission handling
    - Allow all authenticated non-pending users to update grid squares
    - Maintain special privileges for admins and editors
  
  2. Security
    - Enable RLS
    - Add policies for different operations
    - Ensure proper access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON grid_squares;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON grid_squares;
DROP POLICY IF EXISTS "Users can update their own grid squares" ON grid_squares;
DROP POLICY IF EXISTS "Admins and editors can update any grid square" ON grid_squares;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
ON grid_squares FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role != 'pending'
  )
);

CREATE POLICY "Enable insert for authenticated users"
ON grid_squares FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role != 'pending'
  )
);

CREATE POLICY "Non-pending users can update grid squares"
ON grid_squares FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role != 'pending'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role != 'pending'
  )
);

CREATE POLICY "Admins and editors can delete grid squares"
ON grid_squares FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.role = 'editor')
  )
);
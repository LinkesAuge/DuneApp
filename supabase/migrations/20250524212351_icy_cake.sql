/*
  # Fix grid squares RLS policies

  1. Changes
    - Update RLS policies for grid_squares table to allow:
      - Authenticated users to read all grid squares
      - Authenticated users to insert grid squares
      - Users to update their own grid squares
      - Admins and editors to update any grid square

  2. Security
    - Enable RLS on grid_squares table
    - Add policies for read, insert, and update operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Grid squares access policy" ON grid_squares;
DROP POLICY IF EXISTS "Authenticated users can insert grid squares" ON grid_squares;
DROP POLICY IF EXISTS "Users can update their own grid squares" ON grid_squares;
DROP POLICY IF EXISTS "Admins and editors can update any grid square" ON grid_squares;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
ON grid_squares
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON grid_squares
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their own grid squares"
ON grid_squares
FOR UPDATE
TO authenticated
USING (auth.uid() = uploaded_by)
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Admins and editors can update any grid square"
ON grid_squares
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.role = 'editor')
  )
);
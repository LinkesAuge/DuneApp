/*
  # Add pending role and update access policies
  
  1. Changes
    - Add 'pending' as a new user role
    - Change default role for new profiles to 'pending'
    - Update access policies to restrict pending users
  
  2. Security
    - Pending users can only view their own profile
    - Only non-pending users can view grid squares and POIs
*/

-- First transaction: Add the new enum value
BEGIN;
ALTER TYPE user_role ADD VALUE 'pending';
COMMIT;

-- Second transaction: Update default and policies
BEGIN;

-- Set default role to 'pending' for new profiles
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'pending'::user_role;

-- Drop existing policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Grid squares are viewable by everyone" ON grid_squares;
DROP POLICY IF EXISTS "POIs are viewable by everyone" ON pois;

-- Create new policies
CREATE POLICY "Profiles access policy"
ON profiles
USING (
  CASE 
    WHEN auth.uid() = id THEN true  -- Users can always see their own profile
    WHEN EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role != 'pending'::user_role
    ) THEN true  -- Non-pending users can see all profiles
    ELSE false
  END
);

CREATE POLICY "Grid squares access policy"
ON grid_squares
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role != 'pending'::user_role
  )
);

CREATE POLICY "POIs access policy"
ON pois
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role != 'pending'::user_role
  )
);

COMMIT;
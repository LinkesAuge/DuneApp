/*
  # Fix recursive RLS policies on profiles table

  1. Changes
    - Remove redundant and recursive policies from profiles table
    - Create new, simplified policies that avoid recursion
    - Maintain security while fixing the infinite recursion issue

  2. Security
    - Maintain RLS enabled on profiles table
    - Ensure proper access control without recursive checks
    - Keep basic CRUD operations secure
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Profiles access policy" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Create new, non-recursive policies
CREATE POLICY "Enable read access for authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role = 'admin'
  )
);
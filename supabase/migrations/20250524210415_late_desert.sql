/*
  # Fix profiles table RLS policies

  1. Changes
    - Add INSERT policy for authenticated users to create their own profiles
    - Add UPDATE policy for users to update their own profiles
    - Add SELECT policy for public access to profiles
  
  2. Security
    - Enable RLS on profiles table
    - Add policies for INSERT, UPDATE, and SELECT operations
    - Ensure users can only create/update their own profiles
*/

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create their own profile
CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to read any profile
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles
FOR SELECT
TO public
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO public
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
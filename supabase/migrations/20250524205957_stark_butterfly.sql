/*
  # Initial schema for Dune Awakening Deep Desert Tracker

  1. New Tables
    - `profiles` - User profiles linked to Supabase Auth
    - `grid_squares` - Cells in the 9x9 grid map
    - `poi_types` - Categories and types of points of interest
    - `pois` - Points of interest with their locations and details

  2. Types
    - `user_role` - Enum for user permission levels

  3. Security
    - Enable RLS on all tables
    - Add policies for different user roles
*/

-- Create user_role enum
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'member');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE NOT NULL,
  updated_at timestamptz DEFAULT now(),
  role user_role NOT NULL DEFAULT 'member'
);

-- Create grid_squares table
CREATE TABLE IF NOT EXISTS grid_squares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinate text UNIQUE NOT NULL,
  screenshot_url text,
  is_explored boolean DEFAULT false,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  upload_date timestamptz DEFAULT now()
);

-- Create poi_types table
CREATE TABLE IF NOT EXISTS poi_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  category text NOT NULL,
  default_description text
);

-- Create pois table
CREATE TABLE IF NOT EXISTS pois (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_square_id uuid REFERENCES grid_squares(id) ON DELETE CASCADE,
  poi_type_id uuid REFERENCES poi_types(id),
  title text NOT NULL,
  description text,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  screenshots JSONB[] DEFAULT ARRAY[]::JSONB[],
  CONSTRAINT max_screenshots_check CHECK (array_length(screenshots, 1) <= 5)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE grid_squares ENABLE ROW LEVEL SECURITY;
ALTER TABLE poi_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE pois ENABLE ROW LEVEL SECURITY;

-- Profiles table policies
-- Everyone can read profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (true);

-- Users can update their own profiles
CREATE POLICY "Users can update their own profiles"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Grid squares table policies
-- Everyone can read grid squares
CREATE POLICY "Grid squares are viewable by everyone"
  ON grid_squares
  FOR SELECT
  USING (true);

-- Authenticated users can insert grid squares
CREATE POLICY "Authenticated users can insert grid squares"
  ON grid_squares
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update grid squares they uploaded
CREATE POLICY "Users can update their own grid squares"
  ON grid_squares
  FOR UPDATE
  USING (auth.uid() = uploaded_by);

-- Admins and editors can update any grid square
CREATE POLICY "Admins and editors can update any grid square"
  ON grid_squares
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'editor')
    )
  );

-- POI types table policies
-- Everyone can read POI types
CREATE POLICY "POI types are viewable by everyone"
  ON poi_types
  FOR SELECT
  USING (true);

-- Only admins and editors can insert, update, or delete POI types
CREATE POLICY "Admins and editors can manage POI types"
  ON poi_types
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'editor')
    )
  );

-- POIs table policies
-- Everyone can read POIs
CREATE POLICY "POIs are viewable by everyone"
  ON pois
  FOR SELECT
  USING (true);

-- Authenticated users can insert POIs
CREATE POLICY "Authenticated users can insert POIs"
  ON pois
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update and delete their own POIs
CREATE POLICY "Users can update their own POIs"
  ON pois
  FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own POIs"
  ON pois
  FOR DELETE
  USING (auth.uid() = created_by);

-- Admins and editors can update or delete any POI
CREATE POLICY "Admins and editors can update any POI"
  ON pois
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'editor')
    )
  );

CREATE POLICY "Admins and editors can delete any POI"
  ON pois
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'editor')
    )
  );
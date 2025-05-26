/*
  # Add Comments System

  1. New Tables
    - `comments` - Comments for POIs and Grid Squares

  2. Security
    - Enable RLS on comments table
    - Add policies for comment management
*/

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Reference either a POI or a Grid Square (one of these should be null)
  poi_id uuid REFERENCES pois(id) ON DELETE CASCADE,
  grid_square_id uuid REFERENCES grid_squares(id) ON DELETE CASCADE,
  
  -- Ensure comment is linked to exactly one entity
  CONSTRAINT comment_target_check CHECK (
    (poi_id IS NOT NULL AND grid_square_id IS NULL) OR 
    (poi_id IS NULL AND grid_square_id IS NOT NULL)
  )
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_comments_poi_id ON comments(poi_id);
CREATE INDEX IF NOT EXISTS idx_comments_grid_square_id ON comments(grid_square_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- Enable RLS on comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Comments table policies

-- Everyone can read comments
CREATE POLICY "Comments are viewable by everyone"
  ON comments
  FOR SELECT
  USING (true);

-- Authenticated users can insert comments
CREATE POLICY "Authenticated users can insert comments"
  ON comments
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON comments
  FOR UPDATE
  USING (auth.uid() = created_by);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON comments
  FOR DELETE
  USING (auth.uid() = created_by);

-- Admins can manage any comment
CREATE POLICY "Admins can manage any comment"
  ON comments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 
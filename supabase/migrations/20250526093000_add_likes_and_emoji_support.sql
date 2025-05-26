/*
  # Add Likes System

  1. New Tables
    - `likes` - Track user likes for comments and POIs

  2. Security
    - Enable RLS on likes table
    - Add policies for like management
*/

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- What is being liked (comment or POI)
  target_type text NOT NULL CHECK (target_type IN ('comment', 'poi')),
  target_id uuid NOT NULL,
  
  -- Prevent duplicate likes from same user
  UNIQUE(created_by, target_type, target_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(created_by);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON likes(created_at);

-- Enable RLS on likes table
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Likes table policies

-- Everyone can read likes (for showing counts)
CREATE POLICY "Likes are viewable by everyone"
  ON likes
  FOR SELECT
  USING (true);

-- Authenticated users can insert likes
CREATE POLICY "Authenticated users can like items"
  ON likes
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Users can delete their own likes (unlike)
CREATE POLICY "Users can unlike their own likes"
  ON likes
  FOR DELETE
  USING (auth.uid() = created_by);

-- Admins can manage any like
CREATE POLICY "Admins can manage any like"
  ON likes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  ); 
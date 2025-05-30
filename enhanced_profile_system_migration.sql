-- Enhanced Profile System Migration: User Profiles + Admin-Configurable Ranks
-- Phase 1: Database Schema Enhancement
-- Date: January 28, 2025

-- Create ranks table for admin-configurable ranks
CREATE TABLE IF NOT EXISTS ranks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#3B82F6', -- Hex color code
    text_color TEXT NOT NULL DEFAULT '#FFFFFF', -- Text color for contrast
    display_order INTEGER NOT NULL DEFAULT 0, -- For sorting ranks
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add enhanced profile fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS rank_id UUID REFERENCES ranks(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS custom_avatar_url TEXT,
ADD COLUMN IF NOT EXISTS use_discord_avatar BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_profiles_rank_id ON profiles(rank_id);
CREATE INDEX IF NOT EXISTS idx_ranks_display_order ON ranks(display_order);
CREATE INDEX IF NOT EXISTS idx_ranks_name ON ranks(name);

-- Add comments for documentation
COMMENT ON TABLE ranks IS 'Admin-configurable user ranks with customizable names, colors, and hierarchy';
COMMENT ON COLUMN profiles.display_name IS 'User-chosen display name shown throughout the app';
COMMENT ON COLUMN profiles.rank_id IS 'Reference to user assigned rank (admin-configurable)';
COMMENT ON COLUMN profiles.custom_avatar_url IS 'URL to custom uploaded profile picture';
COMMENT ON COLUMN profiles.use_discord_avatar IS 'Preference: true = use Discord avatar, false = use custom avatar';
COMMENT ON COLUMN profiles.profile_completed IS 'Whether user has completed profile setup after first login';
COMMENT ON COLUMN profiles.bio IS 'User biography/description';
COMMENT ON COLUMN ranks.display_order IS 'Order for displaying ranks (lower numbers first)';

-- Create default ranks (admins can modify/delete these)
INSERT INTO ranks (name, description, color, text_color, display_order) VALUES
('Member', 'Default community member', '#6B7280', '#FFFFFF', 100),
('Contributor', 'Active community contributor', '#10B981', '#FFFFFF', 200),
('Veteran', 'Long-time community member', '#F59E0B', '#000000', 300),
('Elite', 'Exceptional community member', '#8B5CF6', '#FFFFFF', 400),
('Legend', 'Legendary community status', '#EF4444', '#FFFFFF', 500)
ON CONFLICT (name) DO NOTHING;

-- Set up RLS (Row Level Security) for ranks table
ALTER TABLE ranks ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read ranks (for displaying in UI)
CREATE POLICY "Allow read access to ranks" ON ranks
    FOR SELECT USING (true);

-- Only admins can modify ranks
CREATE POLICY "Allow admin insert on ranks" ON ranks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Allow admin update on ranks" ON ranks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Allow admin delete on ranks" ON ranks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ranks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ranks_updated_at_trigger
    BEFORE UPDATE ON ranks
    FOR EACH ROW
    EXECUTE FUNCTION update_ranks_updated_at();

-- Update existing profiles to have profile_completed = true (for existing users)
UPDATE profiles SET profile_completed = true WHERE profile_completed IS NULL OR profile_completed = false;

-- Verification queries (run these to check the migration)
-- SELECT * FROM ranks ORDER BY display_order;
-- SELECT id, username, display_name, rank_id, use_discord_avatar, profile_completed FROM profiles LIMIT 5; 
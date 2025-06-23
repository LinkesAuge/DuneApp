-- Guild System Implementation - Phase 1B: Database Schema
-- Date: January 30, 2025
-- Purpose: Create comprehensive guild management system with hierarchy and styling

-- ===============================================
-- 1. CREATE GUILDS TABLE
-- ===============================================

CREATE TABLE guilds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  
  -- Styling options for guild tags
  tag_color VARCHAR(7) NOT NULL DEFAULT '#3B82F6', -- Hex color for guild tag background
  tag_text_color VARCHAR(7) NOT NULL DEFAULT '#FFFFFF', -- Text color for contrast
  
  -- Organization
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true, -- Allow admins to disable guilds without deleting
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add indexes for performance
CREATE INDEX idx_guilds_display_order ON guilds(display_order);
CREATE INDEX idx_guilds_active ON guilds(is_active);
CREATE INDEX idx_guilds_name ON guilds(name);

-- ===============================================
-- 2. ADD GUILD FIELDS TO PROFILES TABLE
-- ===============================================

-- Add guild-related fields to existing profiles table
ALTER TABLE profiles ADD COLUMN guild_id UUID REFERENCES guilds(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN guild_role VARCHAR(20) DEFAULT 'member' CHECK (guild_role IN ('leader', 'officer', 'member'));
ALTER TABLE profiles ADD COLUMN guild_joined_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN guild_assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add indexes for guild queries
CREATE INDEX idx_profiles_guild_id ON profiles(guild_id);
CREATE INDEX idx_profiles_guild_role ON profiles(guild_role);
CREATE INDEX idx_profiles_guild_joined ON profiles(guild_joined_at);

-- ===============================================
-- 3. CREATE DEFAULT "UNASSIGNED" GUILD
-- ===============================================

-- Insert default "Unassigned" guild for users without a guild
INSERT INTO guilds (id, name, description, tag_color, tag_text_color, display_order, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Unassigned',
  'Users who have not been assigned to a guild',
  '#6B7280', -- Gray color
  '#FFFFFF', -- White text
  999, -- Last in display order
  true
);

-- ===============================================
-- 4. CREATE GUILD MANAGEMENT FUNCTIONS
-- ===============================================

-- Function to automatically set guild_joined_at when guild_id is updated
CREATE OR REPLACE FUNCTION update_guild_joined_at()
RETURNS TRIGGER AS $$
BEGIN
  -- If guild_id is being set for the first time or changed
  IF (OLD.guild_id IS NULL AND NEW.guild_id IS NOT NULL) OR 
     (OLD.guild_id IS NOT NULL AND NEW.guild_id IS NOT NULL AND OLD.guild_id != NEW.guild_id) THEN
    NEW.guild_joined_at = NOW();
  END IF;
  
  -- If guild_id is being cleared (set to NULL)
  IF OLD.guild_id IS NOT NULL AND NEW.guild_id IS NULL THEN
    NEW.guild_joined_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update guild_joined_at
CREATE TRIGGER trigger_update_guild_joined_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_guild_joined_at();

-- Function to update guild updated_at timestamp
CREATE OR REPLACE FUNCTION update_guild_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for guild updated_at
CREATE TRIGGER trigger_update_guild_timestamp
  BEFORE UPDATE ON guilds
  FOR EACH ROW
  EXECUTE FUNCTION update_guild_timestamp();

-- ===============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ===============================================

-- Enable RLS on guilds table
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;

-- Guilds: Everyone can read active guilds
CREATE POLICY "Anyone can view active guilds" ON guilds
  FOR SELECT USING (is_active = true);

-- Guilds: Only admins can insert/update/delete guilds
CREATE POLICY "Admins can manage guilds" ON guilds
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Profiles: Users can view guild information of other users
-- (This is already covered by existing profiles RLS policies)

-- ===============================================
-- 6. GUILD CONSTRAINTS AND VALIDATIONS
-- ===============================================

-- Ensure guild leaders are unique per guild (only one leader per guild)
CREATE UNIQUE INDEX idx_unique_guild_leader ON profiles(guild_id) 
WHERE guild_role = 'leader';

-- Constraint: Users can only be in one guild at a time (already enforced by single guild_id column)

-- Constraint: Guild tag colors must be valid hex codes
ALTER TABLE guilds ADD CONSTRAINT check_tag_color_format 
  CHECK (tag_color ~ '^#[0-9A-Fa-f]{6}$');
  
ALTER TABLE guilds ADD CONSTRAINT check_tag_text_color_format 
  CHECK (tag_text_color ~ '^#[0-9A-Fa-f]{6}$');

-- ===============================================
-- 7. SAMPLE GUILDS (OPTIONAL - FOR TESTING)
-- ===============================================

-- Insert some sample guilds for testing
INSERT INTO guilds (name, description, tag_color, tag_text_color, display_order) VALUES
  ('House Atreides', 'Noble house known for honor and loyalty', '#1E40AF', '#FFFFFF', 1),
  ('House Harkonnen', 'Powerful house from Giedi Prime', '#DC2626', '#FFFFFF', 2),
  ('Fremen', 'Desert warriors of Arrakis', '#F59E0B', '#000000', 3),
  ('Spacing Guild', 'Navigators who control space travel', '#7C3AED', '#FFFFFF', 4);

-- ===============================================
-- 8. MIGRATION COMPLETION LOG
-- ===============================================

-- Log successful migration
INSERT INTO public.migration_log (migration_name, applied_at, description)
VALUES (
  'create_guild_system',
  NOW(),
  'Created comprehensive guild system with guilds table, profile integration, RLS policies, and management functions'
) ON CONFLICT DO NOTHING;

-- Create migration_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS migration_log (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT
); 
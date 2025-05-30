-- Discord Authentication Migration: Add Discord fields to profiles table
-- Phase 2: Database Schema Enhancement
-- Date: January 28, 2025

-- Current profiles table structure:
-- id (uuid, NOT NULL)
-- username (text, NOT NULL)  
-- updated_at (timestamp with time zone, NULLABLE)
-- role (USER-DEFINED, NOT NULL)
-- email (text, NULLABLE)

-- Add Discord-specific fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS discord_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS discord_username TEXT,
ADD COLUMN IF NOT EXISTS discord_avatar_url TEXT,
ADD COLUMN IF NOT EXISTS discord_discriminator TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.discord_id IS 'Discord user ID from OAuth provider (unique)';
COMMENT ON COLUMN public.profiles.discord_username IS 'Discord username/display name';
COMMENT ON COLUMN public.profiles.discord_avatar_url IS 'Discord profile avatar URL';
COMMENT ON COLUMN public.profiles.discord_discriminator IS 'Discord discriminator (legacy, may be null for new Discord usernames)';

-- Create index for Discord ID lookups (performance optimization)
-- Note: Removed CONCURRENTLY to avoid transaction block error
CREATE INDEX IF NOT EXISTS idx_profiles_discord_id 
ON public.profiles(discord_id) 
WHERE discord_id IS NOT NULL;

-- Verify the changes were applied
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show updated table structure
SELECT 
    COUNT(*) as total_profiles,
    COUNT(discord_id) as profiles_with_discord_id,
    'Discord fields added successfully' as status
FROM public.profiles; 
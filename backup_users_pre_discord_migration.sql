-- Discord Authentication Migration: Backup existing user data
-- Phase 2: Database Schema Enhancement - Backup Script
-- Date: January 28, 2025

-- Your profiles table structure:
-- id (uuid, NOT NULL)
-- username (text, NOT NULL)  
-- updated_at (timestamp with time zone, NULLABLE)
-- role (USER-DEFINED, NOT NULL)
-- email (text, NULLABLE)

-- Create backup table for profiles (preserves all existing user data)
CREATE TABLE IF NOT EXISTS profiles_backup_pre_discord AS 
SELECT 
    id,
    username,
    updated_at,
    role,
    email,
    CURRENT_TIMESTAMP as backup_created_at
FROM public.profiles;

-- Add comment for documentation
COMMENT ON TABLE profiles_backup_pre_discord IS 'Backup of profiles table before Discord authentication migration on January 28, 2025';

-- Verify backup was created successfully
SELECT 
    COUNT(*) as backed_up_profiles,
    'Backup created successfully' as status
FROM profiles_backup_pre_discord;

-- Show structure of backup table to confirm it worked
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles_backup_pre_discord' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show a sample of backed up data
SELECT * FROM profiles_backup_pre_discord LIMIT 3;

-- Create backup table for auth.users (Supabase auth data)
-- Note: This requires superuser privileges, may need to be done manually
-- CREATE TABLE IF NOT EXISTS auth_users_backup_pre_discord AS 
-- SELECT * FROM auth.users;

-- Export instruction for manual backup (optional)
-- For extra safety, you can also export to CSV:
-- COPY (SELECT * FROM public.profiles) TO '/tmp/profiles_backup_2025_01_28.csv' WITH CSV HEADER; 
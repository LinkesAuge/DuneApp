-- Fix POI Shares Foreign Key Relationships
-- Run this in your Supabase SQL editor

-- First, let's check the current structure of poi_shares table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'poi_shares' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check existing foreign key constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY' AND tc.table_name='poi_shares';

-- Drop existing foreign key constraints if they exist (to recreate them properly)
DO $$ 
DECLARE
    constraint_name text;
BEGIN
    FOR constraint_name IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints AS tc 
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'poi_shares'
    LOOP
        EXECUTE 'ALTER TABLE poi_shares DROP CONSTRAINT IF EXISTS ' || constraint_name;
    END LOOP;
END $$;

-- Add proper foreign key constraints
ALTER TABLE poi_shares 
ADD CONSTRAINT poi_shares_poi_id_fkey 
FOREIGN KEY (poi_id) REFERENCES pois(id) ON DELETE CASCADE;

ALTER TABLE poi_shares 
ADD CONSTRAINT poi_shares_shared_with_user_id_fkey 
FOREIGN KEY (shared_with_user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE poi_shares 
ADD CONSTRAINT poi_shares_shared_by_user_id_fkey 
FOREIGN KEY (shared_by_user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Verify the foreign keys were created
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY' AND tc.table_name='poi_shares';

-- Test the relationship by running the problematic query
SELECT 
    poi_shares.*,
    profiles.id, 
    profiles.username, 
    profiles.email, 
    profiles.display_name, 
    profiles.discord_username, 
    profiles.custom_avatar_url, 
    profiles.discord_avatar_url, 
    profiles.use_discord_avatar
FROM poi_shares
JOIN profiles ON profiles.id = poi_shares.shared_with_user_id
LIMIT 5; 
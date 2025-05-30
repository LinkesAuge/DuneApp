-- Test what data the frontend is sending to update-user function
-- Run this in Supabase SQL Editor to see the current function invocation

-- First, let's see what users we have
SELECT id, username, email, role FROM profiles LIMIT 5;

-- Check the current update-user function logs by triggering a test call
-- You can run this to test the function manually:

SELECT
  id,
  username, 
  email,
  role,
  -- Discord fields
  discord_id,
  discord_username,
  discord_avatar_url
FROM profiles 
WHERE role = 'admin'
LIMIT 1; 
-- Check and fix admin status for base map uploads
-- Run this in your Supabase SQL Editor

-- First, let's see what users exist and their roles
SELECT id, username, email, role, created_at 
FROM profiles 
ORDER BY created_at;

-- Check if there are any admins
SELECT COUNT(*) as admin_count 
FROM profiles 
WHERE role = 'admin';

-- If you need to make yourself an admin, find your user ID from the above query
-- Then uncomment and run one of these (replace with your actual user info):

-- Option 1: Set admin by username (replace 'your-username' with your actual username)
-- UPDATE profiles SET role = 'admin' WHERE username = 'your-username';

-- Option 2: Set admin by email (replace 'your-email@example.com' with your actual email)
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- Option 3: Set the first user as admin (if you're the only user)
-- UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM profiles ORDER BY created_at LIMIT 1);

-- Verify the admin was set correctly
SELECT id, username, email, role 
FROM profiles 
WHERE role = 'admin'; 
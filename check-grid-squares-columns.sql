-- Check what columns exist in grid_squares table
-- Run this in Supabase SQL Editor to see available columns

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'grid_squares' 
AND table_schema = 'public'
ORDER BY ordinal_position; 
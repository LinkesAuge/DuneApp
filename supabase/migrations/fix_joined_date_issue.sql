-- Fix Joined Date Issue - Phase 1A of Guild System Implementation
-- Date: January 30, 2025
-- Problem: UserManagement.tsx shows 'created_at' which updates when profiles change
-- Solution: Add immutable 'actual_join_date' field for true join tracking

-- Add actual_join_date column to profiles table
ALTER TABLE profiles ADD COLUMN actual_join_date TIMESTAMPTZ;

-- Backfill existing users with their current updated_at as the actual join date
-- Note: Using updated_at as best available approximation for existing users
UPDATE profiles 
SET actual_join_date = updated_at 
WHERE actual_join_date IS NULL;

-- Make the field required for future records
ALTER TABLE profiles ALTER COLUMN actual_join_date SET NOT NULL;

-- Set default for new records to current timestamp
ALTER TABLE profiles ALTER COLUMN actual_join_date SET DEFAULT NOW();

-- Add index for performance when querying by join date
CREATE INDEX idx_profiles_actual_join_date ON profiles(actual_join_date);

-- Add comment to document the field purpose
COMMENT ON COLUMN profiles.actual_join_date IS 'Immutable timestamp of when user first joined - never updated after initial insert'; 
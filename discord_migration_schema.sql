-- Discord Authentication Migration Schema
-- Phase 2: Database Schema Enhancement

-- Step 1: Add Discord fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discord_id VARCHAR UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discord_username VARCHAR;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discord_avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_avatar_url TEXT;

-- Step 2: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_discord_id ON public.profiles(discord_id);

-- Step 3: Add constraints
ALTER TABLE public.profiles ADD CONSTRAINT unique_discord_id UNIQUE (discord_id);

-- Step 4: Update RLS policies to work with Discord auth
-- (Note: We'll review and update RLS policies after implementing the auth flow)

-- Step 5: Add function to handle Discord user creation/update
CREATE OR REPLACE FUNCTION public.handle_discord_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Update existing profile with Discord info if discord_id matches
  UPDATE public.profiles 
  SET 
    discord_username = NEW.raw_user_meta_data ->> 'username',
    discord_avatar_url = NEW.raw_user_meta_data ->> 'avatar_url',
    email = NEW.email,
    updated_at = now()
  WHERE discord_id = NEW.raw_user_meta_data ->> 'provider_id'
  AND NEW.raw_user_meta_data ->> 'provider_id' IS NOT NULL;

  -- If no existing profile found, create new one
  IF NOT FOUND AND NEW.raw_user_meta_data ->> 'provider_id' IS NOT NULL THEN
    INSERT INTO public.profiles (
      id,
      discord_id,
      discord_username,
      discord_avatar_url,
      display_name,
      email,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'provider_id',
      NEW.raw_user_meta_data ->> 'username',
      NEW.raw_user_meta_data ->> 'avatar_url',
      NEW.raw_user_meta_data ->> 'username', -- Default display_name to Discord username
      NEW.email,
      now(),
      now()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create trigger for Discord auth
DROP TRIGGER IF EXISTS on_auth_user_created_discord ON auth.users;
CREATE TRIGGER on_auth_user_created_discord
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_discord_auth();

-- Step 7: Add helper function to get display avatar
CREATE OR REPLACE FUNCTION public.get_display_avatar(profile_row public.profiles)
RETURNS TEXT AS $$
BEGIN
  -- Priority: custom_avatar_url > discord_avatar_url > default
  RETURN COALESCE(
    profile_row.custom_avatar_url,
    profile_row.discord_avatar_url,
    '/default-avatar.png'
  );
END;
$$ LANGUAGE plpgsql;

-- Step 8: Add helper function to get display name
CREATE OR REPLACE FUNCTION public.get_display_name(profile_row public.profiles)
RETURNS TEXT AS $$
BEGIN
  -- Priority: display_name > discord_username > email prefix
  RETURN COALESCE(
    profile_row.display_name,
    profile_row.discord_username,
    split_part(profile_row.email, '@', 1)
  );
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create view for easy profile access with computed fields
CREATE OR REPLACE VIEW public.profile_display AS
SELECT 
  p.*,
  public.get_display_name(p) as computed_display_name,
  public.get_display_avatar(p) as computed_avatar_url
FROM public.profiles p;

-- Step 10: Grant permissions
GRANT SELECT ON public.profile_display TO authenticated;
GRANT SELECT ON public.profile_display TO anon;

-- Migration Notes:
-- 1. This schema is backwards compatible with existing email/password users
-- 2. Discord users will have discord_id populated, others will have NULL
-- 3. Custom avatars work for both Discord and email users
-- 4. Display names can be customized by all users
-- 5. The trigger automatically handles Discord user profile creation 
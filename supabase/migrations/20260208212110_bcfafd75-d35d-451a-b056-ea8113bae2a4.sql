
-- Fix: Convert profiles_public from SECURITY DEFINER to SECURITY INVOKER
-- Step 1: Add a public read policy on profiles so the view can work with SECURITY INVOKER
-- The view itself still excludes sensitive columns (wallet_balance, total_earned)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Step 2: Drop and recreate the view with security_invoker=on
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT
    id,
    user_id,
    username,
    full_name,
    bio,
    avatar_url,
    followers_count,
    following_count,
    created_at,
    updated_at
  FROM public.profiles;

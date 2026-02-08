
-- Recreate profiles_public as SECURITY DEFINER (default when security_invoker is not set)
-- This is the correct pattern: the view hides sensitive financial columns while
-- bypassing owner-only RLS to expose public profile data
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public AS
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


-- STEP 1: Restrict profiles SELECT to own user only (protects wallet_balance, total_earned)
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- STEP 2: Recreate profiles_public view WITHOUT security_invoker
-- This allows the view to bypass RLS on the base table (runs as definer/postgres)
-- while only exposing non-sensitive fields
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

-- Grant access to the view for authenticated and anon roles
GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_public TO anon;

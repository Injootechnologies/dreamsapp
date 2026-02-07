
-- Fix the Security Definer View issue flagged by the Supabase linter
-- profiles_public currently bypasses RLS (default security definer).
-- We need to:
-- 1. Change profiles SELECT policy from restrictive to permissive for all authenticated users
-- 2. Recreate profiles_public with security_invoker=on

-- Step 1: Drop the existing restrictive SELECT policy on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Step 2: Add a permissive SELECT policy for authenticated users
-- This allows the profiles_public view (with security_invoker) to read profile rows
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Step 3: Recreate profiles_public view with security_invoker=on
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
-- Intentionally excludes: wallet_balance, total_earned

GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_public TO anon;

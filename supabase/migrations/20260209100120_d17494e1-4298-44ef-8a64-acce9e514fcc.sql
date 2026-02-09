
-- Fix: Remove overly permissive public SELECT policy on profiles table
-- The profiles_public view already safely exposes non-sensitive fields
-- Keep only "Users can view their own profile" for owner access to financial data
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

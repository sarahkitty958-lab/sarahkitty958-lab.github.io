-- Add card fields to profiles (only storing safe display info, not full card numbers)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS card_last_four TEXT,
ADD COLUMN IF NOT EXISTS card_brand TEXT;

-- Drop the overly permissive SELECT policy on profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create new policy: Users can ONLY view their own profile
CREATE POLICY "Users can view own profile only"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Drop the overly permissive SELECT policy on user_roles
DROP POLICY IF EXISTS "Anyone can view roles" ON public.user_roles;

-- Create new policy: Only authenticated users can view roles (needed for admin checks)
CREATE POLICY "Authenticated users can view roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create a view for admin purposes that excludes sensitive fields
CREATE OR REPLACE VIEW public.profiles_admin_view
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  display_name,
  avatar_url,
  created_at,
  updated_at,
  notifications_enabled
  -- Excludes: phone, shipping info, card info, terms_accepted_at
FROM public.profiles;
-- Fix profiles table security: Remove public read policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Add policy for users to see only their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Fix reservations table security: Remove public read policy
DROP POLICY IF EXISTS "Reservations viewable by everyone" ON public.reservations;

-- Add admin-only read policy for reservations
CREATE POLICY "Admins can view all reservations"
  ON public.reservations FOR SELECT
  USING (has_role(auth.uid(), 'admin'));
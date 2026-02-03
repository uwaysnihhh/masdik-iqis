-- Fix the remaining issues - policy names must be unique

-- Drop the policy we created then recreate correctly
DROP POLICY IF EXISTS "Users can only view own profile" ON public.profiles;

-- Fix profiles - use different policy name
CREATE POLICY "Profile owners can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);
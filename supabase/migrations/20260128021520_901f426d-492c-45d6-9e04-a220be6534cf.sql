-- Add INSERT policy for profiles table
-- This allows users to create their own profile after registration
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
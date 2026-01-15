-- Drop the restrictive policy and recreate as permissive
DROP POLICY IF EXISTS "Admins can insert activities" ON public.activities;

-- Recreate as permissive policy (not restrictive)
CREATE POLICY "Admins can insert activities" 
ON public.activities 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
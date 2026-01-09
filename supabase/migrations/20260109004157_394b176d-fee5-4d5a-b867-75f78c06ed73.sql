
-- Fix function search path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- The "Anyone can create reservation" policy uses WITH CHECK (true) which is intentional
-- because we want anyone (even unauthenticated) to submit reservations
-- This is a public-facing form similar to a contact form

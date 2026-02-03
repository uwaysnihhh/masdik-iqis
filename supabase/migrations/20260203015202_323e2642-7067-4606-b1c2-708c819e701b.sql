-- Fix security: Block anonymous access to sensitive tables

-- 1. Block anonymous access to profiles
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 2. Block anonymous reads on reservations
CREATE POLICY "Block anonymous reads on reservations"
ON public.reservations
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 3. Strengthen transactions protection - explicitly block all non-admin access
DROP POLICY IF EXISTS "Only admins can view transactions" ON public.transactions;
CREATE POLICY "Only admins can view all transactions"
ON public.transactions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Block anonymous access to user_roles
CREATE POLICY "Block anonymous access to user_roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() IS NOT NULL);
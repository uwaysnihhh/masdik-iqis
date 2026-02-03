-- Fix transactions table security: Remove public read policy
DROP POLICY IF EXISTS "Transactions viewable by everyone" ON public.transactions;

-- Add admin-only read policy for transactions (financial data should be restricted)
CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));
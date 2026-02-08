-- Fix: Deny direct SELECT on withdrawals table to protect raw bank account numbers
-- All client reads already use the withdrawals_safe view which masks account numbers
DROP POLICY IF EXISTS "Users can view their own withdrawals" ON public.withdrawals;

CREATE POLICY "No direct SELECT on withdrawals"
  ON public.withdrawals
  FOR SELECT
  USING (false);

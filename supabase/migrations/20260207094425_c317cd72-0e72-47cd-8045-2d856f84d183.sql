
-- Fix withdrawals_safe view to respect RLS (owner-only)
DROP VIEW IF EXISTS public.withdrawals_safe;

CREATE VIEW public.withdrawals_safe
WITH (security_invoker=on) AS
SELECT id, user_id, amount, full_name, bank_name,
       '******' || RIGHT(account_number, 4) AS account_number_masked,
       status, created_at, updated_at
FROM public.withdrawals;

GRANT SELECT ON public.withdrawals_safe TO authenticated;

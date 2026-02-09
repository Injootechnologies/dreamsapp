
-- Add explicit positive amount validation to process_earning
CREATE OR REPLACE FUNCTION public.process_earning(p_user_id uuid, p_post_id uuid, p_amount numeric)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_already_viewed BOOLEAN;
  v_post_eligible_amount DECIMAL;
  v_post_owner UUID;
  v_caller_id UUID;
BEGIN
  -- Require authentication
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Verify caller is earning for themselves only
  IF v_caller_id != p_user_id THEN
    RAISE EXCEPTION 'Cannot earn for other users';
  END IF;

  -- Validate amount is positive
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  -- Validate post exists, is eligible, and get its actual amount
  SELECT user_id, eligible_amount INTO v_post_owner, v_post_eligible_amount
  FROM public.posts 
  WHERE id = p_post_id AND is_eligible = true;
  
  IF v_post_owner IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Cannot earn from own posts
  IF v_caller_id = v_post_owner THEN
    RETURN FALSE;
  END IF;
  
  -- Validate amount matches post's actual eligible amount (prevent arbitrary amounts)
  IF p_amount != v_post_eligible_amount THEN
    RAISE EXCEPTION 'Invalid earning amount';
  END IF;
  
  -- Check if already viewed (prevent double-earning)
  SELECT EXISTS(
    SELECT 1 FROM public.post_views WHERE user_id = p_user_id AND post_id = p_post_id
  ) INTO v_already_viewed;
  
  IF v_already_viewed THEN
    RETURN FALSE;
  END IF;
  
  -- Record view and update balance
  INSERT INTO public.post_views (user_id, post_id, earned_amount) VALUES (p_user_id, p_post_id, p_amount);
  UPDATE public.profiles SET 
    wallet_balance = wallet_balance + p_amount,
    total_earned = total_earned + p_amount
  WHERE user_id = p_user_id;
  INSERT INTO public.earnings_history (user_id, post_id, amount, description)
  VALUES (p_user_id, p_post_id, p_amount, 'Earned from viewing eligible content');
  RETURN TRUE;
END;
$function$;

-- Add explicit positive amount validation to process_withdrawal (already has min/max but add explicit > 0 check first)
CREATE OR REPLACE FUNCTION public.process_withdrawal(p_user_id uuid, p_amount numeric, p_full_name text, p_bank_name text, p_account_number text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_balance DECIMAL;
  v_withdrawal_id UUID;
  v_caller_id UUID;
BEGIN
  -- Require authentication
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Verify caller is withdrawing for themselves only
  IF v_caller_id != p_user_id THEN
    RAISE EXCEPTION 'Cannot withdraw for other users';
  END IF;

  -- Validate amount is positive (defense against negative amounts)
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  -- Validate withdrawal limits
  IF p_amount < 100 THEN
    RAISE EXCEPTION 'Minimum withdrawal is ₦100';
  END IF;
  
  IF p_amount > 50000 THEN
    RAISE EXCEPTION 'Maximum single withdrawal is ₦50,000';
  END IF;
  
  -- Validate inputs
  IF LENGTH(TRIM(p_full_name)) < 2 THEN
    RAISE EXCEPTION 'Invalid full name';
  END IF;
  
  IF LENGTH(TRIM(p_bank_name)) < 2 THEN
    RAISE EXCEPTION 'Invalid bank name';
  END IF;
  
  IF LENGTH(p_account_number) != 10 OR p_account_number !~ '^[0-9]+$' THEN
    RAISE EXCEPTION 'Account number must be exactly 10 digits';
  END IF;
  
  -- Check balance
  SELECT wallet_balance INTO v_current_balance FROM public.profiles WHERE user_id = p_user_id;
  
  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
  
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Deduct and create record
  UPDATE public.profiles SET wallet_balance = wallet_balance - p_amount WHERE user_id = p_user_id;
  INSERT INTO public.withdrawals (user_id, amount, full_name, bank_name, account_number, status)
  VALUES (p_user_id, p_amount, p_full_name, p_bank_name, p_account_number, 'pending')
  RETURNING id INTO v_withdrawal_id;
  RETURN v_withdrawal_id;
END;
$function$;

-- Add CHECK constraints on tables as defense in depth
ALTER TABLE public.post_views DROP CONSTRAINT IF EXISTS check_positive_earned;
ALTER TABLE public.post_views ADD CONSTRAINT check_positive_earned CHECK (earned_amount >= 0);

ALTER TABLE public.withdrawals DROP CONSTRAINT IF EXISTS check_positive_amount;
ALTER TABLE public.withdrawals ADD CONSTRAINT check_positive_amount CHECK (amount > 0);

ALTER TABLE public.earnings_history DROP CONSTRAINT IF EXISTS check_positive_amount;
ALTER TABLE public.earnings_history ADD CONSTRAINT check_positive_amount CHECK (amount > 0);

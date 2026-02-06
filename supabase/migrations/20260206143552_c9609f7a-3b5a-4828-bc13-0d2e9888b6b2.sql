-- Fix search_path for all functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.process_earning(
  p_user_id UUID,
  p_post_id UUID,
  p_amount DECIMAL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_already_viewed BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.post_views WHERE user_id = p_user_id AND post_id = p_post_id) INTO v_already_viewed;
  IF v_already_viewed THEN
    RETURN FALSE;
  END IF;
  INSERT INTO public.post_views (user_id, post_id, earned_amount) VALUES (p_user_id, p_post_id, p_amount);
  UPDATE public.profiles SET 
    wallet_balance = wallet_balance + p_amount,
    total_earned = total_earned + p_amount
  WHERE user_id = p_user_id;
  INSERT INTO public.earnings_history (user_id, post_id, amount, description)
  VALUES (p_user_id, p_post_id, p_amount, 'Earned from viewing eligible content');
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.process_withdrawal(
  p_user_id UUID,
  p_amount DECIMAL,
  p_full_name TEXT,
  p_bank_name TEXT,
  p_account_number TEXT
)
RETURNS UUID AS $$
DECLARE
  v_current_balance DECIMAL;
  v_withdrawal_id UUID;
BEGIN
  SELECT wallet_balance INTO v_current_balance FROM public.profiles WHERE user_id = p_user_id;
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  UPDATE public.profiles SET wallet_balance = wallet_balance - p_amount WHERE user_id = p_user_id;
  INSERT INTO public.withdrawals (user_id, amount, full_name, bank_name, account_number, status)
  VALUES (p_user_id, p_amount, p_full_name, p_bank_name, p_account_number, 'pending')
  RETURNING id INTO v_withdrawal_id;
  RETURN v_withdrawal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
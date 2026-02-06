-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  wallet_balance DECIMAL(12,2) DEFAULT 0.00,
  total_earned DECIMAL(12,2) DEFAULT 0.00,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  caption TEXT NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  video_duration INTEGER, -- in seconds, for videos
  category TEXT,
  is_eligible BOOLEAN DEFAULT false,
  eligible_amount DECIMAL(6,2) DEFAULT 0.00,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create likes table
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create follows table
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Create post_views table (tracks which users viewed which posts for earnings)
CREATE TABLE public.post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  earned_amount DECIMAL(6,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Create earnings_history table
CREATE TABLE public.earnings_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  amount DECIMAL(6,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create withdrawals table
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  full_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can create their own likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can create their own comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can create their own follows" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete their own follows" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Post views policies
CREATE POLICY "Users can view their own post views" ON public.post_views FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own post views" ON public.post_views FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Earnings history policies
CREATE POLICY "Users can view their own earnings" ON public.earnings_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own earnings" ON public.earnings_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Withdrawals policies
CREATE POLICY "Users can view their own withdrawals" ON public.withdrawals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update wallet balance
CREATE OR REPLACE FUNCTION public.process_earning(
  p_user_id UUID,
  p_post_id UUID,
  p_amount DECIMAL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_already_viewed BOOLEAN;
BEGIN
  -- Check if user already viewed this post
  SELECT EXISTS(SELECT 1 FROM public.post_views WHERE user_id = p_user_id AND post_id = p_post_id) INTO v_already_viewed;
  
  IF v_already_viewed THEN
    RETURN FALSE;
  END IF;
  
  -- Record the view
  INSERT INTO public.post_views (user_id, post_id, earned_amount) VALUES (p_user_id, p_post_id, p_amount);
  
  -- Update wallet balance
  UPDATE public.profiles SET 
    wallet_balance = wallet_balance + p_amount,
    total_earned = total_earned + p_amount
  WHERE user_id = p_user_id;
  
  -- Record earning history
  INSERT INTO public.earnings_history (user_id, post_id, amount, description)
  VALUES (p_user_id, p_post_id, p_amount, 'Earned from viewing eligible content');
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to process withdrawal
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
  -- Get current balance
  SELECT wallet_balance INTO v_current_balance FROM public.profiles WHERE user_id = p_user_id;
  
  -- Check sufficient balance
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Deduct from wallet immediately
  UPDATE public.profiles SET wallet_balance = wallet_balance - p_amount WHERE user_id = p_user_id;
  
  -- Create withdrawal record
  INSERT INTO public.withdrawals (user_id, amount, full_name, bank_name, account_number, status)
  VALUES (p_user_id, p_amount, p_full_name, p_bank_name, p_account_number, 'pending')
  RETURNING id INTO v_withdrawal_id;
  
  RETURN v_withdrawal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_likes_post_id ON public.likes(post_id);
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);
CREATE INDEX idx_post_views_user_id ON public.post_views(user_id);
CREATE INDEX idx_earnings_user_id ON public.earnings_history(user_id);
CREATE INDEX idx_withdrawals_user_id ON public.withdrawals(user_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('posts', 'posts', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for posts
CREATE POLICY "Post media is publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'posts');
CREATE POLICY "Users can upload their own post media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own post media" ON storage.objects FOR DELETE USING (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);
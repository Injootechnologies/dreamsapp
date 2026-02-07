
-- Add server-side input validation triggers for posts, comments, and profiles
-- Using triggers instead of CHECK constraints (as per best practices)

-- Validation trigger for posts
CREATE OR REPLACE FUNCTION public.validate_post_input()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate caption length
  IF LENGTH(NEW.caption) = 0 THEN
    RAISE EXCEPTION 'Caption cannot be empty';
  END IF;
  
  IF LENGTH(NEW.caption) > 500 THEN
    RAISE EXCEPTION 'Caption must be 500 characters or less';
  END IF;
  
  -- Validate media_type
  IF NEW.media_type NOT IN ('image', 'video') THEN
    RAISE EXCEPTION 'Invalid media type';
  END IF;
  
  -- Validate category length if provided
  IF NEW.category IS NOT NULL AND LENGTH(NEW.category) > 50 THEN
    RAISE EXCEPTION 'Category is too long';
  END IF;
  
  -- Strip control characters from caption (keep newlines and tabs)
  NEW.caption := regexp_replace(NEW.caption, E'[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]', '', 'g');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_post_before_insert
BEFORE INSERT ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.validate_post_input();

CREATE TRIGGER validate_post_before_update
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.validate_post_input();

-- Validation trigger for comments
CREATE OR REPLACE FUNCTION public.validate_comment_input()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate content length
  IF LENGTH(TRIM(NEW.content)) = 0 THEN
    RAISE EXCEPTION 'Comment cannot be empty';
  END IF;
  
  IF LENGTH(NEW.content) > 500 THEN
    RAISE EXCEPTION 'Comment must be 500 characters or less';
  END IF;
  
  -- Strip control characters
  NEW.content := regexp_replace(NEW.content, E'[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]', '', 'g');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_comment_before_insert
BEFORE INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.validate_comment_input();

-- Validation trigger for profiles
CREATE OR REPLACE FUNCTION public.validate_profile_input()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate username
  IF LENGTH(TRIM(NEW.username)) < 3 THEN
    RAISE EXCEPTION 'Username must be at least 3 characters';
  END IF;
  
  IF LENGTH(NEW.username) > 30 THEN
    RAISE EXCEPTION 'Username must be 30 characters or less';
  END IF;
  
  IF NEW.username !~ '^[a-zA-Z0-9_]+$' THEN
    RAISE EXCEPTION 'Username can only contain letters, numbers, and underscores';
  END IF;
  
  -- Validate full_name
  IF LENGTH(TRIM(NEW.full_name)) < 1 THEN
    RAISE EXCEPTION 'Full name is required';
  END IF;
  
  IF LENGTH(NEW.full_name) > 100 THEN
    RAISE EXCEPTION 'Full name must be 100 characters or less';
  END IF;
  
  -- Validate bio length
  IF NEW.bio IS NOT NULL AND LENGTH(NEW.bio) > 500 THEN
    RAISE EXCEPTION 'Bio must be 500 characters or less';
  END IF;
  
  -- Strip control characters from bio
  IF NEW.bio IS NOT NULL THEN
    NEW.bio := regexp_replace(NEW.bio, E'[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]', '', 'g');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_profile_before_insert
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_profile_input();

CREATE TRIGGER validate_profile_before_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_profile_input();

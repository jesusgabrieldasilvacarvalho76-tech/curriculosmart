-- Enable RLS on auth schema access (already enabled by default)
-- No additional tables needed for basic authentication

-- Create a simple function to get user email (for stripe integration)
CREATE OR REPLACE FUNCTION public.get_user_email(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = user_id;
$$;
-- ULTRA SIMPLIFIED FIX FOR PROFILE AUTHENTICATION
-- Direct fixes without complex blocks

BEGIN;

-- Step 1: Add essential service role policies
DROP POLICY IF EXISTS "Service role can select any profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert any profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can delete any profile" ON public.profiles;

CREATE POLICY "Service role can select any profile" ON public.profiles FOR SELECT TO service_role USING (true);
CREATE POLICY "Service role can insert any profile" ON public.profiles FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can update any profile" ON public.profiles FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service role can delete any profile" ON public.profiles FOR DELETE TO service_role USING (true);

-- Step 2: Fix constraint issues 
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Remove email constraints
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
DROP INDEX IF EXISTS profiles_email_key;
DROP INDEX IF EXISTS profiles_email_idx;
DROP INDEX IF EXISTS profiles_email_unique_idx;

-- Step 4: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create simple helper function
CREATE OR REPLACE FUNCTION create_profile_safely(
  user_id UUID,
  user_email TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
    RETURN 'Profile already exists';
  END IF;
  
  -- Try to create it with email
  BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (user_id, user_email);
    RETURN 'Profile created successfully';
  EXCEPTION 
    WHEN OTHERS THEN
      -- Try with null email as last resort
      BEGIN
        INSERT INTO public.profiles (id) VALUES (user_id);
        RETURN 'Profile created with null email';
      EXCEPTION
        WHEN OTHERS THEN
          RETURN 'Failed to create profile';
      END;
  END;
END;
$$;

-- Step 6: Create profiles for existing users
INSERT INTO public.profiles (id, email)
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT DO NOTHING;

COMMIT; 
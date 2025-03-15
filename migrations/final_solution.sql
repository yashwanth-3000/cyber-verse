-- FINAL SOLUTION: SECURE SERVICE ROLE POLICIES
-- This script adds service role policies with proper foreign key constraint handling

-- Service role policies (most important part)
DROP POLICY IF EXISTS "Service role can select any profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert any profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can delete any profile" ON public.profiles;

CREATE POLICY "Service role can select any profile" ON public.profiles FOR SELECT TO service_role USING (true);
CREATE POLICY "Service role can insert any profile" ON public.profiles FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can update any profile" ON public.profiles FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service role can delete any profile" ON public.profiles FOR DELETE TO service_role USING (true);

-- Make email nullable to avoid issues with email constraints
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- Ensure foreign key constraint exists and is properly set up
-- (This won't run if there would be data integrity issues)
DO $$
BEGIN
  -- Only modify the constraint if it doesn't exist correctly
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_id_fkey' 
    AND conrelid = 'public.profiles'::regclass
  ) THEN
    -- Only try to create it if it doesn't exist
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
    
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Create a safe profile creation function for the service role
CREATE OR REPLACE FUNCTION safely_create_profile_for_user(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- First check if the user exists in auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = user_id) INTO user_exists;
  
  IF NOT user_exists THEN
    RETURN 'Error: User does not exist';
  END IF;
  
  -- Check if profile already exists
  IF EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id) THEN
    RETURN 'Profile already exists';
  END IF;
  
  -- Create the profile
  BEGIN
    INSERT INTO public.profiles(id) VALUES (user_id);
    RETURN 'Profile created successfully';
  EXCEPTION
    WHEN OTHERS THEN
      RETURN 'Error creating profile: ' || SQLERRM;
  END;
END;
$$;

-- Make sure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Make sure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(id); 
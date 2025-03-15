-- CLEANUP AND FIX SCRIPT
-- This script first cleans up any invalid profiles before adding constraints

-- Begin transaction
BEGIN;

-- Step 1: Find any profiles that don't have matching users and delete them
DO $$
DECLARE
  orphaned_count INTEGER;
BEGIN
  -- Find and delete profiles without matching users 
  -- (This is a safe operation as these profiles are invalid anyway)
  DELETE FROM public.profiles
  WHERE id NOT IN (SELECT id FROM auth.users);
  
  GET DIAGNOSTICS orphaned_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % orphaned profiles without matching users', orphaned_count;
END $$;

-- Step 2: Now it's safe to reset the foreign key constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

RAISE NOTICE 'Foreign key constraint successfully added';

-- Step 3: Make sure email is nullable (to avoid constraints)
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- Step 4: Add service role policies (most important part)
DROP POLICY IF EXISTS "Service role can select any profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert any profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can delete any profile" ON public.profiles;

CREATE POLICY "Service role can select any profile" ON public.profiles FOR SELECT TO service_role USING (true);
CREATE POLICY "Service role can insert any profile" ON public.profiles FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can update any profile" ON public.profiles FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service role can delete any profile" ON public.profiles FOR DELETE TO service_role USING (true);

RAISE NOTICE 'Service role policies successfully added';

-- Make sure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

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

-- Summary output
DO $$
BEGIN
  RAISE NOTICE '---------------------------------------';
  RAISE NOTICE 'CLEANUP AND FIX COMPLETE';
  RAISE NOTICE '---------------------------------------';
  RAISE NOTICE 'The following actions were performed:';
  RAISE NOTICE '1. Deleted orphaned profile records';
  RAISE NOTICE '2. Added proper foreign key constraint';
  RAISE NOTICE '3. Made email column nullable';
  RAISE NOTICE '4. Added service role policies';
  RAISE NOTICE '5. Created safely_create_profile_for_user function';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Test profile creation with the /api/system/real-user-test endpoint';
  RAISE NOTICE '2. Try signing in with Google to verify authentication works';
  RAISE NOTICE '---------------------------------------';
END $$;

-- Commit all changes
COMMIT; 
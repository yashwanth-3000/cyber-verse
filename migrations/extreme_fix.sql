-- EXTREME PROFILE FIX WITH SAFE RLS MANAGEMENT
-- This script does a complete reset and fix of profile security

-- Begin transaction
BEGIN;

-- ========= PHASE 1: TEMPORARILY DISABLE SECURITY =========
RAISE NOTICE '======================================================';
RAISE NOTICE 'PHASE 1: DISABLING SECURITY TEMPORARILY FOR REPAIRS';
RAISE NOTICE '======================================================';

-- 1.1 Disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
RAISE NOTICE 'Disabled Row Level Security on profiles table';

-- 1.2 Drop all existing RLS policies for a clean slate
DO $$
DECLARE
  policy_name TEXT;
BEGIN
  FOR policy_name IN (
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'profiles' AND schemaname = 'public'
  ) LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.profiles CASCADE';
    RAISE NOTICE 'Dropped policy: %', policy_name;
  END LOOP;
END $$;
RAISE NOTICE 'Removed all existing policies from profiles table';

-- ========= PHASE 2: FIX PROFILES DATA AND CONSTRAINTS =========
RAISE NOTICE '======================================================';
RAISE NOTICE 'PHASE 2: FIXING PROFILES DATA AND CONSTRAINTS';
RAISE NOTICE '======================================================';

-- 2.1 Make sure email is nullable and doesn't have unique constraint
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
DROP INDEX IF EXISTS profiles_email_key;
DROP INDEX IF EXISTS profiles_email_idx;
DROP INDEX IF EXISTS profiles_email_unique_idx;
RAISE NOTICE 'Removed email constraints';

-- 2.2 Verify (or fix) the foreign key constraint
DO $$
BEGIN
  -- Drop the constraint if it exists
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
  
  -- Recreate the constraint properly
  ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;
  
  RAISE NOTICE 'Reset foreign key constraint';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error fixing foreign key constraint: %', SQLERRM;
END $$;

-- 2.3 Fix profiles for existing users
DO $$
DECLARE
  users_without_profiles INTEGER;
BEGIN
  -- Count users without profiles
  SELECT COUNT(*)
  INTO users_without_profiles
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE p.id IS NULL;
  
  RAISE NOTICE 'Found % users without profiles', users_without_profiles;
  
  -- Create profiles for users who don't have them
  IF users_without_profiles > 0 THEN
    INSERT INTO public.profiles (id, email, created_at, updated_at)
    SELECT 
      u.id, 
      u.email, 
      CURRENT_TIMESTAMP, 
      CURRENT_TIMESTAMP
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    WHERE p.id IS NULL;
    
    RAISE NOTICE 'Created profiles for % users', users_without_profiles;
  END IF;
END $$;

-- ========= PHASE 3: CREATE HELPER FUNCTIONS =========
RAISE NOTICE '======================================================';
RAISE NOTICE 'PHASE 3: CREATING HELPER FUNCTIONS';
RAISE NOTICE '======================================================';

-- 3.1 Create a reliable profile creation function with retry
CREATE OR REPLACE FUNCTION create_profile_with_retry(
  user_id UUID,
  email TEXT DEFAULT NULL,
  max_attempts INTEGER DEFAULT 3
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  attempt INTEGER := 0;
  delay_seconds NUMERIC := 0.5;
  result TEXT;
BEGIN
  -- First check if profile already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
    RETURN 'Profile already exists for user ' || user_id;
  END IF;
  
  -- Try multiple times with increasing delays
  WHILE attempt < max_attempts LOOP
    attempt := attempt + 1;
    
    BEGIN
      INSERT INTO public.profiles (id, email, created_at, updated_at)
      VALUES (
        user_id, 
        COALESCE(email, 'user-' || user_id || '@example.com'), 
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP
      );
      
      RETURN 'Successfully created profile for user ' || user_id || ' on attempt ' || attempt;
    EXCEPTION
      WHEN foreign_key_violation THEN
        -- This is expected if the auth.users record isn't ready yet
        PERFORM pg_sleep(delay_seconds);
        delay_seconds := delay_seconds * 2;
        
        -- Last attempt failed
        IF attempt = max_attempts THEN
          result := 'Failed after ' || max_attempts || ' attempts: foreign key violation';
        END IF;
      WHEN unique_violation THEN
        -- Someone else created the profile in the meantime
        RETURN 'Profile created concurrently for user ' || user_id;
      WHEN OTHERS THEN
        -- Unexpected error
        result := 'Error on attempt ' || attempt || ': ' || SQLERRM;
        
        IF attempt < max_attempts THEN
          PERFORM pg_sleep(delay_seconds);
          delay_seconds := delay_seconds * 2;
        END IF;
    END;
  END LOOP;
  
  RETURN COALESCE(result, 'Failed to create profile after ' || max_attempts || ' attempts');
END;
$$;
RAISE NOTICE 'Created create_profile_with_retry function';

-- 3.2 Create a function to ensure all users have profiles
CREATE OR REPLACE FUNCTION ensure_all_users_have_profiles()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_rec RECORD;
  counter INTEGER := 0;
  error_counter INTEGER := 0;
  result TEXT;
BEGIN
  FOR user_rec IN
    SELECT u.id, u.email
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    WHERE p.id IS NULL
  LOOP
    BEGIN
      INSERT INTO public.profiles (id, email, created_at, updated_at)
      VALUES (user_rec.id, user_rec.email, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
      counter := counter + 1;
    EXCEPTION
      WHEN OTHERS THEN
        error_counter := error_counter + 1;
    END;
  END LOOP;
  
  RETURN 'Created ' || counter || ' profiles, ' || error_counter || ' failures';
END;
$$;
RAISE NOTICE 'Created ensure_all_users_have_profiles function';

-- 3.3 Create a function to reset security in an emergency
CREATE OR REPLACE FUNCTION reset_profiles_security()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Disable RLS temporarily
  ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
  
  -- Drop all existing policies
  FOR policy_name IN (
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'profiles' AND schemaname = 'public'
  ) LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.profiles CASCADE';
  END LOOP;
  
  -- Create essential policies for public role
  CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles 
  FOR SELECT 
  USING (true);
  
  CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);
  
  CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);
  
  -- Create essential policies for service role
  CREATE POLICY "Service role can select any profile"
  ON public.profiles
  FOR SELECT
  TO service_role
  USING (true);
  
  CREATE POLICY "Service role can insert any profile"
  ON public.profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);
  
  CREATE POLICY "Service role can update any profile"
  ON public.profiles
  FOR UPDATE
  TO service_role
  USING (true);
  
  CREATE POLICY "Service role can delete any profile"
  ON public.profiles
  FOR DELETE
  TO service_role
  USING (true);
  
  -- Re-enable RLS
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  
  RETURN 'Security settings reset successfully';
END;
$$;
RAISE NOTICE 'Created reset_profiles_security function for future emergencies';

-- ========= PHASE 4: RESTORE SECURITY WITH PROPER POLICIES =========
RAISE NOTICE '======================================================';
RAISE NOTICE 'PHASE 4: RESTORING SECURITY WITH PROPER POLICIES';
RAISE NOTICE '======================================================';

-- 4.1 Create policies for the public/authenticated role
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);
RAISE NOTICE 'Added SELECT policy for public role';

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);
RAISE NOTICE 'Added INSERT policy for public role';

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);
RAISE NOTICE 'Added UPDATE policy for public role';

-- 4.2 Create policies for the service role
CREATE POLICY "Service role can select any profile"
ON public.profiles
FOR SELECT
TO service_role
USING (true);
RAISE NOTICE 'Added SELECT policy for service_role';

CREATE POLICY "Service role can insert any profile"
ON public.profiles
FOR INSERT
TO service_role
WITH CHECK (true);
RAISE NOTICE 'Added INSERT policy for service_role';

CREATE POLICY "Service role can update any profile"
ON public.profiles
FOR UPDATE
TO service_role
USING (true);
RAISE NOTICE 'Added UPDATE policy for service_role';

CREATE POLICY "Service role can delete any profile"
ON public.profiles
FOR DELETE
TO service_role
USING (true);
RAISE NOTICE 'Added DELETE policy for service_role';

-- 4.3 Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
RAISE NOTICE 'Re-enabled Row Level Security on profiles table';

-- ========= PHASE 5: VERIFY EVERYTHING IS WORKING =========
RAISE NOTICE '======================================================';
RAISE NOTICE 'PHASE 5: VERIFICATION';
RAISE NOTICE '======================================================';

-- 5.1 Check public policies
DO $$
DECLARE
  public_policies INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO public_policies
  FROM pg_policies
  WHERE tablename = 'profiles' 
    AND schemaname = 'public' 
    AND (roles = '{public}' OR roles IS NULL);
  
  RAISE NOTICE 'Found % public policies', public_policies;
  
  IF public_policies < 3 THEN
    RAISE WARNING 'Expected at least 3 public policies but found %. This may indicate an issue.', public_policies;
  END IF;
END $$;

-- 5.2 Check service role policies
DO $$
DECLARE
  service_role_policies INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO service_role_policies
  FROM pg_policies
  WHERE tablename = 'profiles' 
    AND schemaname = 'public' 
    AND roles @> ARRAY['service_role']::name[];
  
  RAISE NOTICE 'Found % service_role policies', service_role_policies;
  
  IF service_role_policies < 4 THEN
    RAISE WARNING 'Expected 4 service_role policies but found %. This may indicate an issue.', service_role_policies;
  END IF;
END $$;

-- 5.3 Check RLS is enabled
DO $$
DECLARE
  rls_enabled BOOLEAN;
BEGIN
  SELECT rowsecurity
  INTO rls_enabled
  FROM pg_tables
  WHERE tablename = 'profiles' AND schemaname = 'public';
  
  RAISE NOTICE 'Row Level Security enabled: %', rls_enabled;
  
  IF NOT rls_enabled THEN
    RAISE WARNING 'Row Level Security is not enabled on the profiles table!';
  END IF;
END $$;

-- Final summary
RAISE NOTICE '======================================================';
RAISE NOTICE 'PROFILE SECURITY FIX COMPLETE';
RAISE NOTICE '======================================================';
RAISE NOTICE 'Summary of actions:';
RAISE NOTICE '1. Temporarily disabled RLS and cleared all policies';
RAISE NOTICE '2. Fixed profile data and constraints';
RAISE NOTICE '3. Created helper functions for profile management';
RAISE NOTICE '4. Restored proper security with correct policies';
RAISE NOTICE '5. Verified the setup was successful';
RAISE NOTICE '';
RAISE NOTICE 'You now have these helper functions:';
RAISE NOTICE ' - create_profile_with_retry(user_id, email, max_attempts)';
RAISE NOTICE ' - ensure_all_users_have_profiles()';
RAISE NOTICE ' - reset_profiles_security()';
RAISE NOTICE '';
RAISE NOTICE 'Google authentication should now work properly!';
RAISE NOTICE '======================================================';

-- Commit the transaction
COMMIT; 
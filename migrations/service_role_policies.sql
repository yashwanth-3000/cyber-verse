-- SERVICE ROLE POLICIES FOR PROFILES TABLE
-- This script adds the necessary policies for the service role

-- Begin transaction
BEGIN;

-- Check if RLS is enabled, if not we need to enable it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'profiles' AND schemaname = 'public' AND rowsecurity = false
  ) THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled Row Level Security on profiles table';
  END IF;
END $$;

-- Add service role policies (will replace if they already exist)
DROP POLICY IF EXISTS "Service role can select any profile" ON public.profiles;
CREATE POLICY "Service role can select any profile"
  ON public.profiles
  FOR SELECT
  TO service_role
  USING (true);
RAISE NOTICE 'Added SELECT policy for service_role';

DROP POLICY IF EXISTS "Service role can insert any profile" ON public.profiles;
CREATE POLICY "Service role can insert any profile"
  ON public.profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);
RAISE NOTICE 'Added INSERT policy for service_role';

DROP POLICY IF EXISTS "Service role can update any profile" ON public.profiles;
CREATE POLICY "Service role can update any profile"
  ON public.profiles
  FOR UPDATE
  TO service_role
  USING (true);
RAISE NOTICE 'Added UPDATE policy for service_role';

DROP POLICY IF EXISTS "Service role can delete any profile" ON public.profiles;
CREATE POLICY "Service role can delete any profile"
  ON public.profiles
  FOR DELETE
  TO service_role
  USING (true);
RAISE NOTICE 'Added DELETE policy for service_role';

-- Verify policies exist
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO policy_count
  FROM pg_policies
  WHERE tablename = 'profiles' AND schemaname = 'public' AND roles @> ARRAY['service_role']::name[];
  
  RAISE NOTICE 'Found % policies for service_role on profiles table', policy_count;
  
  IF policy_count < 4 THEN
    RAISE WARNING 'Expected 4 service_role policies but found %. Check for errors above.', policy_count;
  ELSE
    RAISE NOTICE 'Successfully added all required service_role policies';
  END IF;
END $$;

-- Commit the transaction
COMMIT; 
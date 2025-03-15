-- TEST HELPER FUNCTIONS
-- This script adds helper functions needed for testing profile creation

-- Begin transaction
BEGIN;

-- Create a function to safely get users (since auth.users can't be directly accessed)
CREATE OR REPLACE FUNCTION get_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This approach uses the fact that public.profiles references auth.users
  -- We can get all user IDs that have auth (whether they have profiles or not)
  RETURN QUERY
  SELECT au.id, au.email, au.created_at
  FROM auth.users au
  LIMIT 5;
EXCEPTION
  WHEN insufficient_privilege THEN
    -- Fallback: try to get some users by finding recent signups
    RETURN QUERY
    SELECT p.id, p.email, p.created_at
    FROM public.profiles p
    ORDER BY p.created_at DESC
    LIMIT 5;
END;
$$;

-- Make sure the function works by testing it
DO $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Test if the function returns users
  SELECT COUNT(*) INTO user_count FROM get_users();
  
  RAISE NOTICE 'get_users() function returns % rows', user_count;
  
  IF user_count = 0 THEN
    RAISE WARNING 'No users found - you might need to create a user first';
  END IF;
END $$;

-- Create a mini-test function to check if service role policies work
CREATE OR REPLACE FUNCTION test_service_role_policies()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Build a JSON result with information about the service role policies
  SELECT json_build_object(
    'rls_enabled', (
      SELECT rowsecurity FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'profiles'
    ),
    'policies', (
      SELECT json_agg(json_build_object(
        'policy_name', policyname,
        'operation', cmd,
        'roles', roles
      ))
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'profiles'
      AND roles @> ARRAY['service_role']::name[]
    ),
    'profile_count', (
      SELECT COUNT(*) FROM public.profiles
    ),
    'test_info', 'Run from test_service_role_policies()'
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create a function to test direct profile creation
CREATE OR REPLACE FUNCTION test_profile_creation()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_user_id UUID;
  result JSON;
  create_result TEXT;
BEGIN
  -- Try to find a user to test with
  SELECT id INTO test_user_id FROM get_users() LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No test users found',
      'suggestion', 'Create a user account first'
    );
  END IF;
  
  -- First delete the profile if it exists (for testing)
  DELETE FROM public.profiles WHERE id = test_user_id;
  
  -- Try to create a profile with our function
  SELECT safely_create_profile_for_user(test_user_id) INTO create_result;
  
  -- Check if it worked
  SELECT json_build_object(
    'success', (
      SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = test_user_id)
    ),
    'test_user_id', test_user_id,
    'function_result', create_result,
    'message', 'Test completed'
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Summary output
RAISE NOTICE '---------------------------------------';
RAISE NOTICE 'TEST HELPER FUNCTIONS CREATED';
RAISE NOTICE '---------------------------------------';
RAISE NOTICE 'The following functions were created:';
RAISE NOTICE '1. get_users() - Function to get user data safely';
RAISE NOTICE '2. test_service_role_policies() - Check if policies are set up';
RAISE NOTICE '3. test_profile_creation() - Test creating a profile';
RAISE NOTICE '';
RAISE NOTICE 'You can test these functions in the SQL editor:';
RAISE NOTICE 'SELECT * FROM get_users();';
RAISE NOTICE 'SELECT test_service_role_policies();';
RAISE NOTICE 'SELECT test_profile_creation();';
RAISE NOTICE '---------------------------------------';

COMMIT; 
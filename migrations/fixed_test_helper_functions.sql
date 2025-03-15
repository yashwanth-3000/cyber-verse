-- FIXED TEST HELPER FUNCTIONS
-- This script adds helper functions needed for testing profile creation

-- Begin transaction
BEGIN;

-- Create a function to safely get users (since auth.users can't be directly accessed)
-- WITH TYPE CASTING to avoid type mismatch errors
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
  -- Use explicit type casting to TEXT for the email column
  RETURN QUERY
  SELECT au.id, au.email::TEXT, au.created_at
  FROM auth.users au
  LIMIT 5;
EXCEPTION
  WHEN insufficient_privilege THEN
    -- Fallback: try to get some users by finding recent signups
    RETURN QUERY
    SELECT p.id, p.email::TEXT, p.created_at
    FROM public.profiles p
    ORDER BY p.created_at DESC
    LIMIT 5;
END;
$$;

-- Let's try a completely different approach if the above doesn't work
CREATE OR REPLACE FUNCTION get_first_user()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Try to get a user ID directly from auth.users
  BEGIN
    SELECT id INTO user_id FROM auth.users LIMIT 1;
    
    IF user_id IS NOT NULL THEN
      RETURN user_id;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- Ignore any errors
      NULL;
  END;
  
  -- If that doesn't work, try getting from profiles
  SELECT id INTO user_id FROM public.profiles LIMIT 1;
  
  RETURN user_id;
END;
$$;

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
  -- Try to find a user to test with using our alternative approach
  SELECT get_first_user() INTO test_user_id;
  
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

-- Simple function to directly test a profile creation
CREATE OR REPLACE FUNCTION directly_create_test_profile()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Try to find a user to test with
  SELECT get_first_user() INTO test_user_id;
  
  IF test_user_id IS NULL THEN
    RETURN 'Error: No users found in the database';
  END IF;
  
  -- First delete the profile if it exists (for testing)
  BEGIN
    DELETE FROM public.profiles WHERE id = test_user_id;
    EXCEPTION WHEN OTHERS THEN
      -- Ignore errors
      NULL;
  END;
  
  -- Try direct insertion
  BEGIN
    INSERT INTO public.profiles(id) VALUES (test_user_id);
    RETURN 'Success: Created profile for user ' || test_user_id;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN 'Error creating profile: ' || SQLERRM;
  END;
END;
$$;

-- Summary output
RAISE NOTICE '---------------------------------------';
RAISE NOTICE 'FIXED TEST HELPER FUNCTIONS CREATED';
RAISE NOTICE '---------------------------------------';
RAISE NOTICE 'The following functions were created:';
RAISE NOTICE '1. get_users() - Function to get user data safely (with type casting)';
RAISE NOTICE '2. get_first_user() - Alternative function to get a user ID';
RAISE NOTICE '3. test_service_role_policies() - Check if policies are set up';
RAISE NOTICE '4. test_profile_creation() - Test creating a profile';
RAISE NOTICE '5. directly_create_test_profile() - Simple direct test';
RAISE NOTICE '';
RAISE NOTICE 'You can test these functions in the SQL editor:';
RAISE NOTICE 'SELECT * FROM get_users();';
RAISE NOTICE 'SELECT get_first_user();';
RAISE NOTICE 'SELECT test_service_role_policies();';
RAISE NOTICE 'SELECT test_profile_creation();';
RAISE NOTICE 'SELECT directly_create_test_profile();';
RAISE NOTICE '---------------------------------------';

COMMIT; 
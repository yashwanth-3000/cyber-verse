-- SQL function for direct profile creation via RPC
-- This uses a more direct approach that bypasses some constraint checks

CREATE OR REPLACE FUNCTION create_profile_for_user(user_id UUID, user_email TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Execute with definer privileges (elevated)
AS $$
DECLARE
  success boolean := false;
BEGIN
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
    RAISE NOTICE 'Profile for user % already exists', user_id;
    RETURN true;
  END IF;

  -- Try direct insertion with minimal data
  BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (
      user_id,
      COALESCE(user_email, 'user-' || user_id || '-' || extract(epoch from now())::text || '@example.com')
    );
    
    success := true;
    RAISE NOTICE 'Successfully created profile for user %', user_id;
  EXCEPTION
    WHEN unique_violation THEN
      -- If we hit a unique violation, try with a guaranteed unique email
      BEGIN
        INSERT INTO public.profiles (id, email)
        VALUES (
          user_id,
          'user-' || user_id || '-' || extract(epoch from now())::text || '@example.com'
        );
        
        success := true;
        RAISE NOTICE 'Successfully created profile with fallback email for user %', user_id;
      EXCEPTION
        WHEN others THEN
          RAISE NOTICE 'Error in fallback profile creation: %', SQLERRM;
          success := false;
      END;
    WHEN others THEN
      RAISE NOTICE 'Error creating profile: %', SQLERRM;
      success := false;
  END;

  -- If all direct inserts failed, try inserting with null email as last resort
  IF NOT success THEN
    BEGIN
      INSERT INTO public.profiles (id, email)
      VALUES (user_id, NULL);
      
      success := true;
      RAISE NOTICE 'Successfully created profile with NULL email for user %', user_id;
    EXCEPTION
      WHEN others THEN
        RAISE NOTICE 'Final profile creation attempt also failed: %', SQLERRM;
        success := false;
    END;
  END IF;

  RETURN success;
END;
$$;

-- Create a helper function to ensure all users have profiles
CREATE OR REPLACE FUNCTION ensure_all_users_have_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_rec RECORD;
  created boolean;
BEGIN
  FOR user_rec IN
    SELECT id, email
    FROM auth.users au
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id)
  LOOP
    created := create_profile_for_user(user_rec.id, user_rec.email);
    
    IF created THEN
      RAISE NOTICE 'Created missing profile for user %', user_rec.id;
    ELSE
      RAISE NOTICE 'Failed to create profile for user %', user_rec.id;
    END IF;
  END LOOP;
END;
$$;

-- Function to try and fix a profile that's failing to be created
CREATE OR REPLACE FUNCTION fix_profile_for_user(user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  success boolean := false;
BEGIN
  -- First try to delete any partial profiles if they exist
  BEGIN
    DELETE FROM public.profiles WHERE id = user_id;
    RAISE NOTICE 'Deleted existing partial profile for user %', user_id;
  EXCEPTION
    WHEN others THEN
      RAISE NOTICE 'Could not delete existing profile: %', SQLERRM;
  END;
  
  -- Try creating profile with null values for everything optional
  BEGIN
    INSERT INTO public.profiles (
      id, 
      email,
      full_name,
      avatar_url,
      bio,
      website
    ) VALUES (
      user_id,
      'temp-' || replace(user_id::text, '-', '') || '@example.com',
      NULL,
      NULL,
      NULL,
      NULL
    );
    
    success := true;
    RAISE NOTICE 'Successfully created minimal profile for user %', user_id;
  EXCEPTION
    WHEN others THEN
      RAISE NOTICE 'Error creating minimal profile: %', SQLERRM;
      success := false;
  END;
  
  -- As a last resort, use direct SQL to bypass RLS
  IF NOT success THEN
    BEGIN
      -- Execute direct SQL to bypass any RLS issues
      EXECUTE 'INSERT INTO public.profiles (id) VALUES ($1)' USING user_id;
      
      success := true;
      RAISE NOTICE 'Successfully created profile via direct SQL for user %', user_id;
    EXCEPTION
      WHEN others THEN
        RAISE NOTICE 'Direct SQL profile creation failed: %', SQLERRM;
        success := false;
    END;
  END IF;
  
  RETURN success;
END;
$$; 
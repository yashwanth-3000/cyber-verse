-- TIMING FIX SCRIPT FOR PROFILE CREATION
-- This script addresses timing issues between auth.users and profiles tables

-- Begin transaction
BEGIN;

-- Create a function that attempts to create a profile with retries
CREATE OR REPLACE FUNCTION create_profile_with_retries(
  user_id UUID,
  user_email TEXT DEFAULT NULL,
  max_attempts INT DEFAULT 3
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  attempt INT := 0;
  last_error TEXT;
  success BOOLEAN := FALSE;
BEGIN
  -- Try multiple times with a short delay between attempts
  WHILE attempt < max_attempts AND NOT success LOOP
    BEGIN
      attempt := attempt + 1;
      
      -- First check if the profile already exists to avoid duplicate attempts
      IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
        RETURN 'Profile already exists for user ' || user_id;
      END IF;
      
      -- Try to insert the profile
      IF user_email IS NOT NULL THEN
        INSERT INTO profiles(id, email)
        VALUES(user_id, user_email);
      ELSE
        INSERT INTO profiles(id)
        VALUES(user_id);
      END IF;
      
      success := TRUE;
      RETURN 'Success: Created profile for user ' || user_id || ' on attempt ' || attempt;
    EXCEPTION
      WHEN foreign_key_violation THEN
        -- This is expected if auth.users entry isn't ready yet
        last_error := 'Foreign key constraint - user ID does not exist in auth.users yet';
        
        -- Don't retry on the last attempt
        IF attempt < max_attempts THEN
          -- Sleep for a short time before retrying (increasing with each attempt)
          PERFORM pg_sleep(attempt * 0.5); -- 0.5s, 1s, 1.5s
        END IF;
      WHEN unique_violation THEN
        -- Profile was created by another process between our check and insert
        RETURN 'Profile was created concurrently for user ' || user_id;
      WHEN others THEN
        -- Unexpected error
        last_error := SQLERRM;
        
        -- Don't retry on the last attempt
        IF attempt < max_attempts THEN
          PERFORM pg_sleep(0.5); -- Brief delay before retry
        END IF;
    END;
  END LOOP;
  
  -- If we get here, all attempts failed
  RETURN 'Error after ' || attempt || ' attempts: ' || last_error;
END;
$$;

-- Add a listen/notify function to handle profile creation asynchronously
CREATE OR REPLACE FUNCTION notify_profile_needed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- When a new user is created, notify a channel that a profile is needed
  PERFORM pg_notify(
    'profile_needed',
    json_build_object(
      'user_id', NEW.id,
      'email', NEW.email,
      'timestamp', extract(epoch from now())
    )::text
  );
  RETURN NEW;
END;
$$;

-- Check if the trigger already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'auth_user_created_profile_trigger'
  ) THEN
    -- Create a trigger on auth.users to notify when a new user is created
    -- This requires elevated permissions that might not be available
    BEGIN
      DROP TRIGGER IF EXISTS auth_user_created_profile_trigger ON auth.users;
      
      CREATE TRIGGER auth_user_created_profile_trigger
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION notify_profile_needed();
      
      RAISE NOTICE 'Created trigger on auth.users table';
    EXCEPTION
      WHEN insufficient_privilege THEN
        RAISE NOTICE 'Could not create trigger on auth.users due to permission restrictions. This is expected in many Supabase configurations.';
    END;
  END IF;
END
$$;

-- Make the create_minimal_profile function more resilient with retries
CREATE OR REPLACE FUNCTION create_minimal_profile(
  user_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Use the retry function internally
  RETURN create_profile_with_retries(user_id, NULL, 3);
END;
$$;

-- Test the function (this requires a valid UUID that exists in auth.users)
DO $$
BEGIN
  RAISE NOTICE 'Timing fix applied. You now have these improved functions:';
  RAISE NOTICE ' - create_profile_with_retries(user_id, email, max_attempts)';
  RAISE NOTICE ' - create_minimal_profile(user_id) - now with automatic retries';
END $$;

COMMIT; 
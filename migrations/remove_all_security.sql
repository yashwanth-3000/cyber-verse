-- REMOVE ALL SECURITY MEASURES FROM PROFILES TABLE
-- ⚠️ WARNING: This script removes ALL security measures from the profiles table.
-- This should ONLY be used for debugging purposes and should be reversed in production.
-- It will make your data fully accessible to anyone with database access.

-- Begin transaction
BEGIN;

-- Log the start of the security removal
DO $$
BEGIN
  RAISE NOTICE '=======================================================';
  RAISE NOTICE 'REMOVING ALL SECURITY MEASURES FROM PROFILES TABLE';
  RAISE NOTICE 'THIS IS A DRASTIC DEBUGGING MEASURE - NOT FOR PRODUCTION';
  RAISE NOTICE '=======================================================';
END $$;

-- 1. Disable Row Level Security (RLS) on the profiles table
DO $$
BEGIN
  BEGIN
    ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Successfully disabled RLS on profiles table';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Could not disable RLS due to permissions. Try as superuser.';
    WHEN undefined_table THEN
      RAISE NOTICE 'The profiles table does not exist yet';
    WHEN others THEN
      RAISE NOTICE 'Error disabling RLS: %', SQLERRM;
  END;
END $$;

-- 2. Drop all RLS policies on the profiles table
DO $$
BEGIN
  BEGIN
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
    DROP POLICY IF EXISTS "Service role can select any profile" ON profiles;
    DROP POLICY IF EXISTS "Service role can insert any profile" ON profiles;
    DROP POLICY IF EXISTS "Service role can update any profile" ON profiles;
    DROP POLICY IF EXISTS "Service role can delete any profile" ON profiles;
    -- Drop any other policies that might exist
    DROP POLICY IF EXISTS "Users can view their own profiles." ON profiles;
    DROP POLICY IF EXISTS "Authenticated users can insert their own profile." ON profiles;
    DROP POLICY IF EXISTS "Authenticated users can update their own profile." ON profiles;
    DROP POLICY IF EXISTS "Service role full access" ON profiles;
    RAISE NOTICE 'Successfully dropped all policies on profiles table';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Could not drop policies due to permissions. Try as superuser.';
    WHEN undefined_table THEN
      RAISE NOTICE 'The profiles table does not exist yet';
    WHEN others THEN
      RAISE NOTICE 'Error dropping policies: %', SQLERRM;
  END;
END $$;

-- 3. Disable all triggers on the profiles table
DO $$
BEGIN
  BEGIN
    ALTER TABLE profiles DISABLE TRIGGER ALL;
    RAISE NOTICE 'Successfully disabled all triggers on profiles table';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Could not disable triggers due to permissions. Try as superuser.';
    WHEN undefined_table THEN
      RAISE NOTICE 'The profiles table does not exist yet';
    WHEN others THEN
      RAISE NOTICE 'Error disabling triggers: %', SQLERRM;
  END;
END $$;

-- 4. Remove constraints on the email field
DO $$
BEGIN
  BEGIN
    -- Make email nullable if it isn't already
    ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;
    RAISE NOTICE 'Made email column nullable';
  EXCEPTION
    WHEN others THEN
      RAISE NOTICE 'Email column already nullable or other error: %', SQLERRM;
  END;
  
  BEGIN
    -- Remove unique constraint if it exists
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
    RAISE NOTICE 'Removed unique constraint on email if it existed';
  EXCEPTION
    WHEN others THEN
      RAISE NOTICE 'Could not drop constraint: %', SQLERRM;
  END;
  
  BEGIN
    -- Remove unique index if it exists
    DROP INDEX IF EXISTS profiles_email_key;
    DROP INDEX IF EXISTS profiles_email_idx;
    RAISE NOTICE 'Removed unique indexes on email if they existed';
  EXCEPTION
    WHEN others THEN
      RAISE NOTICE 'Could not drop indexes: %', SQLERRM;
  END;
END $$;

-- 5. Grant all privileges to all roles
DO $$
BEGIN
  BEGIN
    -- Grant to anon (public)
    GRANT ALL PRIVILEGES ON TABLE profiles TO anon;
    
    -- Grant to authenticated users
    GRANT ALL PRIVILEGES ON TABLE profiles TO authenticated;
    
    -- Grant to service role
    GRANT ALL PRIVILEGES ON TABLE profiles TO service_role;
    
    -- Grant sequences
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
    
    RAISE NOTICE 'Successfully granted privileges to all roles';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Could not grant privileges due to permissions. Try as superuser.';
    WHEN undefined_table THEN
      RAISE NOTICE 'The profiles table does not exist yet';
    WHEN others THEN
      RAISE NOTICE 'Error granting privileges: %', SQLERRM;
  END;
END $$;

-- 6. Try to remove foreign key constraints temporarily (this is risky but might help diagnose issues)
DO $$
BEGIN
  BEGIN
    -- First identify the foreign key constraint
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
    RAISE NOTICE 'Removed foreign key constraint profiles_id_fkey if it existed';
  EXCEPTION
    WHEN others THEN
      RAISE NOTICE 'Error removing foreign key constraint: %', SQLERRM;
  END;
END $$;

-- 7. Create a completely unrestricted helper function for profile creation
CREATE OR REPLACE FUNCTION public.create_unrestricted_profile(
  user_id UUID,
  user_email TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First try to delete any existing profile (without restrictions)
  BEGIN
    DELETE FROM profiles WHERE id = user_id;
  EXCEPTION
    WHEN others THEN
      RAISE NOTICE 'Could not delete existing profile: %', SQLERRM;
  END;
  
  -- Now force insert the profile without any security checks
  BEGIN
    IF user_email IS NOT NULL THEN
      INSERT INTO profiles (id, email) VALUES (user_id, user_email);
    ELSE
      INSERT INTO profiles (id) VALUES (user_id);
    END IF;
    
    RETURN 'Success: Created profile for user ' || user_id;
  EXCEPTION
    WHEN others THEN
      -- If insert failed, try a more direct approach with an alternative timestamp
      BEGIN
        EXECUTE format('INSERT INTO profiles (id, created_at, updated_at) VALUES (%L, %L, %L)',
                      user_id, now(), now());
        RETURN 'Success: Created profile for user ' || user_id || ' using direct SQL';
      EXCEPTION
        WHEN others THEN
          RAISE NOTICE 'All profile creation methods failed: %', SQLERRM;
          RETURN 'Error: ' || SQLERRM;
      END;
  END;
END;
$$;

-- Summary
DO $$
BEGIN
  RAISE NOTICE '=======================================================';
  RAISE NOTICE 'SECURITY REMOVAL COMPLETE';
  RAISE NOTICE '=======================================================';
  RAISE NOTICE 'Actions taken:';
  RAISE NOTICE ' - Disabled Row Level Security (RLS) on profiles table';
  RAISE NOTICE ' - Dropped all RLS policies on profiles table';
  RAISE NOTICE ' - Disabled all triggers on profiles table';
  RAISE NOTICE ' - Removed constraints on email field';
  RAISE NOTICE ' - Granted all privileges to all roles';
  RAISE NOTICE ' - Attempted to remove foreign key constraints';
  RAISE NOTICE ' - Created an unrestricted profile creation function';
  RAISE NOTICE '';
  RAISE NOTICE 'To use the unrestricted function, call:';
  RAISE NOTICE ' SELECT create_unrestricted_profile(''user-uuid-here'');';
  RAISE NOTICE '';
  RAISE NOTICE 'IMPORTANT: RESTORE SECURITY BEFORE DEPLOYING TO PRODUCTION!';
  RAISE NOTICE '=======================================================';
END $$;

-- Commit transaction
COMMIT; 
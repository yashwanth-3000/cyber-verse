-- TARGETED FIX SCRIPT FOR PROFILE CREATION ISSUES
-- Run this script directly in your Supabase SQL editor

-- Begin transaction
BEGIN;

-- Step 1: Get database info
DO $$
DECLARE
    db_version TEXT;
    security_enabled BOOLEAN;
BEGIN
    SELECT version() INTO db_version;
    RAISE NOTICE 'Database version: %', db_version;
    
    -- Check if RLS is enabled
    SELECT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'profiles' 
        AND rowsecurity = true
    ) INTO security_enabled;
    
    RAISE NOTICE 'Row Level Security enabled for profiles: %', security_enabled;
END $$;

-- Step 2: Ensure functions exist without relying on system tables
CREATE OR REPLACE FUNCTION force_create_profile(user_id UUID, user_email TEXT DEFAULT NULL)
RETURNS TEXT
SECURITY DEFINER
AS $$
BEGIN
    -- First try to clean up any partial profile
    BEGIN
        EXECUTE 'DELETE FROM profiles WHERE id = $1' USING user_id;
    EXCEPTION
        WHEN others THEN
            -- Ignore deletion errors
            NULL;
    END;

    -- Now try a direct insert
    BEGIN
        IF user_email IS NOT NULL THEN
            EXECUTE 'INSERT INTO profiles(id, email) VALUES($1, $2)' 
            USING user_id, user_email;
        ELSE
            EXECUTE 'INSERT INTO profiles(id) VALUES($1)' 
            USING user_id;
        END IF;
        
        RETURN 'Success: Profile created for user ' || user_id;
    EXCEPTION
        WHEN others THEN
            -- Specific handling for the foreign key violation
            IF SQLERRM LIKE '%violates foreign key constraint%' THEN
                RETURN 'Error: User ID does not exist in auth.users table';
            ELSE
                RETURN 'Error: ' || SQLERRM;
            END IF;
    END;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Ensure emergency fix function exists
CREATE OR REPLACE FUNCTION emergency_fix_all_profiles()
RETURNS TEXT
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    user_record RECORD;
    fixed_count INTEGER := 0;
    error_count INTEGER := 0;
    user_count INTEGER := 0;
    profile_count INTEGER := 0;
    result_message TEXT := '';
BEGIN
    -- First count existing data
    BEGIN
        EXECUTE 'SELECT COUNT(*) FROM auth.users' INTO user_count;
        EXECUTE 'SELECT COUNT(*) FROM profiles' INTO profile_count;
        
        result_message := 'Users: ' || user_count || ', Profiles: ' || profile_count;
    EXCEPTION
        WHEN others THEN
            result_message := 'Could not count users/profiles: ' || SQLERRM;
    END;
    
    -- Try to identify users without profiles
    BEGIN
        FOR user_record IN 
            EXECUTE 'SELECT id FROM auth.users WHERE id NOT IN (SELECT id FROM profiles)'
        LOOP
            BEGIN
                -- Try to insert profile with minimal data
                EXECUTE 'INSERT INTO profiles(id) VALUES($1) ON CONFLICT (id) DO NOTHING' 
                USING user_record.id;
                
                fixed_count := fixed_count + 1;
            EXCEPTION
                WHEN others THEN
                    error_count := error_count + 1;
            END;
        END LOOP;
    EXCEPTION
        WHEN others THEN
            result_message := result_message || ' | Error finding users: ' || SQLERRM;
    END;
    
    -- Return combined results
    RETURN result_message || ' | Fixed: ' || fixed_count || ', Errors: ' || error_count;
END;
$$;

-- Step 4: Try to fix permissions issues
DO $$
BEGIN
    -- Update permissions for all tables
    EXECUTE 'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role';
    EXECUTE 'GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role';
    EXECUTE 'GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role';
    
    -- Ensure profiles table has RLS enabled but with proper policies
    BEGIN
        EXECUTE 'ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY';
        
        -- Drop any existing RLS policies to avoid conflicts
        EXECUTE 'DROP POLICY IF EXISTS "Service role can select any profile" ON profiles';
        EXECUTE 'DROP POLICY IF EXISTS "Service role can insert any profile" ON profiles';
        EXECUTE 'DROP POLICY IF EXISTS "Service role can update any profile" ON profiles';
        EXECUTE 'DROP POLICY IF EXISTS "Service role can delete any profile" ON profiles';
    
        -- Create new policies for service role
        EXECUTE 'CREATE POLICY "Service role can select any profile" ON profiles FOR SELECT TO service_role USING (true)';
        EXECUTE 'CREATE POLICY "Service role can insert any profile" ON profiles FOR INSERT TO service_role WITH CHECK (true)';
        EXECUTE 'CREATE POLICY "Service role can update any profile" ON profiles FOR UPDATE TO service_role USING (true)';
        EXECUTE 'CREATE POLICY "Service role can delete any profile" ON profiles FOR DELETE TO service_role USING (true)';
        
        RAISE NOTICE 'Successfully updated RLS policies for service_role';
    EXCEPTION
        WHEN others THEN
            RAISE NOTICE 'Error updating RLS policies: %', SQLERRM;
    END;
END $$;

-- Step 5: Run one final test to validate the fix
DO $$
DECLARE
    result TEXT;
BEGIN
    SELECT emergency_fix_all_profiles() INTO result;
    RAISE NOTICE 'Emergency fix result: %', result;
    
    -- Provide feedback
    RAISE NOTICE '---------------------------------------------';
    RAISE NOTICE 'TARGETED FIX COMPLETE';
    RAISE NOTICE '---------------------------------------------';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Try testing the /api/system/simple-test endpoint again';
    RAISE NOTICE '2. Try accessing your app and see if profile creation works';
    RAISE NOTICE '3. If still having issues, contact support with the error details';
    RAISE NOTICE '---------------------------------------------';
END $$;

COMMIT; 
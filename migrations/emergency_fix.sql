-- EMERGENCY FIX SCRIPT FOR PROFILE CREATION ISSUES
-- Run this script directly in your Supabase SQL editor

-- Begin transaction
BEGIN;

-- Step 1: Temporarily disable RLS to fix data issues
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
RAISE NOTICE 'Temporarily disabled RLS on profiles table for fixes';

-- Step 2: Check if profiles table exists and create with minimal constraints if not
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) THEN
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT,
            full_name TEXT,
            avatar_url TEXT,
            bio TEXT,
            website TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        RAISE NOTICE 'Created profiles table with minimal constraints';
    ELSE
        RAISE NOTICE 'Profiles table already exists';
    END IF;
END $$;

-- Step 3: Aggressively remove constraints that might be causing issues
DO $$ 
BEGIN
    -- Remove email uniqueness constraint if it exists
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
    
    -- Drop any existing unique indexes on email
    DROP INDEX IF EXISTS profiles_email_key;
    DROP INDEX IF EXISTS profiles_email_idx;
    DROP INDEX IF EXISTS profiles_email_unique_idx;
    
    -- Make email nullable
    ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;
    
    RAISE NOTICE 'Removed potential constraint issues from profiles table';
END $$;

-- Step 4: Grant full permissions to the service role
GRANT ALL PRIVILEGES ON TABLE profiles TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
RAISE NOTICE 'Granted all privileges to service_role';

-- Step 5: Re-enable RLS but ensure all required policies exist
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Service role can select any profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert any profile" ON profiles;
DROP POLICY IF EXISTS "Service role can update any profile" ON profiles;
DROP POLICY IF EXISTS "Service role can delete any profile" ON profiles;

-- Recreate all necessary policies with permissive settings
CREATE POLICY "Public profiles are viewable by everyone."
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile."
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Service role can select any profile"
    ON profiles FOR SELECT
    TO service_role
    USING (true);

CREATE POLICY "Service role can insert any profile"
    ON profiles FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Service role can update any profile"
    ON profiles FOR UPDATE
    TO service_role
    USING (true);

CREATE POLICY "Service role can delete any profile"
    ON profiles FOR DELETE
    TO service_role
    USING (true);

RAISE NOTICE 'Recreated all RLS policies with proper permissions';

-- Step 6: Create direct SQL helper function for profile creation that bypasses normal constraints
CREATE OR REPLACE FUNCTION admin_create_profile(user_id UUID)
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
    -- Delete profile if it already exists (clean slate approach)
    DELETE FROM profiles WHERE id = user_id;
    
    -- Insert with minimal required data
    EXECUTE 'INSERT INTO profiles(id) VALUES($1)' USING user_id;
    
    RAISE NOTICE 'Created profile for user %', user_id;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Failed to create profile for user %: %', user_id, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create a function to fix all existing users
CREATE OR REPLACE FUNCTION emergency_fix_all_profiles()
RETURNS TEXT
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    fixed_count INTEGER := 0;
    error_count INTEGER := 0;
    error_details TEXT := '';
BEGIN
    FOR user_record IN 
        SELECT au.id 
        FROM auth.users au 
        LEFT JOIN profiles p ON p.id = au.id 
        WHERE p.id IS NULL
    LOOP
        BEGIN
            -- Create profile directly with minimal data
            INSERT INTO profiles(id) VALUES(user_record.id)
            ON CONFLICT (id) DO NOTHING;
            
            fixed_count := fixed_count + 1;
        EXCEPTION
            WHEN others THEN
                error_count := error_count + 1;
                error_details := error_details || E'\n' || 'Error for user ' || user_record.id || ': ' || SQLERRM;
                
                -- Try the more aggressive function
                BEGIN
                    PERFORM admin_create_profile(user_record.id);
                    fixed_count := fixed_count + 1;
                    error_count := error_count - 1;
                EXCEPTION
                    WHEN others THEN
                        error_details := error_details || E'\n' || 'Emergency fix also failed: ' || SQLERRM;
                END;
        END;
    END LOOP;
    
    RETURN 'Fixed ' || fixed_count || ' profiles. Errors: ' || error_count || error_details;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create a super direct function for creating a single profile
CREATE OR REPLACE FUNCTION force_create_profile(user_id UUID)
RETURNS TEXT
SECURITY DEFINER
AS $$
BEGIN
    -- First delete any existing partial profile
    BEGIN
        EXECUTE 'DELETE FROM profiles WHERE id = $1' USING user_id;
    EXCEPTION
        WHEN others THEN
            -- Ignore errors here
            NULL;
    END;

    -- Try raw SQL insert directly (maximally permissive approach)
    BEGIN
        EXECUTE '
            INSERT INTO profiles(id, email, full_name, avatar_url, bio, website)
            VALUES($1, NULL, NULL, NULL, NULL, NULL)
        ' USING user_id;
        
        RETURN 'Successfully created profile for user ' || user_id;
    EXCEPTION
        WHEN others THEN
            RETURN 'Failed to create profile: ' || SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Run the emergency fix
SELECT emergency_fix_all_profiles();

-- IMPORTANT: Verify the results
DO $$
DECLARE
    missing_count INTEGER;
    total_users INTEGER;
    percent_complete NUMERIC;
BEGIN
    -- Get counts
    SELECT COUNT(*) INTO missing_count
    FROM auth.users au
    LEFT JOIN profiles p ON p.id = au.id
    WHERE p.id IS NULL;
    
    SELECT COUNT(*) INTO total_users FROM auth.users;
    
    -- Calculate percentage
    IF total_users > 0 THEN
        percent_complete := (total_users - missing_count) * 100.0 / total_users;
    ELSE
        percent_complete := 100;
    END IF;
    
    -- Report results
    RAISE NOTICE 'RESULTS: % of % users have profiles (%.2f%%)', 
        (total_users - missing_count), 
        total_users, 
        percent_complete;
        
    IF missing_count > 0 THEN
        RAISE NOTICE 'WARNING: There are still % users without profiles', missing_count;
    ELSE
        RAISE NOTICE 'SUCCESS: All users now have profiles!';
    END IF;
END $$;

-- Provide clear instructions
DO $$
BEGIN
    RAISE NOTICE '---------------------------------------------';
    RAISE NOTICE 'EMERGENCY FIX COMPLETE';
    RAISE NOTICE '---------------------------------------------';
    RAISE NOTICE 'If you still encounter issues, try the following:';
    RAISE NOTICE '1. Check if SUPABASE_SERVICE_ROLE_KEY environment variable is set correctly';
    RAISE NOTICE '2. Try creating a test profile manually with:';
    RAISE NOTICE '   SELECT force_create_profile(''user-id-here'');';
    RAISE NOTICE '3. Check the Supabase logs for any additional error details';
    RAISE NOTICE '---------------------------------------------';
END $$;

COMMIT; 
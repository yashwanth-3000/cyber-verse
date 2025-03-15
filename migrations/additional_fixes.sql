-- Additional fixes for database profile creation issues

-- Add explicit SELECT policy for service role
DO $$
BEGIN
    DROP POLICY IF EXISTS "Service role can select any profile" ON profiles;
    
    CREATE POLICY "Service role can select any profile"
    ON profiles FOR SELECT
    TO service_role
    USING (true);
    
    RAISE NOTICE 'Added SELECT policy for service role';
END
$$;

-- Ensure email uniqueness constraint doesn't cause issues
DO $$
BEGIN
    -- Make email nullable (just to be sure)
    ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;
    
    -- Temporarily disable the email uniqueness constraint if it exists
    -- This is a more drastic approach, but might be necessary to fix the issue
    BEGIN
        ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
        RAISE NOTICE 'Dropped email uniqueness constraint';
    EXCEPTION
        WHEN others THEN
            RAISE NOTICE 'Could not drop email uniqueness constraint: %', SQLERRM;
    END;
    
    -- Re-add it as a partial unique index that ignores NULL values
    BEGIN
        DROP INDEX IF EXISTS profiles_email_unique_idx;
        CREATE UNIQUE INDEX profiles_email_unique_idx ON profiles (email) WHERE email IS NOT NULL;
        RAISE NOTICE 'Created partial unique index for email';
    EXCEPTION
        WHEN others THEN
            RAISE NOTICE 'Could not create partial unique index: %', SQLERRM;
    END;
END
$$;

-- Make sure the profiles table has the right structure
DO $$
DECLARE
    col_exists boolean;
BEGIN
    -- Check if all needed columns exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'bio'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        BEGIN
            ALTER TABLE profiles ADD COLUMN bio TEXT;
            RAISE NOTICE 'Added bio column to profiles table';
        EXCEPTION
            WHEN others THEN
                RAISE NOTICE 'Could not add bio column: %', SQLERRM;
        END;
    END IF;
    
    -- Check for website column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'website'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        BEGIN
            ALTER TABLE profiles ADD COLUMN website TEXT;
            RAISE NOTICE 'Added website column to profiles table';
        EXCEPTION
            WHEN others THEN
                RAISE NOTICE 'Could not add website column: %', SQLERRM;
        END;
    END IF;
    
    -- Ensure timestamps have default values
    BEGIN
        ALTER TABLE profiles 
        ALTER COLUMN created_at SET DEFAULT now(),
        ALTER COLUMN updated_at SET DEFAULT now();
        RAISE NOTICE 'Set default values for timestamps';
    EXCEPTION
        WHEN others THEN
            RAISE NOTICE 'Could not set default values for timestamps: %', SQLERRM;
    END;
END
$$;

-- Make sure all auth users have profiles
DO $$
DECLARE
    user_rec RECORD;
    profile_exists boolean;
BEGIN
    FOR user_rec IN 
        SELECT id, email FROM auth.users
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM profiles WHERE id = user_rec.id
        ) INTO profile_exists;
        
        IF NOT profile_exists THEN
            BEGIN
                INSERT INTO profiles (id, email)
                VALUES (user_rec.id, COALESCE(user_rec.email, 'user-' || substring(user_rec.id::text, 1, 8) || '@example.com'));
                RAISE NOTICE 'Created profile for user %', user_rec.id;
            EXCEPTION
                WHEN others THEN
                    RAISE NOTICE 'Could not create profile for user %: %', user_rec.id, SQLERRM;
                    
                    -- Try with a definitely unique email if there was an error
                    BEGIN
                        INSERT INTO profiles (id, email)
                        VALUES (user_rec.id, 'user-' || user_rec.id || '-' || extract(epoch from now())::bigint || '@example.com');
                        RAISE NOTICE 'Created profile for user % with fallback email', user_rec.id;
                    EXCEPTION
                        WHEN others THEN
                            RAISE NOTICE 'Could not create profile for user % even with fallback: %', user_rec.id, SQLERRM;
                    END;
            END;
        END IF;
    END LOOP;
END
$$;

-- Ensure the update_timestamp trigger exists and is attached to profiles
DO $$
BEGIN
    -- Create function if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'update_timestamp' 
        AND pronamespace = 'public'::regnamespace
    ) THEN
        CREATE OR REPLACE FUNCTION update_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        RAISE NOTICE 'Created update_timestamp function';
    END IF;
    
    -- Add trigger if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_profiles_timestamp'
        AND tgrelid = 'public.profiles'::regclass
    ) THEN
        CREATE TRIGGER update_profiles_timestamp
        BEFORE UPDATE ON profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp();
        
        RAISE NOTICE 'Created update_profiles_timestamp trigger';
    END IF;
END
$$;

-- Check for and report any remaining issues
DO $$
DECLARE
    issue_found boolean := false;
BEGIN
    -- Check for RLS
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE 'WARNING: Row Level Security is not enabled on profiles table!';
        issue_found := true;
    END IF;
    
    -- Count policies
    IF (
        SELECT COUNT(*) FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'profiles'
    ) < 3 THEN
        RAISE NOTICE 'WARNING: Fewer than expected RLS policies found on profiles table!';
        issue_found := true;
    END IF;
    
    -- Check for service role policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles'
        AND cmd = 'INSERT'
        AND roles = '{service_role}'
    ) THEN
        RAISE NOTICE 'WARNING: No INSERT policy for service_role found on profiles table!';
        issue_found := true;
    END IF;
    
    IF NOT issue_found THEN
        RAISE NOTICE 'All checks passed, no issues found.';
    END IF;
END
$$; 
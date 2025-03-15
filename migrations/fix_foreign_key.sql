-- CHECK AND FIX FOREIGN KEY CONSTRAINTS
-- This script inspects and attempts to fix issues with foreign key constraints

-- Begin transaction
BEGIN;

-- Get information about the foreign key constraints on the profiles table
DO $$
DECLARE
    constraint_info RECORD;
BEGIN
    RAISE NOTICE 'Checking foreign key constraints on profiles table...';
    
    -- Check if the foreign key constraint exists
    FOR constraint_info IN
        SELECT conname, pg_get_constraintdef(c.oid) as def
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        JOIN pg_namespace n ON t.relnamespace = n.oid
        WHERE t.relname = 'profiles'
        AND n.nspname = 'public'
        AND c.contype = 'f'
    LOOP
        RAISE NOTICE 'Found constraint %: %', constraint_info.conname, constraint_info.def;
    END LOOP;
    
    -- If no constraints were found, this might be an issue
    IF NOT FOUND THEN
        RAISE NOTICE 'No foreign key constraints found on profiles table';
    END IF;
END $$;

-- Check for users in auth.users without profiles
DO $$
DECLARE
    missing_profiles INTEGER;
BEGIN
    -- Count users without profiles
    SELECT COUNT(*)
    INTO missing_profiles
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    WHERE p.id IS NULL;
    
    RAISE NOTICE 'Found % users without profiles', missing_profiles;
    
    -- Create profiles for users that don't have them
    IF missing_profiles > 0 THEN
        RAISE NOTICE 'Attempting to create profiles for % users...', missing_profiles;
        
        -- Insert profiles with minimal data for users without them
        INSERT INTO public.profiles (id, email, created_at, updated_at)
        SELECT 
            u.id, 
            u.email, 
            CURRENT_TIMESTAMP, 
            CURRENT_TIMESTAMP
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.id
        WHERE p.id IS NULL;
        
        RAISE NOTICE 'Created profiles for users without them';
    END IF;
END $$;

-- Check if the id column is properly configured as a foreign key
DO $$
BEGIN
    -- See if the constraint exists but is incorrect
    IF EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        JOIN pg_namespace n ON t.relnamespace = n.oid
        WHERE t.relname = 'profiles'
        AND n.nspname = 'public'
        AND c.contype = 'f'
        AND c.conname = 'profiles_id_fkey'
    ) THEN
        RAISE NOTICE 'The foreign key constraint exists, no need to recreate';
    ELSE
        RAISE NOTICE 'Foreign key constraint missing or incorrectly named, attempting to recreate...';
        
        -- Try to drop any existing constraint with a different name
        BEGIN
            -- This query gets all foreign key constraints on the id column
            DO $$
            DECLARE
                constraint_name TEXT;
            BEGIN
                FOR constraint_name IN (
                    SELECT c.conname
                    FROM pg_constraint c
                    JOIN pg_class t ON c.conrelid = t.oid
                    JOIN pg_namespace n ON t.relnamespace = n.oid
                    JOIN pg_attribute a ON c.conrelid = a.attrelid
                    WHERE t.relname = 'profiles'
                    AND n.nspname = 'public'
                    AND c.contype = 'f'
                    AND a.attname = 'id'
                    AND a.attnum = ANY(c.conkey)
                ) LOOP
                    EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS ' || constraint_name;
                    RAISE NOTICE 'Dropped constraint: %', constraint_name;
                END LOOP;
            END;
            $$;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Error dropping existing constraints: %', SQLERRM;
        END;
        
        -- Create the correct constraint
        BEGIN
            ALTER TABLE public.profiles
            ADD CONSTRAINT profiles_id_fkey
            FOREIGN KEY (id)
            REFERENCES auth.users(id)
            ON DELETE CASCADE;
            
            RAISE NOTICE 'Successfully added foreign key constraint';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Error adding foreign key constraint: %', SQLERRM;
        END;
    END IF;
END $$;

-- Add a delay function for use in profile creation
CREATE OR REPLACE FUNCTION create_profile_with_retry(
    user_id UUID,
    max_attempts INTEGER DEFAULT 3,
    delay_seconds NUMERIC DEFAULT 1.0
)
RETURNS BOOLEAN AS $$
DECLARE
    attempt INTEGER := 0;
    success BOOLEAN := FALSE;
BEGIN
    WHILE attempt < max_attempts AND NOT success LOOP
        attempt := attempt + 1;
        
        -- Check if profile already exists
        IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
            RETURN TRUE;
        END IF;
        
        -- Try to insert the profile
        BEGIN
            INSERT INTO public.profiles (id, created_at, updated_at)
            VALUES (user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
            
            success := TRUE;
            RETURN TRUE;
        EXCEPTION
            WHEN foreign_key_violation THEN
                -- Wait for 'delay_seconds' before retrying
                PERFORM pg_sleep(delay_seconds);
                
                -- Exponential backoff
                delay_seconds := delay_seconds * 2;
            WHEN unique_violation THEN
                -- Profile was already created
                RETURN TRUE;
            WHEN OTHERS THEN
                -- Unexpected error
                RAISE NOTICE 'Error creating profile: %', SQLERRM;
                RETURN FALSE;
        END;
    END LOOP;
    
    RETURN success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

RAISE NOTICE 'Created create_profile_with_retry function for timing-sensitive profile creation';

-- Summary information
DO $$
BEGIN
    RAISE NOTICE '--------------------------------------';
    RAISE NOTICE 'Foreign key constraint check complete';
    RAISE NOTICE '--------------------------------------';
    RAISE NOTICE 'To create a profile with retry, use:';
    RAISE NOTICE 'SELECT create_profile_with_retry(''user-uuid-here'');';
    RAISE NOTICE '--------------------------------------';
END $$;

-- Commit the transaction
COMMIT; 
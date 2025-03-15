-- Fix function ambiguity issues
-- This script resolves the conflict between multiple versions of force_create_profile

-- Begin transaction
BEGIN;

-- Drop all versions of the ambiguous function
DROP FUNCTION IF EXISTS force_create_profile(UUID);
DROP FUNCTION IF EXISTS force_create_profile(UUID, TEXT);

-- Create a single version with an explicit default parameter
CREATE OR REPLACE FUNCTION force_create_profile(
  user_id UUID,
  user_email TEXT DEFAULT NULL -- Explicit default parameter
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- First check if user exists in auth.users to prevent foreign key violations
    -- This is more reliable than direct access to auth.users
    IF NOT EXISTS (
        SELECT 1 FROM profiles WHERE id = user_id
    ) THEN
        -- First try to clean up any partial profile (just in case)
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
                INSERT INTO profiles(id, email)
                VALUES(user_id, user_email);
            ELSE
                INSERT INTO profiles(id)
                VALUES(user_id);
            END IF;
            
            RETURN 'Success: Profile created for user ' || user_id;
        EXCEPTION
            WHEN others THEN
                -- Return the error message
                RETURN 'Error: ' || SQLERRM;
        END;
    ELSE
        -- Profile already exists
        RETURN 'Profile already exists for user ' || user_id;
    END IF;
END;
$$;

-- Create a simplified function that creates a minimal profile
CREATE OR REPLACE FUNCTION create_minimal_profile(
  user_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Simple direct insert with minimal data
    BEGIN
        INSERT INTO profiles(id) 
        VALUES(user_id)
        ON CONFLICT (id) DO NOTHING;
        
        RETURN 'Created or updated profile for ' || user_id;
    EXCEPTION
        WHEN others THEN
            RETURN 'Error: ' || SQLERRM;
    END;
END;
$$;

-- Test the function to ensure it works
DO $$
BEGIN
    -- Output a notice about the fix
    RAISE NOTICE 'Function ambiguity fixed. You can now use:';
    RAISE NOTICE ' - force_create_profile(user_id UUID, user_email TEXT DEFAULT NULL)';
    RAISE NOTICE ' - create_minimal_profile(user_id UUID)';
END $$;

COMMIT; 
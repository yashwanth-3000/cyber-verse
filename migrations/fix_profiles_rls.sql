-- Fix RLS policies for profiles table

-- Create policy to allow users to insert their own profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile"
        ON profiles FOR INSERT
        WITH CHECK (auth.uid() = id);
    END IF;
END
$$;

-- Create or replace policy to allow service role to insert any profile
DO $$
BEGIN
    -- Drop the policy if it exists
    DROP POLICY IF EXISTS "Service role can insert any profile" ON profiles;
    
    -- Create the policy
    CREATE POLICY "Service role can insert any profile"
    ON profiles FOR INSERT
    TO service_role
    WITH CHECK (true);
END
$$;

-- Create or replace policy to allow service role to update any profile
DO $$
BEGIN
    -- Drop the policy if it exists
    DROP POLICY IF EXISTS "Service role can update any profile" ON profiles;
    
    -- Create the policy
    CREATE POLICY "Service role can update any profile"
    ON profiles FOR UPDATE
    TO service_role
    USING (true);
END
$$;

-- Make email nullable in case we need to work around unique constraint issues
ALTER TABLE IF EXISTS profiles ALTER COLUMN email DROP NOT NULL;

-- Add a comment explaining the email constraint
COMMENT ON COLUMN profiles.email IS 'User email address. Can be null in rare cases where we need to avoid unique constraint violations.';

-- Check if table exists and report RLS policies
DO $$
DECLARE
    pol RECORD;
BEGIN
    RAISE NOTICE 'Checking profiles table...';
    
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) THEN
        RAISE NOTICE 'Profiles table exists.';
        
        -- Check if RLS is enabled
        IF EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' AND tablename = 'profiles' AND rowsecurity = true
        ) THEN
            RAISE NOTICE 'Row Level Security is enabled for profiles table.';
        ELSE
            RAISE NOTICE 'WARNING: Row Level Security is NOT enabled for profiles table.';
        END IF;
        
        -- List all policies on the profiles table
        RAISE NOTICE 'Policies on profiles table:';
        
        -- This will show the policies in the server log
        FOR pol IN 
            SELECT policyname, permissive, roles, cmd, qual, with_check 
            FROM pg_policies 
            WHERE tablename = 'profiles' AND schemaname = 'public'
        LOOP
            RAISE NOTICE 'Policy: %, Permissive: %, Roles: %, Command: %, Using: %, With Check: %', 
                pol.policyname, pol.permissive, pol.roles, pol.cmd, pol.qual, pol.with_check;
        END LOOP;
        
    ELSE
        RAISE NOTICE 'WARNING: Profiles table does not exist!';
        
        -- Suggest SQL to create the table
        RAISE NOTICE 'You can create the table with:';
        RAISE NOTICE '
        CREATE TABLE public.profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT UNIQUE,
          full_name TEXT,
          avatar_url TEXT,
          bio TEXT,
          website TEXT,
          created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
        );
        
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        ';
    END IF;
END
$$; 
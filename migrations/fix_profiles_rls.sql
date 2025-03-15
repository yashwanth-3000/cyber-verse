/*
Fix Profiles RLS Policies
--------------------------
This script ensures all necessary RLS policies are properly set up for the profiles table.
It will:
1. Enable RLS on the profiles table if not already enabled
2. Add all the necessary policies for both authenticated users and the service role
3. Fix common issues with the profiles table structure
*/

-- Begin transaction
BEGIN;

-- Check if the profiles table exists and create it if not
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
        
        -- Output message
        RAISE NOTICE 'Created profiles table';
    ELSE
        RAISE NOTICE 'Profiles table already exists';
    END IF;
END $$;

-- Make sure email is nullable
ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;

-- Remove unique constraint and replace with a partial index
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
DROP INDEX IF EXISTS profiles_email_unique_idx;
CREATE UNIQUE INDEX profiles_email_unique_idx ON profiles (email) WHERE email IS NOT NULL;

-- Add timestamp columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added created_at column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added updated_at column';
    END IF;
END $$;

-- Add optional columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'bio'
    ) THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
        RAISE NOTICE 'Added bio column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'website'
    ) THEN
        ALTER TABLE profiles ADD COLUMN website TEXT;
        RAISE NOTICE 'Added website column';
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Service role can select any profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert any profile" ON profiles;
DROP POLICY IF EXISTS "Service role can update any profile" ON profiles;
DROP POLICY IF EXISTS "Service role can delete any profile" ON profiles;

-- Create policies
-- Public users
CREATE POLICY "Public profiles are viewable by everyone."
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile."
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Service role (with unlimited access)
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

-- Create a trigger function for updating the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_profiles_timestamp ON profiles;
CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Generate an email for profiles that don't have one
UPDATE profiles 
SET email = CONCAT('user-', SUBSTRING(id::text, 1, 8), '@example.com')
WHERE email IS NULL;

-- Output summary
DO $$ 
BEGIN
    RAISE NOTICE 'RLS policies have been set up for the profiles table';
    RAISE NOTICE 'Profiles table structure has been checked and fixed if needed';
    RAISE NOTICE 'A trigger for updating the timestamp has been created';
END $$;

-- Commit the transaction
COMMIT; 
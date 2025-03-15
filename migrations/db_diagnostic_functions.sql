-- Create functions for database diagnostics and fixes

-- Function to create profiles table if it doesn't exist
CREATE OR REPLACE FUNCTION create_profiles_table_if_missing()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    -- Create the profiles table
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

    -- Enable RLS
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Create basic RLS policies
    CREATE POLICY "Public profiles are viewable by everyone"
      ON profiles FOR SELECT
      USING (true);
      
    CREATE POLICY "Users can update their own profile"
      ON profiles FOR UPDATE
      USING (auth.uid() = id);
      
    CREATE POLICY "Users can insert their own profile"
      ON profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
    
    -- Create timestamp trigger
    CREATE TRIGGER update_profiles_timestamp
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_timestamp();
      
    RAISE NOTICE 'Created profiles table with basic RLS policies';
  ELSE
    RAISE NOTICE 'Profiles table already exists';
  END IF;
END;
$$;

-- Function to add service role policies
CREATE OR REPLACE FUNCTION add_service_role_policies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Service role can insert any profile" ON profiles;
  DROP POLICY IF EXISTS "Service role can update any profile" ON profiles;
  
  -- Create service role policies
  CREATE POLICY "Service role can insert any profile"
    ON profiles FOR INSERT
    TO service_role
    WITH CHECK (true);
    
  CREATE POLICY "Service role can update any profile"
    ON profiles FOR UPDATE
    TO service_role
    USING (true);
    
  RAISE NOTICE 'Added service role policies to profiles table';
END;
$$;

-- Function to find users without profiles
CREATE OR REPLACE FUNCTION find_users_without_profiles()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    au.created_at
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.id = au.id
  WHERE p.id IS NULL
  ORDER BY au.created_at DESC;
END;
$$;

-- Function to find duplicate emails in profiles table
CREATE OR REPLACE FUNCTION find_duplicate_emails()
RETURNS TABLE (
  email TEXT,
  count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.email,
    COUNT(*) as count
  FROM profiles p
  WHERE p.email IS NOT NULL
  GROUP BY p.email
  HAVING COUNT(*) > 1
  ORDER BY COUNT(*) DESC;
END;
$$;

-- Function to fix duplicate emails by making all but one instance unique
CREATE OR REPLACE FUNCTION fix_duplicate_email(duplicate_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_rec RECORD;
  counter INT := 0;
  first_profile_id UUID;
BEGIN
  -- Get the first profile with this email to keep unchanged
  SELECT id INTO first_profile_id
  FROM profiles
  WHERE email = duplicate_email
  ORDER BY created_at
  LIMIT 1;
  
  -- Update all other profiles with this email to use a unique email
  FOR profile_rec IN 
    SELECT id
    FROM profiles
    WHERE email = duplicate_email
    AND id <> first_profile_id
  LOOP
    counter := counter + 1;
    
    UPDATE profiles
    SET email = 'user-' || profile_rec.id || '-' || NOW()::TIMESTAMPTZ::BIGINT || '@example.com'
    WHERE id = profile_rec.id;
    
    RAISE NOTICE 'Updated duplicate email for profile %', profile_rec.id;
  END LOOP;
  
  RAISE NOTICE 'Fixed % profiles with duplicate email %', counter, duplicate_email;
END;
$$;

-- Create update_timestamp function if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'update_timestamp' 
    AND pronamespace = 'public'::regnamespace
  ) THEN
    CREATE FUNCTION update_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    RAISE NOTICE 'Created update_timestamp function';
  END IF;
END
$$; 
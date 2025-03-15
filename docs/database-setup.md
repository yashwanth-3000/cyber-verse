# CyberVerse Database Setup

This document provides information about the database setup required for the CyberVerse application to function properly.

## Required Tables

### Profiles Table

The `profiles` table is essential for user authentication and profile management. It should have the following structure:

```sql
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
```

#### Key points:
- The `id` field must be the primary key and reference the `auth.users` table
- `email` should preferably be unique but nullable (to handle special cases)
- Timestamps should have defaults

## Required Policies

The following Row Level Security (RLS) policies need to be set up:

### For Public Users

```sql
-- Allow anyone to view public profiles
CREATE POLICY "Public profiles are viewable by everyone."
    ON profiles FOR SELECT
    USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile."
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile."
    ON profiles FOR UPDATE
    USING (auth.uid() = id);
```

### For Service Role (Admin Access)

```sql
-- Allow service role to select any profile
CREATE POLICY "Service role can select any profile"
    ON profiles FOR SELECT
    TO service_role
    USING (true);

-- Allow service role to insert any profile
CREATE POLICY "Service role can insert any profile"
    ON profiles FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Allow service role to update any profile
CREATE POLICY "Service role can update any profile"
    ON profiles FOR UPDATE
    TO service_role
    USING (true);

-- Allow service role to delete any profile
CREATE POLICY "Service role can delete any profile"
    ON profiles FOR DELETE
    TO service_role
    USING (true);
```

## Verify Your Setup

You can verify your database setup by running the following SQL in the Supabase SQL Editor:

```sql
-- Check if profiles table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'profiles'
);

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- List all RLS policies on the profiles table
SELECT policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';
```

## Environment Variables

Make sure you have these environment variables properly set:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

The `SUPABASE_SERVICE_ROLE_KEY` is especially important as it's used for creating profiles during user signup.

## Fixing Common Issues

If you encounter database issues:

1. Run the SQL scripts in the `migrations` folder in this order:
   - `fix_profiles_rls.sql` (sets up RLS policies)
   - `additional_fixes.sql` (fixes table structure)
   - `additional_functions.sql` (creates helper functions)

2. Make sure Row Level Security is enabled on the `profiles` table:
   ```sql
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ```

3. If the unique constraint on the email is causing issues, replace it with a partial index:
   ```sql
   ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
   DROP INDEX IF EXISTS profiles_email_unique_idx;
   CREATE UNIQUE INDEX profiles_email_unique_idx ON profiles (email) WHERE email IS NOT NULL;
   ```

4. Ensure all users have profiles by running:
   ```sql
   SELECT ensure_all_users_have_profiles();
   ```

If issues persist after trying these steps, refer to `docs/fix-profile-errors.md` for more comprehensive troubleshooting. 
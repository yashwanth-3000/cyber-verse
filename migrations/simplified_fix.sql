-- SIMPLIFIED FIX FOR PROFILE ISSUES
-- This script avoids complex nested blocks that might cause syntax errors

-- Begin transaction
BEGIN;

-- ===== PART 1: SERVICE ROLE POLICIES =====
RAISE NOTICE 'Adding service role policies...';

-- Add service role policies (will replace if they already exist)
DROP POLICY IF EXISTS "Service role can select any profile" ON public.profiles;
CREATE POLICY "Service role can select any profile"
  ON public.profiles
  FOR SELECT
  TO service_role
  USING (true);

DROP POLICY IF EXISTS "Service role can insert any profile" ON public.profiles;
CREATE POLICY "Service role can insert any profile"
  ON public.profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update any profile" ON public.profiles;
CREATE POLICY "Service role can update any profile"
  ON public.profiles
  FOR UPDATE
  TO service_role
  USING (true);

DROP POLICY IF EXISTS "Service role can delete any profile" ON public.profiles;
CREATE POLICY "Service role can delete any profile"
  ON public.profiles
  FOR DELETE
  TO service_role
  USING (true);

RAISE NOTICE 'Service role policies added successfully';

-- ===== PART 2: FOREIGN KEY CONSTRAINT =====
RAISE NOTICE 'Checking and fixing foreign key constraint...';

-- Drop any existing foreign key constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Recreate the constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

RAISE NOTICE 'Foreign key constraint fixed';

-- ===== PART 3: EMAIL CONSTRAINTS =====
RAISE NOTICE 'Removing email constraints...';

-- Make email nullable
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- Remove unique constraint if it exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_key;

-- Drop any indexes on email
DROP INDEX IF EXISTS profiles_email_key;
DROP INDEX IF EXISTS profiles_email_idx;
DROP INDEX IF EXISTS profiles_email_unique_idx;

RAISE NOTICE 'Email constraints removed';

-- ===== PART 4: CREATE HELPER FUNCTION =====
RAISE NOTICE 'Creating helper function...';

-- Create a reliable profile creation function
CREATE OR REPLACE FUNCTION create_profile_safely(
  user_id UUID,
  user_email TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result TEXT;
BEGIN
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
    RETURN 'Profile already exists';
  END IF;
  
  -- Try to create it
  BEGIN
    INSERT INTO public.profiles (id, email, created_at, updated_at)
    VALUES (
      user_id, 
      user_email, 
      CURRENT_TIMESTAMP, 
      CURRENT_TIMESTAMP
    );
    
    RETURN 'Profile created successfully';
  EXCEPTION 
    WHEN OTHERS THEN
      result := SQLERRM;
      
      -- If first attempt failed, try with a generated email
      BEGIN
        INSERT INTO public.profiles (id, email, created_at, updated_at)
        VALUES (
          user_id, 
          'user-' || user_id || '@example.com', 
          CURRENT_TIMESTAMP, 
          CURRENT_TIMESTAMP
        );
        
        RETURN 'Profile created with generated email';
      EXCEPTION
        WHEN OTHERS THEN
          -- Final attempt with minimal data
          BEGIN
            INSERT INTO public.profiles (id)
            VALUES (user_id);
            
            RETURN 'Profile created with minimal data';
          EXCEPTION
            WHEN OTHERS THEN
              RETURN 'Failed to create profile: ' || SQLERRM;
          END;
      END;
  END;
END;
$$;

RAISE NOTICE 'Helper function created';

-- ===== PART 5: VERIFY AND ENSURE RLS IS ENABLED =====
RAISE NOTICE 'Ensuring RLS is enabled...';

-- Enable RLS if not already
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

RAISE NOTICE 'RLS is now enabled';

-- Final message
RAISE NOTICE '=============================================';
RAISE NOTICE 'Profile fixes complete. You can now use the';
RAISE NOTICE 'create_profile_safely function to create profiles.';
RAISE NOTICE '=============================================';

-- Commit all changes
COMMIT; 
-- ABSOLUTE MINIMUM FIX
-- Just service role policies and nothing else

-- First, make sure email is nullable
ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;

-- Add service role policies (most important part)
DROP POLICY IF EXISTS "Service role can select any profile" ON profiles;
CREATE POLICY "Service role can select any profile" ON profiles FOR SELECT TO service_role USING (true);

DROP POLICY IF EXISTS "Service role can insert any profile" ON profiles;
CREATE POLICY "Service role can insert any profile" ON profiles FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update any profile" ON profiles;
CREATE POLICY "Service role can update any profile" ON profiles FOR UPDATE TO service_role USING (true);

DROP POLICY IF EXISTS "Service role can delete any profile" ON profiles;
CREATE POLICY "Service role can delete any profile" ON profiles FOR DELETE TO service_role USING (true);

-- Make sure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'Service role policies successfully added'; 
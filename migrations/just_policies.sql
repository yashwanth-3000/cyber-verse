-- JUST SERVICE ROLE POLICIES
-- Super simple script that only adds service role policies

-- Service role SELECT policy
DROP POLICY IF EXISTS "Service role can select any profile" ON public.profiles;
CREATE POLICY "Service role can select any profile"
ON public.profiles
FOR SELECT
TO service_role
USING (true);

-- Service role INSERT policy
DROP POLICY IF EXISTS "Service role can insert any profile" ON public.profiles;
CREATE POLICY "Service role can insert any profile"
ON public.profiles
FOR INSERT
TO service_role
WITH CHECK (true);

-- Service role UPDATE policy
DROP POLICY IF EXISTS "Service role can update any profile" ON public.profiles;
CREATE POLICY "Service role can update any profile"
ON public.profiles
FOR UPDATE
TO service_role
USING (true);

-- Service role DELETE policy
DROP POLICY IF EXISTS "Service role can delete any profile" ON public.profiles;
CREATE POLICY "Service role can delete any profile"
ON public.profiles
FOR DELETE
TO service_role
USING (true);

-- Make sure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY; 
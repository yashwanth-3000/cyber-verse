-- Add policy to allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Add policy to allow service role to insert any profile
CREATE POLICY "Service role can insert any profile"
ON profiles FOR INSERT
TO service_role
USING (true); 
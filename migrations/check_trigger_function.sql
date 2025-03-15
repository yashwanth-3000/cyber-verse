-- Function to check if a trigger exists
CREATE OR REPLACE FUNCTION check_for_trigger()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  );
END;
$$;

-- Function to manually create a profile for a user
CREATE OR REPLACE FUNCTION manual_create_profile(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Try to get the user's email from auth.users
  BEGIN
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = user_uuid;
  EXCEPTION
    WHEN OTHERS THEN
      user_email := NULL;
  END;
  
  -- Check if the profile already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_uuid) THEN
    RETURN 'Profile already exists for user ' || user_uuid;
  END IF;
  
  -- Try to create the profile
  BEGIN
    INSERT INTO profiles (id, email)
    VALUES (user_uuid, COALESCE(user_email, 'user-' || user_uuid || '@example.com'));
    
    RETURN 'Profile created for user ' || user_uuid;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN 'Error creating profile: ' || SQLERRM;
  END;
END;
$$; 
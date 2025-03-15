-- OAUTH FLOW FIX
-- This focuses specifically on fixing the OAuth profile creation

-- Create a special function for the OAuth hook
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
SECURITY DEFINER
LANGUAGE plpgsql 
AS $$
DECLARE
  attempts INTEGER := 0;
BEGIN
  -- Log for debugging
  RAISE LOG 'handle_new_user trigger called for user: %', NEW.id;
  
  -- Try up to 3 times with increasing delays
  WHILE attempts < 3 LOOP
    BEGIN
      attempts := attempts + 1;
      
      -- Check if profile already exists
      IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
        RAISE LOG 'Profile already exists for user: %', NEW.id;
        RETURN NEW;
      END IF;
      
      -- Create profile with minimal data
      INSERT INTO public.profiles (id, email)
      VALUES (NEW.id, NEW.email);
      
      RAISE LOG 'Profile created for user % on attempt %', NEW.id, attempts;
      RETURN NEW;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error details
        RAISE LOG 'Error creating profile for user % on attempt %: %', NEW.id, attempts, SQLERRM;
        
        -- Try again after delay, but only if not the last attempt
        IF attempts < 3 THEN
          PERFORM pg_sleep(attempts * 0.5); -- Increasing delay
        END IF;
    END;
  END LOOP;
  
  -- If we reach here, all attempts failed
  RAISE LOG 'All attempts to create profile for user % failed', NEW.id;
  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger that fires on user creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Function to manually create profile for OAuth users
CREATE OR REPLACE FUNCTION public.fix_oauth_profile(user_id UUID)
RETURNS TEXT
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = user_id;
  
  IF user_email IS NULL THEN
    RETURN 'User not found';
  END IF;
  
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
    RETURN 'Profile already exists';
  END IF;
  
  -- Create profile
  INSERT INTO public.profiles (id, email)
  VALUES (user_id, user_email);
  
  RETURN 'Profile created successfully';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$$; 
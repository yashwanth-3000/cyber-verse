# CyberVerse Database Fix Guide

This guide provides step-by-step instructions to fix the ongoing database issues with profile creation in CyberVerse.

## Emergency Fix Instructions

If you're encountering the error message:
```
The database could not save your user profile. This is a server configuration issue. Please contact support.
```

Follow these steps in order:

### Step 1: Run the Emergency Fix Script

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `migrations/emergency_fix.sql`
4. Run the script
5. Check the output for any errors or notices

This script performs the following actions:
- Temporarily disables RLS to fix data issues
- Removes any problematic constraints on the profiles table
- Grants full permissions to the service role
- Adds all necessary RLS policies
- Creates helper functions for profile creation
- Attempts to fix any existing profile issues

### Step 2: Check Your Environment Variables

Make sure your environment variables are correctly set by visiting:
```
https://your-site.com/api/system/check-env
```

This endpoint will verify:
- If the NEXT_PUBLIC_SUPABASE_URL is set and valid
- If the NEXT_PUBLIC_SUPABASE_ANON_KEY is set and appears valid
- If the SUPABASE_SERVICE_ROLE_KEY is set and appears valid
- If a connection with the service role can be established

**Important**: Ensure your SUPABASE_SERVICE_ROLE_KEY is correctly set. This is the most common cause of profile creation issues.

### Step 3: Test the Service Role

Visit the following endpoint to test if your service role is working correctly:
```
https://your-site.com/api/system/test-service-role
```

This will verify:
- Connection to the database
- Select permissions
- Insert permissions
- RLS policy configuration
- Service role bypass capabilities

### Step 4: Diagnose Database Issues Directly

For a more detailed diagnosis, run the SQL script directly in your Supabase SQL Editor:
```
-- Copy and paste the contents of migrations/test_service_role.sql
```

This will output detailed diagnostics about:
- Service role permissions
- RLS policies
- Database constraints
- Test profile creation attempts

## Additional Resources

If you need further assistance, we've created several documentation files:

1. `docs/fix-profile-errors.md` - Comprehensive step-by-step fix guide
2. `docs/database-setup.md` - Database setup requirements and verification
3. `docs/database-fixes.md` - Technical overview of all implemented fixes

## If All Else Fails

If you're still encountering issues after trying all the above steps:

1. Verify that your Supabase database has the correct structure:
   ```sql
   CREATE TABLE public.profiles (
     id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
     email TEXT,  -- Note: no uniqueness constraint or NOT NULL
     full_name TEXT,
     avatar_url TEXT,
     bio TEXT,
     website TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. Try creating a test profile directly in the SQL Editor:
   ```sql
   SELECT force_create_profile('00000000-0000-0000-0000-000000000001');
   ```

3. Check your Supabase logs for any specific error messages.

4. Make sure you've deployed the latest version of your application with all the fixes.

## Contact Support

If you continue to experience issues, please contact support with:
- The specific error message you're seeing
- Results from the diagnostic endpoints
- Your Supabase database setup details
- Any logs from your application when the error occurs

Email: support@cyberverse.com 
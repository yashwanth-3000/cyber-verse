# CyberVerse Troubleshooting Guide

This guide provides step-by-step instructions for diagnosing and fixing common issues with your CyberVerse application.

## Database Profile Creation Issues

If you're encountering errors like:
- "The database could not save your user profile. This is a server configuration issue."
- Empty error responses from the service role
- Function ambiguity errors

Follow these steps to resolve them:

### Step 1: Fix Function Ambiguity Issues

The first issue to tackle is the function ambiguity error in the database. This happens when multiple versions of the same function exist.

1. Go to your Supabase dashboard at https://app.supabase.com
2. Navigate to the SQL Editor
3. Copy and paste the contents of `migrations/fix_function_ambiguity.sql` 
4. Run the script
5. You should see confirmation that the ambiguity has been fixed

### Step 2: Test the Connection

After fixing the function ambiguity, test your connection using the diagnostic endpoints:

1. Visit `/api/system/simple-test` in your browser
2. This will show if your service role can connect and access the profiles table
3. If the tests pass, you're making progress!

### Step 3: Run the Targeted Fix Script

Next, apply the comprehensive database fixes:

1. Go to your Supabase SQL Editor
2. Copy and paste the contents of `migrations/targeted_fix.sql`
3. Run the script
4. This will:
   - Create properly defined functions
   - Set up appropriate RLS policies
   - Fix permissions issues
   - Update the profiles table as needed

### Step 4: Verify the Fix with Direct Profile Fix

Finally, test that profile creation is working:

1. Visit `/api/system/direct-profile-fix` in your browser
2. This endpoint will try multiple approaches to create profiles
3. If successful, you should see a response with successful tests

## Common Issues and Solutions

### Function Ambiguity Error

**Error message:** `Could not choose the best candidate function between: public.force_create_profile(user_id => uuid), public.force_create_profile(user_id => uuid, user_email => text)`

**Solution:** Run the `fix_function_ambiguity.sql` script which:
- Drops the conflicting functions
- Creates a single version with proper parameter defaults
- Adds a simpler alternative function (`create_minimal_profile`)

### Foreign Key Constraint Error

**Error message:** `insert or update on table "profiles" violates foreign key constraint "profiles_id_fkey"`

**Solution:** This means you're trying to create a profile with a user ID that doesn't exist in the auth.users table. The updated middleware now:
- Uses functions that properly check for existing users
- Has better error handling for this specific case
- Falls back to RPC methods that work around these constraints

### Cannot Access System Tables

**Error message:** `relation "public.pg_catalog.pg_tables" does not exist` or `relation "public.auth.users" does not exist`

**Solution:** This is normal for managed database services. The updated code:
- Avoids direct access to system catalogs
- Uses functions that don't rely on direct schema access
- Works with the permissions available to your service role

## Environment Setup

Make sure your environment variables are correctly set:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The service role key is especially important for profile creation. You can find it in your Supabase dashboard under:
Project Settings → API → Project API keys → service_role secret

## Still Having Issues?

If you're still experiencing problems after following these steps:

1. Check your Supabase project status:
   - Make sure your project isn't paused (free tier projects pause after inactivity)
   - Verify your database is healthy in the Supabase dashboard

2. Review deployment logs:
   - Look for any errors in your Vercel deployment logs
   - Check Supabase database logs for specific errors

3. Try creating a completely new profile:
   - Log out completely
   - Clear browser cache and cookies
   - Sign up with a new email address

4. Try direct database intervention:
   ```sql
   -- Run this in Supabase SQL Editor to recreate a profile for a specific user
   SELECT create_minimal_profile('your-user-id-here');
   ```

## Contact Support

If you need further assistance, please contact support with:
- The specific error message you're seeing
- Results from the diagnostic endpoints
- Your Supabase database setup details
- Any logs from your application when the error occurs

Email: support@cyberverse.com 
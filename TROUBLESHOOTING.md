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

### Foreign Key Constraint Error / Timing Issues

**Error message:** `insert or update on table "profiles" violates foreign key constraint "profiles_id_fkey"` or continued database setup errors on signup

**Solution:** This is usually caused by a timing issue between when the user is created in auth.users and when we try to create their profile. We've added two solutions:

1. Run the `timing_fix.sql` script which:
   - Creates a new function with built-in retries and delays
   - Makes the `create_minimal_profile` function more resilient
   - Attempts to add a trigger-based notification system (if permissions allow)

2. The middleware has been updated with:
   - A retry mechanism that waits briefly between attempts
   - Better error handling for foreign key constraints
   - Multiple fallback approaches for profile creation

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

## Last Resort Measures

If you continue to encounter profile creation errors despite all the previous fixes, we have two emergency measures you can try:

### 1. Run the Emergency Direct Fix Script

This is a drastic approach that temporarily disables constraints to force profile creation to work:

1. Go to your Supabase SQL Editor
2. Copy and paste the contents of `migrations/emergency_direct_fix.sql`
3. Run the script
4. This script will:
   - Temporarily disable triggers on the profiles table
   - Fix or recreate the profiles table structure if needed
   - Create more reliable profile creation functions
   - Reset all RLS policies
   - Grant proper privileges to the service role
   - Re-enable all triggers

### 2. Deploy the Updated Auth Callback Route

We've modified the auth callback route to handle profile creation directly at the source:

1. Deploy the updated code with the new `app/auth/callback/route.ts` file
2. This enhanced callback:
   - Waits 1.5 seconds after authentication to ensure the auth.users record is ready
   - Tries multiple methods to create the profile
   - Handles profile creation in the background so it doesn't block the user experience

### 3. Nuclear Option: Remove All Security Measures (DEVELOPMENT ONLY)

⚠️ **WARNING: This is an extreme measure that should ONLY be used for development/debugging!** ⚠️

If nothing else is working, you can temporarily remove all security measures from the profiles table:

1. Go to your Supabase SQL Editor
2. Copy and paste the contents of `migrations/remove_all_security.sql`
3. Run the script
4. This script will:
   - Disable Row Level Security (RLS) completely on the profiles table
   - Drop all RLS policies
   - Disable all triggers
   - Remove constraints on the email field
   - Grant all privileges to all roles
   - Attempt to remove the foreign key constraint
   - Create an unrestricted profile creation function

After using this script, test your application to see if profile creation works. If it does, this confirms the issue is related to security measures.

**IMPORTANT:** After identifying and fixing the issue, you MUST restore security before deploying to production! Use the `emergency_direct_fix.sql` script to restore basic security measures.

These measures directly address the timing issues between user creation in auth.users and profile creation.

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
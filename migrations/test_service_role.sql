-- Test script to diagnose service role permissions issues
-- Run this in the Supabase SQL Editor to see if there are permission problems

-- Create functions to test and diagnose service role permissions
CREATE OR REPLACE FUNCTION test_service_role_permissions()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- This will run with elevated privileges
AS $$
DECLARE
    result jsonb = '{}'::jsonb;
    policies_json jsonb;
    tables_json jsonb;
    grants_json jsonb;
BEGIN
    -- Check if the service role exists
    result = result || jsonb_build_object(
        'service_role_exists', 
        EXISTS (
            SELECT 1 FROM pg_roles 
            WHERE rolname = 'service_role'
        )
    );
    
    -- Check RLS policies for profiles table
    SELECT jsonb_agg(jsonb_build_object(
        'policy_name', policyname,
        'operation', cmd,
        'roles', roles,
        'using', qual,
        'with_check', with_check
    ))
    INTO policies_json
    FROM pg_policies
    WHERE tablename = 'profiles' AND schemaname = 'public';
    
    result = result || jsonb_build_object('policies', COALESCE(policies_json, '[]'::jsonb));
    
    -- Check if profiles table exists
    result = result || jsonb_build_object(
        'profiles_table_exists',
        EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'profiles'
        )
    );
    
    -- Check if RLS is enabled on profiles table
    result = result || jsonb_build_object(
        'rls_enabled',
        EXISTS (
            SELECT 1 FROM pg_tables
            WHERE schemaname = 'public' AND tablename = 'profiles' AND rowsecurity = true
        )
    );
    
    -- Check table privileges
    SELECT jsonb_agg(jsonb_build_object(
        'table_name', table_name,
        'grantee', grantee,
        'privileges', string_agg(privilege_type, ', ')
    ))
    INTO grants_json
    FROM information_schema.role_table_grants
    WHERE table_schema = 'public' 
    AND grantee = 'service_role'
    GROUP BY table_name, grantee;
    
    result = result || jsonb_build_object('grants', COALESCE(grants_json, '[]'::jsonb));
    
    -- Check if profiles has the correct structure
    SELECT jsonb_agg(jsonb_build_object(
        'column_name', column_name,
        'data_type', data_type,
        'is_nullable', is_nullable,
        'column_default', column_default
    ))
    INTO tables_json
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles'
    ORDER BY ordinal_position;
    
    result = result || jsonb_build_object('columns', COALESCE(tables_json, '[]'::jsonb));
    
    -- Check email constraints
    result = result || jsonb_build_object(
        'email_constraints',
        (
            SELECT jsonb_agg(jsonb_build_object(
                'constraint_name', constraint_name,
                'constraint_type', constraint_type
            ))
            FROM information_schema.table_constraints
            WHERE table_schema = 'public'
            AND table_name = 'profiles'
            AND constraint_name LIKE '%email%'
        )
    );
    
    -- Check indexes on email
    result = result || jsonb_build_object(
        'email_indexes',
        (
            SELECT jsonb_agg(indexname)
            FROM pg_indexes
            WHERE schemaname = 'public'
            AND tablename = 'profiles'
            AND indexdef LIKE '%email%'
        )
    );
    
    -- Overall diagnosis
    result = result || jsonb_build_object(
        'diagnosis',
        CASE
            WHEN NOT (EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = 'profiles'
            )) THEN 'The profiles table does not exist'
            
            WHEN NOT (EXISTS (
                SELECT 1 FROM pg_tables
                WHERE schemaname = 'public' AND tablename = 'profiles' AND rowsecurity = true
            )) THEN 'Row Level Security is not enabled on the profiles table'
            
            WHEN NOT (EXISTS (
                SELECT 1 FROM pg_policies
                WHERE tablename = 'profiles' AND schemaname = 'public'
                AND cmd = 'INSERT' AND roles = '{service_role}'
            )) THEN 'Missing INSERT policy for the service role'
            
            WHEN NOT (EXISTS (
                SELECT 1 FROM information_schema.role_table_grants
                WHERE table_schema = 'public' AND table_name = 'profiles'
                AND grantee = 'service_role' AND privilege_type = 'INSERT'
            )) THEN 'The service role does not have INSERT privileges on the profiles table'
            
            ELSE 'No obvious issues detected. The problem may be related to invalid data or constraints.'
        END
    );
    
    RETURN result;
END;
$$;

-- Run the test and show results
SELECT test_service_role_permissions();

-- Create a function to attempt a direct profile creation with detailed error reporting
CREATE OR REPLACE FUNCTION debug_profile_creation(test_id UUID DEFAULT '00000000-0000-0000-0000-000000000099')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb = '{}'::jsonb;
    captured_error text;
BEGIN
    -- First delete if this test record exists
    BEGIN
        DELETE FROM profiles WHERE id = test_id;
        result = result || jsonb_build_object('cleanup', 'success');
    EXCEPTION WHEN OTHERS THEN
        result = result || jsonb_build_object(
            'cleanup', 'failed',
            'cleanup_error', SQLERRM
        );
    END;
    
    -- Then try to insert with minimal data
    BEGIN
        INSERT INTO profiles (id)
        VALUES (test_id);
        
        result = result || jsonb_build_object('insert', 'success');
    EXCEPTION WHEN OTHERS THEN
        captured_error = SQLERRM;
        result = result || jsonb_build_object(
            'insert', 'failed',
            'error', captured_error,
            'error_detail', SQLSTATE
        );
        
        -- Try to diagnose the specific error
        IF captured_error LIKE '%violates%constraint%' THEN
            result = result || jsonb_build_object(
                'diagnosis', 'constraint violation',
                'suggestion', 'There appears to be a constraint preventing insertion. Check the error message for details.'
            );
        ELSIF captured_error LIKE '%permission denied%' THEN
            result = result || jsonb_build_object(
                'diagnosis', 'permission denied',
                'suggestion', 'There is a permission issue. Check RLS policies and grants.'
            );
        ELSIF captured_error LIKE '%does not exist%' THEN
            result = result || jsonb_build_object(
                'diagnosis', 'object does not exist',
                'suggestion', 'The table or column referenced does not exist. Check the schema.'
            );
        ELSE
            result = result || jsonb_build_object(
                'diagnosis', 'unknown error',
                'suggestion', 'Review the error message and check database logs for more details.'
            );
        END IF;
    END;
    
    -- If insert failed, try with super minimal approach directly through SQL
    IF (result->>'insert') = 'failed' THEN
        BEGIN
            EXECUTE 'INSERT INTO profiles(id) VALUES($1)' USING test_id;
            result = result || jsonb_build_object('direct_sql_insert', 'success');
        EXCEPTION WHEN OTHERS THEN
            result = result || jsonb_build_object(
                'direct_sql_insert', 'failed',
                'direct_error', SQLERRM
            );
        END;
    END IF;
    
    -- Try a completely different approach
    IF (result->>'insert') = 'failed' AND (result->>'direct_sql_insert') = 'failed' THEN
        BEGIN
            -- Try bypassing any default values or complex fields
            EXECUTE '
                INSERT INTO profiles(id, email, full_name, avatar_url, bio, website)
                VALUES($1, NULL, NULL, NULL, NULL, NULL)
            ' USING test_id;
            result = result || jsonb_build_object('explicit_null_insert', 'success');
        EXCEPTION WHEN OTHERS THEN
            result = result || jsonb_build_object(
                'explicit_null_insert', 'failed',
                'explicit_error', SQLERRM
            );
        END;
    END IF;
    
    -- Clean up after test if any insertion succeeded
    BEGIN
        DELETE FROM profiles WHERE id = test_id;
    EXCEPTION WHEN OTHERS THEN
        -- Ignore errors during final cleanup
        NULL;
    END;
    
    RETURN result;
END;
$$;

-- Run the debug creation test
SELECT debug_profile_creation();

-- Provide recommendations based on test results
DO $$
DECLARE
    test_result jsonb;
    debug_result jsonb;
BEGIN
    SELECT test_service_role_permissions() INTO test_result;
    SELECT debug_profile_creation() INTO debug_result;
    
    RAISE NOTICE '---------------------------------------------------------';
    RAISE NOTICE 'DATABASE DIAGNOSTICS RESULTS';
    RAISE NOTICE '---------------------------------------------------------';
    
    -- Output diagnosis
    RAISE NOTICE 'Diagnosis: %', test_result->>'diagnosis';
    
    -- Profile creation test
    IF (debug_result->>'insert') = 'success' THEN
        RAISE NOTICE 'Profile creation test: SUCCESS';
    ELSE
        RAISE NOTICE 'Profile creation test: FAILED';
        RAISE NOTICE 'Error: %', debug_result->>'error';
        RAISE NOTICE 'Diagnosis: %', debug_result->>'diagnosis';
        RAISE NOTICE 'Suggestion: %', debug_result->>'suggestion';
    END IF;
    
    -- Provide next steps
    RAISE NOTICE '---------------------------------------------------------';
    RAISE NOTICE 'RECOMMENDED ACTIONS:';
    
    IF NOT (test_result->>'profiles_table_exists')::boolean THEN
        RAISE NOTICE '1. Create the profiles table using the fix_profiles_rls.sql script';
    ELSIF NOT (test_result->>'rls_enabled')::boolean THEN
        RAISE NOTICE '1. Enable Row Level Security on the profiles table';
    ELSIF NOT test_result->'policies' @> '[{"operation": "INSERT", "roles": "{service_role}"}]'::jsonb THEN
        RAISE NOTICE '1. Add an INSERT policy for the service role:';
        RAISE NOTICE '   CREATE POLICY "Service role can insert any profile" ON profiles FOR INSERT TO service_role WITH CHECK (true);';
    ELSIF (debug_result->>'insert') != 'success' AND (debug_result->>'error' LIKE '%violates%constraint%') THEN
        RAISE NOTICE '1. Fix constraint issues with the profiles table:';
        RAISE NOTICE '   Run the emergency_fix.sql script that removes problematic constraints';
    ELSIF (debug_result->>'insert') != 'success' THEN
        RAISE NOTICE '1. There is an issue with profile creation. Run the emergency_fix.sql script';
        RAISE NOTICE '2. Check your SUPABASE_SERVICE_ROLE_KEY environment variable is correct';
    ELSE
        RAISE NOTICE '1. Database setup appears correct. Issue may be in the application code or environment variables';
        RAISE NOTICE '2. Verify your middleware.ts is correctly using the service role';
        RAISE NOTICE '3. Check your application logs for more detailed error messages';
    END IF;
    
    RAISE NOTICE '---------------------------------------------------------';
END $$; 
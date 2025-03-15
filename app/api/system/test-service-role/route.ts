import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This endpoint tests if the service role is working correctly
export async function GET(request: NextRequest) {
  try {
    // Check if required environment variables exist
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        details: {
          NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        }
      }, { status: 500 });
    }

    // Create a test Supabase client with service role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Run a series of tests to verify the service role
    const testResults = {
      connection: false,
      selectAccess: false,
      insertAccess: false,
      rlsPolicies: false,
      serviceRoleBypass: false,
      tests: [] as any[]
    };

    // Test 1: Basic connection - check if we can connect to the database
    try {
      const { data, error } = await supabaseAdmin.from('profiles').select('count(*)', { count: 'exact', head: true });
      testResults.connection = !error;
      testResults.tests.push({
        name: 'Database Connection',
        success: !error,
        error: error ? error.message : null
      });
    } catch (error: any) {
      testResults.tests.push({
        name: 'Database Connection',
        success: false,
        error: error.message || String(error)
      });
    }

    // Test 2: Select access - check if we can select from the profiles table
    try {
      const { data, error } = await supabaseAdmin.from('profiles').select('id').limit(1);
      testResults.selectAccess = !error;
      testResults.tests.push({
        name: 'Select Access',
        success: !error,
        error: error ? error.message : null,
        data: data ? 'Data retrieved successfully' : 'No data retrieved'
      });
    } catch (error: any) {
      testResults.tests.push({
        name: 'Select Access',
        success: false,
        error: error.message || String(error)
      });
    }

    // Test 3: Insert access - check if we can insert into the profiles table
    // Using a dummy UUID that won't conflict with real users
    const testUuid = '00000000-0000-0000-0000-000000000001';
    try {
      // First delete if this test record exists
      await supabaseAdmin.from('profiles').delete().eq('id', testUuid);
      
      // Then try to insert it
      const { data, error } = await supabaseAdmin.from('profiles').insert({
        id: testUuid,
        email: `test-${Date.now()}@example.com`
      }).select();
      
      testResults.insertAccess = !error;
      testResults.tests.push({
        name: 'Insert Access',
        success: !error,
        error: error ? error.message : null
      });
      
      // Clean up the test record
      if (!error) {
        await supabaseAdmin.from('profiles').delete().eq('id', testUuid);
      }
    } catch (error: any) {
      testResults.tests.push({
        name: 'Insert Access',
        success: false,
        error: error.message || String(error)
      });
    }

    // Test 4: Check RLS policies for service role
    try {
      const { data, error } = await supabaseAdmin.rpc('check_service_role_policies');
      testResults.rlsPolicies = !error && data;
      testResults.tests.push({
        name: 'RLS Policies',
        success: !error && data,
        error: error ? error.message : null,
        data: data
      });
    } catch (error: any) {
      testResults.tests.push({
        name: 'RLS Policies',
        success: false,
        error: error.message || String(error),
        note: 'You may need to create the check_service_role_policies function in your database'
      });
    }

    // Test 5: Verify service role can bypass RLS
    try {
      // Create a function to directly test RLS bypass
      await supabaseAdmin.rpc('create_test_bypass_function_if_not_exists');
      
      // Call the function to test bypass
      const { data, error } = await supabaseAdmin.rpc('test_service_role_bypass');
      
      testResults.serviceRoleBypass = !error && data === true;
      testResults.tests.push({
        name: 'Service Role Bypass',
        success: !error && data === true,
        error: error ? error.message : null,
        data: data
      });
    } catch (error: any) {
      testResults.tests.push({
        name: 'Service Role Bypass',
        success: false,
        error: error.message || String(error),
        note: 'You may need to create the test functions in your database'
      });

      // If this fails, try to include SQL to create the missing functions
      testResults.sqlToCreateTestFunctions = `
-- Add these functions to your database to test service role bypass
CREATE OR REPLACE FUNCTION create_test_bypass_function_if_not_exists()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create the test function if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'test_service_role_bypass') THEN
    CREATE OR REPLACE FUNCTION test_service_role_bypass()
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $inner$
    BEGIN
      RETURN true;
    END;
    $inner$;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION check_service_role_policies()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND cmd = 'INSERT' 
    AND roles = '{service_role}'
  );
END;
$$;
      `;
    }

    // Collect overall status
    const overallSuccess = testResults.connection && 
                         testResults.selectAccess && 
                         testResults.insertAccess;

    // Return results
    return NextResponse.json({
      success: overallSuccess,
      timestamp: new Date().toISOString(),
      message: overallSuccess 
        ? 'Service role is working correctly' 
        : 'There are issues with the service role',
      testResults,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 10) + '...' // Truncated for security
      },
      recommendations: !overallSuccess ? [
        "Run the emergency_fix.sql script in your Supabase SQL editor",
        "Check that your SUPABASE_SERVICE_ROLE_KEY is correct",
        "Verify the RLS policies are correctly set up for the service role",
        "Check if the profiles table exists and has the correct structure"
      ] : []
    });
  } catch (error: any) {
    console.error('Error in test-service-role API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Server Error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 
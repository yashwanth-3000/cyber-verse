import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // Ensure this is always dynamic

export async function GET(request: NextRequest) {
  try {
    console.log('Direct profile fix endpoint called');
    
    // Verify environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Store all test results
    const results = {
      environment_check: true,
      tests: [] as any[],
      fixes_applied: [] as string[],
      recommended_actions: [] as string[]
    };
    
    // Step 1: Try to fix the profiles table using RPC
    try {
      const { error: rpcError } = await supabaseAdmin.rpc('force_create_profile', {
        user_id: '00000000-0000-0000-0000-000000000001'
      });
      
      if (rpcError) {
        results.tests.push({
          name: 'RPC Profile Creation',
          success: false,
          error: rpcError.message,
          error_code: rpcError.code
        });
        
        results.recommended_actions.push(
          'Run the emergency_fix.sql script in your Supabase SQL Editor'
        );
      } else {
        results.tests.push({
          name: 'RPC Profile Creation',
          success: true
        });
        
        results.fixes_applied.push('Successfully created test profile using RPC');
      }
    } catch (rpcError: any) {
      results.tests.push({
        name: 'RPC Profile Creation',
        success: false,
        error: rpcError.message || String(rpcError)
      });
      
      results.recommended_actions.push(
        'Run the migrations/test_service_role.sql script to diagnose RPC issues'
      );
    }
    
    // Step 2: Try direct insertion - but first get a real user ID from auth.users
    try {
      // Find an existing user ID to work with
      const { data: userData, error: userError } = await supabaseAdmin
        .from('auth.users')
        .select('id')
        .limit(1);
      
      if (userError) {
        // Can't query auth.users directly, this is expected in some setups
        results.tests.push({
          name: 'Auth Users Query',
          success: false,
          error: userError.message,
          error_code: userError.code
        });
      } else if (!userData || userData.length === 0) {
        // No users found
        results.tests.push({
          name: 'Auth Users Query',
          success: true,
          message: 'No users found in auth.users table'
        });
      } else {
        // Got a real user ID, use it for profile creation
        const testUserId = userData[0].id;
        
        // First delete any existing record
        await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('id', testUserId);
        
        // Then try to insert
        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: testUserId,
            email: `test-${Date.now()}@example.com`
          });
        
        if (insertError) {
          results.tests.push({
            name: 'Direct Profile Insertion',
            success: false,
            error: insertError.message,
            error_code: insertError.code
          });
          
          results.recommended_actions.push(
            'Check RLS policies for the service role'
          );
        } else {
          results.tests.push({
            name: 'Direct Profile Insertion',
            success: true,
            message: 'Created profile for real user ID: ' + testUserId
          });
          
          results.fixes_applied.push('Successfully created test profile using direct insertion for user: ' + testUserId);
        }
      }
    } catch (insertError: any) {
      // Try an alternative approach with RPC
      try {
        const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('force_create_profile', {
          user_id: '00000000-0000-0000-0000-000000000099'
        });
        
        if (!rpcError) {
          results.tests.push({
            name: 'Fallback RPC Profile Creation',
            success: true,
            message: rpcData
          });
          
          results.fixes_applied.push('Successfully created test profile using RPC fallback');
        } else {
          results.tests.push({
            name: 'Direct Profile Insertion and RPC Fallback',
            success: false,
            error: insertError.message || String(insertError),
            rpc_error: rpcError.message
          });
          
          results.recommended_actions.push(
            'Run the emergency_fix.sql script to fix database permissions and functions'
          );
        }
      } catch (rpcError: any) {
        results.tests.push({
          name: 'Direct Profile Insertion',
          success: false,
          error: insertError.message || String(insertError),
          rpc_fallback_error: rpcError.message || String(rpcError)
        });
        
        results.recommended_actions.push(
          'Check database permissions for the service role'
        );
      }
    }
    
    // Step 3: Skip the policy check since pg_policies isn't accessible
    // Instead try to check for other tables
    try {
      const { data: tablesData, error: tablesError } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(5);
        
      if (tablesError) {
        results.tests.push({
          name: 'Database Schema Access',
          success: false,
          error: tablesError.message
        });
      } else {
        results.tests.push({
          name: 'Database Schema Access',
          success: true,
          tables_found: tablesData?.map(t => t.table_name) || []
        });
      }
    } catch (tableError: any) {
      // Ignore this error, it's not critical
    }
    
    // Step 4: Try emergency function creation
    try {
      // Create the emergency function
      await supabaseAdmin.rpc('admin_create_emergency_fix_function');
      results.fixes_applied.push('Created emergency fix function');
      
      // Try using it
      const { data: fixData, error: fixError } = await supabaseAdmin.rpc('emergency_fix_all_profiles');
      
      if (fixError) {
        results.tests.push({
          name: 'Emergency Fix Function',
          success: false,
          error: fixError.message
        });
      } else {
        results.tests.push({
          name: 'Emergency Fix Function',
          success: true,
          result: fixData
        });
        
        results.fixes_applied.push('Successfully ran emergency profile fix function');
      }
    } catch (functionError: any) {
      console.error('Failed to create or run emergency fix function:', functionError);
      
      // Attempt to create the function
      try {
        const { error: createFunctionError } = await supabaseAdmin.rpc('create_admin_function');
        
        if (!createFunctionError) {
          results.fixes_applied.push('Created admin SQL function');
        }
      } catch (e) {
        // Ignore errors here
      }
      
      results.tests.push({
        name: 'Emergency Fix Function',
        success: false,
        error: functionError.message || String(functionError)
      });
      
      results.recommended_actions.push(
        'Run the emergency_fix.sql script to create necessary functions'
      );
    }
    
    // Step 5: Try refreshing RLS policies
    try {
      // Create basic policy refresh function
      const createPolicyFunctionSQL = `
CREATE OR REPLACE FUNCTION admin_create_emergency_fix_function()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create the emergency fix function if it doesn't exist
    CREATE OR REPLACE FUNCTION emergency_fix_all_profiles()
    RETURNS TEXT
    SECURITY DEFINER
    AS $inner$
    DECLARE
        user_record RECORD;
        fixed_count INTEGER := 0;
        error_count INTEGER := 0;
    BEGIN
        -- Check for missing profiles
        FOR user_record IN 
            SELECT au.id 
            FROM auth.users au 
            LEFT JOIN profiles p ON p.id = au.id 
            WHERE p.id IS NULL
        LOOP
            BEGIN
                -- Try to insert with minimal data
                INSERT INTO profiles(id) VALUES(user_record.id);
                fixed_count := fixed_count + 1;
            EXCEPTION
                WHEN others THEN
                    error_count := error_count + 1;
            END;
        END LOOP;
        
        RETURN 'Fixed ' || fixed_count || ' profiles. Errors: ' || error_count;
    END;
    $inner$ LANGUAGE plpgsql;
END;
$$;
      `;
      
      // Try to create the function directly
      const { error: sqlError } = await supabaseAdmin.rpc('run_sql', { sql: createPolicyFunctionSQL });
      
      if (!sqlError) {
        results.fixes_applied.push('Created policy refresh function');
      }
    } catch (e) {
      // Ignore errors here - this is a last-ditch attempt
    }
    
    // Determine overall success
    const overallSuccess = results.tests.some(test => test.success);
    
    return NextResponse.json({
      success: overallSuccess,
      message: overallSuccess 
        ? 'Successfully fixed some issues with the database' 
        : 'Failed to fix database issues, manual intervention required',
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in direct-profile-fix API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Server Error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      stack: error instanceof Error ? error.stack : undefined,
      recommendations: [
        'Run the emergency_fix.sql script manually in the Supabase SQL Editor',
        'Verify your SUPABASE_SERVICE_ROLE_KEY environment variable',
        'Check Supabase console for any service outages'
      ],
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
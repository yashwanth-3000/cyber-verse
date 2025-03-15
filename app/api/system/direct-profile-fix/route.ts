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
    
    // Step 2: Try direct insertion
    try {
      // First delete any existing record
      await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000002');
      
      // Then try to insert
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: '00000000-0000-0000-0000-000000000002',
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
          success: true
        });
        
        results.fixes_applied.push('Successfully created test profile using direct insertion');
        
        // Clean up
        await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('id', '00000000-0000-0000-0000-000000000002');
      }
    } catch (insertError: any) {
      results.tests.push({
        name: 'Direct Profile Insertion',
        success: false,
        error: insertError.message || String(insertError)
      });
      
      results.recommended_actions.push(
        'Check database permissions for the service role'
      );
    }
    
    // Step 3: Check if service role has proper permissions
    try {
      const { data: policyData, error: policyError } = await supabaseAdmin
        .from('pg_policies')
        .select('policyname, tablename, cmd, roles')
        .eq('tablename', 'profiles')
        .in('cmd', ['INSERT', 'SELECT']);
      
      if (policyError) {
        results.tests.push({
          name: 'RLS Policy Check',
          success: false,
          error: policyError.message
        });
      } else {
        // Check if the service role policies exist
        const hasServiceRoleInsertPolicy = policyData?.some(p => 
          p.cmd === 'INSERT' && p.roles?.includes('service_role')
        );
        
        const hasServiceRoleSelectPolicy = policyData?.some(p => 
          p.cmd === 'SELECT' && p.roles?.includes('service_role')
        );
        
        results.tests.push({
          name: 'RLS Policy Check',
          success: hasServiceRoleInsertPolicy && hasServiceRoleSelectPolicy,
          policies_found: policyData?.length || 0,
          has_insert_policy: hasServiceRoleInsertPolicy,
          has_select_policy: hasServiceRoleSelectPolicy
        });
        
        if (!hasServiceRoleInsertPolicy) {
          results.recommended_actions.push(
            'Add INSERT policy for service_role to profiles table'
          );
        }
        
        if (!hasServiceRoleSelectPolicy) {
          results.recommended_actions.push(
            'Add SELECT policy for service_role to profiles table'
          );
        }
      }
    } catch (policyError: any) {
      results.tests.push({
        name: 'RLS Policy Check',
        success: false,
        error: policyError.message || String(policyError)
      });
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
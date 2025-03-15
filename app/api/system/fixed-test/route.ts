import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // Ensure this is always dynamic

export async function GET(request: NextRequest) {
  try {
    console.log('Fixed test endpoint called');
    
    // Check if environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    // Create a Supabase client with service role
    console.log('Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Initialize results
    const results = {
      tests: [] as any[],
      success: false,
      timestamp: new Date().toISOString()
    };
    
    // Test 1: Basic connectivity (count profiles)
    try {
      console.log('Testing basic connectivity...');
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      results.tests.push({
        name: 'Basic connectivity',
        success: !error,
        count: count,
        error: error?.message
      });
    } catch (error: any) {
      results.tests.push({
        name: 'Basic connectivity',
        success: false,
        error: error.message || String(error)
      });
    }
    
    // Test 2: Use get_users() function
    try {
      console.log('Testing get_users() function...');
      const { data: users, error } = await supabase.rpc('get_users');
      
      results.tests.push({
        name: 'Get users via function',
        success: !error && !!users,
        user_count: users?.length || 0,
        error: error?.message
      });
      
      // If successful, save the first user ID for other tests
      if (!error && users && users.length > 0) {
        const testUserId = users[0].id;
        console.log(`Found test user ID: ${testUserId}`);
        
        // Test 3: Check if policies are working
        try {
          console.log('Testing service role policies...');
          const { data: policies, error: policiesError } = await supabase.rpc('test_service_role_policies');
          
          results.tests.push({
            name: 'Service role policies',
            success: !policiesError,
            policies: policies,
            error: policiesError?.message
          });
        } catch (error: any) {
          results.tests.push({
            name: 'Service role policies',
            success: false,
            error: error.message || String(error)
          });
        }
        
        // Test 4: Test profile creation
        try {
          console.log('Testing profile creation...');
          const { data: createResult, error: createError } = await supabase.rpc('test_profile_creation');
          
          results.tests.push({
            name: 'Profile creation',
            success: !createError && createResult?.success,
            result: createResult,
            error: createError?.message
          });
        } catch (error: any) {
          results.tests.push({
            name: 'Profile creation',
            success: false,
            error: error.message || String(error)
          });
        }
      }
    } catch (error: any) {
      results.tests.push({
        name: 'Get users via function',
        success: false,
        error: error.message || String(error)
      });
    }
    
    // Calculate overall success
    results.success = results.tests.some(test => test.success);
    
    // Add recommendations
    const recommendations = [];
    
    if (!results.success) {
      recommendations.push('Run both SQL scripts:');
      recommendations.push('1. First run migrations/cleanup_and_fix.sql');
      recommendations.push('2. Then run migrations/test_helper_functions.sql');
    } else {
      recommendations.push('Your setup is working! Try signing in with Google now.');
    }
    
    return NextResponse.json({
      ...results,
      recommendations,
      what_was_fixed: 'Added necessary SQL functions and service role policies'
    });
  } catch (error: any) {
    console.error('Critical error in fixed-test endpoint:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Critical error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
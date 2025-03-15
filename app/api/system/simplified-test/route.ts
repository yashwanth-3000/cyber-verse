import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // Ensure this is always dynamic

export async function GET(request: NextRequest) {
  try {
    console.log('Simplified test endpoint called');
    
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
    
    // Test 2: Direct profile creation test (simplified)
    try {
      console.log('Testing direct profile creation...');
      const { data: directResult, error: directError } = await supabase.rpc('directly_create_test_profile');
      
      results.tests.push({
        name: 'Direct profile creation',
        success: !directError && directResult?.includes('Success'),
        result: directResult,
        error: directError?.message
      });
    } catch (error: any) {
      results.tests.push({
        name: 'Direct profile creation',
        success: false,
        error: error.message || String(error)
      });
    }
    
    // Test 3: Get first user (most basic test)
    try {
      console.log('Testing get_first_user function...');
      const { data: userId, error: userError } = await supabase.rpc('get_first_user');
      
      results.tests.push({
        name: 'Get first user',
        success: !userError && !!userId,
        user_id: userId,
        error: userError?.message
      });
    } catch (error: any) {
      results.tests.push({
        name: 'Get first user',
        success: false,
        error: error.message || String(error)
      });
    }
    
    // Calculate overall success
    results.success = results.tests.some(test => test.success);
    
    // Add recommendations
    let recommendations = [];
    
    if (!results.success) {
      recommendations.push('Run the SQL scripts:');
      recommendations.push('1. First run migrations/cleanup_and_fix.sql');
      recommendations.push('2. Then run migrations/fixed_test_helper_functions.sql');
    } else {
      recommendations.push('Your database setup is working! Try signing in with Google now.');
    }
    
    return NextResponse.json({
      ...results,
      recommendations,
      what_was_fixed: 'Added improved SQL functions with type casting and simplified testing'
    });
  } catch (error: any) {
    console.error('Critical error in simplified-test endpoint:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Critical error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
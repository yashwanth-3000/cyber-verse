import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // Ensure this is always dynamic

export async function GET(request: NextRequest) {
  try {
    console.log('Simple test endpoint called');
    
    // Check if environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Log information about the environment (without revealing secrets)
    console.log('Environment check:', {
      url_exists: !!supabaseUrl,
      url_length: supabaseUrl?.length || 0,
      key_exists: !!supabaseServiceKey,
      key_length: supabaseServiceKey?.length || 0,
      node_env: process.env.NODE_ENV,
      vercel_env: process.env.VERCEL_ENV || 'not set'
    });
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    // Create a minimal Supabase client
    console.log('Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Test both profile access and RPC functions
    console.log('Testing database connectivity...');
    const tests = [];
    let allTestsPassed = false;
    
    // Test 1: Check profiles table access
    try {
      console.log('Attempting profiles table query...');
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        tests.push({
          name: 'Profiles Table Access',
          success: true,
          message: `Count result: ${count ?? 0}`
        });
      } else {
        tests.push({
          name: 'Profiles Table Access',
          success: false,
          error: error.message,
          code: error.code
        });
      }
    } catch (e) {
      tests.push({
        name: 'Profiles Table Access',
        success: false,
        error: e instanceof Error ? e.message : String(e)
      });
    }
    
    // Test 2: Try the create_minimal_profile function (most reliable)
    try {
      console.log('Testing create_minimal_profile RPC...');
      const testId = '00000000-0000-0000-0000-000000000099';
      
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_minimal_profile', {
        user_id: testId
      });
      
      if (!rpcError) {
        tests.push({
          name: 'create_minimal_profile RPC',
          success: true,
          message: rpcData
        });
      } else {
        tests.push({
          name: 'create_minimal_profile RPC',
          success: false,
          error: rpcError.message,
          code: rpcError.code
        });
        
        // If the function doesn't exist, try force_create_profile
        if (rpcError.message.includes('does not exist')) {
          console.log('Falling back to force_create_profile...');
          
          const { data: fallbackData, error: fallbackError } = await supabase.rpc('force_create_profile', {
            user_id: testId
          });
          
          if (!fallbackError) {
            tests.push({
              name: 'force_create_profile Fallback',
              success: true,
              message: fallbackData
            });
          } else {
            tests.push({
              name: 'force_create_profile Fallback',
              success: false,
              error: fallbackError.message,
              code: fallbackError.code
            });
          }
        }
      }
    } catch (e) {
      tests.push({
        name: 'RPC Function Test',
        success: false,
        error: e instanceof Error ? e.message : String(e)
      });
    }
    
    // Calculate overall success
    allTestsPassed = tests.some(test => test.success);
    
    // Return results
    return NextResponse.json({
      success: allTestsPassed,
      message: allTestsPassed ? 'At least one test passed' : 'All tests failed',
      tests,
      env_check: {
        url_valid: supabaseUrl.includes('supabase.co'),
        key_length_valid: supabaseServiceKey.length > 20
      },
      next_steps: !allTestsPassed ? [
        'Run the fix_function_ambiguity.sql script in your Supabase SQL Editor',
        'Make sure your Supabase project is not paused',
        'Verify that the service role key is correct in your environment variables'
      ] : [],
      timestamp: new Date().toISOString()
    });
  } catch (outerError) {
    // Handle any uncaught errors in the entire function
    console.error('Critical error in simple-test endpoint:', outerError);
    
    return NextResponse.json({
      success: false,
      error: 'Critical error',
      message: outerError instanceof Error ? outerError.message : 'Unknown error occurred',
      stack: outerError instanceof Error ? outerError.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
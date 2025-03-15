import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // Ensure this is always dynamic

export async function GET(request: NextRequest) {
  try {
    console.log('Real user test endpoint called');
    
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
    
    // Test 1: Check if we can query auth.users
    try {
      console.log('Querying auth.users table...');
      const { data: users, error: usersError } = await supabase
        .from('auth.users')
        .select('id, email')
        .limit(5);
        
      if (usersError) {
        results.tests.push({
          name: 'Query auth.users',
          success: false,
          error: usersError.message,
          hint: 'Direct access to auth.users may be restricted - will try alternative approach'
        });
        
        // Try alternative approach through RPC
        const { data: rpcUsers, error: rpcError } = await supabase.rpc('get_users', {});
        
        if (rpcError) {
          results.tests.push({
            name: 'Query users via RPC',
            success: false,
            error: rpcError.message
          });
        } else {
          results.tests.push({
            name: 'Query users via RPC',
            success: true,
            users_found: rpcUsers?.length || 0
          });
          
          // If we have users, try to create profiles for them
          if (rpcUsers && rpcUsers.length > 0) {
            for (const user of rpcUsers.slice(0, 2)) { // Test with up to 2 users
              console.log(`Testing profile creation for user ${user.id}`);
              
              // Call the safely_create_profile_for_user function
              const { data: profileResult, error: profileError } = await supabase.rpc(
                'safely_create_profile_for_user',
                { user_id: user.id }
              );
              
              results.tests.push({
                name: `Create profile for user ${user.id.slice(0, 8)}...`,
                success: !profileError,
                result: profileResult,
                error: profileError?.message
              });
            }
          }
        }
      } else {
        results.tests.push({
          name: 'Query auth.users',
          success: true,
          users_found: users?.length || 0
        });
        
        // If we have users, try to create profiles for them
        if (users && users.length > 0) {
          for (const user of users.slice(0, 2)) { // Test with up to 2 users
            console.log(`Testing profile creation for user ${user.id}`);
            
            // First check if profile already exists
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', user.id)
              .single();
              
            if (existingProfile) {
              results.tests.push({
                name: `Profile check for user ${user.id.slice(0, 8)}...`,
                success: true,
                message: 'Profile already exists'
              });
              continue;
            }
            
            // Try to create profile directly
            const { data: newProfile, error: profileError } = await supabase
              .from('profiles')
              .insert([{ id: user.id }])
              .select();
              
            results.tests.push({
              name: `Create profile for user ${user.id.slice(0, 8)}...`,
              success: !profileError,
              profile: newProfile?.[0]?.id ? 'Created' : 'Failed',
              error: profileError?.message
            });
          }
        }
      }
    } catch (error: any) {
      results.tests.push({
        name: 'Initial auth.users query',
        success: false,
        error: error.message || String(error)
      });
    }
    
    // Calculate overall success
    results.success = results.tests.some(test => test.success);
    
    // Add instructions for next steps
    let recommendations = [];
    
    if (!results.success) {
      recommendations.push('Run the final_solution.sql script in your Supabase SQL editor');
      recommendations.push('Check that your service role key is correctly set in environment variables');
      recommendations.push('Ensure that RLS is properly configured for your profiles table');
    } else {
      recommendations.push('Test Google login with a real account to verify authentication works');
      recommendations.push('Monitor logs for any profile creation errors during sign-up');
    }
    
    return NextResponse.json({
      ...results,
      recommendations,
      next_steps: 'Copy and run the final_solution.sql script in your Supabase SQL editor'
    });
  } catch (error: any) {
    console.error('Critical error in real-user-test endpoint:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Critical error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
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
    
    // Try the simplest possible query directly on profiles table
    console.log('Testing database connectivity...');
    try {
      // Skip system table query as it's failing
      console.log('Attempting direct profiles table query...');
      
      // First check if we can access the profiles table at all
      const { data, error } = await supabase
        .from('profiles')
        .select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        // Now try an RPC call as that has been working
        console.log('Trying RPC call as fallback...');
        const { data: rpcData, error: rpcError } = await supabase.rpc('force_create_profile', {
          user_id: '00000000-0000-0000-0000-000000000099'
        });
        
        // Return detailed diagnostics
        return NextResponse.json({
          success: false,
          error: error.message,
          error_code: error.code,
          details: error.details,
          hint: error.hint,
          rpc_test: {
            success: !rpcError,
            data: rpcData,
            error: rpcError?.message
          },
          env_check: {
            url_valid: supabaseUrl.includes('supabase.co'),
            key_length_valid: supabaseServiceKey.length > 20
          },
          timestamp: new Date().toISOString()
        });
      }
      
      // Success case
      return NextResponse.json({
        success: true,
        data: 'Connected successfully to profiles table',
        timestamp: new Date().toISOString()
      });
    } catch (directError) {
      // Handle any uncaught errors during the query
      console.error('Unhandled error during database query:', directError);
      
      return NextResponse.json({
        success: false,
        error: directError instanceof Error ? directError.message : 'Unknown error',
        stack: directError instanceof Error ? directError.stack : undefined,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
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
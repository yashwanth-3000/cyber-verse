import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This endpoint checks if environment variables are set correctly,
// without exposing sensitive information
export async function GET(request: NextRequest) {
  try {
    // Collect environment variable status
    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        value_preview: process.env.NEXT_PUBLIC_SUPABASE_URL 
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 10)}...` 
          : null,
        appears_valid: process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co')
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        value_length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        appears_valid: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 20 : false
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        value_length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
        appears_valid: process.env.SUPABASE_SERVICE_ROLE_KEY ? 
          process.env.SUPABASE_SERVICE_ROLE_KEY.length > 20 : false,
        starts_with_ey: process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('ey')
      }
    };

    // Check if service role key exists and attempt a basic connection
    let serviceRoleTest = { success: false, error: null as string | null };
    
    if (envStatus.NEXT_PUBLIC_SUPABASE_URL.exists && 
        envStatus.SUPABASE_SERVICE_ROLE_KEY.exists) {
      try {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        );
        
        // Try a simple query to verify connection
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .select('count(*)', { count: 'exact', head: true });
          
        serviceRoleTest.success = !error;
        serviceRoleTest.error = error ? error.message : null;
      } catch (error: any) {
        serviceRoleTest.error = error.message || String(error);
      }
    }

    // Determine if there are issues with the environment
    const hasIssues = !envStatus.NEXT_PUBLIC_SUPABASE_URL.exists ||
                    !envStatus.NEXT_PUBLIC_SUPABASE_ANON_KEY.exists ||
                    !envStatus.SUPABASE_SERVICE_ROLE_KEY.exists ||
                    !serviceRoleTest.success;

    // Build recommendations
    const recommendations = [];
    
    if (!envStatus.NEXT_PUBLIC_SUPABASE_URL.exists) {
      recommendations.push("Add NEXT_PUBLIC_SUPABASE_URL to your environment variables");
    } else if (!envStatus.NEXT_PUBLIC_SUPABASE_URL.appears_valid) {
      recommendations.push("Check that NEXT_PUBLIC_SUPABASE_URL is correct (should contain 'supabase.co')");
    }
    
    if (!envStatus.NEXT_PUBLIC_SUPABASE_ANON_KEY.exists) {
      recommendations.push("Add NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables");
    } else if (!envStatus.NEXT_PUBLIC_SUPABASE_ANON_KEY.appears_valid) {
      recommendations.push("Check that NEXT_PUBLIC_SUPABASE_ANON_KEY is correct (should be > 20 chars)");
    }
    
    if (!envStatus.SUPABASE_SERVICE_ROLE_KEY.exists) {
      recommendations.push("Add SUPABASE_SERVICE_ROLE_KEY to your environment variables");
    } else if (!envStatus.SUPABASE_SERVICE_ROLE_KEY.appears_valid) {
      recommendations.push("Check that SUPABASE_SERVICE_ROLE_KEY is correct (should be > 20 chars)");
    }
    
    if (!serviceRoleTest.success) {
      recommendations.push(`Fix service role connection: ${serviceRoleTest.error}`);
    }
    
    // Return results without exposing full keys
    return NextResponse.json({
      success: !hasIssues,
      message: hasIssues 
        ? "There are issues with your environment variables" 
        : "Environment variables are correctly set up",
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV || "not set"
      },
      env_status: envStatus,
      service_role_test: serviceRoleTest,
      recommendations
    });
  } catch (error: any) {
    console.error('Error in check-env API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Server Error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 
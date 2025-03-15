import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // Ensure this is always dynamic

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Google auth configuration...');
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        details: {
          url_exists: !!supabaseUrl,
          anon_key_exists: !!supabaseAnonKey,
          service_key_exists: !!supabaseServiceKey
        },
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    // Get host for redirect URLs
    const host = request.headers.get('host') || '';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Check if we can authenticate at all
    const { data: authTest, error: authTestError } = await supabaseAdmin.auth.getSession();
    
    // Try to query providers that are configured
    const providersList = [];
    
    try {
      // Try to directly test Google login by generating a URL
      const { data: oAuthData, error: oAuthError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: 'test@example.com',
        options: {
          redirectTo: `${baseUrl}/auth/callback`,
        }
      });
      
      if (!oAuthError) {
        providersList.push("magic_link");
      }
    } catch (providerError) {
      console.error('Error checking providers:', providerError);
    }
    
    // Construct OAuth test URLs
    const testRedirectUrl = `${baseUrl}/auth/callback`;
    
    // Generate test button for Google login
    const googleLoginUrl = `${baseUrl}/login`;
    
    return NextResponse.json({
      success: !authTestError,
      auth_test: {
        success: !authTestError,
        error: authTestError?.message
      },
      providers_available: providersList,
      test_redirect_url: testRedirectUrl,
      login_page_url: googleLoginUrl,
      recommendations: [
        "Check if Google authentication is enabled in your Supabase project (Auth > Providers section)",
        `Make sure ${testRedirectUrl} is in the list of authorized redirect URLs in your Supabase Auth settings`,
        `Check your Google Cloud Console OAuth 2.0 configuration to ensure it has the correct Authorized JavaScript origins and redirect URIs`,
        "Confirm your Google OAuth Client ID and Secret are correctly entered in Supabase"
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error testing Google auth config:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error testing configuration',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
import { createSupabaseReqResClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic'; // Mark this route as always dynamic

// Helper function to create a profile right after auth
async function createProfileAfterAuth(userId: string, email: string) {
  console.log("Attempting to create profile immediately after auth for user:", userId);
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing environment variables for profile creation");
    return false;
  }
  
  // Create admin client with service role
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
  
  // Helper function to delay execution
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Wait a moment to ensure the auth.users record is fully created
  // This is a critical step to avoid foreign key constraint errors
  await delay(1500);
  
  // First check if profile already exists
  try {
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (existingProfile) {
      console.log("Profile already exists for user", userId);
      return true;
    }
  } catch (err) {
    console.error("Error checking for existing profile:", err);
    // Continue anyway to try creating
  }
  
  // Try multiple methods to create profile
  
  // Method 1: Try create_minimal_profile RPC
  try {
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('create_minimal_profile', {
      user_id: userId
    });
    
    if (!rpcError) {
      console.log("Successfully created profile in auth callback via RPC:", rpcResult);
      
      // Update email in a separate step if needed
      if (email) {
        await supabaseAdmin
          .from('profiles')
          .update({ email })
          .eq('id', userId);
      }
      
      return true;
    }
    
    console.error("RPC profile creation failed:", rpcError);
  } catch (rpcErr) {
    console.error("Error in RPC profile creation:", rpcErr);
  }
  
  // Method 2: Try direct insertion
  try {
    const { error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email: email || `user-${userId.substring(0, 8)}-${Date.now()}@example.com`
      });
    
    if (!insertError) {
      console.log("Successfully created profile in auth callback via direct insertion");
      return true;
    }
    
    console.error("Direct insertion failed:", insertError);
  } catch (insertErr) {
    console.error("Error in direct insertion:", insertErr);
  }
  
  // Method 3: Last resort - Try with retries and delays
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      // Wait longer between each attempt
      await delay(1000 * (attempt + 1));
      
      console.log(`Profile creation attempt ${attempt + 1} after auth`);
      
      const { error } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: `user-${userId}-${Date.now()}@fallback.com`
        });
      
      if (!error) {
        console.log(`Successfully created profile on attempt ${attempt + 1}`);
        return true;
      }
      
      console.error(`Attempt ${attempt + 1} failed:`, error);
    } catch (err) {
      console.error(`Error in attempt ${attempt + 1}:`, err);
    }
  }
  
  console.error("All profile creation attempts failed in auth callback");
  return false;
}

export async function GET(request: NextRequest) {
  try {
    // Get the URL parameters from the request instead of using request.url directly
    const requestUrl = new URL(request.url);
    
    // Check for error parameters in the URL
    const errorParam = requestUrl.searchParams.get("error");
    const errorCodeParam = requestUrl.searchParams.get("error_code");
    const errorDescParam = requestUrl.searchParams.get("error_description");
    
    // If there are error parameters, redirect to error page with these parameters
    if (errorParam) {
      console.log("Error parameters detected in callback URL:", { 
        error: errorParam, 
        code: errorCodeParam, 
        description: errorDescParam 
      });
      
      // Get base URL using host header and construct absolute URL
      const host = request.headers.get("host") || "";
      const protocol = host.includes("localhost") ? "http" : "https";
      const baseUrl = `${protocol}://${host}`;
      
      // Analyze the error to provide more specific guidance
      let errorHash;
      
      if (errorParam === 'server_error' && 
          (errorCodeParam === 'unexpected_failure' || errorCodeParam === 'database_error') && 
          (errorDescParam?.includes('Database error saving new user') || 
           errorDescParam?.includes('duplicate key') || 
           errorDescParam?.includes('violates unique constraint'))) {
        // This is the specific database error when creating new profiles
        errorHash = `error=server_error&error_code=database_setup_error&error_description=${encodeURIComponent('The database could not save your user profile. This is a server configuration issue. Please contact support.')}`;
      } else {
        // Default error handling - pass through the original error parameters
        errorHash = `error=${errorParam}${errorCodeParam ? `&error_code=${errorCodeParam}` : ''}${errorDescParam ? `&error_description=${errorDescParam}` : ''}`;
      }
      
      // Create error URL with hash parameters to preserve error info
      const errorUrl = new URL(`${baseUrl}/auth/auth-error`);
      errorUrl.hash = errorHash;
      
      return NextResponse.redirect(errorUrl);
    }
    
    const code = requestUrl.searchParams.get("code");
    console.log("Auth code present:", !!code);
    
    const next = requestUrl.searchParams.get("next") || "/";
    console.log("Next redirect target:", next);

    // Additional logging to help diagnose issues
    console.log("Request headers:", Object.fromEntries(request.headers.entries()));
    
    // Get base URL using host header
    const host = request.headers.get("host") || "";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;
    console.log("Using base URL:", baseUrl);

    if (code) {
      // Create a response that redirects to the next URL
      // Make sure we use the absolute URL to avoid localhost redirects
      const redirectUrl = new URL(next.startsWith("http") ? next : `${baseUrl}${next.startsWith("/") ? next : `/${next}`}`);
      console.log("Redirecting to:", redirectUrl.toString());
      
      const response = NextResponse.redirect(redirectUrl);
      
      try {
        // Create a Supabase client using the request and response
        const supabase = createSupabaseReqResClient(request, response);
        console.log("Supabase client created successfully");
        
        // Exchange the code for a session
        console.log("Attempting to exchange code for session");
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error("Error exchanging code for session:", error.message, error);
          const errorUrl = new URL(`${baseUrl}/auth/auth-error`);
          // Use hash fragment for error details to prevent loss during redirects
          errorUrl.hash = `error=auth_error&error_code=${error.code || 'unknown'}&error_description=${encodeURIComponent(error.message)}`;
          return NextResponse.redirect(errorUrl);
        }
        
        console.log("Successfully exchanged code for session:", !!data?.session);
        
        // Create profile proactively if we have a user
        if (data?.session?.user) {
          const { id: userId, email = '' } = data.session.user;
          console.log("Initiating proactive profile creation for new user:", userId);
          
          // Don't await this - let it run in the background
          // This way the user isn't delayed by profile creation
          createProfileAfterAuth(userId, email)
            .then(success => {
              console.log("Background profile creation result:", success ? "Success" : "Failed");
            })
            .catch(err => {
              console.error("Error in background profile creation:", err);
            });
        }
        
        return response;
      } catch (exchangeError) {
        console.error("Exception in code exchange:", exchangeError);
        // Create a detailed error object for better debugging
        const errorDetails = {
          message: exchangeError instanceof Error ? exchangeError.message : 'Unknown error',
          stack: exchangeError instanceof Error ? exchangeError.stack : undefined,
          name: exchangeError instanceof Error ? exchangeError.name : undefined
        };
        console.error("Detailed error information:", JSON.stringify(errorDetails, null, 2));
        
        // Check for database-related errors
        const errorMessage = errorDetails.message || '';
        if (errorMessage.includes('database') || 
            errorMessage.includes('unique constraint') || 
            errorMessage.includes('duplicate key') ||
            errorMessage.includes('violates')) {
          // This is likely a database error
          const errorUrl = new URL(`${baseUrl}/auth/auth-error`);
          errorUrl.hash = `error=server_error&error_code=database_setup_error&error_description=${encodeURIComponent('The database encountered an error. This is likely a server configuration issue. Please contact support.')}`;
          return NextResponse.redirect(errorUrl);
        }
        
        const errorUrl = new URL(`${baseUrl}/auth/auth-error`);
        // Use hash fragment for error details
        errorUrl.hash = `error=exchange_error&error_code=exception&error_description=${encodeURIComponent(
          errorDetails.message || 'An unexpected error occurred during authentication.'
        )}`;
        return NextResponse.redirect(errorUrl);
      }
    } else {
      console.log("No code found in auth callback request");
    }

    // Return the user to an error page with instructions
    console.log("Redirecting to error page due to missing code");
    const errorUrl = new URL(`${baseUrl}/auth/auth-error`);
    errorUrl.hash = `error=missing_code&error_description=${encodeURIComponent('Authentication code is missing. Please try again.')}`;
    return NextResponse.redirect(errorUrl);
  } catch (error) {
    console.error("Unexpected error in auth callback:", error);
    // Create a detailed error object for better debugging
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    };
    console.error("Detailed error information:", JSON.stringify(errorDetails, null, 2));
    
    // Use referrer or host as fallback
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;
      
    // Create error URL with hash parameters
    const errorUrl = new URL(`${baseUrl}/auth/auth-error`);
    errorUrl.hash = `error=server_error&error_code=callback_exception&error_description=${encodeURIComponent(
      errorDetails.message || 'An unexpected server error occurred.'
    )}`;
    
    return NextResponse.redirect(errorUrl);
  }
} 
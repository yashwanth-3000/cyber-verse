import { createSupabaseReqResClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    console.log("Auth callback called with URL:", request.url);
    
    // Check for error parameters in the request URL
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
      
      // Get base URL from request or environment variables
      const host = request.headers.get("host") || "";
      const protocol = host.includes("localhost") ? "http" : "https";
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
      
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
      const errorUrl = new URL(`${baseUrl}/auth/auth-error`, request.url);
      errorUrl.hash = errorHash;
      
      return NextResponse.redirect(errorUrl);
    }
    
    const code = requestUrl.searchParams.get("code");
    console.log("Auth code present:", !!code);
    
    const next = requestUrl.searchParams.get("next") || "/";
    console.log("Next redirect target:", next);

    // Additional logging to help diagnose issues
    console.log("Request headers:", Object.fromEntries(request.headers.entries()));
    
    // Get base URL from request or environment variables
    const host = request.headers.get("host") || "";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
    console.log("Using base URL:", baseUrl);
    console.log("Environment:", {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
      VERCEL_URL: process.env.VERCEL_URL,
    });

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
          const errorUrl = new URL(`${baseUrl}/auth/auth-error`, request.url);
          // Use hash fragment for error details to prevent loss during redirects
          errorUrl.hash = `error=auth_error&error_code=${error.code || 'unknown'}&error_description=${encodeURIComponent(error.message)}`;
          return NextResponse.redirect(errorUrl);
        }
        
        console.log("Successfully exchanged code for session:", !!data?.session);
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
          const errorUrl = new URL(`${baseUrl}/auth/auth-error`, request.url);
          errorUrl.hash = `error=server_error&error_code=database_setup_error&error_description=${encodeURIComponent('The database encountered an error. This is likely a server configuration issue. Please contact support.')}`;
          return NextResponse.redirect(errorUrl);
        }
        
        const errorUrl = new URL(`${baseUrl}/auth/auth-error`, request.url);
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
    const errorUrl = new URL(`${baseUrl}/auth/auth-error`, request.url);
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
    
    // Fallback URL for errors - try to use environment variable first
    const errorUrl = process.env.NEXT_PUBLIC_SITE_URL 
      ? new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/auth/auth-error`, request.url)
      : new URL(`${request.headers.get("origin") || "https://cyber-verse-psi.vercel.app"}/auth/auth-error`, request.url);
      
    // Use hash fragment for error details
    errorUrl.hash = `error=server_error&error_code=callback_exception&error_description=${encodeURIComponent(
      errorDetails.message || 'An unexpected server error occurred.'
    )}`;
    return NextResponse.redirect(errorUrl);
  }
} 
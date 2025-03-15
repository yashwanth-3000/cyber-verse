import { createSupabaseReqResClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    console.log("Auth callback called with URL:", request.url);
    
    const code = requestUrl.searchParams.get("code");
    console.log("Auth code present:", !!code);
    
    const next = requestUrl.searchParams.get("next") || "/";
    console.log("Next redirect target:", next);

    // Get base URL from request or environment variables
    const host = request.headers.get("host") || "";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
    console.log("Using base URL:", baseUrl);

    if (code) {
      // Create a response that redirects to the next URL
      // Make sure we use the absolute URL to avoid localhost redirects
      const redirectUrl = new URL(next.startsWith("http") ? next : `${baseUrl}${next.startsWith("/") ? next : `/${next}`}`);
      console.log("Redirecting to:", redirectUrl.toString());
      
      const response = NextResponse.redirect(redirectUrl);
      
      // Create a Supabase client using the request and response
      const supabase = createSupabaseReqResClient(request, response);
      
      try {
        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error("Error exchanging code for session:", error.message);
          const errorUrl = new URL(`${baseUrl}/auth/auth-error`, request.url);
          // Use hash fragment for error details to prevent loss during redirects
          errorUrl.hash = `error=auth_error&error_code=${error.code || 'unknown'}&error_description=${encodeURIComponent(error.message)}`;
          return NextResponse.redirect(errorUrl);
        }
        
        return response;
      } catch (exchangeError) {
        console.error("Exception in code exchange:", exchangeError);
        const errorUrl = new URL(`${baseUrl}/auth/auth-error`, request.url);
        // Use hash fragment for error details
        errorUrl.hash = `error=exchange_error&error_description=${encodeURIComponent('An unexpected error occurred during authentication.')}`;
        return NextResponse.redirect(errorUrl);
      }
    }

    // Return the user to an error page with instructions
    const errorUrl = new URL(`${baseUrl}/auth/auth-error`, request.url);
    errorUrl.hash = `error=missing_code&error_description=${encodeURIComponent('Authentication code is missing. Please try again.')}`;
    return NextResponse.redirect(errorUrl);
  } catch (error) {
    console.error("Unexpected error in auth callback:", error);
    
    // Fallback URL for errors - try to use environment variable first
    const errorUrl = process.env.NEXT_PUBLIC_SITE_URL 
      ? new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/auth/auth-error`, request.url)
      : new URL(`${request.headers.get("origin") || "https://cyber-verse-psi.vercel.app"}/auth/auth-error`, request.url);
      
    // Use hash fragment for error details
    errorUrl.hash = `error=server_error&error_description=${encodeURIComponent('An unexpected server error occurred.')}`;
    return NextResponse.redirect(errorUrl);
  }
} 
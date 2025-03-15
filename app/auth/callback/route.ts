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
          return NextResponse.redirect(new URL(`${baseUrl}/auth/auth-error?error=${encodeURIComponent(error.message)}`, request.url));
        }
        
        return response;
      } catch (exchangeError) {
        console.error("Exception in code exchange:", exchangeError);
        return NextResponse.redirect(new URL(`${baseUrl}/auth/auth-error?error=exchange_error`, request.url));
      }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(new URL(`${baseUrl}/auth/auth-error?error=missing_code`, request.url));
  } catch (error) {
    console.error("Unexpected error in auth callback:", error);
    
    // Fallback URL for errors - try to use environment variable first
    const errorUrl = process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/auth-error?error=server_error` 
      : `${request.headers.get("origin") || "https://cyber-verse-psi.vercel.app"}/auth/auth-error?error=server_error`;
      
    return NextResponse.redirect(new URL(errorUrl, request.url));
  }
} 
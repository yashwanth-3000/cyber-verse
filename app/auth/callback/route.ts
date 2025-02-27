import { createSupabaseReqResClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (code) {
    // Create a response that redirects to the next URL
    const response = NextResponse.redirect(new URL(next, request.url));
    
    // Create a Supabase client using the request and response
    const supabase = createSupabaseReqResClient(request, response);
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Error exchanging code for session:", error.message);
      return NextResponse.redirect(new URL("/auth/auth-error", request.url));
    }
    
    return response;
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL("/auth/auth-error", request.url));
} 
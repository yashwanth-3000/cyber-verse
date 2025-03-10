import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseReqResClient } from "./lib/supabase/server-client";
import { createClient } from "@supabase/supabase-js";

// Helper function to create a profile with service role
async function createProfileWithServiceRoleInMiddleware(userId: string, email: string, fullName: string = '', avatarUrl: string = '') {
  // Create a Supabase client with the service role key
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
  
  try {
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking if profile exists in middleware:', checkError);
      return false;
    }
    
    // If profile already exists, return success
    if (existingProfile) {
      return true;
    }
    
    // Create the profile
    const { error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName,
        avatar_url: avatarUrl
      });
      
    if (insertError) {
      console.error('Error creating profile with service role in middleware:', insertError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error creating profile with service role in middleware:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  // Create a response object that we'll modify and return
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createSupabaseReqResClient(request, response);

  // Get the user's session and refresh it
  const { data } = await supabase.auth.getSession();
  
  // Get the user data
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Protected routes that require authentication
  const protectedRoutes = [
    "/account", 
    "/dashboard", 
    "/create-challenge",
    "/resources/add"
  ];
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

  // Auth routes where logged-in users shouldn't go
  const authRoutes = ["/login", "/signup"];
  const isAuthRoute = authRoutes.some(route => path.startsWith(route));

  // If user is not logged in and trying to access a protected route
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url);
    // Add the original URL as a "next" parameter to redirect after login
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is logged in and trying to access an auth route
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  // If user is logged in, ensure their profile exists
  if (user) {
    try {
      // Check if profile exists
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      // If profile doesn't exist, create it using service role
      if (error && error.code === 'PGRST116') { // No rows returned
        await createProfileWithServiceRoleInMiddleware(
          user.id,
          user.email || '',
          user.user_metadata?.full_name || '',
          user.user_metadata?.avatar_url || ''
        );
      }
    } catch (error) {
      console.error('Error ensuring profile exists in middleware:', error);
    }
  }

  // Check for environment variables in development
  if (process.env.NODE_ENV === 'development') {
    const localCallback = /\/auth\/callback/.test(path);
    
    if (localCallback) {
      console.log("Auth callback URL detected in development mode:", path);
    }
  }

  return response;
}

// Only run the middleware on auth-related routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 
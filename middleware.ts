import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseReqResClient } from "./lib/supabase/server-client";
import { createClient } from "@supabase/supabase-js";

// Helper function to create a profile with service role
async function createProfileWithServiceRoleInMiddleware(userId: string, email: string, fullName: string = '', avatarUrl: string = '') {
  // Create a Supabase client with the service role key
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing required environment variables for createProfileWithServiceRoleInMiddleware');
    return false;
  }

  try {
    // Log attempt for debugging
    console.log(`Attempting to create profile for user ${userId} with email ${email}`);
    
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
    
    // First check if the profile already exists by ID (most reliable method)
    try {
      const { data: existingProfile, error: checkIdError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (existingProfile) {
        console.log(`Profile for user ${userId} already exists, no need to create one`);
        return true;
      }
      
      if (checkIdError && checkIdError.code !== 'PGRST116') {
        console.error('Error checking for existing profile by ID:', checkIdError);
        console.warn('Will attempt to create profile anyway');
      }
    } catch (checkError) {
      console.error('Exception checking for existing profile:', checkError);
      console.warn('Will attempt to create profile anyway');
    }
    
    // UPDATED APPROACH: Focus on RPC methods since they're working
    
    // 1. Try using the force_create_profile RPC function first (this is working in tests)
    try {
      console.log('Attempting profile creation via force_create_profile RPC');
      
      const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('force_create_profile', { 
        user_id: userId,
        user_email: email
      });
      
      // Log RPC result for debugging
      if (rpcData) {
        console.log('RPC result:', rpcData);
      }
      
      if (!rpcError) {
        console.log(`Successfully created profile via force_create_profile RPC for user ${userId}`);
        return true;
      }
      
      // Check for ambiguity error and try the minimal version if that's the problem
      if (rpcError.message && rpcError.message.includes('could not choose the best candidate function')) {
        console.warn('Function ambiguity detected, trying create_minimal_profile instead');
        
        const { data: minimalData, error: minimalError } = await supabaseAdmin.rpc('create_minimal_profile', { 
          user_id: userId
        });
        
        if (!minimalError) {
          console.log(`Successfully created profile via create_minimal_profile RPC for user ${userId}`);
          return true;
        }
        
        console.error('Minimal profile creation failed:', minimalError);
      } else {
        console.error('RPC profile creation failed:', rpcError);
      }
    } catch (rpcErr) {
      console.error('Exception during RPC profile creation:', rpcErr);
    }
    
    // 2. Fall back to direct insertion if RPC fails
    try {
      // Define the profile data with proper typing
      interface ProfileData {
        id: string;
        email: string;
        full_name?: string;
        avatar_url?: string;
      }
      
      const fallbackData: ProfileData = {
        id: userId,
        email: email || `user-${userId.substring(0, 8)}-${Date.now()}@example.com`
      };
      
      // Only add optional fields if they have values
      if (fullName) {
        fallbackData.full_name = fullName;
      }
      
      if (avatarUrl) {
        fallbackData.avatar_url = avatarUrl;
      }
      
      console.log('Attempting direct insertion as fallback with:', fallbackData);
      
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert(fallbackData);
        
      if (!insertError) {
        console.log(`Successfully created profile via direct insertion for user ${userId}`);
        return true;
      }
      
      console.error('Direct insertion profile creation failed:', insertError);
      
      // Handle foreign key constraint specifically
      if (insertError.code === '23503' && insertError.message.includes('violates foreign key constraint')) {
        console.error('Foreign key violation - the user ID does not exist in auth.users');
        return false;
      }
    } catch (insertErr) {
      console.error('Exception during direct insertion profile creation:', insertErr);
    }
    
    // All attempts failed
    console.error(`All profile creation attempts failed for user ${userId}`);
    return false;
  } catch (error) {
    console.error('Unhandled exception during profile creation:', error);
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
      // Skip profile creation if we're already on the error page to prevent loops
      if (path.includes('/auth/auth-error')) {
        console.log('Skipping profile check on error page to prevent redirect loops');
      } else {
        // Check if profile exists
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        // If there's an error that's not just "no rows returned"
        if (error) {
          if (error.code === 'PGRST116') { // No rows returned
            // Try to create the profile
            const profileCreated = await createProfileWithServiceRoleInMiddleware(
              user.id,
              user.email || '',
              user.user_metadata?.full_name || '',
              user.user_metadata?.avatar_url || ''
            );
            
            // If profile creation failed, we need to handle it
            if (!profileCreated) {
              console.error('Failed to create profile in middleware for user:', user.id);
              
              // Redirect to error page with appropriate error information in the hash
              const errorUrl = new URL('/auth/auth-error', request.url);
              errorUrl.hash = `error=server_error&error_code=profile_creation_failed&error_description=${encodeURIComponent('Failed to create user profile. The database may not be properly set up.')}`;
              return NextResponse.redirect(errorUrl);
            }
          } else if (error.message && error.message.includes('does not exist')) {
            // The profiles table doesn't exist
            console.error('The profiles table does not exist in the database');
            
            // Redirect to a special error page for database setup issues
            const errorUrl = new URL('/auth/auth-error', request.url);
            errorUrl.hash = `error=server_error&error_code=database_setup_error&error_description=${encodeURIComponent('The database is not properly set up. The profiles table is missing.')}`;
            return NextResponse.redirect(errorUrl);
          } else {
            // Some other database error
            console.error('Error checking if profile exists:', error);
            
            // Redirect to error page
            const errorUrl = new URL('/auth/auth-error', request.url);
            errorUrl.hash = `error=server_error&error_code=database_error&error_description=${encodeURIComponent('A database error occurred: ' + error.message)}`;
            return NextResponse.redirect(errorUrl);
          }
        }
      }
    } catch (error) {
      console.error('Error ensuring profile exists in middleware:', error);
      
      // Only redirect if not already on error page
      if (!path.includes('/auth/auth-error')) {
        const errorUrl = new URL('/auth/auth-error', request.url);
        errorUrl.hash = `error=server_error&error_code=unexpected_error&error_description=${encodeURIComponent('An unexpected error occurred while checking your profile.')}`;
        return NextResponse.redirect(errorUrl);
      }
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
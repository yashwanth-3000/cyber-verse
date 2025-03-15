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
    console.log(`Attempting to create profile for user ${userId}`);
    
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
    
    // First check if the profiles table exists
    try {
      // Check if the profiles table exists by querying the information schema
      const { data: tableExists, error: tableCheckError } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'profiles')
        .eq('table_schema', 'public')
        .single();
      
      if (tableCheckError) {
        console.error('Error checking if profiles table exists:', tableCheckError);
        // Try a different approach - check if we can query the table directly
        const { error: directCheckError } = await supabaseAdmin
          .from('profiles')
          .select('count(*)', { count: 'exact', head: true });
        
        if (directCheckError) {
          console.error('Error directly checking profiles table:', directCheckError);
          console.error('The profiles table may not exist. Please create it first.');
          return false;
        }
      } else if (!tableExists) {
        console.error('Profiles table does not exist in the database');
        return false;
      }
    } catch (schemaError) {
      console.error('Error checking schema for profiles table:', schemaError);
      // Continue anyway, as the error might be due to permissions
    }
    
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (checkError) {
      if (checkError.code !== 'PGRST116') { // Not a "no rows returned" error
        console.error('Error checking if profile exists in middleware:', checkError);
        
        // If the error is about the table not existing, log it clearly
        if (checkError.message && checkError.message.includes('does not exist')) {
          console.error('The profiles table does not exist. Please create it with the following SQL:');
          console.error(`
            CREATE TABLE public.profiles (
              id UUID PRIMARY KEY REFERENCES auth.users(id),
              email TEXT,
              full_name TEXT,
              avatar_url TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `);
          return false;
        }
        
        return false;
      }
      // PGRST116 means no rows returned, which is expected if the profile doesn't exist
    } else if (existingProfile) {
      // Profile exists, return success
      console.log(`Profile for user ${userId} already exists, skipping creation`);
      return true;
    }
    
    // Prepare profile data with safe defaults
    const profileData = {
      id: userId,
      email: email || `user-${userId.substring(0, 8)}@example.com`,
      full_name: fullName || email?.split('@')[0] || `User ${userId.substring(0, 6)}`,
      avatar_url: avatarUrl || '',
      created_at: new Date().toISOString()
    };
    
    console.log(`Creating profile with data:`, profileData);
    
    // Create the profile with proper error handling
    const { error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert(profileData);
      
    if (insertError) {
      console.error('Error creating profile with service role in middleware:', insertError);
      
      // If the error is because the profile already exists (unique constraint), 
      // we can consider this a success
      if (insertError.code === '23505') { // PostgreSQL unique violation code
        console.log('Profile already exists (constraint violation), considering as success');
        return true;
      }
      
      // If the error is about the table not existing, log it clearly
      if (insertError.message && insertError.message.includes('does not exist')) {
        console.error('The profiles table does not exist. Please create it with the following SQL:');
        console.error(`
          CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id),
            email TEXT,
            full_name TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
      }
      
      return false;
    }
    
    console.log(`Successfully created profile for user ${userId}`);
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
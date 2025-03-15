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
    
    // First check if the profiles table exists
    try {
      // Try a direct query as a quick way to see if the table exists
      const { error: directCheckError } = await supabaseAdmin
        .from('profiles')
        .select('count(*)', { count: 'exact', head: true });
      
      if (directCheckError) {
        console.error('Error directly checking profiles table:', directCheckError);
        console.error('The profiles table may not exist. Please create it first.');
        return false;
      }
    } catch (schemaError) {
      console.error('Error checking schema for profiles table:', schemaError);
      return false;
    }
    
    // Check if profile already exists with this ID
    console.log(`Checking if profile exists for user ID: ${userId}`);
    const { data: existingProfileById, error: idCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .maybeSingle();
      
    if (idCheckError && idCheckError.code !== 'PGRST116') {
      console.error('Error checking if profile exists by ID:', idCheckError);
      return false;
    }
    
    // Check if profile already exists with this email but different ID
    if (email) {
      console.log(`Checking if profile exists for email: ${email}`);
      const { data: existingProfileByEmail, error: emailCheckError } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .neq('id', userId)  // Exclude the current user ID
        .maybeSingle();
        
      if (emailCheckError && emailCheckError.code !== 'PGRST116') {
        console.error('Error checking if profile exists by email:', emailCheckError);
        return false;
      }
      
      // If the email is already used by another profile, use a different email
      if (existingProfileByEmail) {
        console.log(`Email ${email} is already used by another profile, using generated email`);
        email = `user-${userId.substring(0, 8)}@example.com`;
      }
    } else {
      // Ensure we have a valid email
      email = `user-${userId.substring(0, 8)}@example.com`;
    }
    
    // Handle existing profile
    if (existingProfileById) {
      console.log(`Profile for user ${userId} already exists, updating if needed`);
      
      // Only update if the email is different
      if (existingProfileById.email !== email) {
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ email })
          .eq('id', userId);
          
        if (updateError) {
          console.error('Error updating existing profile:', updateError);
          return false;
        }
        
        console.log(`Successfully updated email for existing profile: ${userId}`);
      } else {
        console.log(`No changes needed for profile: ${userId}`);
      }
      
      return true;
    }
    
    // Prepare profile data with only required fields
    // Let the database handle defaults for created_at and updated_at
    const profileData: {
      id: string;
      email: string;
      full_name?: string;
      avatar_url?: string;
    } = {
      id: userId,
      email
    };

    // Only add optional fields if they have values
    if (fullName) profileData.full_name = fullName;
    if (avatarUrl) profileData.avatar_url = avatarUrl;

    console.log(`Creating new profile with data:`, profileData);
    
    // Try to create the profile
    const { error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert(profileData);

    if (insertError) {
      console.error('Error creating profile:', insertError);
      console.error('Specific error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      
      // If it's a unique violation, try one more time with a definitely unique email
      if (insertError.code === '23505') { 
        console.log('Unique constraint violation, trying again with guaranteed unique email');
        
        const uniqueEmail = `user-${userId}-${Date.now()}@example.com`;
        const retryData: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
        } = {
          id: userId,
          email: uniqueEmail
        };
        
        if (fullName) retryData.full_name = fullName;
        if (avatarUrl) retryData.avatar_url = avatarUrl;
        
        const { error: retryError } = await supabaseAdmin
          .from('profiles')
          .insert(retryData);
          
        if (retryError) {
          console.error('Error on retry of profile creation:', retryError);
          return false;
        }
        
        console.log(`Successfully created profile on retry for user ${userId}`);
        return true;
      }
      
      return false;
    }
    
    console.log(`Successfully created profile for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Exception during profile creation:', error);
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
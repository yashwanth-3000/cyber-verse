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

  // Allow up to 3 retries for profile creation
  const MAX_RETRIES = 3;
  let retries = 0;
  
  // Helper function to delay execution
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  while (retries <= MAX_RETRIES) {
    try {
      // Log attempt for debugging
      if (retries > 0) {
        console.log(`Retry attempt ${retries} for user ${userId} after delay`);
      } else {
        console.log(`Attempting to create profile for user ${userId} with email ${email}`);
      }
      
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
      
      // 1. Try using the create_minimal_profile RPC function first (simplest and most reliable)
      try {
        console.log('Attempting profile creation via create_minimal_profile RPC');
        
        const { data: minimalData, error: minimalError } = await supabaseAdmin.rpc('create_minimal_profile', { 
          user_id: userId
        });
        
        // Log RPC result for debugging
        if (minimalData) {
          console.log('RPC result:', minimalData);
          
          // Update the email in a separate step if the minimal profile creation worked
          if (email) {
            try {
              await supabaseAdmin
                .from('profiles')
                .update({ email: email })
                .eq('id', userId);
              
              console.log(`Updated email for profile ${userId}`);
            } catch (emailErr) {
              console.error('Failed to update email, but profile was created:', emailErr);
            }
          }
          
          return true;
        }
        
        // Check for foreign key constraint error - this means the auth.users entry isn't ready yet
        if (minimalError && 
           (minimalError.code === '23503' || 
            (minimalError.message && minimalError.message.includes('violates foreign key constraint')))) {
          
          if (retries < MAX_RETRIES) {
            // Wait a bit longer on each retry (exponential backoff)
            const waitTime = Math.pow(2, retries) * 500; // 500ms, 1s, 2s
            console.log(`Foreign key constraint error, waiting ${waitTime}ms before retry`);
            await delay(waitTime);
            retries++;
            continue; // Go to next retry iteration
          }
        } else if (minimalError) {
          console.error('Minimal profile creation failed:', minimalError);
        }
      } catch (minimalErr) {
        console.error('Exception during minimal profile creation:', minimalErr);
      }
      
      // 2. Try using the force_create_profile RPC function as fallback
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
        
        // Check for foreign key constraint error with this method too
        if (rpcError && 
           (rpcError.code === '23503' || 
            (rpcError.message && rpcError.message.includes('violates foreign key constraint')))) {
          
          if (retries < MAX_RETRIES) {
            // Wait a bit longer on each retry
            const waitTime = Math.pow(2, retries) * 500; // 500ms, 1s, 2s
            console.log(`Foreign key constraint error in force_create_profile, waiting ${waitTime}ms before retry`);
            await delay(waitTime);
            retries++;
            continue; // Go to next retry iteration
          }
        } else if (rpcError.message && rpcError.message.includes('could not choose the best candidate function')) {
          console.warn('Function ambiguity detected, this should have been fixed by the fix_function_ambiguity.sql script');
        } else {
          console.error('RPC profile creation failed:', rpcError);
        }
      } catch (rpcErr) {
        console.error('Exception during RPC profile creation:', rpcErr);
      }
      
      // 3. Final attempt - direct insertion if both RPC methods failed
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
          
          if (retries < MAX_RETRIES) {
            // Wait a bit longer on each retry
            const waitTime = Math.pow(2, retries) * 500; // 500ms, 1s, 2s
            console.log(`Foreign key constraint error in direct insertion, waiting ${waitTime}ms before retry`);
            await delay(waitTime);
            retries++;
            continue; // Go to next retry iteration
          }
        }
      } catch (insertErr) {
        console.error('Exception during direct insertion profile creation:', insertErr);
      }

      // If we've reached here in this iteration, all attempts failed
      retries++;
      
      // Only delay if we're going to retry
      if (retries <= MAX_RETRIES) {
        const waitTime = Math.pow(2, retries - 1) * 1000; // 1s, 2s, 4s
        console.log(`All profile creation attempts failed, waiting ${waitTime}ms before retry ${retries}`);
        await delay(waitTime);
      }
      
    } catch (error) {
      console.error('Unhandled exception during profile creation:', error);
      
      // Only retry unhandled exceptions once
      if (retries === 0) {
        retries++;
        await delay(1000); // Wait 1 second before retry
      } else {
        return false; // Give up after one retry for unhandled exceptions
      }
    }
  }
  
  // All retries exhausted and all attempts failed
  console.error(`All profile creation attempts failed after ${MAX_RETRIES} retries for user ${userId}`);
  return false;
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
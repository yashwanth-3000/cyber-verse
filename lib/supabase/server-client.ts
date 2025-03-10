import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Ensure environment variables are defined
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error("ERROR: Required Supabase environment variables are missing!");
  console.error("Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.");
}

// This function is for use in Server Components and API Routes in the App Router
export function createSupabaseServerClient() {
  const cookieStore = cookies();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Required Supabase environment variables are missing. Please check your environment configuration.");
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}

// This function is for use in middleware.ts or edge functions
export function createSupabaseReqResClient(
  request: NextRequest,
  response: NextResponse
) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Required Supabase environment variables are missing. Please check your environment configuration.");
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );
}

// Add a function to create a profile using the service role key
export async function createProfileWithServiceRole(userId: string, email: string, fullName: string = '', avatarUrl: string = '') {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Required Supabase environment variables are missing. Please check your environment configuration.");
  }

  // Create a Supabase client with the service role key
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
  
  try {
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking if profile exists:', checkError);
      return { success: false, error: checkError.message };
    }
    
    // If profile already exists, return success
    if (existingProfile) {
      return { success: true, created: false };
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
      console.error('Error creating profile with service role:', insertError);
      return { success: false, error: insertError.message };
    }
    
    return { success: true, created: true };
  } catch (error) {
    console.error('Unexpected error creating profile with service role:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
} 
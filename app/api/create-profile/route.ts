import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { createProfileWithServiceRole } from '@/lib/supabase/server-client';

export async function POST(request: NextRequest) {
  try {
    // Get the current user from the session
    const supabase = createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to create a profile' },
        { status: 401 }
      );
    }
    
    // Create the profile using the service role
    const { success, error, created } = await createProfileWithServiceRole(
      user.id,
      user.email || '',
      user.user_metadata?.full_name || '',
      user.user_metadata?.avatar_url || ''
    );
    
    if (!success) {
      return NextResponse.json(
        { error: 'Profile Creation Failed', message: error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      created,
      message: created ? 'Profile created successfully' : 'Profile already exists'
    });
  } catch (error) {
    console.error('Error in create-profile API route:', error);
    return NextResponse.json(
      { error: 'Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 
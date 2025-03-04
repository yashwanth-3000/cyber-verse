import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient();
  
  // Get current user with authenticated method
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }
  
  // Extract user profile data
  const userProfile = {
    id: user.id,
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    email: user.email,
    avatar: user.user_metadata?.avatar_url || '',
    provider: user.app_metadata?.provider || 'email',
  };
  
  return NextResponse.json(userProfile);
} 
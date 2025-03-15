import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // Ensure this is always dynamic

export async function GET(request: NextRequest) {
  try {
    console.log('OAuth debug endpoint called');
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Get the most recent users
    const { data: recentUsers, error: usersError } = await supabaseAdmin
      .from('auth.users')
      .select('id, email, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
      
    // Check if these users have profiles
    interface ProfileCheck {
      user_id: string;
      user_created_at: string;
      has_profile: boolean;
      fix_attempted?: boolean;
      fix_result?: string;
      fix_error?: string;
    }
    
    const profileChecks: ProfileCheck[] = [];
    
    if (recentUsers && recentUsers.length > 0) {
      for (const user of recentUsers) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
          
        profileChecks.push({
          user_id: user.id,
          user_created_at: user.created_at,
          has_profile: !!profile
        });
        
        // If user doesn't have a profile, try to create one
        if (!profile) {
          const { data: fixResult, error: fixError } = await supabaseAdmin.rpc(
            'fix_oauth_profile',
            { user_id: user.id }
          );
          
          profileChecks[profileChecks.length - 1].fix_attempted = true;
          profileChecks[profileChecks.length - 1].fix_result = fixResult;
          profileChecks[profileChecks.length - 1].fix_error = fixError?.message;
        }
      }
    }
    
    // Check trigger status
    let triggerStatus = 'unknown';
    
    try {
      const { data: triggerCheck } = await supabaseAdmin.rpc('check_trigger_exists', { 
        trigger_name: 'on_auth_user_created' 
      });
      
      triggerStatus = triggerCheck || 'not_found';
    } catch (err) {
      console.error('Error checking trigger:', err);
      triggerStatus = 'error_checking';
    }
    
    // Return the results
    return NextResponse.json({
      success: true,
      recent_users_count: recentUsers?.length || 0,
      profile_checks: profileChecks,
      trigger_status: triggerStatus,
      fix_instructions: [
        "1. Run the migrations/oauth_fix.sql script in your Supabase SQL Editor",
        "2. Make sure all service role policies are added (run migrations/absolute_minimum.sql)",
        "3. Try Google login again",
        "4. If still having issues, check the logs in your Supabase dashboard"
      ],
      supabase_oauth_settings_to_check: [
        "Authorized redirect URL should include your site's callback URL",
        "Google Provider should be enabled",
        "Google Client ID and Secret should be correctly entered",
        "Site URL should be correctly set"
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in OAuth debug endpoint:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error debugging OAuth',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
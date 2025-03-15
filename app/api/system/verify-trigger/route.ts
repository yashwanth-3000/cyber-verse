import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // Ensure this is always dynamic

export async function GET(request: NextRequest) {
  try {
    console.log('Verifying OAuth trigger...');
    
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
    
    // Check for the trigger using direct SQL
    const { data, error } = await supabaseAdmin.rpc('check_for_trigger');
    
    if (error) {
      // If the RPC doesn't exist, try a simple query
      const { count, error: rawError } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (rawError) {
        return NextResponse.json({
          success: false,
          error: `Error checking for triggers: ${error.message}`,
          fallback_check: {
            success: false,
            error: rawError.message
          },
          next_steps: [
            "1. Run migrations/trigger_only_fix.sql in your Supabase SQL Editor",
            "2. Make sure service role policies are enabled (run migrations/absolute_minimum.sql)",
            "3. Try Google login again"
          ],
          timestamp: new Date().toISOString()
        });
      }
      
      // We can at least verify that the database is accessible
      return NextResponse.json({
        success: true,
        trigger_check: {
          success: false,
          error: error.message
        },
        fallback_check: {
          success: true,
          profiles_count: count
        },
        next_steps: [
          "1. Run migrations/trigger_only_fix.sql in your Supabase SQL Editor",
          "2. Make sure service role policies are enabled (run migrations/absolute_minimum.sql)", 
          "3. Try Google login again"
        ],
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({
      success: true,
      trigger_exists: !!data,
      trigger_info: data,
      next_steps: data 
        ? ["Trigger is installed. Try Google login again."] 
        : ["Run migrations/trigger_only_fix.sql in your Supabase SQL Editor"],
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error verifying trigger:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error verifying trigger',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      stack: error instanceof Error ? error.stack : undefined,
      next_steps: [
        "1. Run migrations/trigger_only_fix.sql in your Supabase SQL Editor",
        "2. Make sure service role policies are enabled (run migrations/absolute_minimum.sql)",
        "3. Try Google login again"
      ],
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This route is meant to be called by an admin to diagnose and fix database issues
// It should be protected in production environments

export async function GET(request: NextRequest) {
  try {
    // Security check - only allow in development or with admin key
    const isDevMode = process.env.NODE_ENV === 'development';
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_API_KEY || 'dev-mode-key';
    
    const isAuthorized = isDevMode || (authHeader === `Bearer ${adminKey}`);
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'This endpoint is restricted to administrators' },
        { status: 401 }
      );
    }
    
    // Check if Supabase environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Configuration Error', message: 'Missing required Supabase environment variables' },
        { status: 500 }
      );
    }
    
    // Create Supabase admin client
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
    
    // Diagnostic information
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      checks: [] as any[]
    };
    
    // Check if profiles table exists
    try {
      const { data: tableData, error: tableError } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'profiles')
        .single();
      
      const tableExists = !!tableData;
      
      diagnostics.checks.push({
        name: 'profiles_table_exists',
        success: tableExists,
        message: tableExists ? 'Profiles table exists' : 'Profiles table does not exist',
        error: tableError ? tableError.message : null
      });
      
      if (!tableExists) {
        // Try to create the profiles table
        const { error: createError } = await supabaseAdmin.rpc('create_profiles_table_if_missing');
        
        diagnostics.checks.push({
          name: 'create_profiles_table',
          success: !createError,
          message: !createError ? 'Attempted to create profiles table' : 'Failed to create profiles table',
          error: createError ? createError.message : null
        });
      }
    } catch (error) {
      diagnostics.checks.push({
        name: 'check_profiles_table',
        success: false,
        message: 'Error checking profiles table',
        error: error instanceof Error ? error.message : String(error)
      });
    }
    
    // Check RLS policies
    try {
      const { data: policies, error: policiesError } = await supabaseAdmin
        .from('pg_policies')
        .select('policyname')
        .like('tablename', 'profiles')
        .order('policyname');
      
      const hasServiceRoleInsertPolicy = policies?.some(p => 
        p.policyname === 'Service role can insert any profile');
      
      diagnostics.checks.push({
        name: 'rls_policies',
        success: !policiesError,
        message: !policiesError ? `Found ${policies?.length || 0} RLS policies for profiles table` : 'Error fetching RLS policies',
        error: policiesError ? policiesError.message : null,
        policies: policies?.map(p => p.policyname) || [],
        hasServiceRoleInsertPolicy
      });
      
      // If missing service role insert policy, try to create it
      if (!hasServiceRoleInsertPolicy) {
        try {
          const { error: policyError } = await supabaseAdmin.rpc('add_service_role_policies');
          
          diagnostics.checks.push({
            name: 'add_service_role_policy',
            success: !policyError,
            message: !policyError ? 'Added service role policies' : 'Failed to add service role policies',
            error: policyError ? policyError.message : null
          });
        } catch (error) {
          diagnostics.checks.push({
            name: 'add_service_role_policy',
            success: false,
            message: 'Error adding service role policies',
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    } catch (error) {
      diagnostics.checks.push({
        name: 'check_rls_policies',
        success: false,
        message: 'Error checking RLS policies',
        error: error instanceof Error ? error.message : String(error)
      });
    }
    
    // Check users without profiles
    try {
      const { data: usersWithoutProfiles, error: userCheckError } = await supabaseAdmin.rpc('find_users_without_profiles');
      
      diagnostics.checks.push({
        name: 'users_without_profiles',
        success: !userCheckError,
        message: !userCheckError 
          ? `Found ${usersWithoutProfiles?.length || 0} users without profiles` 
          : 'Error checking users without profiles',
        error: userCheckError ? userCheckError.message : null,
        count: usersWithoutProfiles?.length || 0
      });
      
      // If there are users without profiles, try to create them
      if (usersWithoutProfiles && usersWithoutProfiles.length > 0) {
        const creationResults = [];
        
        for (const user of usersWithoutProfiles.slice(0, 10)) { // Limit to first 10 users
          try {
            const { error: createProfileError } = await supabaseAdmin
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email || `user-${user.id.substring(0, 8)}@example.com`
              });
            
            creationResults.push({
              user_id: user.id,
              success: !createProfileError,
              error: createProfileError ? createProfileError.message : null
            });
          } catch (error) {
            creationResults.push({
              user_id: user.id,
              success: false,
              error: error instanceof Error ? error.message : String(error)
            });
          }
        }
        
        diagnostics.checks.push({
          name: 'create_missing_profiles',
          success: creationResults.every(r => r.success),
          message: `Attempted to create ${creationResults.length} missing profiles`,
          results: creationResults
        });
      }
    } catch (error) {
      diagnostics.checks.push({
        name: 'check_users_without_profiles',
        success: false,
        message: 'Error checking users without profiles',
        error: error instanceof Error ? error.message : String(error)
      });
    }
    
    // Check email uniqueness issues
    try {
      const { data: duplicateEmails, error: duplicateEmailsError } = await supabaseAdmin.rpc('find_duplicate_emails');
      
      diagnostics.checks.push({
        name: 'duplicate_emails',
        success: !duplicateEmailsError,
        message: !duplicateEmailsError 
          ? `Found ${duplicateEmails?.length || 0} duplicate emails in profiles` 
          : 'Error checking duplicate emails',
        error: duplicateEmailsError ? duplicateEmailsError.message : null,
        count: duplicateEmails?.length || 0,
        duplicates: duplicateEmails || []
      });
      
      // If there are duplicate emails, try to fix them
      if (duplicateEmails && duplicateEmails.length > 0) {
        const fixResults = [];
        
        for (const item of duplicateEmails) {
          try {
            // Update all but the first profile to use a unique email
            const { error: fixEmailError } = await supabaseAdmin.rpc(
              'fix_duplicate_email',
              { duplicate_email: item.email }
            );
            
            fixResults.push({
              email: item.email,
              success: !fixEmailError,
              error: fixEmailError ? fixEmailError.message : null
            });
          } catch (error) {
            fixResults.push({
              email: item.email,
              success: false,
              error: error instanceof Error ? error.message : String(error)
            });
          }
        }
        
        diagnostics.checks.push({
          name: 'fix_duplicate_emails',
          success: fixResults.every(r => r.success),
          message: `Attempted to fix ${fixResults.length} duplicate emails`,
          results: fixResults
        });
      }
    } catch (error) {
      diagnostics.checks.push({
        name: 'check_duplicate_emails',
        success: false,
        message: 'Error checking duplicate emails',
        error: error instanceof Error ? error.message : String(error)
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database diagnostic check completed',
      diagnostics
    });
  } catch (error) {
    console.error('Error in fix-database API:', error);
    
    return NextResponse.json(
      { 
        error: 'Server Error', 
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 
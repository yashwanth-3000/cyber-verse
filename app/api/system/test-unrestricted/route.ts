import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Mark this route as always dynamic to ensure we don't get static optimization errors
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('Test unrestricted profile creation API called');
  
  // Check for environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({
      error: 'Missing environment variables',
      details: {
        NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceKey ? 'exists (length: ' + supabaseServiceKey.length + ')' : 'missing'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // Create an admin client with service role key
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  const results = {
    tests: [] as { name: string; success: boolean; details: any }[],
    summary: { 
      success: false,
      timestamp: new Date().toISOString()
    }
  };
  
  // Generate a test user ID
  const testUserId = crypto.randomUUID();
  const testEmail = `test-user-${Date.now()}@example.com`;
  
  // Test 1: Try the completely unrestricted profile creation function
  try {
    const { data, error } = await supabaseAdmin.rpc(
      'create_unrestricted_profile',
      { 
        user_id: testUserId,
        user_email: testEmail
      }
    );
    
    results.tests.push({
      name: 'Unrestricted Profile Creation',
      success: !error,
      details: error ? { error: error.message, code: error.code } : { result: data }
    });
  } catch (err: any) {
    results.tests.push({
      name: 'Unrestricted Profile Creation',
      success: false,
      details: { error: err.message, stack: err.stack }
    });
  }
  
  // Test 2: Try direct insertion without RPC
  try {
    // First clean up any existing profile from Test 1
    await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', testUserId);
      
    // Now try direct insertion
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: testUserId,
        email: testEmail,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    results.tests.push({
      name: 'Direct Profile Insertion',
      success: !error,
      details: error ? { error: error.message, code: error.code } : { inserted: data }
    });
  } catch (err: any) {
    results.tests.push({
      name: 'Direct Profile Insertion',
      success: false,
      details: { error: err.message, stack: err.stack }
    });
  }
  
  // Test 3: Verify if RLS is disabled by attempting an anonymous select
  try {
    // Create an anonymous client
    const supabaseAnon = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    
    const { data, error } = await supabaseAnon
      .from('profiles')
      .select('id, email')
      .limit(1);
    
    results.tests.push({
      name: 'Anonymous Select Test (RLS Check)',
      success: !error,
      details: error ? { error: error.message, code: error.code } : { 
        data_received: !!data,
        row_count: data?.length || 0
      }
    });
  } catch (err: any) {
    results.tests.push({
      name: 'Anonymous Select Test (RLS Check)',
      success: false,
      details: { error: err.message }
    });
  }
  
  // Test 4: Check if foreign key constraint is disabled by attempting to create a profile with non-existent user
  try {
    const nonExistentUserId = crypto.randomUUID();
    
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: nonExistentUserId,
        email: `non-existent-${Date.now()}@example.com`
      })
      .select();
    
    results.tests.push({
      name: 'Foreign Key Constraint Test',
      success: !error, // Success means the constraint is disabled
      details: error ? { 
        error: error.message, 
        code: error.code,
        constraint_active: error.message.includes('violates foreign key constraint') 
      } : { 
        constraint_disabled: true,
        inserted: data 
      }
    });
  } catch (err: any) {
    results.tests.push({
      name: 'Foreign Key Constraint Test',
      success: false,
      details: { error: err.message }
    });
  }
  
  // Clean up test data
  try {
    await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', testUserId);
  } catch (e) {
    console.error('Error cleaning up test data:', e);
  }
  
  // Determine overall success
  results.summary.success = results.tests.every(test => test.success);
  
  return NextResponse.json(results);
} 
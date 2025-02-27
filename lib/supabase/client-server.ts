import { createClient } from '@supabase/supabase-js';

// This is a server client that can be safely imported in client components
// It doesn't use cookies for auth, so it's only suitable for public data
export function createSupabaseClientServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
} 
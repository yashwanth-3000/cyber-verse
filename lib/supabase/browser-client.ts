import { createBrowserClient } from "@supabase/ssr";

// We'll use a singleton pattern to ensure we only create one client instance
let supabaseBrowserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  // Ensure environment variables are defined
  if (typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    console.error("ERROR: Required Supabase environment variables are missing in browser client!");
    console.error("Please check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correctly set in Vercel.");
  }

  // Only create a new client if one doesn't exist
  if (!supabaseBrowserClient && typeof window !== 'undefined') {
    console.log("Creating new Supabase browser client");
    
    // In the browser, Next.js replaces process.env.NEXT_PUBLIC_* with actual values at build time
    supabaseBrowserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          detectSessionInUrl: true,
          autoRefreshToken: true,
        }
      }
    );
  } else if (supabaseBrowserClient) {
    console.log("Reusing existing Supabase browser client");
  }
  
  return supabaseBrowserClient || createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
} 
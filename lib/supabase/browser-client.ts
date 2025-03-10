import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  // Ensure environment variables are defined
  if (typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    console.error("ERROR: Required Supabase environment variables are missing in browser client!");
    console.error("Please check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correctly set in Vercel.");
  }

  // In the browser, Next.js replaces process.env.NEXT_PUBLIC_* with actual values at build time
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
} 
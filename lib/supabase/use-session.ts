"use client";

import { createSupabaseBrowserClient } from "./browser-client";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { AuthChangeEvent } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export function useSession() {
  const supabase = createSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error.message);
        }
        setSession(data.session);
      } catch (err) {
        console.error("Unexpected error getting session:", err);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, currentSession: Session | null) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        
        // Refresh the router on sign in or sign out
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          router.refresh();
        }
      }
    );

    return () => data.subscription.unsubscribe();
  }, [supabase.auth, router]);

  return { session, loading };
} 
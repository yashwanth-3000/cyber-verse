"use client";

import { createSupabaseBrowserClient } from "./browser-client";
import { useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { AuthChangeEvent } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export function useSession() {
  const supabase = createSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUserAuth = async () => {
      try {
        // Get authenticated user data
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error("Error getting user:", userError.message);
          return;
        }
        
        // Only after authenticating the user, get the session
        if (userData.user) {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.error("Error getting session:", sessionError.message);
          } else {
            setSession(sessionData.session);
          }
          setUser(userData.user);
        }
      } catch (err) {
        console.error("Unexpected error getting authentication:", err);
      } finally {
        setLoading(false);
      }
    };

    getUserAuth();

    const { data } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        console.log("Auth state changed:", event);
        
        // When auth state changes, verify the user with getUser()
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const { data: userData } = await supabase.auth.getUser();
          setUser(userData.user);
          setSession(currentSession);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }
        
        // Refresh the router on sign in or sign out
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          router.refresh();
        }
      }
    );

    return () => data.subscription.unsubscribe();
  }, [supabase.auth, router]);

  return { session, user, loading };
} 
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '../supabase/browser-client';
import { useRouter, usePathname } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  "/account", 
  "/dashboard", 
  "/create-challenge",
  "/resources/add"
];

// Auth routes where logged-in users shouldn't go
const AUTH_ROUTES = ["/login", "/signup"];

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    // Immediately check for stored session data to avoid flicker
    const storedUser = localStorage.getItem('cybv_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoading(false);
      } catch (e) {
        localStorage.removeItem('cybv_user');
      }
    }

    // Then fetch the actual session from Supabase
    const getSession = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError.message);
          return;
        }
        
        setSession(sessionData.session);
        
        if (sessionData.session?.user) {
          setUser(sessionData.session.user);
          // Cache user data for faster access next time
          localStorage.setItem('cybv_user', JSON.stringify(sessionData.session.user));
        } else {
          setUser(null);
          localStorage.removeItem('cybv_user');
        }
      } catch (error) {
        console.error('Unexpected error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        
        if (currentSession?.user) {
          setUser(currentSession.user);
          localStorage.setItem('cybv_user', JSON.stringify(currentSession.user));
        } else {
          setUser(null);
          localStorage.removeItem('cybv_user');
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth, router]);

  // Handle route protection
  useEffect(() => {
    if (isLoading) return; // Skip during initial load to prevent flashes

    // Check if current path requires auth
    const requiresAuth = PROTECTED_ROUTES.some(route => pathname?.startsWith(route));
    
    // Check if current path is an auth page
    const isAuthPage = AUTH_ROUTES.some(route => pathname?.startsWith(route));

    // Handle redirects based on auth state and current path
    if (requiresAuth && !user) {
      console.log('Redirecting to login from protected route:', pathname);
      const redirectUrl = `/login?next=${encodeURIComponent(pathname || '/')}`;
      router.push(redirectUrl);
    } else if (isAuthPage && user) {
      console.log('Redirecting to dashboard from auth page');
      router.push('/account');
    }
  }, [user, pathname, isLoading, router]);

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    localStorage.removeItem('cybv_user');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
} 
"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

export function GoogleLoginButton(props: { 
  nextUrl?: string; 
  className?: string;
  variant?: 'default' | 'minimal' | 'accent';
  children?: React.ReactNode;
}) {
  const supabase = createSupabaseBrowserClient();
  const searchParams = useSearchParams();
  
  const handleLogin = async () => {
    // Get the next URL from props or search params
    const nextParam = props.nextUrl || searchParams.get('next') || "";
    
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${nextParam}`,
      },
    });
  };

  // Different button styles based on variant
  if (props.variant === 'minimal') {
    return (
      <Button 
        onClick={handleLogin} 
        className={`text-xs text-[#00FF00] border border-[#00FF00]/20 px-4 py-2 rounded-full 
                  hover:bg-[#00FF00]/10 transition-all duration-300 ${props.className || ""}`}
        data-login-button
      >
        {props.children || "JOIN NOW"}
      </Button>
    );
  }

  if (props.variant === 'accent') {
    return (
      <Button 
        onClick={handleLogin} 
        className={`px-4 py-2 bg-[#00FF00] text-black rounded-md font-medium 
                  hover:bg-[#00FF00]/90 transition-all duration-300 
                  focus:outline-none focus:ring-2 focus:ring-[#00FF00]/50 
                  focus:ring-offset-2 focus:ring-offset-black flex items-center gap-2 
                  ${props.className || ""}`}
        data-login-button
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" className="fill-current">
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
        </svg>
        {props.children || "Sign in with Google"}
      </Button>
    );
  }

  // Default style
  return (
    <Button 
      onClick={handleLogin} 
      className={`relative px-4 py-2 text-sm text-gray-400 hover:text-green-400 
                transition-all duration-300 ease-out rounded-full bg-black/20 
                backdrop-blur-sm border border-gray-800 hover:border-green-900 
                flex items-center gap-2 ${props.className || ""}`}
      data-login-button
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" className="fill-current">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
      </svg>
      {props.children || "Login with Google"}
    </Button>
  );
}

export default GoogleLoginButton; 
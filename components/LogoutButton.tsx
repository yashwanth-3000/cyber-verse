"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function LogoutButton({ className }: { className?: string }) {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error.message);
        return;
      }
      
      // Force a hard refresh to clear any cached state
      window.location.href = "/";
    } catch (err) {
      console.error("Unexpected error during logout:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleLogout} 
      disabled={isLoading}
      className={`relative px-4 py-2 text-sm text-gray-400 hover:text-green-400 transition-all duration-300 ease-out rounded-full bg-black/20 backdrop-blur-sm border border-gray-800 hover:border-green-900 ${className || ""}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Logging out...
        </>
      ) : (
        "Logout"
      )}
    </Button>
  );
} 
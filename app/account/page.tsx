"use client";

import { useSession } from "@/lib/supabase/use-session";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useState } from "react";

export default function AccountPage() {
  const { session, loading } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
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
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-black overflow-hidden flex items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-[#00FF00] border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="relative min-h-screen bg-black overflow-hidden flex items-center justify-center">
        <div className="text-white text-center">
          <p className="mb-4">You need to be logged in to view this page.</p>
          <Link 
            href="/login" 
            className="px-4 py-2 bg-[#00FF00] text-black rounded-md font-medium hover:bg-[#00FF00]/90 transition-all duration-300"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  const user = session.user;
  const avatarUrl = user.user_metadata?.avatar_url;
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const email = user.email;

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background with integrated image */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-screen"
          style={{
            backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-b0m9O1QEBHRhGRcIwzfxdJ324BLxfi.png')`,
            filter: "brightness(1.2) contrast(1.1)",
          }}
          role="img"
          aria-label="Decorative green cat background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,0,0.1),transparent_70%)]" />
      </div>

      <div className="relative z-10 min-h-screen p-8">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-[#00FF00] hover:text-[#00FF00]/80 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-[#00FF00] transition-all duration-300 ease-out rounded-full bg-black/20 backdrop-blur-sm border border-gray-800 hover:border-[#00FF00]/30"
          >
            {isLoggingOut ? (
              <span className="flex items-center">
                <span className="w-4 h-4 border-2 border-t-transparent border-[#00FF00] rounded-full animate-spin mr-2"></span>
                Logging out...
              </span>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                Logout
              </>
            )}
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto bg-black/50 backdrop-blur-md rounded-lg border border-[#00FF00]/20 p-8"
        >
          <h1 className="text-3xl font-bold text-[#00FF00] mb-8">My Account</h1>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              {avatarUrl ? (
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-[#00FF00]/30">
                  <Image
                    src={avatarUrl}
                    alt="User avatar"
                    fill
                    sizes="128px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-[#00FF00]/20 flex items-center justify-center text-[#00FF00] text-4xl">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex-grow space-y-6">
              <div>
                <h2 className="text-xl text-white font-semibold">{userName}</h2>
                <p className="text-gray-400">{email}</p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg text-[#00FF00]">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-black/30 rounded-lg border border-gray-800">
                    <div className="text-sm text-gray-500">User ID</div>
                    <div className="text-white text-sm truncate">{user.id}</div>
                  </div>
                  <div className="p-4 bg-black/30 rounded-lg border border-gray-800">
                    <div className="text-sm text-gray-500">Provider</div>
                    <div className="text-white capitalize">{user.app_metadata?.provider || "Email"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
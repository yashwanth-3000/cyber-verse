"use client";

import { useSession } from "@/lib/supabase/use-session";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import UserAvatar from "./UserAvatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AuthButtons({ variant = "default" }: { variant?: "default" | "minimal" }) {
  const { session, loading } = useSession();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex space-x-4 items-center">
        <div className="w-24 h-8 bg-black/20 backdrop-blur-sm rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (session) {
    return (
      <Button 
        onClick={() => router.push('/account')}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-green-400 transition-all duration-300 ease-out rounded-full bg-black/20 backdrop-blur-sm border border-gray-800 hover:border-green-900"
      >
        <UserAvatar showName={true} />
      </Button>
    );
  }

  // For the home page, use the minimal variant
  if (variant === "minimal") {
    return (
      <GoogleLoginButton variant="minimal" />
    );
  }

  // Default variant for other pages
  return (
    <div className="flex space-x-4">
      <GoogleLoginButton />
      <Button 
        asChild
        className="relative px-4 py-2 text-sm text-gray-400 hover:text-green-400 transition-all duration-300 ease-out rounded-full bg-black/20 backdrop-blur-sm border border-gray-800 hover:border-green-900"
      >
        <Link href="/signup">Sign Up</Link>
      </Button>
    </div>
  );
} 
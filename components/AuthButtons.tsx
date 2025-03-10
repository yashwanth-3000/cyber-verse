"use client";

import { UserSession } from "@/components/UserSession";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/providers/auth-provider";

export default function AuthButtons({ variant = "default" }: { variant?: "default" | "minimal" }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex space-x-4 items-center">
        <div className="w-24 h-8 bg-black/20 backdrop-blur-sm rounded-full animate-pulse"></div>
      </div>
    );
  }

  // Always use the UserSession component which handles login/logout states internally
  if (variant === "minimal") {
    return <UserSession />;
  }

  // Default variant for other pages
  return (
    <div className="flex space-x-4 items-center">
      <UserSession />
      <Button 
        asChild
        className="relative px-4 py-2 text-sm text-gray-400 hover:text-green-400 transition-all duration-300 ease-out rounded-full bg-black/20 backdrop-blur-sm border border-gray-800 hover:border-green-900"
      >
        <Link href="/signup">Sign Up</Link>
      </Button>
    </div>
  );
} 
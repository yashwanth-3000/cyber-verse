"use client";

import { useSession } from "@/lib/supabase/use-session";
import Image from "next/image";

export default function UserAvatar({ showName = false }: { showName?: boolean }) {
  const { session } = useSession();
  
  if (!session?.user) return null;
  
  const avatarUrl = session.user.user_metadata?.avatar_url;
  const userName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';
  
  const avatar = avatarUrl ? (
    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-green-900">
      <Image
        src={avatarUrl}
        alt="User avatar"
        fill
        sizes="32px"
        className="object-cover"
        unoptimized
      />
    </div>
  ) : (
    <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center text-green-400">
      {session.user.email?.charAt(0).toUpperCase() || "U"}
    </div>
  );

  if (!showName) return avatar;
  
  return (
    <div className="flex items-center gap-2">
      {avatar}
      <span className="text-sm text-green-400 font-light">{userName}</span>
    </div>
  );
} 
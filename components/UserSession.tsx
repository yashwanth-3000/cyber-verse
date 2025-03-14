'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/providers/auth-provider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Settings, Book } from 'lucide-react';
import { GoogleLoginButton } from './GoogleLoginButton';

export function UserSession() {
  const { user, isLoading, signOut } = useAuth();
  const [fullName, setFullName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  
  // Load user data immediately from localStorage if available
  useEffect(() => {
    // Try to get from local storage first for immediate display
    const cachedUserData = localStorage.getItem('cybv_user_profile');
    if (cachedUserData) {
      try {
        const data = JSON.parse(cachedUserData);
        setFullName(data.fullName || '');
        setAvatarUrl(data.avatarUrl || '');
      } catch (e) {
        // Invalid data, remove it
        localStorage.removeItem('cybv_user_profile');
      }
    }
    
    // If we have a user, extract metadata
    if (user) {
      const name = user.user_metadata?.full_name || user.user_metadata?.name || '';
      const avatar = user.user_metadata?.avatar_url || '';
      
      setFullName(name);
      setAvatarUrl(avatar);
      
      // Cache this data for faster loading next time
      localStorage.setItem('cybv_user_profile', JSON.stringify({
        fullName: name,
        avatarUrl: avatar
      }));
    }
  }, [user]);
  
  // Display a login button if there's no user
  if (!user && !isLoading) {
    return <GoogleLoginButton variant="minimal" />;
  }
  
  // If loading, show a minimal placeholder to avoid layout shifts
  if (isLoading) {
    return (
      <div className="h-8 w-24 bg-black/20 rounded-full animate-pulse"></div>
    );
  }
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!fullName) return 'U';
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // User is logged in, show the dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 rounded-full px-2 text-sm font-normal text-[#00FF00] border border-dashed border-[#00FF00]/20 hover:bg-[#00FF00]/10 transition-all duration-300 hover:border-[#00FF00]/60 hover:shadow-[0_0_8px_rgba(0,255,0,0.3)]"
        >
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-[#00FF00]/10 text-[#00FF00] text-xs">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[200px] truncate hover:max-w-full transition-all duration-500">{fullName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-black/90 backdrop-blur-md border border-[#00FF00]/20">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-[#00FF00] font-medium text-sm">{fullName}</p>
            <p className="text-gray-400 text-xs truncate">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#00FF00]/10" />
        <DropdownMenuItem
          className="text-gray-200 focus:text-[#00FF00] focus:bg-[#00FF00]/10 cursor-pointer"
          asChild
        >
          <Link href="/account">
            <User className="mr-2 h-4 w-4" />
            <span>Account</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-gray-200 focus:text-[#00FF00] focus:bg-[#00FF00]/10 cursor-pointer"
          asChild
        >
          <Link href="/dashboard">
            <Settings className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-gray-200 focus:text-[#00FF00] focus:bg-[#00FF00]/10 cursor-pointer"
          asChild
        >
          <Link href="/resources/my">
            <Book className="mr-2 h-4 w-4" />
            <span>My Resources</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#00FF00]/10" />
        <DropdownMenuItem
          className="text-gray-200 focus:text-[#00FF00] focus:bg-[#00FF00]/10 cursor-pointer"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
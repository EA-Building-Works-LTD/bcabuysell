'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  User,
  LogOut,
  Settings,
  ChevronDown,
  Users,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

export default function UserNav() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      // No need to redirect here, the AuthContext will handle this
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
        <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <Button variant="outline" onClick={() => router.push('/auth/signin')}>
        Sign In
      </Button>
    );
  }

  const isAdmin = userData?.role === 'admin';
  const displayName = user.displayName || userData?.displayName || user.email?.split('@')[0] || 'User';
  const initials = displayName
    ? displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative flex items-center gap-2 px-2 h-10">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL || userData?.photoURL || ''} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">
              {displayName.split(' ')[0]}
            </span>
            {isAdmin && (
              <span className="text-xs text-muted-foreground">
                Admin
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer flex items-center gap-2 w-full">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile?tab=settings" className="cursor-pointer flex items-center gap-2 w-full">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Administration</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/admin/users" className="cursor-pointer flex items-center gap-2 w-full">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Link>
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="cursor-pointer text-red-500 focus:text-red-500"
        >
          {isSigningOut ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div>
              Signing out...
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
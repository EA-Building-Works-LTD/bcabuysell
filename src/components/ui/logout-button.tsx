'use client';

import { Button } from './button';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function LogoutButton({ 
  variant = 'ghost', 
  size = 'default',
  className = ''
}: LogoutButtonProps) {
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      variant={variant} 
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
      ) : (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="mr-2"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      )}
      Logout
    </Button>
  );
} 
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const { userData } = useAuth();
  
  // Check if user is admin
  const isAdmin = userData?.role === 'admin';
  
  // Only render children if user is admin
  if (isAdmin) {
    return <>{children}</>;
  }
  
  // Render fallback or nothing
  return <>{fallback}</>;
} 
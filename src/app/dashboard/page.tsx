'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function Dashboard() {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/firebase-auth/signin');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      router.push('/firebase-auth/signin');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button 
          variant="outline" 
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? 'Signing out...' : 'Sign Out'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="rounded-full h-16 w-16"
              />
            )}
            <div>
              <h2 className="text-xl font-bold">{user.displayName}</h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="mt-1">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  {userData?.role || 'User'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Welcome to BCA Buy Sell</h2>
          <p className="text-gray-600 mb-4">
            You're now authenticated with Firebase! This dashboard will show your car listings and transactions.
          </p>
          <div className="flex space-x-3 mt-4">
            <Link href="/cars/new">
              <Button>Add New Car</Button>
            </Link>
            <Link href="/cars">
              <Button variant="outline">View Cars</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
} 
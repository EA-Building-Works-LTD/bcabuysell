'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
      </div>
      
      <div className="max-w-md mx-auto">
        <Card className="p-6">
          <SimpleProfileInfo />
        </Card>
      </div>
    </div>
  );
}

function SimpleProfileInfo() {
  const { user, userData, loading } = useAuth();
  
  if (loading) {
    return <div className="text-center py-4">Loading profile information...</div>;
  }
  
  if (!user) {
    return <div className="text-center py-4">Please sign in to view your profile.</div>;
  }
  
  // Get initials from email or display name
  const getInitials = () => {
    if (user.displayName) {
      return user.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
    }
    
    // If no display name, use first two letters of email
    return user.email ? user.email.substring(0, 2).toUpperCase() : '??';
  };
  
  // Format the timestamp for "Member Since" display
  const formatMemberSince = () => {
    if (userData?.createdAt) {
      const date = new Date(userData.createdAt);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    return 'Unknown';
  };
  
  return (
    <div className="flex flex-col items-center text-center">
      <Avatar className="h-24 w-24 mb-4">
        <AvatarFallback className="text-xl bg-primary-100 text-primary-700">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      
      <div className="space-y-4 w-full">
        <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</h3>
          <p className="font-medium">{user.email}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Member Since</h3>
          <p className="font-medium">{formatMemberSince()}</p>
        </div>
      </div>
    </div>
  );
} 
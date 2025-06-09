'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Redirect if user is not logged in
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }

    // Redirect if user is not admin
    if (!authLoading && user && userData?.role !== 'admin') {
      router.push('/');
      toast.error('Admin access required');
      return;
    }

    if (!authLoading && user) {
      fetchUsers();
    }
  }, [authLoading, user, userData, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserRole = async (user: User) => {
    try {
      setIsProcessing(true);
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          role: newRole,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user role');
      }
      
      // Update the local state
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, role: newRole } : u
      ));
      
      toast.success(`User ${user.name} is now ${newRole}`);
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error(error.message || 'Failed to update user role');
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setIsProcessing(true);
      
      const response = await fetch(`/api/admin/users?userId=${userToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }
      
      // Update the local state
      setUsers(users.filter(u => u.id !== userToDelete.id));
      
      toast.success(`User ${userToDelete.name} has been deleted`);
      setUserToDelete(null);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary-700">User Management</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage registered users and their roles
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Users ({users.length})</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Maximum allowed: 5 users</p>
        </div>
        
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || ''} alt={user.name} />
                        <AvatarFallback>
                          {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {user.name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleUserRole(user)}
                        disabled={
                          isProcessing || 
                          (user.id === userData?.uid && user.role === 'admin')
                        }
                      >
                        {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={isProcessing || user.id === userData?.uid}
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {user.name}? This action cannot be undone.
                              All cars associated with this user will be deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => {
                                setUserToDelete(user);
                                deleteUser();
                              }}
                              disabled={isProcessing}
                            >
                              {isProcessing ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
} 
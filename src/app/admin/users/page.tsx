'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { fetchJson } from '@/lib/fetch-utils';

interface User {
  _id: string;
  uid: string;
  email: string;
  displayName: string;
  role: string;
  createdAt?: string;
}

export default function AdminUsersPage() {
  const { userData } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (userData?.role !== 'admin') {
      setError('You do not have permission to access this page.');
      setLoading(false);
      return;
    }

    // Fetch users
    async function fetchUsers() {
      try {
        setLoading(true);
        const data = await fetchJson('/api/admin/users');
        setUsers(data.users);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [userData]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map(user => (
          <Card key={user._id} className="p-4">
            <h2 className="text-lg font-semibold">{user.displayName}</h2>
            <p className="text-gray-600">{user.email}</p>
            <div className="flex items-center mt-2">
              <span className={`px-2 py-1 text-xs rounded ${
                user.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user.role}
              </span>
            </div>
          </Card>
        ))}

        {users.length === 0 && (
          <p className="col-span-full text-center py-8 text-gray-500">
            No users found.
          </p>
        )}
      </div>
    </div>
  );
} 
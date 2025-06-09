'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function AuthTestPage() {
  const { user, userData, loading, error, signInWithGoogle } = useAuth();
  const [apiTest, setApiTest] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const testAPI = async () => {
    try {
      setApiError(null);
      const response = await fetch('/api/auth/debug-token');
      const data = await response.json();
      setApiTest(data);
    } catch (error) {
      console.error('API test error:', error);
      setApiError((error as Error).message);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
        <h2 className="text-lg font-semibold mb-2">Auth Status</h2>
        {loading ? (
          <p>Loading...</p>
        ) : user ? (
          <div>
            <p className="text-green-600 font-medium">✓ Authenticated</p>
            <p>User ID: {user.uid}</p>
            <p>Email: {user.email}</p>
            {userData && (
              <>
                <p>Role: {userData.role}</p>
              </>
            )}
            {error && <p className="text-red-500">{error}</p>}
          </div>
        ) : (
          <div>
            <p className="text-red-600 font-medium">✗ Not authenticated</p>
            {error && <p className="text-red-500">{error}</p>}
            <button 
              onClick={signInWithGoogle}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Sign in with Google
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
        <h2 className="text-lg font-semibold mb-2">API Test</h2>
        <button 
          onClick={testAPI}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Test API
        </button>
        
        {apiTest && (
          <div className="mt-4">
            <h3 className="font-medium">Response:</h3>
            <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded mt-2 text-xs overflow-auto">
              {JSON.stringify(apiTest, null, 2)}
            </pre>
          </div>
        )}
        
        {apiError && (
          <div className="mt-4 text-red-500">
            <p>Error: {apiError}</p>
          </div>
        )}
      </div>
      
      <div className="text-center mt-4">
        <Link href="/" className="text-blue-500 underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
} 
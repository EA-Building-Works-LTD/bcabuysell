'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFirebaseToken } from '@/lib/utils';

export default function FirebaseDebugPage() {
  const { user, userData, loading, error, signInWithGoogle } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [debugResponse, setDebugResponse] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Get token from cookies/localStorage when component mounts
    const storedToken = getFirebaseToken();
    setToken(storedToken);
  }, []);

  const checkToken = async () => {
    if (!token) {
      alert('No token found. Please sign in first.');
      return;
    }

    setIsChecking(true);
    try {
      // Call our debug API to check the token
      const response = await fetch('/api/auth/debug-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setDebugResponse(data);
    } catch (error) {
      console.error('Error checking token:', error);
      setDebugResponse({ error: 'Failed to check token: ' + (error as Error).message });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Firebase Authentication Debug</h1>
      
      {/* Authentication Status */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
        <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
        {loading ? (
          <p>Loading authentication state...</p>
        ) : (
          <div>
            <p><strong>Signed in:</strong> {user ? 'Yes' : 'No'}</p>
            {user && (
              <>
                <p><strong>User ID:</strong> {user.uid}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Name:</strong> {user.displayName || 'Not available'}</p>
              </>
            )}
            {userData && (
              <>
                <p><strong>Database ID:</strong> {userData._id}</p>
                <p><strong>Role:</strong> {userData.role}</p>
              </>
            )}
            {error && (
              <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
                <p><strong>Error:</strong> {error}</p>
              </div>
            )}
          </div>
        )}
        
        {!user && (
          <button 
            onClick={signInWithGoogle}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Sign in with Google
          </button>
        )}
      </div>

      {/* Token Information */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
        <h2 className="text-xl font-semibold mb-2">Firebase Token</h2>
        {token ? (
          <div>
            <p className="mb-2"><strong>Token exists:</strong> Yes</p>
            <div className="overflow-auto max-h-20 mb-2 p-2 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              {token.length > 100 ? token.substring(0, 100) + '...' : token}
            </div>
            <button 
              onClick={checkToken}
              disabled={isChecking}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isChecking ? 'Checking...' : 'Verify Token'}
            </button>
          </div>
        ) : (
          <p>No token found in cookies or localStorage</p>
        )}
      </div>

      {/* Debug Response */}
      {debugResponse && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Token Verification Result</h2>
          <pre className="overflow-auto max-h-80 p-2 bg-gray-200 dark:bg-gray-700 rounded text-xs">
            {JSON.stringify(debugResponse, null, 2)}
          </pre>
        </div>
      )}

      {/* API Testing */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mt-4">
        <h2 className="text-xl font-semibold mb-2">API Connection Test</h2>
        <button 
          onClick={async () => {
            try {
              const response = await fetch('/api/cars?status=purchased');
              const data = await response.json();
              setDebugResponse({
                apiTest: {
                  status: response.status,
                  statusText: response.statusText,
                  data: data
                }
              });
            } catch (error) {
              setDebugResponse({
                apiTest: {
                  error: (error as Error).message
                }
              });
            }
          }}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Cars API
        </button>
      </div>
    </div>
  );
} 
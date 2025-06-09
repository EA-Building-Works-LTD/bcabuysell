'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFirebaseToken, clearFirebaseToken } from '@/lib/utils';
import { clearAuthToken } from '@/lib/fetch-utils';
import Link from 'next/link';

export default function FirebaseDebugPage() {
  const { user, userData, loading, error, signInWithGoogle, getAuthToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [debugResponse, setDebugResponse] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [networkLog, setNetworkLog] = useState<string[]>([]);
  const [showTroubleshootingGuide, setShowTroubleshootingGuide] = useState(false);

  useEffect(() => {
    // Get token from cookies/localStorage when component mounts
    const storedToken = getFirebaseToken();
    setToken(storedToken);
    
    // Log some basic info for debugging
    addToLog('Page loaded, checking auth state...');
    addToLog(`Online status: ${navigator.onLine ? 'Online' : 'Offline'}`);
    
    // Check Firebase and Firestore connectivity
    checkFirebaseConnectivity();
  }, []);
  
  const addToLog = (message: string) => {
    setNetworkLog(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
    console.log(message);
  };
  
  const checkFirebaseConnectivity = async () => {
    addToLog('Testing Firebase connectivity...');
    
    // Test fetch to Firebase Auth
    try {
      const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=dummy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnSecureToken: false }),
      });
      
      addToLog(`Firebase Auth connectivity: ${response.status === 400 ? 'OK (expected 400)' : 'Unexpected ' + response.status}`);
    } catch (error) {
      addToLog(`Firebase Auth connectivity error: ${(error as Error).message}`);
    }
    
    // Test Firestore connectivity (just a CORS preflight check)
    try {
      const response = await fetch('https://firestore.googleapis.com/', {
        method: 'OPTIONS',
      });
      addToLog(`Firestore connectivity: ${response.status}`);
    } catch (error) {
      addToLog(`Firestore connectivity error: ${(error as Error).message}`);
    }
  };

  const checkToken = async () => {
    if (!token) {
      alert('No token found. Please sign in first.');
      return;
    }

    setIsChecking(true);
    addToLog('Checking token validity...');
    
    try {
      // Call our debug API to check the token
      const response = await fetch('/api/auth/debug-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setDebugResponse(data);
      addToLog(`Token check response: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.error('Error checking token:', error);
      addToLog(`Token check error: ${(error as Error).message}`);
      setDebugResponse({ error: 'Failed to check token: ' + (error as Error).message });
    } finally {
      setIsChecking(false);
    }
  };
  
  const forceTokenRefresh = async () => {
    addToLog('Forcing token refresh...');
    setIsChecking(true);
    
    try {
      // Force a new token refresh using the auth context
      const newToken = await getAuthToken();
      
      if (newToken) {
        setToken(newToken);
        addToLog('Token refreshed successfully!');
        addToLog(`New token: ${newToken.substring(0, 10)}...`);
      } else {
        addToLog('Failed to refresh token - no token returned');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      addToLog(`Token refresh error: ${(error as Error).message}`);
    } finally {
      setIsChecking(false);
    }
  };
  
  const clearToken = () => {
    addToLog('Clearing auth token...');
    clearFirebaseToken();
    clearAuthToken();
    setToken(null);
    addToLog('Auth token cleared from storage');
  };
  
  const testServerDiagnostics = async () => {
    addToLog('Testing server diagnostics...');
    setIsChecking(true);
    
    try {
      const response = await fetch('/api/diagnose');
      const data = await response.json();
      setDebugResponse(data);
      addToLog(`Server diagnostics: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.error('Error getting server diagnostics:', error);
      addToLog(`Server diagnostics error: ${(error as Error).message}`);
      setDebugResponse({ error: 'Failed to get server diagnostics: ' + (error as Error).message });
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
              {token}
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={checkToken}
                disabled={isChecking}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {isChecking ? 'Checking...' : 'Verify Token'}
              </button>
              <button 
                onClick={forceTokenRefresh}
                disabled={isChecking || !user}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Force Token Refresh
              </button>
              <button 
                onClick={clearToken}
                disabled={isChecking || !token}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                Clear Token
              </button>
            </div>
          </div>
        ) : (
          <p>No token found in cookies or localStorage</p>
        )}
      </div>

      {/* Debug Response */}
      {debugResponse && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
          <h2 className="text-xl font-semibold mb-2">Token Verification Result</h2>
          <pre className="overflow-auto max-h-80 p-2 bg-gray-200 dark:bg-gray-700 rounded text-xs">
            {JSON.stringify(debugResponse, null, 2)}
          </pre>
        </div>
      )}

      {/* Network Logs */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
        <h2 className="text-xl font-semibold mb-2">Debug Log</h2>
        <pre className="overflow-auto max-h-80 p-2 bg-gray-200 dark:bg-gray-700 rounded text-xs">
          {networkLog.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </pre>
        <button 
          onClick={checkFirebaseConnectivity}
          className="mt-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Firebase Connectivity
        </button>
      </div>

      {/* API Testing */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">API Connection Test</h2>
        <button 
          onClick={async () => {
            addToLog('Testing API connection...');
            setIsChecking(true);
            try {
              // First try to refresh the token
              if (user) {
                await getAuthToken();
                addToLog('Token refreshed for API test');
              }
              
              const response = await fetch('/api/cars?status=purchased');
              const data = await response.json();
              
              addToLog(`API response: ${response.status} ${response.statusText}`);
              
              setDebugResponse({
                apiTest: {
                  status: response.status,
                  statusText: response.statusText,
                  data: data
                }
              });
            } catch (error) {
              addToLog(`API test error: ${(error as Error).message}`);
              setDebugResponse({
                apiTest: {
                  error: (error as Error).message
                }
              });
            } finally {
              setIsChecking(false);
            }
          }}
          disabled={isChecking}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {isChecking ? 'Testing...' : 'Test Cars API'}
        </button>
      </div>
    </div>
  );
} 
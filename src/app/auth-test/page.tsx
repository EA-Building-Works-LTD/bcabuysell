'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchJson } from '@/lib/fetch-utils';

export default function AuthTestPage() {
  const { user, loading, error, signInWithGoogle, signOut } = useAuth();
  const [apiResult, setApiResult] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to test API authentication
  const testApiAuth = async () => {
    setIsLoading(true);
    setTestError(null);
    
    try {
      // Call our debug endpoint
      const result = await fetchJson('/api/auth/debug');
      setApiResult(result);
    } catch (err: any) {
      console.error('API test error:', err);
      setTestError(err.message || 'Failed to test API authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Authentication Status */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          
          {loading ? (
            <p>Loading authentication...</p>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              <p className="font-medium">Error: {error}</p>
            </div>
          ) : user ? (
            <div className="space-y-3">
              <div className="p-4 bg-green-50 text-green-700 rounded-md">
                <p className="font-medium">Authenticated ✓</p>
              </div>
              
              <div className="space-y-2">
                <p><span className="font-medium">User ID:</span> {user.uid}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Name:</span> {user.displayName || 'Not set'}</p>
              </div>
              
              <Button onClick={signOut} variant="outline">Sign Out</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 text-amber-700 rounded-md">
                <p className="font-medium">Not authenticated</p>
              </div>
              
              <Button onClick={signInWithGoogle}>Sign In with Google</Button>
            </div>
          )}
        </Card>
        
        {/* API Authentication Test */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">API Authentication Test</h2>
          
          <div className="space-y-4">
            <Button 
              onClick={testApiAuth} 
              disabled={isLoading || !user}
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Test API Authentication'}
            </Button>
            
            {testError && (
              <div className="p-4 bg-red-50 text-red-700 rounded-md">
                <p className="font-medium">Error: {testError}</p>
              </div>
            )}
            
            {apiResult && (
              <div className="space-y-3">
                <div className={`p-4 rounded-md ${apiResult.authenticated ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <p className="font-medium">
                    API Authentication: {apiResult.authenticated ? 'Successful ✓' : 'Failed ✗'}
                  </p>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-gray-100 p-3 font-medium">Response Details:</div>
                  <pre className="p-3 text-sm overflow-auto max-h-60">
                    {JSON.stringify(apiResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 
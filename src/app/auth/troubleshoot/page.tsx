'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';

export default function TroubleshootAuth() {
  const [googleApiStatus, setGoogleApiStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check OAuth configuration
    fetch('/api/auth/test-oauth')
      .then(res => res.json())
      .then(data => {
        setGoogleApiStatus(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching OAuth status:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Google OAuth Troubleshooting Guide</h1>
      
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Common Issues</h2>
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
            <h3 className="font-medium text-amber-800 mb-2">OAuthCallback Error</h3>
            <p className="text-amber-700 mb-3">
              This error occurs when Google rejects the authentication callback. The most common reasons are:
            </p>
            <ul className="list-disc list-inside space-y-2 text-amber-700">
              <li>Missing or incorrectly configured redirect URI in Google Cloud Console</li>
              <li>Required Google APIs not enabled (Google+ API, People API)</li>
              <li>Invalid client configuration (client ID or secret)</li>
              <li>Google account restrictions or consent screen configuration issues</li>
            </ul>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Required Configuration in Google Cloud Console</h2>
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="font-medium mb-2">1. Enable Required APIs</h3>
            <p className="mb-2">Make sure the following APIs are enabled in your Google Cloud Console project:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Google+ API</li>
              <li>People API</li>
              <li>Google Identity Toolkit API</li>
            </ul>
            <div className="mt-2 text-sm text-gray-600">
              Go to: <span className="font-mono bg-gray-100 px-2 py-1 rounded">APIs & Services → Library</span> and search for these APIs
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">2. Configure OAuth Consent Screen</h3>
            <p className="mb-2">Ensure your OAuth consent screen is properly configured:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>App name, user support email, and developer contact information</li>
              <li>Authorized domains including localhost (for development)</li>
              <li>Required scopes: <code>.../auth/userinfo.email</code>, <code>.../auth/userinfo.profile</code></li>
            </ul>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">3. Verify Credentials & Redirect URIs</h3>
            <p className="mb-2">Check your OAuth 2.0 Client ID configuration:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Client ID and Client Secret match your .env.local file</li>
              <li>
                Authorized JavaScript origins includes: 
                <code className="mx-2 bg-gray-100 px-2 py-1 rounded">http://localhost:3000</code>
              </li>
              <li>
                Authorized redirect URIs includes: 
                <code className="mx-2 bg-gray-100 px-2 py-1 rounded">http://localhost:3000/api/auth/callback/google</code>
              </li>
            </ul>
          </div>
        </div>
      </Card>
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
        </div>
      ) : googleApiStatus ? (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">OAuth Configuration Status</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-md overflow-auto">
              <h3 className="font-medium mb-2">Expected Redirect URI</h3>
              <code className="block p-2 bg-white border border-gray-200 rounded text-sm whitespace-nowrap overflow-x-auto">
                {googleApiStatus?.oauthStatus?.expectedCallbackUrl || 'Not available'}
              </code>
              <p className="mt-2 text-sm text-gray-600">
                This exact URI must be added to the Authorized redirect URIs in your Google Cloud Console project.
              </p>
            </div>
            
            {googleApiStatus?.oauthStatus?.recommendations?.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="font-medium text-blue-800 mb-2">Recommendations</h3>
                <ul className="list-disc list-inside space-y-2 text-blue-700">
                  {googleApiStatus.oauthStatus.recommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-6 mb-8">
          <div className="text-center text-gray-500">
            Could not load OAuth configuration status. Please check your server logs.
          </div>
        </Card>
      )}
      
      <div className="flex justify-center space-x-4 mt-8">
        <Link href="/auth/signin">
          <Button>Try Sign In Again</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
} 
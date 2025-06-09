'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';

export default function FixGuidePage() {
  const [credentialStatus, setCredentialStatus] = useState<any>(null);
  const [apiConfigStatus, setApiConfigStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load both verification endpoints
    Promise.all([
      fetch('/api/auth/verify-credentials').then(res => res.json()),
      fetch('/api/auth/check-api-config').then(res => res.json())
    ])
    .then(([credData, apiData]) => {
      setCredentialStatus(credData);
      setApiConfigStatus(apiData);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error fetching status:', err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Fix Google OAuth "invalid_client" Error</h1>
      
      <Card className="p-6 mb-8 border-red-300 bg-red-50">
        <h2 className="text-xl font-semibold mb-4 text-red-800">Error: invalid_client (Unauthorized)</h2>
        <p className="mb-4">
          This error means Google does not recognize the OAuth client credentials you're using.
          The specific error in your logs is:
        </p>
        <div className="bg-white p-3 rounded border border-red-200 font-mono text-sm mb-4 overflow-x-auto">
          Auth error [OAUTH_CALLBACK_ERROR]: &#123;<br />
          &nbsp;&nbsp;error: [Error [OAuthCallbackError]: invalid_client (Unauthorized)]<br />
          &nbsp;&nbsp;providerId: 'google'<br />
          &#125;
        </div>
      </Card>
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
        </div>
      ) : (
        <>
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Credential Status</h2>
            <div className={`p-4 rounded-md ${credentialStatus?.status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <p className="font-medium">{credentialStatus?.message}</p>
              {credentialStatus?.error && (
                <p className="mt-2 font-mono text-sm">{credentialStatus.error}</p>
              )}
            </div>
          </Card>
          
          {apiConfigStatus && (
            <Card className="p-6 mb-8 border-amber-200">
              <h2 className="text-xl font-semibold mb-4">API Configuration Check</h2>
              <div className="p-4 bg-amber-50 rounded-md text-amber-800 mb-4">
                <p className="font-medium">{apiConfigStatus.message}</p>
                <p className="mt-2">{apiConfigStatus.advice}</p>
              </div>
              
              <div className="space-y-4 mt-6">
                <h3 className="font-medium">Required API Checks:</h3>
                {apiConfigStatus.checks?.map((check: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 p-3 border border-gray-200 rounded-md">
                    <div className="w-full">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{check.name}</h4>
                        <a 
                          href={check.fixUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded transition-colors"
                        >
                          Fix
                        </a>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{check.description}</p>
                    </div>
                  </div>
                ))}
                
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h3 className="font-medium text-blue-800 mb-2">Next Steps:</h3>
                  <ul className="list-disc list-inside space-y-2 text-blue-700">
                    {apiConfigStatus.nextSteps?.map((step: string, i: number) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
      
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Step-by-Step Fix Guide</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-lg mb-2 text-red-800">Most Common Solution: Enable the People API</h3>
            <div className="ml-5 space-y-2">
              <p className="font-medium">This is the most likely solution based on your error:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Go to <a href="https://console.cloud.google.com/apis/library/people.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google People API</a> in Google Cloud Console</li>
                <li>Click "Enable" to activate this API for your project</li>
                <li>Restart your development server</li>
                <li>Try signing in again</li>
              </ol>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2">1. Check and Reset Google Cloud Credentials</h3>
            <div className="ml-5 space-y-2">
              <p>a. Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console Credentials page</a></p>
              <p>b. Find the OAuth 2.0 Client ID you're using for this application</p>
              <p>c. Click the pencil icon to edit the client</p>
              <p>d. Verify these settings:</p>
              <ul className="list-disc list-inside ml-5">
                <li>Application type: Web application</li>
                <li>Name: Your app name</li>
                <li>Authorized JavaScript origins includes: <code className="bg-gray-100 px-1 py-0.5 rounded">http://localhost:3000</code></li>
                <li>Authorized redirect URIs includes: <code className="bg-gray-100 px-1 py-0.5 rounded">http://localhost:3000/api/auth/callback/google</code></li>
              </ul>
              <p>e. <strong>Click Save</strong></p>
              <p>f. Click the refresh icon ↻ next to "Client secret"</p>
              <p>g. <strong>Confirm to create a new client secret</strong></p>
              <p>h. Copy the new Client ID and Client Secret</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2">2. Update Your Environment Variables</h3>
            <div className="ml-5 space-y-2">
              <p>Update your <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> file with the new credentials:</p>
              <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                GOOGLE_CLIENT_ID=your-new-client-id.apps.googleusercontent.com<br />
                GOOGLE_CLIENT_SECRET=your-new-client-secret
              </div>
              <p className="mt-2"><strong>Important:</strong> Make sure there are no extra spaces or quotes around the values.</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2">3. Verify OAuth Consent Screen</h3>
            <div className="ml-5 space-y-2">
              <p>a. Go to <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OAuth Consent Screen</a> in Google Cloud Console</p>
              <p>b. Ensure your app has the following:</p>
              <ul className="list-disc list-inside ml-5">
                <li>A valid app name</li>
                <li>User support email</li>
                <li>Developer contact information</li>
                <li>Authorized domains (including localhost for testing)</li>
                <li>Required scopes: .../auth/userinfo.email, .../auth/userinfo.profile</li>
              </ul>
              <p>c. Click "Save and Continue" through all steps</p>
              <p>d. If in "Testing" mode, make sure your Google account is added as a test user</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2">4. Enable Required APIs</h3>
            <div className="ml-5 space-y-2">
              <p>Make sure these APIs are enabled in your Google Cloud project:</p>
              <ul className="list-disc list-inside ml-5">
                <li><a href="https://console.cloud.google.com/apis/library/people.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google People API</a> (Critical)</li>
                <li><a href="https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Identity Toolkit API</a></li>
              </ul>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2">5. Restart Your Development Server</h3>
            <div className="ml-5">
              <p>After making these changes, restart your Next.js development server:</p>
              <div className="bg-gray-100 p-3 rounded font-mono text-sm mt-2">
                npm run dev
              </div>
            </div>
          </div>
        </div>
      </Card>
      
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
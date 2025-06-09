'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function AuthError() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [errorCode, setErrorCode] = useState<string>('');
  const [rawParams, setRawParams] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Get all URL parameters for debugging
    const allParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      allParams[key] = value;
    });
    console.log("Auth error URL parameters:", allParams);
    setRawParams(allParams);
    
    const error = searchParams.get('error');
    setErrorCode(error || 'unknown');
    
    // Map error codes to user-friendly messages
    if (error === 'AccessDenied') {
      setErrorMessage('Access denied. You may not have permission to sign in.');
    } else if (error === 'Configuration') {
      setErrorMessage('There is a problem with the server configuration. Please contact support.');
      setErrorDetails('This typically means the NextAuth.js configuration is incorrect or environment variables are missing.');
    } else if (error === 'Verification') {
      setErrorMessage('The verification link may have expired or been used already.');
    } else if (error?.includes('Maximum number of users')) {
      setErrorMessage('Maximum number of users reached. Contact administrator for access.');
    } else if (error === 'OAuthSignin') {
      setErrorMessage('Error starting the OAuth sign-in process.');
      setErrorDetails('This typically happens when Google credentials are missing or incorrect in the environment variables (.env.local file).');
    } else if (error === 'OAuthCallback') {
      setErrorMessage('Error during the OAuth callback.');
      setErrorDetails('The Google authentication request was rejected with "invalid_client" error. This happens when your client credentials are not recognized by Google.');
    } else if (error === 'OAuthCreateAccount') {
      setErrorMessage('Error creating a user account during OAuth sign-in.');
      setErrorDetails('This could be related to database connection issues or validation problems.');
    } else if (error === 'EmailCreateAccount') {
      setErrorMessage('Error creating a user account using email.');
    } else if (error === 'Callback') {
      setErrorMessage('Error in the OAuth callback.');
      setErrorDetails('There might be an issue with your OAuth provider (Google) configuration.');
    } else if (error === 'UnknownError') {
      setErrorMessage('An unknown error occurred.');
    } else {
      setErrorMessage('An error occurred during the authentication process. Please try again.');
    }
  }, [searchParams]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-red-600 dark:text-red-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Authentication Error</h1>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Error code: {errorCode}
          </div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-6">
          <p className="font-medium">{errorMessage}</p>
          {errorDetails && (
            <p className="text-sm mt-2 text-red-500 dark:text-red-300">{errorDetails}</p>
          )}
        </div>
        
        <div className="space-y-4">
          <Link href="/auth/signin">
            <Button className="w-full">Try Again</Button>
          </Link>
          
          {errorCode === 'OAuthCallback' && (
            <Link href="/auth/setup">
              <Button variant="destructive" className="w-full">
                Fix Invalid Credentials
              </Button>
            </Link>
          )}
          
          {errorCode === 'OAuthCallback' && (
            <Link href="/auth/fix-guide">
              <Button variant="secondary" className="w-full">
                View Troubleshooting Guide
              </Button>
            </Link>
          )}
          
          <Link href="/auth/troubleshoot">
            <Button variant="outline" className="w-full">
              General Troubleshooting
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="ghost" className="w-full">
              Back to Home
            </Button>
          </Link>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            <p className="mb-2">Debugging steps:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Check your .env.local file for correct Google credentials</li>
              <li>Verify Google API is enabled in Google Cloud Console</li>
              <li>Ensure redirect URI is properly configured</li>
              <li>Check server logs for detailed error information</li>
              <li>Visit <Link href="/api/debug" className="text-blue-500 hover:underline" target="_blank">debug page</Link> to verify environment variables</li>
              <li>Visit <Link href="/api/auth/test-oauth" className="text-blue-500 hover:underline" target="_blank">OAuth test page</Link> for detailed diagnostics</li>
              <li>Make sure Google People API is enabled in your Google Cloud Console</li>
            </ol>
          </div>
          
          {/* Raw error parameters for debugging */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Raw Error Parameters:</p>
            <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md text-xs overflow-auto max-h-32">
              {JSON.stringify(rawParams, null, 2)}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
} 
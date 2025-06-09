'use client';

import { useEffect, useState } from 'react';
import { auth, db, googleProvider } from '@/lib/firebase';
import Link from 'next/link';

export default function FirebaseDebugPage() {
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({});
  const [firebaseStatus, setFirebaseStatus] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check Firebase initialization
    setFirebaseStatus({
      auth: !!auth,
      db: !!db,
      googleProvider: !!googleProvider,
    });

    // Check environment variables (only show presence, not actual values for security)
    const envVarNames = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID',
    ];

    const envVarStatus: Record<string, string | undefined> = {};
    
    // We can only check if they're defined in the browser, not their actual values
    // since Next.js only includes env vars used in the code
    envVarNames.forEach(name => {
      const value = process.env[name as keyof typeof process.env];
      envVarStatus[name] = value 
        ? `Present (${value.substring(0, 3)}...)` 
        : 'Missing';
    });

    setEnvVars(envVarStatus);
    setIsLoading(false);
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Firebase Configuration Debug</h1>
      
      {isLoading ? (
        <p>Loading configuration details...</p>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">Firebase Initialization Status</h2>
            <div className="bg-gray-100 p-4 rounded-md">
              <ul className="space-y-2">
                {Object.entries(firebaseStatus).map(([key, initialized]) => (
                  <li key={key} className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${initialized ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="font-medium">{key}:</span>
                    <span className={`ml-2 ${initialized ? 'text-green-600' : 'text-red-600'}`}>
                      {initialized ? 'Initialized' : 'Not Initialized'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
            <div className="bg-gray-100 p-4 rounded-md">
              <ul className="space-y-2">
                {Object.entries(envVars).map(([key, value]) => (
                  <li key={key} className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${value && !value.includes('Missing') ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="font-medium">{key}:</span>
                    <span className={`ml-2 ${value && !value.includes('Missing') ? 'text-green-600' : 'text-red-600'}`}>
                      {value || 'Missing'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Troubleshooting Steps</h2>
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <span className="font-medium">Create a .env.local file</span>
                  <p className="text-sm ml-6 mt-1">
                    Run <code className="bg-gray-200 px-1 rounded">npm run setup-env</code> to create your environment variables.
                  </p>
                </li>
                <li>
                  <span className="font-medium">Restart the development server</span>
                  <p className="text-sm ml-6 mt-1">
                    After creating or updating the .env.local file, stop and restart the Next.js server.
                  </p>
                </li>
                <li>
                  <span className="font-medium">Verify your environment variables</span>
                  <p className="text-sm ml-6 mt-1">
                    Run <code className="bg-gray-200 px-1 rounded">npm run check-env</code> to verify your Firebase configuration.
                  </p>
                </li>
                <li>
                  <span className="font-medium">Test Firebase connectivity</span>
                  <p className="text-sm ml-6 mt-1">
                    Run <code className="bg-gray-200 px-1 rounded">npm run test-firebase</code> to test the connection.
                  </p>
                </li>
              </ol>
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Return to Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 
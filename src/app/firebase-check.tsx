'use client';

import { useEffect, useState } from 'react';
import { app } from '@/lib/firebase';

export default function FirebaseCheck() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Checking Firebase configuration...');

  useEffect(() => {
    // Check if Firebase app is initialized
    if (app) {
      setStatus('success');
      setMessage('Firebase is properly initialized.');
    } else {
      setStatus('error');
      setMessage('Firebase is not initialized. Check your environment variables.');
    }
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto mt-8 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Firebase Configuration Status</h2>
      
      <div className={`p-3 rounded ${
        status === 'loading' ? 'bg-gray-100' : 
        status === 'success' ? 'bg-green-100 text-green-800' : 
        'bg-red-100 text-red-800'
      }`}>
        <div className="flex items-center">
          {status === 'loading' && (
            <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          
          {status === 'success' && (
            <svg className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          
          {status === 'error' && (
            <svg className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          
          <p>{message}</p>
        </div>
        
        {status === 'error' && (
          <div className="mt-3 text-sm">
            <p className="font-medium">Common issues:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Missing or invalid Firebase API key</li>
              <li>Incorrect .env.local file format</li>
              <li>Quotes around environment variables (should be removed)</li>
              <li>Missing required environment variables</li>
            </ul>
            <div className="mt-3">
              <p className="font-medium">Required environment variables:</p>
              <pre className="bg-gray-800 text-white p-2 rounded mt-1 text-xs overflow-x-auto">
                NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here<br/>
                NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com<br/>
                NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id<br/>
                NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com<br/>
                NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id<br/>
                NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
'use client';

import { useState } from 'react';

export default function VercelConfigPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Vercel Configuration Guide</h1>
      
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Important: Environment Variables</h2>
        <p className="mb-2">
          For your application to work on Vercel, you need to set up environment variables. 
          Follow the steps below to configure your Firebase credentials.
        </p>
      </div>

      <div className="space-y-6">
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Step 1: Firebase Configuration</h2>
          <p className="mb-4">
            You need to add all your Firebase configuration variables to Vercel:
          </p>
          
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md mb-4 font-mono text-sm">
            <div className="flex justify-between items-center mb-2">
              <span>NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key</span>
              <button 
                onClick={() => handleCopy("NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key", "firebase1")}
                className="text-blue-500 hover:text-blue-700"
              >
                {copied === "firebase1" ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com</span>
              <button 
                onClick={() => handleCopy("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com", "firebase2")}
                className="text-blue-500 hover:text-blue-700"
              >
                {copied === "firebase2" ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id</span>
              <button 
                onClick={() => handleCopy("NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id", "firebase3")}
                className="text-blue-500 hover:text-blue-700"
              >
                {copied === "firebase3" ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com</span>
              <button 
                onClick={() => handleCopy("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com", "firebase4")}
                className="text-blue-500 hover:text-blue-700"
              >
                {copied === "firebase4" ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id</span>
              <button 
                onClick={() => handleCopy("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id", "firebase5")}
                className="text-blue-500 hover:text-blue-700"
              >
                {copied === "firebase5" ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span>NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id</span>
              <button 
                onClick={() => handleCopy("NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id", "firebase6")}
                className="text-blue-500 hover:text-blue-700"
              >
                {copied === "firebase6" ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Step 2: Firebase Admin SDK Configuration</h2>
          <p className="mb-4">
            For server-side token verification, you need to add the Firebase Admin SDK credentials:
          </p>
          
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md mb-4 font-mono text-sm">
            <div className="flex justify-between items-center mb-2">
              <span>FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project-id.iam.gserviceaccount.com</span>
              <button 
                onClick={() => handleCopy("FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project-id.iam.gserviceaccount.com", "admin1")}
                className="text-blue-500 hover:text-blue-700"
              >
                {copied === "admin1" ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span>FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"</span>
              <button 
                onClick={() => handleCopy('FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYour Private Key Here\\n-----END PRIVATE KEY-----\\n"', "admin2")}
                className="text-blue-500 hover:text-blue-700"
              >
                {copied === "admin2" ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-md mb-4">
            <h3 className="text-md font-semibold mb-2">Important Note About Private Key</h3>
            <p>
              When copying your private key from the Firebase service account JSON file:
            </p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>The key must be enclosed in double quotes</li>
              <li>Line breaks in the key must be represented as \n</li>
              <li>Make sure to escape any special characters</li>
            </ol>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Step 3: MongoDB Configuration</h2>
          <p className="mb-4">
            Add your MongoDB connection string to Vercel environment variables:
          </p>
          
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md mb-4 font-mono text-sm">
            <div className="flex justify-between items-center">
              <span>MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority</span>
              <button 
                onClick={() => handleCopy("MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority", "mongo")}
                className="text-blue-500 hover:text-blue-700"
              >
                {copied === "mongo" ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">How to Add Environment Variables to Vercel</h2>
          <ol className="list-decimal list-inside space-y-3">
            <li>Go to your project in the <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Vercel Dashboard</a></li>
            <li>Click on the "Settings" tab</li>
            <li>Navigate to the "Environment Variables" section</li>
            <li>Add each variable with its corresponding value</li>
            <li>Make sure to select the appropriate environments (Production, Preview, Development)</li>
            <li>Click "Save" to apply the changes</li>
            <li>Redeploy your application for the changes to take effect</li>
          </ol>
        </section>

        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
          <p className="mb-4">
            If you're still experiencing issues after setting up all environment variables:
          </p>
          
          <ul className="list-disc list-inside space-y-2">
            <li>Visit the <a href="/firebase-debug" className="text-blue-500 hover:underline">/firebase-debug</a> page in your deployed app to check authentication status</li>
            <li>Check Vercel Function Logs for any error messages</li>
            <li>Ensure your Firebase project has Google Authentication enabled</li>
            <li>Make sure your Firebase project allows your Vercel domain in the Authentication → Sign-in method → Authorized domains section</li>
          </ul>
        </section>
      </div>
    </div>
  );
} 
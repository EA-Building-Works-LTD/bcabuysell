'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function FirebaseSetupGuide() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Firebase Authentication Setup Guide</h1>
      
      <Card className="p-6 mb-8 border-blue-300 bg-blue-50">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Why Firebase Authentication?</h2>
        <p className="mb-4">
          Firebase Authentication provides an easy-to-use, secure authentication system with multiple providers (Google, Facebook, email/password, etc.)
          without requiring a custom backend. It's a great alternative to NextAuth when you're experiencing issues.
        </p>
      </Card>
      
      <div className="space-y-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Step 1: Create a Firebase Project
          </h2>
          <ol className="list-decimal list-inside space-y-3 ml-4">
            <li className="text-gray-700">
              Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Firebase Console</a>
            </li>
            <li className="text-gray-700">Click "Add project" and follow the setup wizard</li>
            <li className="text-gray-700">Give your project a name, e.g., "bca-buy-sell"</li>
            <li className="text-gray-700">Optionally enable Google Analytics</li>
            <li className="text-gray-700">Click "Create project"</li>
          </ol>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Step 2: Register a Web App
          </h2>
          <ol className="list-decimal list-inside space-y-3 ml-4">
            <li className="text-gray-700">From your Firebase project dashboard, click the web icon ({"</>"})</li>
            <li className="text-gray-700">Register your app with a nickname (e.g., "bca-buy-sell-web")</li>
            <li className="text-gray-700">Optionally set up Firebase Hosting</li>
            <li className="text-gray-700">Click "Register app"</li>
            <li className="text-gray-700">Copy the provided Firebase configuration object - you'll need this later</li>
          </ol>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Step 3: Set Up Authentication
          </h2>
          <ol className="list-decimal list-inside space-y-3 ml-4">
            <li className="text-gray-700">In the Firebase Console, go to "Authentication" from the left sidebar</li>
            <li className="text-gray-700">Click "Get started"</li>
            <li className="text-gray-700">In the "Sign-in method" tab, enable the authentication methods you want:
              <ul className="list-disc list-inside ml-8 mt-2">
                <li>Click "Google" and enable it</li>
                <li>Add your support email</li>
                <li>Click "Save"</li>
              </ul>
            </li>
          </ol>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Step 4: Create Environment Variables
          </h2>
          <ol className="list-decimal list-inside space-y-3 ml-4">
            <li className="text-gray-700">Create or update your <code className="px-1 py-0.5 bg-gray-100 rounded">.env.local</code> file with the Firebase configuration:
              <div className="bg-gray-100 p-3 rounded font-mono text-sm mt-2">
                NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key<br />
                NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com<br />
                NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id<br />
                NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com<br />
                NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id<br />
                NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
              </div>
            </li>
            <li className="text-gray-700">Restart your development server after saving</li>
          </ol>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Step 5: Use Firebase Authentication
          </h2>
          <ol className="list-decimal list-inside space-y-3 ml-4">
            <li className="text-gray-700">Navigate to <Link href="/firebase-auth/signin" className="text-blue-600 hover:underline">/firebase-auth/signin</Link> to test your Firebase authentication</li>
            <li className="text-gray-700">After signing in, you'll be redirected to the dashboard</li>
          </ol>
        </Card>
      </div>
      
      <div className="flex justify-center space-x-4 mt-8">
        <a 
          href="https://console.firebase.google.com/" 
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button>Open Firebase Console</Button>
        </a>
        <Link href="/firebase-auth/signin">
          <Button variant="outline">Go to Sign In</Button>
        </Link>
      </div>
    </div>
  );
} 
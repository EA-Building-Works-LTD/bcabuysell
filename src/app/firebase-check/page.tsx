import FirebaseCheck from '../firebase-check';
import Link from 'next/link';

export default function FirebaseCheckPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-8">Firebase Configuration Checker</h1>
        
        <FirebaseCheck />
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Debugging Steps</h2>
          
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              <p className="font-medium">Check your .env.local file</p>
              <p className="text-gray-600 ml-2">
                Make sure you have a .env.local file in the root of your project with all required Firebase config variables.
              </p>
            </li>
            
            <li>
              <p className="font-medium">Verify environment variable format</p>
              <p className="text-gray-600 ml-2">
                Ensure there are NO quotes around values and NO spaces around the equals sign.
              </p>
              <div className="bg-green-50 p-2 rounded mt-1 text-sm">
                <p className="font-medium text-green-800">✅ Correct:</p>
                <pre className="text-green-700">NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA86hLTOVcIXFmQnBJ2M8W7TU1D5nWz64A</pre>
              </div>
              <div className="bg-red-50 p-2 rounded mt-1 text-sm">
                <p className="font-medium text-red-800">❌ Incorrect:</p>
                <pre className="text-red-700">NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyA86hLTOVcIXFmQnBJ2M8W7TU1D5nWz64A"</pre>
                <pre className="text-red-700">NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyA86hLTOVcIXFmQnBJ2M8W7TU1D5nWz64A</pre>
              </div>
            </li>
            
            <li>
              <p className="font-medium">Restart development server</p>
              <p className="text-gray-600 ml-2">
                After updating your .env.local file, restart your Next.js development server with:
              </p>
              <pre className="bg-gray-800 text-white p-2 rounded mt-1 text-sm">npm run dev</pre>
            </li>
            
            <li>
              <p className="font-medium">Check Firebase Console Settings</p>
              <p className="text-gray-600 ml-2">
                Verify your Firebase API key and project settings in the Firebase Console.
                Make sure your API key is allowed to use the Firebase services.
              </p>
            </li>
            
            <li>
              <p className="font-medium">Verify Authentication Domain</p>
              <p className="text-gray-600 ml-2">
                Make sure localhost:3000 is added as an authorized domain in Firebase Authentication settings.
              </p>
            </li>
          </ol>
        </div>
        
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 
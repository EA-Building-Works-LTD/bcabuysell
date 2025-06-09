import { initializeApp, getApps, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  Auth,
  connectAuthEmulator
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';

// Debug environment variables - more detailed logging
console.log('Firebase environment variables detailed check:');
console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Present, length: ' + process.env.NEXT_PUBLIC_FIREBASE_API_KEY.length : 'Missing');
console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Present, length: ' + process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN.length : 'Missing');
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Present, length: ' + process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID.length : 'Missing');
console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Present, length: ' + process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.length : 'Missing');
console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Present, length: ' + process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID.length : 'Missing');
console.log('NEXT_PUBLIC_FIREBASE_APP_ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Present, length: ' + process.env.NEXT_PUBLIC_FIREBASE_APP_ID.length : 'Missing');

// Check for common mistakes in environment variables
const checkEnvValue = (value: string | undefined): boolean => {
  if (!value) {
    console.error("Error: Environment variable is undefined or empty");
    return false;
  }
  if (value.includes('"') || value.includes("'")) {
    console.error(`Error: Environment variable contains quotes (${value}). Remove quotes from .env.local`);
    return false;
  }
  if (value.startsWith(' ') || value.endsWith(' ')) {
    console.error(`Error: Environment variable has leading/trailing spaces (${value}). Remove spaces from .env.local`);
    return false;
  }
  return true;
};

// Get Firebase configuration from environment variables
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Fallback configuration for development - DO NOT use in production
const fallbackConfig: FirebaseOptions = {
  apiKey: "AIzaSyA8ehLTOVc1XFmQn0J2M8W7TUID5nWZ64A",
  authDomain: "bca-buy-sell-deafa.firebaseapp.com",
  projectId: "bca-buy-sell-deafa",
  storageBucket: "bca-buy-sell-deafa.appspot.com",
  messagingSenderId: "303887781198",
  appId: "1:303887781198:web:7a9323dee4c34dd67f4a1f",
};

// Check if the required environment variables are present
const hasValidEnvVars = 
  checkEnvValue(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) &&
  checkEnvValue(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) &&
  checkEnvValue(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) &&
  checkEnvValue(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) &&
  checkEnvValue(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) &&
  checkEnvValue(process.env.NEXT_PUBLIC_FIREBASE_APP_ID);

// Use environment variables if available, otherwise use fallback (development only)
const configToUse = hasValidEnvVars ? firebaseConfig : fallbackConfig;

console.log('Using Firebase config with project ID:', configToUse.projectId);
if (!hasValidEnvVars) {
  console.warn('WARNING: Using fallback Firebase configuration. This should only be used in development.');
  console.warn('Please set up your environment variables properly for production deployment.');
}

// Initialize Firebase conditionally
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;
let googleProvider: GoogleAuthProvider | undefined;

// Function to initialize Firestore with enhanced offline support
const initializeFirestoreWithOfflineSupport = (app: FirebaseApp) => {
  console.log('Initializing Firestore with enhanced offline support...');
  return initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
      cacheSizeBytes: CACHE_SIZE_UNLIMITED
    }),
  });
};

// Function to retry initialization with exponential backoff
const initializeWithRetry = async (maxRetries = 3, initialDelay = 1000) => {
  let retries = 0;
  let delay = initialDelay;

  while (retries < maxRetries) {
    try {
      // Initialize or get existing Firebase app
      if (getApps().length === 0) {
        console.log('Initializing new Firebase app...');
        app = initializeApp(configToUse);
      } else {
        app = getApps()[0];
        console.log('Using existing Firebase app');
      }

      // Initialize authentication
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      console.log('Firebase Auth initialized successfully');

      // Initialize Firestore with enhanced offline support
      firestore = initializeFirestoreWithOfflineSupport(app);
      console.log('Firestore initialized successfully');
      
      // Enable offline persistence is now handled by the initializeFirestore options
      console.log('Offline persistence enabled through Firestore initialization');
      
      return true;
    } catch (error) {
      retries++;
      console.error(`Firebase initialization attempt ${retries} failed:`, error);
      
      if (retries >= maxRetries) {
        console.error('Max retries reached. Firebase initialization failed.');
        return false;
      }
      
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  
  return false;
};

try {
  // For client-side, we'll use the retry mechanism
  if (typeof window !== 'undefined') {
    // We can't use await at the top level, so we'll use a promise
    initializeWithRetry().then(success => {
      if (!success) {
        console.error('Failed to initialize Firebase after multiple retries');
        // Set services to undefined in case of error
        app = undefined;
        auth = undefined;
        firestore = undefined;
        googleProvider = undefined;
      }
    });
  } else {
    // For server-side, we'll use the synchronous initialization
    if (getApps().length === 0) {
      app = initializeApp(configToUse);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    firestore = getFirestore(app);
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Set services to undefined in case of error
  app = undefined;
  auth = undefined;
  firestore = undefined;
  googleProvider = undefined;
}

// Add a utility function to check if we're online
export const isOnline = () => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

// Export the Firebase services
export { app, auth, firestore as db, googleProvider }; 
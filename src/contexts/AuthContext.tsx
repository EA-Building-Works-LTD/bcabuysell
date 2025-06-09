'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  Auth,
  getIdToken
} from 'firebase/auth';
import { Firestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, isOnline } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { setFirebaseToken, removeFirebaseToken, getFirebaseToken } from '@/lib/utils';

// Debug Firebase environment variables
console.log('AuthContext - Firebase initialization status:');
console.log('- auth:', auth ? 'Initialized' : 'Not initialized');
console.log('- db:', db ? 'Initialized' : 'Not initialized');
console.log('- googleProvider:', googleProvider ? 'Initialized' : 'Not initialized');

// Define a fallback component to display when Firebase is not initialized
const FirebaseNotInitialized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex flex-col items-center space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-red-600">Firebase Error</h2>
        <p className="text-gray-700 mt-2">
          Firebase could not be initialized. Please check your environment variables.
        </p>
        <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
          <p className="font-bold">Common issues:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Missing or invalid Firebase API key</li>
            <li>Incorrect Auth Domain</li>
            <li>Quotes around environment variables</li>
            <li>Missing .env.local file</li>
          </ul>
        </div>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded text-sm">
          <p className="font-semibold text-yellow-800">Environment Variables Check:</p>
          <p className="text-yellow-700 text-xs mt-1">
            Make sure all Firebase environment variables are set in <code>.env.local</code> and restart the server.
          </p>
          <p className="text-yellow-700 text-xs mt-1">
            Run <code>npm run setup-env</code> to set up your environment variables.
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reload Page
        </button>
      </div>
    </div>
  </div>
);

// Add error state to handle Firebase initialization errors
type AuthContextType = {
  user: User | null;
  userData: any;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getAuthToken: (forceRefresh?: boolean) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  getAuthToken: async () => null,
});

export const useAuth = () => useContext(AuthContext);

// Public routes that don't require authentication
const publicRoutes = ['/auth/signin', '/auth/error', '/firebase-debug', '/firebase-check', '/auth-test'];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firebaseInitialized, setFirebaseInitialized] = useState<boolean>(!!auth && !!db);
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  
  const router = useRouter();
  const pathname = usePathname();

  // Check if Firebase is properly initialized (run this early)
  useEffect(() => {
    const checkFirebaseInitialization = () => {
      if (!auth || !db) {
        console.error('Firebase auth or Firestore is not initialized');
        setError('Firebase initialization failed. Check your environment variables.');
        setFirebaseInitialized(false);
        setLoading(false);
        return false;
      }
      setFirebaseInitialized(true);
      return true;
    };

    // Run the check immediately
    checkFirebaseInitialization();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('App is online');
      setOfflineMode(false);
    };
    
    const handleOffline = () => {
      console.log('App is offline');
      setOfflineMode(true);
    };
    
    // Set initial status
    setOfflineMode(!isOnline());
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Function to get an auth token
  const getAuthToken = async (forceRefresh = false) => {
    if (!user) {
      console.warn('No user is signed in. Cannot get token.');
      return null;
    }
    
    try {
      // If not forcing refresh, first try the existing token
      if (!forceRefresh) {
        const existingToken = getFirebaseToken();
        if (existingToken) {
          console.debug('Using existing token from storage');
          return existingToken;
        }
      }
      
      // No valid token in storage or force refresh requested, get a fresh one
      console.debug('Getting fresh token from Firebase');
      const token = await getIdToken(user, true); // Force refresh
      
      if (token) {
        // Save the token to localStorage/cookie
        setFirebaseToken(token);
      }
      
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  // Set up the auth state listener (only if Firebase is initialized)
  useEffect(() => {
    // Skip if Firebase is not initialized
    if (!firebaseInitialized || !auth) {
      console.log('Skipping auth state listener because Firebase is not initialized');
      return () => {};
    }

    console.log('Setting up Firebase auth state listener');

    // Continue with auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        
        if (user) {
          // Get and store Firebase token in cookie
          try {
            // Always force refresh the token on auth state change
            const token = await getIdToken(user, true);
            setFirebaseToken(token);
            
            // Set up a token refresh interval
            const tokenRefreshInterval = setInterval(async () => {
              try {
                if (auth?.currentUser) {
                  const freshToken = await getIdToken(auth.currentUser, true);
                  setFirebaseToken(freshToken);
                  if (process.env.NODE_ENV === 'development') {
                    console.log('Auth token refreshed via interval');
                  }
                }
              } catch (refreshError) {
                console.error('Token refresh interval error:', refreshError);
              }
            }, 15 * 60 * 1000); // Refresh token every 15 minutes
            
            // Clean up interval on unmount or user change
            return () => clearInterval(tokenRefreshInterval);
          } catch (tokenError) {
            console.error('Error getting auth token:', tokenError);
          }
          
          // Fetch user data from Firestore
          try {
            if (!db) {
              throw new Error('Firestore is not initialized');
            }
            
            const userRef = doc(db, 'users', user.uid);
            console.log('Fetching user data for:', user.uid);
            
            // Check if we can reach Firestore
            try {
              // Skip Firestore fetch if we're in offline mode
              if (offlineMode) {
                console.log('In offline mode - using cached data if available');
                // Keep existing userData if available, otherwise fallback
                if (!userData) {
                  console.log('No cached user data - creating fallback data');
                  // Create fallback user data
                  const fallbackUserData = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || 'User',
                    role: process.env.NODE_ENV === 'development' ? 'admin' : 'user',
                    offlineCreated: true
                  };
                  setUserData(fallbackUserData);
                }
                return;
              }
              
              const userSnap = await getDoc(userRef);
              
              if (userSnap.exists()) {
                console.log('User data found in Firestore');
                setUserData(userSnap.data());
              } else {
                console.log('User document does not exist, creating new user');
                // Create new user document if it doesn't exist
                const newUserData = {
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName,
                  photoURL: user.photoURL,
                  createdAt: new Date().toISOString(),
                  role: 'user', // Default role
                };
                
                // For development, make all users admins temporarily
                if (process.env.NODE_ENV === 'development') {
                  console.log('Development environment - setting user as admin');
                  newUserData.role = 'admin';
                } else {
                  // Check if this is the first user (admin)
                  try {
                    const statsRef = doc(db, 'app', 'stats');
                    const statsSnap = await getDoc(statsRef);
                    
                    if (!statsSnap.exists() || !statsSnap.data().userCount) {
                      // First user becomes admin
                      newUserData.role = 'admin';
                      await setDoc(statsRef, { userCount: 1 }, { merge: true });
                    } else {
                      // Increment user count
                      await setDoc(statsRef, { 
                        userCount: statsSnap.data().userCount + 1 
                      }, { merge: true });
                    }
                  } catch (statsError: any) {
                    console.error('Error checking user stats:', statsError);
                    
                    // Don't show error to user if offline
                    if (statsError.message && statsError.message.includes('offline')) {
                      console.log('Offline error detected, continuing with fallback');
                      setOfflineMode(true);
                    } else {
                    // Fallback - make user an admin if we can't check stats
                    newUserData.role = 'admin';
                    }
                  }
                }
                
                // Create the user document
                await setDoc(userRef, newUserData);
                setUserData(newUserData);
              }
            } catch (firestoreError: any) {
              console.error('Error fetching user data:', firestoreError);
              
              // Check if the error is due to being offline
              if (firestoreError.message && firestoreError.message.includes('offline')) {
                console.log('Offline error detected, enabling offline mode');
                setOfflineMode(true);
                
                // For development or if offline, create a mock user if Firestore is unavailable
                console.log('Creating fallback user data for offline mode');
                const mockUserData = {
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName || 'Test User',
                  role: process.env.NODE_ENV === 'development' ? 'admin' : 'user',
                  createdAt: new Date().toISOString(),
                  offlineCreated: true
                };
                setUserData(mockUserData);
              } else {
                // Only set error for non-offline issues
                setError(`Firestore error: ${firestoreError.message}`);
              }
            }
          } catch (error: any) {
            console.error('Error fetching user data:', error);
            
            // Check if the error is due to being offline
            if (error.message && error.message.includes('offline')) {
              console.log('Offline error detected in outer try-catch');
              setOfflineMode(true);
              // Don't set error for offline issues
            } else {
            setError('Error fetching user data. Please try again.');
            }
          }
        } else {
          setUserData(null);
          // Remove token from cookies
          removeFirebaseToken();
          
          // Check if current route requires authentication
          if (pathname && !publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
            router.push('/auth/signin');
          }
        }
      } catch (error: any) {
        console.error('Auth state change error:', error);
        
        // Check if the error is due to being offline
        if (error.message && error.message.includes('offline')) {
          console.log('Offline error detected in auth state change');
          setOfflineMode(true);
          // Don't set error for offline issues
        } else {
        setError('Authentication error. Please refresh the page.');
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [pathname, router, userData, offlineMode, firebaseInitialized]); // Add firebaseInitialized dependency

  // Sign in with Google
  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error('Firebase authentication is not initialized');
    }

    try {
      setError(null);
      // TypeScript non-null assertions
      const result = await signInWithPopup(auth as Auth, googleProvider as GoogleAuthProvider);
      
      // Get and store Firebase token in cookie
      if (result.user) {
        const token = await getIdToken(result.user);
        setFirebaseToken(token);
      }
      
      router.push('/'); // Redirect to home after successful sign-in
    } catch (error: any) {
      console.error('Google sign in error:', error);
      // Provide more specific error messages based on the Firebase error code
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. You closed the popup.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else {
        setError(`Google sign in failed: ${error.message}`);
      }
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    if (!auth) {
      throw new Error('Firebase authentication is not initialized');
    }

    try {
      setError(null);
      await firebaseSignOut(auth as Auth);
      // Remove token from cookies
      removeFirebaseToken();
      router.push('/auth/signin');
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(`Sign out failed: ${error.message}`);
      throw error;
    }
  };

  // If Firebase is not initialized, show a helpful error component
  if (!firebaseInitialized && !loading) {
    console.log('Rendering FirebaseNotInitialized component because Firebase is not initialized');
    return <FirebaseNotInitialized />;
  }

  return (
    <AuthContext.Provider
      value={{
      user, 
      userData, 
      loading, 
      error, 
      signInWithGoogle, 
      signOut,
        getAuthToken,
      }}
    >
      {!firebaseInitialized && !loading ? <FirebaseNotInitialized /> : children}
    </AuthContext.Provider>
  );
}; 
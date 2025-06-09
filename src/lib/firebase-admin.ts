import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';

// Define custom type for development-mode decoded token
export interface DecodedToken {
  uid: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  user_id?: string;
  sub?: string;
}

// Initialize Firebase Admin SDK
function initFirebaseAdmin() {
  const firebaseAdminConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!firebaseAdminConfig.projectId || !firebaseAdminConfig.clientEmail || !firebaseAdminConfig.privateKey) {
    // Check if we have complete config
    if (process.env.NODE_ENV === 'production') {
      console.error('Missing Firebase Admin SDK configuration. Token verification will not work.');
    }
    
    // In development, we can still continue without token verification
    if (process.env.NODE_ENV === 'development') {
      console.warn('Development mode: Missing Firebase Admin SDK configuration');
    }
    
    // If we're using service account credentials directly
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('Using GOOGLE_APPLICATION_CREDENTIALS for Firebase Admin authentication');
      // If we have GOOGLE_APPLICATION_CREDENTIALS, we can initialize without explicit credentials
      if (getApps().length === 0) {
        initializeApp();
      }
      return getAuth();
    }
    
    return null;
  }

  // Initialize the app with credentials
  try {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(firebaseAdminConfig as any),
      });
    }
    return getAuth();
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    return null;
  }
}

// Get the Firebase Admin auth instance
export const adminAuth = initFirebaseAdmin();

// Verify Firebase ID token
export async function verifyIdToken(token: string): Promise<DecodedToken | null> {
  if (!adminAuth) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Development mode: Skipping token verification');
      try {
        // In development, try to decode the token without verification
        // This is ONLY for development and should never be used in production
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        return {
          uid: decoded.user_id || decoded.sub,
          email: decoded.email,
          email_verified: true,
          name: decoded.name,
          picture: decoded.picture
        };
      } catch (e) {
        console.error('Failed to decode token in development mode:', e);
        return null;
      }
    }
    console.error('Firebase Admin not initialized, cannot verify token');
    return null;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    // Convert to our DecodedToken interface for consistent typing
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture
    };
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return null;
  }
} 
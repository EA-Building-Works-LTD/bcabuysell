'use client';

import { createContext, useContext, ReactNode } from 'react';

// Mock user data since we've removed authentication
const mockUser = {
  uid: 'default-user',
  email: 'guest@example.com',
  displayName: 'Guest User',
  photoURL: null,
  emailVerified: true
};

const mockUserData = {
  _id: 'default-user',
  name: 'Guest User',
  email: 'guest@example.com',
  role: 'admin', // Give admin access to all functions
  uid: 'default-user',
  displayName: 'Guest User',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Define the context type
type AuthContextType = {
  user: typeof mockUser;
  userData: typeof mockUserData;
  loading: boolean;
  initialized: boolean;
  error: Error | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getAuthToken: (forceRefresh?: boolean) => Promise<string | null>;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  // Since we've removed authentication, just return a mock user always
  const authValue: AuthContextType = {
    user: mockUser,
    userData: mockUserData,
    loading: false,
    initialized: true,
    error: null,
    
    // Mock functions that do nothing
    signInWithGoogle: async () => {
      console.log('Authentication has been removed, using guest access');
    },
    signOut: async () => {
      console.log('Authentication has been removed, cannot sign out of guest access');
    },
    getAuthToken: async () => 'mock-token-for-guest-access'
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 
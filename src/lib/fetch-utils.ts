/**
 * Utility functions for making authenticated fetch requests
 */

import { getFirebaseToken, setFirebaseToken, addAuthHeaders } from "./utils";
import { auth } from "./firebase";
import { getIdToken } from "firebase/auth";

/**
 * Gets a fresh Firebase token, either from cookies/localStorage or directly from Firebase
 */
export async function getAuthToken(): Promise<string | null> {
  // First try to get from cookies/localStorage
  const tokenFromStorage = getFirebaseToken();
  if (tokenFromStorage) return tokenFromStorage;
  
  // If not in storage, try to get from Firebase directly
  if (!auth) {
    console.error('Firebase auth not initialized');
    return null;
  }
  
  const user = auth.currentUser;
  if (!user) {
    console.warn('No current user in Firebase auth');
    return null;
  }
  
  try {
    // Get fresh token
    console.log('Getting fresh token from Firebase');
    const token = await getIdToken(user, true); // force refresh
    
    // Save the new token to cookies/localStorage
    if (token) {
      setFirebaseToken(token);
      console.log('New token obtained and saved');
    }
    
    return token;
  } catch (e) {
    console.error('Error getting fresh auth token:', e);
    return null;
  }
}

/**
 * Makes an authenticated fetch request with the Firebase token
 * with automatic token refresh on 401 errors
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // First attempt with existing token
  const initialHeaders = addAuthHeaders(options.headers || {});
  
  let response = await fetch(url, {
    ...options,
    headers: initialHeaders,
  });
  
  // If unauthorized and we have auth, try to refresh token and retry
  if (response.status === 401 && auth?.currentUser) {
    console.log('Got 401, refreshing token and retrying request');
    
    try {
      // Force refresh token
      const newToken = await getIdToken(auth.currentUser, true);
      
      if (newToken) {
        // Save the new token
        setFirebaseToken(newToken);
        
        // Retry the request with the new token
        const retryHeaders = addAuthHeaders(options.headers || {});
        
        return fetch(url, {
          ...options,
          headers: retryHeaders,
        });
      }
    } catch (refreshError) {
      console.error('Failed to refresh token:', refreshError);
    }
  }
  
  return response;
}

/**
 * A simple fetch function that uses the authFetch with JSON
 */
export async function fetchJson(url: string, options: RequestInit = {}) {
  try {
    const response = await authFetch(url, {
      ...options,
      headers: {
        ...addAuthHeaders(options.headers),
        'Accept': 'application/json',
        ...(options.method !== 'GET' ? {'Content-Type': 'application/json'} : {}),
      },
    });
    
    if (!response.ok) {
      // Get error message from the response
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
      }
      
      // Log extra details in development
      if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', {
          status: response.status,
          url,
          error: errorMessage
        });
      }
      
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
} 
/**
 * Utility functions for making authenticated fetch requests
 */

import { getFirebaseToken, setFirebaseToken, addAuthHeaders, FIREBASE_TOKEN_COOKIE } from "./utils";
import { auth } from "./firebase";
import { getIdToken } from "firebase/auth";

// Maximum number of retries for fetch requests
const MAX_RETRIES = 3;

/**
 * Gets a fresh Firebase token, either from cookies/localStorage or directly from Firebase
 */
export async function getAuthToken(forceRefresh = false): Promise<string | null> {
  // If not forcing refresh, first try to get from cookies/localStorage
  if (!forceRefresh) {
    const tokenFromStorage = getFirebaseToken();
    if (tokenFromStorage) return tokenFromStorage;
  }
  
  // Get from Firebase directly
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
 * with automatic token refresh on 401 errors and retry on network failures
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let retries = 0;
  let lastError: Error | null = null;
  
  while (retries <= MAX_RETRIES) {
    try {
      // Get token (force refresh on retry attempts)
      if (retries > 0) {
        console.log(`Retry attempt ${retries}/${MAX_RETRIES} for ${url}`);
        await getAuthToken(true);
      }
      
      // Set up headers with auth token
      const headers = addAuthHeaders(options.headers || {});
      
      // Make the request
      const response = await fetch(url, {
        ...options,
        headers,
      });
      
      // If we get a 401, refresh token and retry immediately (without incrementing retries)
      if (response.status === 401 && auth?.currentUser && retries < MAX_RETRIES) {
        console.log('Got 401, refreshing token and retrying request');
        await getAuthToken(true);
        continue;
      }
      
      // For all other responses (success or error), return the response
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Fetch error (attempt ${retries + 1}/${MAX_RETRIES + 1}):`, error);
      
      // Increment retry counter
      retries++;
      
      // If we've reached max retries, throw the last error
      if (retries > MAX_RETRIES) {
        break;
      }
      
      // Wait before retrying, with exponential backoff
      const delay = Math.pow(2, retries) * 500;
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // If we've exhausted all retries, throw the last error
  throw lastError || new Error(`Failed to fetch ${url} after ${MAX_RETRIES} retries`);
}

/**
 * Clears the auth token and forces a refresh on the next request
 */
export function clearAuthToken(): void {
  // Clear from cookies/localStorage
  document.cookie = `${FIREBASE_TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  try {
    localStorage.removeItem(FIREBASE_TOKEN_COOKIE);
  } catch (e) {
    // Ignore localStorage errors
  }
  console.log('Auth token cleared');
}

/**
 * A simple fetch function that uses the authFetch with JSON
 */
export async function fetchJson(url: string, options: RequestInit = {}): Promise<any> {
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
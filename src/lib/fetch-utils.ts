/**
 * Utility functions for making authenticated fetch requests
 */

import { getFirebaseToken } from "./utils";
import { auth } from "./firebase";
import { getIdToken } from "firebase/auth";

/**
 * Gets a fresh Firebase token, either from cookies or directly from Firebase
 */
export async function getAuthToken(): Promise<string | null> {
  // First try to get from cookies
  const tokenFromCookie = getFirebaseToken();
  if (tokenFromCookie) return tokenFromCookie;
  
  // If not in cookies, try to get from Firebase directly
  if (!auth) return null;
  
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    // Get fresh token
    const token = await getIdToken(user, true); // force refresh
    return token;
  } catch (e) {
    console.error('Error getting fresh auth token:', e);
    return null;
  }
}

/**
 * Makes an authenticated fetch request with the Firebase token
 */
export async function authFetch(url: string, options: RequestInit = {}) {
  // Get the Firebase token, with refresh if needed
  const token = await getAuthToken();
  
  // Create headers with auth token
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Make the fetch request with auth headers
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * A simple fetch function that uses the authFetch with JSON
 */
export async function fetchJson(url: string, options: RequestInit = {}) {
  const response = await authFetch(url, options);
  
  if (!response.ok) {
    // Get error message from the response
    let errorMessage = 'An unexpected error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // If response is not JSON, use status text
      errorMessage = response.statusText;
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
} 
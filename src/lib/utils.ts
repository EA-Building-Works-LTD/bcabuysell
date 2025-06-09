import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from "firebase/firestore"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Cookie utilities for Firebase authentication
export const FIREBASE_TOKEN_COOKIE = 'firebase-token'

// Get domain for production or development
function getCookieDomain() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return '';

  const hostname = window.location.hostname;
  
  // For localhost, don't set domain
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '';
  }
  
  // For Vercel deployments or other production domains
  return `domain=${hostname}`;
}

// Client-side cookie management with improved security settings
export function setFirebaseToken(token: string) {
  const domain = getCookieDomain();
  const domainPart = domain ? `; ${domain}` : '';
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  
  // Set SameSite=Lax for better compatibility across browsers
  document.cookie = `${FIREBASE_TOKEN_COOKIE}=${token}; path=/; max-age=604800${domainPart}${secure}; SameSite=Lax`;
  
  // Also store in localStorage as backup for API calls
  try {
    localStorage.setItem(FIREBASE_TOKEN_COOKIE, token);
  } catch (e) {
    console.warn('Could not store token in localStorage:', e);
  }
  
  console.log('Firebase token set in cookie and localStorage');
}

export function removeFirebaseToken() {
  const domain = getCookieDomain();
  const domainPart = domain ? `; ${domain}` : '';
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  
  document.cookie = `${FIREBASE_TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${domainPart}${secure}; SameSite=Lax`;
  
  // Also remove from localStorage
  try {
    localStorage.removeItem(FIREBASE_TOKEN_COOKIE);
  } catch (e) {
    console.warn('Could not remove token from localStorage:', e);
  }
  
  console.log('Firebase token removed from cookie and localStorage');
}

export function getFirebaseToken(): string | null {
  // Try getting from cookie first
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(FIREBASE_TOKEN_COOKIE + '=')) {
        const token = cookie.substring(FIREBASE_TOKEN_COOKIE.length + 1);
        if (token) return token;
      }
    }
  }
  
  // Fallback to localStorage if cookie is not available
  if (typeof localStorage !== 'undefined') {
    try {
      const token = localStorage.getItem(FIREBASE_TOKEN_COOKIE);
      if (token) return token;
    } catch (e) {
      console.warn('Could not access localStorage:', e);
    }
  }
  
  return null;
}

// Function to format Firestore timestamps
export function formatTimestamp(timestamp: Timestamp) {
  if (!timestamp || !timestamp.toDate) {
    return 'Invalid date'
  }
  return timestamp.toDate().toLocaleString()
}

// Function to add authorization headers to fetch requests
export function addAuthHeaders(headers: HeadersInit = {}): HeadersInit {
  const token = getFirebaseToken();
  
  if (token) {
    return {
      ...headers,
      'Authorization': `Bearer ${token}`
    };
  }
  
  return headers;
}

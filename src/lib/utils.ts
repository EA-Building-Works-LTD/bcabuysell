import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from "firebase/firestore"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Cookie utilities for Firebase authentication
export const FIREBASE_TOKEN_COOKIE = 'firebase-token'

// Client-side cookie management
export function setFirebaseToken(token: string) {
  document.cookie = `${FIREBASE_TOKEN_COOKIE}=${token}; path=/; max-age=3600; SameSite=Strict`
}

export function removeFirebaseToken() {
  document.cookie = `${FIREBASE_TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`
}

export function getFirebaseToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(FIREBASE_TOKEN_COOKIE + '=')) {
      return cookie.substring(FIREBASE_TOKEN_COOKIE.length + 1);
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

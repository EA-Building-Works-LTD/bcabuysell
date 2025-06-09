import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to format timestamps (generic version without Firebase dependency)
export function formatTimestamp(timestamp: any) {
  if (!timestamp) {
    return 'Invalid date'
  }
  
  // Handle Firestore timestamp objects
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toLocaleString()
  }
  
  // Handle Date objects
  if (timestamp instanceof Date) {
    return timestamp.toLocaleString()
  }
  
  // Handle ISO strings
  if (typeof timestamp === 'string') {
    return new Date(timestamp).toLocaleString()
  }
  
  return 'Invalid date'
}

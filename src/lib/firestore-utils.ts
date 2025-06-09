import { 
  disableNetwork, 
  enableNetwork, 
  connectFirestoreEmulator, 
  Firestore 
} from 'firebase/firestore';
import { db as firestore } from './firebase';

// Maximum retry attempts for Firestore operations
const MAX_RETRIES = 3;

// Toggle online/offline mode for Firestore
export async function toggleFirestoreNetwork(online: boolean): Promise<boolean> {
  if (!firestore) {
    console.error('Firestore not initialized');
    return false;
  }

  try {
    if (online) {
      await enableNetwork(firestore);
      console.log('Firestore online mode enabled');
    } else {
      await disableNetwork(firestore);
      console.log('Firestore offline mode enabled');
    }
    return true;
  } catch (error) {
    console.error(`Error toggling Firestore network (${online ? 'online' : 'offline'}):`, error);
    return false;
  }
}

// Retry a Firestore operation with exponential backoff
export async function retryFirestoreOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: any;
  let delay = 500; // Start with 500ms delay
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Before each retry attempt, try to ensure network is enabled
      if (attempt > 1 && firestore) {
        try {
          await enableNetwork(firestore);
        } catch (networkError) {
          console.warn('Failed to enable network before retry attempt:', networkError);
        }
      }
      
      // Attempt the operation
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.error(`Firestore operation failed (attempt ${attempt}/${maxRetries}):`, error);
      
      // If this is the last attempt, don't wait
      if (attempt >= maxRetries) {
        break;
      }
      
      // Wait with exponential backoff before next attempt
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Double the delay for next attempt
    }
  }
  
  // If we got here, all retries failed
  throw lastError || new Error('Firestore operation failed after multiple retries');
}

// Reset Firestore connection (disable then enable network)
export async function resetFirestoreConnection(): Promise<boolean> {
  if (!firestore) {
    console.error('Firestore not initialized');
    return false;
  }
  
  try {
    // First disable network
    await disableNetwork(firestore);
    console.log('Firestore network disabled for reset');
    
    // Wait a short time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Then enable network
    await enableNetwork(firestore);
    console.log('Firestore network re-enabled');
    
    return true;
  } catch (error) {
    console.error('Error resetting Firestore connection:', error);
    return false;
  }
}

// Check if Firestore is initialized
export function isFirestoreInitialized(): boolean {
  return !!firestore;
} 
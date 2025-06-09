'use client';

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check initial status
    setOffline(!navigator.onLine);

    // Event handlers
    const handleOnline = () => {
      setOffline(false);
      setDismissed(false); // Reset dismissed state when we go back online
    };
    
    const handleOffline = () => {
      setOffline(true);
      setDismissed(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!offline || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-lg p-3">
        <div className="flex items-center">
          <WifiOff className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Offline Mode</h3>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">
              You are currently offline. Some features may be limited.
            </p>
          </div>
          <button 
            onClick={() => setDismissed(true)}
            className="text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-300 ml-2"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
} 
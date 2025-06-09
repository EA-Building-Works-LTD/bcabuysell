'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CarForm from '@/components/cars/CarForm';

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Define navigation items with their icons and paths
  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Cars',
      path: '/cars',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
    },
    {
      name: 'Add',
      path: '/cars/new',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      primary: true,
    },
    {
      name: 'Stats',
      path: '/statistics',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  // Handle add button click to show modal
  const handleAddClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShowAddModal(true);
  };
  
  // Handle when the form has been successfully submitted
  const handleFormSuccess = () => {
    setShowAddModal(false);
    router.push('/cars');
    router.refresh();
  };

  return (
    <>
      <footer className="fixed bottom-0 w-full bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-800 z-50">
        <div className="px-4 h-14 flex items-center justify-between">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            
            return (
              <Link 
                href={item.path} 
                key={item.name}
                onClick={item.name === 'Add' ? handleAddClick : undefined}
                className={`flex flex-col items-center ${
                  isActive 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                {item.primary ? (
                  <div className="-mt-6 bg-primary-600 dark:bg-primary-500 rounded-full p-3 shadow-lg text-white">
                    {isAddLoading && item.name === 'Add' ? (
                      <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      item.icon
                    )}
                  </div>
                ) : (
                  <div>{item.icon}</div>
                )}
                <span className="text-xs mt-0.5">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </footer>

      {/* Add Car Modal with Form */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Car</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <CarForm 
              // Add a custom onSuccess handler for the form
              isInModal={true}
              onSuccess={handleFormSuccess}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 
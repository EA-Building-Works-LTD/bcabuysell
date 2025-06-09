'use client';

import { Providers } from './providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto pt-4 pb-20 flex-1">
          {children}
        </div>
        <Footer />
      </div>
    </Providers>
  );
} 
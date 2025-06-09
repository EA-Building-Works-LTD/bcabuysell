import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/ui/use-theme';
import { OfflineBanner } from '@/components/ui/offline-banner';

// Initialize Inter font
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BCA Buy Sell - Car Market',
  description: 'Track and manage car purchases, sales, and profits',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            {children}
            <OfflineBanner />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

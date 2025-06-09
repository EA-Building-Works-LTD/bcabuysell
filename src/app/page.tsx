import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Car, 
  BarChart3, 
  CalendarRange,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 px-4 sm:py-24 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-blue-900 dark:text-blue-100">
              BCA Buy &amp; Sell
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
              Family app for tracking car purchases, repairs, and sales.
            </p>
            <div className="mt-10 flex justify-center">
              <Link href="/cars">
                <Button className="px-8 py-6 text-lg flex items-center gap-2">
                  <Car className="mr-2 h-5 w-5" />
                  View Cars
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 px-4 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
              App Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-5 mx-auto">
                  <Car className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-3">
                  Car Inventory
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Track all cars with detailed information, including purchase prices, repair costs, and sales data.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-5 mx-auto">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-3">
                  Statistics &amp; Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  View profit margins, average repair costs, and other key metrics to optimize your business.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-5 mx-auto">
                  <CalendarRange className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-3">
                  Tracking &amp; History
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Keep a comprehensive history of each vehicle's journey from purchase to sale.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

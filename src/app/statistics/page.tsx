'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import OwnerStatisticsOverview from '@/components/statistics/OwnerStatisticsOverview';
import MonthlyStatistics from '@/components/statistics/MonthlyStatistics';
import { Calendar, BarChart3 } from 'lucide-react';

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState('monthly');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Sales Statistics
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Track performance and analyze sales data across all owners
          </p>
        </div>

        <Tabs defaultValue="monthly" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="monthly" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Monthly View</span>
              </TabsTrigger>
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>All Time</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="monthly" className="mt-6">
            <MonthlyStatistics />
          </TabsContent>

          <TabsContent value="overview" className="mt-6">
            <OwnerStatisticsOverview />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 
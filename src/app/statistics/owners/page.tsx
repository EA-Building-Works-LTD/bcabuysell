'use client';

import OwnerStatisticsOverview from '@/components/statistics/OwnerStatisticsOverview';

export default function OwnerStatisticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Statistics by Owner</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Compare performance metrics for each owner</p>
      </div>
      <OwnerStatisticsOverview />
    </div>
  );
} 
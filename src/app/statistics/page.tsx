import StatisticsOverview from '@/components/statistics/StatisticsOverview';

export const metadata = {
  title: 'Statistics - BCA Buy Sell',
  description: 'View performance metrics and statistics for your car inventory',
};

export default function StatisticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Statistics & Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Track your inventory and sales performance</p>
      </div>
      <StatisticsOverview />
    </div>
  );
} 
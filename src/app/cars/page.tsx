import CarListWrapper from '@/components/cars/CarListWrapper';

// Set dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Export metadata
export const metadata = {
  title: 'Cars for Sale - BCA Buy & Sell',
  description: 'Browse, filter, and search cars available for sale',
};

export default function CarsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <CarListWrapper />
    </div>
  );
} 
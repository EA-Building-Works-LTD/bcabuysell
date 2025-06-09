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
    <div className="pb-2">
      <CarListWrapper />
    </div>
  );
} 
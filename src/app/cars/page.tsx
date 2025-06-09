import CarList from '@/components/cars/CarList';

export const metadata = {
  title: 'Cars - BCA Buy Sell',
  description: 'Browse and manage your car inventory',
};

export default function CarsPage() {
  return (
    <div className="pb-2">
      <CarList />
    </div>
  );
} 
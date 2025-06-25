import { useState, useEffect } from 'react';
import { ICar } from '@/models/Car';
import { Card } from '@/components/ui/card';
import StatsSummaryCards from './StatsSummaryCards';
import { FixedUser, FIXED_USERS, USER_COLORS } from '@/types/users';
import { fetchJson } from '@/lib/fetch-utils';
import { useAuth } from '@/contexts/AuthContext';

export default function OwnerStatisticsOverview() {
  const { user } = useAuth();
  const [cars, setCars] = useState<ICar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCars() {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchJson('/api/cars');
        setCars(data.data);
      } catch (err: any) {
        console.error('Error fetching cars for owner stats:', err);
        setError(err.message || 'Failed to load owner statistics.');
      } finally {
        setLoading(false);
      }
    }
    fetchCars();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-md">
        {error}
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-10">
        No car data available.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {FIXED_USERS.map((owner) => {
        const ownerCars = cars.filter((car) => car.owner === owner);
        return (
          <div key={owner} className="space-y-4">
            <div className="flex items-center space-x-3">
              <span
                className={`h-3 w-3 rounded-full inline-block ${USER_COLORS[owner]}`}
              ></span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{owner}</h2>
              <span className="text-sm text-gray-600 dark:text-gray-400">{ownerCars.length} cars</span>
            </div>
            {ownerCars.length > 0 ? (
              <StatsSummaryCards cars={ownerCars} />
            ) : (
              <Card className="p-4 bg-gray-50 dark:bg-gray-800/40">
                <p className="text-gray-500 dark:text-gray-400 text-sm">No cars for this owner.</p>
              </Card>
            )}
          </div>
        );
      })}
    </div>
  );
} 
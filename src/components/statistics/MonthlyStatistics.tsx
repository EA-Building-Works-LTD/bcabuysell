'use client';

import { useState, useEffect, useMemo } from 'react';
import { ICar } from '@/models/Car';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import QuickStatsCard from './QuickStatsCard';
import { FixedUser, FIXED_USERS, USER_COLORS, USER_COLOR_SCHEMES } from '@/types/users';
import { fetchJson } from '@/lib/fetch-utils';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar,
  TrendingUp, 
  TrendingDown, 
  Car as CarIcon, 
  PoundSterling, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Target
} from 'lucide-react';

interface MonthlyStats {
  carsSold: number;
  totalProfit: number;
  totalInvestment: number;
  profitMargin: number;
  averageProfitPerCar: number;
}

interface OwnerMonthlyStats {
  owner: FixedUser;
  stats: MonthlyStats;
}

export default function MonthlyStatistics() {
  const { user } = useAuth();
  const [cars, setCars] = useState<ICar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCars() {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchJson('/api/cars');
        setCars(data.data);
      } catch (err: any) {
        console.error('Error fetching cars for monthly stats:', err);
        setError(err.message || 'Failed to load monthly statistics.');
      } finally {
        setLoading(false);
      }
    }
    fetchCars();
  }, [user]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPreviousMonth();
      } else if (e.key === 'ArrowRight') {
        goToNextMonth();
      } else if (e.key === 'Home') {
        goToCurrentMonth();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Helper function to get days in month
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Helper function to get month range
  const getMonthRange = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month, getDaysInMonth(date), 23, 59, 59, 999);
    return { startDate, endDate };
  };

  // Calculate monthly statistics for each owner
  const monthlyStats = useMemo(() => {
    const { startDate, endDate } = getMonthRange(selectedDate);
    
    return FIXED_USERS.map((owner): OwnerMonthlyStats => {
      const ownerCars = cars.filter(car => car.owner === owner);
      
      // Get cars sold in the selected month
      const soldCarsInMonth = ownerCars.filter(car => {
        if (car.status !== 'sold' || !car.soldDate) return false;
        const soldDate = new Date(car.soldDate);
        return soldDate >= startDate && soldDate <= endDate;
      });

      // Calculate investment for cars purchased in the month
      const purchasedCarsInMonth = ownerCars.filter(car => {
        const purchaseDate = new Date(car.purchaseDate);
        return purchaseDate >= startDate && purchaseDate <= endDate;
      });

      const totalInvestment = purchasedCarsInMonth.reduce((sum, car) => sum + car.purchasePrice, 0);

      // Calculate profit from sold cars in the month
      const totalProfit = soldCarsInMonth.reduce((sum, car) => {
        if (!car.soldPrice) return sum;
        const totalRepairCost = car.repairs?.reduce((acc, repair) => acc + repair.cost, 0) || 0;
        const totalCost = car.purchasePrice + car.recoveryPrice + car.fuelCost + car.insuranceCost + totalRepairCost;
        return sum + (car.soldPrice - totalCost);
      }, 0);

      const carsSold = soldCarsInMonth.length;
      const profitMargin = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;
      const averageProfitPerCar = carsSold > 0 ? totalProfit / carsSold : 0;

      return {
        owner,
        stats: {
          carsSold,
          totalProfit,
          totalInvestment,
          profitMargin,
          averageProfitPerCar
        }
      };
    });
  }, [cars, selectedDate]);

  // Navigation functions
  const goToPreviousMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToCurrentMonth = () => {
    setSelectedDate(new Date());
  };

  // Touch gesture handlers for mobile swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNextMonth();
    }
    if (isRightSwipe) {
      goToPreviousMonth();
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format month/year display
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-GB', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatShortMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-GB', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

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

  const currentMonth = new Date();
  const isCurrentMonth = selectedDate.getMonth() === currentMonth.getMonth() && 
                         selectedDate.getFullYear() === currentMonth.getFullYear();
  const isFutureMonth = selectedDate > currentMonth;

  return (
    <div 
      className="space-y-6 select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header with Month Navigation */}
      <div className="rounded-xl p-4 sm:p-6 border shadow-premium" style={{ backgroundColor: '#020818' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Monthly Sales Overview
              </h1>
              <p className="text-sm text-blue-300 mt-1">
                Track performance by owner for {formatMonthYear(selectedDate)}
              </p>
            </div>
          </div>
          
          {!isCurrentMonth && (
            <Button 
              onClick={goToCurrentMonth}
              variant="outline"
              size="sm"
              className="self-end sm:self-auto"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Current Month
            </Button>
          )}
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-center mt-6 space-x-2 sm:space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousMonth}
            className="flex items-center space-x-1 sm:space-x-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 active:scale-95 transition-transform px-2 sm:px-3"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          
          <div className="text-center min-w-[120px] sm:min-w-[160px] bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2 border shadow-sm">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              {formatMonthYear(selectedDate)}
            </h2>
            <p className="text-xs text-muted-foreground">
              {getDaysInMonth(selectedDate)} days
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextMonth}
            className="flex items-center space-x-1 sm:space-x-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 active:scale-95 transition-transform px-2 sm:px-3"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
 

        {/* Desktop Keyboard Shortcuts */}
        <div className="hidden sm:flex justify-center mt-3">
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">←</kbd>
              <span>Previous</span>
            </div>
            <div className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">→</kbd>
              <span>Next</span>
            </div>
            <div className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Home</kbd>
              <span>Current</span>
            </div>
          </div>
        </div>

        {isFutureMonth && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-700 dark:text-amber-400 text-center">
              <Calendar className="h-4 w-4 inline mr-2" />
              Future month - Data will be available as sales are made
            </p>
          </div>
        )}
      </div>

      {/* Owner Statistics Grid */}
      <div className="space-y-6">
        {monthlyStats.map(({ owner, stats }) => {
          const ownerColorScheme = USER_COLOR_SCHEMES[owner];
          
          return (
            <Card 
              key={owner} 
              className="overflow-hidden border-l-4 hover:shadow-premium-lg transition-all duration-300 group" 
              style={{ 
                borderLeftColor: ownerColorScheme.primary,
                backgroundColor: '#020818'
              }}
            >
              <div className="p-4 sm:p-6">
                {/* Owner Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                  <div className="flex items-center space-x-3">
                    <span className={`h-3 w-3 rounded-full ${USER_COLORS[owner]}`}></span>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">{owner}</h3>
                    {stats.carsSold > 0 && (
                      <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                        {stats.carsSold} sold
                      </Badge>
                    )}
                  </div>
                  
                  {stats.totalProfit !== 0 && (
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                      stats.totalProfit >= 0 
                        ? 'bg-success/10 text-success' 
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {stats.totalProfit >= 0 ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                      <span>{formatCurrency(Math.abs(stats.totalProfit))}</span>
                    </div>
                  )}
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <QuickStatsCard
                    title="Cars Sold"
                    value={stats.carsSold}
                    subtitle="This month"
                    icon={CarIcon}
                    colorScheme="primary"
                  />
                  
                  <QuickStatsCard
                    title="Total Profit"
                    value={formatCurrency(stats.totalProfit)}
                    subtitle="From sales"
                    icon={TrendingUp}
                    colorScheme={stats.totalProfit >= 0 ? "success" : "destructive"}
                    trend={stats.totalProfit > 0 ? "up" : stats.totalProfit < 0 ? "down" : "neutral"}
                  />
                  
                  <QuickStatsCard
                    title="Investment"
                    value={formatCurrency(stats.totalInvestment)}
                    subtitle="Purchases made"
                    icon={PoundSterling}
                    colorScheme="purple"
                  />
                  
                  <QuickStatsCard
                    title="Avg Profit"
                    value={stats.carsSold > 0 ? formatCurrency(stats.averageProfitPerCar) : '—'}
                    subtitle="Per car sold"
                    icon={Target}
                    colorScheme="warning"
                  />
                </div>

                {/* No Activity Message */}
                {stats.carsSold === 0 && stats.totalInvestment === 0 && (
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
                    <p className="text-muted-foreground text-center text-sm">
                      No activity recorded for {formatMonthYear(selectedDate)}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Summary Footer */}
      <Card className="border shadow-premium" style={{ backgroundColor: '#020818' }}>
        <div className="p-4 sm:p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              {formatMonthYear(selectedDate)} Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-blue-300">Total Cars Sold</p>
                <p className="font-bold text-lg text-white">
                  {monthlyStats.reduce((sum, { stats }) => sum + stats.carsSold, 0)}
                </p>
              </div>
              <div>
                <p className="text-blue-300">Total Profit</p>
                <p className="font-bold text-lg text-white">
                  {formatCurrency(monthlyStats.reduce((sum, { stats }) => sum + stats.totalProfit, 0))}
                </p>
              </div>
              <div>
                <p className="text-blue-300">Total Investment</p>
                <p className="font-bold text-lg text-white">
                  {formatCurrency(monthlyStats.reduce((sum, { stats }) => sum + stats.totalInvestment, 0))}
                </p>
              </div>
              <div>
                <p className="text-blue-300">Active Owners</p>
                <p className="font-bold text-lg text-white">
                  {monthlyStats.filter(({ stats }) => stats.carsSold > 0 || stats.totalInvestment > 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 
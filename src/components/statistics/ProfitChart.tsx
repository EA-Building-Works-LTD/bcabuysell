'use client';

import { useState } from 'react';
import { ICar } from '@/models/Car';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface ProfitChartProps {
  cars: ICar[];
}

export default function ProfitChart({ cars }: ProfitChartProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  
  // Calculate profit data
  const soldCars = cars.filter(car => car.status === 'sold' && car.soldPrice);
  
  // Calculate profits for each sold car
  const profitData = soldCars.map(car => {
    const totalRepairCost = car.repairs?.reduce((sum, repair) => sum + repair.cost, 0) || 0;
    const totalCost = car.purchasePrice + car.recoveryPrice + car.fuelCost + car.insuranceCost + totalRepairCost;
    const profit = car.soldPrice ? car.soldPrice - totalCost : 0;
    
    return {
      id: car._id,
      makeModel: car.makeModel,
      date: new Date(car.soldDate || car.purchaseDate),
      profit,
    };
  });
  
  // Sort by date for line chart
  profitData.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Prepare data for Chart.js
  const labels = profitData.map(item => 
    `${item.makeModel} (${item.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })})`
  );
  
  const profits = profitData.map(item => item.profit);
  
  // Calculate average profit
  const averageProfit = profitData.length > 0
    ? profitData.reduce((sum, item) => sum + item.profit, 0) / profitData.length
    : 0;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Chart.js options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Profit: ${formatCurrency(context.raw)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: number | string) {
            return formatCurrency(Number(value));
          },
        },
      },
    },
  };
  
  // Chart.js data
  const chartData = {
    labels,
    datasets: [
      {
        data: profits,
        backgroundColor: profits.map(profit => 
          profit >= 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'
        ),
        borderColor: profits.map(profit => 
          profit >= 0 ? 'rgb(22, 163, 74)' : 'rgb(220, 38, 38)'
        ),
        borderWidth: 1,
      },
    ],
  };
  
  if (profitData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No sold cars to display profit data</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex flex-col items-center mb-4 space-y-2">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Average Profit</p>
          <p className="text-lg font-bold">{formatCurrency(averageProfit)}</p>
        </div>
        <Tabs value={chartType} onValueChange={(value) => setChartType(value as 'bar' | 'line')} className="w-auto">
          <TabsList className="mx-auto">
            <TabsTrigger value="bar">Bar</TabsTrigger>
            <TabsTrigger value="line">Line</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="h-60 relative">
        {chartType === 'bar' ? (
          <Bar data={chartData} options={options} />
        ) : (
          <Line 
            data={{
              ...chartData,
              datasets: [{
                ...chartData.datasets[0],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3,
                fill: false,
                pointBackgroundColor: profits.map(profit => 
                  profit >= 0 ? 'rgb(22, 163, 74)' : 'rgb(220, 38, 38)'
                ),
              }]
            }} 
            options={options} 
          />
        )}
      </div>
    </div>
  );
} 
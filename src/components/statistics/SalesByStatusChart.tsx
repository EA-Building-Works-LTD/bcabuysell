'use client';

import { useState } from 'react';
import { ICar } from '@/models/Car';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie, Doughnut, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SalesByStatusChartProps {
  cars: ICar[];
}

export default function SalesByStatusChart({ cars }: SalesByStatusChartProps) {
  const [chartType, setChartType] = useState<'pie' | 'doughnut' | 'bar'>('doughnut');
  
  // Count cars by status
  const statusCounts = cars.reduce((acc, car) => {
    const status = car.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Define status colors and labels
  const statusConfig = {
    sold: { color: 'rgb(34, 197, 94)', bgColor: 'rgba(34, 197, 94, 0.6)', label: 'Sold' },
    available: { color: 'rgb(59, 130, 246)', bgColor: 'rgba(59, 130, 246, 0.6)', label: 'Available' },
    pending: { color: 'rgb(250, 204, 21)', bgColor: 'rgba(250, 204, 21, 0.6)', label: 'Pending' },
    repair: { color: 'rgb(239, 68, 68)', bgColor: 'rgba(239, 68, 68, 0.6)', label: 'In Repair' },
    unknown: { color: 'rgb(156, 163, 175)', bgColor: 'rgba(156, 163, 175, 0.6)', label: 'Unknown' },
  };
  
  // Create labels and data arrays for the chart
  const statuses = Object.keys(statusCounts);
  const labels = statuses.map(status => 
    statusConfig[status as keyof typeof statusConfig]?.label || status.charAt(0).toUpperCase() + status.slice(1)
  );
  const data = statuses.map(status => statusCounts[status]);
  const backgroundColors = statuses.map(status => 
    statusConfig[status as keyof typeof statusConfig]?.bgColor || 'rgba(156, 163, 175, 0.6)'
  );
  const borderColors = statuses.map(status => 
    statusConfig[status as keyof typeof statusConfig]?.color || 'rgb(156, 163, 175)'
  );
  
  // Chart.js data
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };
  
  // Chart.js options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw;
            const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };
  
  // Bar chart specific options
  const barOptions = {
    ...options,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: number | string) {
            return Number(value);
          },
        },
      },
    },
  };
  
  if (cars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No cars to display status data</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex flex-col items-center mb-4 space-y-2">
        <h3 className="text-lg font-medium">Inventory by Status</h3>
        <Tabs value={chartType} onValueChange={(value) => setChartType(value as 'pie' | 'doughnut' | 'bar')} className="w-auto">
          <TabsList className="mx-auto">
            <TabsTrigger value="doughnut">Doughnut</TabsTrigger>
            <TabsTrigger value="pie">Pie</TabsTrigger>
            <TabsTrigger value="bar">Bar</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="h-60 relative">
        {chartType === 'pie' ? (
          <Pie data={chartData} options={options} />
        ) : chartType === 'doughnut' ? (
          <Doughnut data={chartData} options={options} />
        ) : (
          <Bar data={chartData} options={barOptions} />
        )}
      </div>
    </div>
  );
} 
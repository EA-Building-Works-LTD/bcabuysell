'use client';

import { useMemo } from 'react';
import { ICar } from '@/models/Car';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface InventoryAgeChartProps {
  cars: ICar[];
}

export default function InventoryAgeChart({ cars }: InventoryAgeChartProps) {
  // Calculate inventory age for each car
  const inventoryData = useMemo(() => {
    const today = new Date();
    
    // Only include cars that are not sold
    const unsoldCars = cars.filter(car => car.status !== 'sold');
    
    return unsoldCars.map(car => {
      const purchaseDate = new Date(car.purchaseDate);
      const ageInDays = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: car._id,
        makeModel: car.makeModel,
        ageInDays,
        status: car.status,
      };
    });
  }, [cars]);
  
  // Group cars by age brackets
  const ageGroups = useMemo(() => {
    const groups = {
      '0-30 days': 0,
      '31-60 days': 0,
      '61-90 days': 0,
      '91-120 days': 0,
      '120+ days': 0,
    };
    
    inventoryData.forEach(car => {
      if (car.ageInDays <= 30) {
        groups['0-30 days']++;
      } else if (car.ageInDays <= 60) {
        groups['31-60 days']++;
      } else if (car.ageInDays <= 90) {
        groups['61-90 days']++;
      } else if (car.ageInDays <= 120) {
        groups['91-120 days']++;
      } else {
        groups['120+ days']++;
      }
    });
    
    return groups;
  }, [inventoryData]);
  
  // Prepare data for Chart.js
  const labels = Object.keys(ageGroups);
  const data = Object.values(ageGroups);
  
  // Define colors based on age (older inventory gets redder)
  const backgroundColors = [
    'rgba(34, 197, 94, 0.6)',  // 0-30: Green
    'rgba(250, 204, 21, 0.6)',  // 31-60: Yellow
    'rgba(249, 115, 22, 0.6)',  // 61-90: Orange
    'rgba(239, 68, 68, 0.6)',   // 91-120: Red
    'rgba(185, 28, 28, 0.6)',   // 120+: Dark Red
  ];
  
  const borderColors = [
    'rgb(22, 163, 74)',  // 0-30: Green
    'rgb(202, 138, 4)',  // 31-60: Yellow
    'rgb(194, 65, 12)',  // 61-90: Orange
    'rgb(220, 38, 38)',  // 91-120: Red
    'rgb(153, 27, 27)',  // 120+: Dark Red
  ];
  
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
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Cars: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: number | string) {
            return Number(value);
          },
          stepSize: 1,
        },
      },
    },
  };
  
  // Calculate average age
  const totalCars = inventoryData.length;
  const totalAgeDays = inventoryData.reduce((sum, car) => sum + car.ageInDays, 0);
  const averageAge = totalCars > 0 ? Math.floor(totalAgeDays / totalCars) : 0;
  
  // Check for cars over 90 days
  const carsOver90Days = inventoryData.filter(car => car.ageInDays > 90).length;
  const percentOver90 = totalCars > 0 ? (carsOver90Days / totalCars) * 100 : 0;
  
  if (inventoryData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No unsold cars to display inventory age</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium">Inventory Age</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Average age: <span className="font-medium">{averageAge} days</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm">
            <span className={`font-medium ${percentOver90 > 20 ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}`}>
              {percentOver90.toFixed(1)}%
            </span> 
            <span className="text-gray-500 dark:text-gray-400"> over 90 days</span>
          </p>
        </div>
      </div>
      
      <div className="h-60 relative">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
} 
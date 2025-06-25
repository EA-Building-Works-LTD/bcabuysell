'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface QuickStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  colorScheme: 'primary' | 'success' | 'warning' | 'destructive' | 'purple';
  badge?: string;
}

export default function QuickStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  colorScheme,
  badge
}: QuickStatsCardProps) {
  const colorSchemes = {
    primary: {
      container: 'border-gray-600',
      iconBg: 'bg-blue-500/20',
      icon: 'text-blue-400',
      title: 'text-blue-300',
      value: 'text-white',
      subtitle: 'text-blue-400'
    },
    success: {
      container: 'border-gray-600',
      iconBg: 'bg-success/20',
      icon: 'text-success',
      title: 'text-success',
      value: 'text-white',
      subtitle: 'text-success'
    },
    warning: {
      container: 'border-gray-600',
      iconBg: 'bg-warning/20',
      icon: 'text-warning',
      title: 'text-warning',
      value: 'text-white',
      subtitle: 'text-warning'
    },
    destructive: {
      container: 'border-gray-600',
      iconBg: 'bg-destructive/20',
      icon: 'text-destructive',
      title: 'text-destructive',
      value: 'text-white',
      subtitle: 'text-destructive'
    },
    purple: {
      container: 'border-gray-600',
      iconBg: 'bg-purple-600/20',
      icon: 'text-purple-400',
      title: 'text-purple-400',
      value: 'text-white',
      subtitle: 'text-purple-400'
    }
  };

  const colors = colorSchemes[colorScheme];

  return (
    <Card 
      className={`p-4 sm:p-5 border ${colors.container} transition-all duration-300 hover:shadow-premium group`}
      style={{ backgroundColor: '#020818' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2.5 rounded-xl ${colors.iconBg} group-hover:scale-105 transition-transform duration-200`}>
              <Icon className={`h-4 w-4 ${colors.icon}`} />
            </div>
            {badge && (
              <Badge variant="secondary" className="text-xs font-medium bg-muted/50">
                {badge}
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <p className={`text-sm font-semibold ${colors.title}`}>
              {title}
            </p>
            <p className={`text-xl sm:text-2xl font-bold ${colors.value} tracking-tight`}>
              {value}
            </p>
            {subtitle && (
              <p className={`text-xs ${colors.subtitle} font-medium`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {trend && trendValue && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            trend === 'up' 
              ? 'bg-success/10 text-success' 
              : trend === 'down' 
                ? 'bg-destructive/10 text-destructive' 
                : 'bg-muted/50 text-muted-foreground'
          }`}>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </Card>
  );
} 
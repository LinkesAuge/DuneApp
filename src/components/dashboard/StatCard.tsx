import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'indigo';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
    indigo: 'from-indigo-500 to-indigo-600'
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
    indigo: 'text-indigo-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-sand-200 p-2 hover:shadow-md transition-shadow">
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          <div className={`p-1 rounded bg-gradient-to-r ${colorClasses[color]}`}>
            <Icon size={12} className="text-white" />
          </div>
          {trend && (
            <span className={`text-xs font-medium ${
              trend.direction === 'up' ? 'text-green-600' : 
              trend.direction === 'down' ? 'text-red-600' : 
              'text-sand-600'
            }`}>
              {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.value}
            </span>
          )}
        </div>
        <p className="text-lg font-bold text-night-900 mb-0.5">{value}</p>
        <p className="text-xs font-medium text-sand-600 truncate">{title}</p>
        {subtitle && (
          <p className="text-xs text-sand-500 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard; 
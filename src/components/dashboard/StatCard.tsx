import React from 'react';
import { LucideIcon } from 'lucide-react';
import DiamondIcon from '../common/DiamondIcon';

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'indigo';
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend
}) => {
  const colorConfig = {
    blue: {
      icon: 'text-blue-400',
      trend: 'text-blue-300',
      bg: 'bg-gradient-to-b from-blue-600/10 via-blue-500/5 to-transparent',
      border: 'border-blue-400/30'
    },
    green: {
      icon: 'text-green-400',
      trend: 'text-green-300',
      bg: 'bg-gradient-to-b from-green-600/10 via-green-500/5 to-transparent',
      border: 'border-green-400/30'
    },
    orange: {
      icon: 'text-amber-400',
      trend: 'text-amber-300',
      bg: 'bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent',
      border: 'border-amber-400/30'
    },
    purple: {
      icon: 'text-purple-400',
      trend: 'text-purple-300',
      bg: 'bg-gradient-to-b from-purple-600/10 via-purple-500/5 to-transparent',
      border: 'border-purple-400/30'
    },
    indigo: {
      icon: 'text-indigo-400',
      trend: 'text-indigo-300',
      bg: 'bg-gradient-to-b from-indigo-600/10 via-indigo-500/5 to-transparent',
      border: 'border-indigo-400/30'
    }
  };

  const config = colorConfig[color];

  return (
    <div className="group relative">
      {/* Multi-layer background system */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
      <div className={`absolute inset-0 ${config.bg} rounded-lg`} />
      
      {/* Interactive purple overlay */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out bg-gradient-to-b from-violet-600/10 via-violet-700/5 to-transparent" />
      
      <div className={`relative p-2 rounded-lg border ${config.border} hover:border-amber-300/30 transition-all duration-300 flex flex-col justify-center text-center min-h-[80px]`}>
        {/* Icon with trend indicator positioned at top */}
        <div className="flex items-center justify-center gap-1 mb-1">
          <Icon size={12} className={config.icon} strokeWidth={1.5} />
          {trend && (
            <span className={`text-xs ${config.trend} font-light`}>
              {trend.value}
            </span>
          )}
        </div>
        
        {/* Value - larger and prominent */}
        <div className="text-lg font-light text-amber-200 tracking-wide mb-1">
          {value.toLocaleString()}
        </div>
        
        {/* Title */}
        <div className="text-xs text-amber-300/80 font-light tracking-wide mb-1"
             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
          {title}
        </div>
        
        {/* Subtitle */}
        {subtitle && (
          <div className="text-xs text-amber-300/60 font-light tracking-wide">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard; 
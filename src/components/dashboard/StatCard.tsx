import React from 'react';
import { LucideIcon } from 'lucide-react';

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
    },
    green: {
      icon: 'text-green-400',
      trend: 'text-green-300',
    },
    orange: {
      icon: 'text-amber-400',
      trend: 'text-amber-300',
    },
    purple: {
      icon: 'text-purple-400',
      trend: 'text-purple-300',
    },
    indigo: {
      icon: 'text-indigo-400',
      trend: 'text-indigo-300',
    },
  };

  // Octagonal clip path
  const octagonalClipPath = {
    clipPath: "polygon(15px 0%, calc(100% - 15px) 0%, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0% calc(100% - 15px), 0% 15px)"
  };

  return (
    <div 
      className="group relative transition-all duration-300 overflow-hidden p-2"
      style={octagonalClipPath}
      onMouseEnter={(e) => {
        // Purple overlay effect
        const purpleOverlay = e.currentTarget.querySelector('.purple-hover-overlay') as HTMLElement;
        if (purpleOverlay) {
          purpleOverlay.style.background = 'radial-gradient(circle at center, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.04) 70%, transparent 100%)';
        }
        
        // Text glow effects
        const titleElement = e.currentTarget.querySelector('.stat-title') as HTMLElement;
        if (titleElement) {
          titleElement.style.textShadow = '0 0 12px rgba(251, 191, 36, 0.8)';
        }
      }}
      onMouseLeave={(e) => {
        // Reset purple overlay
        const purpleOverlay = e.currentTarget.querySelector('.purple-hover-overlay') as HTMLElement;
        if (purpleOverlay) {
          purpleOverlay.style.background = 'radial-gradient(circle at center, rgba(139, 92, 246, 0) 0%, rgba(124, 58, 237, 0) 70%, transparent 100%)';
        }
        
        // Reset text glow effects
        const titleElement = e.currentTarget.querySelector('.stat-title') as HTMLElement;
        if (titleElement) {
          titleElement.style.textShadow = 'none';
        }
      }}
    >
      {/* Very dark background - almost black like in facelift1.jpg */}
      <div 
        className="absolute inset-0"
        style={{
          ...octagonalClipPath,
          backgroundColor: 'rgb(8, 15, 32)' // Very dark blue, almost black
        }}
      />
      
      {/* Elegant golden border - matching screenshot */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-amber-400/60 via-amber-300/75 to-amber-400/60 group-hover:from-amber-300/75 group-hover:via-amber-200/85 group-hover:to-amber-300/75 transition-all duration-300"
        style={{
          ...octagonalClipPath,
          padding: '2px' // Clean border thickness
        }}
      />
      
      {/* Inner dark background - clean and minimal */}
      <div 
        className="absolute inset-[2px]"
        style={{
          ...octagonalClipPath,
          backgroundColor: 'rgb(8, 12, 20)' // Dark purple-tinted background
        }}
      />
      
      {/* Very subtle sandy gradient overlay - barely visible */}
      <div 
        className="absolute inset-[2px]"
        style={{
          ...octagonalClipPath,
          background: 'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(194, 154, 108, 0.02) 50%, rgba(0, 0, 0, 0) 100%)'
        }}
      />
      
      {/* Purple hover overlay - elegant effect */}
      <div 
        className="purple-hover-overlay absolute inset-[2px] transition-all duration-300"
        style={{
          ...octagonalClipPath,
          background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0) 0%, rgba(124, 58, 237, 0) 70%, transparent 100%)'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Icon and trend indicator */}
        <div className="flex items-center justify-center mb-1">
          <Icon 
            className={`w-3 h-3 ${colorConfig[color].icon} group-hover:scale-110 transition-transform duration-300`} 
          />
          {trend && (
            <span className={`ml-1 text-xs ${colorConfig[color].trend} font-medium`}>
              {trend.direction === 'up' ? '↗' : '↘'} {trend.value}
            </span>
          )}
        </div>
        
        {/* Value */}
        <div className="text-2xl font-bold text-amber-200 group-hover:text-amber-50 mb-1 transition-all duration-300">
          {value.toLocaleString()}
        </div>
        
        {/* Title */}
        <div 
          className="stat-title text-xs text-amber-300 group-hover:text-amber-100 font-medium transition-all duration-300"
          style={{ 
            fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif"
          }}
        >
          {title}
        </div>
        
        {/* Subtitle */}
        {subtitle && (
          <div className="text-xs text-amber-400/70 group-hover:text-amber-200/80 mt-1 transition-all duration-300">
            {subtitle}
          </div>
        )}
      </div>
      
      {/* Drop shadow effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          ...octagonalClipPath,
          filter: 'drop-shadow(0 4px 12px rgba(139, 92, 246, 0.2))'
        }}
      />
    </div>
  );
};

export default StatCard; 
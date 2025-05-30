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

  // Octagonal clip path matching HexCard
  const octagonalClipPath = {
    clipPath: "polygon(15px 0%, calc(100% - 15px) 0%, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0% calc(100% - 15px), 0% 15px)"
  };

  return (
    <div 
      className="group relative overflow-hidden"
      style={octagonalClipPath}
      onMouseEnter={(e) => {
        // Purple overlay effect matching HexCard
        const purpleOverlay = e.currentTarget.querySelector('.absolute.inset-0\\.5.transition-all') as HTMLElement;
        if (purpleOverlay) {
          purpleOverlay.style.background = 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.08) 40%, transparent 70%)';
        }
        
        // Text glow effects
        const titleElement = e.currentTarget.querySelector('.text-lg') as HTMLElement;
        if (titleElement) {
          titleElement.style.textShadow = '0 0 8px rgba(251, 191, 36, 0.6)';
        }
      }}
      onMouseLeave={(e) => {
        // Reset purple overlay
        const purpleOverlay = e.currentTarget.querySelector('.absolute.inset-0\\.5.transition-all') as HTMLElement;
        if (purpleOverlay) {
          purpleOverlay.style.background = 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0) 0%, rgba(124, 58, 237, 0) 40%, transparent 70%)';
        }
        
        // Reset text glow
        const titleElement = e.currentTarget.querySelector('.text-lg') as HTMLElement;
        if (titleElement) {
          titleElement.style.textShadow = 'none';
        }
      }}
    >
      {/* Multi-layer background system with octagonal clip */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950"
        style={octagonalClipPath}
      />
      <div 
        className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60"
        style={octagonalClipPath}
      />
      <div 
        className={`absolute inset-0 ${config.bg}`}
        style={octagonalClipPath}
      />
      
      {/* Elegant border with octagonal clip */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r from-amber-400/55 via-amber-300/75 to-amber-400/55 group-hover:from-amber-300/75 group-hover:via-amber-200/85 group-hover:to-amber-300/75 transition-all duration-300`}
        style={{
          ...octagonalClipPath,
          padding: '1px'
        }}
      />
      
      {/* Inner background with octagonal clip */}
      <div 
        className="absolute inset-0.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950"
        style={octagonalClipPath}
      />
      
      {/* Interactive purple overlay matching HexCard */}
      <div 
        className="absolute inset-0.5 transition-all duration-300"
        style={{
          ...octagonalClipPath,
          background: 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0) 0%, rgba(124, 58, 237, 0) 40%, transparent 70%)'
        }}
      />
      
      <div className="relative p-2 flex flex-col justify-center text-center min-h-[80px]">
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
        <div className="text-lg font-light text-amber-200 tracking-wide mb-1 transition-all duration-300">
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
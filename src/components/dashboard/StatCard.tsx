import React from 'react';
import { LucideIcon } from 'lucide-react';
import DiamondIcon from '../common/DiamondIcon';

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
  // Convert traditional colors to Dune aesthetic while maintaining semantic meaning
  const getDuneIcon = (color: string, Icon: LucideIcon) => {
    return (
      <DiamondIcon
        icon={<Icon size={14} strokeWidth={1.5} />}
        size="sm"
        bgColor="bg-void-950"
        actualBorderColor="bg-gold-300"
        borderThickness={1}
        iconColor="text-gold-300"
      />
    );
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    const symbols = {
      up: '↗',
      down: '↘', 
      neutral: '→'
    };
    
    const colors = {
      up: 'text-amber-300',
      down: 'text-amber-400/70',
      neutral: 'text-amber-200/80'
    };

    return (
      <span className={`text-xs font-light tracking-wide ${colors[direction]}`}>
        {symbols[direction]} {trend?.value}
      </span>
    );
  };

  return (
    <div className="group relative">
      {/* Multi-layer background system */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
      
      {/* Interactive purple overlay for hover state */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out bg-gradient-to-b from-violet-600/10 via-violet-700/5 to-transparent" />
      
      {/* Content container */}
      <div className="relative p-4 rounded-lg border border-amber-400/20 hover:border-amber-300/30 transition-all duration-300">
        <div className="text-center space-y-2">
          {/* Icon and trend section */}
          <div className="flex items-center justify-center gap-3 mb-2">
            {getDuneIcon(color, Icon)}
            {trend && getTrendIcon(trend.direction)}
          </div>
          
          {/* Value display */}
          <div className="space-y-1">
            <p className="text-2xl font-light tracking-wide text-amber-200" 
               style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              {value}
            </p>
            
            <p className="text-xs font-light tracking-widest text-amber-300/80 uppercase">
              {title}
            </p>
            
            {subtitle && (
              <p className="text-xs font-thin tracking-wide text-amber-200/60">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard; 
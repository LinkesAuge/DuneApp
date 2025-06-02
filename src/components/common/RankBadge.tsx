import React from 'react';
import { Award } from 'lucide-react';
import { Rank } from '../../types/profile';

interface RankBadgeProps {
  rank: Rank;
  size?: 'xxs' | 'xs' | 'sm' | 'md';
  className?: string;
}

const RankBadge: React.FC<RankBadgeProps> = ({ 
  rank, 
  size = 'xxs', 
  className = '' 
}) => {
  const sizeClasses = {
    xxs: 'px-0.5 py-0 text-[10px]', // Extra small with tiny font
    xs: 'px-1 py-0.5 text-[11px]',   // Small with reduced font
    sm: 'px-1.5 py-0.5 text-xs',     // Original small
    md: 'px-2 py-1 text-sm'          // Medium
  };

  const iconSizes = {
    xxs: 8,   // Extra small icon
    xs: 9,    // Small icon
    sm: 12,   // Original small
    md: 14    // Medium
  };

  return (
    <span 
      className={`inline-flex items-center rounded font-medium border ${sizeClasses[size]} ${className}`}
      style={{ 
        backgroundColor: rank.color, // Use full color as defined in admin panel
        color: rank.text_color,      // Use exact text color from admin panel  
        borderColor: `${rank.color}60` // Slightly transparent border for definition
      }}
    >
      <Award 
        className="mr-1" 
        size={iconSizes[size]} 
        style={{ color: rank.text_color }} 
      />
      {rank.name}
    </span>
  );
};

export default RankBadge; 
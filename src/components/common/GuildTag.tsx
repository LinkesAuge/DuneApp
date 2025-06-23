import React from 'react';
import { Users } from 'lucide-react';

interface GuildTagProps {
  guildName: string;
  tagColor: string;
  tagTextColor: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const GuildTag: React.FC<GuildTagProps> = ({ 
  guildName, 
  tagColor, 
  tagTextColor, 
  size = 'sm',
  showIcon = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2 py-1', 
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14
  };

  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]} ${className}`}
      style={{ 
        backgroundColor: tagColor, 
        color: tagTextColor,
        border: `1px solid ${tagColor}40`
      }}
    >
      {showIcon && <Users size={iconSizes[size]} />}
      {guildName}
    </span>
  );
};

export default GuildTag; 
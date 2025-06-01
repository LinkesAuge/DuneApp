import React from 'react';
import { Link2, Package, FileText } from 'lucide-react';

interface LinkingButtonProps {
  direction: 'to_pois' | 'to_items' | 'to_schematics' | 'manage_links';
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

const LinkingButton: React.FC<LinkingButtonProps> = ({
  direction,
  onClick,
  disabled = false,
  className = '',
  size = 'sm'
}) => {
  const getButtonConfig = () => {
    switch (direction) {
      case 'to_pois':
        return {
          icon: Link2,
          title: 'Add POI Locations',
          hoverColor: 'hover:text-green-300'
        };
      case 'to_items':
        return {
          icon: Package,
          title: 'Link Items',
          hoverColor: 'hover:text-green-300'
        };
      case 'to_schematics':
        return {
          icon: FileText,
          title: 'Link Schematics',
          hoverColor: 'hover:text-cyan-300'
        };
      case 'manage_links':
        return {
          icon: Link2,
          title: 'Manage POI Links',
          hoverColor: 'hover:text-purple-300'
        };
      default:
        return {
          icon: Link2,
          title: 'Link',
          hoverColor: 'hover:text-purple-300'
        };
    }
  };

  const config = getButtonConfig();
  const Icon = config.icon;
  
  const baseClasses = `
    text-slate-400 ${config.hoverColor} hover:bg-slate-700/50 
    rounded transition-colors duration-200 
    disabled:opacity-50 disabled:cursor-not-allowed
  `.trim();
  
  const sizeClasses = size === 'sm' ? 'p-1.5' : 'p-2';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={config.title}
      className={`${baseClasses} ${sizeClasses} ${className}`}
    >
      <Icon className={iconSize} />
    </button>
  );
};

export default LinkingButton; 
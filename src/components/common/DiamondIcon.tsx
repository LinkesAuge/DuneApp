import React from 'react';

interface DiamondIconProps {
  icon?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  bgColor?: string; // e.g., 'bg-slate-950'
  actualBorderColor?: string; // e.g., 'bg-gold-300' (used as a background for the border layer)
  borderThickness?: number; // e.g., 2 (for 2px border on each side)
  iconColor?: string;
  className?: string;
  onClick?: () => void;
}

const DiamondIcon: React.FC<DiamondIconProps> = ({
  icon,
  size = 'md',
  bgColor = 'bg-slate-950',
  actualBorderColor = 'bg-gold-300', // This will be the background of the border layer
  borderThickness = 2, // Default to 2px border
  iconColor = 'text-gold-400',
  className = '',
  onClick,
}) => {
  const baseSizeClasses = {
    xs: { w: 32, h: 32 },
    sm: { w: 48, h: 48 },
    md: { w: 64, h: 64 },
    lg: { w: 80, h: 80 },
    xl: { w: 96, h: 96 },
  };

  const iconSizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  const diamondClipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';

  const selectedBaseSize = baseSizeClasses[size];

  const Component = onClick ? 'button' : 'div';

  // Define hover effects based on presence of onClick
  // Both versions now use scale-110 for visibility. Brightness differs slightly.
  const hoverEffectClasses = onClick 
    ? 'hover:scale-110 hover:brightness-125' 
    : 'hover:scale-110 hover:brightness-110';

  return (
    <Component
      className={`relative flex items-center justify-center transition-all duration-300 ease-in-out ${hoverEffectClasses} ${className}`}
      style={{ 
        width: `${selectedBaseSize.w}px`, 
        height: `${selectedBaseSize.h}px` 
      }}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {/* Border Layer - slightly larger, clipped, with border color as background */}
      <div
        className={`absolute inset-0 ${actualBorderColor}`}
        style={{
          clipPath: diamondClipPath,
        }}
      />

      {/* Content Layer - slightly smaller, clipped, with main bg color */}
      <div
        className={`absolute ${bgColor} flex items-center justify-center`}
        style={{
          width: `${selectedBaseSize.w - borderThickness * 2}px`,
          height: `${selectedBaseSize.h - borderThickness * 2}px`,
          top: `${borderThickness}px`,
          left: `${borderThickness}px`,
          clipPath: diamondClipPath,
        }}
      >
        {icon && (
          <div className={`${iconColor} ${iconSizeClasses[size]} flex items-center justify-center`}>
            {icon}
          </div>
        )}
      </div>
    </Component>
  );
};

export default DiamondIcon; 
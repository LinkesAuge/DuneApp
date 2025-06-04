import React from 'react';
import DiamondIcon from './DiamondIcon';

interface HexCardProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  variant?: 'primary' | 'secondary' | 'feature';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const HexCard: React.FC<HexCardProps> = ({ 
  children,
  icon,
  title,
  subtitle, 
  description,
  variant = 'primary', 
  size = 'md',
  className = '',
  onClick,
  hoverable = true
}) => {
  const baseClasses = `group relative transition-all duration-300 overflow-hidden ${onClick ? 'cursor-pointer' : ''}`;
  
  const sizeClasses = {
    sm: "p-4 min-h-[120px]",
    md: "p-6 min-h-[160px]", 
    lg: "p-8 min-h-[200px]"
  };

  // Clean octagonal clip path
  const octagonalClipPath = {
    clipPath: "polygon(25px 0%, calc(100% - 25px) 0%, 100% 25px, 100% calc(100% - 25px), calc(100% - 25px) 100%, 25px 100%, 0% calc(100% - 25px), 0% 25px)"
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'feature':
        return {
          background: 'from-slate-950 via-slate-900 to-slate-950',
          border: 'from-amber-400/70 via-amber-300/85 to-amber-400/70',
          borderHover: 'from-amber-300/85 via-amber-200/95 to-amber-300/85'
        };
      case 'secondary':
        return {
          background: 'from-slate-950 via-slate-900 to-slate-950',
          border: 'from-amber-400/65 via-amber-300/80 to-amber-400/65',
          borderHover: 'from-amber-300/80 via-amber-200/90 to-amber-300/80'
        };
      default: // primary
        return {
          background: 'from-slate-950 via-slate-900 to-slate-950',
          border: 'from-amber-400/60 via-amber-300/75 to-amber-400/60',
          borderHover: 'from-amber-300/75 via-amber-200/85 to-amber-300/75'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div 
      className={`${baseClasses} ${sizeClasses[size]} ${className}`}
      style={octagonalClipPath}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!hoverable) return;
        
        // Purple overlay effect
        const purpleOverlay = e.currentTarget.querySelector('.purple-hover-overlay') as HTMLElement;
        if (purpleOverlay) {
          purpleOverlay.style.background = 'radial-gradient(circle at center, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.04) 70%, transparent 100%)';
        }
        
        // Text glow effects
        const titleElement = e.currentTarget.querySelector('h3') as HTMLElement;
        if (titleElement) {
          titleElement.style.textShadow = '0 0 12px rgba(251, 191, 36, 0.8)';
        }
        
        // Underline animation with purple glow
        const underline = e.currentTarget.querySelector('.animated-underline') as HTMLElement;
        if (underline) {
          underline.style.width = '80%';
          underline.style.boxShadow = '0 0 12px rgba(139, 92, 246, 0.6)';
        }
      }}
      onMouseLeave={(e) => {
        if (!hoverable) return;
        
        // Reset purple overlay
        const purpleOverlay = e.currentTarget.querySelector('.purple-hover-overlay') as HTMLElement;
        if (purpleOverlay) {
          purpleOverlay.style.background = 'radial-gradient(circle at center, rgba(139, 92, 246, 0) 0%, rgba(124, 58, 237, 0) 70%, transparent 100%)';
        }
        
        // Reset text glow effects
        const titleElement = e.currentTarget.querySelector('h3') as HTMLElement;
        if (titleElement) {
          titleElement.style.textShadow = 'none';
        }
        
        // Reset underline animation
        const underline = e.currentTarget.querySelector('.animated-underline') as HTMLElement;
        if (underline) {
          underline.style.width = '0%';
          underline.style.boxShadow = '0 0 8px rgba(139, 92, 246, 0)';
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
        className={`absolute inset-0 bg-gradient-to-r ${styles.border} ${hoverable ? `group-hover:${styles.borderHover}` : ''} transition-all duration-300`}
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
      
      {/* Light purple overlay on hover - elegant effect */}
      {hoverable && (
        <div 
          className="purple-hover-overlay absolute inset-[2px] transition-all duration-300"
          style={{
            ...octagonalClipPath,
            background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0) 0%, rgba(124, 58, 237, 0) 70%, transparent 100%)'
          }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center">
        {children}
        
        {(icon || title || subtitle || description) && (
          <div className="text-center">
            {icon && (
              <div className="flex justify-center mb-3">
                <DiamondIcon 
                  icon={icon} 
                  size={size}
                  bgColor="bg-void-950"
                  actualBorderColor="bg-gold-300" 
                  borderThickness={1}
                  iconColor="text-gold-300"
                  className="group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            )}
            
            {title && (
              <h3 className="text-lg font-medium text-amber-200 group-hover:text-amber-50 mb-2 tracking-wide transition-all duration-300" 
                style={{ 
                  fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif"
                }}
              >
                {title}
              </h3>
            )}
            
            {subtitle && (
              <div className="text-sm text-amber-400/70 group-hover:text-amber-200 tracking-widest uppercase mb-2 transition-all duration-300">
                {subtitle}
              </div>
            )}
            
            {description && (
              <p className="text-amber-400/60 group-hover:text-amber-300/80 leading-relaxed font-light text-sm transition-all duration-300">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Animated underline - elegant purple effect */}
      {hoverable && (
        <div 
          className="animated-underline absolute bottom-4 h-0.5 bg-gradient-to-r from-transparent via-violet-400/0 to-transparent group-hover:via-violet-400/80 transition-all duration-700 ease-out"
          style={{
            clipPath: "polygon(20% 0%, 80% 0%, 80% 100%, 20% 100%)",
            width: '0%',
            left: '50%',
            transform: 'translateX(-50%)',
            boxShadow: '0 0 8px rgba(139, 92, 246, 0)'
          }}
        />
      )}
    </div>
  );
};

export default HexCard; 
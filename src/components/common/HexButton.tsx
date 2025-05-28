import React from 'react';
import { Link } from 'react-router-dom';

interface HexButtonProps {
  to?: string;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const HexButton: React.FC<HexButtonProps> = ({ 
  to, 
  onClick, 
  children, 
  icon, 
  variant = 'primary', 
  size = 'md',
  className = '' 
}) => {
  const baseClasses = "group relative inline-flex items-center justify-center transition-all duration-300 overflow-hidden";
  
  const sizeClasses = {
    sm: "h-12 px-6 min-w-[140px]",
    md: "h-16 px-8 min-w-[180px]", 
    lg: "h-20 px-12 min-w-[240px]"
  };
  
  const textSizeClasses = {
    sm: "text-sm",
    md: "text-lg", 
    lg: "text-xl"
  };

  // Back to hexagonal clip path for buttons
  const hexagonalClipPath = {
    clipPath: "polygon(20px 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 20px 100%, 0% 50%)"
  };

  const content = (
    <>
      {/* Dark blue to nearly black background - no whitish tint */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950"
        style={hexagonalClipPath}
      />
      
      {/* Bright sandy border glow effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-amber-400/70 via-amber-300/90 to-amber-400/70 group-hover:from-amber-300/90 group-hover:via-amber-200/100 group-hover:to-amber-300/90 transition-all duration-300"
        style={{
          ...hexagonalClipPath,
          padding: '1px'
        }}
      />
      
      {/* Inner dark background */}
      <div 
        className="absolute inset-0.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950"
        style={hexagonalClipPath}
      />
      
      {/* Light purple hover overlay - navbar style */}
      <div 
        className="absolute inset-0.5 transition-all duration-300"
        style={{
          ...hexagonalClipPath,
          background: 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0) 0%, rgba(124, 58, 237, 0) 40%, transparent 70%)'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex items-center space-x-3">
        {icon && (
          <span className="text-amber-300 group-hover:text-amber-100 transition-all duration-300 group-hover:drop-shadow-lg">
            {icon}
          </span>
        )}
        <span 
          className={`font-light uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${textSizeClasses[size]} ${
            variant === 'primary' 
              ? 'text-amber-200 group-hover:text-amber-50' 
              : 'text-amber-300 group-hover:text-amber-100'
          } group-hover:drop-shadow-lg`}
          style={{
            fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif"
          }}
        >
          {children}
        </span>
      </div>
      
      {/* Animated underline - navbar style with purple colors */}
      <div 
        className="absolute bottom-3 h-0.5 bg-gradient-to-r from-transparent via-violet-400/0 to-transparent group-hover:via-violet-400/90 transition-all duration-700 ease-out"
        style={{
          clipPath: "polygon(15% 0%, 85% 0%, 85% 100%, 15% 100%)",
          width: '0%',
          left: '50%',
          transform: 'translateX(-50%)',
          boxShadow: '0 0 8px rgba(139, 92, 246, 0)'
        }}
      />
    </>
  );

  const ButtonComponent = ({ children, className: buttonClassName, style, ...props }: any) => (
    <div 
      className={buttonClassName}
      style={style}
      onMouseEnter={(e) => {
        // Purple overlay effect
        const purpleOverlay = e.currentTarget.querySelector('.absolute.inset-0\\.5.transition-all') as HTMLElement;
        if (purpleOverlay) {
          purpleOverlay.style.background = 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.20) 0%, rgba(124, 58, 237, 0.12) 40%, transparent 70%)';
        }
        
        // Text glow effects
        const textElements = e.currentTarget.querySelectorAll('span');
        textElements.forEach((span: HTMLElement) => {
          span.style.textShadow = '0 0 12px rgba(251, 191, 36, 0.8)';
        });
        
        // Underline animation with purple glow
        const underline = e.currentTarget.querySelector('.absolute.bottom-3') as HTMLElement;
        if (underline) {
          underline.style.width = '70%';
          underline.style.boxShadow = '0 0 12px rgba(139, 92, 246, 0.6)';
        }
      }}
      onMouseLeave={(e) => {
        // Reset purple overlay
        const purpleOverlay = e.currentTarget.querySelector('.absolute.inset-0\\.5.transition-all') as HTMLElement;
        if (purpleOverlay) {
          purpleOverlay.style.background = 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0) 0%, rgba(124, 58, 237, 0) 40%, transparent 70%)';
        }
        
        // Reset text glow effects
        const textElements = e.currentTarget.querySelectorAll('span');
        textElements.forEach((span: HTMLElement) => {
          span.style.textShadow = 'none';
        });
        
        // Reset underline animation
        const underline = e.currentTarget.querySelector('.absolute.bottom-3') as HTMLElement;
        if (underline) {
          underline.style.width = '0%';
          underline.style.boxShadow = '0 0 8px rgba(139, 92, 246, 0)';
        }
      }}
      {...props}
    >
      {children}
    </div>
  );

  if (to) {
    return (
      <Link 
        to={to} 
        className={`${baseClasses} ${sizeClasses[size]} ${className}`}
        style={hexagonalClipPath}
      >
        <ButtonComponent
          className="w-full h-full flex items-center justify-center"
          style={{}}
        >
          {content}
        </ButtonComponent>
      </Link>
    );
  }

  return (
    <ButtonComponent
      as="button"
      onClick={onClick} 
      className={`${baseClasses} ${sizeClasses[size]} ${className}`}
      style={hexagonalClipPath}
    >
      {content}
    </ButtonComponent>
  );
};

export default HexButton; 
import React, { useRef, useState, useEffect } from 'react';
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
    sm: "h-12 px-8 min-w-[160px]",
    md: "h-16 px-10 min-w-[200px]", 
    lg: "h-20 px-16 min-w-[320px]"
  };
  
  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const textRef = useRef<HTMLSpanElement>(null);
  const [isMultiline, setIsMultiline] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      const hasWrapped = textRef.current.scrollHeight > textRef.current.clientHeight;
      if (hasWrapped !== isMultiline) {
        setIsMultiline(hasWrapped);
      }
    }
  }, [children, size, isMultiline]);

  let currentTextSizeClass = textSizeClasses[size];
  if (isMultiline) {
    if (size === 'lg') currentTextSizeClass = textSizeClasses.md;
    else if (size === 'md') currentTextSizeClass = textSizeClasses.sm;
    else if (size === 'sm') currentTextSizeClass = textSizeClasses.sm;
  }

  // Hexagonal clip path
  const hexagonalClipPath = {
    clipPath: "polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)"
  };

  const content = (
    <div 
      className={`${baseClasses} ${sizeClasses[size]} ${className}`}
      style={hexagonalClipPath}
      onClick={onClick}
      onMouseEnter={(e) => {
        // Purple overlay effect
        const purpleOverlay = e.currentTarget.querySelector('.purple-hover-overlay') as HTMLElement;
        if (purpleOverlay) {
          purpleOverlay.style.background = 'radial-gradient(circle at center, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.04) 70%, transparent 100%)';
        }
        
        // Text glow effects
        const textElement = e.currentTarget.querySelector('.button-text') as HTMLElement;
        if (textElement) {
          textElement.style.textShadow = '0 0 12px rgba(251, 191, 36, 0.8)';
        }
      }}
      onMouseLeave={(e) => {
        // Reset purple overlay
        const purpleOverlay = e.currentTarget.querySelector('.purple-hover-overlay') as HTMLElement;
        if (purpleOverlay) {
          purpleOverlay.style.background = 'radial-gradient(circle at center, rgba(139, 92, 246, 0) 0%, rgba(124, 58, 237, 0) 70%, transparent 100%)';
        }
        
        // Reset text glow effects
        const textElement = e.currentTarget.querySelector('.button-text') as HTMLElement;
        if (textElement) {
          textElement.style.textShadow = 'none';
        }
      }}
    >
      {/* Very dark background - almost black like in facelift1.jpg */}
      <div 
        className="absolute inset-0"
        style={{
          ...hexagonalClipPath,
          backgroundColor: 'rgb(8, 15, 32)' // Very dark blue, almost black
        }}
      />
      
      {/* Elegant golden border - matching screenshot */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-amber-400/60 via-amber-300/75 to-amber-400/60 group-hover:from-amber-300/75 group-hover:via-amber-200/85 group-hover:to-amber-300/75 transition-all duration-300"
        style={{
          ...hexagonalClipPath,
          padding: '2px' // Clean border thickness
        }}
      />
      
      {/* Inner dark background - clean and minimal */}
      <div 
        className="absolute inset-[2px]"
        style={{
          ...hexagonalClipPath,
          backgroundColor: 'rgb(8, 12, 20)' // Dark purple-tinted background
        }}
      />
      
      {/* Very subtle sandy gradient overlay - barely visible */}
      <div 
        className="absolute inset-[2px]"
        style={{
          ...hexagonalClipPath,
          background: 'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(194, 154, 108, 0.02) 50%, rgba(0, 0, 0, 0) 100%)'
        }}
      />
      
      {/* Purple hover overlay - elegant effect */}
      <div 
        className="purple-hover-overlay absolute inset-[2px] transition-all duration-300"
        style={{
          ...hexagonalClipPath,
          background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0) 0%, rgba(124, 58, 237, 0) 70%, transparent 100%)'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center space-x-2">
        {icon && (
          <div className="text-amber-300 group-hover:text-amber-100 transition-colors duration-300">
            {icon}
          </div>
        )}
        <span 
          className={`button-text font-medium text-amber-200 group-hover:text-amber-50 tracking-wide transition-all duration-300 ${textSizeClasses[size]}`}
          style={{ 
            fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif"
          }}
        >
          {children}
        </span>
      </div>
      
      {/* Drop shadow effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          ...hexagonalClipPath,
          filter: 'drop-shadow(0 8px 24px rgba(139, 92, 246, 0.2))'
        }}
      />
    </div>
  );

  return to ? (
    <Link to={to} className="inline-block">
      {content}
    </Link>
  ) : (
    content
  );
};

export default HexButton; 
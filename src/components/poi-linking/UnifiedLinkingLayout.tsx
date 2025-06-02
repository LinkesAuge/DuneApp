import React from 'react';

interface UnifiedLinkingLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const UnifiedLinkingLayout: React.FC<UnifiedLinkingLayoutProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 ${className}`}>
      {children}
    </div>
  );
};

export default UnifiedLinkingLayout; 
import React from 'react';

interface ItemsSchematicsLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const ItemsSchematicsLayout: React.FC<ItemsSchematicsLayoutProps> = ({
  children,
  title,
  subtitle
}) => {
  return (
    <div className="min-h-screen">
      {/* Main background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(/images/main-bg.jpg)` }}
      />
      
      {/* Content with clean background */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-light tracking-[0.2em] text-amber-200 mb-2"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-amber-300/80 font-light tracking-wide"
                 style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                {subtitle}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent rounded-lg" />
            
            <div className="relative rounded-lg border border-amber-400/20">
              <div className="p-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemsSchematicsLayout; 
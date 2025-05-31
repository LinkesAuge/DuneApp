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
    <div className="min-h-screen bg-gradient-to-b from-slate-950/95 to-slate-900/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light text-amber-100 tracking-wider mb-2"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-amber-200/80 font-light tracking-wide">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="bg-slate-900/50 border border-slate-700/30 backdrop-blur-sm">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemsSchematicsLayout; 
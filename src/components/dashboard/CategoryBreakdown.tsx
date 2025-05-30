import React from 'react';

interface CategoryData {
  name: string;
  count: number;
  icon: string;
  color: string;
}

interface CategoryBreakdownProps {
  categories: CategoryData[];
  total: number;
  title: string;
  theme: 'desert' | 'basin';
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ 
  categories, 
  total, 
  title,
  theme 
}) => {
  const themeColors = {
    desert: {
      primary: 'text-amber-200',
      secondary: 'text-amber-300',
      background: 'bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent',
      border: 'border-amber-400/30',
      progressBg: 'bg-slate-800/60',
      progressFill: 'bg-gradient-to-r from-amber-500 to-amber-400'
    },
    basin: {
      primary: 'text-blue-200',
      secondary: 'text-blue-300',
      background: 'bg-gradient-to-b from-blue-600/10 via-blue-500/5 to-transparent',
      border: 'border-blue-400/30',
      progressBg: 'bg-slate-800/60',
      progressFill: 'bg-gradient-to-r from-blue-500 to-blue-400'
    }
  };

  const colors = themeColors[theme];

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-lg" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
      <div className={`absolute inset-0 ${colors.background} rounded-lg`} />
      
      <div className={`relative p-3 rounded-lg border ${colors.border}`}>
        <h4 className={`text-xs font-light tracking-wide ${colors.primary} mb-2`}
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
          {title}
        </h4>
        
        <div className="space-y-2">
          {categories.map((category) => {
            const percentage = total > 0 ? (category.count / total) * 100 : 0;
            
            return (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs">{category.icon}</span>
                  <span className="text-xs text-amber-300/80 font-light tracking-wide flex-1 truncate">
                    {category.name}
                  </span>
                  <span className={`text-xs font-light ${colors.secondary} min-w-6 text-right tracking-wide`}>
                    {category.count}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="ml-2 w-12">
                  <div className={`h-1 ${colors.progressBg} rounded-full overflow-hidden`}>
                    <div 
                      className={`h-full ${colors.progressFill} rounded-full transition-all duration-300 ease-out`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          
          {categories.length === 0 && (
            <p className="text-xs text-amber-300/60 text-center py-2 font-light tracking-wide">
              No data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryBreakdown; 
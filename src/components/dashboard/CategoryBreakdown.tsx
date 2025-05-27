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
      primary: 'text-orange-600',
      secondary: 'text-orange-500',
      background: 'bg-orange-50',
      progressBg: 'bg-orange-100',
      progressFill: 'bg-orange-500'
    },
    basin: {
      primary: 'text-blue-600',
      secondary: 'text-blue-500', 
      background: 'bg-blue-50',
      progressBg: 'bg-blue-100',
      progressFill: 'bg-blue-500'
    }
  };

  const colors = themeColors[theme];

  return (
    <div className={`${colors.background} rounded-lg p-2`}>
      <h4 className={`text-xs font-semibold ${colors.primary} mb-2`}>
        {title}
      </h4>
      
      <div className="space-y-1">
        {categories.map((category) => {
          const percentage = total > 0 ? (category.count / total) * 100 : 0;
          
          return (
            <div key={category.name} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-1">
                <span className="text-xs">{category.icon}</span>
                <span className="text-xs text-night-700 flex-1 truncate">
                  {category.name}
                </span>
                <span className={`text-xs font-medium ${colors.secondary} min-w-6 text-right`}>
                  {category.count}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="ml-1.5 w-12">
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
          <p className="text-xs text-sand-500 text-center py-1">
            No data available
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoryBreakdown; 
import React from 'react';
import { Package, FileText } from 'lucide-react';

// Import types
type ActiveView = 'items' | 'schematics';

interface ItemsSchematicsHeaderProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  itemCount: number;
  schematicCount: number;
}

const ViewToggleButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  count?: number;
}> = ({ active, onClick, icon, children, count }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-3 px-6 py-3 text-lg font-light rounded-lg transition-all duration-200
      ${active 
        ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40' 
        : 'text-amber-300/70 hover:text-amber-200 hover:bg-amber-500/10 border border-transparent'
      }
    `}
    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
  >
    <span className={`${active ? 'text-amber-200' : 'text-amber-300/70'}`}>
      {icon}
    </span>
    <span className="tracking-wide">{children}</span>
    {count !== undefined && (
      <span className={`text-sm px-2 py-1 rounded-full font-light ${
        active 
          ? 'bg-amber-400/20 text-amber-300' 
          : 'bg-slate-700/50 text-amber-300/60'
      }`}>
        {count}
      </span>
    )}
  </button>
);

const ItemsSchematicsHeader: React.FC<ItemsSchematicsHeaderProps> = ({
  activeView,
  onViewChange,
  itemCount,
  schematicCount,
}) => {

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent" />
      
      <div className="relative border-b border-amber-400/20">
        <div className="max-w-full mx-auto px-6 py-4">
          {/* Navigation Tabs */}
          <div className="flex items-center justify-center gap-4">
            <ViewToggleButton
              active={activeView === 'items'}
              onClick={() => onViewChange('items')}
              icon={<Package className="w-5 h-5" />}
              count={itemCount}
            >
              Items
            </ViewToggleButton>
            
            <ViewToggleButton
              active={activeView === 'schematics'}
              onClick={() => onViewChange('schematics')}
              icon={<FileText className="w-5 h-5" />}
              count={schematicCount}
            >
              Schematics
            </ViewToggleButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemsSchematicsHeader; 
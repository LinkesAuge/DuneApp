import React from 'react';
import { List, Grid, Map } from 'lucide-react';

export type ViewMode = 'list' | 'grid' | 'map';

interface ViewModeOption {
  id: ViewMode;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  title?: string;
}

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
  viewMode,
  onViewModeChange,
  className = ''
}) => {
  const modes: ViewModeOption[] = [
    {
      id: 'grid',
      label: 'Grid',
      icon: <Grid size={14} />
    },
    {
      id: 'list',
      label: 'List',
      icon: <List size={14} />
    },
    {
      id: 'map',
      label: 'Map',
      icon: <Map size={14} />
    }
  ];

  return (
    <div className={`flex bg-slate-800 rounded-lg p-1 ${className}`}>
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onViewModeChange(mode.id)}
          disabled={mode.disabled}
          title={mode.title}
          className={`py-1 px-2 text-xs rounded transition-all duration-200 flex items-center justify-center min-w-[32px] ${
            viewMode === mode.id 
              ? 'dune-button-primary shadow-lg' 
              : 'dune-button-secondary hover:bg-slate-600'
          } ${mode.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {mode.icon}
        </button>
      ))}
    </div>
  );
};

export default ViewModeSelector; 
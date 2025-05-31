import React from 'react';
import { Settings, Database, Layers, Wrench, Target, Shield } from 'lucide-react';
import DiamondIcon from '../common/DiamondIcon';

export type SystemBuilderTab = 'categories' | 'types' | 'fields' | 'tiers' | 'defaults';

interface SystemBuilderLayoutProps {
  activeTab: SystemBuilderTab;
  onTabChange: (tab: SystemBuilderTab) => void;
  children: React.ReactNode;
}

const SystemBuilderLayout: React.FC<SystemBuilderLayoutProps> = ({
  activeTab,
  onTabChange,
  children
}) => {
  const tabs = [
    { 
      id: 'categories' as const, 
      label: 'Categories', 
      icon: <Database size={16} strokeWidth={1.5} />,
      description: 'Manage item and schematic categories'
    },
    { 
      id: 'types' as const, 
      label: 'Types & SubTypes', 
      icon: <Layers size={16} strokeWidth={1.5} />,
      description: 'Organize hierarchical type structures'
    },
    { 
      id: 'fields' as const, 
      label: 'Dynamic Fields', 
      icon: <Wrench size={16} strokeWidth={1.5} />,
      description: 'Configure custom data fields'
    },
    { 
      id: 'tiers' as const, 
      label: 'Tier Management', 
      icon: <Target size={16} strokeWidth={1.5} />,
      description: 'Manage technology tiers'
    },
    { 
      id: 'defaults' as const, 
      label: 'Default Rules', 
      icon: <Settings size={16} strokeWidth={1.5} />,
      description: 'Configure automatic POI assignments'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative p-4 rounded-lg border border-gold-300/30 backdrop-blur-md"
           style={{ backgroundColor: 'rgba(42, 36, 56, 0.9)' }}>
        <div className="flex items-center gap-4">
          <DiamondIcon
            icon={<Shield size={20} strokeWidth={1.5} />}
            size="lg"
            bgColor="bg-void-950"
            actualBorderColor="bg-gold-300"
            borderThickness={2}
            iconColor="text-gold-300"
          />
          <div>
            <h2 className="text-2xl font-light text-gold-300 mb-1"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              SYSTEM BUILDER
            </h2>
            <p className="text-amber-200/80 text-sm font-light tracking-wide"
               style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Configure Items & Schematics database structure
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="relative p-2 rounded-lg border border-gold-300/30 backdrop-blur-md"
           style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
        <nav className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                group/tab relative flex-1 px-4 py-3 transition-all duration-500 ease-out rounded-md
                ${activeTab === tab.id ? 'z-10' : ''}
              `}
              title={tab.description}
            >
              {/* Enhanced background layers */}
              <div className={`absolute inset-0 rounded-md transition-all duration-500 ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-gold-300/20 via-amber-200/25 to-gold-300/20' 
                  : 'bg-gradient-to-r from-transparent via-transparent to-transparent group-hover/tab:from-gold-300/10 group-hover/tab:via-amber-200/15 group-hover/tab:to-gold-300/10'
              }`} />
              
              {/* Advanced purple overlay for hover */}
              <div 
                className={`absolute inset-0 rounded-md transition-all duration-700 opacity-0 group-hover/tab:opacity-100 ${
                  activeTab === tab.id ? 'opacity-30' : ''
                }`}
                style={{
                  background: 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.1) 40%, transparent 70%)'
                }}
              />
              
              {/* Enhanced border */}
              <div className={`absolute inset-0 border rounded-md transition-all duration-500 ${
                activeTab === tab.id 
                  ? 'border-gold-300/70 shadow-md shadow-gold-300/20' 
                  : 'border-transparent group-hover/tab:border-gold-300/40'
                }`} />
              
              {/* Content with enhanced typography */}
              <div className={`relative flex items-center justify-center space-x-2 transition-all duration-500 ${
                activeTab === tab.id 
                  ? 'text-gold-300 transform scale-105' 
                  : 'text-amber-200/70 group-hover/tab:text-gold-300 group-hover/tab:transform group-hover/tab:scale-102'
              }`}>
                <DiamondIcon
                  icon={tab.icon}
                  size="sm"
                  bgColor={activeTab === tab.id ? "bg-gold-300/20" : "bg-transparent"}
                  actualBorderColor={activeTab === tab.id ? "bg-gold-300" : "bg-amber-200/50"}
                  borderThickness={1}
                  iconColor={activeTab === tab.id ? "text-gold-300" : "text-amber-200/70"}
                />
                <span className="text-xs font-light tracking-[0.1em]"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  {tab.label.toUpperCase()}
                </span>
              </div>
              
              {/* Expanding underline with gradient effect */}
              <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 transition-all duration-700 ease-out ${
                activeTab === tab.id 
                  ? 'w-4/5 bg-gradient-to-r from-transparent via-gold-300 to-transparent shadow-sm shadow-gold-300/50' 
                  : 'w-0 group-hover/tab:w-3/5 bg-gradient-to-r from-transparent via-gold-300/70 to-transparent'
              }`} />
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="relative p-8 rounded-lg border border-gold-300/30 backdrop-blur-md min-h-[600px]"
           style={{ backgroundColor: 'rgba(42, 36, 56, 0.9)' }}>
        {children}
      </div>
    </div>
  );
};

export default SystemBuilderLayout; 
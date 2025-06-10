import React, { useState } from 'react';
import { Poi, PoiType } from '../../types';
import { ChevronDown, ChevronUp, Plus, Settings, Eye, EyeOff, Filter } from 'lucide-react';

interface PoiControlPanelProps {
  pois: Poi[];
  poiTypes: PoiType[];

  selectedPoiTypes: string[];
  onTypeToggle: (typeId: string) => void;
  onCategoryToggle: (category: string, checked: boolean) => void;
  onToggleAllPois: () => void;
  onCustomPoiTypeCreated?: (newPoiType: PoiType) => void;
  onCustomPoiTypeDeleted?: (poiTypeId: string) => void;
  onCustomPoiTypeUpdated?: (updatedPoiType: PoiType) => void;
  showCreatePoiButton?: boolean;
  onCreatePoiClick?: () => void;
  compactMode?: boolean;
  userCreatedPoiTypes?: PoiType[];
}

const PoiControlPanel: React.FC<PoiControlPanelProps> = ({
  pois,
  poiTypes,

  selectedPoiTypes,
  onTypeToggle,
  onCategoryToggle,
  onToggleAllPois,
  onCustomPoiTypeCreated,
  onCustomPoiTypeDeleted,
  onCustomPoiTypeUpdated,
  showCreatePoiButton = false,
  onCreatePoiClick,
  compactMode = false,
  userCreatedPoiTypes = []
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const [editingPoiType, setEditingPoiType] = useState<PoiType | null>(null);

  // Helper functions
  const isIconUrl = (icon: string): boolean => {
    return icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('data:');
  };

  const getDisplayImageUrl = (icon: string): string => {
    if (icon.startsWith('http') || icon.startsWith('/')) {
      return icon;
    }
    return icon;
  };

  // Group POI types by category
  const typesByCategory = poiTypes.reduce((acc, type) => {
    const category = type.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(type);
    return acc;
  }, {} as Record<string, PoiType[]>);

  const categories = Object.keys(typesByCategory).sort();

  // Toggle section collapse
  const toggleSection = (section: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Check if category is visible (all types in category are selected)
  const isCategoryVisible = (category: string) => {
    const categoryTypes = typesByCategory[category];
    return categoryTypes.some(type => selectedPoiTypes.includes(type.id));
  };

  // Render category section
  const renderCategorySection = (category: string) => {
    const categoryTypes = typesByCategory[category].sort((a, b) => a.name.localeCompare(b.name));
    const categoryVisible = isCategoryVisible(category);
    const isCollapsed = collapsedSections.has(category);

    return (
      <div key={category} className={`border border-slate-600/40 rounded-lg overflow-hidden ${compactMode ? 'mb-2' : 'mb-3'}`}>
        {/* Category Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-800/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-700/20 via-transparent to-slate-800/30" />
          
          <div className="relative z-10 border-b border-slate-600/40 px-3 py-2 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={categoryVisible}
                  onChange={(e) => onCategoryToggle(category, e.target.checked)}
                  className="rounded border-slate-500/50 text-amber-500 focus:ring-amber-500/30 bg-slate-800/60"
                />
                <span className="ml-2 text-sm font-light text-amber-200 capitalize group-hover:text-amber-100 transition-colors tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  {category}
                </span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-300/70 font-light px-2 py-1 bg-slate-700/40 rounded border border-slate-600/30">
                  {categoryTypes.length}
                </span>
                <button
                  onClick={() => toggleSection(category)}
                  className="text-amber-300/70 hover:text-amber-200 transition-colors"
                >
                  {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Individual POI Types in Category */}
        {!isCollapsed && (
          <div className={`bg-slate-900/40 ${compactMode ? 'p-2 space-y-0' : 'p-3 space-y-0'}`}>
            {categoryTypes.map(type => {
              const typePoiCount = pois.filter(poi => poi.poi_type_id === type.id).length;
              const isTypeSelected = selectedPoiTypes.includes(type.id);
              
              return (
                <label 
                  key={type.id} 
                  className={`flex items-center justify-between cursor-pointer group px-2 py-1 rounded transition-all relative ${
                    isTypeSelected 
                      ? 'hover:bg-slate-700/30' 
                      : 'opacity-60 hover:opacity-80 hover:bg-slate-800/20'
                  }`}
                >
                  {/* Subtle background for selected items */}
                  {isTypeSelected && (
                    <div className="absolute inset-0 bg-slate-700/20 rounded" />
                  )}
                  
                  <div className="flex items-center relative z-10">
                    <input
                      type="checkbox"
                      checked={isTypeSelected}
                      onChange={() => onTypeToggle(type.id)}
                      className="rounded border-slate-500/50 text-amber-500 focus:ring-amber-500/30 bg-slate-800/60 w-3 h-3"
                    />
                    
                    {/* Enhanced POI Type Icon - Bigger without background shape */}
                    <div className="ml-3 mr-2 flex items-center justify-center flex-shrink-0">
                      {isIconUrl(type.icon) ? (
                        <img
                          src={getDisplayImageUrl(type.icon)}
                          alt={type.name}
                          className="w-7 h-7 object-contain"
                          style={{
                            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))'
                          }}
                        />
                      ) : (
                        <span 
                          className="text-xl leading-none font-medium"
                          style={{ 
                            color: type.color,
                            textShadow: '0 1px 1px rgba(0,0,0,0.2)'
                          }}
                        >
                          {type.icon}
                        </span>
                      )}
                    </div>
                    
                    <span className={`text-xs transition-colors font-light tracking-wide ${
                      isTypeSelected 
                        ? 'text-amber-200 group-hover:text-amber-100' 
                        : 'text-amber-200/70 group-hover:text-amber-200'
                    }`} style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      {type.name}
                    </span>
                  </div>
                  
                  {/* Right-aligned count */}
                  <span className={`text-xs relative z-10 px-2 py-1 rounded border ml-auto ${
                    isTypeSelected 
                      ? 'text-amber-300 bg-slate-700/40 border-slate-600/40' 
                      : 'text-amber-300/50 bg-slate-800/30 border-slate-600/30'
                  }`}>
                    {typePoiCount}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-slate-900/95 border-r border-slate-800 ${compactMode ? 'w-[26rem]' : 'w-[30rem]'} relative transition-all duration-200`}>
      {/* Multi-layer background system */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-800/60" />
      <div className="absolute inset-0 bg-gradient-to-br from-void-950/20 via-transparent to-slate-900/40" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full backdrop-blur-sm border-r border-amber-400/20">
        <div className="sticky top-0 z-10 border-b border-amber-400/20">
          {/* Enhanced background for header */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-900/90 to-slate-900/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-void-950/30 via-transparent to-slate-900/40" />
          
          <div className="relative z-10 px-6 py-5 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-light text-amber-200 tracking-wide ${compactMode ? 'text-sm' : 'text-base'}`} style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>POI Controls</h3>
              <div className="flex gap-2">
                {showCreatePoiButton && onCreatePoiClick && (
                  <button
                    onClick={onCreatePoiClick}
                    className="btn btn-sm btn-primary transition-all duration-300 hover:shadow-lg"
                    title="Add POI"
                  >
                    <Plus size={16} />
                  </button>
                )}
                {onCustomPoiTypeCreated && (
                  <div className="relative group">
                    <button
                      onClick={() => {/* Custom POI creation removed */}}
                      disabled={userCreatedPoiTypes.length >= 5}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        userCreatedPoiTypes.length >= 5
                          ? 'bg-slate-700/60 text-amber-200/50 border border-slate-600/50 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-900 hover:from-amber-500 hover:to-amber-400 border border-amber-500 hover:border-amber-400 shadow-lg hover:shadow-xl'
                      }`}
                      title={userCreatedPoiTypes.length >= 5 ? 'Maximum 5 custom POI types allowed' : 'Create custom POI type'}
                    >
                      <Plus size={16} />
                    </button>
                    
                    {/* Enhanced Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-[99999]">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
                        <div className="relative z-10 bg-slate-950/90 text-amber-200 text-xs px-3 py-2 rounded-lg border border-amber-400/30 whitespace-nowrap backdrop-blur-sm">
                          {userCreatedPoiTypes.length >= 5 ? 'Max 5 custom types' : 'Create custom POI type'}
                        </div>
                        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-amber-400/30"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Toggle All Button */}
            <div className="relative overflow-hidden rounded-lg mb-4">
              <div className="absolute inset-0 bg-slate-800/30" />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-700/20 via-transparent to-slate-800/30" />
              
              <div className="relative z-10 border border-slate-600/40 backdrop-blur-sm">
                <button
                  onClick={onToggleAllPois}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between transition-all duration-300 hover:bg-slate-700/20 group`}
                >
                  <div className="flex items-center">
                    <Filter className="text-amber-400 mr-3" size={18} />
                    <span className="font-light text-amber-200 tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      {selectedPoiTypes.length === poiTypes.length ? 'Hide All POIs' : 'Show All POIs'}
                    </span>
                  </div>
                  <span className="text-xs text-amber-300/70 px-2 py-1 bg-slate-700/40 rounded border border-slate-600/30 group-hover:bg-slate-700/50 transition-all duration-300">
                    {pois.length}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* POI Types by Category */}
        <div className="flex-1 overflow-y-auto">
          {categories.map(renderCategorySection)}
        </div>
      </div>

    </div>
  );
};

export default PoiControlPanel; 
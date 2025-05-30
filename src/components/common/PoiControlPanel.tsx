import React, { useState } from 'react';
import { Poi, PoiType, CustomIcon } from '../../types';
import { ChevronDown, ChevronUp, Plus, Settings, Eye, EyeOff } from 'lucide-react';
import CustomPoiTypeModal from '../hagga-basin/CustomPoiTypeModal';

interface PoiControlPanelProps {
  pois: Poi[];
  poiTypes: PoiType[];
  customIcons: CustomIcon[];
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
  customIcons,
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
  const [showCustomPoiTypeModal, setShowCustomPoiTypeModal] = useState(false);
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
      <div key={category} className={`border border-sand-200 rounded-lg overflow-hidden ${compactMode ? 'mb-2' : 'mb-3'}`}>
        {/* Category Header */}
        <div className="bg-sand-100 border-b border-sand-200 px-3 py-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={categoryVisible}
                onChange={(e) => onCategoryToggle(category, e.target.checked)}
                className="rounded border-sand-300 text-spice-600 focus:ring-spice-500"
              />
              <span className="ml-2 text-sm font-semibold text-sand-900 capitalize group-hover:text-spice-700 transition-colors">
                {category}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-sand-600 font-medium">
                {categoryTypes.length}
              </span>
              <button
                onClick={() => toggleSection(category)}
                className="text-sand-500 hover:text-sand-700 transition-colors"
              >
                {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Individual POI Types in Category - Reduced spacing */}
        {!isCollapsed && (
          <div className={`bg-white ${compactMode ? 'p-2 space-y-0' : 'p-3 space-y-0'}`}>
            {categoryTypes.map(type => {
              const typePoiCount = pois.filter(poi => poi.poi_type_id === type.id).length;
              const isTypeSelected = selectedPoiTypes.includes(type.id);
              
              return (
                <label 
                  key={type.id} 
                  className={`flex items-center justify-between cursor-pointer group px-2 py-0.5 rounded transition-all ${
                    isTypeSelected 
                      ? 'hover:bg-spice-50' 
                      : 'opacity-60 hover:opacity-80 hover:bg-sand-50'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isTypeSelected}
                      onChange={() => onTypeToggle(type.id)}
                      className="rounded border-sand-300 text-spice-600 focus:ring-spice-500 w-3 h-3"
                    />
                    
                    {/* POI Type Icon */}
                    <div 
                      className="w-10 h-10 rounded flex items-center justify-center ml-2 mr-0.5 flex-shrink-0"
                      style={{
                        backgroundColor: type.icon_has_transparent_background && isIconUrl(type.icon) 
                          ? 'transparent' 
                          : type.color
                      }}
                    >
                      {isIconUrl(type.icon) ? (
                        <img
                          src={getDisplayImageUrl(type.icon)}
                          alt={type.name}
                          className="w-6 h-6 object-contain"
                          style={{
                            filter: type.icon_has_transparent_background ? 'none' : 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))'
                          }}
                        />
                      ) : (
                        <span 
                          className="text-base leading-none font-medium"
                          style={{ 
                            color: type.icon_has_transparent_background ? type.color : 'white',
                            textShadow: type.icon_has_transparent_background ? '0 1px 1px rgba(0,0,0,0.2)' : 'none'
                          }}
                        >
                          {type.icon}
                        </span>
                      )}
                    </div>
                    
                    <span className={`text-xs transition-colors ${
                      isTypeSelected 
                        ? 'text-sand-800 group-hover:text-spice-800' 
                        : 'text-sand-500 group-hover:text-sand-700'
                    }`}>
                      {type.name}
                    </span>
                  </div>
                  <span className={`text-xs ${
                    isTypeSelected 
                      ? 'text-sand-600' 
                      : 'text-sand-400'
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
    <div className={`h-full flex flex-col ${compactMode ? 'p-3' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-sand-900 ${compactMode ? 'text-sm' : 'text-base'}`}>POI Controls</h3>
        <div className="flex gap-2">
          {showCreatePoiButton && onCreatePoiClick && (
            <button
              onClick={onCreatePoiClick}
              className="btn btn-sm btn-primary"
              title="Add POI"
            >
              <Plus size={16} />
            </button>
          )}
          {onCustomPoiTypeCreated && (
            <div className="relative group">
              <button
                onClick={() => setShowCustomPoiTypeModal(true)}
                disabled={userCreatedPoiTypes.length >= 5}
                className={`btn btn-sm ${
                  userCreatedPoiTypes.length >= 5 
                    ? 'btn-outline opacity-50 cursor-not-allowed' 
                    : 'btn-outline'
                }`}
                title={
                  userCreatedPoiTypes.length >= 5 
                    ? `Maximum 5 custom POI types allowed (${userCreatedPoiTypes.length}/5)` 
                    : `Create Custom POI Type (${userCreatedPoiTypes.length}/5)`
                }
              >
                <Settings size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className={`${compactMode ? 'mb-3' : 'mb-4'}`}>
        <button
          onClick={onToggleAllPois}
          className={`btn btn-sm w-full ${
            selectedPoiTypes.length === 0 ? 'btn-primary' : 'btn-outline'
          }`}
        >
          {selectedPoiTypes.length === 0 ? (
            <>
              <Eye size={16} className="mr-2" />
              Show All POIs
            </>
          ) : (
            <>
              <EyeOff size={16} className="mr-2" />
              Hide All POIs
            </>
          )}
        </button>
      </div>

      {/* POI Types by Category */}
      <div className="flex-1 overflow-y-auto">
        {categories.map(renderCategorySection)}
      </div>

      {/* Custom POI Type Modal */}
      {showCustomPoiTypeModal && onCustomPoiTypeCreated && (
        <CustomPoiTypeModal
          poiType={editingPoiType}
          customIcons={customIcons}
          onClose={() => {
            setShowCustomPoiTypeModal(false);
            setEditingPoiType(null);
          }}
          onPoiTypeCreated={onCustomPoiTypeCreated}
          onPoiTypeUpdated={onCustomPoiTypeUpdated}
          onPoiTypeDeleted={onCustomPoiTypeDeleted}
        />
      )}
    </div>
  );
};

export default PoiControlPanel; 
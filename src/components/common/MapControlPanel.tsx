import React, { ReactNode } from 'react';
import { Filter, Plus, Settings, Eye, Lock, Users, Edit, ChevronRight, FolderOpen } from 'lucide-react';
import { Poi, PoiType, CustomIcon, PoiCollection } from '../../types';

interface MapControlPanelProps {
  // Panel state
  showPanel: boolean;
  onTogglePanel: () => void;
  
  // Mode and location
  mode: 'grid' | 'map';
  currentLocation: string; // Grid ID or map name
  
  // Data
  pois: Poi[];
  filteredPois: Poi[];
  poiTypes: PoiType[];
  customIcons: CustomIcon[];
  collections: PoiCollection[];
  userCreatedPoiTypes: PoiType[];
  
  // Filter state
  activeTab: 'filters' | 'customization' | 'layers';
  onActiveTabChange: (tab: 'filters' | 'customization' | 'layers') => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  selectedPoiTypes: string[];
  selectedCategories: string[];
  privacyFilter: 'all' | 'public' | 'private' | 'shared';
  onPrivacyFilterChange: (filter: 'all' | 'public' | 'private' | 'shared') => void;
  
  // Event handlers
  onAddPOI: () => void;
  onTypeToggle: (typeId: string) => void;
  onCategoryToggle: (category: string, checked: boolean) => void;
  onToggleAllPois: () => void;
  onOtherTypesToggle: () => void;
  onCustomPoiTypeEdit: (poiType: PoiType) => void;
  onShowCollectionModal: () => void;
  onShowCustomPoiTypeModal: () => void;
  
  // Utility functions
  isIconUrl: (icon: string) => boolean;
  getDisplayImageUrl: (icon: string) => string;
  
  // Additional content for layers tab (map overlays, etc.)
  additionalLayerContent?: ReactNode;
  
  // Custom styling
  className?: string;
}

const MapControlPanel: React.FC<MapControlPanelProps> = ({
  showPanel,
  onTogglePanel,
  mode,
  currentLocation,
  pois,
  filteredPois,
  poiTypes,
  customIcons,
  collections,
  userCreatedPoiTypes,
  activeTab,
  onActiveTabChange,
  searchTerm,
  onSearchTermChange,
  selectedPoiTypes,
  selectedCategories,
  privacyFilter,
  onPrivacyFilterChange,
  onAddPOI,
  onTypeToggle,
  onCategoryToggle,
  onToggleAllPois,
  onOtherTypesToggle,
  onCustomPoiTypeEdit,
  onShowCollectionModal,
  onShowCustomPoiTypeModal,
  isIconUrl,
  getDisplayImageUrl,
  additionalLayerContent,
  className = ''
}) => {
  // Get unique categories for filtering
  const categories = [...new Set(poiTypes.map(type => type.category))];

  // Helper function to render a category section
  const renderCategorySection = (category: string) => {
    const categoryTypes = poiTypes.filter(type => type.category === category);
    const categoryTypeIds = categoryTypes.map(type => type.id);
    
    // A category is "visible" if ANY of its types are selected (fixed bug)
    const categoryVisible = categoryTypeIds.length > 0 && categoryTypeIds.some(id => selectedPoiTypes.includes(id));
    
    return (
      <div key={category} className="mb-3">
        {/* Category Header - More prominent styling */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 mb-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={categoryVisible}
                onChange={(e) => onCategoryToggle(category, e.target.checked)}
                className="rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/30"
              />
              <span className="ml-2 text-sm font-semibold text-amber-200 capitalize group-hover:text-amber-100 transition-colors">
                {category}
              </span>
            </label>
            <span className="text-xs text-amber-300/70 font-medium">
              {categoryTypes.length}
            </span>
          </div>
        </div>
        
        {/* Individual POI Types in Category - Reduced spacing */}
        <div className="space-y-0">
          {categoryTypes.map(type => {
            const typePoiCount = filteredPois.filter(poi => poi.poi_type_id === type.id).length;
            const isTypeSelected = selectedPoiTypes.includes(type.id);
            
            return (
              <label 
                key={type.id} 
                className={`flex items-center justify-between cursor-pointer group px-2 py-0.5 rounded transition-all ${
                  isTypeSelected 
                    ? 'hover:bg-amber-500/10' 
                    : 'opacity-60 hover:opacity-80 hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isTypeSelected}
                    onChange={() => onTypeToggle(type.id)}
                    className="rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/30 w-3 h-3"
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
                      ? 'text-amber-200 group-hover:text-amber-100' 
                      : 'text-amber-200/70 group-hover:text-amber-200'
                  }`}>
                    {type.name}
                  </span>
                </div>
                <span className={`text-xs ${
                  isTypeSelected 
                    ? 'text-amber-300/70' 
                    : 'text-amber-300/50'
                }`}>
                  {typePoiCount}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`${showPanel ? 'w-96' : 'w-12'} bg-slate-900/95 backdrop-blur-sm border-r border-slate-700/50 flex flex-col transition-all duration-200 ${className}`}>
      {/* Panel Header with Collapse Button */}
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        {showPanel && (
          <h2 className="text-lg font-semibold text-yellow-300" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Map Controls
          </h2>
        )}
        <button
          onClick={onTogglePanel}
          className="text-amber-300/70 hover:text-amber-200 transition-colors"
          title={showPanel ? "Collapse panel" : "Expand panel"}
        >
          {showPanel ? '✕' : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {showPanel && (
        <>
          {/* Tab Navigation */}
          <div className="flex mt-4 space-x-2 px-4">
            <button
              onClick={() => onActiveTabChange('filters')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeTab === 'filters' 
                  ? 'bg-amber-600/20 text-amber-200 border border-amber-500/30' 
                  : 'text-amber-300/70 hover:text-amber-200 hover:bg-slate-800/50'
              }`}
            >
              <Filter className="w-4 h-4 inline mr-1" />
              Filters
            </button>
            <button
              onClick={() => onActiveTabChange('customization')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeTab === 'customization' 
                  ? 'bg-amber-600/20 text-amber-200 border border-amber-500/30' 
                  : 'text-amber-300/70 hover:text-amber-200 hover:bg-slate-800/50'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Customization
            </button>
            <button
              onClick={() => onActiveTabChange('layers')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeTab === 'layers' 
                  ? 'bg-amber-600/20 text-amber-200 border border-amber-500/30' 
                  : 'text-amber-300/70 hover:text-amber-200 hover:bg-slate-800/50'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-1" />
              Layers
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Filters Tab */}
            {activeTab === 'filters' && (
              <div className="space-y-4">
                {/* Add POI Button */}
                <div>
                  <button
                    onClick={onAddPOI}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all bg-amber-600 border-2 border-amber-700 text-slate-900 hover:bg-amber-500 hover:border-amber-600"
                  >
                    <Plus className="w-5 h-5" />
                    <span>
                      {mode === 'grid' ? `Add POI to ${currentLocation}` : 'Add Point of Interest'}
                    </span>
                  </button>
                </div>

                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-amber-200 mb-2">
                    Search POIs
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchTermChange(e.target.value)}
                    placeholder="Search by title..."
                    className="w-full px-3 py-2 border border-slate-600 bg-slate-800 text-amber-100 placeholder-amber-300/50 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  />
                </div>

                {/* Stats */}
                <div className="bg-amber-600/10 border border-amber-500/20 p-3 rounded-lg">
                  <div className="text-sm font-medium text-amber-200">
                    Showing {filteredPois.length} of {pois.length} POIs
                  </div>
                </div>

                {/* POI Type Filters */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-amber-200">
                      Points of Interests
                    </label>
                    <div className="flex gap-1">
                      <button
                        onClick={onToggleAllPois}
                        className="text-xs text-amber-300 hover:text-amber-100 font-medium transition-colors"
                        title="Toggle All POIs"
                      >
                        {(() => {
                          const allTypeIds = poiTypes.map(type => type.id);
                          const allTypesSelected = allTypeIds.length > 0 && allTypeIds.every(id => selectedPoiTypes.includes(id));
                          return allTypesSelected ? 'Hide All' : 'Show All';
                        })()}
                      </button>
                    </div>
                  </div>
                  
                  {/* Two-Column Layout */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Left Column: Base + Resources Types */}
                    <div className="space-y-1">
                      {categories.includes('Base') && renderCategorySection('Base')}
                      {categories.includes('Resources') && renderCategorySection('Resources')}
                    </div>
                    
                    {/* Right Column: Locations + NPCs */}
                    <div className="space-y-1">
                      {categories.includes('Locations') && renderCategorySection('Locations')}
                      {categories.includes('NPCs') && renderCategorySection('NPCs')}
                    </div>
                  </div>
                  
                  {/* Other Categories (if any) */}
                  {categories.filter(cat => !['Base', 'Resources', 'Locations', 'NPCs'].includes(cat)).length > 0 && (
                    <div className="border-t border-slate-700/50 pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-amber-200">Other Types</h4>
                        <button
                          onClick={onOtherTypesToggle}
                          className="text-xs text-amber-300 hover:text-amber-100 font-medium transition-colors"
                          title="Toggle All Other Types"
                        >
                          {(() => {
                            const mainCategories = ['Base', 'Resources', 'Locations', 'NPCs'];
                            const otherCategories = categories.filter(cat => !mainCategories.includes(cat));
                            const otherTypeIds = poiTypes
                              .filter(type => otherCategories.includes(type.category))
                              .map(type => type.id);
                            const anyOtherTypesSelected = otherTypeIds.some(id => selectedPoiTypes.includes(id));
                            return anyOtherTypesSelected ? 'Hide All' : 'Show All';
                          })()}
                        </button>
                      </div>
                      <div className="space-y-1">
                        {categories
                          .filter(cat => !['Base', 'Resources', 'Locations', 'NPCs'].includes(cat))
                          .map(category => renderCategorySection(category))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Filters Section */}
                <div className="border-t border-slate-700/50 pt-4">
                  <h4 className="text-sm font-medium text-amber-200 mb-3">Additional Filters</h4>
                  
                  {/* Visibility Presets */}
                  <div>
                    <label className="block text-sm font-medium text-amber-200/80 mb-2">
                      Quick Visibility Filters
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onPrivacyFilterChange('public')}
                        className={`px-3 py-2 text-xs rounded border flex items-center justify-center gap-1 transition-all ${
                          privacyFilter === 'public'
                            ? 'bg-amber-600/20 border-amber-500/50 text-amber-200'
                            : 'bg-slate-800/50 border-slate-600/50 text-amber-300/70 hover:bg-slate-700/50 hover:text-amber-200'
                        }`}
                      >
                        <Eye className="w-3 h-3 text-green-400" />
                        Public Only
                      </button>
                      <button
                        onClick={() => onPrivacyFilterChange('private')}
                        className={`px-3 py-2 text-xs rounded border flex items-center justify-center gap-1 transition-all ${
                          privacyFilter === 'private'
                            ? 'bg-amber-600/20 border-amber-500/50 text-amber-200'
                            : 'bg-slate-800/50 border-slate-600/50 text-amber-300/70 hover:bg-slate-700/50 hover:text-amber-200'
                        }`}
                      >
                        <Lock className="w-3 h-3 text-red-400" />
                        Private Only
                      </button>
                      <button
                        onClick={() => onPrivacyFilterChange('shared')}
                        className={`px-3 py-2 text-xs rounded border flex items-center justify-center gap-1 transition-all ${
                          privacyFilter === 'shared'
                            ? 'bg-amber-600/20 border-amber-500/50 text-amber-200'
                            : 'bg-slate-800/50 border-slate-600/50 text-amber-300/70 hover:bg-slate-700/50 hover:text-amber-200'
                        }`}
                      >
                        <Users className="w-3 h-3 text-blue-400" />
                        Shared Only
                      </button>
                      <button
                        onClick={() => onPrivacyFilterChange('all')}
                        className={`px-3 py-2 text-xs rounded border flex items-center justify-center gap-1 transition-all ${
                          privacyFilter === 'all'
                            ? 'bg-amber-600/20 border-amber-500/50 text-amber-200'
                            : 'bg-slate-800/50 border-slate-600/50 text-amber-300/70 hover:bg-slate-700/50 hover:text-amber-200'
                        }`}
                      >
                        <Eye className="w-3 h-3 text-amber-300" />
                        Show All
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-amber-300/70">
                      Icons show privacy levels on map POIs: <Eye className="w-3 h-3 inline text-green-400" /> Public, <Lock className="w-3 h-3 inline text-red-400" /> Private, <Users className="w-3 h-3 inline text-blue-400" /> Shared
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Customization Tab */}
            {activeTab === 'customization' && (
              <div className="space-y-4">
                {/* Custom POI Types Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-amber-200">Custom POI Types</h4>
                    <button 
                      onClick={onShowCustomPoiTypeModal}
                      disabled={userCreatedPoiTypes.length >= 5}
                      className={`px-3 py-1.5 text-xs rounded font-medium flex items-center gap-1 transition-all ${
                        userCreatedPoiTypes.length >= 5
                          ? 'bg-slate-700 text-amber-200/50 border border-slate-600 cursor-not-allowed'
                          : 'bg-amber-600 text-slate-900 hover:bg-amber-500 border border-amber-700 hover:border-amber-600'
                      }`}
                      title={userCreatedPoiTypes.length >= 5 ? 'Maximum 5 custom POI types allowed' : 'Create custom POI type'}
                    >
                      <Plus className="w-3 h-3" />
                      Create
                    </button>
                  </div>
                  
                  {/* Limit indicator */}
                  <div className="mb-3">
                    <div className="text-xs text-amber-300/70">
                      {userCreatedPoiTypes.length}/5 custom types created
                      {userCreatedPoiTypes.length >= 5 && (
                        <span className="ml-2 text-amber-400/90 font-medium">Limit reached</span>
                      )}
                    </div>
                  </div>
                  
                  {userCreatedPoiTypes.length === 0 ? (
                    <div className="text-center py-8">
                      <Plus className="w-12 h-12 text-amber-400/70 mx-auto mb-4" />
                      <p className="text-amber-200 mb-2">No custom POI types yet</p>
                      <p className="text-amber-300/70 text-sm">Create custom POI types with your own icons and categories</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {userCreatedPoiTypes.map(poiType => (
                        <div 
                          key={poiType.id} 
                          className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 hover:bg-slate-800/70 transition-colors"
                        >
                          <div className="flex items-center">
                            <div 
                              className="w-10 h-10 rounded flex items-center justify-center mr-1 flex-shrink-0"
                              style={{
                                backgroundColor: poiType.icon_has_transparent_background && isIconUrl(poiType.icon) 
                                  ? 'transparent' 
                                  : poiType.color
                              }}
                            >
                              {isIconUrl(poiType.icon) ? (
                                <img
                                  src={getDisplayImageUrl(poiType.icon)}
                                  alt={poiType.name}
                                  className="w-6 h-6 object-contain"
                                />
                              ) : (
                                <span className="text-base font-medium" style={{ 
                                  color: poiType.icon_has_transparent_background ? poiType.color : 'white'
                                }}>
                                  {poiType.icon}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center">
                                <h4 className="font-medium text-amber-200 truncate">{poiType.name}</h4>
                                <span className="ml-2 px-2 py-0.5 bg-amber-600/20 text-amber-300 text-xs rounded capitalize border border-amber-500/30">
                                  {poiType.category}
                                </span>
                              </div>
                              {poiType.default_description && (
                                <p className="text-sm text-amber-200/70 mt-1 truncate">{poiType.default_description}</p>
                              )}
                            </div>
                            <button
                              onClick={() => onCustomPoiTypeEdit(poiType)}
                              className="text-amber-400 hover:text-amber-200 transition-colors ml-2"
                              title="Edit POI type"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Collections Section */}
                <div className="pt-4 border-t border-slate-700/50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-amber-200">POI Collections</h4>
                    <button 
                      onClick={onShowCollectionModal}
                      className="px-3 py-1.5 text-xs rounded bg-slate-700 text-amber-200 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 transition-all font-medium flex items-center gap-1"
                    >
                      <FolderOpen className="w-3 h-3" />
                      Manage
                    </button>
                  </div>
                  <p className="text-xs text-amber-300/70 mb-3">
                    {collections.length} collections • Organize and share groups of POIs
                  </p>
                  
                  {collections.length > 0 && (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {collections.slice(0, 3).map(collection => (
                        <div key={collection.id} className="flex items-center text-sm">
                          <FolderOpen className="w-4 h-4 text-amber-400 mr-2 flex-shrink-0" />
                          <span className="text-amber-200 truncate">{collection.name}</span>
                          {collection.is_public && (
                            <span className="ml-auto text-xs text-blue-400">Public</span>
                          )}
                        </div>
                      ))}
                      {collections.length > 3 && (
                        <div className="text-xs text-amber-300/70 italic">
                          +{collections.length - 3} more collections
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Layers Tab */}
            {activeTab === 'layers' && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-amber-200">Map Layers</h3>
                
                <div className="space-y-2">
                  {/* POI Markers Layer */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled={true}
                        className="rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/30"
                      />
                      <span className="ml-2 text-sm text-amber-200">POI Markers</span>
                    </label>
                    <div className="text-xs text-amber-300/70">
                      {filteredPois.length} visible
                    </div>
                  </div>
                </div>

                {/* Additional layer content (map overlays, grid screenshot, etc.) */}
                {additionalLayerContent}

                {!additionalLayerContent && (
                  <div className="text-sm text-amber-300/70 italic mt-4 text-center">
                    No additional layers available
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MapControlPanel; 
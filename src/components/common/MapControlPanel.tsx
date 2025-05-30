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
  
  // Get categories that should display in main panels from database settings
  // Now we check if ANY type in a category has display_in_panel=true, meaning the category should be displayed
  const displayCategories = [...new Set(
    poiTypes
      .filter(type => type.display_in_panel === true)
      .map(type => type.category)
  )];
  
  // Helper function to render a category section
  const renderCategorySection = (category: string) => {
    const categoryTypes = poiTypes.filter(type => type.category === category);
    const categoryTypeIds = categoryTypes.map(type => type.id);
    
    // A category is "visible" if ANY of its types are selected (fixed bug)
    const categoryVisible = categoryTypeIds.length > 0 && categoryTypeIds.some(id => selectedPoiTypes.includes(id));
    
    return (
      <div key={category} className="mb-4">
        {/* Enhanced Category Header with Navbar-style Styling */}
        <div className="relative overflow-hidden rounded-lg mb-3 group">
          {/* Base background layer */}
          <div className="absolute inset-0 bg-slate-800/60" />
          
          {/* Interactive purple overlay matching navbar */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.08) 40%, transparent 70%)'
            }}
          />
          
          <div className="relative z-10 border border-amber-400/40 px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group/label">
                <input
                  type="checkbox"
                  checked={categoryVisible}
                  onChange={(e) => onCategoryToggle(category, e.target.checked)}
                  className="rounded border-amber-400/50 bg-slate-900/80 text-amber-500 focus:ring-amber-500/30 focus:ring-offset-0"
                />
                <span className="ml-3 text-sm font-light text-amber-200 capitalize group-hover/label:text-gold-300 transition-all duration-300 tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  {category}
                </span>
              </label>
              <span className="text-xs text-amber-300 font-light px-3 py-1 bg-slate-900/60 rounded border border-amber-400/30 shadow-sm">
                {categoryTypes.length}
              </span>
            </div>
          </div>
        </div>
        
        {/* Enhanced Individual POI Types in Category */}
        <div className="space-y-1">
          {categoryTypes.map(type => {
            const typePoiCount = filteredPois.filter(poi => poi.poi_type_id === type.id).length;
            const isTypeSelected = selectedPoiTypes.includes(type.id);
            
            return (
              <label 
                key={type.id} 
                className={`flex items-center justify-between cursor-pointer group px-4 py-3 rounded-lg transition-all duration-300 relative overflow-hidden border ${
                  isTypeSelected 
                    ? 'border-amber-400/50 bg-slate-800/70 hover:bg-slate-700/80' 
                    : 'border-slate-700/40 bg-slate-900/40 hover:bg-slate-800/50 hover:border-amber-400/30'
                }`}
              >
                {/* Background layers for selected items */}
                {isTypeSelected && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 via-amber-500/5 to-amber-600/10" />
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-400/5 via-transparent to-amber-700/10" />
                  </>
                )}
                
                {/* Interactive purple overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 40%, transparent 70%)'
                  }}
                />
                
                <div className="flex items-center relative z-10">
                  <input
                    type="checkbox"
                    checked={isTypeSelected}
                    onChange={() => onTypeToggle(type.id)}
                    className="rounded border-amber-400/50 bg-slate-900/80 text-amber-500 focus:ring-amber-500/30 focus:ring-offset-0 w-4 h-4"
                  />
                  
                  {/* Enhanced POI Type Icon */}
                  <div className="ml-4 mr-3 flex items-center justify-center flex-shrink-0">
                    {isIconUrl(type.icon) ? (
                      <img
                        src={getDisplayImageUrl(type.icon)}
                        alt={type.name}
                        className="w-8 h-8 object-contain"
                        style={{
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'
                        }}
                      />
                    ) : (
                      <span 
                        className="text-2xl leading-none font-medium"
                        style={{ 
                          color: type.color,
                          textShadow: '0 2px 4px rgba(0,0,0,0.4)'
                        }}
                      >
                        {type.icon}
                      </span>
                    )}
                  </div>
                  
                  <span 
                    className={`text-sm transition-all duration-300 font-light tracking-wide ${
                      isTypeSelected 
                        ? 'text-gold-300 group-hover:text-gold-200' 
                        : 'text-amber-200/80 group-hover:text-amber-200'
                    }`}
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                  >
                    {type.name}
                  </span>
                </div>
                
                {/* Enhanced count badge */}
                <span className={`text-xs relative z-10 px-3 py-1 rounded border ml-auto shadow-sm transition-all duration-300 ${
                  isTypeSelected 
                    ? 'text-amber-300 bg-slate-900/70 border-amber-400/50' 
                    : 'text-amber-300/70 bg-slate-800/60 border-slate-600/40 group-hover:text-amber-300 group-hover:border-amber-400/30'
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
    <div className={`${showPanel ? 'w-[30rem]' : 'w-12'} relative flex flex-col transition-all duration-200 ${className}`}>
      {/* Simple background to match POI card */}
      <div className="absolute inset-0 bg-slate-900" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full backdrop-blur-sm border-r border-amber-400/30">
        {/* Panel Header with Collapse Button */}
        <div className="p-4 border-b border-amber-400/20 flex items-center justify-between">
          {showPanel && (
            <h2 className="text-lg font-light text-amber-200 tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Map Controls
            </h2>
          )}
          <button
            onClick={onTogglePanel}
            className="text-amber-300/70 hover:text-amber-200 transition-all duration-300 hover:scale-110"
            title={showPanel ? "Collapse panel" : "Expand panel"}
          >
            {showPanel ? '✕' : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {showPanel && (
          <>
            {/* Enhanced Tab Navigation with Navbar-style Effects */}
            <div className="flex mt-4 space-x-1 px-4">
              <button
                onClick={() => onActiveTabChange('filters')}
                className={`relative px-4 py-3 text-sm font-light transition-all duration-700 group overflow-hidden ${
                  activeTab === 'filters' 
                    ? 'text-amber-200' 
                    : 'text-amber-300/70 hover:text-amber-200'
                }`}
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                {/* Background layers for active state */}
                {activeTab === 'filters' && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-800/60" />
                  </>
                )}
                
                {/* Interactive purple overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-violet-500/10 to-violet-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 flex items-center tracking-wide">
                  <Filter className="w-4 h-4 inline mr-2" />
                  Filters
                </div>
                
                {/* Expanding underline */}
                <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent transition-all duration-700 ${
                  activeTab === 'filters' ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </button>
              
              <button
                onClick={() => onActiveTabChange('customization')}
                className={`relative px-4 py-3 text-sm font-light transition-all duration-700 group overflow-hidden ${
                  activeTab === 'customization' 
                    ? 'text-amber-200' 
                    : 'text-amber-300/70 hover:text-amber-200'
                }`}
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                {/* Background layers for active state */}
                {activeTab === 'customization' && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-800/60" />
                  </>
                )}
                
                {/* Interactive purple overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-violet-500/10 to-violet-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 flex items-center tracking-wide">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Customization
                </div>
                
                {/* Expanding underline */}
                <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent transition-all duration-700 ${
                  activeTab === 'customization' ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </button>
              
              <button
                onClick={() => onActiveTabChange('layers')}
                className={`relative px-4 py-3 text-sm font-light transition-all duration-700 group overflow-hidden ${
                  activeTab === 'layers' 
                    ? 'text-amber-200' 
                    : 'text-amber-300/70 hover:text-amber-200'
                }`}
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                {/* Background layers for active state */}
                {activeTab === 'layers' && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-800/60" />
                  </>
                )}
                
                {/* Interactive purple overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-violet-500/10 to-violet-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 flex items-center tracking-wide">
                  <Settings className="w-4 h-4 inline mr-2" />
                  Layers
                </div>
                
                {/* Expanding underline */}
                <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent transition-all duration-700 ${
                  activeTab === 'layers' ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
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
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 relative group overflow-hidden"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                    >
                      {/* Background layers */}
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600" />
                      <div className="absolute inset-0 bg-gradient-to-b from-amber-400/20 via-transparent to-amber-700/30" />
                      
                      {/* Interactive overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-violet-500/10 to-violet-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Content */}
                      <div className="relative z-10 flex items-center gap-3 text-slate-900">
                        <Plus className="w-5 h-5" />
                        <span className="font-light tracking-wide">
                          {mode === 'grid' ? `Add POI to ${currentLocation}` : 'Add Point of Interest'}
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Search */}
                  <div>
                    <label className="block text-sm font-light text-amber-200 mb-3 tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      Search POIs
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchTermChange(e.target.value)}
                        placeholder="Search by title..."
                        className="w-full px-4 py-3 border border-amber-400/30 bg-slate-800/60 text-amber-100 placeholder-amber-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 transition-all duration-300"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                      />
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-amber-400/5 to-transparent pointer-events-none" />
                    </div>
                  </div>

                  {/* Simple Stats Text */}
                  <div className="text-xs text-amber-300/70 font-light tracking-wide mb-4" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    Showing {filteredPois.length} of {pois.length} POIs
                  </div>

                  {/* POI Type Filters */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-light text-amber-200 tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                        Points of Interest
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={onToggleAllPois}
                          className="text-xs text-amber-300 hover:text-amber-100 font-light transition-all duration-300 px-2 py-1 rounded border border-amber-400/20 hover:border-amber-400/40 hover:bg-amber-400/10"
                          title="Toggle All POIs"
                          style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                        >
                          {(() => {
                            const allTypeIds = poiTypes.map(type => type.id);
                            const allTypesSelected = allTypeIds.length > 0 && allTypeIds.every(id => selectedPoiTypes.includes(id));
                            return allTypesSelected ? 'Hide All' : 'Show All';
                          })()}
                        </button>
                      </div>
                    </div>
                    
                    {/* Ordered Two-Column Layout for Display Categories */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {/* Left Column - Column preference 1 */}
                      <div className="space-y-1">
                        {displayCategories
                          .filter(category => {
                            const categoryTypes = poiTypes.filter(type => type.category === category);
                            const firstType = categoryTypes[0];
                            return firstType?.category_column_preference === 1;
                          })
                          .sort((a, b) => {
                            const aTypes = poiTypes.filter(type => type.category === a);
                            const bTypes = poiTypes.filter(type => type.category === b);
                            const aOrder = aTypes[0]?.category_display_order || 0;
                            const bOrder = bTypes[0]?.category_display_order || 0;
                            return aOrder - bOrder;
                          })
                          .map(category => renderCategorySection(category))}
                      </div>
                      
                      {/* Right Column - Column preference 2 */}
                      <div className="space-y-1">
                        {displayCategories
                          .filter(category => {
                            const categoryTypes = poiTypes.filter(type => type.category === category);
                            const firstType = categoryTypes[0];
                            return firstType?.category_column_preference === 2;
                          })
                          .sort((a, b) => {
                            const aTypes = poiTypes.filter(type => type.category === a);
                            const bTypes = poiTypes.filter(type => type.category === b);
                            const aOrder = aTypes[0]?.category_display_order || 0;
                            const bOrder = bTypes[0]?.category_display_order || 0;
                            return aOrder - bOrder;
                          })
                          .map(category => renderCategorySection(category))}
                      </div>
                    </div>
                    
                    {/* Other Categories (if any) */}
                    {categories.filter(cat => !displayCategories.includes(cat)).length > 0 && (
                      <div className="border-t border-slate-700/50 pt-3">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium text-amber-200">Other Types</h4>
                          <button
                            onClick={onOtherTypesToggle}
                            className="text-xs text-amber-300 hover:text-amber-100 font-medium transition-colors"
                            title="Toggle All Other Types"
                          >
                            {(() => {
                              const otherCategories = categories.filter(cat => !displayCategories.includes(cat));
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
                            .filter(cat => !displayCategories.includes(cat))
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
                <div className="space-y-6">
                  {/* Custom POI Types Section */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-light text-amber-200 tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>Custom POI Types</h4>
                      <button 
                        onClick={onShowCustomPoiTypeModal}
                        disabled={userCreatedPoiTypes.length >= 5}
                        className={`px-4 py-2 text-sm rounded-lg font-light flex items-center gap-2 transition-all duration-300 relative overflow-hidden ${
                          userCreatedPoiTypes.length >= 5
                            ? 'bg-slate-700/60 text-amber-200/50 border border-slate-600/50 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-900 hover:from-amber-500 hover:to-amber-400 border border-amber-500 hover:border-amber-400 shadow-lg hover:shadow-xl'
                        }`}
                        title={userCreatedPoiTypes.length >= 5 ? 'Maximum 5 custom POI types allowed' : 'Create custom POI type'}
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                      >
                        {/* Interactive overlay for enabled button */}
                        {userCreatedPoiTypes.length < 5 && (
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                        <div className="relative z-10 flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Create
                        </div>
                      </button>
                    </div>
                    
                    {/* Enhanced Limit indicator */}
                    <div className="mb-4">
                      <div className="relative overflow-hidden rounded-lg">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 via-amber-500/5 to-amber-600/10" />
                        <div className="relative z-10 border border-amber-400/20 p-3 backdrop-blur-sm">
                          <div className="text-xs font-light text-amber-300/80 tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                            {userCreatedPoiTypes.length}/5 custom types created
                            {userCreatedPoiTypes.length >= 5 && (
                              <span className="ml-3 text-amber-400/90 font-medium px-2 py-1 bg-amber-400/10 rounded border border-amber-400/30">Limit reached</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {userCreatedPoiTypes.length === 0 ? (
                      <div className="text-center py-12 relative">
                        {/* Background */}
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-800/20 via-slate-700/10 to-slate-800/20 rounded-lg border border-amber-400/10" />
                        
                        <div className="relative z-10">
                          <Plus className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
                          <p className="text-amber-200 mb-2 font-light tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>No custom POI types yet</p>
                          <p className="text-amber-300/70 text-sm font-light">Create custom POI types with your own icons and categories</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userCreatedPoiTypes.map(poiType => (
                          <div 
                            key={poiType.id} 
                            className="relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg group"
                          >
                            {/* Background layers */}
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-800/60 via-slate-700/40 to-slate-800/60" />
                            <div className="absolute inset-0 bg-gradient-to-b from-slate-700/30 via-transparent to-slate-800/50" />
                            
                            {/* Interactive overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-violet-500/5 to-violet-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            <div className="relative z-10 border border-amber-400/30 p-4 backdrop-blur-sm">
                              <div className="flex items-center">
                                <div 
                                  className="w-12 h-12 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 border border-amber-400/20 shadow-sm"
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
                                      className="w-7 h-7 object-contain"
                                    />
                                  ) : (
                                    <span className="text-lg font-medium" style={{ 
                                      color: poiType.icon_has_transparent_background ? poiType.color : 'white'
                                    }}>
                                      {poiType.icon}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center flex-wrap gap-2">
                                    <h4 className="font-light text-amber-200 tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>{poiType.name}</h4>
                                    <span className="px-3 py-1 bg-amber-600/20 text-amber-300 text-xs rounded-lg capitalize border border-amber-500/30 font-light">
                                      {poiType.category}
                                    </span>
                                  </div>
                                  {poiType.default_description && (
                                    <p className="text-sm text-amber-200/70 mt-2 font-light">{poiType.default_description}</p>
                                  )}
                                </div>
                                <button
                                  onClick={() => onCustomPoiTypeEdit(poiType)}
                                  className="text-amber-400 hover:text-amber-200 transition-all duration-300 ml-3 p-2 rounded-lg hover:bg-amber-400/10 border border-transparent hover:border-amber-400/30"
                                  title="Edit POI type"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Collections Section */}
                  <div className="pt-6 border-t border-amber-400/20">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-light text-amber-200 tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>POI Collections</h4>
                      <button 
                        onClick={onShowCollectionModal}
                        className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 text-amber-200 hover:from-slate-600 hover:to-slate-500 border border-slate-600 hover:border-slate-500 transition-all duration-300 font-light flex items-center gap-2 shadow-lg hover:shadow-xl"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                      >
                        <FolderOpen className="w-4 h-4" />
                        Manage
                      </button>
                    </div>
                    
                    <div className="relative overflow-hidden rounded-lg mb-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 via-amber-500/5 to-amber-600/10" />
                      <div className="relative z-10 border border-amber-400/20 p-3 backdrop-blur-sm">
                        <p className="text-xs font-light text-amber-300/80 tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                          {collections.length} collections • Organize and share groups of POIs
                        </p>
                      </div>
                    </div>
                    
                    {collections.length > 0 && (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {collections.slice(0, 3).map(collection => (
                          <div key={collection.id} className="flex items-center text-sm p-2 rounded-lg bg-slate-800/30 border border-amber-400/10">
                            <FolderOpen className="w-4 h-4 text-amber-400 mr-3 flex-shrink-0" />
                            <span className="text-amber-200 flex-1 font-light tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>{collection.name}</span>
                            {collection.is_public && (
                              <span className="text-xs text-blue-400 px-2 py-1 bg-blue-400/10 rounded border border-blue-400/30">Public</span>
                            )}
                          </div>
                        ))}
                        {collections.length > 3 && (
                          <div className="text-xs text-amber-300/70 italic text-center py-2 font-light">
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
                <div className="space-y-6">
                  <h3 className="text-sm font-light text-amber-200 tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>Map Layers</h3>
                  
                  <div className="space-y-3">
                    {/* POI Markers Layer */}
                    <div className="relative overflow-hidden rounded-lg">
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-800/60 via-slate-700/40 to-slate-800/60" />
                      <div className="relative z-10 border border-amber-400/30 p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={true}
                              disabled={true}
                              className="rounded border-amber-400/50 bg-slate-800/60 text-amber-500 focus:ring-amber-500/30 focus:ring-offset-0"
                            />
                            <span className="ml-3 text-sm text-amber-200 font-light tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>POI Markers</span>
                          </label>
                          <div className="text-xs text-amber-300/70 px-2 py-1 bg-amber-400/10 rounded border border-amber-400/20">
                            {filteredPois.length} visible
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional layer content (map overlays, grid screenshot, etc.) */}
                  {additionalLayerContent}

                  {!additionalLayerContent && (
                    <div className="text-center py-8">
                      <div className="relative overflow-hidden rounded-lg">
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-800/20 via-slate-700/10 to-slate-800/20" />
                        <div className="relative z-10 border border-amber-400/10 p-6 backdrop-blur-sm">
                          <p className="text-sm text-amber-300/70 italic font-light tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                            No additional layers available
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MapControlPanel; 
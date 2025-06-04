import React, { ReactNode } from 'react';
import { Filter, Plus, Settings, Eye, Lock, Users, Edit, ChevronRight, FolderOpen } from 'lucide-react';
import { Poi, PoiType } from '../../types';
import { isIconUrl, getDisplayImageUrlFromIcon } from '../../lib/helpers';

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

  
  // Filter state
  activeTab: 'filters' | 'layers';
  onActiveTabChange: (tab: 'filters' | 'layers') => void;
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

  isIconUrl,
  getDisplayImageUrl,
  additionalLayerContent,
  className = ''
}) => {
  // State for category collapse (default: false = uncollapsed)
  const [collapsedCategories, setCollapsedCategories] = React.useState<Set<string>>(new Set());
  
  const toggleCategoryCollapse = (category: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Helper function to get POI count for a type
  const getPoiCountForType = (typeId: string) => {
    return pois.filter(poi => poi.poi_type_id === typeId).length;
  };

  // Helper function to get POI count for a category
  const getPoiCountForCategory = (category: string) => {
    const categoryTypeIds = poiTypes
      .filter(type => type.category === category)
      .map(type => type.id);
    return pois.filter(poi => categoryTypeIds.includes(poi.poi_type_id)).length;
  };

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
    const isCollapsed = collapsedCategories.has(category);
    
    return (
      <div key={category} className="mb-4">
        {/* Enhanced Category Header */}
        <div className="flex items-center justify-between mb-2 px-3 py-2 rounded-lg bg-gradient-to-r from-slate-800/40 via-slate-700/30 to-slate-800/40 border border-amber-400/20">
          <h4 className="text-sm font-medium text-amber-200 tracking-wide flex-1"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            {category} ({getPoiCountForCategory(category)})
          </h4>
          <div className="flex items-center gap-1">
            {/* Category Visibility Toggle */}
            <button
              onClick={() => onCategoryToggle(category, !categoryVisible)}
              className={`p-1 rounded transition-all duration-200 ${
                !categoryVisible 
                  ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' 
                  : 'text-amber-400/70 hover:text-amber-300 hover:bg-amber-500/10'
              }`}
              title={categoryVisible ? 'Hide category' : 'Show category'}
            >
              <Eye className="w-3 h-3" />
            </button>
            {/* Category Collapse Toggle */}
            <button
              onClick={() => toggleCategoryCollapse(category)}
              className="p-1 text-amber-400/70 hover:text-amber-300 hover:bg-amber-500/10 rounded transition-all duration-200"
              title={isCollapsed ? 'Expand category' : 'Collapse category'}
            >
              <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`} />
            </button>
          </div>
        </div>

        {/* Category Types */}
        {!isCollapsed && (
          <div className="space-y-1 ml-2">
            {categoryTypes.map(type => {
              const isSelected = selectedPoiTypes.includes(type.id);
              const poiCount = getPoiCountForType(type.id);
              const displayIcon = getDisplayImageUrlFromIcon(type.icon);
              
              return (
                <button
                  key={type.id}
                  onClick={() => onTypeToggle(type.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-all duration-200 text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-slate-800/60 to-slate-700/40 text-amber-200 border border-amber-400/40 shadow-sm'
                      : 'text-amber-300/80 hover:bg-slate-800/30 hover:text-amber-200'
                  }`}
                >
                  {/* Type Icon */}
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {isIconUrl(type.icon) ? (
                      <img 
                        src={displayIcon} 
                        alt={type.name}
                        className="w-4 h-4 object-contain"
                      />
                    ) : (
                      <span 
                        className="text-sm leading-none"
                        style={{ color: type.color }}
                      >
                        {type.icon}
                      </span>
                    )}
                  </div>
                  
                  {/* Type Name with Count */}
                  <span className="text-xs font-light tracking-wide flex-1">
                    {type.name} ({poiCount})
                  </span>
                </button>
              );
            })}
          </div>
        )}
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
                  {/* Add POI Button - Elegant hexagonal style inspired by landing page */}
                  <div className="flex justify-center mb-4">
                    <button
                      onClick={onAddPOI}
                      className="group relative inline-flex items-center justify-center h-12 px-6 min-w-[140px] transition-all duration-300 overflow-hidden"
                      style={{ 
                        clipPath: "polygon(12px 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0% 50%)",
                        fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif"
                      }}
                      onMouseEnter={(e) => {
                        const purpleOverlay = e.currentTarget.querySelector('.purple-overlay') as HTMLElement;
                        if (purpleOverlay) {
                          purpleOverlay.style.background = 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.08) 40%, transparent 70%)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        const purpleOverlay = e.currentTarget.querySelector('.purple-overlay') as HTMLElement;
                        if (purpleOverlay) {
                          purpleOverlay.style.background = 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0) 0%, rgba(124, 58, 237, 0) 40%, transparent 70%)';
                        }
                      }}
                    >
                      {/* Dark background */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950"
                        style={{ clipPath: "polygon(12px 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0% 50%)" }}
                      />
                      
                      {/* Amber border */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-amber-400/70 via-amber-300/90 to-amber-400/70 group-hover:from-amber-300/90 group-hover:via-amber-200/100 group-hover:to-amber-300/90 transition-all duration-300"
                        style={{
                          clipPath: "polygon(12px 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0% 50%)",
                          padding: '1px'
                        }}
                      />
                      
                      {/* Inner background */}
                      <div 
                        className="absolute inset-0.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950"
                        style={{ clipPath: "polygon(12px 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0% 50%)" }}
                      />
                      
                      {/* Purple hover overlay */}
                      <div 
                        className="absolute inset-0.5 transition-all duration-300 purple-overlay"
                        style={{
                          clipPath: "polygon(12px 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0% 50%)",
                          background: 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0) 0%, rgba(124, 58, 237, 0) 40%, transparent 70%)'
                        }}
                      />
                      
                      {/* Content */}
                      <div className="relative z-10 flex items-center space-x-2">
                        <Plus className="w-4 h-4 text-amber-300 group-hover:text-amber-100 transition-all duration-300" />
                        <span className="text-sm font-light uppercase tracking-wide text-amber-200 group-hover:text-amber-50 transition-all duration-300">
                          Add POI
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Search Input - More compact */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search POIs..."
                      value={searchTerm}
                      onChange={(e) => onSearchTermChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-800/60 border border-amber-400/30 rounded-lg text-amber-200 placeholder-amber-300/50 focus:outline-none focus:border-amber-400/60 focus:bg-slate-800/80 transition-all duration-300"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                    />
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
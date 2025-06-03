import React, { useRef, useEffect } from 'react';
import { Database, Search, X } from 'lucide-react';

interface FiltersPanelProps {
  onTogglePanel: () => void;
  filterState: any; // Will be properly typed when we import the hook
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({ onTogglePanel, filterState }) => {
  const [activeTab, setActiveTab] = React.useState<'poi' | 'entity'>('poi');
  const poiSearchRef = useRef<HTMLInputElement>(null);
  const entitySearchRef = useRef<HTMLInputElement>(null);
  
  // Track which input was focused and its cursor position
  const focusStateRef = useRef<{
    element: 'poi' | 'entity' | null;
    cursorPosition: number;
  }>({ element: null, cursorPosition: 0 });
  
  const {
    poiFilters,
    entityFilters,
    filterCounts,
    updatePOIFilters,
    updateEntityFilters,
    togglePOICategory,
    togglePOIType,
    toggleAllPOIs,
    toggleEntityCategory,
    toggleEntityType,
    toggleEntityTier,
    clearAllFilters,
    poiTypes,
    tiers,
    entityCategories,
    entityTypes,
    getTierName,
    loading
  } = filterState;

  // Memoize category calculations to prevent unnecessary re-renders
  const poiCategories = React.useMemo(() => 
    [...new Set(poiTypes.map(type => type.category))], 
    [poiTypes]
  );
  
  // Use the entity categories and types from the hook with safe conversion
  const memoizedEntityCategories = React.useMemo(() => {
    if (!Array.isArray(entityCategories)) return [];
    
    return entityCategories
      .filter(c => c != null && typeof c !== 'object')  // Filter out objects
      .map(c => String(c))
      .filter(c => c !== '' && c !== 'undefined' && c !== 'null'); // Filter out invalid strings
  }, [entityCategories]);
  
  const memoizedEntityTypes = React.useMemo(() => {
    if (!Array.isArray(entityTypes)) return [];
    
    return entityTypes
      .filter(t => t != null && typeof t !== 'object')  // Filter out objects
      .map(t => String(t))
      .filter(t => t !== '' && t !== 'undefined' && t !== 'null'); // Filter out invalid strings
  }, [entityTypes]);
  
  // Valid tiers (excluding T69)
  const validTiers = React.useMemo(() => 
    tiers.filter(tier => tier.tier_number !== 69), 
    [tiers]
  );

  // Focus management effect
  useEffect(() => {
    const restoreFocus = () => {
      if (focusStateRef.current.element === 'poi' && poiSearchRef.current) {
        poiSearchRef.current.focus();
        poiSearchRef.current.setSelectionRange(
          focusStateRef.current.cursorPosition, 
          focusStateRef.current.cursorPosition
        );
      } else if (focusStateRef.current.element === 'entity' && entitySearchRef.current) {
        entitySearchRef.current.focus();
        entitySearchRef.current.setSelectionRange(
          focusStateRef.current.cursorPosition, 
          focusStateRef.current.cursorPosition
        );
      }
    };

    // Use setTimeout to defer focus restoration to after render
    const timeoutId = setTimeout(restoreFocus, 0);
    return () => clearTimeout(timeoutId);
  });

  const handlePOISearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Store focus state before updating
    focusStateRef.current = {
      element: 'poi',
      cursorPosition: e.target.selectionStart || 0
    };
    updatePOIFilters({ searchQuery: e.target.value });
  };

  const handleEntitySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Store focus state before updating
    focusStateRef.current = {
      element: 'entity',
      cursorPosition: e.target.selectionStart || 0
    };
    updateEntityFilters({ searchQuery: e.target.value });
  };

  const handlePOISearchFocus = () => {
    focusStateRef.current.element = 'poi';
  };

  const handleEntitySearchFocus = () => {
    focusStateRef.current.element = 'entity';
  };

  const handlePOISearchBlur = () => {
    // Only clear focus state if not switching to entity search
    setTimeout(() => {
      if (document.activeElement !== entitySearchRef.current) {
        focusStateRef.current.element = null;
      }
    }, 10);
  };

  const handleEntitySearchBlur = () => {
    // Only clear focus state if not switching to POI search
    setTimeout(() => {
      if (document.activeElement !== poiSearchRef.current) {
        focusStateRef.current.element = null;
      }
    }, 10);
  };

  // Helper function to check if an icon is a URL
  const isIconUrl = (icon: string): boolean => {
    return icon.startsWith('http') || icon.startsWith('/') || icon.includes('.');
  };

  // Helper function to get display image URL
  const getDisplayImageUrl = (icon: string): string => {
    if (isIconUrl(icon)) {
      return icon;
    }
    return icon; // Return emoji as-is
  };

  // Get POI count for a type
  const getPoiCountForType = (typeId: string) => {
    // This would ideally come from filterState, but for now return empty
    return '';
  };

  // Check if category is visible (all types in category are selected)
  const isCategoryVisible = (category: string) => {
    const categoryTypes = poiTypes.filter(type => type.category === category);
    return categoryTypes.some(type => poiFilters.selectedPoiTypes.includes(type.id));
  };

  // Render category section like other pages
  const renderCategorySection = (category: string) => {
    const categoryTypes = poiTypes
      .filter(type => type.category === category)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    if (categoryTypes.length === 0) return null;
    
    const categoryVisible = isCategoryVisible(category);

    return (
      <div key={category} className="border border-slate-600/40 rounded-lg overflow-hidden mb-3">
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
                  onChange={(e) => togglePOICategory(category, e.target.checked)}
                  className="rounded border-slate-500/50 text-amber-500 focus:ring-amber-500/30 bg-slate-800/60"
                />
                <span className="ml-2 text-sm font-light text-amber-200 capitalize group-hover:text-amber-100 transition-colors tracking-wide">
                  {String(category)}
                </span>
              </label>
              <span className="text-xs text-amber-300/70 font-light px-2 py-1 bg-slate-700/40 rounded border border-slate-600/30">
                {categoryTypes.length}
              </span>
            </div>
          </div>
        </div>

        {/* Individual POI Types in Category */}
        <div className="bg-slate-800/20 p-3">
          <div className="space-y-2">
            {categoryTypes.map(type => (
              <div key={type.id} className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={poiFilters.selectedPoiTypes.includes(type.id)}
                    onChange={(e) => togglePOIType(type.id)}
                    className="rounded border-slate-500/50 text-amber-500 focus:ring-amber-500/30 bg-slate-800/60"
                  />
                  <div className="ml-2 flex items-center">
                    <div className="w-4 h-4 mr-2 flex items-center justify-center">
                      {isIconUrl(type.icon) ? (
                        <img 
                          src={getDisplayImageUrl(type.icon)} 
                          alt={type.name}
                          className="w-4 h-4 object-contain"
                        />
                      ) : (
                        <span className="text-xs leading-none">{String(type.icon || '')}</span>
                      )}
                    </div>
                    <span className="text-sm text-amber-200 group-hover:text-amber-100 transition-colors">
                      {String(type.name || '')}
                    </span>
                  </div>
                </label>
                <span className="text-xs text-amber-300/70">
                  {getPoiCountForType(type.id)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-80 dune-panel border-r overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-600">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-amber-200 flex items-center">
              <Database size={18} className="mr-2" />
              POI Entity Linking
            </h2>
            <button 
              className="dune-button-secondary py-1 px-2 text-xs rounded"
              onClick={onTogglePanel}
            >
              ⬅️
            </button>
          </div>
          <p className="text-sm text-slate-400">Loading data...</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-amber-300">Loading filters...</div>
        </div>
      </div>
    );
  }

  const POIFiltersTab = () => (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
        <input
          key="poi-search-input"
          type="text"
          placeholder="Search by title, description..."
          value={poiFilters.searchQuery}
          onChange={handlePOISearchChange}
          ref={poiSearchRef}
          className="w-full pl-10 pr-8 py-2 rounded-lg bg-slate-800 border border-slate-600 text-amber-100 placeholder-slate-400 focus:border-amber-400 focus:outline-none text-sm"
        />
        {poiFilters.searchQuery && (
          <button
            onClick={() => updatePOIFilters({ searchQuery: '' })}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-amber-100"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Map Type */}
      <div>
        <label className="block text-sm font-medium text-amber-200 mb-2">Map Type</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => updatePOIFilters({ mapType: 'both' })}
            className={`py-2 px-3 text-xs rounded-lg transition-all duration-200 ${
              poiFilters.mapType === 'both' ? 'dune-button-primary' : 'dune-button-secondary'
            }`}
          >
            🌍 Both
          </button>
          <button
            onClick={() => updatePOIFilters({ mapType: 'hagga' })}
            className={`py-2 px-3 text-xs rounded-lg transition-all duration-200 ${
              poiFilters.mapType === 'hagga' ? 'dune-button-primary' : 'dune-button-secondary'
            }`}
          >
            🏔️ Hagga Basin
          </button>
          <button
            onClick={() => updatePOIFilters({ mapType: 'deep' })}
            className={`py-2 px-3 text-xs rounded-lg transition-all duration-200 ${
              poiFilters.mapType === 'deep' ? 'dune-button-primary' : 'dune-button-secondary'
            }`}
          >
            🏜️ Deep Desert
          </button>
        </div>
      </div>

      {/* Privacy Level */}
      <div>
        <label className="block text-sm font-medium text-amber-200 mb-2">Privacy Level</label>
        <div className="space-y-2">
          <label className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={poiFilters.privacyLevels.public}
                onChange={(e) => updatePOIFilters({ 
                  privacyLevels: { ...poiFilters.privacyLevels, public: e.target.checked }
                })}
                className="mr-2 rounded text-amber-500"
              />
              <span className="text-sm">🌍 Public</span>
            </div>
          </label>
          <label className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={poiFilters.privacyLevels.private}
                onChange={(e) => updatePOIFilters({ 
                  privacyLevels: { ...poiFilters.privacyLevels, private: e.target.checked }
                })}
                className="mr-2 rounded text-amber-500"
              />
              <span className="text-sm">🔒 Private</span>
            </div>
          </label>
          <label className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={poiFilters.privacyLevels.shared}
                onChange={(e) => updatePOIFilters({ 
                  privacyLevels: { ...poiFilters.privacyLevels, shared: e.target.checked }
                })}
                className="mr-2 rounded text-amber-500"
              />
              <span className="text-sm">👥 Shared</span>
            </div>
          </label>
        </div>
      </div>

      {/* All POIs Toggle */}
      <div className="relative overflow-hidden rounded-lg">
        <div className="absolute inset-0 bg-slate-800/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-700/20 via-transparent to-slate-800/30" />
        
        <div className="relative z-10 border border-slate-600/40 backdrop-blur-sm">
          <button
            onClick={toggleAllPOIs}
            className="w-full px-4 py-3 text-left flex items-center justify-between transition-all duration-300 hover:bg-slate-700/20 group"
          >
            <div className="flex items-center">
              <Database className="text-amber-400 mr-3" size={18} />
              <span className="font-light text-amber-200 tracking-wide">
                {poiFilters.selectedPoiTypes.length === poiTypes.length ? 'Hide All POIs' : 'Show All POIs'}
              </span>
            </div>
            <span className="text-xs text-amber-300/70 px-2 py-1 bg-slate-700/40 rounded border border-slate-600/30 group-hover:bg-slate-700/50 transition-all duration-300">
              {poiFilters.selectedPoiTypes.length}
            </span>
          </button>
        </div>
      </div>

      {/* POI Categories */}
      <div>
        <label className="block text-sm font-medium text-amber-200 mb-3">POI Categories</label>
        <div className="space-y-2">
          {poiCategories.map(category => renderCategorySection(category))}
        </div>
      </div>
    </div>
  );

  const EntityFiltersTab = () => (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
        <input
          key="entity-search-input"
          type="text"
          placeholder="Search by name, description..."
          value={entityFilters.searchQuery}
          onChange={handleEntitySearchChange}
          ref={entitySearchRef}
          className="w-full pl-10 pr-8 py-2 rounded-lg bg-slate-800 border border-slate-600 text-amber-100 placeholder-slate-400 focus:border-amber-400 focus:outline-none text-sm"
        />
        {entityFilters.searchQuery && (
          <button
            onClick={() => updateEntityFilters({ searchQuery: '' })}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-amber-100"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Entity Class (Items/Schematics) */}
      <div>
        <label className="block text-sm font-medium text-amber-200 mb-2">Entity Class</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateEntityFilters({ 
              entityTypes: { ...entityFilters.entityTypes, items: !entityFilters.entityTypes.items }
            })}
            className={`py-2 px-3 text-xs rounded-lg transition-all duration-200 ${
              entityFilters.entityTypes.items ? 'dune-button-primary' : 'dune-button-secondary'
            }`}
          >
            ⚔️ Items
          </button>
          <button
            onClick={() => updateEntityFilters({ 
              entityTypes: { ...entityFilters.entityTypes, schematics: !entityFilters.entityTypes.schematics }
            })}
            className={`py-2 px-3 text-xs rounded-lg transition-all duration-200 ${
              entityFilters.entityTypes.schematics ? 'dune-button-primary' : 'dune-button-secondary'
            }`}
          >
            📐 Schematics
          </button>
        </div>
      </div>

      {/* Entity Categories */}
      <div>
        <label className="block text-sm font-medium text-amber-200 mb-2">Categories</label>
        <div className="space-y-2">
          {memoizedEntityCategories.map((category, index) => (
            <label key={`category-${index}-${category}`} className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={entityFilters.categories[category] !== false}
                  onChange={(e) => toggleEntityCategory(category, e.target.checked)}
                  className="mr-2 rounded text-amber-500"
                />
                <span className="text-sm capitalize">{category}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Entity Types */}
      <div>
        <label className="block text-sm font-medium text-amber-200 mb-2">Types</label>
        <div className="space-y-2">
          {memoizedEntityTypes.map((type, index) => (
            <label key={`type-${index}-${type}`} className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={entityFilters.types[type] !== false}
                  onChange={(e) => toggleEntityType(type, e.target.checked)}
                  className="mr-2 rounded text-amber-500"
                />
                <span className="text-sm capitalize">{type}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Tiers */}
      <div>
        <label className="block text-sm font-medium text-amber-200 mb-2">Tiers</label>
        <div className="flex flex-wrap gap-2">
          {validTiers.map(tier => {
            const tierKey = tier.tier_number.toString();
            const tierName = getTierName ? getTierName(tier.tier_number) : `T${tier.tier_number}`;
            
            return (
              <button
                key={tier.tier_number}
                onClick={() => toggleEntityTier(tierKey, !entityFilters.tiers[tierKey])}
                className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                  entityFilters.tiers[tierKey] !== false ? 'dune-button-primary' : 'dune-button-secondary'
                }`}
              >
                {String(tierName || `T${tier.tier_number}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scope */}
      <div>
        <label className="block text-sm font-medium text-amber-200 mb-2">Scope</label>
        <div className="space-y-2">
          <label className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={entityFilters.scope.global}
                onChange={(e) => updateEntityFilters({ 
                  scope: { ...entityFilters.scope, global: e.target.checked }
                })}
                className="mr-2 rounded text-amber-500"
              />
              <span className="text-sm">🌍 Global</span>
            </div>
          </label>
          <label className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={entityFilters.scope.custom}
                onChange={(e) => updateEntityFilters({ 
                  scope: { ...entityFilters.scope, custom: e.target.checked }
                })}
                className="mr-2 rounded text-amber-500"
              />
              <span className="text-sm">👤 Custom</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-80 dune-panel border-r overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-600">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-amber-200 flex items-center">
            <Database size={18} className="mr-2" />
            POI Entity Linking
          </h2>
          <button 
            className="dune-button-secondary py-1 px-2 text-xs rounded"
            onClick={onTogglePanel}
          >
            ⬅️
          </button>
        </div>
        <p className="text-sm text-slate-400">Link POIs with items and schematics</p>
        
        {/* Real-time counters */}
        <div className="mt-3 text-xs text-amber-300">
          {filterCounts.availablePOIs} POIs • {filterCounts.availableEntities} Entities Available
        </div>
        {(filterCounts.selectedPOIs > 0 || filterCounts.selectedEntities > 0) && (
          <div className="mt-1 text-xs text-green-400">
            {filterCounts.selectedPOIs} POIs • {filterCounts.selectedEntities} Entities Selected
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-600">
        <button
          onClick={() => setActiveTab('poi')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
            activeTab === 'poi'
              ? 'tab-active bg-amber-600/20 text-amber-200 border-b-2 border-amber-400'
              : 'tab-inactive text-slate-400 hover:text-amber-300'
          }`}
        >
          POI Filters
        </button>
        <button
          onClick={() => setActiveTab('entity')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
            activeTab === 'entity'
              ? 'tab-active bg-amber-600/20 text-amber-200 border-b-2 border-amber-400'
              : 'tab-inactive text-slate-400 hover:text-amber-300'
          }`}
        >
          Entity Filters
        </button>
      </div>

      {/* Filter Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className={activeTab === 'poi' ? 'block' : 'hidden'}>
          <POIFiltersTab />
        </div>
        <div className={activeTab === 'entity' ? 'block' : 'hidden'}>
          <EntityFiltersTab />
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-slate-600">
        <button
          onClick={clearAllFilters}
          className="w-full dune-button-secondary py-2 px-4 text-sm rounded-lg"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default FiltersPanel; 
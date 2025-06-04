import React, { useRef, useEffect } from 'react';
import { Database, Search, X, Eye, ChevronRight, Lock, Users } from 'lucide-react';

interface FiltersPanelProps {
  onTogglePanel: () => void;
  filterState: any; // Will be properly typed when we import the hook
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({ onTogglePanel, filterState }) => {
  const [activeTab, setActiveTab] = React.useState<'poi' | 'entity'>('poi');
  const [collapsedPOICategories, setCollapsedPOICategories] = React.useState<Set<string>>(new Set());
  const [collapsedEntityCategories, setCollapsedEntityCategories] = React.useState<Set<string>>(new Set());
  const [collapsedSubtypes, setCollapsedSubtypes] = React.useState<Set<string>>(new Set());
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
    updatePOIFilters,
    updateEntityFilters,
    clearAllFilters,
    filterCounts,
    togglePOICategory,
    togglePOIType,
    toggleAllPOIs,
    toggleEntityCategory,
    toggleEntityType,
    toggleEntitySubtype,
    toggleEntityTier,
    toggleAllEntities,
    poiTypes,
    tiers,
    validTiers,
    entityCategories,
    entityTypes,
    entities,
    pois,
    allEntities,
    allPOIs,
    getTierName,
    loading
  } = filterState;

  // Store ALL entities reference for filter calculations - NOT paginated data
  const allEntitiesRef = React.useRef(allEntities || []);
  React.useEffect(() => {
    // Always use the complete allEntities dataset for filter building
    if (allEntities && allEntities.length > 0) {
      allEntitiesRef.current = allEntities;
    }
  }, [allEntities]);

  // Initialize all subtypes as collapsed by default - AFTER entities is available
  React.useEffect(() => {
    if (allEntitiesRef.current.length > 0) {
      const subtypeKeys = new Set<string>();
      allEntitiesRef.current.forEach(entity => {
        if (entity.category?.name && entity.type?.name && entity.subtype?.name) {
          const subtypeKey = `${entity.category.name}-${entity.type.name}`;
          subtypeKeys.add(subtypeKey);
        }
      });
      setCollapsedSubtypes(subtypeKeys);
    }
  }, [allEntitiesRef.current]);

  // Memoize category calculations to prevent unnecessary re-renders
  const poiCategories = React.useMemo(() => 
    [...new Set(poiTypes.map(type => type.category))], 
    [poiTypes]
  );

  // Use the entity categories and types from the hook with safe conversion
  const memoizedEntityCategories = React.useMemo(() => {
    if (!Array.isArray(entityCategories)) return [];
    
    // Get categories directly from ALL entities to ensure accuracy - ALWAYS show all categories
    const categoriesFromEntities = Array.from(new Set(
      allEntitiesRef.current
        .filter(entity => entity.category?.name)
        .map(entity => entity.category!.name)
        .filter(name => name && name.trim() !== '')
    )).sort();
    
    // Always return all categories, regardless of filter state - UI handles visibility
    return categoriesFromEntities;
  }, [allEntitiesRef.current, entityCategories]);
  
  const memoizedEntityTypes = React.useMemo(() => {
    if (!Array.isArray(entityTypes)) return [];
    
    // Use Set to ensure uniqueness and prevent duplicates
    const uniqueTypes = Array.from(new Set(
      entityTypes
        .filter(t => t != null && typeof t !== 'object')  // Filter out objects
        .map(t => String(t))
        .filter(t => t !== '' && t !== 'undefined' && t !== 'null') // Filter out invalid strings
    ));
    
    return uniqueTypes.sort(); // Sort for consistent ordering
  }, [entityTypes]);
  
  // Use the validTiers from hook instead of local filtering
  const tiersToDisplay = React.useMemo(() => 
    validTiers || tiers, 
    [validTiers, tiers]
  );

  // Render entity category section exactly like POI filters but with subtype support
  const renderEntityCategorySection = (category: string, columnIndex?: number) => {
    const categoryVisible = entityFilters.categories[category] !== false;
    const isCollapsed = collapsedEntityCategories.has(category);
    
    // Get types for this category - ALWAYS show category even if types are filtered
    const categoryTypes = Array.from(new Set(
      allEntitiesRef.current
        .filter(entity => entity.category?.name === category && entity.type?.name)
        .map(entity => entity.type!.name)
    )).sort();

    // Always render category section - filtering is visual only, not structural
    // if (categoryTypes.length === 0) return null;

    return (
      <div key={`entity-${category}-${columnIndex || 0}`} className="mb-4">
        {/* Enhanced Category Header - exact match to POI filters */}
        <div className="flex items-center justify-between mb-2 px-3 py-2 rounded-lg bg-gradient-to-r from-slate-800/40 via-slate-700/30 to-slate-800/40 border border-amber-400/20">
          <h4 className="text-sm font-medium text-amber-200 tracking-wide flex-1"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            {category} ({getEntityCountForCategory(category)})
          </h4>
          <div className="flex items-center gap-1">
            {/* Category Visibility Toggle */}
            <button
              onClick={() => toggleEntityCategory(category, !categoryVisible)}
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
              onClick={() => toggleEntityCategoryCollapse(category)}
              className="p-1 text-amber-400/70 hover:text-amber-300 hover:bg-amber-500/10 rounded transition-all duration-200"
              title={isCollapsed ? 'Expand category' : 'Collapse category'}
            >
              <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`} />
            </button>
          </div>
        </div>

        {/* Category Types - exact match to POI filters with subtype support */}
        {!isCollapsed && (
          <div className="space-y-1 ml-2">
            {categoryTypes.map(type => {
              const typeVisible = entityFilters.types[type] !== false;
              const typeEntityCount = allEntitiesRef.current.filter(entity => 
                entity.category?.name === category && entity.type?.name === type
              ).length;
              
              // Get subtypes for this type - only show if there are meaningful subtypes (not just "None")
              const allTypeSubtypes = Array.from(new Set(
                allEntitiesRef.current
                  .filter(entity => 
                    entity.category?.name === category && 
                    entity.type?.name === type && 
                    entity.subtype?.name
                  )
                  .map(entity => entity.subtype!.name)
              )).sort();
              
              // Only show subtypes if there are meaningful ones (more than just "None" or has real subtypes alongside "None")
              const meaningfulSubtypes = allTypeSubtypes.filter(subtype => subtype.toLowerCase() !== 'none');
              const typeSubtypes = meaningfulSubtypes.length > 0 ? allTypeSubtypes : [];

              const subtypeKey = `${category}-${type}`;
              const subtypesCollapsed = collapsedSubtypes.has(subtypeKey);
              
              return (
                <div key={`entity-type-${category}-${type}`} className="space-y-1">
                  {/* Type Header with Toggle Controls */}
                  <div className="flex items-center justify-between mb-1 px-2 py-1.5 rounded-lg bg-gradient-to-r from-slate-800/40 via-slate-700/30 to-slate-800/40 border border-amber-400/20">
                    <div className="flex items-center gap-2 flex-1">
                      {/* Type Icon */}
                      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs leading-none text-amber-300">
                          📦
                        </span>
                      </div>
                      
                      {/* Type Name with Count */}
                      <span className="text-xs font-light tracking-wide text-amber-200">
                        {type} ({getEntityCountForType(category, type)})
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Type Visibility Toggle */}
                      <button
                        onClick={() => toggleEntityType(type, !typeVisible)}
                        className={`p-1 rounded transition-all duration-200 ${
                          !typeVisible 
                            ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' 
                            : 'text-amber-400/70 hover:text-amber-300 hover:bg-amber-500/10'
                        }`}
                        title={typeVisible ? 'Hide type' : 'Show type'}
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      
                      {/* Subtype Collapse Toggle - only show if subtypes exist */}
                      {typeSubtypes.length > 0 && (
                        <button
                          onClick={() => {
                            setCollapsedSubtypes(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(subtypeKey)) {
                                newSet.delete(subtypeKey);
                              } else {
                                newSet.add(subtypeKey);
                              }
                              return newSet;
                            });
                          }}
                          className="p-1 text-amber-400/70 hover:text-amber-300 hover:bg-amber-500/10 rounded transition-all duration-200"
                          title={subtypesCollapsed ? 'Show subtypes' : 'Hide subtypes'}
                        >
                          <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${subtypesCollapsed ? '' : 'rotate-90'}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Subtypes - collapsible, collapsed by default */}
                  {typeSubtypes.length > 0 && !subtypesCollapsed && (
                    <div className="ml-6 space-y-1 relative">
                      {typeSubtypes.map((subtype) => {
                        const subtypeEntityCount = allEntitiesRef.current.filter(entity => 
                          entity.category?.name === category && 
                          entity.type?.name === type && 
                          entity.subtype?.name === subtype
                        ).length;

                        const subtypeVisible = entityFilters.subtypes?.[subtype] !== false;
                        
                        return (
                          <button
                            key={`entity-subtype-${category}-${type}-${subtype}`}
                            onClick={() => toggleEntitySubtype(subtype, !subtypeVisible)}
                            className={`w-full flex items-center gap-2 px-2 py-1 text-xs rounded transition-all duration-200 text-left ${
                              subtypeVisible
                                ? 'text-amber-200/90 bg-slate-800/40 border border-amber-400/30'
                                : 'text-amber-200/50 bg-slate-800/20 hover:bg-slate-800/30 hover:text-amber-200/70'
                            }`}
                          >
                            {/* Subtype Icon */}
                            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-amber-300/50">
                                ·
                              </span>
                            </div>
                            
                            {/* Subtype Name with Count */}
                            <span className="font-light tracking-wide flex-1">
                              {subtype} ({subtypeEntityCount})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

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

  // Category collapse functions
  const togglePOICategoryCollapse = (category: string) => {
    setCollapsedPOICategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

    const toggleEntityCategoryCollapse = (category: string) => {
    setCollapsedEntityCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
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

  // Get POI count for a type - implement proper counting
  const getPoiCountForType = (typeId: string) => {
    return pois.filter(poi => poi.poi_type_id === typeId).length;
  };

  // Get POI count for a category
  const getPoiCountForCategory = (category: string) => {
    const categoryTypeIds = poiTypes
      .filter(type => type.category === category)
      .map(type => type.id);
    return pois.filter(poi => categoryTypeIds.includes(poi.poi_type_id)).length;
  };

  // Get entity count for a category
  const getEntityCountForCategory = (category: string) => {
    return allEntitiesRef.current.filter(entity => entity.category?.name === category).length;
  };

  // Get entity count for a type
  const getEntityCountForType = (category: string, type: string) => {
    return allEntitiesRef.current.filter(entity => 
      entity.category?.name === category && entity.type?.name === type
    ).length;
  };

  // Check if category is visible (all types in category are selected)
  const isCategoryVisible = (category: string) => {
    const categoryTypes = poiTypes.filter(type => type.category === category);
    return categoryTypes.some(type => poiFilters.selectedPoiTypes.includes(type.id));
  };

  // Render category section exactly like MapControlPanel
  const renderPOICategorySection = (category: string) => {
    const categoryTypes = poiTypes
      .filter(type => type.category === category)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    if (categoryTypes.length === 0) return null;
    
    const categoryTypeIds = categoryTypes.map(type => type.id);
    const categoryVisible = categoryTypeIds.length > 0 && categoryTypeIds.some(id => poiFilters.selectedPoiTypes.includes(id));
    const isCollapsed = collapsedPOICategories.has(category);

    return (
      <div key={category} className="mb-4">
        {/* Enhanced Category Header - exact match to MapControlPanel */}
        <div className="flex items-center justify-between mb-2 px-3 py-2 rounded-lg bg-gradient-to-r from-slate-800/40 via-slate-700/30 to-slate-800/40 border border-amber-400/20">
          <h4 className="text-sm font-medium text-amber-200 tracking-wide flex-1"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            {category} ({getPoiCountForCategory(category)})
          </h4>
          <div className="flex items-center gap-1">
            {/* Category Visibility Toggle */}
            <button
              onClick={() => togglePOICategory(category, !categoryVisible)}
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
              onClick={() => togglePOICategoryCollapse(category)}
              className="p-1 text-amber-400/70 hover:text-amber-300 hover:bg-amber-500/10 rounded transition-all duration-200"
              title={isCollapsed ? 'Expand category' : 'Collapse category'}
            >
              <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`} />
            </button>
          </div>
        </div>

        {/* Category Types - exact match to MapControlPanel */}
        {!isCollapsed && (
          <div className="space-y-1 ml-2">
            {categoryTypes.map(type => {
              const isSelected = poiFilters.selectedPoiTypes.includes(type.id);
              const poiCount = getPoiCountForType(type.id);
              const displayIcon = getDisplayImageUrl(type.icon);
              
              return (
                <button
                  key={type.id}
                  onClick={() => togglePOIType(type.id)}
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

  if (loading) {
    return (
      <div className="w-[30rem] dune-panel border-r overflow-hidden flex flex-col">
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

      {/* Show/Hide All Toggle - exact match to MapControlPanel */}
      <div className="flex justify-between items-center mb-4">
        <label className="block text-sm font-light text-amber-200 tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
          Points of Interest
        </label>
        <div className="flex gap-2">
          <button
            onClick={toggleAllPOIs}
            className="text-xs text-amber-300 hover:text-amber-100 font-light transition-all duration-300 px-2 py-1 rounded border border-amber-400/20 hover:border-amber-400/40 hover:bg-amber-400/10"
            title="Toggle All POIs"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          >
            {(() => {
              const allTypeIds = poiTypes.map(type => type.id);
              const allTypesSelected = allTypeIds.length > 0 && allTypeIds.every(id => poiFilters.selectedPoiTypes.includes(id));
              return allTypesSelected ? 'Hide All' : 'Show All';
            })()}
          </button>
        </div>
      </div>

      {/* POI Categories in Two Columns - exact match to MapControlPanel */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Left Column */}
        <div className="space-y-1">
          {poiCategories
            .filter((_, index) => index % 2 === 0)
            .map(category => renderPOICategorySection(category))}
        </div>
        
        {/* Right Column */}
        <div className="space-y-1">
          {poiCategories
            .filter((_, index) => index % 2 === 1)
            .map(category => renderPOICategorySection(category))}
        </div>
      </div>

      {/* Privacy Level - moved to bottom, exact match to MapControlPanel Additional Filters */}
      <div className="border-t border-slate-700/50 pt-4">
        <h4 className="text-sm font-medium text-amber-200 mb-3">Additional Filters</h4>
        
        {/* Visibility Presets - exact match to MapControlPanel */}
        <div>
          <label className="block text-sm font-medium text-amber-200/80 mb-2">
            Quick Visibility Filters
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => updatePOIFilters({ 
                privacyLevels: { public: true, private: false, shared: false }
              })}
              className={`px-3 py-2 text-xs rounded border flex items-center justify-center gap-1 transition-all ${
                poiFilters.privacyLevels.public && !poiFilters.privacyLevels.private && !poiFilters.privacyLevels.shared
                  ? 'bg-amber-600/20 border-amber-500/50 text-amber-200'
                  : 'bg-slate-800/50 border-slate-600/50 text-amber-300/70 hover:bg-slate-700/50 hover:text-amber-200'
              }`}
            >
              <Eye className="w-3 h-3 text-green-400" />
              Public Only
            </button>
            <button
              onClick={() => updatePOIFilters({ 
                privacyLevels: { public: false, private: true, shared: false }
              })}
              className={`px-3 py-2 text-xs rounded border flex items-center justify-center gap-1 transition-all ${
                !poiFilters.privacyLevels.public && poiFilters.privacyLevels.private && !poiFilters.privacyLevels.shared
                  ? 'bg-amber-600/20 border-amber-500/50 text-amber-200'
                  : 'bg-slate-800/50 border-slate-600/50 text-amber-300/70 hover:bg-slate-700/50 hover:text-amber-200'
              }`}
            >
              <span className="w-3 h-3 text-red-400">🔒</span>
              Private Only
            </button>
            <button
              onClick={() => updatePOIFilters({ 
                privacyLevels: { public: false, private: false, shared: true }
              })}
              className={`px-3 py-2 text-xs rounded border flex items-center justify-center gap-1 transition-all ${
                !poiFilters.privacyLevels.public && !poiFilters.privacyLevels.private && poiFilters.privacyLevels.shared
                  ? 'bg-amber-600/20 border-amber-500/50 text-amber-200'
                  : 'bg-slate-800/50 border-slate-600/50 text-amber-300/70 hover:bg-slate-700/50 hover:text-amber-200'
              }`}
            >
              <span className="w-3 h-3 text-blue-400">👥</span>
              Shared Only
            </button>
            <button
              onClick={() => updatePOIFilters({ 
                privacyLevels: { public: true, private: true, shared: true }
              })}
              className={`px-3 py-2 text-xs rounded border flex items-center justify-center gap-1 transition-all ${
                poiFilters.privacyLevels.public && poiFilters.privacyLevels.private && poiFilters.privacyLevels.shared
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
  );

  const EntityFiltersTab = () => (
    <div className="space-y-4">
      {/* Entity Search - Match POI search styling exactly */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
        <input
          key="entity-search-input"
          type="text"
          placeholder="Search items, schematics..."
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

      {/* Show All / Hide All Button for Entities */}
      <div className="flex justify-between items-center mb-4">
        <label className="block text-sm font-light text-amber-200 tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
          Items & Schematics
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => updateEntityFilters({ 
              entityTypes: { ...entityFilters.entityTypes, items: !entityFilters.entityTypes.items }
            })}
            className={`text-xs font-light transition-all duration-300 px-2 py-1 rounded border border-amber-400/20 hover:border-amber-400/40 hover:bg-amber-400/10 ${
              entityFilters.entityTypes.items 
                ? 'text-amber-100 bg-amber-600/20' 
                : 'text-amber-300 hover:text-amber-100'
            }`}
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          >
            Items
          </button>
          <button
            onClick={() => updateEntityFilters({ 
              entityTypes: { ...entityFilters.entityTypes, schematics: !entityFilters.entityTypes.schematics }
            })}
            className={`text-xs font-light transition-all duration-300 px-2 py-1 rounded border border-amber-400/20 hover:border-amber-400/40 hover:bg-amber-400/10 ${
              entityFilters.entityTypes.schematics 
                ? 'text-amber-100 bg-amber-600/20' 
                : 'text-amber-300 hover:text-amber-100'
            }`}
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          >
            Schematics
          </button>
          <button
            onClick={toggleAllEntities}
            className="text-xs text-amber-300 hover:text-amber-100 font-light transition-all duration-300 px-2 py-1 rounded border border-amber-400/20 hover:border-amber-400/40 hover:bg-amber-400/10"
            title="Toggle All Entities"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          >
            {(() => {
              const allCategories = Object.keys(entityFilters.categories);
              const allTypes = Object.keys(entityFilters.types);
              const allTiers = Object.keys(entityFilters.tiers);
              
              const allCategoriesSelected = allCategories.every(cat => entityFilters.categories[cat] === true);
              const allTypesSelected = allTypes.every(type => entityFilters.types[type] === true);
              const allTiersSelected = allTiers.every(tier => entityFilters.tiers[tier] === true);
              
              return (allCategoriesSelected && allTypesSelected && allTiersSelected) ? 'Hide All' : 'Show All';
            })()}
          </button>
        </div>
      </div>

      {/* Entity Categories in Two Columns - same as POI filters */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Left Column */}
        <div className="space-y-1">
          {memoizedEntityCategories
            .filter((_, index) => index % 2 === 0)
            .map((category) => renderEntityCategorySection(category, 0))}
        </div>
        
        {/* Right Column */}
        <div className="space-y-1">
          {memoizedEntityCategories
            .filter((_, index) => index % 2 === 1)
            .map((category) => renderEntityCategorySection(category, 1))}
        </div>
      </div>

      {/* Additional Filters - exact match to POI additional filters */}
      <div className="border-t border-slate-700/50 pt-4">
        <h4 className="text-sm font-medium text-amber-200 mb-3">Additional Filters</h4>
        
        {/* Entity Tiers Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-amber-200/80 mb-2">
            Entity Tiers
          </label>
          <div className="grid grid-cols-2 gap-2">
            {tiersToDisplay.slice(0, 6).map(tier => {
              const tierKey = tier.tier_number.toString();
              const tierName = getTierName ? getTierName(tier.tier_number) : `T${tier.tier_number}`;
              
              return (
                <button
                  key={tier.tier_number}
                  onClick={() => toggleEntityTier(tierKey, !entityFilters.tiers[tierKey])}
                  className={`px-3 py-2 text-xs rounded border flex items-center justify-center gap-1 transition-all ${
                    entityFilters.tiers[tierKey] !== false
                      ? 'bg-amber-600/20 border-amber-500/50 text-amber-200'
                      : 'bg-slate-800/50 border-slate-600/50 text-amber-300/70 hover:bg-slate-700/50 hover:text-amber-200'
                  }`}
                >
                  {String(tierName || `T${tier.tier_number}`)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Entity Scope Section */}
        <div>
          <label className="block text-sm font-medium text-amber-200/80 mb-2">
            Entity Scope
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => updateEntityFilters({ 
                scope: { ...entityFilters.scope, global: !entityFilters.scope.global }
              })}
              className={`px-3 py-2 text-xs rounded border flex items-center justify-center gap-1 transition-all ${
                entityFilters.scope.global
                  ? 'bg-amber-600/20 border-amber-500/50 text-amber-200'
                  : 'bg-slate-800/50 border-slate-600/50 text-amber-300/70 hover:bg-slate-700/50 hover:text-amber-200'
              }`}
            >
              🌍 Global
            </button>
            <button
              onClick={() => updateEntityFilters({ 
                scope: { ...entityFilters.scope, custom: !entityFilters.scope.custom }
              })}
              className={`px-3 py-2 text-xs rounded border flex items-center justify-center gap-1 transition-all ${
                entityFilters.scope.custom
                  ? 'bg-amber-600/20 border-amber-500/50 text-amber-200'
                  : 'bg-slate-800/50 border-slate-600/50 text-amber-300/70 hover:bg-slate-700/50 hover:text-amber-200'
              }`}
            >
              👤 Custom
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-[30rem] dune-panel border-r overflow-hidden flex flex-col">
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
              : 'tab-inactive text-amber-300/80 hover:text-amber-200'
          }`}
        >
          POI Filters
        </button>
        <button
          onClick={() => setActiveTab('entity')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
            activeTab === 'entity'
              ? 'tab-active bg-amber-600/20 text-amber-200 border-b-2 border-amber-400'
              : 'tab-inactive text-amber-300/80 hover:text-amber-200'
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
    </div>
  );
};

export default FiltersPanel; 
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, X, Plus, Package, FileText, Search, Filter, Check } from 'lucide-react';
import { useItemsSchematics } from '../../hooks/useItemsSchematics';
import CreateEditItemSchematicModal from './CreateEditItemSchematicModal';

type ActiveView = 'all' | 'items' | 'schematics';

interface CategoryHierarchyNavProps {
  activeView: 'all' | 'items' | 'schematics';
  selectedCategory: any;
  onCategorySelect: (category: any) => void;
  filters: any;
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
  filteredCount: number;
  onEntityCreated?: (entity: any) => void;
  // New props for view switching
  onViewChange?: (view: 'all' | 'items' | 'schematics') => void;
  // Search props  
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

const CategoryHierarchyNav: React.FC<CategoryHierarchyNavProps> = ({
  activeView,
  selectedCategory,
  onCategorySelect,
  filters,
  onFiltersChange,
  onClose,
  filteredCount,
  onEntityCreated,
  onViewChange,
  searchTerm = '',
  onSearchChange
}) => {
  const { categories, types, tiers, loading, refetchAllTypes } = useItemsSchematics();
  
  // Local state
  const [localActiveView, setLocalActiveView] = useState<ActiveView>(activeView);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // Simple filter state - just track what's selected
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedTiers, setSelectedTiers] = useState<Set<string>>(new Set());
  const [filtersInitialized, setFiltersInitialized] = useState(false);

  // Advanced search state
  const [advancedFilters, setAdvancedFilters] = useState({
    createdBy: '',
    dateFrom: '',
    dateTo: '',
    hasDescription: false
  });

  // Sync local view with prop
  useEffect(() => {
    setLocalActiveView(activeView);
  }, [activeView]);

  // Initialize filters when data loads
  useEffect(() => {
    if (!filtersInitialized && categories.length > 0 && tiers.length > 0) {
      console.log('Initializing filters...');
      console.log('Categories:', categories);
      console.log('Types:', types); 
      console.log('Tiers:', tiers);
      
      // Get categories that apply to current view
      const applicableCategories = getApplicableCategoriesForView(localActiveView);
      console.log('Applicable categories for view', localActiveView, ':', applicableCategories);
      
      // Select all applicable categories
      const categoryIds = applicableCategories.map(cat => cat.id);
      setSelectedCategories(new Set(categoryIds));
      
      // Select all types (we'll filter them by applicable categories later)
      const typeIds = types.map(type => type.id);
      setSelectedTypes(new Set(typeIds));
      
      // Select all tiers independently
      const tierIds = tiers.map(tier => tier.id);
      setSelectedTiers(new Set(tierIds));
      
      setFiltersInitialized(true);
      
      // Update parent with initial filters
      updateParentFilters(localActiveView, new Set(categoryIds), new Set(typeIds), new Set(tierIds));
    }
  }, [categories, types, tiers, localActiveView, filtersInitialized]);

  // Get categories that apply to a specific view
  const getApplicableCategoriesForView = (view: ActiveView) => {
    if (view === 'all') {
      return categories; // All categories are applicable for 'all' view
    }
    
    return categories.filter(category => {
      if (Array.isArray(category.applies_to)) {
        return category.applies_to.includes(view) || category.applies_to.includes('both');
      }
      return category.applies_to === 'both' || category.applies_to === view;
    });
  };

  // Update parent component with current filter state
  const updateParentFilters = (view: ActiveView, categories: Set<string>, types: Set<string>, tiers: Set<string>) => {
    const filters = {
      view: view,
      categories: Array.from(categories),
      types: Array.from(types),
      tiers: Array.from(tiers),
      searchTerm: localSearchTerm,
      ...advancedFilters
    };
    
    console.log('Updating parent filters:', filters);
    onFiltersChange(filters);
  };

  // Handle view change
  const handleViewChange = (view: ActiveView) => {
    console.log('View changed to:', view);
    setLocalActiveView(view);
    
    // Reset filters when view changes to ensure we show applicable categories
    setFiltersInitialized(false);
    
    // Notify parent
    onViewChange?.(view);
  };

  // Handle search
  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
    onSearchChange?.(value);
    updateParentFilters(localActiveView, selectedCategories, selectedTypes, selectedTiers);
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Handle category toggle
  const handleCategoryToggle = (categoryId: string) => {
    const newSelectedCategories = new Set(selectedCategories);
    const newSelectedTypes = new Set(selectedTypes);
    
    if (selectedCategories.has(categoryId)) {
      // Deselect category and its types
      newSelectedCategories.delete(categoryId);
      // Remove all types that belong to this category
      const categoryTypes = types.filter(type => type.category_id === categoryId);
      categoryTypes.forEach(type => newSelectedTypes.delete(type.id));
    } else {
      // Select category and its types
      newSelectedCategories.add(categoryId);
      // Add all types that belong to this category
      const categoryTypes = types.filter(type => type.category_id === categoryId);
      categoryTypes.forEach(type => newSelectedTypes.add(type.id));
    }
    
    setSelectedCategories(newSelectedCategories);
    setSelectedTypes(newSelectedTypes);
    updateParentFilters(localActiveView, newSelectedCategories, newSelectedTypes, selectedTiers);
  };

  // Handle type toggle
  const handleTypeToggle = (typeId: string) => {
    const newSelectedTypes = new Set(selectedTypes);
    
    if (selectedTypes.has(typeId)) {
      newSelectedTypes.delete(typeId);
    } else {
      newSelectedTypes.add(typeId);
    }
    
    setSelectedTypes(newSelectedTypes);
    updateParentFilters(localActiveView, selectedCategories, newSelectedTypes, selectedTiers);
  };

  // Handle tier toggle
  const handleTierToggle = (tierId: string) => {
    const newSelectedTiers = new Set(selectedTiers);
    
    if (selectedTiers.has(tierId)) {
      newSelectedTiers.delete(tierId);
    } else {
      newSelectedTiers.add(tierId);
    }
    
    setSelectedTiers(newSelectedTiers);
    updateParentFilters(localActiveView, selectedCategories, selectedTypes, newSelectedTiers);
  };

  // Handle "Show All" / "Hide All" toggle for categories and types only
  const handleToggleAll = () => {
    const applicableCategories = getApplicableCategoriesForView(localActiveView);
    const allCategoryIds = applicableCategories.map(cat => cat.id);
    const allSelected = allCategoryIds.every(id => selectedCategories.has(id));
    
    if (allSelected) {
      // Hide all categories and types
      setSelectedCategories(new Set());
      setSelectedTypes(new Set());
      updateParentFilters(localActiveView, new Set(), new Set(), selectedTiers);
    } else {
      // Show all categories and types
      const categoryIds = new Set(allCategoryIds);
      const typeIds = new Set(types.map(type => type.id));
      
      setSelectedCategories(categoryIds);
      setSelectedTypes(typeIds);
      updateParentFilters(localActiveView, categoryIds, typeIds, selectedTiers);
    }
  };

  // Handle "Show All" / "Hide All" toggle for tiers only
  const handleToggleAllTiers = () => {
    const allTierIds = tiers.map(tier => tier.id);
    const allSelected = allTierIds.every(id => selectedTiers.has(id));
    
    if (allSelected) {
      // Hide all tiers
      setSelectedTiers(new Set());
      updateParentFilters(localActiveView, selectedCategories, selectedTypes, new Set());
    } else {
      // Show all tiers
      const tierIds = new Set(allTierIds);
      setSelectedTiers(tierIds);
      updateParentFilters(localActiveView, selectedCategories, selectedTypes, tierIds);
    }
  };

  // Get types for a specific category
  const getTypesForCategory = (categoryId: string) => {
    return types.filter(type => type.category_id === categoryId);
  };

  const handleCreateNew = () => {
    setShowCreateModal(true);
  };

  const handleEntityCreated = (entity: any) => {
    setShowCreateModal(false);
    if (onEntityCreated) {
      onEntityCreated(entity);
    }
  };

  // Get categories to display based on current view
  const applicableCategories = getApplicableCategoriesForView(localActiveView);

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-amber-400/20">
          <h2 className="text-lg font-light text-amber-200 tracking-wide"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Controls
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-amber-200/70 hover:text-amber-300 hover:bg-amber-500/20 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Selection */}
        <div className="p-4 border-b border-amber-400/20">
          <div className="space-y-3">
            <h3 className="text-sm font-light text-amber-200/80 tracking-wide"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              View
            </h3>
            
            <div className="flex border-b border-amber-400/20">
              <button
                onClick={() => handleViewChange('all')}
                className={`relative px-4 py-3 text-sm font-light transition-all duration-700 group/all overflow-hidden ${
                  localActiveView === 'all' 
                    ? 'text-amber-200' 
                    : 'text-amber-300/70 hover:text-amber-200'
                }`}
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                {/* Background layers for active state */}
                {localActiveView === 'all' && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-800/60" />
                  </>
                )}
                
                {/* Interactive purple overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-violet-500/10 to-violet-600/20 opacity-0 group-hover/all:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 flex items-center tracking-wide">
                  All
                </div>
                
                {/* Expanding underline */}
                <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent transition-all duration-700 ${
                  localActiveView === 'all' ? 'w-full' : 'w-0 group-hover/all:w-full'
                }`} />
              </button>
              
              <button
                onClick={() => handleViewChange('items')}
                className={`relative px-4 py-3 text-sm font-light transition-all duration-700 group/items overflow-hidden ${
                  localActiveView === 'items' 
                    ? 'text-amber-200' 
                    : 'text-amber-300/70 hover:text-amber-200'
                }`}
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                {/* Background layers for active state */}
                {localActiveView === 'items' && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-800/60" />
                  </>
                )}
                
                {/* Interactive purple overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-violet-500/10 to-violet-600/20 opacity-0 group-hover/items:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 flex items-center tracking-wide">
                  Items
                </div>
                
                {/* Expanding underline */}
                <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent transition-all duration-700 ${
                  localActiveView === 'items' ? 'w-full' : 'w-0 group-hover/items:w-full'
                }`} />
              </button>
              
              <button
                onClick={() => handleViewChange('schematics')}
                className={`relative px-4 py-3 text-sm font-light transition-all duration-700 group/schematics overflow-hidden ${
                  localActiveView === 'schematics' 
                    ? 'text-amber-200' 
                    : 'text-amber-300/70 hover:text-amber-200'
                }`}
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                {/* Background layers for active state */}
                {localActiveView === 'schematics' && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-800/60" />
                  </>
                )}
                
                {/* Interactive purple overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-violet-500/10 to-violet-600/20 opacity-0 group-hover/schematics:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 flex items-center tracking-wide">
                  Schematics
                </div>
                
                {/* Expanding underline */}
                <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent transition-all duration-700 ${
                  localActiveView === 'schematics' ? 'w-full' : 'w-0 group-hover/schematics:w-full'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Create New Button */}
        <div className="p-4 border-b border-amber-400/20">
          <button
            onClick={handleCreateNew}
            className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500/20 to-amber-600/20 
                     hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-400/30 rounded-lg 
                     text-amber-200 font-light tracking-wide transition-all duration-200"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          >
            <Plus className="w-4 h-4" />
            <Package className="w-4 h-4" />
            Add Item / Schematic
          </button>
        </div>

        {/* Search Section */}
        <div className="p-4 border-b border-amber-400/20">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-light text-amber-200/80 tracking-wide"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Search
              </h3>
              <button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="text-xs text-amber-300/70 hover:text-amber-300 transition-colors font-light"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                {showAdvancedSearch ? 'Hide' : 'Advanced'}
              </button>
            </div>
            
            {/* Basic Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-amber-300/60" />
              </div>
              <input
                type="text"
                value={localSearchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 placeholder-slate-400
                         focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 text-sm"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                placeholder={`Search ${localActiveView === 'all' ? 'items & schematics' : localActiveView}...`}
              />
            </div>

            {/* Advanced Search (Collapsible) */}
            {showAdvancedSearch && (
              <div className="space-y-3 p-3 bg-slate-800/40 border border-amber-400/10 rounded-lg">
                <div>
                  <label className="block text-xs text-amber-200/70 mb-1 font-light"
                         style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    Created By
                  </label>
                  <input
                    type="text"
                    value={advancedFilters.createdBy}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, createdBy: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-amber-100 placeholder-slate-400
                             focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 text-sm"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                    placeholder="Username or email"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-amber-200/70 mb-1 font-light"
                           style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      From Date
                    </label>
                    <input
                      type="date"
                      value={advancedFilters.dateFrom}
                      onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-amber-100
                               focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 text-sm"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-amber-200/70 mb-1 font-light"
                           style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      To Date
                    </label>
                    <input
                      type="date"
                      value={advancedFilters.dateTo}
                      onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-amber-100
                               focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 text-sm"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                    />
                  </div>
                </div>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={advancedFilters.hasDescription}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, hasDescription: e.target.checked }))}
                    className="rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/30"
                  />
                  <span className="ml-2 text-sm text-amber-200/70 font-light"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    Has description
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Category / Type Filter Header with All toggle */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-light text-amber-200/80 tracking-wide"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Category / Type Filter
              </h3>
              <button
                onClick={handleToggleAll}
                className="text-xs text-amber-300/70 hover:text-amber-300 transition-colors font-light"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                {applicableCategories.every(cat => selectedCategories.has(cat.id)) ? 'Hide All' : 'Show All'}
              </button>
            </div>

            {loading.categories ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
                <span className="ml-2 text-amber-200/70 font-light">Loading...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Categories */}
                {applicableCategories.map((category) => {
                  const categoryTypes = getTypesForCategory(category.id);
                  const isExpanded = expandedCategories.has(category.id);
                  const isSelected = selectedCategories.has(category.id);
                  
                  return (
                    <div key={category.id} className="space-y-2">
                      {/* Category Header */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleCategoryExpansion(category.id)}
                          className="p-1 text-amber-200/60 hover:text-amber-300 rounded transition-colors"
                          disabled={categoryTypes.length === 0}
                        >
                          {categoryTypes.length > 0 ? (
                            isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
                          ) : (
                            <div className="w-3 h-3" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleCategoryToggle(category.id)}
                          className={`flex-1 flex items-center gap-2 p-2 rounded-lg text-left transition-all duration-200 font-light
                                     ${isSelected 
                                       ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30' 
                                       : 'text-amber-200/70 hover:text-amber-200 hover:bg-amber-500/10'}`}
                          style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                        >
                          {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                          <span className="text-sm">
                            {category.icon_fallback || category.icon || '📁'}
                          </span>
                          <span className="text-sm">{category.name}</span>
                          {categoryTypes.length > 0 && (
                            <span className="text-xs bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full ml-auto">
                              {categoryTypes.length}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Types (when expanded) */}
                      {isExpanded && categoryTypes.length > 0 && (
                        <div className="ml-6 space-y-1">
                          {categoryTypes.map((type) => {
                            const isTypeSelected = selectedTypes.has(type.id);
                            
                            return (
                              <button
                                key={type.id}
                                onClick={() => handleTypeToggle(type.id)}
                                className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all duration-200 font-light
                                           ${isTypeSelected 
                                             ? 'bg-amber-500/15 text-amber-200 border border-amber-400/20' 
                                             : 'text-amber-200/60 hover:text-amber-200 hover:bg-amber-500/5'}`}
                                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                              >
                                {isTypeSelected && <Check className="w-3 h-3 text-amber-400" />}
                                <span className="text-xs">
                                  {type.icon_fallback || type.icon || '📄'}
                                </span>
                                <span className="text-xs">{type.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Tiers Section */}
                {tiers && tiers.length > 0 && (
                  <div className="pt-4 border-t border-amber-400/20">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-light text-amber-200/80 tracking-wide"
                          style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                        Tiers
                      </h4>
                      <button
                        onClick={handleToggleAllTiers}
                        className="text-xs text-amber-300/70 hover:text-amber-300 transition-colors font-light"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                      >
                        {tiers.every(tier => selectedTiers.has(tier.id)) ? 'Hide All' : 'Show All'}
                      </button>
                    </div>
                    <div className="space-y-1">
                      {tiers.map((tier) => {
                        const isSelected = selectedTiers.has(tier.id);
                        
                        return (
                          <button
                            key={tier.id}
                            onClick={() => handleTierToggle(tier.id)}
                            className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all duration-200 font-light
                                       ${isSelected 
                                         ? 'bg-amber-500/15 text-amber-200 border border-amber-400/20' 
                                         : 'text-amber-200/60 hover:text-amber-200 hover:bg-amber-500/5'}`}
                            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                          >
                            {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                            <span 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tier.color || '#f59e0b' }}
                            />
                            <span className="text-sm">{tier.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CreateEditItemSchematicModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleEntityCreated}
          mode="create"
          entity={null}
        />
      )}
    </>
  );
};

export default CategoryHierarchyNav; 
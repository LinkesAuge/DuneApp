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
  const { categories, types, tiers, loading } = useItemsSchematics();
  
  // View state - 'all' shows both items and schematics
  const [localActiveView, setLocalActiveView] = useState<ActiveView>(activeView);
  
  // Search state
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    createdBy: '',
    dateFrom: '',
    dateTo: '',
    hasDescription: false
  });
  
  // Filter state - hierarchical selection (initialize as empty, will be populated on data load)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedTiers, setSelectedTiers] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Initialize filters with all items selected when data is available
  useEffect(() => {
    if (!initialized && categories.length > 0 && tiers.length > 0) {
      const allCategoryIds = categories.map(cat => cat.id);
      const allTypeIds = types.map(type => type.id);
      const allTierIds = tiers.map(tier => tier.id);
      
      setSelectedCategories(new Set(allCategoryIds));
      setSelectedTypes(new Set(allTypeIds));
      setSelectedTiers(new Set(allTierIds));
      setInitialized(true);
      
      // Update filters to show everything by default
      const initialFilters = {
        categories: allCategoryIds,
        types: allTypeIds,
        tiers: allTierIds,
        searchTerm: '',
        dateRange: undefined,
        creators: undefined,
        dynamicFields: undefined
      };
      
      onFiltersChange(initialFilters);
    }
  }, [categories, types, tiers, initialized, onFiltersChange]);

  // Handle view change
  const handleViewChange = (view: ActiveView) => {
    setLocalActiveView(view);
    if (view === 'all') {
      // For "all" view, we need to tell the parent to show both items and schematics
      // This will be handled in the parent component's filtering logic
      onViewChange?.(view as any);
    } else {
      onViewChange?.(view);
    }
  };

  // Handle search
  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
    onSearchChange?.(value);
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

  // Handle category filtering (like Hagga Basin)
  const handleCategoryToggle = (categoryId: string) => {
    const isSelected = selectedCategories.has(categoryId);
    const categoryTypeIds = types
      .filter(type => type.category_id === categoryId)
      .map(type => type.id);

    if (isSelected) {
      // Deselect category and all its types
      setSelectedCategories(prev => {
        const newSet = new Set(prev);
        newSet.delete(categoryId);
        return newSet;
      });
      setSelectedTypes(prev => {
        const newSet = new Set(prev);
        categoryTypeIds.forEach(typeId => newSet.delete(typeId));
        return newSet;
      });
    } else {
      // Select category and all its types
      setSelectedCategories(prev => new Set([...prev, categoryId]));
      setSelectedTypes(prev => new Set([...prev, ...categoryTypeIds]));
    }
    
    // Update filters
    updateFilters();
  };

  // Handle type filtering
  const handleTypeToggle = (typeId: string) => {
    const isSelected = selectedTypes.has(typeId);
    
    if (isSelected) {
      setSelectedTypes(prev => {
        const newSet = new Set(prev);
        newSet.delete(typeId);
        return newSet;
      });
    } else {
      setSelectedTypes(prev => new Set([...prev, typeId]));
    }
    
    updateFilters();
  };

  // Handle tier filtering
  const handleTierToggle = (tierId: string) => {
    const isSelected = selectedTiers.has(tierId);
    
    if (isSelected) {
      setSelectedTiers(prev => {
        const newSet = new Set(prev);
        newSet.delete(tierId);
        return newSet;
      });
    } else {
      setSelectedTiers(prev => new Set([...prev, tierId]));
    }
    
    updateFilters();
  };

  // Handle "All" toggle - show/hide everything
  const handleToggleAll = () => {
    const allCategoryIds = categories.map(cat => cat.id);
    const allTypeIds = types.map(type => type.id);
    const allTierIds = tiers.map(tier => tier.id);
    
    const allSelected = allCategoryIds.every(id => selectedCategories.has(id));
    
    if (allSelected) {
      // Hide all
      setSelectedCategories(new Set());
      setSelectedTypes(new Set());
      setSelectedTiers(new Set());
    } else {
      // Show all
      setSelectedCategories(new Set(allCategoryIds));
      setSelectedTypes(new Set(allTypeIds));
      setSelectedTiers(new Set(allTierIds));
    }
    
    updateFilters();
  };

  // Update filters callback
  const updateFilters = () => {
    const newFilters = {
      categories: Array.from(selectedCategories),
      types: Array.from(selectedTypes),
      tiers: Array.from(selectedTiers),
      searchTerm: localSearchTerm,
      ...advancedFilters
    };
    onFiltersChange(newFilters);
  };

  // Get filtered categories based on current view
  const getFilteredCategories = () => {
    if (localActiveView === 'all') {
      return categories;
    }
    return categories.filter(category => {
      if (Array.isArray(category.applies_to)) {
        return category.applies_to.includes(localActiveView) || category.applies_to.includes('both');
      }
      return category.applies_to === 'both' || category.applies_to === localActiveView;
    });
  };

  // Get types for a specific category
  const getTypesForCategory = (categoryId: string) => {
    return types.filter(type => type.category_id === categoryId);
  };

  const handleCreateNew = () => {
    if (localActiveView === 'all') {
      // Default to items when creating from 'all' view
      setShowCreateModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  const handleEntityCreated = (entity: any) => {
    setShowCreateModal(false);
    if (onEntityCreated) {
      onEntityCreated(entity);
    }
  };

  const filteredCategories = getFilteredCategories();

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

        {/* Filters Section */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Filter Header with All toggle */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-light text-amber-200/80 tracking-wide"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Filters
              </h3>
              <button
                onClick={handleToggleAll}
                className="text-xs text-amber-300/70 hover:text-amber-300 transition-colors font-light"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                {filteredCategories.every(cat => selectedCategories.has(cat.id)) ? 'Hide All' : 'Show All'}
              </button>
            </div>

            {filteredCount > 0 && (
              <div className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full font-light text-center">
                {filteredCount} {localActiveView === 'all' ? 'items' : localActiveView} found
              </div>
            )}

            {loading.categories ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
                <span className="ml-2 text-amber-200/70 font-light">Loading...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Categories */}
                {filteredCategories.map((category) => {
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
                    <h4 className="text-sm font-light text-amber-200/80 tracking-wide mb-3"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      Tiers
                    </h4>
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
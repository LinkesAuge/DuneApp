import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, X, Plus, Package, FileText, Search, Filter, Check, Eye } from 'lucide-react';
import { useItemsSchematics } from '../../hooks/useItemsSchematics';
import CreateEditItemSchematicModal from './CreateEditItemSchematicModal';
import type { Category, Type, Tier, EntityFilters } from '../../types/unified-entities';

type ActiveView = 'all' | 'items' | 'schematics';

interface CategoryHierarchyNavProps {
  activeView: 'all' | 'items' | 'schematics';
  selectedCategory: Category | null;
  onCategorySelect: (category: Category | null) => void;
  filters: EntityFilters;
  onFiltersChange: (filters: EntityFilters) => void;
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
  
  // Simple filter state - just track what's selected (using numbers for normalized IDs)
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<number>>(new Set());
  const [selectedTiers, setSelectedTiers] = useState<Set<number>>(new Set());
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

  // Initialize filters when data loads or view changes
  useEffect(() => {
    if (!filtersInitialized && categories.length > 0 && tiers.length > 0) {
      // Get categories that apply to current view
      const applicableCategories = getApplicableCategoriesForView(localActiveView);
      
      // Start with all categories/tiers selected (show all entities)
      const categoryIds = applicableCategories.map(cat => cat.id);
      setSelectedCategories(new Set(categoryIds));
      
      // Select all types from applicable categories
      const typeIds = types
        .filter(type => categoryIds.includes(type.category_id))
        .map(type => type.id);
      setSelectedTypes(new Set(typeIds));
      
      // Select all tiers (using tier_number as the ID)
      const tierNumbers = tiers.map(tier => tier.tier_number);
      setSelectedTiers(new Set(tierNumbers));
      
      setFiltersInitialized(true);
      
      // Update parent with initial filters (all selected = show all)
      updateParentFilters(localActiveView, new Set(categoryIds), new Set(typeIds), new Set(tierNumbers));
    } else if (categories.length === 0 || tiers.length === 0) {
      // If data isn't loaded yet, send empty filters but don't mark as initialized
      // This ensures the parent component shows all entities while data is loading
      updateParentFilters(localActiveView, new Set(), new Set(), new Set());
    }
  }, [categories, types, tiers, localActiveView, filtersInitialized]);

  // Also handle immediate view changes even if filters aren't fully initialized
  useEffect(() => {
    if (categories.length > 0 && tiers.length > 0) {
      // Get categories that apply to current view
      const applicableCategories = getApplicableCategoriesForView(localActiveView);
      
      // Update selected categories to only include applicable ones
      const applicableCategoryIds = new Set(applicableCategories.map(cat => cat.id));
      const updatedSelectedCategories = new Set(
        Array.from(selectedCategories).filter(catId => applicableCategoryIds.has(catId))
      );
      
      // If no applicable categories are selected, select all applicable ones (default show all)
      if (updatedSelectedCategories.size === 0 && applicableCategories.length > 0) {
        applicableCategories.forEach(cat => updatedSelectedCategories.add(cat.id));
      }
      
      // Update if there was a change
      if (updatedSelectedCategories.size !== selectedCategories.size) {
        setSelectedCategories(updatedSelectedCategories);
        updateParentFilters(localActiveView, updatedSelectedCategories, selectedTypes, selectedTiers);
      }
    }
  }, [localActiveView]);  // Only depend on view changes

  // Get categories that apply to a specific view
  const getApplicableCategoriesForView = (view: ActiveView) => {
    // For now, return all categories since the normalized structure doesn't have applies_to field yet
    // TODO: Add applies_to field to Category interface if needed for filtering by view
    return categories;
  };

  // Update parent component with current filter state
  const updateParentFilters = (view: ActiveView, categories: Set<number>, types: Set<number>, tiers: Set<number>) => {
    const filters: EntityFilters = {
      category_id: categories.size > 0 ? Array.from(categories) : undefined,
      type_id: types.size > 0 ? Array.from(types) : undefined,
      tier_number: tiers.size > 0 ? Array.from(tiers) : undefined,
      search: localSearchTerm || undefined,
      is_schematic: view === 'items' ? false : view === 'schematics' ? true : undefined,
    };
    
    onFiltersChange(filters);
  };

  // Handle view change
  const handleViewChange = (view: ActiveView) => {
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
  const handleCategoryToggle = (categoryId: number) => {
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
  const handleTypeToggle = (typeId: number) => {
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
  const handleTierToggle = (tierNumber: number) => {
    const newSelectedTiers = new Set(selectedTiers);
    
    if (selectedTiers.has(tierNumber)) {
      newSelectedTiers.delete(tierNumber);
    } else {
      newSelectedTiers.add(tierNumber);
    }
    
    setSelectedTiers(newSelectedTiers);
    updateParentFilters(localActiveView, selectedCategories, selectedTypes, newSelectedTiers);
  };

  // Toggle all categories - Fixed for new filtering logic
  const handleToggleAll = () => {
    const applicableCategories = getApplicableCategoriesForView(localActiveView);
    const applicableCategoryIds = applicableCategories.map(cat => cat.id);
    const allSelected = applicableCategoryIds.length > 0 && 
      applicableCategoryIds.every(catId => selectedCategories.has(catId));
    
    let newSelectedCategories: Set<number>;
    let newSelectedTypes: Set<number>;
    
    if (allSelected) {
      // Currently showing all (all categories selected) -> Hide all (select none)
      newSelectedCategories = new Set();
      newSelectedTypes = new Set();
    } else {
      // Currently filtered -> Show all (select all categories)
      newSelectedCategories = new Set(applicableCategoryIds);
      
      // Select all types from applicable categories
      const typeIds = types
        .filter(type => applicableCategoryIds.includes(type.category_id))
        .map(type => type.id);
      newSelectedTypes = new Set(typeIds);
    }
    
    setSelectedCategories(newSelectedCategories);
    setSelectedTypes(newSelectedTypes);
    updateParentFilters(localActiveView, newSelectedCategories, newSelectedTypes, selectedTiers);
  };

  // Toggle all tiers - Fixed for new filtering logic  
  const handleToggleAllTiers = () => {
    const tierNumbers = tiers.map(tier => tier.tier_number);
    const allSelected = tierNumbers.length > 0 && 
      tierNumbers.every(tierNumber => selectedTiers.has(tierNumber));
    
    let newSelectedTiers: Set<number>;
    
    if (allSelected) {
      // Currently showing all (all tiers selected) -> Hide all (select none)
      newSelectedTiers = new Set();
    } else {
      // Currently filtered -> Show all (select all tiers)
      newSelectedTiers = new Set(tierNumbers);
    }
    
    setSelectedTiers(newSelectedTiers);
    updateParentFilters(localActiveView, selectedCategories, selectedTypes, newSelectedTiers);
  };

  const getTypesForCategory = (categoryId: number) => {
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
      {/* Main Panel - Updated to match MapControlPanel styling */}
      <div className="group relative h-full">
        {/* Multi-layer background for Dune aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60" />
        
        <div className="relative h-full bg-slate-900 border-r border-amber-400/20 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-amber-400/20">
            <h2 className="text-lg font-bold text-amber-200 tracking-wide"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Controls
            </h2>
            <button
              onClick={onClose}
              className="text-amber-200/70 hover:text-amber-300 hover:bg-amber-500/20 rounded p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Compact Tab Navigation - matching MapControlPanel style */}
          <div className="border-b border-amber-400/20">
            <div className="flex">
              <button
                onClick={() => handleViewChange('all')}
                className={`flex-1 px-4 py-3 text-sm font-light transition-colors border-r border-amber-400/20 last:border-r-0 ${
                  localActiveView === 'all' 
                    ? 'bg-slate-800/60 text-amber-200 border-b-2 border-amber-400' 
                    : 'text-amber-300/70 hover:text-amber-200 hover:bg-slate-800/30'
                }`}
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                All
              </button>
              <button
                onClick={() => handleViewChange('items')}
                className={`flex-1 px-4 py-3 text-sm font-light transition-colors border-r border-amber-400/20 last:border-r-0 ${
                  localActiveView === 'items' 
                    ? 'bg-slate-800/60 text-amber-200 border-b-2 border-amber-400' 
                    : 'text-amber-300/70 hover:text-amber-200 hover:bg-slate-800/30'
                }`}
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                Items
              </button>
              <button
                onClick={() => handleViewChange('schematics')}
                className={`flex-1 px-4 py-3 text-sm font-light transition-colors border-r border-amber-400/20 last:border-r-0 ${
                  localActiveView === 'schematics' 
                    ? 'bg-slate-800/60 text-amber-200 border-b-2 border-amber-400' 
                    : 'text-amber-300/70 hover:text-amber-200 hover:bg-slate-800/30'
                }`}
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                Schematics
              </button>
            </div>
          </div>

          {/* Create New Button - Hexagonal style matching Add POI */}
          <div className="p-4 border-b border-amber-400/20">
            <div className="flex justify-center">
              <button
                onClick={handleCreateNew}
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
                    Add Item / Schematic
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Search Section */}
          <div className="p-4 border-b border-amber-400/20">
            <div className="space-y-3">
              {/* Basic Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-amber-300/60" />
                </div>
                <input
                  type="text"
                  value={localSearchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 placeholder-slate-400
                           focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 text-sm"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                  placeholder={`Search ${localActiveView === 'all' ? 'items & schematics' : localActiveView}...`}
                />
                {/* Advanced Search Toggle */}
                <button
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-amber-300/60 hover:text-amber-300 transition-colors"
                  title="Advanced Search"
                >
                  <Filter className="w-4 h-4" />
                </button>
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
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-600 rounded text-amber-100 placeholder-slate-400
                               focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 text-xs"
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
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-amber-100
                                 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 text-xs"
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
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-amber-100
                                 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200 text-xs"
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
                    <span className="ml-2 text-xs text-amber-200/70 font-light"
                          style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      Has description
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Filters Section */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
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
                  {(() => {
                    const applicableCategories = getApplicableCategoriesForView(localActiveView);
                    const applicableCategoryIds = applicableCategories.map(cat => cat.id);
                    const allSelected = applicableCategoryIds.length > 0 && 
                      applicableCategoryIds.every(catId => selectedCategories.has(catId));
                    return allSelected ? 'Hide All' : 'Show All';
                  })()}
                </button>
              </div>

              {loading.categories ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
                  <span className="ml-2 text-amber-200/70 font-light text-sm">Loading...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Categories - Two Column Layout */}
                  <div className="grid grid-cols-2 gap-2">
                    {applicableCategories.map((category) => {
                      const categoryTypes = getTypesForCategory(category.id);
                      const isExpanded = expandedCategories.has(category.id);
                      const isSelected = selectedCategories.has(category.id);
                      
                      return (
                        <div key={category.id} className="space-y-1">
                          {/* Category Header - Compact */}
                          <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-slate-800/40 via-slate-700/30 to-slate-800/40 border border-amber-400/20">
                            <div className="flex items-center gap-1 flex-1 min-w-0">
                              <button
                                onClick={() => toggleCategoryExpansion(category.id)}
                                className="text-amber-400/70 hover:text-amber-300 transition-colors flex-shrink-0"
                                disabled={categoryTypes.length === 0}
                              >
                                {categoryTypes.length > 0 ? (
                                  isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
                                ) : (
                                  <div className="w-3 h-3" />
                                )}
                              </button>
                              
                              <span className="text-xs font-light text-amber-200 truncate"
                                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                                {category.name}
                              </span>
                              
                              {categoryTypes.length > 0 && (
                                <span className="text-xs bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded-full flex-shrink-0">
                                  {categoryTypes.length}
                                </span>
                              )}
                            </div>
                            
                            {/* Category Toggle */}
                            <button
                              onClick={() => handleCategoryToggle(category.id)}
                              className={`p-0.5 rounded transition-colors flex-shrink-0 ${
                                isSelected 
                                  ? 'text-amber-400 hover:text-amber-300' 
                                  : 'text-amber-200/60 hover:text-amber-200'
                              }`}
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Types (when expanded) */}
                          {isExpanded && categoryTypes.length > 0 && (
                            <div className="ml-4 space-y-1">
                              {categoryTypes.map((type) => {
                                const isTypeSelected = selectedTypes.has(type.id);
                                
                                return (
                                  <button
                                    key={type.id}
                                    onClick={() => handleTypeToggle(type.id)}
                                    className={`w-full flex items-center gap-1 px-2 py-1 rounded transition-colors text-left ${
                                      isTypeSelected 
                                        ? 'bg-amber-500/10 text-amber-200' 
                                        : 'text-amber-200/60 hover:text-amber-200 hover:bg-slate-800/30'
                                    }`}
                                  >
                                    {isTypeSelected && <Check className="w-2 h-2 text-amber-400 flex-shrink-0" />}
                                    <span className="text-xs flex-shrink-0">
                                      {type.icon_fallback || type.icon || '📄'}
                                    </span>
                                    <span className="text-xs truncate"
                                          style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                                      {type.name}
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

                  {/* Tiers Section */}
                  {tiers && tiers.length > 0 && (
                    <div className="pt-3 border-t border-amber-400/20">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-light text-amber-200/80 tracking-wide"
                            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                          Tiers
                        </h4>
                        <button
                          onClick={handleToggleAllTiers}
                          className="text-xs text-amber-300/70 hover:text-amber-300 transition-colors font-light"
                          style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                        >
                          {(() => {
                            const tierNumbers = tiers.map(tier => tier.tier_number);
                            const allSelected = tierNumbers.length > 0 && 
                              tierNumbers.every(tierNumber => selectedTiers.has(tierNumber));
                            return allSelected ? 'Hide All' : 'Show All';
                          })()}
                        </button>
                      </div>
                      
                      {/* Tiers in Two Columns */}
                      <div className="grid grid-cols-2 gap-1">
                        {tiers.map((tier) => {
                          const isSelected = selectedTiers.has(tier.tier_number);
                          
                          return (
                            <button
                              key={tier.tier_number}
                              onClick={() => handleTierToggle(tier.tier_number)}
                              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors text-left ${
                                isSelected 
                                  ? 'bg-amber-500/10 text-amber-200' 
                                  : 'text-amber-200/60 hover:text-amber-200 hover:bg-slate-800/30'
                              }`}
                            >
                              {isSelected && <Check className="w-2 h-2 text-amber-400 flex-shrink-0" />}
                              <span 
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: tier.color || '#f59e0b' }}
                              />
                              <span className="text-xs truncate"
                                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                                {tier.tier_name}
                              </span>
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